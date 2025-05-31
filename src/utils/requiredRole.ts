import api from "@/config/axiosInstance";
import { redirect } from "@tanstack/react-router";

export default function requireRoles(roles: string[]) {
  return async () => {
    const validate = await api.get("/validate").then((res) => res.data);
    if (!roles.includes(validate.role)) {
      throw redirect({
        to: "/",
        replace: true,
      });
    }
  };
}
