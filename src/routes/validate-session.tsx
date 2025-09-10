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
          const { accessToken: token, refreshToken, user } = res.data.data;
          if (res && res.status === 200) {
            console.log("TOKEN LOGIN SUCCESS");
            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("user", JSON.stringify(user));
            throw redirect({
              to: "/evacuation-monitoring/dashboard/overview",
            });
          }
          else {
            console.log("TOKEN LOGIN ERROR");
            localStorage.clear();
            throw redirect({
              to: "/",
            });
          }
        })
    } else {
      console.log("TOKEN LOGIN ERROR");
      localStorage.clear();
      throw redirect({
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
