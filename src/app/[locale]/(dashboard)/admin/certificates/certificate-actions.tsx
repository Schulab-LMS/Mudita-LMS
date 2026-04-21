"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminIssueCertificate, adminRevokeCertificate } from "@/actions/certificate.actions";

export function RevokeCertificateButton({ certificateId }: { certificateId: string }) {
  const tCert = useTranslations("admin.certificates");
  const tActions = useTranslations("admin.actions");
  const tCommon = useTranslations("admin.common");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleRevoke() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setLoading(true);
    const result = await adminRevokeCertificate(certificateId);
    if (!result.success) {
      alert(result.error ?? tActions("revokeFailed"));
    }
    setLoading(false);
    setConfirming(false);
  }

  return (
    <div className="flex items-center gap-1">
      {confirming && (
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={loading}>
          {tCommon("cancel")}
        </Button>
      )}
      <Button
        size="sm"
        variant={confirming ? "destructive" : "ghost"}
        onClick={handleRevoke}
        disabled={loading}
        title={tCert("revokeConfirm")}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
        {confirming ? tCommon("confirm") : ""}
      </Button>
    </div>
  );
}

export function IssueCertificateForm() {
  const tCert = useTranslations("admin.certificates");
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim() || !courseId.trim()) return;

    setLoading(true);
    setMessage(null);
    const result = await adminIssueCertificate(userId.trim(), courseId.trim());

    if (result.success) {
      setMessage({ type: "success", text: tCert("issueSuccess") });
      setUserId("");
      setCourseId("");
    } else {
      setMessage({ type: "error", text: result.error ?? tCert("issueFailed") });
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">{tCert("userIdLabel")}</label>
        <Input
          placeholder={tCert("userIdLabel")}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="h-9 w-48"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">{tCert("courseIdLabel")}</label>
        <Input
          placeholder={tCert("courseIdLabel")}
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="h-9 w-48"
        />
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {tCert("issueButton")}
      </Button>
      {message && (
        <span className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </span>
      )}
    </form>
  );
}
