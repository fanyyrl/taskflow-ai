import { useEffect, useState } from "react";
import { fetchHolidays } from "../services/holidays";
import type { HolidayItem } from "../types";
import { todayStr } from "../utils";

export function useHolidays() {
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const year = new Date().getFullYear();
    Promise.all([fetchHolidays(year), fetchHolidays(year + 1)])
      .then((lists) => {
        if (active) setHolidays(lists.flat().filter((h) => h.date >= todayStr()).slice(0, 6));
      })
      .catch(() => {
        if (active) setError("Hari libur nasional tidak dapat dimuat.");
      });
    return () => {
      active = false;
    };
  }, []);

  return { holidays, error };
}
