import { useEffect, useState } from 'react'

/** Trả về value sau khi "đứng yên" delay ms — dùng cho ô tìm email realtime
 *  (gõ liên tục không bắn query mỗi ký tự). */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
