import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import api from "@/config/axiosInstance";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/validate-session")({
  component: RouteComponent,
  beforeLoad: async ({ search }) => {
    if (search.token) {
      await api
        .post(`/api/evs/tokenLogin`, {
          token: search.token,
        })
        .then((res) => {
          const { token, refreshToken, user } = res.data.data;
          localStorage.setItem("token", token);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("user", JSON.stringify(user));
          redirect({
            to: "/evacuation-monitoring/dashboard/overview",
          });
        })
        .catch(async () => {
          redirect({
            to: "/",
          });
        });
    } else {
      redirect({
        to: "/",
      });
    }
  },
});

function RouteComponent() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <Card className="w-full max-w-md flex flex-col items-center shadow-none">
        <div className="mb-7">
          <Spinner size={70} color="#980000" />
        </div>
        <CardTitle className="text-2xl font-bold">
          Validating session...
        </CardTitle>
        <CardContent>
          <p>Please wait while we validate your session...</p>
        </CardContent>
      </Card>
    </div>
  );
}
