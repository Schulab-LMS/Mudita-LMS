"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import {
  confirmDirectUpload,
  createDirectUploadTicket,
  detachAndDeleteVideoAsset,
} from "@/actions/video.actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// Admin-side video uploader. Three states matter to the caller:
// - no asset yet → show file picker, hand back assetId once upload finishes
// - asset attached → show "Replace" / "Remove" controls
// - errored → surface message, allow retry
//
// Upload happens directly to Mux from the browser (PUT to a signed URL),
// keeping the file off our server entirely.

interface Props {
  initialAssetId?: string | null;
  // Fires once upload + status confirmation succeeds. Parent persists the id.
  onAssetReady: (assetId: string) => void;
  onAssetCleared?: () => void;
  // Optional: associate with an existing lesson so server-side detach can
  // null out the FK in the same call.
  lessonId?: string;
}

type LocalState =
  | { kind: "idle" }
  | { kind: "creating" }
  | { kind: "uploading"; progress: number; assetId: string }
  | { kind: "confirming"; assetId: string }
  | { kind: "ready"; assetId: string; status: "PROCESSING" | "READY" }
  | { kind: "error"; message: string };

async function putWithProgress(
  url: string,
  file: File,
  onProgress: (pct: number) => void,
  translations: { networkError: string; withStatus: (status: number) => string }
): Promise<void> {
  // Use XHR — fetch doesn't expose upload progress events.
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(translations.withStatus(xhr.status)));
    };
    xhr.onerror = () => reject(new Error(translations.networkError));
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.send(file);
  });
}

export function VideoUpload({
  initialAssetId,
  onAssetReady,
  onAssetCleared,
  lessonId,
}: Props) {
  const t = useTranslations("admin.videoUpload");
  const tActions = useTranslations("admin.actions");
  const tCommon = useTranslations("admin.common");
  const tConfirm = useTranslations("admin.confirm.removeVideo");
  const [state, setState] = useState<LocalState>(
    initialAssetId
      ? { kind: "ready", assetId: initialAssetId, status: "READY" }
      : { kind: "idle" }
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleFile(file: File) {
    setState({ kind: "creating" });
    const ticket = await createDirectUploadTicket({});
    if (!ticket.success) {
      setState({ kind: "error", message: ticket.error });
      return;
    }

    setState({ kind: "uploading", progress: 0, assetId: ticket.assetId });
    try {
      await putWithProgress(
        ticket.uploadUrl,
        file,
        (pct) => setState({ kind: "uploading", progress: pct, assetId: ticket.assetId }),
        {
          networkError: t("networkError"),
          withStatus: (status) => t("uploadFailedWithStatus", { status }),
        }
      );
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : t("uploadFailedGeneric"),
      });
      return;
    }

    setState({ kind: "confirming", assetId: ticket.assetId });
    const confirm = await confirmDirectUpload({ assetId: ticket.assetId });
    if (!confirm.success) {
      setState({ kind: "error", message: confirm.error });
      return;
    }
    if (confirm.status === "ERROR") {
      setState({
        kind: "error",
        message: t("muxReportedFailed"),
      });
      return;
    }

    setState({
      kind: "ready",
      assetId: ticket.assetId,
      status: confirm.status === "PROCESSING" ? "PROCESSING" : "PROCESSING",
    });
    onAssetReady(ticket.assetId);
  }

  async function handleRemove() {
    if (state.kind !== "ready") return;
    const res = await detachAndDeleteVideoAsset({
      assetId: state.assetId,
      lessonId,
    });
    setConfirmOpen(false);
    if (!res.success) {
      setState({ kind: "error", message: res.error });
      return;
    }
    setState({ kind: "idle" });
    onAssetCleared?.();
  }

  if (state.kind === "ready") {
    return (
      <>
        <div className="rounded-lg border border-input bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-medium">{t("uploaded")}</span>
              {state.status === "PROCESSING" && (
                <span className="text-xs text-muted-foreground">{t("processing")}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="text-xs text-red-600 hover:underline"
            >
              {tActions("remove")}
            </button>
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            {state.assetId}
          </p>
        </div>
        <ConfirmDialog
          open={confirmOpen}
          title={tConfirm("title")}
          description={tConfirm("body")}
          confirmLabel={tConfirm("confirm")}
          cancelLabel={tCommon("cancel")}
          onConfirm={handleRemove}
          onCancel={() => setConfirmOpen(false)}
          variant="destructive"
        />
      </>
    );
  }

  if (state.kind === "uploading") {
    return (
      <div className="rounded-lg border border-input bg-background p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">{t("uploading")}</span>
          <span className="text-xs text-muted-foreground">{state.progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${state.progress}%` }}
          />
        </div>
      </div>
    );
  }

  if (state.kind === "creating" || state.kind === "confirming") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-input bg-background p-4 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        {state.kind === "creating" ? t("creatingTicket") : t("confirming")}
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p>{state.message}</p>
            <button
              type="button"
              onClick={() => setState({ kind: "idle" })}
              className="mt-1 text-xs underline"
            >
              {t("tryAgain")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input bg-background p-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
      <UploadCloud className="h-6 w-6" />
      <span className="font-medium">{t("clickToUpload")}</span>
      <span className="text-xs">{t("formatsHint")}</span>
      <input
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          // Reset so the same file can be re-selected after error.
          e.currentTarget.value = "";
        }}
      />
    </label>
  );
}
