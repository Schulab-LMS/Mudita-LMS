"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { verifyEmail, sendVerificationEmail } from "@/actions/email-verification.actions";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const t = useTranslations("auth");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">(
    token ? "loading" : "no-token"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) return;

    verifyEmail(token).then((result) => {
      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(result.error || t("verifyFailed"));
      }
    });
  }, [token, t]);

  async function handleResend() {
    if (!email) return;
    setResending(true);
    await sendVerificationEmail(email);
    setResending(false);
    setResent(true);
  }

  if (status === "loading") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="text-xl font-semibold">{t("verifying")}</h2>
        </CardContent>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <h2 className="text-xl font-semibold">{t("emailVerified")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("emailVerifiedBody")}
          </p>
          <Link href="/login">
            <Button>{t("goToLogin")}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <XCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold">{t("verifyFailed")}</h2>
          <p className="text-sm text-muted-foreground">{errorMsg}</p>
          {email && (
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={resending || resent}
            >
              {resending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : resent ? (
                t("sent")
              ) : (
                t("resendVerification")
              )}
            </Button>
          )}
          <Link href="/login">
            <Button variant="ghost">{t("backToLogin")}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <Mail className="h-12 w-12 text-primary" />
        <h2 className="text-xl font-semibold">{t("checkEmail")}</h2>
        <p className="text-sm text-muted-foreground">
          {email
            ? t.rich("verifyLinkSent", {
                email,
                strong: (chunks) => <strong>{chunks}</strong>,
              })
            : t("verifyLinkSentGeneric")}
        </p>
        {email && !resent && (
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("resendVerification")
            )}
          </Button>
        )}
        {resent && (
          <p className="text-sm text-green-600">{t("verificationResent")}</p>
        )}
        <Link href="/login">
          <Button variant="ghost">{t("backToLogin")}</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
