# Epson Frontend Web Application

A modern React application built with Bun and Vite.

## Tech Stack

- **Runtime & Package Manager:** [Bun](https://bun.sh/)
- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **Routing:** TanStack Router
- **Testing:** Vitest

## 🚀 Getting Started

1. Install dependencies:

```bash
bun install
```

2. Start the development server:

```bash
bun run start
```

The application will be available at <http://localhost:3000>

## 📋 Available Scripts

### 🔧 Development Scripts

| Command | Description |
|---------|-------------|
| `bun run start` | Start development server |
| `bun run build` | Build for production (uses .env.production) |
| `bun run preview` | Preview production build |
| `bun run setup-env` | Setup development environment variables |
| `bun run setup-env:prod` | Setup production environment variables |

### 🧪 Testing Scripts

| Command | Description |
|---------|-------------|
| `bun run test` | Run tests |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:coverage` | Run tests with coverage |

### 🎨 Code Quality Scripts

| Command | Description |
|---------|-------------|
| `bun run lint` | Run ESLint |
| `bun run format` | Format code with Prettier |

### 🚀 Deployment Scripts

| Command | Description |
|---------|-------------|
| `bun run deploy:both` | 🎯 Deploy both Main and EVS applications |
| `bun run deploy:main` | 📱 Deploy Main application only |
| `bun run deploy:evs` | 🚨 Deploy EVS application only |
| `bun run down:all` | ⏹️ Stop all running applications |

### 📦 Docker Export Scripts

| Command | Description |
|---------|-------------|
| `bun run docker:tar:both` | 📦 Export both Main and EVS apps to tar file |
| `bun run docker:tar:main` | 📱 Export Main application only to tar file |
| `bun run docker:tar:evs` | 🚨 Export EVS application only to tar file |

### 🐳 Legacy Docker Scripts

| Command | Description |
|---------|-------------|
| `bun run docker:build:up` | Build and start single container |
| `bun run docker:up` | Start single container |
| `bun run docker:down` | Stop single container |
| `bun run docker:logs` | View container logs |
| `bun run docker:tar` | Export single container to tar (legacy) |
| `bun run docker:clean` | Remove container, volumes, and images |

## 🔧 Environment Setup

### 📁 Environment File Structure

```
epson-fe-web/
├── src/envs/
│   ├── .env.development     # 🔧 Development variables
│   └── .env.production      # 🏭 Production variables
└── .env                    # 🔄 Auto-generated from src/envs/ (don't edit)
```

### Development Environment

Development environment variables are stored in `src/envs/.env.development`. When you run the development server with `bun run start`, these variables are automatically copied to the root `.env` file.

### Production Environment

Production environment variables are stored in `src/envs/.env.production`. When you build the application with `bun run build`, these variables are automatically copied to the root `.env` file.

### 🐳 Docker Deployment Environment

For Docker deployments, the system uses the automatically generated `.env` file and overrides the `VITE_IS_EVS` variable at runtime:

#### How It Works

- **Main App**: Uses `.env` + `VITE_IS_EVS=false` (runtime override)
- **EVS App**: Uses `.env` + `VITE_IS_EVS=true` (runtime override)

#### Configuration

| Component | Main App | EVS App | Source |
|-----------|----------|---------|--------|
| Base variables | ✅ `.env` | ✅ `.env` | Auto-generated from `src/envs/.env.production` |
| `VITE_IS_EVS` | `false` | `true` | Runtime override in docker-compose.yml |
| Socket endpoint | Uses `VITE_API_SOCKET_URL` | Uses `VITE_API_SOCKET_EVS_URL` | Based on `VITE_IS_EVS` value |

### Adding Environment Variables

To add new environment variables to your project:

1. Open the appropriate environment file:
   - For development: `src/envs/.env.development`
   - For production: `src/envs/.env.production`

2. Add your variables using the format `KEY=VALUE` with each variable on a new line
   - **Important**: Variables must be prefixed with `VITE_` to be exposed to your application code

```bash
# Example .env.development or .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_APP_TITLE=Epson App
VITE_FEATURE_FLAG_NEW_UI=true
VITE_AUTH_TIMEOUT=3600
```

### Using Environment Variables in Your Code

You can access environment variables in your React components and other code through `import.meta.env`:

```tsx
// Example usage in a component
function ApiComponent() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  
  // Use the variable
  useEffect(() => {
    fetch(`${apiUrl}/users`)
      .then(response => response.json())
      .then(data => console.log(data));
  }, []);
  
  return (
    <div>
      <h1>{import.meta.env.VITE_APP_TITLE}</h1>
      {/* Conditional rendering based on feature flag */}
      {import.meta.env.VITE_FEATURE_FLAG_NEW_UI === 'true' && (
        <NewUIComponent />
      )}
    </div>
  );
}
```

### Using the env.ts Utility (Recommended)

The project includes a dedicated utility file (`src/utils/env.ts`) for accessing environment variables in a type-safe and consistent way:

```typescript
// src/utils/env.ts
declare global {
  interface Window {
    env: Record<string, string>;
  }
}

