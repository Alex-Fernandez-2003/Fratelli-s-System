import { useRef, useState } from 'react'
function acceptsFile(file: File, accept?: string) {
  if (!accept) return true
  return accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) =>
      rule.startsWith('.')
        ? file.name.toLowerCase().endsWith(rule)
        : rule.endsWith('/*')
          ? file.type.toLowerCase().startsWith(rule.slice(0, -1))
          : file.type.toLowerCase() === rule,
    )
}
export function FileDropzone({
  accept,
  multiple = false,
  maxSize,
  onFiles,
}: {
  accept?: string
  multiple?: boolean
  maxSize?: number
  onFiles: (files: File[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [rejections, setRejections] = useState<string[]>([])
  const selectFiles = (fileList: FileList | null) => {
    const rejected: string[] = []
    const accepted = Array.from(fileList ?? []).filter((file) => {
      if (!acceptsFile(file, accept)) {
        rejected.push(`${file.name} no es un tipo de archivo aceptado.`)
        return false
      }
      if (maxSize !== undefined && file.size > maxSize) {
        rejected.push(`${file.name} supera el límite de tamaño de ${maxSize} bytes.`)
        return false
      }
      return true
    })
    const next = multiple ? accepted : accepted.slice(0, 1)
    setFiles(next)
    setRejections(rejected)
    onFiles(next)
  }
  const removeFile = (fileToRemove: File) => {
    const next = files.filter((file) => file !== fileToRemove)
    setFiles(next)
    onFiles(next)
  }
  return (
    <div
      className={`mt-4 border border-dashed p-4 text-center ${isDragging ? 'border-brand-orange' : 'border-border'}`}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        selectFiles(event.dataTransfer.files)
      }}
    >
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept={accept}
        multiple={multiple}
        aria-label="Elegir archivos"
        onChange={(event) => selectFiles(event.target.files)}
      />
      <button
        className="rounded-md bg-brand-orange px-3.5 py-2.5 font-bold text-brand-black hover:bg-brand-orange-hover"
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        Elegir archivos
      </button>
      <p>Arrastre archivos aquí o elíjalos desde su dispositivo.</p>
      {rejections.length > 0 && (
        <ul className="mt-4 grid list-none gap-2 p-0 text-left text-danger" role="alert">
          {rejections.map((rejection) => (
            <li key={rejection}>{rejection}</li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <ul className="mt-4 grid list-none gap-2 p-0 text-left" aria-label="Archivos seleccionados">
          {files.map((file) => (
            <li
              className="flex items-center justify-between gap-2"
              key={`${file.name}-${file.lastModified}`}
            >
              <span>{file.name}</span>
              <button
                className="rounded border border-border bg-transparent px-2 py-1 text-text"
                type="button"
                onClick={() => removeFile(file)}
                aria-label={`Quitar ${file.name}`}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
