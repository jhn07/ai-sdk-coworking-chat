export function EmptyState({ onSend }: { onSend: (text: string) => void }) {
  const suggestions = [
    { text: "Find coworking in Downtown", icon: "🏙️" },
    { text: "Quiet spaces in Plateau", icon: "🤫" },
    { text: "Best rated with meeting rooms", icon: "⭐" }
  ]

  return (
    <div className="flex items-center justify-center h-full px-4">
      <div className="text-center max-w-2xl">
        {/* Hero Text */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Find Your Perfect Workspace
          </h2>
          <p className="text-lg text-gray-600">
            Chat with AI to discover coworking spaces in Montreal
          </p>
        </div>

        {/* Suggestion Pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onSend(suggestion.text)}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-black hover:bg-white transition-all text-sm text-gray-700 hover:text-black hover:shadow-lg"
            >
              <span className="text-base">{suggestion.icon}</span>
              <span className="font-medium">{suggestion.text}</span>
            </button>
          ))}
        </div>

        {/* Hint Text */}
        <p className="text-xs text-gray-500 mt-6">
          Try asking: &ldquo;Show me quiet spaces under $30&rdquo; or &ldquo;Find a space with meeting rooms&rdquo;
        </p>
      </div>
    </div>
  )
}