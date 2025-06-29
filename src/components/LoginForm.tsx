import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import Spinner from "./ui/spinner";
import { VerifyiColoredLogo } from "@/assets/svgs";
import useLoginUser from "@/hooks/mutation/useLoginUser";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;


export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const { mutate: login, isPending } = useLoginUser();
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
                  Email
                </label>
                <Input
                  {...register("email")}
                  type="text"
                  id="email"
                  placeholder="Enter your email"
                  disabled={isPending}
                  className="h-[44px]"
                />
                {errors.email && (
                  <p className="text-xs text-red-600">
                    {errors.email.message}
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
