import { useState } from "react"
import { Send, Sparkles } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState<string>("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  };

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput("")
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSubmit()
  };

  return (
    <div className="sticky bottom-0 border-t border-gray-200/30 bg-white/95 backdrop-blur-xl px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleFormSubmit} className="relative">
          {/* Input with icon */}
          <div className="relative flex items-end gap-2">
            {/* AI Indicator */}
            {!input && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 pointer-events-none">
                <Sparkles size={16} />
                <span className="text-sm">Ask AI to find spaces...</span>
              </div>
            )}

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder=""
              className="flex-1 resize-none bg-white border border-gray-200 rounded-2xl px-4 py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20 transition-all shadow-sm hover:shadow-md"
              rows={1}
              style={{
                minHeight: "52px",
                maxHeight: "120px",
                paddingLeft: input ? "1rem" : "2.5rem"
              }}
              disabled={isLoading}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 bg-black text-white p-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </form>

        {/* Hint Text */}
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-mono">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-mono">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  )
}