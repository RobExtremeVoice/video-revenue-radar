#!/bin/bash
set -e

echo "→ Installing Node dependencies..."
npm install

echo "→ Installing Python dependencies..."
pip install -r lambdas/requirements.txt --quiet

echo "→ Terraform init..."
cd infrastructure/terraform && terraform init -upgrade -input=false 2>/dev/null || true && cd ../..

echo ""
echo "✓ Codespace ready!"
echo ""
echo "Next steps:"
echo "  1. Copy infrastructure/terraform/terraform.tfvars.example → terraform.tfvars and fill in values"
echo "  2. make build-layer"
echo "  3. make deploy-infra"
echo "  4. make setup-db"
echo "  5. make get-keys  → paste into Lovable env vars"
