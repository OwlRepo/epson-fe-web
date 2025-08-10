import { toast } from "sonner";
import { z } from "zod";
import api from "@/config/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import useToastStyleTheme from "../useToastStyleTheme";
import { useRouter, useSearch } from "@tanstack/react-router";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const loginUser = async (data: LoginFormData) => {
  const response = await api.post("/api/users/loginUser", {
    email: data.email,
    password: data.password,
  });
  return response.data;
};

export default function useLoginUser() {
  const router = useRouter();
  const search = useSearch({ from: "/" });
  const { successStyle, errorStyle } = useToastStyleTheme();
  const loginResponse = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const { token, user } = data.data;
      toast.success("Login successful!", {
        description: "Welcome back! You've successfully signed in.",
        className: "bg-green-50 border-green-200 text-black",
        style: successStyle,
      });
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      router.navigate({ to: search.redirect || "/modules" });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.message ||
        error.message ||
        "Login failed. Please try again.";
      toast.error("Login failed", {
        description: errorMessage,
        className: "bg-red-50 border-red-200 text-black",
        style: errorStyle,
      });
    },
  });
  return {
    ...loginResponse,
  };
}
