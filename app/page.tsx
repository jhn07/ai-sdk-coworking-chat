"use client";

import { useEffect, useRef, useState } from "react"
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { cn } from "@/lib/utils";
import { ChatInput } from "@/components/chat-input";
import { TypingIndicator } from "@/components/typing-indicator";
import { CoworkingCardList } from "@/components/coworking-card-list";
import { MapModal } from "@/components/map-modal";
import { UserProfileModal } from "@/components/user-profile-modal";
import { useUser } from "@/providers/user-context";
import { CoworkingListSkeleton } from "@/components/coworking-skeleton";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { Header } from "@/components/header";
import { BookingConfirmation } from "@/components/booking-confirmation";
import type { Coworking, CoworkingWithBookingInfo, SearchCoworkingsOutput, BookingOutput } from "@/types";

// Type guards for safe type checking
type ToolOutput = SearchCoworkingsOutput | BookingOutput;

function hasOutput(part: unknown): part is { output: ToolOutput } {
  return typeof part === 'object' && part !== null && 'output' in part && part.output !== null && part.output !== undefined;
}

function isTextPart(part: unknown): part is { text: string } {
  return typeof part === 'object' && part !== null && 'text' in part && typeof (part as { text: unknown }).text === 'string';
}

export default function Home() {
  const { user, isLoading: userLoading } = useUser()
  const userRef = useRef(user)
  const [showMap, setShowMap] = useState(false)
  const [selectedCoworking, setSelectedCoworking] = useState<Coworking | null>(null)
  const [showProfile, setShowProfile] = useState(false)

  // Update ref when user changes
  useEffect(() => {
    userRef.current = user
  }, [user])

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      fetch: async (url, options) => {
        const currentUser = userRef.current

        return fetch(url, {
          ...options,
          body: JSON.stringify({
            ...JSON.parse(options?.body as string || '{}'),
            user: currentUser ?? null,
          })
        })
      }
    }),
    onError: () => {
      toast.error("Failed to send message. Please try again.")
    },
  })

  const { messagesEndRef } = useScrollToBottom(messages)
  const isChatLoading = status === "streaming" || status === "submitted"

  const handleSendMessage = (message: string) => {
    if (!message.trim() || isChatLoading) return

    try {
      sendMessage({ text: message })
    } catch (error) {
      console.error('[Send Error]:', error)
      toast.error("Failed to send message. Please try again.")
    }
  }

  const handleBooking = (cw: CoworkingWithBookingInfo) => {
    if (!user) {
      toast.error("Please sign in to book a coworking space")
      setShowProfile(true)
      return
    }

    const bookingMessage = `I want to book ${cw.name} at ${cw.time} for ${cw.duration}`;

    try {
      sendMessage({ text: bookingMessage })
      toast.success("Processing your booking...")
    } catch (error) {
      console.error('[Booking Error]:', error)
      toast.error("Failed to create booking. Please try again.")
    }
  }

  const handleShowMap = (cw: Coworking) => {
    setSelectedCoworking(cw)
    setShowMap(true)
  }

  const handleCloseMap = () => {
    setShowMap(false)
    setSelectedCoworking(null)
  }

  // Show loader while user is loading
  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <Header setShowProfile={setShowProfile} />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-6">
        {/* Show empty state if no messages */}
        {messages.length === 0 ? (
          <EmptyState onSend={(text) => sendMessage({ text })} />
        ) : (
          // Show messages
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={cn(
                "flex animate-in fade-in slide-in-from-bottom-4 duration-500",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div className="flex flex-col gap-2 max-w-[85%]">
                {/* Show message parts */}
                {message.parts.map((part, idx: number) => {
                  const partKey = `${message.id}-${idx}`;

                  // Text message part
                  if (part.type === 'text' && isTextPart(part)) {
                    // Show text message
                    return (
                      <div
                        key={partKey}
                        className={cn(
                          "p-4 rounded-2xl backdrop-blur-md",
                          message.role === "user"
                            ? "bg-black text-white"
                            : "bg-white/70 border border-gray-200/50 text-gray-900"
                        )}
                      >
                        {part.text}
                      </div>
                    )
                  }

                  // Search coworkings tool part
                  if (part.type === 'tool-searchCoworkings') {
                    // Show loading state
                    if (!hasOutput(part) || isChatLoading) {
                      return (
                        <div key={partKey} className="w-full max-w-4xl">
                          <CoworkingListSkeleton count={3} />
                        </div>
                      )
                    }

                    const output = part.output as SearchCoworkingsOutput;

                    // Show error if search failed
                    if (!output.success) {
                      return (
                        <div key={partKey} className="p-4 bg-red-50 border border-red-200 rounded-xl">
                          <p className="text-red-700 text-sm">
                            {output.error || "Failed to search coworking spaces"}
                          </p>
                        </div>
                      )
                    }

                    // Show results if search was successful
                    return (
                      <div key={partKey} className="w-full max-w-4xl">
                        <CoworkingCardList
                          coworkings={output.coworkings}
                          fallback={output.fallback}
                          onShowMap={handleShowMap}
                          onBook={handleBooking}
                          appliedFilters={output.appliedFilters}
                        />
                      </div>
                    )
                  }

                  // Create booking tool part
                  if (part.type === 'tool-createBooking') {
                    // Show loading state
                    if (!hasOutput(part)) {
                      return (
                        <div key={partKey} className="bg-white/70 border border-gray-200/50 rounded-2xl p-4 backdrop-blur-md">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-black" />
                            <span className="text-sm text-gray-600">Creating booking...</span>
                          </div>
                        </div>
                      )
                    }

                    const output = part.output as BookingOutput;

                    // Show error if booking failed
                    if (!output.success) {
                      return (
                        <div key={partKey} className="p-4 bg-red-50 border border-red-200 rounded-xl">
                          <p className="text-red-700 text-sm">
                            {output.message || "Failed to create booking"}
                          </p>
                        </div>
                      )
                    }

                    // Show confirmation if booking was successful
                    return (
                      <div key={partKey} className="bg-white/70 border border-gray-200/50 rounded-2xl p-4 backdrop-blur-md">
                        <BookingConfirmation
                          booking={output.booking}
                          confirmationId={output.confirmationId}
                        />
                      </div>
                    )
                  }

                  return null;
                })}
              </div>
            </div>
          ))
        )}

        {isChatLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isChatLoading}
      />

      {/* Modals area */}
      {showMap && selectedCoworking && (
        <MapModal
          coworking={selectedCoworking}
          onBook={handleBooking}
          onClose={handleCloseMap}
        />
      )}

      {/* User profile modal */}
      <UserProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </div>
  )
}