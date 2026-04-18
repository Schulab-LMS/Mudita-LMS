import { FlaskConical } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-lime-50 px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <FlaskConical className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold text-primary">Schulab</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
