"use client";

type Props = {
  value: string;
  error: string;
  onChange: (value: string) => void;
};

export default function TemplateJsonEditor({ value, error, onChange }: Props) {
  async function importFile(file?: File) {
    if (!file) return;
    onChange(await file.text());
  }

  function exportFile() {
    const blob = new Blob([value], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template-configuration.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Template configuration JSON</h2>
          <p className="text-sm text-gray-500">
            This edits the same template and frame settings as the form editor.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm">
            Import JSON
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => {
                void importFile(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
          </label>
          <button
            type="button"
            onClick={exportFile}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            Export JSON
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        aria-label="Template configuration JSON"
        className="min-h-[520px] w-full rounded-lg border border-gray-300 bg-slate-950 p-4 font-mono text-xs leading-5 text-slate-100 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
      />
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
