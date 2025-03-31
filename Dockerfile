# Build stage
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN bun install

# Copy source files
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM nginx:alpine

# Copy the built artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create entrypoint script to handle environment variables
RUN printf '#!/bin/sh\n\
echo "window.ENV = window.ENV || {};" > /usr/share/nginx/html/env-config.js\n\
for var in $(env | grep "^VITE_"); do\n\
    echo "window.ENV.${var%%=*}=\"${var#*=}\";" >> /usr/share/nginx/html/env-config.js\n\
done\n\
# Ensure proper permissions\n\
chown -R nginx:nginx /usr/share/nginx/html\n\
# Start nginx\n\
nginx -g "daemon off;"' > /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Set entrypoint to our custom script
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"] 