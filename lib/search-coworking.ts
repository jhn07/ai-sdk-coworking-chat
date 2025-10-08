import { z } from "zod"
import type { Coworking, SearchArgs } from "@/types"
import dataset from "./coworkings.montreal.json" assert { type: "json" }

// Zod schema для валидации
export const CoworkingSchema = z.object({
  name: z.string(),
  address: z.string(),
  district: z.string().optional(),
  wifi: z.string(),
  price: z.string(),
  dayPass: z.number().optional(),
  monthly: z.number().optional(),
  amenities: z.array(z.string()),
  rating: z.number().min(0).max(5),
  image: z.string().url(),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

/**
 * Поиск и ранжирование по:
 *  1) Точное/частичное совпадение района
 *  2) Рейтинг
 *  3) Текстовые попадания (name/address/district/amenities/wi-fi/price)
 */
export async function searchCoworkings({
  city = "Montreal",
  district,
  query,
  max = 5,
}: SearchArgs): Promise<{ coworkings: Coworking[]; fallback: Coworking[] }> {
  const data = dataset as Coworking[]

  // 1) базовая фильтрация по городу (по адресу)
  const base = data.filter((cw) => includesInsensitive(cw.address, city))

  // 2) собираем общий поисковый запрос
  const q = normalize([district, query].filter(Boolean).join(" ").trim())

  // 3) доп. фильтрация по тексту/району
  const filtered = q ? base.filter((cw) => matchesCoworking(cw, q)) : base.slice()

  // 4) скоринг (район > рейтинг > текстовые попадания)
  const d = district ? normalize(district) : ""
  const ranked = filtered
    .map((cw) => ({
      cw,
      score:
        (d && includesNormalized(cw.district, d) ? 2.0 : 0) +          // приоритет совпадения района
        (cw.rating ?? 0) / 5 +                                         // рейтинг
        hitsCount(cw, q) * 0.25,                                       // текстовые совпадения
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.cw)

  const coworkings = ranked.slice(0, max)

  // 5) fallback (если результатов мало — добираем из базы по рейтингу)
  const need = Math.max(0, max - coworkings.length)
  const fallback =
    need > 0
      ? base
        .filter((cw) => !coworkings.includes(cw))
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, need)
      : []

  // 6) валидация (можно отключить в проде ради скорости)
  coworkings.forEach((cw) => CoworkingSchema.parse(cw))
  fallback.forEach((cw) => CoworkingSchema.parse(cw))

  return { coworkings, fallback }
}

// ---------- helpers ----------

function normalize(s?: string) {
  return (s || "").toLowerCase().normalize("NFKD")
}

function includesInsensitive(haystack: string, needle: string) {
  return normalize(haystack).includes(normalize(needle))
}

function includesNormalized(haystack?: string, needle?: string) {
  return normalize(haystack).includes(normalize(needle))
}

function matchesCoworking(cw: Coworking, q: string) {
  if (!q) return true
  const n = normalize(q)
  return (
    includesNormalized(cw.name, n) ||
    includesNormalized(cw.address, n) ||
    includesNormalized(cw.district, n) ||
    includesNormalized(cw.wifi, n) ||
    includesNormalized(cw.price, n) ||
    cw.amenities?.some((a) => includesNormalized(a, n))
  )
}

function hitsCount(cw: Coworking, q: string) {
  if (!q) return 0
  const n = normalize(q)
  let hits = 0
  const add = (ok: boolean) => { if (ok) hits += 1 }
  add(includesNormalized(cw.name, n))
  add(includesNormalized(cw.address, n))
  add(includesNormalized(cw.district, n))
  add(includesNormalized(cw.wifi, n))
  add(includesNormalized(cw.price, n))
  cw.amenities?.forEach((a) => add(includesNormalized(a, n)))
  return hits
}
