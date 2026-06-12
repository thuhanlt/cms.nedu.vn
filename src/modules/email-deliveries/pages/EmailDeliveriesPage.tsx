// Trang "Lịch sử gửi" (nhóm Tự động hoá, admin-only). 2 tab:
//  - "Email đã gửi"  → delivery log (khách báo không nhận mail)
//  - "Lượt chạy"     → workflow runs
// Query param: ?tab=runs|deliveries · ?workflow_id=<id> (vào từ kebab "Lịch sử"
// của 1 workflow → mở thẳng tab Lượt chạy, pre-filter workflow đó).
import { useSearchParams } from 'react-router-dom'
import { DeliveriesTab } from '../components/DeliveriesTab'
import { RunsTab } from '../components/RunsTab'

type TabKey = 'deliveries' | 'runs'

export function EmailDeliveriesPage() {
  const [params, setParams] = useSearchParams()
  const workflowId = params.get('workflow_id') ?? undefined
  // workflow_id ngụ ý xem lượt chạy → mặc định tab runs khi có nó.
  const rawTab = params.get('tab')
  const activeTab: TabKey = rawTab === 'runs' || workflowId ? 'runs' : 'deliveries'

  const setTab = (tab: TabKey) => {
    const next = new URLSearchParams(params)
    next.set('tab', tab)
    // rời tab runs → bỏ pre-filter workflow để không "dính" sang lần sau.
    if (tab !== 'runs') next.delete('workflow_id')
    setParams(next, { replace: true })
  }

  const tabBtn = (key: TabKey, label: string) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
        activeTab === key
          ? 'border-[#2D6A8C] text-[#1F5374]'
          : 'border-transparent text-[#6B7280] hover:text-[#111827]'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-4">
        <h1
          className="text-2xl font-semibold text-[#111827]"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Lịch sử gửi
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Tra cứu email hệ thống đã gửi và các lượt chạy luồng (Flows) — dùng khi khách báo không
          nhận được mail.
        </p>
      </header>

      <div className="flex items-center gap-1 border-b border-[#E5E7EB] mb-5">
        {tabBtn('deliveries', 'Email đã gửi')}
        {tabBtn('runs', 'Lượt chạy')}
      </div>

      {activeTab === 'deliveries' ? (
        <DeliveriesTab />
      ) : (
        <RunsTab initialWorkflowId={workflowId} />
      )}
    </div>
  )
}
