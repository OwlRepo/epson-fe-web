FROM oven/bun:latest as build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN bun install

# Copy source files and env file
COPY . .

# Create a script to handle environment variables
RUN echo '#!/bin/sh\n\
for var in $(grep "^VITE_" .env | cut -d= -f1); do\n\
    echo "ARG $var"\n\
    echo "ENV $var=\$$var"\n\
done' > /tmp/generate_envs.sh && \
    chmod +x /tmp/generate_envs.sh

# Generate and source environment variables
RUN /tmp/generate_envs.sh > /tmp/env_vars.sh && \
    . /tmp/env_vars.sh && \
    bun run build

# Production stage
FROM nginx:alpine

# Copy the built artifacts from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy and set permissions for the entrypoint script
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Set entrypoint to our custom script
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"] 