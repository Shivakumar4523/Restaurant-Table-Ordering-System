import { ChangeEvent, useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { resolveAssetUrl } from "@/lib/api";

export function ImageUploader({
  initialUrl,
  label = "Upload drink image"
}: {
  initialUrl?: string;
  label?: string;
}) {
  const [preview, setPreview] = useState(resolveAssetUrl(initialUrl));

  useEffect(() => {
    setPreview(resolveAssetUrl(initialUrl));
  }, [initialUrl]);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="rounded-[8px] border border-gold-300/20 bg-white/5 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="grid aspect-[4/3] w-full max-w-40 place-items-center overflow-hidden rounded-[8px] border border-gold-300/20 bg-black/40 sm:w-36">
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="text-gold-300" size={32} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-white">{label}</p>
          <p className="mt-1 text-xs font-bold text-white/60">PNG, JPG, or WEBP up to 4MB.</p>
          <label className="mt-3 inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-gold-300 px-4 text-sm font-black text-forest-900 transition hover:bg-gold-500">
            Choose image
            <input className="sr-only" type="file" name="imageFile" accept="image/*" onChange={handleFile} />
          </label>
          {preview ? (
            <Button type="button" variant="ghost" className="ml-2 h-10 min-h-10 border-white/10 bg-white/5 px-3 text-white" onClick={() => setPreview("")} aria-label="Clear image preview">
              <X size={16} />
            </Button>
          ) : null}
        </div>
      </div>
      <input type="hidden" name="image" defaultValue={initialUrl || ""} />
    </div>
  );
}

