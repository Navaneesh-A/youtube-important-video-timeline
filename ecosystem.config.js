module.exports = {
  apps: [
    {
      name: "node-backend",
      script: "./backend/server.js",       // Path to your Node entry point
      env: {
        NODE_ENV: "production",
        PORT: 5001
      }
    },
    {
      name: "react-frontend",
      script: "node_modules/react-scripts/bin/react-scripts.js",
      args: "start",
      env: {
        PORT: 5173                         // Port for React local server
      }
    }
  ]
}