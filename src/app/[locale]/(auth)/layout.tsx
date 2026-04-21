import { Link } from "@/i18n/navigation";
import { SchulabLogo } from "@/components/brand/schulab-logo";
import { AuroraBlobs } from "@/components/ui/aurora-blobs";
import {
  RocketIllustration,
  RobotIllustration,
  AtomIllustration,
  FloatingStar,
} from "@/components/illustrations/stem-icons";
import { Sparkles, Shield, Trophy, Star } from "lucide-react";

const highlights = [
  {
    icon: Trophy,
    title: "Gamified learning",
    body: "XP, streaks, badges & quests built-in.",
  },
  {
    icon: Sparkles,
    title: "Expert live tutors",
    body: "1:1 sessions with vetted STEM educators.",
  },
  {
    icon: Shield,
    title: "Safe for kids",
    body: "COPPA-ready, parent consent & moderation.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-background">
      {/* Two-column shell: marketing panel + form panel */}
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
        {/* ===== Left — Brand / marketing rail (hidden on mobile) ===== */}
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#0f1033] via-[#1a1852] to-[#2d1a5e] p-10 text-white lg:flex lg:flex-col">
          <AuroraBlobs variant="hero" />

          {/* Subtle dotted grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* Floating scene */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <FloatingStar size={18} className="absolute top-24 right-20 animate-sparkle opacity-60" />
            <FloatingStar size={14} className="absolute top-1/3 left-20 animate-sparkle opacity-40" style={{ animationDelay: "0.8s" }} />
            <FloatingStar size={20} className="absolute bottom-40 right-16 animate-sparkle opacity-50" style={{ animationDelay: "1.4s" }} />
            <div className="absolute right-10 top-20">
              <RocketIllustration size={140} className="opacity-90" />
            </div>
            <div className="absolute left-12 bottom-40">
              <RobotIllustration size={110} className="opacity-80" />
            </div>
            <div className="absolute right-24 bottom-24">
              <AtomIllustration size={96} className="opacity-70" />
            </div>
          </div>

          <div className="relative flex flex-col h-full">
            <Link href="/" className="inline-flex items-center gap-2 font-display text-xl font-extrabold">
              <SchulabLogo variant="tile" size={40} />
              <span>Schulab</span>
            </Link>

            <div className="mt-auto max-w-md">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-[#ff8a3d]" />
                Launch young minds
              </span>
              <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight">
                Where curiosity{" "}
                <span className="bg-[linear-gradient(90deg,#a5b4fc,#ff8a3d)] bg-clip-text text-transparent">
                  becomes confidence
                </span>
                .
              </h2>
              <p className="mt-4 text-white/70">
                Interactive STEM courses, live expert tutors and science kits
                designed for ages 3–18 — joyful for kids, reassuring for
                parents.
              </p>

              <ul className="mt-8 space-y-4">
                {highlights.map((h) => (
                  <li key={h.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
                      <h.icon className="h-4.5 w-4.5 text-[#ff8a3d]" />
                    </span>
                    <div>
                      <p className="font-semibold">{h.title}</p>
                      <p className="text-sm text-white/60">{h.body}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Social proof */}
              <div className="mt-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                <div className="flex -space-x-2">
                  {[
                    "from-pink-400 to-rose-500",
                    "from-amber-400 to-orange-500",
                    "from-emerald-400 to-cyan-500",
                    "from-violet-400 to-indigo-500",
                  ].map((g, i) => (
                    <span
                      key={i}
                      className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ring-2 ring-[#1a1852] text-[11px] font-bold text-white ${g}`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-0.5 text-amber-300">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-300" />
                    ))}
                    <span className="ms-1 font-semibold text-white">4.9</span>
                  </div>
                  <p className="text-xs text-white/60">
                    Loved by 5,000+ families in 30+ countries
                  </p>
                </div>
              </div>
            </div>

            <p className="relative mt-10 text-xs text-white/40">
              © {new Date().getFullYear()} Schulab. Launch young minds.
            </p>
          </div>
        </aside>

        {/* ===== Right — Form panel ===== */}
        <main className="relative flex items-center justify-center px-4 py-10 sm:px-8 lg:py-16">
          <div className="pointer-events-none absolute inset-0 lg:hidden">
            <AuroraBlobs variant="soft" />
          </div>

          {/* Mobile logo */}
          <Link
            href="/"
            className="absolute top-5 start-5 flex items-center gap-2 font-display text-lg font-extrabold lg:hidden"
          >
            <SchulabLogo variant="tile" size={36} />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Schulab
            </span>
          </Link>

          <div className="relative w-full max-w-md animate-slide-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
