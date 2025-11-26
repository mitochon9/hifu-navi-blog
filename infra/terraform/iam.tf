resource "google_service_account" "server" {
  account_id   = local.sa_server_id
  display_name = "ax server Cloud Run"
}

resource "google_service_account" "worker" {
  account_id   = local.sa_worker_id
  display_name = "ax worker Cloud Run"
}

# Client (Next.js) 用のSA
resource "google_service_account" "client" {
  account_id   = local.sa_client_id
  display_name = "ax client Cloud Run"
}

# Cloud Run Job (DB migrate) 用のSA
resource "google_service_account" "migrate" {
  account_id   = local.sa_migrate_id
  display_name = "ax migrate job"
}

# WorkerがサーバーにOIDCでコールバックする場合に備え、呼び出し元認証で使用
resource "google_service_account" "tasks_invoker" {
  account_id   = local.sa_tasks_invoker_id
  display_name = "Cloud Tasks HTTP invoker"
}

# Cloud Run public access (optional)
# Serverへのアクセス: allUsers（ロードバランサー経由用）+ worker SA（VPC内部経由用）
data "google_iam_policy" "server_access" {
  binding {
    role    = "roles/run.invoker"
    members = [
      "allUsers",
      "serviceAccount:${google_service_account.worker.email}",
    ]
  }
}

# Cloud Run public access (client用)
data "google_iam_policy" "noauth" {
  binding {
    role    = "roles/run.invoker"
    members = ["allUsers"]
  }
}

# Allow Cloud Run SAs to access Secret Manager
resource "google_project_iam_member" "server_secret_access" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.server.email}"
}

resource "google_project_iam_member" "worker_secret_access" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.worker.email}"
}

resource "google_project_iam_member" "client_secret_access" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.client.email}"
}

# Allow using Serverless VPC Access connector
resource "google_project_iam_member" "server_vpcaccess" {
  project = var.project_id
  role    = "roles/vpcaccess.user"
  member  = "serviceAccount:${google_service_account.server.email}"
}

resource "google_project_iam_member" "worker_vpcaccess" {
  project = var.project_id
  role    = "roles/vpcaccess.user"
  member  = "serviceAccount:${google_service_account.worker.email}"
}

resource "google_project_iam_member" "client_vpcaccess" {
  project = var.project_id
  role    = "roles/vpcaccess.user"
  member  = "serviceAccount:${google_service_account.client.email}"
}

resource "google_project_iam_member" "migrate_secret_access" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.migrate.email}"
}

resource "google_project_iam_member" "migrate_vpcaccess" {
  project = var.project_id
  role    = "roles/vpcaccess.user"
  member  = "serviceAccount:${google_service_account.migrate.email}"
}


# Cloud Run Service Agent に Service Account User を付与（各実行用SAを起動できるようにする）
data "google_project" "project" {
  project_id = var.project_id
}

locals {
  cloud_run_service_agent = "serviceAccount:service-${data.google_project.project.number}@serverless-robot-prod.iam.gserviceaccount.com"
}

resource "google_service_account_iam_member" "server_actas_by_run_agent" {
  service_account_id = google_service_account.server.name
  role               = "roles/iam.serviceAccountUser"
  member             = local.cloud_run_service_agent
}

resource "google_service_account_iam_member" "worker_actas_by_run_agent" {
  service_account_id = google_service_account.worker.name
  role               = "roles/iam.serviceAccountUser"
  member             = local.cloud_run_service_agent
}

resource "google_service_account_iam_member" "client_actas_by_run_agent" {
  service_account_id = google_service_account.client.name
  role               = "roles/iam.serviceAccountUser"
  member             = local.cloud_run_service_agent
}

resource "google_service_account_iam_member" "migrate_actas_by_run_agent" {
  service_account_id = google_service_account.migrate.name
  role               = "roles/iam.serviceAccountUser"
  member             = local.cloud_run_service_agent
}

# Terraform 実行SA（デプロイヤ）にも各実行用SAの actAs を付与
locals {
  deployer_member = var.deployer_service_account != "" ? "serviceAccount:${var.deployer_service_account}" : ""
}

resource "google_service_account_iam_member" "server_actas_by_deployer" {
  count              = var.deployer_service_account != "" ? 1 : 0
  service_account_id = google_service_account.server.name
  role               = "roles/iam.serviceAccountUser"
  member             = local.deployer_member
}

resource "google_service_account_iam_member" "worker_actas_by_deployer" {
  count              = var.deployer_service_account != "" ? 1 : 0
  service_account_id = google_service_account.worker.name
  role               = "roles/iam.serviceAccountUser"
  member             = local.deployer_member
}

resource "google_service_account_iam_member" "client_actas_by_deployer" {
  count              = var.deployer_service_account != "" ? 1 : 0
  service_account_id = google_service_account.client.name
  role               = "roles/iam.serviceAccountUser"
  member             = local.deployer_member
}

resource "google_service_account_iam_member" "migrate_actas_by_deployer" {
  count              = var.deployer_service_account != "" ? 1 : 0
  service_account_id = google_service_account.migrate.name
  role               = "roles/iam.serviceAccountUser"
  member             = local.deployer_member
}

# Allow deployer SA (CI) to access Secret Manager (for reading database-url)
resource "google_project_iam_member" "deployer_secret_access" {
  count   = var.deployer_service_account != "" ? 1 : 0
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = local.deployer_member
}

# Allow Cloud Tasks invoker SA to invoke worker (OIDC authentication)
resource "google_cloud_run_v2_service_iam_member" "worker_invoker" {
  location = google_cloud_run_v2_service.worker.location
  name     = google_cloud_run_v2_service.worker.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.tasks_invoker.email}"
}

# Allow worker SA to invoke server (for callbacks with OIDC authentication)
# 注意: worker SAは server_access の iam_policy に既に含まれているため、個別のiam_memberは不要
# iam_policy が全てのIAMポリシーを上書きするため、iam_member は無効になる
# このリソースは削除済み（server_access の iam_policy で worker SA を許可）

# Allow server SA to act as tasks invoker SA (required for Cloud Tasks OIDC)
resource "google_service_account_iam_member" "tasks_invoker_actas_by_server" {
  service_account_id = google_service_account.tasks_invoker.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.server.email}"
}

