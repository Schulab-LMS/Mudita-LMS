import "next-auth";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: string;
      // Null when the user has no tenant — they see global content only.
      // See src/lib/tenant.ts for the enforcement model.
      organizationId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}
