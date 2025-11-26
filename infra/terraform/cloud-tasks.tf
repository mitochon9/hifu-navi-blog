resource "google_cloud_tasks_queue" "demo" {
  name     = var.tasks_queue_name
  location = var.location
}

# Cloud TasksからCloud Run(worker)を呼び出すためのサービスアカウント
resource "google_project_iam_member" "tasks_enqueuer" {
  project = var.project_id
  role    = "roles/cloudtasks.enqueuer"
  member  = "serviceAccount:${google_service_account.server.email}"
}

output "tasks_queue" {
  value = google_cloud_tasks_queue.demo.name
}


