import { memo } from "react";

interface PdfPreviewProps {
  src: string;
}

const PdfPreview = ({ src }: PdfPreviewProps) => {
  return (
    <div className="relative w-full h-full bg-primary/40 p-4 md:p-6">
      {/* FRAME */}
      <div className="relative w-full h-full bg-white rounded-xl overflow-hidden shadow-sm">
        {/* PDF */}
        <iframe
          src={`${src}#toolbar=0&navpanes=0`}
          className="w-full h-full border-0"
          title="PDF Preview"
        />

        {/* WATERMARK */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-2 sm:grid-cols-3 gap-12 place-items-center">
          {Array.from({ length: 12 }).map((_, i) => (
            <p
              key={i}
              className="text-2xl sm:text-3xl font-semibold text-foreground/20 rotate-[-30deg] select-none whitespace-nowrap"
            >
              OutRight&apos;s Luring Invite
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(PdfPreview);
