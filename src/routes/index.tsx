import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "../components/LoginForm";
import { LoginBackground } from "../assets/svgs";
export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7FAFF]">
      <LoginBackground className="absolute bottom-20 right-10 w-[1369px] h-[645px]" />
      <LoginForm />
    </div>
  );
}
