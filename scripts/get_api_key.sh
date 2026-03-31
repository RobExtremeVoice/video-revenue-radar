#!/bin/bash
set -e

KEY_ID=$(cd infrastructure/terraform && terraform output -raw api_key_id)
API_URL=$(cd infrastructure/terraform && terraform output -raw api_gateway_url)
API_KEY=$(aws apigateway get-api-key --api-key "$KEY_ID" --include-value --query "value" --output text)

echo ""
echo "══════════════════════════════════════════════════"
echo "  Paste these into Lovable → Settings → Env Vars"
echo "══════════════════════════════════════════════════"
echo ""
echo "VITE_API_BASE_URL=$API_URL"
echo "VITE_API_KEY=$API_KEY"
echo "VITE_USE_MOCK_DATA=false"
echo ""
