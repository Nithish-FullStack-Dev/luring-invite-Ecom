"use client";

import { X, Film, PlayCircle } from "lucide-react";

type VideoPreviewDialogProps = {
  open: boolean;
  videoUrl: string;
  title?: string;
  onClose: () => void;
};

export default function VideoPreviewDialog({
  open,
  videoUrl,
  title,
  onClose,
}: VideoPreviewDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-110 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-preview-heading"
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-[#985cc0]">
              <Film size={22} />
            </div>

            <div className="min-w-0">
              <h2
                id="video-preview-heading"
                className="text-lg font-bold text-gray-900"
              >
                Video Preview
              </h2>
              <p className="truncate text-sm text-gray-500">
                {title ?? "Title"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close video preview"
            className="shrink-0 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={22} />
          </button>
        </div>

        <div className="bg-black p-2 sm:p-4">
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            controlsList="nodownload"
            disablePictureInPicture
            playsInline
            className="mx-auto max-h-[65vh] w-full rounded-lg object-contain"
          >
            Your browser does not support video playback.
          </video>
        </div>

        <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
          <p className="text-sm text-gray-500">
            Your personalized invitation is ready.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#985cc0] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8147a8]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
