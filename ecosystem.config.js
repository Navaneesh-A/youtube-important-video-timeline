
module.exports = {
  apps: [
    {
      name: "node-backend",
      script: "./backend/server.js",       // Path to your Node.js entry point
      cwd: "./backend",        // Working directory for your backend
      env: {
        NODE_ENV: "production",
        PORT: 5001                         // Your backend API port
      }
    },
    {
      name: "react-frontend",
      script: "./node_modules/vite/bin/vite.js",       // Windows needs .cmd
      args: "dev",            // This runs your 'vite' command
      cwd: "C:/Users/Admin/Desktop/hmm/youtube-important-video-timeline/frontend", // Ensure this points to the /frontend folder
      env: {
        NODE_ENV: "development",
        PORT: 5173                // Vite's default port
      }
    }
  ]
};

// module.exports = {
//   apps: [
//     {
//       name: "backend",
//       script: "server.js",
//       cwd: "./backend"
//     },
//     {
//       name: "frontend",
//       script: "npm.cmd",
//       args: "run dev",
//       cwd: "./frontend"
//     }
//   ]
// };
// module.exports = {
//   apps: [
//     {
//       name: "node-backend",
//       script: "./server.js",
//       cwd: "./backend",
//       watch: false,
//       env: {
//         NODE_ENV: "production",
//         PORT: 5001
//       }
//     },
//     {
//       name: "react-frontend",
//       script: "./node_modules/vite/bin/vite.js",
//       args: "dev", // FIXED: Changed 'run dev' to 'dev' for direct binary execution
//       cwd: "./frontend",
//       watch: false,
//       env: {
//         PORT: 5173
//       }
//     }
//   ]
// };