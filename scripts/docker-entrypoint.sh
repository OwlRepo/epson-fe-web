#!/bin/sh
set -e

# Generate runtime environment variables for the SPA
generate_runtime_env() {
  echo "window.env = {" > /usr/share/nginx/html/env-config.js
  # Pass environment variables that start with VITE_
  for envvar in $(env | grep -o "^VITE_[^=]*"); do
    echo "  $envvar: \"$(eval echo \$$envvar)\"," >> /usr/share/nginx/html/env-config.js
  done
  echo "};" >> /usr/share/nginx/html/env-config.js
}

# Generate runtime config file
generate_runtime_env

# Execute the main command
exec "$@" 