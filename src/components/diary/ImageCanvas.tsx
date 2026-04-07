"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import DraggableImage from "./DraggableImage";
import { createImageRecord } from "@/lib/actions/images";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { EntryImage } from "@/types";

interface ImageCanvasProps {
  entryId: string;
  images: EntryImage[];           // controlled from parent
  onImagesChange: (imgs: EntryImage[]) => void;
  editable: boolean;
}

export default function ImageCanvas({ entryId, images, onImagesChange, editable }: ImageCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [zMap, setZMap] = useState<Record<string, number>>(
    () => Object.fromEntries(images.map((img, i) => [img.id, i + 1]))
  );
  const maxZRef = useRef(images.length + 1);

  function bringToFront(id: string) {
    maxZRef.current += 1;
    setZMap((prev) => ({ ...prev, [id]: maxZRef.current }));
  }

  function handleDelete(id: string) {
    onImagesChange(images.filter((img) => img.id !== id));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8 MB");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop() ?? "jpg";
      const storagePath = `${user.id}/${entryId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("diary-images")
        .upload(storagePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from("diary-images")
        .getPublicUrl(storagePath);

      const x = 4 + Math.random() * 18;
      const y = 4 + Math.random() * 15;
      const rotation = (Math.random() * 12) - 6;

      const newImage = await createImageRecord({ entryId, url: publicUrl, storagePath, x, y, rotation });
      const img = newImage as EntryImage;

      maxZRef.current += 1;
      setZMap((prev) => ({ ...prev, [img.id]: maxZRef.current }));
      onImagesChange([...images, img]);
      toast.success("Photo added!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (images.length === 0 && !editable) return null;

  return (
    <>
      <div
        ref={canvasRef}
        className="absolute inset-0"
        style={{ pointerEvents: "none", minHeight: "100%" }}
      >
        {images.map((img) => (
          <DraggableImage
            key={img.id}
            image={img}
            editable={editable}
            containerRef={canvasRef}
            onDelete={handleDelete}
            zIndex={zMap[img.id] ?? 1}
            onBringToFront={bringToFront}
          />
        ))}
      </div>

      {editable && (
        <div className="relative z-10">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border bg-card/60 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-card transition-colors"
            title="Add a photo or GIF to this page"
          >
            {uploading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <ImagePlus className="h-4 w-4" />}
            {uploading ? "Uploading…" : "Add photo / GIF"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}
    </>
  );
}
