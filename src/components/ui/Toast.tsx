interface ToastProps {
  message: string
  type: 'success' | 'error'
}

export default function Toast({ message, type }: ToastProps) {
  return (
    <div
      role="alert"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl font-semibold text-sm shadow-lg animate-fade-in"
      style={{
        backgroundColor: type === 'success' ? 'oklch(0.45 0.15 155)' : 'oklch(0.50 0.18 25)',
        color: 'white',
      }}
    >
      {message}
    </div>
  )
}
