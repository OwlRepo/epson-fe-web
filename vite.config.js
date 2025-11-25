import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { resolve } from "node:path";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import svgr from "vite-plugin-svgr";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    svgr(),
    {
      name: 'generate-env-config',
      writeBundle() {
        const envPath = resolve(__dirname, '.env');
        let envVars = '';
        
        if (existsSync(envPath)) {
          const envContent = readFileSync(envPath, 'utf8');
          const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
          
          envVars = envLines
            .map(line => {
              const [key, ...valueParts] = line.split('=');
              const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
              return key.startsWith('VITE_') ? `window.ENV.${key}="${value}";` : null;
            })
            .filter(Boolean)
            .join('\n');
        }
        
        const envConfig = `window.ENV = window.ENV || {};\n${envVars}`;
        writeFileSync(resolve(__dirname, 'dist/env-config.js'), envConfig);
      }
    }
  ],
  test: {
    globals: true,
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
      },
    },
  },
  server: {
    port: 8765,
    host: true,
  },
  preview: {
    port: 8766,
    host: true,
    allowedHosts: [
      'eppi.epson.biz'
    ]
  },
});
