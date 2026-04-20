"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { generateReactHelpers } from "@uploadthing/react";
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface ImageUploadProps {
  endpoint: keyof OurFileRouter;
  value: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
  label?: string;
  aspectRatio?: "video" | "square";
}

export function ImageUpload({
  endpoint,
  value,
  onUpload,
  onRemove,
  label = "Upload Image",
  aspectRatio = "video",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        const url = res[0].ufsUrl ?? res[0].url;
        if (url) onUpload(url);
      }
    },
    onUploadError: (err) => {
      setError(err.message ?? "Upload failed");
    },
  });

  const aspectClass = aspectRatio === "square" ? "aspect-square" : "aspect-video";

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border">
        <div className={`relative ${aspectClass} w-full overflow-hidden`}>
          <Image
            src={value}
            alt="Thumbnail preview"
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/20" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition-colors hover:bg-red-50 hover:text-red-600"
            title="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-2">
          <span className="text-xs text-muted-foreground truncate">Image uploaded</span>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Replace"}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setError(null);
              startUpload([file]);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={`relative flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary disabled:opacity-60 ${aspectClass}`}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm font-medium">Uploading...</span>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="h-6 w-6" />
            </div>
            <div className="text-center">
              <span className="text-sm font-medium">{label}</span>
              <p className="mt-0.5 text-xs">Click to browse · PNG, JPG, WebP</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white">
              <Upload className="h-3.5 w-3.5" />
              Browse
            </div>
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setError(null);
            startUpload([file]);
          }
        }}
      />
    </div>
  );
}