export const getEnvVar = (key: string): string => {
  return import.meta.env[key] || "";
};

// Create specific getters for each env variable
export const getApiBaseUrl = () => getEnvVar("VITE_SOCKET_BASE_URL");
// Add other env variable getters as needed
```

Using this utility provides several advantages:

- Centralized access to environment variables
- Default fallback values to prevent undefined errors
- Type safety through specific getter functions
- Easier mocking for tests

Example usage in components:

```tsx
import { getApiBaseUrl } from '@/utils/env';

function ApiComponent() {
  const apiUrl = getApiBaseUrl();
  
  useEffect(() => {
    fetch(`${apiUrl}/users`)
      .then(response => response.json())
      .then(data => console.log(data));
  }, []);
  
  return (
    // Component code...
  );
}
```

To add new environment variable getters, extend the `env.ts` file:

```typescript
// Adding new environment variable getters
export const getAppTitle = () => getEnvVar("VITE_APP_TITLE");
export const getFeatureFlags = () => ({
  newUI: getEnvVar("VITE_FEATURE_FLAG_NEW_UI") === "true",
  betaFeatures: getEnvVar("VITE_FEATURE_FLAG_BETA") === "true",
});
export const getAuthTimeout = () => Number(getEnvVar("VITE_AUTH_TIMEOUT") || "3600");
```

### Environment Types

To get TypeScript autocompletion for your environment variables, add them to the `ImportMetaEnv` interface in `vite-end.d.ts`:

```ts
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_FEATURE_FLAG_NEW_UI: string
  readonly VITE_AUTH_TIMEOUT: string
  // Add other variables here
}
```

### Troubleshooting

- If your environment variables aren't being picked up, ensure they start with `VITE_`
- After changing environment files, restart your development server
- For Docker deployments, ensure variables are properly set in your Docker environment

## 📁 Project Structure

```
epson-fe-web/
├── 📂 src/
│   ├── 📂 components/     # 🧩 UI components
│   │   ├── 📂 ui/         # 🎨 shadcn/ui components
│   │   ├── 📂 dialogs/    # 💬 Modal dialogs
│   │   ├── 📂 inputs/     # 📝 Form inputs
│   │   └── 📂 layouts/    # 🏗️ Page layouts
│   ├── 📂 routes/         # 🧭 TanStack Router routes
│   │   ├── 📂 _authenticated/  # 🔐 Protected routes
│   │   │   ├── 📂 attendance-monitoring/
│   │   │   ├── 📂 device-management/
│   │   │   ├── 📂 evacuation-monitoring/
│   │   │   ├── 📂 user-management/
│   │   │   └── 📂 visitor-management/
│   │   └── __root.tsx     # 🌳 Root layout
│   ├── 📂 store/          # 🗄️ Zustand state management
│   ├── 📂 hooks/          # 🪝 Custom React hooks
│   │   ├── 📂 query/      # 📊 TanStack Query hooks
│   │   └── 📂 mutation/   # ✏️ Mutation hooks
│   ├── 📂 lib/            # 🛠️ Utility libraries
│   ├── 📂 assets/         # 🖼️ Static assets
│   │   ├── 📂 images/     # 🖼️ Images
│   │   └── 📂 svgs/       # 🎨 SVG icons
│   ├── 📂 envs/           # 🌍 Environment variables
│   │   ├── .env.development
│   │   └── .env.production
│   ├── 📂 utils/          # 🔧 Utility functions
│   └── main.tsx           # 🚀 Application entry point
├── 📂 public/             # 📁 Static assets
├── 📂 scripts/            # 📜 Build scripts
├── 🐳 Dockerfile         # 🐳 Container definition
├── 🐳 docker-compose.yml # 🐳 Multi-container setup

