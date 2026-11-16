import type { HolidayItem } from "../types";

// REST API publik: https://date.nager.at
export async function fetchHolidays(year: number): Promise<HolidayItem[]> {
  const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/ID`);
  if (!res.ok) throw new Error("Gagal memuat hari libur");
  const data = (await res.json()) as HolidayItem[];
  return data.map((h) => ({ date: h.date, localName: h.localName, name: h.name }));
}
