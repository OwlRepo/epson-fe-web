import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the .env file
const envPath = path.join(__dirname, "..", ".env");
const envContent = fs.readFileSync(envPath, "utf8");

// Extract VITE_ variables
const viteVars = envContent
  .split("\n")
  .filter((line) => line.startsWith("VITE_"))
  .map((line) => line.split("=")[0]);

// Generate docker-compose.yml content
const dockerComposeContent = `services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
${viteVars.map((varName) => `        - ${varName}=\${${varName}}`).join("\n")}
    ports:
      - "8765:80"
    restart: always
    env_file:
      - .env
    # Mount volume for real-time env changes without rebuilding
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
`;

// Write the docker-compose.yml file
const dockerComposePath = path.join(__dirname, "..", "docker-compose.yml");
fs.writeFileSync(dockerComposePath, dockerComposeContent);

console.log(
  "docker-compose.yml has been generated with all VITE_ variables from .env"
);
