resource "google_artifact_registry_repository" "repo" {
  location      = var.artifact_registry_location
  repository_id = local.artifact_registry_repo_id
  description   = "Container images for ax-saas-template"
  format        = "DOCKER"
}

output "artifact_registry_repo" {
  value = google_artifact_registry_repository.repo.repository_id
}


