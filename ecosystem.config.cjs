module.exports = {
  apps: [
    {
      name: "epson-fe-web-evs",
      script: "./start.js",
      instances: 2, // Use 2 CPU cores minimum
      exec_mode: "cluster",
      max_memory_restart: "1G", // Restart if memory usage exceeds 1GB
      autorestart: true, // Auto restart if app crashes
      watch: false, // Disable file watching in production
      max_restarts: 10, // Max restarts within restart_delay
      min_uptime: "10s", // Minimum uptime before considering restart
      restart_delay: 4000, // Delay between restarts (4 seconds)
      env: {
        NODE_ENV: "production",
        PORT: 8766,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8766,
      },
      // Windows Server 2016 compatibility
      node_args: "--max-old-space-size=1024", // Limit Node.js memory usage
      // Cross-platform settings
      kill_timeout: 5000, // Time to wait before force killing
      listen_timeout: 3000, // Time to wait for app to listen
      // Logging with rotation
      log_file: "./logs/epson-fe-web-combined.log",
      out_file: "./logs/epson-fe-web-out.log",
      error_file: "./logs/epson-fe-web-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      // Log rotation settings
      log_type: "json",
      max_size: "10M", // Rotate when log file reaches 10MB
      retain: 30, // Keep 30 rotated log files
      compress: true, // Compress rotated logs
      // Health monitoring
      health_check_grace_period: 3000,
      // Restart conditions
      ignore_watch: ["node_modules", "logs", "dist"],
      // Memory and CPU monitoring
      instance_var: "EPSON_FE_WEB_EVS_INSTANCE_ID",
    },
  ],
};
