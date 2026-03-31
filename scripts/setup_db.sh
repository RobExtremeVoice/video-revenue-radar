#!/bin/bash
set -e

RDS=$(cd infrastructure/terraform && terraform output -raw rds_endpoint)
PASS=$(grep db_password infrastructure/terraform/terraform.tfvars | cut -d'"' -f2)

echo "→ Running schema on $RDS..."
PGPASSWORD="$PASS" psql \
  -h "$RDS" \
  -U admin \
  -d fashion_intelligence \
  -f infrastructure/sql/schema.sql

echo "✓ Schema created!"
