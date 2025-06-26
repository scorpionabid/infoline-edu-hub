# İnfoLine Edu Hub - Production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile --only=production

COPY . .
RUN npm run build

FROM nginx:1.25-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/health-check.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/health-check.sh && \
    chown -R nodejs:nodejs /usr/share/nginx/html

USER nodejs
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD /usr/local/bin/health-check.sh

CMD ["nginx", "-g", "daemon off;"]