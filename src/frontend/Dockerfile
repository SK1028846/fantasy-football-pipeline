# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application (without env vars - they'll be injected at runtime)
RUN npm run build

# Production stage
FROM nginx:alpine

# Install gettext for envsubst and bind-tools for DNS resolution
RUN apk add --no-cache gettext bind-tools

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy runtime config script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy nginx configuration template
RUN echo 'upstream backend { \
    server BACKEND_IP_PLACEHOLDER:3000; \
} \
\
server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Resolver for Kubernetes DNS (use the cluster DNS service) \
    # Will be updated at runtime by docker-entrypoint.sh \
    resolver 10.96.0.10 valid=30s ipv6=off; \
    \
    # Proxy API requests to backend service \
    location ~ ^/api(/.*)$ { \
        proxy_pass http://backend$1$is_args$args; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        proxy_set_header Authorization $http_authorization; \
        proxy_cache_bypass $http_upgrade; \
        # Timeouts - increase for debugging \
        proxy_connect_timeout 10s; \
        proxy_send_timeout 60s; \
        proxy_read_timeout 60s; \
        # Error handling \
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503; \
    } \
    \
    # Prevent caching of index.html - always check for new version \
    location = /index.html { \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
        add_header Pragma "no-cache"; \
        add_header Expires "0"; \
        try_files $uri =404; \
    } \
    \
    # Cache static assets (JS/CSS with hashes) but allow revalidation \
    location ~* \.(js|css)$ { \
        add_header Cache-Control "public, max-age=31536000, immutable"; \
        try_files $uri =404; \
    } \
    \
    # Default location for all other requests \
    location / { \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
        add_header Pragma "no-cache"; \
        add_header Expires "0"; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Use custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