└── package.json          # 📦 Dependencies & scripts
```

### 🏗️ Architecture Patterns

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Flow                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Browser Request                                            │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────┐     ┌─────────────────┐              │
│  │  TanStack       │────▶│  React          │              │
│  │  Router         │     │  Components     │              │
│  │  (routes/)      │     │  (components/)  │              │
│  └─────────────────┘     └─────────────────┘              │
│       │                           │                        │
│       ▼                           ▼                        │
│  ┌─────────────────┐     ┌─────────────────┐              │
│  │  Route Guards   │     │  TanStack       │              │
│  │  (guardRoute)   │     │  Query          │              │
│  └─────────────────┘     │  (hooks/query/) │              │
│       │                  └─────────────────┘              │
│       ▼                           │                        │
│  ┌─────────────────┐              ▼                        │
│  │  Zustand Store  │     ┌─────────────────┐              │
│  │  (store/)       │     │  API Calls      │              │
│  └─────────────────┘     │  (axios)        │              │
│                          └─────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## 🧠 State Management with Zustand

This project uses [Zustand](https://github.com/pmndrs/zustand) for state management. Our setup provides:

- TypeScript support
- Optional persistence middleware
- Redux DevTools integration
- Modular store structure

### Using Stores

```tsx
import { useAppStore } from "@/store/useAppStore";

