#!/bin/bash
set -e

echo "→ Building Python Lambda Layer..."
mkdir -p lambdas/layer/python lambdas/dist

pip install \
  -r lambdas/requirements.txt \
  --target lambdas/layer/python \
  --platform manylinux2014_x86_64 \
  --only-binary=:all: \
  --quiet

cd lambdas/layer
zip -r lambda_layer.zip python/ -q
cd ../..

echo "✓ Layer built: $(du -sh lambdas/layer/lambda_layer.zip | cut -f1)"
