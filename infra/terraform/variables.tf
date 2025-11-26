variable "project_id" { type = string }

variable "region" {
  type    = string
  default = "asia-northeast1"
}

variable "location" {
  type    = string
  default = "asia-northeast1"
}

variable "artifact_registry_location" {
  type    = string
  default = "asia-northeast1"
}

variable "prefix" {
  type    = string
  default = "ax"
}

variable "network_name" {
  type    = string
  default = null
}

variable "subnet_name" {
  type    = string
  default = null
}

variable "connector_name" {
  type    = string
  default = null
}

variable "db_instance_name" {
  type    = string
  default = null
}

variable "db_database_name" {
  type    = string
  default = "app"
}

variable "db_user" {
  type    = string
  default = "appuser"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "run_service_name_server" {
  type    = string
  default = null
}

variable "run_service_name_worker" {
  type    = string
  default = null
}

variable "run_service_name_client" {
  type    = string
  default = null
}

variable "neg_name_server" {
  type    = string
  default = null
}

variable "neg_name_client" {
  type    = string
  default = null
}

variable "tasks_queue_name" {
  type    = string
  default = "demo-queue"
}

variable "server_env" {
  type = map(string)
  default = {}
  description = "Environment variables for server Cloud Run (overrides)"
}

variable "worker_env" {
  type = map(string)
  default = {}
  description = "Environment variables for worker Cloud Run (overrides)"
}

variable "client_env" {
  type = map(string)
  default = {}
  description = "Environment variables for client Cloud Run (overrides)"
}

variable "deployer_service_account" {
  type        = string
  default     = ""
  description = "Service account email used to run Terraform (granted iam.serviceAccountUser on runtime SAs)"
}

variable "load_balancer_domain" {
  type        = string
  default     = ""
  description = "Custom domain for load balancer (required if enable_ssl is true)"
}

variable "enable_ssl" {
  type        = bool
  default     = false
  description = "Enable HTTPS with managed SSL certificate"
}

