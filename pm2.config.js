const path = require("path");

console.log(path.resolve(__dirname, "./dist/main.js"));

module.exports = {
  apps: [
    {
      name: "app-name",
      script: path.resolve(__dirname, "./dist/main.js"),
      cwd: path.resolve(__dirname),
      instances: "max",
      watch: false,
      exec_mode: "cluster",
      max_memory_restart: "256M",
      max_restarts: 10,
      combine_logs: true,
      out_file: path.resolve(__dirname, "./logs/stdout.log"),
      error_file: path.resolve(__dirname, "./logs/stderr.log"),
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
};
