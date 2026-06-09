import { useRef, useState, type DragEvent } from 'react'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { uploadCmsImage, type CmsImageKind } from '@shared/config/media-upload'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  /** Loại ảnh → quyết định path lưu trên R2 + validate phía BE. */
  kind: CmsImageKind
  ratio?: 'banner' | 'mobile' | 'avatar' | 'square'
  hint?: string
  fallbackLetter?: string
  className?: string
}

const RATIO_CLASS: Record<NonNullable<ImageUploadProps['ratio']>, string> = {
  banner: 'aspect-[1440/600]',
  mobile: 'aspect-[390/500]',
  avatar: 'aspect-square rounded-full',
  square: 'aspect-square',
}

export function ImageUpload({
  value,
  onChange,
  kind,
  ratio = 'banner',
  hint,
  fallbackLetter,
  className = '',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setUploading(true)
    try {
      // Upload lên R2 qua BE → nhận public URL (thay base64). Field BE chỉ nhận URL.
      const url = await uploadCmsImage(file, kind)
      onChange(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Tải ảnh thất bại — thử lại.')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (uploading) return
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  const isRound = ratio === 'avatar'

  return (
    <div className={className}>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          if (!uploading) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative overflow-hidden transition border-2 border-dashed ${
          uploading ? 'cursor-wait' : 'cursor-pointer'
        } ${
          dragOver ? 'border-[#2D6A8C] bg-[#E0EFF5]' : 'border-[#D1D5DB] bg-[#F7F8FA] hover:border-[#9CA3AF]'
        } ${RATIO_CLASS[ratio]} ${isRound ? 'rounded-full' : 'rounded-lg'} flex items-center justify-center`}
      >
        {value ? (
          <>
            <img src={value} alt="" className={`w-full h-full object-cover ${isRound ? 'rounded-full' : ''}`} />
            {!uploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(null)
                  setError(null)
                  if (inputRef.current) inputRef.current.value = ''
                }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
                aria-label="Xoá ảnh"
              >
                <X size={14} />
              </button>
            )}
          </>
        ) : fallbackLetter ? (
          <span className="text-3xl font-semibold text-[#2D6A8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {fallbackLetter}
          </span>
        ) : (
          <div className="text-center text-[#6B7280] flex flex-col items-center gap-1.5">
            {ratio === 'banner' || ratio === 'mobile' ? <Upload size={20} /> : <ImageIcon size={20} />}
            <span className="text-xs">Click hoặc kéo-thả ảnh</span>
          </div>
        )}

        {/* Overlay khi đang upload */}
        {uploading && (
          <div className={`absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1.5 text-white ${isRound ? 'rounded-full' : ''}`}>
            <Loader2 size={20} className="animate-spin" />
            <span className="text-[11px]">Đang tải ảnh…</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
            // Reset để chọn lại CÙNG file vẫn fire onChange (sau khi xoá ảnh).
            e.target.value = ''
          }}
        />
      </div>

      {error ? (
        <p className="text-xs text-[#DC2626] mt-1.5">{error}</p>
      ) : (
        hint && <p className="text-xs text-[#6B7280] mt-1.5">{hint}</p>
      )}
    </div>
  )
}
