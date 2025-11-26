# Cloud Run NEGs for Load Balancer backend
resource "google_compute_region_network_endpoint_group" "server_neg" {
  name                  = local.neg_name_server
  network_endpoint_type = "SERVERLESS"
  region                = var.region
  cloud_run {
    service = google_cloud_run_v2_service.server.name
  }
}

resource "google_compute_region_network_endpoint_group" "client_neg" {
  name                  = local.neg_name_client
  network_endpoint_type = "SERVERLESS"
  region                = var.region
  cloud_run {
    service = google_cloud_run_v2_service.client.name
  }
}

# Backend Services
resource "google_compute_backend_service" "server_backend" {
  name                  = local.server_backend_name
  protocol              = "HTTP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  timeout_sec           = 30
  enable_cdn            = false

  backend {
    group = google_compute_region_network_endpoint_group.server_neg.id
  }

  log_config {
    enable      = true
    sample_rate = 1.0
  }
}

resource "google_compute_backend_service" "client_backend" {
  name                  = local.client_backend_name
  protocol              = "HTTP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  timeout_sec           = 30
  enable_cdn            = false

  backend {
    group = google_compute_region_network_endpoint_group.client_neg.id
  }

  log_config {
    enable      = true
    sample_rate = 1.0
  }
}

# URL Map - Path-based routing
resource "google_compute_url_map" "main" {
  name            = local.url_map_name
  default_service = google_compute_backend_service.client_backend.id

  host_rule {
    hosts        = ["*"]
    path_matcher = "allpaths"
  }

  path_matcher {
    name            = "allpaths"
    default_service = google_compute_backend_service.client_backend.id

    path_rule {
      paths   = ["/api/*"]
      service = google_compute_backend_service.server_backend.id
    }
  }
}

# HTTP Proxy
resource "google_compute_target_http_proxy" "main" {
  name    = local.http_proxy_name
  url_map = google_compute_url_map.main.id
}

# Global Forwarding Rule (HTTP)
resource "google_compute_global_forwarding_rule" "http" {
  name       = local.http_forwarding_name
  target     = google_compute_target_http_proxy.main.id
  port_range = "80"
  ip_protocol = "TCP"
  ip_address = google_compute_global_address.lb_ip.address
}

# Static IP for Load Balancer
resource "google_compute_global_address" "lb_ip" {
  name = local.lb_ip_name
}

# HTTPS support (optional, controlled by enable_ssl variable)
resource "google_compute_managed_ssl_certificate" "main" {
  count = var.enable_ssl ? 1 : 0
  name  = local.lb_ssl_cert_name

  managed {
    domains = var.load_balancer_domain != "" ? [var.load_balancer_domain] : []
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "google_compute_target_https_proxy" "main" {
  count            = var.enable_ssl ? 1 : 0
  name             = local.https_proxy_name
  url_map          = google_compute_url_map.main.id
  ssl_certificates = [google_compute_managed_ssl_certificate.main[0].id]
}

resource "google_compute_global_forwarding_rule" "https" {
  count      = var.enable_ssl ? 1 : 0
  name       = local.https_forwarding_name
  target     = google_compute_target_https_proxy.main[0].id
  port_range = "443"
  ip_protocol = "TCP"
  ip_address = google_compute_global_address.lb_ip.address
}

