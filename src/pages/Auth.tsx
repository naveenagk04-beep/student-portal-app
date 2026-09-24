import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import campus from "@/assets/campus.svg";
import { VcetLogo } from "@/components/vcet/VcetLogo";

export default function AuthPage({
  redirectAfterAuth,
}: {
  redirectAfterAuth?: string;
} = {}) {
  return <AuthForm redirectAfterAuth={redirectAfterAuth} />;
}

export function AuthForm({ redirectAfterAuth }: { redirectAfterAuth?: string }) {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const id = studentId.trim();
    if (!id) {
      setError("Please enter your student ID.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const email = id.includes("@")
        ? id.toLowerCase()
        : `${id.replace(/\s+/g, "").toLowerCase()}@vcet.edu.in`;
      await signIn("password", { email, password, flow: "signIn" });
      navigate(redirectAfterAuth ?? "/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("invalid")) {
        setError("Invalid student ID or password.");
      } else if (msg.toLowerCase().includes("missing")) {
        setError("No account exists for that ID. Try a demo account below.");
      } else {
        setError("Sign-in failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F4F7FC]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${campus})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#06244A]/60 via-[#06244A]/30 to-[#06244A]/10" />

      <div className="relative z-10 flex min-h-screen">
        {/* Left branding panel */}
        <div className="hidden flex-1 flex-col justify-end p-10 lg:flex">
          <div className="mb-10">
            <VcetLogo light size={44} />
            <p className="font-hand mt-4 text-2xl text-white/90">
              Empowering the Next Generation
            </p>
          </div>
        </div>

        {/* Right card */}
        <div className="flex w-full items-center justify-center p-4 lg:w-[560px]">
          <div className="vcet-card w-full max-w-md p-8">
            <h1 className="text-2xl font-bold text-[#0F2542]">Student Login</h1>
            <p className="mt-1 text-sm text-[#5B6B83]">
              Welcome back! Sign in to your VCET portal.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="studentId" className="text-[#0F2542]">
                  Student ID
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5B6B83]" />
                  <Input
                    id="studentId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter your student ID"
                    autoComplete="username"
                    className="h-11 rounded-lg border-[#E5EAF2] pl-9 focus-visible:ring-2 focus-visible:ring-[#0B3B78]/30"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[#0F2542]">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5B6B83]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-11 rounded-lg border-[#E5EAF2] pl-9 pr-10 focus-visible:ring-2 focus-visible:ring-[#0B3B78]/30"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#5B6B83] hover:text-[#0B3B78]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-md bg-[#FDECEA] px-3 py-2 text-sm text-[#C0392B]">
                  {error}
                </p>
              )}

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#0B3B78] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-lg bg-[#0B3B78] text-base font-semibold hover:bg-[#08315F]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[#5B6B83]">
              New Student?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#0B3B78] hover:underline"
              >
                Create an account
              </Link>
            </p>

            <div className="mt-6 rounded-lg bg-[#EAF2FC] p-3 text-xs leading-relaxed text-[#0B3B78]">
              <p className="font-semibold">Demo accounts</p>
              <p className="mt-1">
                Student: <code>23CE017</code> / <code>portal123</code>
              </p>
              <p>
                Parent: <code>parent@vcet.edu.in</code> / <code>portal123</code>
              </p>
              <p>
                Admin: <code>admin@vcet.edu.in</code> / <code>portal123</code>
              </p>
              <p className="mt-1 text-[11px] opacity-80">
                Tip: student ID 23CE017 maps to 23ce017@vcet.edu.in
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
