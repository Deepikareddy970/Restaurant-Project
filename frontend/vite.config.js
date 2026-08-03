import { defineConfig } from 'vite';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function backendServerPlugin() {
  let backendProcess = null;
  return {
    name: 'backend-server',
    configureServer(server) {
      const backendDir = path.resolve(__dirname, '../backend');
      console.log(`[Vite Plugin] Starting backend server in: ${backendDir}`);

      backendProcess = spawn('node', ['server.js'], {
        cwd: backendDir,
        stdio: 'inherit',
        shell: true
      });

      backendProcess.on('error', (err) => {
        console.error('[Vite Plugin] Failed to start backend server:', err);
      });

      const killBackend = () => {
        if (backendProcess) {
          console.log('[Vite Plugin] Stopping backend server...');
          backendProcess.kill();
          backendProcess = null;
        }
      };

      process.on('exit', killBackend);
      process.on('SIGINT', killBackend);
      process.on('SIGTERM', killBackend);
      process.on('SIGHUP', killBackend);
      server.httpServer.on('close', killBackend);
    }
  };
}

export default defineConfig({
  plugins: [backendServerPlugin()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/admin': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: true
  }
});
