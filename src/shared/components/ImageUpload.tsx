import { useRef, useState, type DragEvent } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  value?: string | null
  onChange: (dataUrl: string | null) => void
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
  ratio = 'banner',
  hint,
  fallbackLetter,
  className = '',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsDataURL(file)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const isRound = ratio === 'avatar'

  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative overflow-hidden cursor-pointer transition border-2 border-dashed ${
          dragOver ? 'border-[#2D6A8C] bg-[#E0EFF5]' : 'border-[#D1D5DB] bg-[#F7F8FA] hover:border-[#9CA3AF]'
        } ${RATIO_CLASS[ratio]} ${isRound ? 'rounded-full' : 'rounded-lg'} flex items-center justify-center`}
      >
        {value ? (
          <>
            <img src={value} alt="" className={`w-full h-full object-cover ${isRound ? 'rounded-full' : ''}`} />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
              aria-label="Xoá ảnh"
            >
              <X size={14} />
            </button>
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
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>
      {hint && <p className="text-xs text-[#6B7280] mt-1.5">{hint}</p>}
    </div>
  )
}
