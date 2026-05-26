import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info)
  }

  reset = () => {
    this.setState({ error: null })
    if (typeof window !== 'undefined') window.location.assign('/')
  }

  render() {
    if (!this.state.error) return this.props.children

    const err = this.state.error
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] p-6">
        <div className="max-w-lg w-full bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6">
          <h1
            className="text-xl font-semibold text-[#DC2626] mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Có lỗi khi tải trang
          </h1>
          <p className="text-sm text-[#374151] mb-4">
            Nedu CMS gặp lỗi không mong muốn. Bạn có thể tải lại trang hoặc gửi log dưới đây cho team IT.
          </p>
          <pre className="text-xs bg-[#F7F8FA] border border-[#E5E7EB] rounded p-3 overflow-auto max-h-48 mb-4 whitespace-pre-wrap break-all">
            <strong>{err.name}:</strong> {err.message}
            {err.stack && '\n\n' + err.stack}
          </pre>
          <button
            onClick={this.reset}
            className="px-4 py-2 rounded-lg bg-[#2D6A8C] hover:bg-[#1F5374] text-white text-sm font-medium"
          >
            Tải lại trang chủ
          </button>
        </div>
      </div>
    )
  }
}
