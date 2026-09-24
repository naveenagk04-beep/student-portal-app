import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, KeyRound, Loader2, Lock, Mail } from "lucide-react";
import campus from "@/assets/campus.svg";
import { cn } from "@/lib/utils";

export default function ForgotPassword() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();

  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await signIn("password", { flow: "reset", email });
      setInfo(`Reset code sent to ${email}. Check your email inbox.`);
      setStep("reset");
    } catch {
      setError("Could not send a reset code. Check the email and try again.");
    } finally {
      setLoading(false);
    }
  };

  const doReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn("password", {
        flow: "reset-verification",
        email,
        code,
        newPassword,
      });
      navigate("/login");
    } catch {
      setError("Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "h-11 rounded-lg border-[#E5EAF2] pl-9 focus-visible:ring-2 focus-visible:ring-[#0B3B78]/30";

  return (
    <div className="relative min-h-screen bg-[#F4F7FC]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${campus})` }}
      />
      <div className="absolute inset-0 bg-[#06244A]/40" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="vcet-card w-full max-w-md p-8">
          <h1 className="text-2xl font-bold text-[#0F2542]">
            {step === "email" ? "Forgot Password" : "Reset Password"}
          </h1>
          <p className="mt-1 text-sm text-[#5B6B83]">
            {step === "email"
              ? "Enter your registered email and we'll send a reset code."
              : `Enter the code sent to ${email} and choose a new password.`}
          </p>

          {step === "email" ? (
            <form onSubmit={requestReset} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#0F2542]">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5B6B83]" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={inputCls}
                    disabled={loading}
                  />
                </div>
              </div>

              {info && (
                <p className="rounded-md bg-[#EAF2FC] px-3 py-2 text-sm text-[#0B3B78]">
                  {info}
                </p>
              )}
              {error && (
                <p className="rounded-md bg-[#FDECEA] px-3 py-2 text-sm text-[#C0392B]">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-lg bg-[#0B3B78] font-semibold hover:bg-[#08315F]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Sending…
                  </>
                ) : (
                  "Send reset code"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={doReset} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-[#0F2542]">
                  Reset code
                </Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5B6B83]" />
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="6-digit code"
                    className={cn(inputCls)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-[#0F2542]">
                  New password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5B6B83]" />
                  <Input
                    id="newPassword"
                    type={showPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    autoComplete="new-password"
                    className={cn(inputCls, "pr-10")}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#5B6B83] hover:text-[#0B3B78]"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-md bg-[#FDECEA] px-3 py-2 text-sm text-[#C0392B]">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-lg bg-[#0B3B78] font-semibold hover:bg-[#08315F]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Updating…
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-center text-sm text-[#5B6B83] hover:text-[#0B3B78]"
              >
                Use a different email
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-[#5B6B83]">
            Remembered it?{" "}
            <Link to="/login" className="font-semibold text-[#0B3B78] hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
