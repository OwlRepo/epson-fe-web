import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import logo from "../logo.svg";
import api from "@/config/axiosInstance";
import Spinner from "@/components/ui/spinner";
export const Route = createFileRoute("/")({
  component: App,
  pendingComponent: () => (
    <div className="flex justify-center items-center h-screen">
      <Spinner color="#000" />
    </div>
  ),
  loader: async () => {
    const res = await api.get("/posts/1");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return res.data;
  },
});

function App() {
  const data = useLoaderData({
    from: "/",
  });
  return (
    <div className="text-center bg-red-500">
      <header className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
        <img
          src={logo}
          className="h-[40vmin] pointer-events-none animate-[spin_20s_linear_infinite]"
          alt="logo"
        />
        <p className="my-4">
          Edit{" "}
          <code className="bg-gray-700 px-2 py-1 rounded">
            src/routes/index.tsx
          </code>{" "}
          and save to reload.
        </p>
        <a
          className="text-[#61dafb] hover:text-[#43b9f9] transition-colors duration-200"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <a
          className="text-[#61dafb] hover:text-[#43b9f9] transition-colors duration-200 mt-2"
          href="https://tanstack.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn TanStack
        </a>
        <pre className="mt-4 bg-gray-800 p-4 rounded-lg overflow-auto max-w-full">
          {JSON.stringify(data, null, 2)}
        </pre>
      </header>
    </div>
  );
}
