import { useEffect, useState } from 'react'

interface CountdownProps {
  startDate: string // dd/mm/yyyy
}

function parseDdMmYyyy(s: string): Date | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s.trim())
  if (!m) return null
  const [, d, mo, y] = m
  const date = new Date(Number(y), Number(mo) - 1, Number(d), 0, 0, 0)
  return Number.isNaN(date.getTime()) ? null : date
}

interface Unit {
  v: number
  label: string
}

export function Countdown({ startDate }: CountdownProps) {
  const target = parseDdMmYyyy(startDate)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (!target) return
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [target?.getTime()])

  if (!target) {
    return (
      <div className="inline-block px-3 py-2 rounded-md bg-white/15 text-white/90 text-xs italic">
        Đặt ngày khai giảng để bật đếm ngược
      </div>
    )
  }

  const diff = Math.max(0, target.getTime() - now.getTime())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  const units: Unit[] = [
    { v: days, label: 'NGÀY' },
    { v: hours, label: 'GIỜ' },
    { v: minutes, label: 'PHÚT' },
    { v: seconds, label: 'GIÂY' },
  ]

  if (diff === 0) {
    return (
      <div className="inline-block px-4 py-2.5 rounded-lg bg-[#4ECDC4] text-[#0A2540] font-semibold">
        Chương trình đã bắt đầu!
      </div>
    )
  }

  return (
    <div className="inline-flex gap-2">
      {units.map((u) => (
        <div
          key={u.label}
          className="min-w-[58px] px-2 py-2 rounded-lg bg-white/20 backdrop-blur text-white text-center"
        >
          <div className="text-2xl font-semibold tabular-nums leading-none">
            {String(u.v).padStart(2, '0')}
          </div>
          <div className="text-[9px] tracking-wider mt-1 opacity-80">{u.label}</div>
        </div>
      ))}
    </div>
  )
}
