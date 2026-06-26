"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/actions/product.actions";
import { AGE_GROUPS } from "@/lib/constants";

const CATEGORIES = ["ROBOTICS", "ELECTRONICS", "SCIENCE", "CODING", "ENGINEERING", "ART"];
const STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" },
  { value: "DISCONTINUED", label: "Discontinued" },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    name: string;
    nameAr?: string | null;
    nameDe?: string | null;
    slug: string;
    description: string;
    descriptionAr?: string | null;
    descriptionDe?: string | null;
    price: number;
    ageGroup: string;
    category: string;
    stock: number;
    status: string;
  };
}

export default function ProductForm({ mode, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [lang, setLang] = useState<"en" | "ar" | "de">("en");

  const [name, setName] = useState(initialData?.name ?? "");
  const [nameAr, setNameAr] = useState(initialData?.nameAr ?? "");
  const [nameDe, setNameDe] = useState(initialData?.nameDe ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [descriptionAr, setDescriptionAr] = useState(initialData?.descriptionAr ?? "");
  const [descriptionDe, setDescriptionDe] = useState(initialData?.descriptionDe ?? "");
  const [price, setPrice] = useState(initialData?.price ?? 0);
  const [ageGroup, setAgeGroup] = useState(initialData?.ageGroup ?? "AGES_5_7");
  const [category, setCategory] = useState(initialData?.category ?? "ROBOTICS");
  const [stock, setStock] = useState(initialData?.stock ?? 0);
  const [status, setStatus] = useState(initialData?.status ?? "ACTIVE");

  function handleNameChange(value: string) {
    setName(value);
    if (mode === "create") setSlug(slugify(value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !description.trim()) {
      setError("Name and description are required");
      return;
    }

    startTransition(async () => {
      const data = {
        name, nameAr, nameDe, slug, description, descriptionAr, descriptionDe,
        price, ageGroup, category, stock, status,
      };

      const result = mode === "create"
        ? await createProduct(data)
        : await updateProduct(initialData!.id, data);

      if (!result.success) {
        setError(result.error ?? "Something went wrong");
      } else {
        router.push("/en/admin/products");
      }
    });
  }

  const langTabs = [
    { key: "en" as const, label: "EN" },
    { key: "ar" as const, label: "AR" },
    { key: "de" as const, label: "DE" },
  ];

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {mode === "create" ? "New Product" : "Edit Product"}
        </h1>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Language tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {langTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setLang(t.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              lang === t.key ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 rounded-xl border bg-white p-6">
        {/* Name */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Product Name {lang === "en" ? "" : `(${lang.toUpperCase()})`}
          </label>
          {lang === "en" && (
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="e.g. Robotics Starter Kit"
            />
          )}
          {lang === "ar" && (
            <input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              dir="rtl"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Arabic name"
            />
          )}
          {lang === "de" && (
            <input
              value={nameDe}
              onChange={(e) => setNameDe(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="German name"
            />
          )}
        </div>

        {/* Slug (EN only) */}
        {lang === "en" && (
          <div>
            <label className="mb-1 block text-sm font-medium">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm font-mono"
              placeholder="auto-generated-from-name"
            />
          </div>
        )}

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Description {lang === "en" ? "" : `(${lang.toUpperCase()})`}
          </label>
          {lang === "en" && (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Product description..."
            />
          )}
          {lang === "ar" && (
            <textarea
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              rows={4}
              dir="rtl"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Arabic description"
            />
          )}
          {lang === "de" && (
            <textarea
              value={descriptionDe}
              onChange={(e) => setDescriptionDe(e.target.value)}
              rows={4}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="German description"
            />
          )}
        </div>

        {/* Price + Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Price (USD)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Stock</label>
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Age Group + Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Age Group</label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              {AGE_GROUPS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
}
