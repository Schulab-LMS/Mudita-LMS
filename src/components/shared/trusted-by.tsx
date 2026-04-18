import { Marquee } from "@/components/ui/marquee";

const partners = [
  { name: "NASA STEM", tag: "Education Partner" },
  { name: "MIT OCW", tag: "Curriculum Ally" },
  { name: "Code.org", tag: "Coding Partner" },
  { name: "UNESCO", tag: "Advocate" },
  { name: "Khan Academy", tag: "Community" },
  { name: "RaspberryPi", tag: "Hardware Ally" },
  { name: "Minecraft Edu", tag: "Play Partner" },
  { name: "LEGO Education", tag: "Maker Partner" },
];

/**
 * A tasteful "as seen in / used by" strip. Uses text-only logos for now —
 * swap in real <Image> assets when brand approvals land.
 */
export function TrustedBy() {
  return (
    <section className="border-y border-border/60 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Trusted by educators & partners worldwide
        </p>
        <div className="mt-6">
          <Marquee speed={45}>
            {partners.map((p) => (
              <div
                key={p.name}
                className="flex shrink-0 items-center gap-3 rounded-full border border-border/60 bg-muted/30 px-5 py-2.5 text-sm"
              >
                <span className="font-display font-bold text-foreground/80">
                  {p.name}
                </span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span className="text-xs text-muted-foreground">{p.tag}</span>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
