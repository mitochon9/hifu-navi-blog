resource "google_sql_database_instance" "db" {
  name             = local.db_instance_name
  region           = var.region
  database_version = "POSTGRES_18"

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
    edition           = "ENTERPRISE"
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }
    disk_type         = "PD_HDD"
    disk_size         = 10
    backup_configuration {
      enabled = false
    }
    insights_config {
      query_insights_enabled  = false
      record_application_tags = false
      record_client_address   = false
    }
  }

  depends_on = [google_service_networking_connection.private_vpc_connection]
}

resource "google_sql_database" "app" {
  name     = var.db_database_name
  instance = google_sql_database_instance.db.name
}

resource "google_sql_user" "app" {
  name     = var.db_user
  instance = google_sql_database_instance.db.name
  password = var.db_password

  lifecycle {
    # Cloud SQL APIでは現在のパスワードを取得できないため、
    # 既存リソースをインポートした場合、password = nullになる
    # ignore_changesがないと、nullから更新しようとしてエラーになる
    ignore_changes = [password]
  }
}

resource "google_secret_manager_secret" "database_url" {
  secret_id = local.database_url_secret_id
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "database_url_v" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = "postgresql://${var.db_user}:${var.db_password}@${google_sql_database_instance.db.private_ip_address}:5432/${var.db_database_name}?schema=public"

  lifecycle {
    # database-urlはSecret Managerを真実とする設計のため、
    # Terraformで管理せず、secret-sync-db-url.shで管理する
    # 既存のバージョンがある場合は上書きしない（Cloud Runが参照しているため）
    ignore_changes = [secret_data]
  }
}


