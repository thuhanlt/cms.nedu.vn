// Canvas trái của builder (mirror Google Workspace Flows): cột card dọc giữa
// nền xanh-xám nhạt — starter card + action cards nối connector, kebab ⋮
// (Lên trên / Xuống dưới / Xoá), nút pill "+ Thêm node" dưới cùng.
// CHỈ là lớp trình bày — mọi mutate đi qua callback từ FlowBuilderPage.
import { ArrowDown, ArrowUp, Clock, Mail, Plus, RefreshCw, Timer, Trash2, Zap } from 'lucide-react'
import { WORKFLOW_MAX_STEPS, type EmailTemplateOption } from '../types/flow'
import { isDelayStepValid, triggerClause, type BuilderStep } from './builder-steps'
import { KebabMenu } from './KebabMenu'

/** Thẻ nào đang được chọn trên canvas → quyết định nội dung panel phải. */
export type CanvasSelection =
  | { kind: 'starter' } // starter: chưa chọn → panel grid; đã chọn → panel chi tiết
  | { kind: 'starter-pick' } // ép mở grid "Đổi sự kiện" dù đã chọn
  | { kind: 'step'; uid: string }
  | { kind: 'add' }

export type CanvasStarter =
  | { type: 'empty' }
  | { type: 'event'; label: string }
  /** date_anchor read-only: "⏱ trước 3 ngày ngày khai giảng" */
  | { type: 'anchor'; label: string }

interface FlowCanvasProps {
  starter: CanvasStarter
  steps: BuilderStep[]
  templates: EmailTemplateOption[]
  selection: CanvasSelection
  /** date_anchor: card chỉ hiển thị — không click/kebab/thêm bước */
  readOnly?: boolean
  onSelectStarter: () => void
  /** kebab starter "Đổi sự kiện" */
  onChangeStarter: () => void
  onSelectStep: (uid: string) => void
  onAddStep: () => void
  onMove: (index: number, dir: -1 | 1) => void
  onRemove: (index: number) => void
}

const cardBase =
  'w-full flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left shadow-sm transition'
const cardIdle = 'bg-white border-transparent hover:border-[#A8C7FA]'
const cardSelected = 'bg-[#D3E3FD] border-[#A8C7FA]'

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`text-xs font-medium text-[#5E718D] mb-2 ${className}`}>{children}</div>
  )
}

function Connector() {
  return <div className="mx-auto w-px h-5 bg-[#B7C7DC]" />
}

