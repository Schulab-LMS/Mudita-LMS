import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AccountForms } from "./account-forms";

export const metadata = { title: "Account | Schulab" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      locale: true,
      role: true,
      passwordHash: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, password, and privacy. Changes here apply
          immediately.
        </p>
      </div>

      <AccountForms
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          locale: user.locale,
          role: user.role,
          hasPassword: Boolean(user.passwordHash),
          createdAt: user.createdAt.toISOString(),
        }}
      />
    </div>
  );
}
