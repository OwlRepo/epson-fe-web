#!/bin/bash
set -e

# Create a systemd service file for the epson-fe-web container
cat > /tmp/epson-fe-web.service << EOF
[Unit]
Description=Epson Frontend Web Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Check if we're root, otherwise use sudo to move and enable the service
if [ "$(id -u)" -eq 0 ]; then
  mv /tmp/epson-fe-web.service /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable epson-fe-web.service
  systemctl start epson-fe-web.service
  echo "Service installed and started successfully."
else
  echo "This script needs root privileges to install the service."
  echo "Running with sudo..."
  sudo mv /tmp/epson-fe-web.service /etc/systemd/system/
  sudo systemctl daemon-reload
  sudo systemctl enable epson-fe-web.service
  sudo systemctl start epson-fe-web.service
  echo "Service installed and started successfully."
fi

echo "The Epson Frontend Web Application will now start automatically on system boot." 