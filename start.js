import { execSync } from "child_process";
// The command you want to run
const command = "npx vite preview --host --port 8766";

try {
  console.log(`Starting Vite preview with command: ${command}`);
  // Execute the command synchronously
  execSync(command, { stdio: "inherit" });
} catch (error) {
  console.error(`Failed to start Vite preview: ${error}`);
  // Exit with a non-zero status code on error
  process.exit(1);
}
