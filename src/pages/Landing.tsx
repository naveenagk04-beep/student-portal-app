import { motion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  Landmark,
  Library,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import { vcetCampus } from "@/lib/vcet-assets";
import { VcetLogo } from "@/components/vcet/VcetLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Attendance tracking",
    desc: "Live attendance donut, subject-wise breakdown and instant alerts when you dip below 75%.",
  },
  {
    icon: BookOpen,
    title: "Exams & results",
    desc: "Exam schedules, hall allotments and published results with grades — all in one place.",
  },
  {
    icon: Library,
    title: "E-Library access",
    desc: "Books, IEEE/ACM journals and department notes, searchable from anywhere on campus.",
  },
  {
    icon: BellRing,
    title: "Circulars & alerts",
    desc: "Official announcements from administration, filtered by category and delivered instantly.",
  },
  {
    icon: GraduationCap,
    title: "Fees & payments",
    desc: "See every due date, pay online and download receipts with transaction IDs.",
  },
  {
    icon: Users,
    title: "Parent mode",
    desc: "Parents get a read-only view of their child's attendance, fees and academic progress.",
  },
];

const STATS = [
  { value: "8,000+", label: "Students" },
  { value: "350+", label: "Faculty" },
  { value: "98%", label: "Placement rate" },
  { value: "40+", label: "Clubs & chapters" },
];

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-[#F4F7FC]">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-40 border-b border-[#E5EAF2] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <VcetLogo size={36} />
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#5B6B83] md:flex">
            <a href="#features" className="transition-colors hover:text-[#0B3B78]">
              Features
            </a>
            <a href="#campus" className="transition-colors hover:text-[#0B3B78]">
              Campus
            </a>
            <a href="#stats" className="transition-colors hover:text-[#0B3B78]">
              At a glance
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {!isLoading && isAuthenticated ? (
              <Button
                asChild
                className="rounded-lg bg-[#0B3B78] hover:bg-[#08315F]"
              >
                <Link to="/dashboard">
                  Open dashboard <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="rounded-lg text-[#0B3B78] hover:bg-[#EAF2FC]"
                >
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-lg bg-[#0B3B78] hover:bg-[#08315F]"
                >
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(6,36,74,0.88) 0%, rgba(6,36,74,0.55) 50%, rgba(6,36,74,0.25) 100%), url(${vcetCampus()})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto flex min-h-[520px] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6 md:min-h-[560px]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 ring-1 ring-white/20">
              <Landmark className="size-3.5" /> Velalar College of Engineering & Technology
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Your campus, <span className="text-[#8FC3EF]">organized.</span>
              <br />
              Your future,{" "}
              <span className="font-hand text-[#A5D6A7]">accelerated.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              One portal for attendance, assignments, exams, fees, circulars and
              campus life — built for VCET students, parents and faculty.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-lg bg-[#0B3B78] px-7 text-base font-semibold shadow-lg shadow-black/20 hover:bg-[#0d4a94]"
              >
                <Link to="/register">
                  Get started <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="h-12 rounded-lg bg-white/15 px-7 text-base font-semibold text-white backdrop-blur hover:bg-white/25"
              >
                <Link to="/login">Sign in to portal</Link>
              </Button>
            </div>
            <p className="font-hand mt-6 text-2xl text-white/90">
              Your Future Starts Here
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== Stats ===== */}
      <section id="stats" className="border-b border-[#E5EAF2] bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-[#0B3B78]">{s.value}</p>
              <p className="mt-1 text-sm text-[#5B6B83]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#5BAA3C]">
            Everything in one place
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[#0F2542]">
            Built for the full VCET journey
          </h2>
          <p className="mt-3 text-[#5B6B83]">
            From day-one registration to final-semester results — the portal
            keeps academics, finances and campus life connected.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="vcet-card vcet-card-hover p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#EAF2FC]">
                <f.icon className="size-5 text-[#0B3B78]" />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold text-[#0F2542]">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#5B6B83]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Campus strip ===== */}
      <section id="campus" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="vcet-card overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div
              className="min-h-[260px] bg-cover bg-center"
              style={{ backgroundImage: `url(${vcetCampus()})` }}
            />
            <div className="flex flex-col justify-center p-8 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#5BAA3C]">
                Life at VCET
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#0F2542] sm:text-3xl">
                Dream. Learn. Achieve.
              </h2>
              <p className="mt-3 leading-relaxed text-[#5B6B83]">
                Velalar College of Engineering and Technology in Erode, Tamil
                Nadu blends rigorous academics with a vibrant campus — symposiums,
                NSS, sports and 40+ student clubs.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-[#0F2542]">
                {[
                  "NAAC accredited with NBA-approved programs",
                  "Dedicated placement training from year one",
                  "24×7 digital library and e-journal access",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#5BAA3C]" />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <Button
                  asChild
                  className="rounded-lg bg-[#0B3B78] hover:bg-[#08315F]"
                >
                  <Link to="/register">
                    Join VCET <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA footer ===== */}
      <footer className="bg-[#06244A]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex flex-col items-center text-center">
            <VcetLogo light size={40} />
            <h2 className="mt-6 max-w-xl text-2xl font-bold text-white sm:text-3xl">
              Ready to see your campus in one place?
            </h2>
            <p className="mt-3 max-w-lg text-white/70">
              Sign in with your student ID or register a new account to get
              started. Parents can sign in for read-only access.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-lg bg-white px-7 font-semibold text-[#0B3B78] hover:bg-[#EAF2FC]"
              >
                <Link to="/login">Student login</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="rounded-lg bg-white/10 px-7 font-semibold text-white ring-1 ring-white/30 hover:bg-white/20"
              >
                <Link to="/register">New registration</Link>
              </Button>
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/50">
            © {new Date().getFullYear()} Velalar College of Engineering and
            Technology, Erode · Empowering the Next Generation
          </div>
        </div>
      </footer>
    </div>
  );
}
