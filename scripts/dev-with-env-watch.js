import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceEnvPath = path.join(__dirname, "../src/envs/.env.development");
const targetEnvPath = path.join(__dirname, "../.env");

let devServer = null;

function copyEnvFile() {
    try {
        // Read the development environment file
        const envContent = fs.readFileSync(sourceEnvPath, "utf8");

        // Write to the root .env file
        fs.writeFileSync(targetEnvPath, envContent);

        console.log("✅ Environment variables copied successfully");

        // Restart the dev server if it's running
        if (devServer) {
            console.log("🔄 Restarting development server to apply new environment variables...");
            devServer.kill();
            startDevServer();
        }
    } catch (error) {
        console.error("❌ Error copying environment variables:", error.message);
    }
}

function startDevServer() {
    console.log("🚀 Starting development server...");
    // Using Bun to start the Vite dev server
    devServer = spawn("bun", ["run", "vite", "--port", "3000"], {
        stdio: "inherit",
        shell: true
    });

    devServer.on("error", (err) => {
        console.error("❌ Failed to start development server:", err);
    });

    devServer.on("close", (code) => {
        if (code !== 0 && code !== null) {
            console.log(`⚠️ Development server exited with code ${code}`);
        }
        devServer = null;
    });
}

// Initial copy
copyEnvFile();

// Watch for changes
fs.watch(sourceEnvPath, (eventType, filename) => {
    if (eventType === "change") {
        console.log(`🔄 Detected changes in ${filename}`);
        copyEnvFile();
    }
});

console.log("👀 Watching for changes in .env.development...");

// Start the development server initially
startDevServer();