# Resolve latest image digests so Terraform detects changes
data "google_artifact_registry_docker_image" "server_latest" {
  project       = var.project_id
  location      = var.artifact_registry_location
  repository_id = google_artifact_registry_repository.repo.repository_id
  image_name    = "server:latest"
}

data "google_artifact_registry_docker_image" "worker_latest" {
  project       = var.project_id
  location      = var.artifact_registry_location
  repository_id = google_artifact_registry_repository.repo.repository_id
  image_name    = "worker:latest"
}

data "google_artifact_registry_docker_image" "client_latest" {
  project       = var.project_id
  location      = var.artifact_registry_location
  repository_id = google_artifact_registry_repository.repo.repository_id
  image_name    = "client:latest"
}

resource "google_cloud_run_v2_service" "server" {
  name     = local.run_service_name_server
  location = var.region
  deletion_protection = false
  depends_on = [google_cloud_run_v2_service.worker]

  template {
    service_account = google_service_account.server.email

    containers {
      image = "${google_artifact_registry_repository.repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}/server:latest"
      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.name
            version = "latest"
          }
        }
      }
      # 自動設定される環境変数
      env {
        name  = "WORKER_BASE_URL"
        value = google_cloud_run_v2_service.worker.uri
      }
      env {
        name  = "CLOUD_TASKS_PROJECT_ID"
        value = var.project_id
      }
      env {
        name  = "CLOUD_TASKS_LOCATION"
        value = var.location
      }
      env {
        name  = "CLOUD_TASKS_QUEUE"
        value = google_cloud_tasks_queue.demo.name
      }
      env {
        name  = "CLOUD_TASKS_SA_EMAIL"
        value = google_service_account.tasks_invoker.email
      }
      # Worker SAのemail（OIDC検証用）
      env {
        name  = "WORKER_SA_EMAIL"
        value = google_service_account.worker.email
      }
      dynamic "env" {
        for_each = var.server_env
        content {
          name  = env.key
          value = env.value
        }
      }
      ports {
        container_port = 8080
      }
    }

    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }
  }

  # INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER: ロードバランサー経由とVPC内部からのアクセスのみ許可
  # - ロードバランサー経由: 公開APIアクセス用（allUsersにrun.invokerロール付与）
  # - VPC内部経由: Workerからのコールバック（VPC Connector経由、OIDC認証で検証）
  # 直接Cloud Run URL経由の外部アクセスはブロック
  ingress = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
}

# 公開アクセスを有効化（ロードバランサー経由のアクセス用）
# WorkerからのコールバックはVPC内部経由（VPC Connector経由）でアクセスし、OIDCトークンで認証（アプリケーション側で検証）
# IAMポリシー: allUsers（ロードバランサー経由）+ worker SA（VPC内部経由）
resource "google_cloud_run_v2_service_iam_policy" "server_access" {
  location = google_cloud_run_v2_service.server.location
  name     = google_cloud_run_v2_service.server.name
  policy_data = data.google_iam_policy.server_access.policy_data
}

resource "google_cloud_run_v2_service" "worker" {
  name     = local.run_service_name_worker
  location = var.region
  deletion_protection = false

  template {
    service_account = google_service_account.worker.email

    containers {
      image = "${google_artifact_registry_repository.repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}/worker:latest"
      env {
        name  = "NODE_ENV"
        value = "production"
      }
      # Note: PORT is automatically set by Cloud Run based on container_port, don't set it manually
      dynamic "env" {
        for_each = var.worker_env
        content {
          name  = env.key
          value = env.value
        }
      }
      ports {
        container_port = 8080
      }
    }

    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }
  }

  ingress = "INGRESS_TRAFFIC_ALL"
}

resource "google_cloud_run_v2_service" "client" {
  name     = local.run_service_name_client
  location = var.region
  deletion_protection = false

  template {
    service_account = google_service_account.client.email

    containers {
      image = "${google_artifact_registry_repository.repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}/client:latest"
      env {
        name  = "NODE_ENV"
        value = "production"
      }
      # Next.js(サーバー側)専用のAPIベースURL
      # 内部通信のため直接Cloud RunのURLを使用（ロードバランサー経由は外部アクセス用）
      env {
        name  = "API_BASE_URL"
        value = google_cloud_run_v2_service.server.uri
      }
      dynamic "env" {
        for_each = var.client_env
        content {
          name  = env.key
          value = env.value
        }
      }
      ports {
        container_port = 3000
      }
    }

    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }
  }

  ingress = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
}

# 公開アクセスを有効化（allUsers に run.invoker ロールを付与）
resource "google_cloud_run_v2_service_iam_policy" "client_noauth" {
  location = google_cloud_run_v2_service.client.location
  name     = google_cloud_run_v2_service.client.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

