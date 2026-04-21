"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { createPermission } from "@/actions/role.actions";

const RESOURCES = [
  "courses",
  "users",
  "products",
  "pages",
  "tutors",
  "bookings",
  "badges",
  "competitions",
  "settings",
  "roles",
  "enrollments",
  "notifications",
];

const ACTIONS = ["create", "read", "update", "delete", "manage"];

export function AddPermissionForm() {
  const t = useTranslations("admin.rolesPage");
  const tCommon = useTranslations("admin.common");
  const [resource, setResource] = useState("");
  const [action, setAction] = useState("");
  const [description, setDescription] = useState("");
  const [customResource, setCustomResource] = useState("");
  const [customAction, setCustomAction] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const finalResource = resource === "__custom" ? customResource : resource;
  const finalAction = action === "__custom" ? customAction : action;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!finalResource || !finalAction) return;

    const name = `${finalResource}.${finalAction}`;
    const desc = description || `${finalAction} ${finalResource}`;

    startTransition(async () => {
      const result = await createPermission({
        name,
        description: desc,
        resource: finalResource,
        action: finalAction,
      });
      if (result.success) {
        setMessage({ type: "success", text: t("createdMessage") });
        setResource("");
        setAction("");
        setDescription("");
        setCustomResource("");
        setCustomAction("");
      } else {
        setMessage({ type: "error", text: result.error ?? tCommon("genericError") });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className="mb-1 block text-sm font-medium">{t("resourceLabel")}</label>
        <select
          value={resource}
          onChange={(e) => setResource(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          <option value="">{t("selectPlaceholder")}</option>
          {RESOURCES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
          <option value="__custom">{t("customOption")}</option>
        </select>
        {resource === "__custom" && (
          <input
            type="text"
            placeholder={t("customResourcePlaceholder")}
            value={customResource}
            onChange={(e) => setCustomResource(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">{t("actionLabel")}</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          <option value="">{t("selectPlaceholder")}</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
          <option value="__custom">{t("customOption")}</option>
        </select>
        {action === "__custom" && (
          <input
            type="text"
            placeholder={t("customActionPlaceholder")}
            value={customAction}
            onChange={(e) => setCustomAction(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">{t("descriptionLabel")}</label>
        <input
          type="text"
          placeholder={finalResource && finalAction ? `${finalAction} ${finalResource}` : t("descriptionPlaceholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={pending || !finalResource || !finalAction}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? t("addingButton") : t("addButton")}
        </button>
      </div>

      {message && (
        <div className={`col-span-full text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </div>
      )}
    </form>
  );
}
