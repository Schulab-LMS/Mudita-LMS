import { redirect } from "next/navigation";

export default async function LegacyVerifyRedirect({
  params,
}: {
  params: Promise<{ code: string; locale: string }>;
}) {
  const { code, locale } = await params;
  // The verify page moved to /certificates/verify/[code]. Keep this route
  // working so QR codes / printed certificates issued before the move still
  // resolve — just forward to the upgraded page.
  redirect(`/${locale}/certificates/verify/${code}`);
}
