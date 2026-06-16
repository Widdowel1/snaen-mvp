'use client'

import { useState, useRef, useEffect } from 'react'

interface HelpTooltipProps {
  text: string
  title?: string
}

export default function HelpTooltip({ text, title }: HelpTooltipProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setVisible(false)
      }
    }
    if (visible) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [visible])

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="Aide"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#006B3F] focus:ring-offset-1"
      >
        ?
      </button>
      {visible && (
        <div className="absolute z-50 left-6 top-1/2 -translate-y-1/2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-left">
          {title && (
            <div className="text-xs font-semibold text-[#004D2C] mb-1">{title}</div>
          )}
          <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
          {/* Flèche gauche */}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-white" style={{ filter: 'drop-shadow(-1px 0 0 #E5E7EB)' }} />
        </div>
      )}
    </div>
  )
}
