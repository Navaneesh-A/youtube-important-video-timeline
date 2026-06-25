module.exports = {
  apps: [
    {
      name: "node-backend",
      script: "./server.js",
      cwd: "./backend",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 5001
      }
    },
    {
      name: "react-frontend",
      script: "./node_modules/vite/bin/vite.js",
      args: "dev", // FIXED: Changed 'run dev' to 'dev' for direct binary execution
      cwd: "./frontend",
      watch: false,
      env: {
        PORT: 5173
      }
    }
  ]
};