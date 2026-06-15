export const siteConfig = {
  name: "Schulab",
  // Stable brand domain — used for the content-protection watermark and any
  // other place that needs the public hostname regardless of the deploy env
  // (siteConfig.url is localhost in dev).
  domain: "schulab.com",
  tagline: "Launch Young Minds.",
  description:
    "Schulab launches young minds — a STEM platform for curious kids ages 3–18. Interactive courses, live expert tutoring, and hands-on science kits.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  links: {
    github: "https://github.com/schulab",
  },
};