function MyComponent() {
  const { count, increment, theme, setTheme } = useAppStore();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <p>Theme: {theme}</p>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### Creating New Stores

```tsx
// src/store/useNewStore.ts
import { createStore } from "./store";

interface NewState {
  // Define your state types
}

interface NewActions {
  // Define your action types
}

const initialState: NewState & NewActions = {
  // Define initial state and empty actions
};

export const useNewStore = createStore<NewState & NewActions>(
  "new-store",
  initialState,
  {
    persist: true, // Optional: persist state
    devtools: true, // Optional: enable DevTools
  }
);

// Implement the actions
useNewStore.setState((state) => ({
  ...state,
  // Implement your actions here
}));
```

## 🧭 Routing with TanStack Router

This project uses file-based routing with [TanStack Router](https://tanstack.com/router). Routes are managed as files in the `src/routes` directory.

### Adding Links

```tsx
import { Link } from "@tanstack/react-router";

// In your component
<Link to="/about">About</Link>;
```

### Using Layouts

The root layout is defined in `src/routes/__root.tsx`:

```tsx
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>{/* Navigation items */}</nav>
      </header>
      <Outlet />
    </>
  ),
});
```

## 📊 Data Fetching with TanStack Query

### Route Loaders

```tsx
const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  loader: async () => {
    const response = await fetch("/api/users")
    return response.json()
  },
  component: () => {
    const data = userRoute.useLoaderData()
    return (
      // Render your data
    )
  },
})
```

### Using React Query

```tsx
import { useQuery } from "@tanstack/react-query"

function Users() {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then(res => res.json())
  })

  if (isLoading) return <p>Loading...</p>

  return (
    // Render your data
  )
}
```

## 🎨 Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components for styling.

## 🧪 Testing

This project uses [Vitest](https://vitest.dev/) for testing:

```bash
# Run tests once
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage
```

## 🚢 Building for Production

```bash
# Build the application with production environment
bun run build

# Preview the build
bun run preview
```

## 🐳 Docker

This application supports dual deployment architecture - running two separate instances with different behaviors based on the `VITE_IS_EVS` environment variable.

### 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Dual Deployment Setup                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   Main App       │         │   EVS App        │         │
│  │   Port: 8765     │         │   Port: 8766     │         │
│  │   VITE_IS_EVS=   │         │   VITE_IS_EVS=   │         │
│  │   false          │         │   true           │         │
│  └──────────────────┘         └──────────────────┘         │
│           │                            │                   │
│           └────────────┬───────────────┘                   │
│                        │                                   │
│              ┌─────────▼─────────┐                         │
│              │  Shared Docker    │                         │
│              │  Image            │                         │
│              │  (nginx + built   │                         │
│              │   React app)      │                         │
│              └───────────────────┘                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 📋 Environment Setup

The deployment uses the automatically generated `.env` file from your production environment:

#### Automatic Configuration

- Environment variables are loaded from `src/envs/.env.production`
- The build process copies them to the root `.env` file
- Docker containers override `VITE_IS_EVS` at runtime to differentiate app behavior

#### Required Variables in `src/envs/.env.production`

```bash
# API Configuration
VITE_API_REST_URL=https://your-api.example.com
VITE_API_SOCKET_URL=wss://your-socket.example.com
VITE_API_SOCKET_EVS_URL=wss://your-evs-socket.example.com

# Add other VITE_* variables as needed
```

### 🚀 Deployment Options

#### Deploy Both Applications

```bash
bun run deploy:both
```

**Result:** Both Main App (port 8765) and EVS App (port 8766) running

#### Deploy Main Application Only

```bash
bun run deploy:main
```

**Result:** Main App running on port 8765

#### Deploy EVS Application Only

```bash
bun run deploy:evs
```

**Result:** EVS App running on port 8766

#### Stop All Applications

```bash
bun run down:all
```

### 🔄 Deployment Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   npm script    │───▶│  Docker Compose │───▶│   Container(s)  │
│                 │    │   with profile  │    │                 │
│ deploy:both     │    │                 │    │ ┌─────────────┐ │
│ deploy:main     │    │ --profile main  │    │ │  Main App   │ │
│ deploy:evs      │    │ --profile evs   │    │ │  EVS App    │ │
│                 │    │                 │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🌐 Access URLs

After deployment, your applications will be available at:

- **Main Application**: <http://localhost:8765>
- **EVS Application**: <http://localhost:8766>

### 🔧 Advanced Docker Commands

| Command | Description |
|---------|-------------|
| `bun run deploy:both` | Deploy both Main and EVS applications |
| `bun run deploy:main` | Deploy Main application only |
| `bun run deploy:evs` | Deploy EVS application only |
| `bun run down:all` | Stop all running applications |
| `bun run docker:build:up` | Build and start single container (legacy) |
| `bun run docker:up` | Start single container (legacy) |
| `bun run docker:down` | Stop single container (legacy) |
| `bun run docker:logs` | View container logs |
| `bun run docker:clean` | Remove container, volumes, and images |

### 📦 Docker Image Export

Generate distributable tar files for deployment:

```bash
# Export both applications (recommended for production)
bun run docker:tar:both
# → Creates: epson-fe-web-both.tar

# Export Main application only
bun run docker:tar:main
# → Creates: epson-fe-web-main.tar

# Export EVS application only
bun run docker:tar:evs
# → Creates: epson-fe-web-evs.tar
```

**Use Cases:**

- 🚀 **Production deployment** on servers without internet access
- 📦 **Distribution** to multiple environments
- 💾 **Backup** of specific application variants
- 🔄 **Version control** of deployed images

### 🏷️ Container Management

```bash
# View running containers
docker ps

# View logs for specific service
docker compose logs web-main
docker compose logs web-evs

# Restart specific service
docker compose restart web-main
docker compose restart web-evs

# Build and deploy with no cache
docker compose build --no-cache
bun run deploy:both
```

### ⚙️ How It Works

1. **Single Image Strategy**: Both applications use the same Docker image
2. **Runtime Configuration**: Environment variables are injected at container startup
3. **Profile-based Deployment**: Docker Compose profiles control which services run
4. **Port Separation**: Each application runs on a different port for parallel access

### 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Check if containers are already running with `docker ps` |
| Environment variables not loaded | Ensure `src/envs/.env.production` exists and run `bun run build` first |
| Build fails | Run `docker system prune` to clean up and try again |
| Service not accessible | Check firewall settings and ensure ports 8765/8766 are open |

## 🧹 Demo Files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

## 📚 Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

## 🤝 Contributing

Please read our contributing guidelines before submitting PRs.

## 📄 License

This project is licensed under the terms of the MIT license.
