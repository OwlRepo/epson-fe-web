import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import Spinner from "./ui/spinner";
import { VerifyiColoredLogo } from "@/assets/svgs";
const loginSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const loginUser = async (data: LoginFormData) => {
  const response = await axios.post("https://reqres.in/api/login", {
    email: data.employeeId,
    password: data.password,
  });
  return response.data;
};

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate: login, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      toast.success("Login successful!", {
        description: "Welcome back! You've successfully signed in.",
        className: "bg-green-50 border-green-200 text-green-800",
        style: {
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          color: "#166534",
        },
      });
      // TODO: Handle successful login (e.g., store token, redirect)
      console.log("Login successful:", data);
    },
    onError: (error: any) => {
      toast.error("Login failed", {
        description:
          error.response?.data?.error ||
          "Invalid credentials. Please try again.",
        className: "bg-red-50 border-red-200 text-red-800",
        style: {
          background: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#991b1b",
        },
      });
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="w-full max-w-md px-4 z-10">
      {/* Logo */}
      <div className="flex flex-col items-center mb-14">
        <VerifyiColoredLogo className="w-[251px] h-[93px]" />
      </div>

      {/* Login Card */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-14">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-primary">Welcome back!</h2>
            <p className="mt-2 text-sm text-subtitle">
              Ready to dive in? Just sign in to continue where you left off.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="employeeId"
                  className="text-sm font-medium text-gray-700"
                >
                  Employee ID
                </label>
                <Input
                  {...register("employeeId")}
                  type="text"
                  id="employeeId"
                  placeholder="Enter your Employee ID"
                  disabled={isPending}
                  className="h-[44px]"
                />
                {errors.employeeId && (
                  <p className="text-xs text-red-600">
                    {errors.employeeId.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••"
                    disabled={isPending}
                    className="h-[44px]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isPending}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600">
                    {errors.password.message}
                  </p>
                )}
                <div className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-gray-600 font-normal hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(e) => isPending && e.preventDefault()}
                  >
                    Forgot your password?
                  </Button>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-[50px] mt-10"
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Spinner size={20} color="#fff" spinnerClassName=" w-fit" />
                  <p>Signing in...</p>
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-600 mt-20">
        <p>Copyright ©2024 Produced by ELID Technology Intl, Inc.</p>
        <p>version 1.0.0</p>
      </div>
    </div>
  );
}
