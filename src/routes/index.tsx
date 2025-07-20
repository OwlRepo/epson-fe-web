import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginForm } from "../components/LoginForm";
import { LoginBackground } from "../assets/svgs";
export const Route = createFileRoute("/")({
  component: App,
  beforeLoad: async () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      throw redirect({ to: "/modules" });
    }
    return { isLoggedIn: false, user: null };
  },
});

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7FAFF]">
      <LoginBackground className="absolute bottom-20 right-10 w-[1369px] h-[645px]" />
      <LoginForm />
    </div>
  );
}
