import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { db } from "./db";
import { rateLimit, AUTH_RATE_LIMIT } from "./rate-limit";
import { PRIVACY_VERSION, TERMS_VERSION } from "./compliance";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).trim().toLowerCase();
        const rl = rateLimit(`auth:login:${email}`, AUTH_RATE_LIMIT);
        if (!rl.success) return null;

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email!.trim().toLowerCase();
        const existingUser = await db.user.findUnique({
          where: { email },
        });

        if (!existingUser) {
          // Capture IP/UA at the moment of first OAuth sign-in so the consent
          // records we write below have a real audit trail. `headers()` is
          // available here because Auth.js runs this callback inside the
          // /api/auth/callback/google request.
          const h = await headers().catch(() => null);
          const ipAddress =
            h?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            h?.get("x-real-ip") ??
            undefined;
          const userAgent = h?.get("user-agent") ?? undefined;

          // OAuth signup is "sign-up by clicking Google" — the consent screen
          // that Google showed linked to our Terms and Privacy Policy. Record
          // that agreement here in the same transaction as the user row so
          // we never end up with an account that has no consent paper trail.
          // Minor/DOB capture still happens downstream in the onboarding flow
          // — a STUDENT without a dateOfBirth is treated as "age undeclared"
          // by assertMinorConsent and cannot enrol or purchase until they
          // complete their profile.
          await db.$transaction(async (tx) => {
            const created = await tx.user.create({
              data: {
                email,
                name: user.name || "User",
                avatar: user.image,
                emailVerified: new Date(),
                role: "STUDENT",
              },
            });
            await tx.consentRecord.createMany({
              data: [
                {
                  userId: created.id,
                  type: "TERMS_OF_SERVICE",
                  version: TERMS_VERSION,
                  granted: true,
                  ipAddress,
                  userAgent,
                },
                {
                  userId: created.id,
                  type: "PRIVACY_POLICY",
                  version: PRIVACY_VERSION,
                  granted: true,
                  ipAddress,
                  userAgent,
                },
              ],
            });
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await db.user.findUnique({
          where: { email: user.email!.trim().toLowerCase() },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
