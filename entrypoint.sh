#!/bin/sh
set -e

echo "👉 Đồng bộ schema vào DB..."
npx prisma db push

echo "🚀 Khởi động server..."
node dist/main.js