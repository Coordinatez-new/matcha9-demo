"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import type { UploadResult } from "@/lib/forms";
import type { ImageRef, LibraryImage } from "@/lib/menu";
import { imageSrc } from "@/lib/paths";
import { CloseIcon, Plus } from "@/components/ui/icons";
import { adminButton } from "./ui";

/** A photo field: shows the current image, and opens the library to pick or upload another. */
export function ImageField({
  label,
  hint,
  value,
  onChange,
  library,
  onUpload,
  onUploaded,
  kind,
}: {
  label: string;
  hint: string;
  value: ImageRef | null;
  onChange: (image: ImageRef | null) => void;
  library: LibraryImage[];
  onUpload: (form: FormData) => Promise<UploadResult>;
  onUploaded: (image: LibraryImage) => void;
  /** Studio shots sit on white and blend into the page; bar photos fill their frame. */
  kind: "product" | "photo";
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const upload = (file: File) => {
    setError(null);
    const form = new FormData();
    form.set("file", file);
    startTransition(async () => {
      const result = await onUpload(form);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onUploaded(result.image);
      onChange({ src: result.image.src, width: result.image.width, height: result.image.height });
      setOpen(false);
    });
  };

  return (
    <div>
      <p className="text-sm font-medium text-ink">{label}</p>
      <p className="mt-0.5 text-xs text-ink-soft">{hint}</p>
      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-cream transition-colors hover:border-moss/40"
          aria-label={value ? `Change ${label.toLowerCase()}` : `Choose ${label.toLowerCase()}`}
        >
          {value ? (
            <Image
              src={imageSrc(value.src)}
              alt=""
              fill
              sizes="112px"
              className={
                kind === "product" ? "object-contain p-2 mix-blend-multiply" : "object-cover"
              }
            />
          ) : (
            <Plus className="size-6 text-sage" />
          )}
        </button>
        <div className="flex flex-col items-start gap-2">
          <button type="button" onClick={() => setOpen(true)} className={adminButton.secondary}>
            {value ? "Change photo" : "Choose a photo"}
          </button>
          {value && (
            <button type="button" onClick={() => onChange(null)} className={adminButton.ghost}>
              Remove
            </button>
          )}
        </div>
      </div>

      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-xl border border-line bg-paper p-0 text-ink shadow-2xl backdrop:bg-forest/40"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-2xl">{label}</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={adminButton.icon}
            aria-label="Close"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <label
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-moss/30 bg-cream px-6 py-8 text-center transition-colors hover:border-moss",
              pending && "pointer-events-none opacity-60",
            )}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file);
                e.target.value = "";
              }}
            />
            <span className="font-medium text-moss">
              {pending ? "Uploading…" : "Upload a new photo"}
            </span>
            <span className="mt-1 text-xs text-ink-soft">
              JPG, PNG or WebP up to 10 MB. It’s resized and optimised automatically.
            </span>
          </label>
          {error && <p className="mt-3 text-sm text-terracotta-deep">{error}</p>}

          <p className="mt-6 text-xs font-medium text-ink-soft">Or pick one from the library</p>
          <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {library.map((img) => {
              const selected = value?.src === img.src;
              return (
                <li key={img.src}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ src: img.src, width: img.width, height: img.height });
                      setOpen(false);
                    }}
                    title={img.label}
                    className={cn(
                      "relative block aspect-square w-full overflow-hidden rounded-md border bg-cream transition-colors",
                      selected
                        ? "border-moss ring-2 ring-moss/30"
                        : "border-line hover:border-moss/40",
                    )}
                  >
                    <Image
                      src={imageSrc(img.src)}
                      alt={img.label}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </dialog>
    </div>
  );
}
