#!/usr/bin/env node

import { readFileSync, existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const projectRoot = resolve(__dirname, '..');

function stopPreview() {
  const pidFile = resolve(projectRoot, '.preview.pid');
  
  if (!existsSync(pidFile)) {
    console.log('❌ No preview process found (no .preview.pid file)');
    return;
  }
  
  try {
    const pid = parseInt(readFileSync(pidFile, 'utf8').trim());
    
    // Kill the process
    process.kill(pid, 'SIGTERM');
    
    // Clean up the PID file
    unlinkSync(pidFile);
    
    console.log(`✅ Preview server (PID: ${pid}) stopped successfully`);
  } catch (error) {
    console.error('❌ Error stopping preview server:', error.message);
    
    // Clean up the PID file anyway
    if (existsSync(pidFile)) {
      unlinkSync(pidFile);
      console.log('🧹 Cleaned up stale .preview.pid file');
    }
  }
}

stopPreview();
