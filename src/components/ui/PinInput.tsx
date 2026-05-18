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
      <h2 className="text-2xl text-[#c9a84c]">{title}</h2>

      <div className="flex gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-12 h-12 rounded-lg border-2 border-[#c9a84c]/40 bg-[#1a1a1a] flex items-center justify-center text-xl"
          >
            {pin[i] ? '•' : ''}
          </div>
        ))}
      </div>

      {loading && (
        <div className="w-6 h-6 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
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
                className="h-14 rounded-xl bg-[#1a1a1a] text-gray-400 hover:bg-[#252525] active:bg-[#303030] text-sm font-medium transition-colors disabled:opacity-50"
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
              className="h-14 rounded-xl bg-[#1a1a1a] text-white hover:bg-[#c9a84c]/20 active:bg-[#c9a84c]/40 text-xl font-medium transition-colors disabled:opacity-50"
            >
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}
