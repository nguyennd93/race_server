# ===== Stage 1: Build =====
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci                       # cài cả devDeps để build

COPY . .

# Prisma 7: phải generate client (nằm trong src/generated, không có sẵn)
# truyền DATABASE_URL giả vì 'generate' không cần kết nối DB thật
RUN DATABASE_URL="mysql://x:x@localhost:3306/x" npx prisma generate

RUN npm run build                # tsc biên dịch src (gồm cả generated) -> dist

# ===== Stage 2: Run =====
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# chép node_modules từ builder (giữ luôn prisma CLI để chạy db push)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json prisma.config.ts entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000
CMD ["./entrypoint.sh"]