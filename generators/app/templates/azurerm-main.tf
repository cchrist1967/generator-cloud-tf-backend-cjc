# PROVIDERS
provider "<%= cloud_provider %>" {
  features {}
  version = "~> <%= cloud_provider_version %>"
}

# TERRAFORM CONFIG
terraform {
  required_version = "=0.12.30"
  # TODO: uncomment the following line after first pass to move state to the backend
  #backend "<%= tf_backend %>" {}
}

# RESOURCES
resource "azurerm_resource_group" "backend" {
  name     = "<%= client %>-<%= program %>-${var.environment}-envs-tf-backend"
  location = var.region
  tags = merge(var.common_tags, {
    Tier        = "Meta",
    Environment = var.environment
  })
}

resource "azurerm_storage_account" "state" {
  name                      = "${var.environment}envstfbackend"
  resource_group_name       = azurerm_resource_group.backend.name
  location                  = azurerm_resource_group.backend.location
  min_tls_version           = "TLS1_2"
  account_tier              = "Standard"
  account_kind              = "StorageV2"
  account_replication_type  = "LRS"
  enable_https_traffic_only = true

  network_rules {
    #checkov:skip=CKV_AZURE_35:Need to access this storage over network right now
    #checkov:skip=CKV_AZURE_43:Need to access this storage over network right now
    default_action = "Allow"
  }

  tags = merge(var.common_tags, {
    Tier        = "Storage"
    Environment = var.environment
  })
}

resource "azurerm_storage_container" "state" {
  name                 = "${var.environment}-envs-tf-state"
  storage_account_name = azurerm_storage_account.state.name
}
