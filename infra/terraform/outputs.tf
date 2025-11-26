# Cloud Run Direct URIs (Used for internal references and debugging)
output "run_server_url" { value = google_cloud_run_v2_service.server.uri }
output "run_worker_url" { value = google_cloud_run_v2_service.worker.uri }

# Resource Identifiers
output "artifact_repo" { value = google_artifact_registry_repository.repo.repository_id }
output "tasks_queue_name" { value = google_cloud_tasks_queue.demo.name }

# Load Balancer outputs
output "load_balancer_ip" {
  value = google_compute_global_address.lb_ip.address
}

output "load_balancer_url" {
  value = "http://${google_compute_global_address.lb_ip.address}"
}

# Primary outputs (use load balancer URL for server)
output "server_url" {
  value = "http://${google_compute_global_address.lb_ip.address}"
}

output "worker_url" {
  value = google_cloud_run_v2_service.worker.uri
}

output "client_url" {
  value = "http://${google_compute_global_address.lb_ip.address}"
}

output "migrate_job_name" {
  value = google_cloud_run_v2_job.db_migrate.name
}

