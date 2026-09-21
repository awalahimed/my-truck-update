import { cn } from "../lib/utils"
import { Label } from "../components/ui/label"
import { Loader2, FileImage, X, Upload } from "lucide-react"

export function FileDropZone({
  label,
  file,
  onFileSelect,
  onClear,
  uploading,
  progress,
}: {
  label: string
  file: File | null
  onFileSelect: (f: File) => void
  onClear: () => void
  uploading: boolean
  progress: number
}) {
  const inputId = `file-${label.replace(/\s/g, "-").toLowerCase()}`
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <label
        htmlFor={inputId}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors",
          file
            ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/20"
            : "border-gray-200 dark:border-neutral-700 hover:border-emerald-400 hover:bg-emerald-50/30 dark:hover:border-emerald-600"
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span>Uploading… {Math.round(progress)}%</span>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : file ? (
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <FileImage className="w-5 h-5" />
            <span className="truncate max-w-[140px]">{file.name}</span>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onClear() }}
              className="ml-1 p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
            <Upload className="w-6 h-6" />
            <span>Tap to select photo</span>
          </div>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFileSelect(f)
          }}
        />
      </label>
    </div>
  )
}
