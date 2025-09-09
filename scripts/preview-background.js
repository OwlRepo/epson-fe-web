#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const projectRoot = resolve(__dirname, '..');

// Get port from .env file
function getPreviewPort() {
  const envPath = resolve(projectRoot, '.env');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf8');
    const isEVS = envContent.includes('VITE_IS_EVS=true');
    return isEVS ? 8766 : 8765;
  }
  return 8765; // default
}

// Get local IP address
async function getLocalIP() {
  const { networkInterfaces } = await import('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

async function startPreview() {
  const port = getPreviewPort();
  const ip = await getLocalIP();
  
  console.log(`🚀 Starting preview server on port ${port}...`);
  console.log(`📡 Accessible on network at: http://${ip}:${port}`);
  
  // Start the preview process with proper detachment
  const previewProcess = spawn('bun', ['run', 'preview'], {
    cwd: projectRoot,
    detached: true,
    stdio: 'ignore'
  });
  
  // Save PID for later cleanup
  const pidFile = resolve(projectRoot, '.preview.pid');
  writeFileSync(pidFile, previewProcess.pid.toString());
  
  console.log(`📋 Process PID: ${previewProcess.pid} (saved to .preview.pid)`);
  
  // Unref so the parent process can exit
  previewProcess.unref();
  
  console.log(`✅ Preview server started in background`);
  console.log(`🔗 Access your app at: http://${ip}:${port}`);
  console.log(`⏹️  To stop: bun run preview:stop`);
  
  // Exit the script but keep the preview running
  process.exit(0);
}

startPreview().catch(console.error);
