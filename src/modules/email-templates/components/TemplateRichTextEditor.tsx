// Bản TipTap riêng cho Mẫu email — clone từ modules/articles/components/
// RichTextEditor.tsx (giữ articles nguyên trạng, không cross-import module),
// thêm onEditorReady để page chèn {{biến}} vào đúng vị trí cursor.
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { Bold, Italic, Strikethrough, Heading2, Heading3, List, ListOrdered, Quote, Undo, Redo } from 'lucide-react'

interface TemplateRichTextEditorProps {
  value: string
  onChange: (html: string) => void
  onEditorReady?: (editor: Editor | null) => void
  placeholder?: string
}

export function TemplateRichTextEditor({
  value,
  onChange,
  onEditorReady,
  placeholder = 'Soạn nội dung email...',
}: TemplateRichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[280px] px-4 py-3 focus:outline-none [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_blockquote]:border-l-4 [&_blockquote]:border-[#D1D5DB] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-[#374151] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  })

  // Expose editor instance cho page (variable picker chèn tại cursor)
  useEffect(() => {
    onEditorReady?.(editor)
    return () => onEditorReady?.(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  // Sync external value changes when not from this editor
  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  if (!editor) return null

  return (
    <div className="rounded-md border border-[#D1D5DB] bg-white focus-within:border-[#2D6A8C] focus-within:ring-1 focus-within:ring-[#2D6A8C]/20">
      <Toolbar editor={editor} />
      {editor.isEmpty && (
        <div className="absolute pointer-events-none px-4 pt-2 text-sm text-[#9CA3AF]" aria-hidden>
          {placeholder}
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const btn = (active: boolean) =>
    `p-1.5 rounded transition ${active ? 'bg-[#E0EFF5] text-[#1F5374]' : 'text-[#6B7280] hover:bg-[#F7F8FA]'}`

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[#E5E7EB] flex-wrap">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))} title="Đậm (Ctrl+B)">
        <Bold size={14} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))} title="Nghiêng (Ctrl+I)">
        <Italic size={14} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive('strike'))} title="Gạch ngang">
        <Strikethrough size={14} />
      </button>

      <span className="w-px h-5 bg-[#E5E7EB] mx-1" />

      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))} title="Tiêu đề 2">
        <Heading2 size={14} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))} title="Tiêu đề 3">
        <Heading3 size={14} />
      </button>

      <span className="w-px h-5 bg-[#E5E7EB] mx-1" />

      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))} title="Danh sách dấu đầu dòng">
        <List size={14} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))} title="Danh sách số">
        <ListOrdered size={14} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive('blockquote'))} title="Trích dẫn">
        <Quote size={14} />
      </button>

      <span className="w-px h-5 bg-[#E5E7EB] mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`${btn(false)} disabled:opacity-30`}
        title="Hoàn tác (Ctrl+Z)"
      >
        <Undo size={14} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`${btn(false)} disabled:opacity-30`}
        title="Làm lại (Ctrl+Y)"
      >
        <Redo size={14} />
      </button>
    </div>
  )
}