export function FlowCanvas({
  starter,
  steps,
  templates,
  selection,
  readOnly = false,
  onSelectStarter,
  onChangeStarter,
  onSelectStep,
  onAddStep,
  onMove,
  onRemove,
}: FlowCanvasProps) {
  const full = steps.length >= WORKFLOW_MAX_STEPS
  const starterSelected = selection.kind === 'starter' || selection.kind === 'starter-pick'

  return (
    <div className="w-full max-w-[620px] mx-auto">
      <SectionLabel>Sự kiện bắt đầu</SectionLabel>

      {starter.type === 'empty' ? (
        // Chưa chọn trigger — card xanh nhạt highlight (mirror "Choose a starter")
        <button
          type="button"
          onClick={onSelectStarter}
          className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${
            starterSelected
              ? 'bg-[#D3E3FD] border-[#A8C7FA]'
              : 'bg-[#D7E7FB] border-transparent hover:border-[#A8C7FA]'
          }`}
        >
          <span className="w-9 h-9 rounded-lg bg-white/80 text-[#1A4F7E] flex items-center justify-center shrink-0">
            <Plus size={17} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-[#1A4F7E]">Chọn sự kiện bắt đầu</span>
            <span className="block text-xs text-[#3B6493] mt-0.5">
              Sự kiện này sẽ khởi động luồng — hệ thống tự biết gửi cho ai
            </span>
          </span>
        </button>
      ) : (
        <div
          role={readOnly ? undefined : 'button'}
          tabIndex={readOnly ? undefined : 0}
          onClick={readOnly ? undefined : onSelectStarter}
          onKeyDown={
            readOnly
              ? undefined
              : (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectStarter()
                  }
                }
          }
          className={`${cardBase} ${readOnly ? 'bg-white border-transparent' : `cursor-pointer ${starterSelected ? cardSelected : cardIdle}`}`}
        >
          <span className="w-9 h-9 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
            {starter.type === 'anchor' ? <Timer size={16} /> : <Zap size={16} />}
          </span>
          <div className="flex-1 min-w-0 text-sm text-[#111827] truncate">
            Node 1:{' '}
            {starter.type === 'anchor' ? (
              <span className="font-semibold">{starter.label}</span>
            ) : (
              <>
                Khi <span className="font-semibold">{triggerClause(starter.label)}</span>
              </>
            )}
          </div>
          {!readOnly && (
            <KebabMenu
              label="Tuỳ chọn sự kiện bắt đầu"
              items={[
                {
                  key: 'change',
                  label: 'Đổi sự kiện',
                  icon: <RefreshCw size={14} />,
                  onSelect: onChangeStarter,
                },
              ]}
            />
          )}
        </div>
      )}

      <Connector />
      <SectionLabel className="mt-1">Hành động</SectionLabel>

      {steps.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#B7C7DC] px-4 py-3.5 text-center">
          <p className="text-xs text-[#5E718D]">
            Chưa có node nào — thường bắt đầu bằng <span className="font-medium">Gửi email</span>{' '}
            ngay khi sự kiện xảy ra.
          </p>
        </div>
      )}

      {steps.map((step, i) => {
        const isEmail = step.type === 'send_email'
        const selectedTemplate = isEmail
          ? templates.find((t) => t.id === step.template_id)
          : undefined
        // Card thiếu dữ liệu → dòng phụ đỏ (mirror "Missing a required field")
        const missing = isEmail ? !step.template_id : !isDelayStepValid(step)
        const isSelected = selection.kind === 'step' && selection.uid === step.uid
        return (
          <div key={step.uid}>
            {i > 0 && <Connector />}
            <div
              role={readOnly ? undefined : 'button'}
              tabIndex={readOnly ? undefined : 0}
              onClick={readOnly ? undefined : () => onSelectStep(step.uid)}
              onKeyDown={
                readOnly
                  ? undefined
                  : (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectStep(step.uid)
                      }
                    }
              }
              className={`${cardBase} ${readOnly ? 'bg-white border-transparent' : `cursor-pointer ${isSelected ? cardSelected : cardIdle}`}`}
            >
              <span
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  isEmail ? 'bg-[#E0EFF5] text-[#1F5374]' : 'bg-[#FEF3C7] text-[#B45309]'
                }`}
              >
                {isEmail ? <Mail size={16} /> : <Clock size={16} />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[#111827] truncate">
                  Node {i + 2}:{' '}
                  {isEmail ? (
                    selectedTemplate ? (
                      <>
                        Gửi email: <span className="font-semibold">{selectedTemplate.name}</span>
                      </>
                    ) : (
                      <span className="font-semibold">Gửi email</span>
                    )
                  ) : isDelayStepValid(step) ? (
                    <>
                      Đợi{' '}
                      <span className="font-semibold">
                        {Number(step.amount)} {step.unit === 'days' ? 'ngày' : 'giờ'}
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold">Đợi</span>
                  )}
                </div>
                {missing && (
                  <div className="text-[11px] text-[#DC2626] mt-0.5">Thiếu thông tin bắt buộc</div>
                )}
              </div>
              {!readOnly && (
                <KebabMenu
                  label={`Tuỳ chọn node ${i + 2}`}
                  items={[
                    {
                      key: 'up',
                      label: 'Lên trên',
                      icon: <ArrowUp size={14} />,
                      disabled: i === 0,
                      onSelect: () => onMove(i, -1),
                    },
                    {
                      key: 'down',
                      label: 'Xuống dưới',
                      icon: <ArrowDown size={14} />,
                      disabled: i === steps.length - 1,
                      onSelect: () => onMove(i, 1),
                    },
                    'divider',
                    {
                      key: 'remove',
                      label: 'Xoá',
                      icon: <Trash2 size={14} />,
                      danger: true,
                      onSelect: () => onRemove(i),
                    },
                  ]}
                />
              )}
            </div>
          </div>
        )
      })}

      {!readOnly && (
        <>
          <Connector />
          <div className="text-center">
            <button
              type="button"
              onClick={onAddStep}
              disabled={full}
              title={full ? `Đã đạt tối đa ${WORKFLOW_MAX_STEPS} node` : 'Thêm node vào cuối luồng'}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed ${
                selection.kind === 'add'
                  ? 'bg-[#D3E3FD] border-[#A8C7FA] text-[#1A4F7E]'
                  : 'bg-white border-[#D7E0EC] text-[#1F5374] hover:border-[#A8C7FA]'
              }`}
            >
              <Plus size={15} />
              Thêm node
            </button>
            {full && (
              <p className="text-[11px] text-[#B45309] mt-1.5">
                Đã đạt tối đa {WORKFLOW_MAX_STEPS} node — xoá bớt để thêm node mới.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
