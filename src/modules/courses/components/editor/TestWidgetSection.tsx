import type { CourseContent } from '../../types/course'
import { SectionNote } from './Field'

interface Props {
  content: CourseContent
  onContentChange: (patch: Partial<CourseContent>) => void
}

export function TestWidgetSection({ content, onContentChange }: Props) {
  return (
    <div className="space-y-4">
      <SectionNote>
        Widget này cố định theo chuẩn N·Edu (4 bước: chọn giai đoạn → trả lời MaxDiff → nhận kết quả → đăng ký khoá phù hợp).
        Chỉ có thể bật/tắt — không chỉnh nội dung.
      </SectionNote>

      <label className="flex items-start gap-3 p-4 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] cursor-pointer">
        <input
          type="checkbox"
          checked={content.testWidgetEnabled}
          onChange={(e) => onContentChange({ testWidgetEnabled: e.target.checked })}
          className="w-4 h-4 mt-0.5 accent-[#2D6A8C]"
        />
        <div>
          <div className="text-sm font-medium text-[#111827]">Hiển thị Test widget trên trang khoá học</div>
          <div className="text-xs text-[#6B7280] mt-0.5">
            Khi bật: học viên thấy block giới thiệu bài test miễn phí ngay dưới phần Hero, link sang test.nedu.vn.
          </div>
        </div>
      </label>

      <div className="rounded-lg border border-dashed border-[#D1D5DB] p-4 bg-white">
        <div className="text-xs text-[#6B7280] mb-2 font-semibold">Nội dung hiển thị (cố định)</div>
        <div className="text-sm font-semibold text-[#111827]">Khoá này có thực sự phù hợp với bạn không?</div>
        <ul className="mt-2 space-y-1 text-xs text-[#374151] list-disc pl-5">
          <li>Chọn giai đoạn cuộc sống</li>
          <li>Trả lời 4 bộ câu hỏi MaxDiff</li>
          <li>Nhận kết quả cá nhân hoá</li>
          <li>Đăng ký khoá phù hợp nhất</li>
        </ul>
        <div className="mt-2 inline-block px-2.5 py-1 rounded bg-[#1A4D6B] text-white text-[11px] font-medium">
          Làm bài test miễn phí — 5 phút
        </div>
      </div>
    </div>
  )
}
