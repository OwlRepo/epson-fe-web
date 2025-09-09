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
  try {
    const envPath = resolve(projectRoot, '.env');
    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, 'utf8');
      if (envContent && typeof envContent === 'string') {
        const isEVS = envContent.includes('VITE_IS_EVS=true');
        return isEVS ? 8766 : 8765;
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not read .env file:', error.message);
  }
  return 8765; // default
}

// Get local IP address
async function getLocalIP() {
  try {
    const { networkInterfaces } = await import('os');
    const nets = networkInterfaces();
    
    if (!nets || typeof nets !== 'object') {
      return 'localhost';
    }
    
    for (const name of Object.keys(nets)) {
      const interfaces = nets[name];
      if (!interfaces || !Array.isArray(interfaces)) continue;
      
      for (const net of interfaces) {
        // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
        if (net && net.family === 'IPv4' && !net.internal && net.address) {
          return net.address;
        }
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not get local IP:', error.message);
  }
  return 'localhost';
}

async function startPreview() {
  try {
    const port = getPreviewPort();
    const ip = await getLocalIP();
    
    console.log(`🚀 Starting preview server on port ${port}...`);
    console.log(`📡 Accessible on network at: http://${ip}:${port}`);
    
    // Determine the correct command for the platform
    const isWindows = process.platform === 'win32';
    
    // Use vite directly with --host flag for better control
    const viteCommand = isWindows ? 'npx.cmd' : 'npx';
    const args = ['vite', 'start', '--port', port.toString(), '--host'];
    
    // Start the preview process with proper detachment and --host flag
    const previewProcess = spawn(viteCommand, args, {
      cwd: projectRoot,
      detached: !isWindows, // Windows doesn't support detached properly
      stdio: 'ignore',
      shell: isWindows // Use shell on Windows
    });
    
    // Save PID for later cleanup
    const pidFile = resolve(projectRoot, '.preview.pid');
    if (previewProcess.pid) {
      writeFileSync(pidFile, previewProcess.pid.toString());
      console.log(`📋 Process PID: ${previewProcess.pid} (saved to .preview.pid)`);
    }
    
    // Unref so the parent process can exit (not supported on Windows)
    if (!isWindows && previewProcess.unref) {
      previewProcess.unref();
    }
    
    console.log(`✅ Preview server started in background`);
    console.log(`🔗 Access your app at: http://${ip}:${port}`);
    console.log(`⏹️  To stop: npm run preview:stop`);
    
    // Exit the script but keep the preview running
    process.exit(0);
  } catch (error) {
    console.error('❌ Error starting preview server:', error.message);
    process.exit(1);
  }
}

startPreview().catch(console.error);
