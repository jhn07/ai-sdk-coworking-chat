import { UIMessage } from "@ai-sdk/react";
import { useEffect, useRef } from "react";

export function useScrollToBottom(messages: UIMessage[]) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return { messagesEndRef }
}