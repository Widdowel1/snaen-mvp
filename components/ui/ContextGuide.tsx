interface ContextGuideProps {
  message: string
}

export default function ContextGuide({ message }: ContextGuideProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 flex items-start gap-2">
      <span className="flex-shrink-0 mt-0.5">💡</span>
      <span>{message}</span>
    </div>
  )
}
