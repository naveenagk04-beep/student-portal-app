import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Building2,
  CalendarDays,
  Eye,
  EyeOff,
  Hash,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { vcetCampus, vcetLogo } from "@/lib/vcet-assets";
import { COLLEGE } from "@/lib/college";

const YEARS = ["1", "2", "3", "4"];
const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT"];

function passwordScore(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const SCORE_LABEL = ["Weak", "Weak", "Fair", "Good", "Strong"];
const SCORE_COLOR = [
  "bg-red-500",
  "bg-red-500",
  "bg-amber-500",
  "bg-lime-500",
  "bg-[#5BAA3C]",
];

export default function Register() {
  const { signIn } = useAuthActions();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [year, setYear] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = useMemo(() => passwordScore(password), [password]);

  const rollValid = /^\d{2}[A-Z]{2}\d{3}$/.test(rollNo.toUpperCase());
  const phoneValid = /^[6-9]\d{9}$/.test(phone);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const pwStrong = score >= 3;

  const startOtp = async () => {
    if (!emailValid) {
      setError("Enter a valid email before verifying.");
      return;
    }
    setError(null);
    setOtpError(null);
    setOtpSending(true);
    try {
      await signIn("email-otp", { email });
      setOtpOpen(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setOtpError(
        /already exists/i.test(msg)
          ? "An account with this email already exists. Please sign in."
          : "Could not send the verification code. Try again.",
      );
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    setOtpError(null);
    setOtpVerifying(true);
    try {
      await signIn("email-otp", { email, code: otp });
      setEmailVerified(true);
      setOtpOpen(false);
    } catch {
      setOtpError("Incorrect or expired code. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Please enter your full name.");
    if (!rollValid)
      return setError("Roll No must look like 23CE017 (2 digits, 2 letters, 3 digits).");
    if (!year) return setError("Please select your year.");
    if (!department) return setError("Please select your department.");
    if (!emailVerified)
      return setError("Please verify your email with the OTP before submitting.");
    if (!phoneValid)
      return setError("Phone must be a valid Indian 10-digit mobile number.");
    if (!pwStrong)
      return setError("Password is too weak. Use 8+ chars with letters and numbers.");

    setSubmitting(true);
    try {
      // Convert the verified email OTP session into a full password account.
      await signIn("password", {
        email,
        password,
        flow: "signUp",
        name,
        phone,
        rollNo: rollNo.toUpperCase(),
        year,
        department,
      });
      navigate("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        /already exists/i.test(msg)
          ? "An account with this email already exists. Please sign in."
          : "Registration failed. Please try again.",
      );
      setSubmitting(false);
    }
  };

  const inputCls =
    "h-11 rounded-lg border-[#E5EAF2] focus-visible:ring-2 focus-visible:ring-[#0B3B78]/30";

  return (
    <div className="relative min-h-screen bg-[#F4F7FC]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${vcetCampus()})` }}
      />
      <div className="absolute inset-0 bg-[#06244A]/35" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-10">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-white/95 px-4 py-2 shadow-sm">
            <img src={vcetLogo()} alt="Portal logo" className="size-8 rounded" />
            <div className="text-left leading-none">
              <span className="block text-base font-extrabold text-[#0B3B78]">{COLLEGE.shortName}</span>
              <span className="text-[9px] font-medium text-[#5B6B83]">
                Empowering the Next Generation
              </span>
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white drop-shadow md:text-3xl">
            New Student Registration
          </h1>
          <p className="font-hand mt-1 text-xl text-white/90">
            Your Future Starts Here
          </p>
        </div>

        <div className="vcet-card w-full p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Field label="Name" icon={<User className="size-4" />}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                className={inputCls}
                disabled={submitting}
              />
            </Field>

            <Field label="Roll No" icon={<Hash className="size-4" />}>
              <Input
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                placeholder="Enter your roll number (e.g. 23CE017)"
                className={inputCls}
                disabled={submitting}
              />
              {rollNo && !rollValid && (
                <p className="mt-1 text-xs text-[#C0392B]">
                  Format: 2 digits + 2 letters + 3 digits (e.g. 23CE017)
                </p>
              )}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Year" icon={<CalendarDays className="size-4" />}>
                <Select value={year} onValueChange={setYear} disabled={submitting}>
                  <SelectTrigger className={inputCls}>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={y}>
                        Year {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Department" icon={<Building2 className="size-4" />}>
                <Select
                  value={department}
                  onValueChange={setDepartment}
                  disabled={submitting}
                >
                  <SelectTrigger className={inputCls}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Email" icon={<Mail className="size-4" />}>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  className={inputCls}
                  disabled={submitting || emailVerified}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={startOtp}
                  disabled={otpSending || !emailValid || emailVerified}
                  className="h-11 shrink-0 rounded-lg border-[#0B3B78] px-4 text-[#0B3B78] hover:bg-[#EAF2FC]"
                >
                  {otpSending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : emailVerified ? (
                    "Verified ✓"
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </Field>

            <Field label="Phone Number" icon={<Phone className="size-4" />}>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Enter your phone number"
                autoComplete="tel"
                className={inputCls}
                disabled={submitting}
              />
              {phone && !phoneValid && (
                <p className="mt-1 text-xs text-[#C0392B]">
                  Enter a valid 10-digit Indian mobile number.
                </p>
              )}
            </Field>

            <Field label="Password" icon={<Lock className="size-4" />}>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className={`${inputCls} pr-10`}
                  disabled={submitting}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#5B6B83] hover:text-[#0B3B78]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-colors",
                          i < score ? SCORE_COLOR[score] : "bg-[#E5EAF2]",
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-[#5B6B83]">
                    Strength: {SCORE_LABEL[score]}
                  </p>
                </div>
              )}
            </Field>

            {error && (
              <p className="rounded-md bg-[#FDECEA] px-3 py-2 text-sm text-[#C0392B]">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="h-12 w-full rounded-lg bg-[#0B3B78] text-base font-semibold hover:bg-[#08315F]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Creating account…
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-[#5B6B83]">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[#0B3B78] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* OTP modal */}
      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify your email</DialogTitle>
            <DialogDescription>
              We sent a 6-digit code to <strong>{email}</strong>. It expires in 10
              minutes.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {otpError && <p className="text-sm text-[#C0392B]">{otpError}</p>}
          </div>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setOtpOpen(false)}
              disabled={otpVerifying}
            >
              Cancel
            </Button>
            <Button
              onClick={verifyOtp}
              disabled={otp.length !== 6 || otpVerifying}
              className="bg-[#0B3B78] hover:bg-[#08315F]"
            >
              {otpVerifying ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Verifying…
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-[#0F2542]">
        <span className="text-[#5B6B83]">{icon}</span>
        {label}
      </Label>
      {children}
    </div>
  );
}
