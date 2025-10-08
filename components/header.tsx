import { UserCircle, Sparkles } from "lucide-react";
import { useUser } from "@/providers/user-context";

interface HeaderProps {
  setShowProfile: (show: boolean) => void
}

export function Header({ setShowProfile }: HeaderProps) {
  const { user } = useUser()

  return (
    <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-2xl border-b border-gray-200/30 py-3 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Coworking</h1>
              <p className="text-[10px] text-gray-500 -mt-0.5">AI-Powered Search</p>
            </div>
          </div>
        </div>

        {/* User Button */}
        <button
          onClick={() => setShowProfile(true)}
          className="group flex items-center gap-2.5 px-3.5 py-2 rounded-full hover:bg-gray-100/80 transition-all border border-gray-200/50 hover:border-gray-300 bg-white/50"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center">
            <UserCircle size={16} className="text-white" />
          </div>
          <span className="text-sm font-medium text-gray-900">
            {user ? user.name : "Sign In"}
          </span>
        </button>
      </div>
    </header>
  )
}