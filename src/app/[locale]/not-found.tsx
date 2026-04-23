import { Link } from "@/i18n/navigation";
import { NotFoundScene } from "@/components/illustrations/empty-scenes";
import {
  Home,
  BookOpen,
  HelpCircle,
  Search as SearchIcon,
  ArrowRight,
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative overflow-hidden bg-launch-gradient-soft">
      <div className="aurora-bg opacity-40" aria-hidden />
      <div className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <NotFoundScene className="text-primary" />

        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Lost in space?
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved. Here are some helpful places to jump to.
        </p>

        {/* Search */}
        <form
          action="/courses"
          method="get"
          className="mx-auto mt-6 flex w-full max-w-md items-center gap-2"
        >
          <div className="relative flex-1">
            <SearchIcon
              className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              name="q"
              type="search"
              placeholder="Search courses…"
              className="input-pretty h-11 w-full rounded-xl border border-border bg-card ps-10 pe-4 text-sm shadow-soft focus-visible:outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-launch-gradient px-5 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
          >
            Search
          </button>
        </form>

        {/* Suggested destinations */}
        <div className="mx-auto mt-8 grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
          <DestinationCard
            href="/"
            icon={<Home className="h-4 w-4" />}
            label="Home"
          />
          <DestinationCard
            href="/courses"
            icon={<BookOpen className="h-4 w-4" />}
            label="Courses"
          />
          <DestinationCard
            href="/help"
            icon={<HelpCircle className="h-4 w-4" />}
            label="Help Center"
          />
        </div>

        <p className="mt-6 text-xs text-muted-foreground">Error code: 404</p>
      </div>
    </div>
  );
}

function DestinationCard({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="card-premium group flex items-center gap-2 p-3 transition-all hover:-translate-y-0.5"
    >
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="flex-1 text-sm font-semibold text-foreground">
        {label}
      </span>
      <ArrowRight
        className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
