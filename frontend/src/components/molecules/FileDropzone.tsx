import { useRef, useState } from 'react'

function acceptsFile(file: File, accept?: string) {
  if (!accept) return true

  return accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule)
      if (rule.endsWith('/*')) return file.type.toLowerCase().startsWith(rule.slice(0, -1))
      return file.type.toLowerCase() === rule
    })
}

export function FileDropzone({
  accept,
  multiple = false,
  maxSize,
  onFiles,
}: {
  accept?: string
  multiple?: boolean
  /** Maximum accepted file size in bytes. */
  maxSize?: number
  onFiles: (files: File[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [rejections, setRejections] = useState<string[]>([])

  const selectFiles = (fileList: FileList | null) => {
    const candidates = Array.from(fileList ?? [])
    const nextRejections: string[] = []
    const accepted = candidates.filter((file) => {
      if (!acceptsFile(file, accept)) {
        nextRejections.push(`${file.name} no es un tipo de archivo aceptado.`)
        return false
      }
      if (maxSize !== undefined && file.size > maxSize) {
        nextRejections.push(`${file.name} supera el límite de tamaño de ${maxSize} bytes.`)
        return false
      }
      return true
    })
    const nextFiles = multiple ? accepted : accepted.slice(0, 1)

    setFiles(nextFiles)
    setRejections(nextRejections)
    onFiles(nextFiles)
  }

  const removeFile = (fileToRemove: File) => {
    const nextFiles = files.filter((file) => file !== fileToRemove)
    setFiles(nextFiles)
    onFiles(nextFiles)
  }

  return (
    <div
      className={`file-dropzone ${isDragging ? 'file-dropzone--active' : ''}`}
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
        type="file"
        accept={accept}
        multiple={multiple}
        aria-label="Elegir archivos"
        onChange={(event) => selectFiles(event.target.files)}
      />
      <button type="button" onClick={() => inputRef.current?.click()}>
        Elegir archivos
      </button>
      <p>Arrastre archivos aquí o elíjalos desde su dispositivo.</p>
      {rejections.length > 0 && (
        <ul className="file-dropzone__errors" role="alert">
          {rejections.map((rejection) => (
            <li key={rejection}>{rejection}</li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <ul className="file-dropzone__files" aria-label="Archivos seleccionados">
          {files.map((file) => (
            <li key={`${file.name}-${file.lastModified}`}>
              <span>{file.name}</span>
              <button
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
