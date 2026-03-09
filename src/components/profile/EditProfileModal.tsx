"use client";

import * as React from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  address: string;
  currentNickname: string;
  currentPic: string | null;
  onSave: (data: { nickname: string; profilePic: string | null }) => void;
}

/* ── Content filter ─────────────────────────────────────────────── */

async function checkImageSafe(file: File): Promise<{ safe: boolean; reason?: string }> {
  if (file.size > 2 * 1024 * 1024) {
    return { safe: false, reason: "Image must be under 2 MB." };
  }
  if (!file.type.startsWith("image/")) {
    return { safe: false, reason: "Only image files are allowed." };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 100;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); resolve({ safe: true }); return; }

      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);
      let skinPixels = 0;
      const total = size * size;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r > 80 && g > 30 && b > 15 && r > g && r > b && r - g > 15 && Math.abs(r - g) < 130) {
          skinPixels++;
        }
      }

      URL.revokeObjectURL(url);
      if (skinPixels / total > 0.6) {
        resolve({ safe: false, reason: "This image may contain inappropriate content. Please choose another." });
      } else {
        resolve({ safe: true });
      }
    };

    img.onerror = () => { URL.revokeObjectURL(url); resolve({ safe: false, reason: "Could not load this image." }); };
    img.src = url;
  });
}

/* ── Crop helper ────────────────────────────────────────────────── */

function getCroppedImg(imageSrc: string, crop: Area): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 256; // output size
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas context")); return; }

      ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── Component ──────────────────────────────────────────────────── */

export function EditProfileModal({
  open,
  onClose,
  address,
  currentNickname,
  currentPic,
  onSave,
}: EditProfileModalProps) {
  const [nickname, setNickname] = React.useState(currentNickname);
  const [profilePic, setProfilePic] = React.useState<string | null>(currentPic);

  // Cropper state
  const [cropSrc, setCropSrc] = React.useState<string | null>(null);
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedArea, setCroppedArea] = React.useState<Area | null>(null);

  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setNickname(currentNickname);
    setProfilePic(currentPic);
  }, [currentNickname, currentPic]);

  if (!open) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const result = await checkImageSafe(file);
    if (!result.safe) {
      setError(result.reason || "Image rejected.");
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    // Open cropper
    setCropSrc(dataUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setUploading(false);
  };

  const handleCropConfirm = async () => {
    if (!cropSrc || !croppedArea) return;
    try {
      const cropped = await getCroppedImg(cropSrc, croppedArea);
      setProfilePic(cropped);
      setCropSrc(null);
    } catch {
      setError("Failed to crop image.");
    }
  };

  const handleCropCancel = () => {
    setCropSrc(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSave = () => {
    onSave({ nickname: nickname.trim(), profilePic });
    onClose();
  };

  const handleRemovePic = () => {
    setProfilePic(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-[400px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-black/50 hover:bg-black/10 hover:text-black"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <h3 className="text-lg font-bold text-black">Edit Profile</h3>

        {/* ── Cropper overlay ── */}
        {cropSrc ? (
          <div className="mt-5">
            <div className="relative h-[280px] w-full overflow-hidden rounded-2xl bg-black">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_: Area, area: Area) => setCroppedArea(area)}
              />
            </div>

            {/* Zoom slider */}
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-black/40">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="h-1.5 flex-1 appearance-none rounded-full bg-black/10 accent-[var(--z-blue)]"
              />
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleCropCancel}
                className="flex-1 rounded-2xl border border-[color:var(--border)] px-4 py-2.5 text-sm font-medium text-black/70 hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                className="flex-1 rounded-2xl bg-[color:var(--z-blue)] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
              >
                Apply Crop
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Profile picture ── */}
            <div className="mt-5 flex flex-col items-center gap-3">
              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-pink-100">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-5xl">🤯</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full border border-[color:var(--border)] px-4 py-1.5 text-xs font-medium text-black/70 hover:bg-black/5 transition-colors"
                >
                  {uploading ? "Checking..." : "Upload Photo"}
                </button>
                {profilePic && (
                  <button
                    onClick={handleRemovePic}
                    className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-xs text-red-600">
                  {error}
                </div>
              )}
            </div>

            {/* ── Full public key ── */}
            <div className="mt-6">
              <label className="text-xs font-medium uppercase tracking-wider text-black/40">
                Public Key
              </label>
              <div className="mt-1.5 rounded-2xl border border-[color:var(--border)] bg-black/[0.02] px-4 py-3 text-xs font-mono text-black/70 break-all select-all">
                {address}
              </div>
            </div>

            {/* ── Nickname ── */}
            <div className="mt-5">
              <label className="text-xs font-medium uppercase tracking-wider text-black/40">
                Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter a display name..."
                maxLength={24}
                className="mt-1.5 w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-black outline-none focus:border-[color:var(--z-blue)] focus:ring-1 focus:ring-[color:var(--z-blue)] transition-colors"
              />
              <div className="mt-1 text-right text-[10px] text-black/30">
                {nickname.length}/24
              </div>
            </div>

            {/* ── Save ── */}
            <button
              onClick={handleSave}
              className="mt-4 w-full rounded-2xl bg-[color:var(--z-blue)] px-4 py-3 text-sm font-semibold text-white hover:brightness-110 transition-all"
            >
              Save Changes
            </button>
          </>
        )}
      </div>
    </div>
  );
}
