#!/bin/bash
set -e

BUCKET=$(cd infrastructure/terraform && terraform output -raw s3_frontend_bucket)
CF_ID=$(cd infrastructure/terraform && terraform output -raw cloudfront_url | sed 's|https://||' | cut -d'.' -f1)

if [ ! -d "dist" ]; then
  echo "Error: run 'npm run build' first"
  exit 1
fi

echo "→ Uploading to S3..."
aws s3 sync dist/ "s3://$BUCKET/" --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

aws s3 cp dist/index.html "s3://$BUCKET/index.html" \
  --cache-control "no-cache, no-store, must-revalidate"

echo "→ Invalidating CloudFront..."
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Origins.Items[0].DomainName=='$BUCKET.s3.amazonaws.com'].Id" \
  --output text)

aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/*" > /dev/null

CF_URL=$(cd infrastructure/terraform && terraform output -raw cloudfront_url)
echo "✓ Live at: $CF_URL"
