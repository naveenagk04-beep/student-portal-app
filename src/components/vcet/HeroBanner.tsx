import campus from "@/assets/campus.svg";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

export function HeroBanner({
  name,
  parentMode = false,
}: {
  name: string;
  parentMode?: boolean;
}) {
  const firstName = name.split(" ")[0];
  return (
    <section
      className="relative overflow-hidden rounded-2xl"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(6,36,74,0.82) 0%, rgba(6,36,74,0.45) 45%, rgba(6,36,74,0.15) 100%), url(${campus})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex min-h-[190px] flex-col justify-center gap-2 p-6 md:min-h-[210px] md:p-8">
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          {parentMode ? "Welcome, Parent!" : `Welcome, ${firstName}!`}
        </h1>
        <p className="text-sm text-white/85 md:text-base">
          {parentMode
            ? "Track your child's progress, attendance and fees."
            : "Keep going. Great things take time."}
        </p>
        <div className="mt-1 h-1 w-14 rounded-full bg-[#5BAA3C]" />
      </div>
      <p className="font-hand absolute right-5 top-1/2 hidden -translate-y-1/2 rotate-[-8deg] text-right text-xl leading-tight text-white/90 sm:block md:text-2xl">
        Dream
        <br />
        Learn
        <br />
        Achieve
      </p>
      <div className="absolute bottom-4 right-4 hidden md:block">
        <Button
          size="sm"
          variant="secondary"
          className="gap-1.5 bg-white/15 text-white backdrop-blur hover:bg-white/25"
          asChild
        >
          <Link to="/attendance">
            View Attendance
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
