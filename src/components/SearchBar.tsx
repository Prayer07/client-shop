interface Props {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative w-full max-w-md">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-taupe/60 text-sm">🔍</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search products..."
        className="w-full pl-10 pr-10 py-3 border border-blush rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown placeholder:text-taupe/50 shadow-sm"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-taupe hover:text-brown transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  )
}