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

The application will be available at http://localhost:3000

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run start` | Start development server |
| `bun run build` | Build for production (uses .env.production) |
| `bun run preview` | Preview production build |
| `bun run test` | Run tests |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:coverage` | Run tests with coverage |
| `bun run setup-env` | Setup development environment variables |
| `bun run setup-env:prod` | Setup production environment variables |
| `bun run lint` | Run ESLint |
| `bun run format` | Format code with Prettier |

## 🔧 Environment Setup

### Development Environment

Development environment variables are stored in `src/envs/.env.development`. When you run the development server with `bun run start`, these variables are automatically copied to the root `.env` file.

### Production Environment

Production environment variables are stored in `src/envs/.env.production`. When you build the application with `bun run build`, these variables are automatically copied to the root `.env` file.

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
src/
├── components/    # UI components
├── routes/        # TanStack Router routes
├── store/         # Zustand state management
├── hooks/         # Custom React hooks
├── lib/           # Utility libraries
├── assets/        # Static assets (images, SVGs)
├── envs/          # Environment variables
└── main.tsx       # Application entry point
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

This application is containerized using Docker with Nginx as the web server.

### Building the Docker Image

```bash
docker build -t epson-fe-web .
```

### Running the Docker Container

```bash
docker run -p 8765:80 epson-fe-web
```

### Using Docker Compose

```bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down
```

The application will be available at http://localhost:8765 when running in Docker.

### Environment Variables

The Docker setup will use environment variables from your `.env` file during the build process. Make sure your environment variables are properly set before building the Docker image.

### Docker Scripts

| Command | Description |
|---------|-------------|
| `bun run docker:build:up` | Build and start the container |
| `bun run docker:up` | Start the container |
| `bun run docker:down` | Stop the container |
| `bun run docker:logs` | View container logs |
| `bun run docker:clean` | Remove container, volumes, and images |

## 🧹 Demo Files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

## 📚 Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

## 🤝 Contributing

Please read our contributing guidelines before submitting PRs.

## 📄 License

This project is licensed under the terms of the MIT license.
