.PHONY: help setup build-layer deploy-infra setup-db get-keys deploy-frontend deploy-lambdas dev

help:
	@echo ""
	@echo "Video Revenue Radar — Commands"
	@echo "════════════════════════════════════════"
	@echo "  make setup            → Initial Codespace setup"
	@echo "  make build-layer      → Build Python Lambda Layer"
	@echo "  make deploy-infra     → terraform apply (full infra)"
	@echo "  make setup-db         → Create PostgreSQL schema"
	@echo "  make get-keys         → Print env vars for Lovable"
	@echo "  make deploy-frontend  → Build + deploy to S3/CloudFront"
	@echo "  make deploy-lambdas   → Deploy all Lambda functions"
	@echo "  make dev              → Start Vite dev server"
	@echo ""

setup:
	bash .devcontainer/setup.sh

build-layer:
	bash scripts/build_layer.sh

deploy-infra:
	cd infrastructure/terraform && \
	  terraform plan -out=tfplan && \
	  terraform apply tfplan

setup-db:
	bash scripts/setup_db.sh

get-keys:
	bash scripts/get_api_key.sh

deploy-frontend:
	npm run build
	bash scripts/deploy_frontend.sh

deploy-lambdas:
	@for fn in fetch_videos transcribe analyze query trigger; do \
	  echo "Packaging $$fn..."; \
	  zip -j /tmp/$$fn.zip lambdas/$$fn/handler.py; \
	done
	aws lambda update-function-code --function-name vrr-fetch-videos --zip-file fileb:///tmp/fetch_videos.zip --publish
	aws lambda update-function-code --function-name vrr-transcribe    --zip-file fileb:///tmp/transcribe.zip    --publish
	aws lambda update-function-code --function-name vrr-analyze        --zip-file fileb:///tmp/analyze.zip        --publish
	aws lambda update-function-code --function-name vrr-query          --zip-file fileb:///tmp/query.zip          --publish
	aws lambda update-function-code --function-name vrr-trigger        --zip-file fileb:///tmp/trigger.zip        --publish
	@echo "✓ All Lambdas deployed"

dev:
	npm run dev
