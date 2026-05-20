import { useState } from 'react'

interface PinInputProps {
  onSubmit: (pin: string) => void
  title: string
  loading?: boolean
}

export default function PinInput({ onSubmit, title, loading }: PinInputProps) {
  const [pin, setPin] = useState('')

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const next = pin + digit
      setPin(next)
      if (next.length === 4) {
        onSubmit(next)
        setPin('')
      }
    }
  }

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1))
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL']

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl" style={{ color: 'var(--accent)' }}>{title}</h2>

      <div className="flex gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
            style={{ border: '2px solid oklch(0.45 0.16 255 / 0.4)', backgroundColor: 'var(--dark-lighter)' }}
          >
            {pin[i] ? '•' : ''}
          </div>
        ))}
      </div>

      {loading && (
        <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '2px solid var(--accent)', borderTopColor: 'transparent' }} />
      )}

      <div className="grid grid-cols-3 gap-3 w-64" dir="ltr">
        {digits.map((d, i) => {
          if (d === '') return <div key={i} />
          if (d === 'DEL') {
            return (
              <button
                key={i}
                onClick={handleDelete}
                disabled={loading}
                className="h-14 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--dark-lighter)', color: 'var(--text-muted)' }}
              >
                &#9003;
              </button>
            )
          }
          return (
            <button
              key={i}
              onClick={() => handleDigit(d)}
              disabled={loading}
              className="h-14 rounded-xl text-xl font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--dark-lighter)', color: 'var(--text-primary)' }}
            >
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}
