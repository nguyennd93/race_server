#!/usr/bin/env bash
# Kéo toàn bộ parameter dưới một path SSM về thành file .env.
# EC2 cần: AWS CLI + IAM role có quyền ssm:GetParametersByPath + kms:Decrypt.
# Dùng: AWS_REGION=ap-southeast-1 SSM_PATH=/race/dev ./fetch-env.sh
set -euo pipefail

SSM_PATH="${SSM_PATH:-/race/dev}"
REGION="${AWS_REGION:-ap-southeast-1}"

: > .env
aws ssm get-parameters-by-path \
  --path "$SSM_PATH" --recursive --with-decryption \
  --region "$REGION" \
  --query "Parameters[].[Name,Value]" --output text \
| while IFS=$'\t' read -r name value; do
    # tên param: /race/dev/JWT_SECRET -> JWT_SECRET
    echo "${name##*/}=${value}"
  done >> .env

echo "✅ Tạo .env từ SSM '$SSM_PATH' ($(grep -c = .env) biến)"
