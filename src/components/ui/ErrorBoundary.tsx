import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: 'oklch(0.45 0.15 25 / 0.15)' }}
          >
            <span className="text-2xl" style={{ color: 'oklch(0.55 0.18 25)' }}>!</span>
          </div>
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            משהו השתבש
          </h2>
          <p
            className="text-sm mb-6 max-w-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            אירעה שגיאה בטעינת העמוד. שאר המערכת ממשיכה לעבוד כרגיל.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
          >
            נסה שוב
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
