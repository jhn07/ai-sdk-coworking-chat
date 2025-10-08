import { z } from "zod"
import { tool as createTool } from "ai"
import { searchCoworkings as searchCoworkingsLib } from "@/lib/search-coworking"
import { saveBookingToFile } from "@/lib/save-booking"

const CoworkingSearchSchema = z.object({
  city: z.string().default("Montreal"),
  district: z.string().optional().describe("District in Montreal"),
  query: z.string().optional().describe("Search keywords or amenities"),
  max: z.number().min(1).max(10).default(5),
  // New filters based on the conversation
  maxPrice: z.number().optional().describe("Maximum price per day in CAD"),
  teamSize: z.enum(["solo", "small", "large"]).optional().describe("Team size"),
  amenities: z.array(z.string()).optional().describe("Required amenities"),
})

type Params = z.infer<typeof CoworkingSearchSchema>

export const searchCoworkingsTool = createTool({
  description: "Search for coworking spaces in Montreal. Returns a list of spaces matching the search criteria, with optional fallback results from nearby areas.",
  inputSchema: CoworkingSearchSchema,
  execute: async (args: Params) => {
    try {

      let enhancedQuery = args.query || ""

      if (args.amenities?.length) {
        enhancedQuery = `${args.amenities.join(", ")}`
      }

      if (args.teamSize) {
        enhancedQuery += " meeting room large space"
      }

      const { coworkings, fallback } = await searchCoworkingsLib({
        ...args,
        query: enhancedQuery,
      })

      // Фильтруем ОБА массива по цене
      const filterByPrice = (spaces: Array<{ price: string }>) => {
        if (!args.maxPrice) return spaces;
        return spaces.filter(cw => {
          const price = parseInt(cw.price.match(/\d+/)?.[0] || "999");
          return price <= args.maxPrice!;
        });
      };

      const filteredCoworkings = filterByPrice(coworkings);
      const filteredFallback = filterByPrice(fallback || []);

      return {
        success: true,
        coworkings: filteredCoworkings,
        fallback: filteredFallback,
        total: filteredCoworkings.length + (fallback?.length || 0),
        appliedFilters: {
          maxPrice: args.maxPrice,
          teamSize: args.teamSize,
          amenities: args.amenities,
        },
      }

    } catch {
      return {
        success: false,
        error: "Failed to search coworking spaces",
        coworkings: [],
        fallback: [],
        total: 0,
      }
    }
  }
})


const BookingSchema = z.object({
  coworkingName: z.string().describe("The name of the coworking space"),
  time: z.string().describe("Start time in 24h format (e.g., 09:00, 14:00)"),
  duration: z.string().describe("Duration: 2h, 4h, 6h, 8h, or Full day"),
  date: z.string().optional().describe("Booking date in YYYY-MM-DD format (defaults to today)"),
});

type BookingParams = z.infer<typeof BookingSchema>


export const createBookingTool = (user: { name: string; email: string }) => createTool({
  description: `Create a booking for a coworking space.
  Only call this when user explicitly wants to book and all required info is available.
  Do NOT call if user is not signed in.`,
  inputSchema: BookingSchema,
  execute: async (args: BookingParams) => {
    try {
      // Get today's date if not provided
      const today = new Date().toISOString().split('T')[0]
      const bookingDate = args.date || today

      // Find full information about the coworking space
      const { coworkings } = await searchCoworkingsLib({
        city: "Montreal",
        query: args.coworkingName,
        max: 1
      })

      const space = coworkings[0]

      const bookingData = {
        coworking: args.coworkingName,
        date: bookingDate,
        time: args.time,
        duration: args.duration,
        price: space?.price || "Contact for pricing",
        timezone: "America/Toronto",
        address: space?.address,
        lat: space?.lat,
        lng: space?.lng,
      }

      // Используем пользователя, переданного в функцию
      await saveBookingToFile(user, bookingData)

      return {
        success: true,
        booking: bookingData,
        message: `Booking confirmed for ${args.coworkingName} on ${bookingDate} at ${args.time}`,
        confirmationId: `BK-${Date.now()}`,
      }

    } catch {
      return {
        success: false,
        error: "Booking failed",
        message: "Unable to complete booking. Please try again.",
      };
    }
  }
})