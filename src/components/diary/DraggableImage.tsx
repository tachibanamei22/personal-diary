"use client";

import { useState, useRef, useCallback } from "react";
import { X, RotateCw } from "lucide-react";
import { updateImageTransform, deleteImage } from "@/lib/actions/images";
import { toast } from "sonner";
import type { EntryImage } from "@/types";

interface DraggableImageProps {
  image: EntryImage;
  editable: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onDelete: (id: string) => void;
  zIndex: number;
  onBringToFront: (id: string) => void;
}

export default function DraggableImage({
  image,
  editable,
  containerRef,
  onDelete,
  zIndex,
  onBringToFront,
}: DraggableImageProps) {
  // Use a ref for position during drag (no re-render lag), state for display
  const posRef = useRef({ x: image.x, y: image.y, rotation: image.rotation });
  const [renderPos, setRenderPos] = useState(posRef.current);
  const [hovered, setHovered] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cursor, setCursor] = useState<"grab" | "grabbing">("grab");

  const frameRef = useRef<HTMLDivElement>(null);

  // Drag state
  const drag = useRef({ active: false, startMouseX: 0, startMouseY: 0, startX: 0, startY: 0 });
  // Rotate state
  const rotate = useRef({ active: false, centerX: 0, centerY: 0, startAngle: 0, startRotation: 0 });

  const saveTransform = useCallback(async () => {
    const { x, y, rotation } = posRef.current;
    try {
      await updateImageTransform(image.id, x, y, rotation);
    } catch {
      toast.error("Failed to save position");
    }
  }, [image.id]);

  // ── Drag handlers (on the polaroid frame) ──────────────
  function onFramePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!editable) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    onBringToFront(image.id);
    drag.current = {
      active: true,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: posRef.current.x,
      startY: posRef.current.y,
    };
    setCursor("grabbing");
    document.body.style.cursor = "grabbing";
  }

  function onFramePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const newX = Math.max(0, Math.min(85, drag.current.startX + ((e.clientX - drag.current.startMouseX) / rect.width) * 100));
    const newY = Math.max(0, Math.min(88, drag.current.startY + ((e.clientY - drag.current.startMouseY) / rect.height) * 100));
    posRef.current = { ...posRef.current, x: newX, y: newY };
    setRenderPos({ ...posRef.current });
  }

  function onFramePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    drag.current.active = false;
    setCursor("grab");
    document.body.style.cursor = "";
    saveTransform();
  }

  // ── Rotate handlers (on the rotate handle) ─────────────
  function onRotatePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    rotate.current = {
      active: true,
      centerX,
      centerY,
      startAngle: Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI),
      startRotation: posRef.current.rotation,
    };
    document.body.style.cursor = "grabbing";
  }

  function onRotatePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!rotate.current.active) return;
    const dx = e.clientX - rotate.current.centerX;
    const dy = e.clientY - rotate.current.centerY;
    const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    const delta = currentAngle - rotate.current.startAngle;
    const newRotation = rotate.current.startRotation + delta;
    posRef.current = { ...posRef.current, rotation: newRotation };
    setRenderPos({ ...posRef.current });
  }

  function onRotatePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!rotate.current.active) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    rotate.current.active = false;
    document.body.style.cursor = "";
    saveTransform();
  }

  // ── Delete ──────────────────────────────────────────────
  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setDeleting(true);
    try {
      await deleteImage(image.id, image.storage_path);
      onDelete(image.id);
    } catch {
      toast.error("Failed to remove image");
      setDeleting(false);
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        left: `${renderPos.x}%`,
        top: `${renderPos.y}%`,
        transform: `rotate(${renderPos.rotation}deg)`,
        zIndex,
        pointerEvents: editable ? "auto" : "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "none",
        // Smooth rotation transition only when not actively rotating
        transition: rotate.current.active || drag.current.active ? "none" : "box-shadow 0.15s",
      }}
      onMouseEnter={() => editable && setHovered(true)}
      onMouseLeave={() => editable && setHovered(false)}
    >
      {/* ── Polaroid frame ─────────────────────────────── */}
      <div
        ref={frameRef}
        onPointerDown={onFramePointerDown}
        onPointerMove={onFramePointerMove}
        onPointerUp={onFramePointerUp}
        style={{
          width: "180px",
          padding: "8px 8px 38px 8px",
          background: "#faf7f2",   // warm off-white paper, same in dark mode
          boxShadow: hovered && editable
            ? "0 8px 24px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12)"
            : "0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08)",
          cursor: editable ? cursor : "default",
          transition: "box-shadow 0.15s",
        }}
      >
        {/* Image — regular <img> so GIFs animate */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt=""
          style={{
            width: "100%",
            height: "164px",
            objectFit: "cover",
            display: "block",
            // Desaturate slightly for that vintage feel
            filter: "saturate(0.92) contrast(1.04)",
          }}
          draggable={false}
        />
      </div>

      {/* ── Edit controls (visible on hover in edit mode) ─ */}
      {editable && hovered && (
        <>
          {/* Delete button */}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleDelete}
            disabled={deleting}
            className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
            title="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Rotate handle */}
          <div
            onPointerDown={onRotatePointerDown}
            onPointerMove={onRotatePointerMove}
            onPointerUp={onRotatePointerUp}
            className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
            style={{ cursor: "grab" }}
            title="Rotate"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </div>

          {/* Subtle drag hint border */}
          <div
            className="absolute inset-0 rounded-sm ring-2 ring-primary/30 ring-offset-0 pointer-events-none"
            style={{ zIndex: -1 }}
          />
        </>
      )}
    </div>
  );
}
