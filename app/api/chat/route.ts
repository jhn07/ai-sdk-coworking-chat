import { UIMessage } from "@ai-sdk/react";
import { convertToModelMessages, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { searchCoworkingsTool, createBookingTool } from "@/lib/ai/tools";

export const maxDuration = 30;


export async function POST(req: Request) {
  const { messages, user }: { messages: UIMessage[], user: { name: string, email: string } } = await req.json();

  const hasUser = user && user.name && user.email;

  // In the system message, add instructions for the model
  const system = `You are a helpful coworking space assistant in Montreal.

  CONVERSATIONAL SEARCH FLOW:
  - When user asks to find a space, assess if you have enough info
  - If query is vague (e.g., "find a space", "need workspace"), ask clarifying questions:
    • Budget: "What's your budget per day?"
    • Team size: "Is this for solo work or a team?"
    • Must-have amenities: "Any must-haves? (meeting room, parking, 24/7 access, quiet zone)"
  - Be conversational and ask ONE question at a time
  - Once you have clear criteria, use searchCoworkings tool
  - If query is specific (e.g., "quiet space under $30 in Plateau"), search immediately

  SEARCH BEHAVIOR:
  - Use searchCoworkings tool with collected filters
  - Highlight key features based on user's stated needs
  - Be concise and helpful

  BOOKING BEHAVIOR:
  ${!hasUser
      ? "- User is NOT signed in. If they try to book, politely ask them to sign in first."
      : `- User is signed in as ${user.name} (${user.email})
    - When user wants to book, use the createBooking tool
    - Required info: coworking name, time, duration
    - Date defaults to today if not specified
    - Confirm all details before finalizing`
    }

  GUIDELINES:
  - Be natural and conversational
  - Don't overwhelm with too many questions
  - If location is unclear, assume Montreal
  - Keep responses concise`


  // Stream the text
  const stream = streamText({
    model: openai('gpt-4o'),
    messages: convertToModelMessages(messages),
    system: system,
    tools: {
      searchCoworkings: searchCoworkingsTool,
      createBooking: createBookingTool(user),
    },
    maxRetries: 5,
    toolChoice: "auto",
    temperature: 0.6,
  });

  // Return the UI message stream response
  return stream.toUIMessageStreamResponse()
}