resource "google_cloud_run_v2_job" "db_migrate" {
  name     = local.job_migrate_name
  location = var.region
  deletion_protection = false

  template {
    template {
      service_account = google_service_account.migrate.email
      containers {
        # 再利用: serverイメージには依存が入っているため bun/prisma が使える
        image = "${google_artifact_registry_repository.repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}/server:latest"
        env {
          name = "DATABASE_URL"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.database_url.name
              version = "latest"
            }
          }
        }
        command = ["bun"]
        args    = ["run", "db:deploy"]
        working_dir = "/app/packages/database"
      }
      vpc_access {
        connector = google_vpc_access_connector.connector.id
        egress    = "ALL_TRAFFIC"
      }
    }
  }
}

