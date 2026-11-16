import type { Priority, Task } from "./types";

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};

const pad = (n: number) => String(n).padStart(2, "0");

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function daysLeft(deadline: string): number {
  const ms = Date.parse(`${deadline}T00:00:00`) - Date.parse(`${todayStr()}T00:00:00`);
  return Math.round(ms / 86400000);
}

export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function statusLabel(task: Task): string {
  if (task.progress >= 100) return "Selesai";
  const d = daysLeft(task.deadline);
  if (d < 0) return `Terlambat ${-d} hari`;
  if (d === 0) return "Hari ini";
  return `H-${d}`;
}

export const isOpen = (t: Task) => t.progress < 100;

// Urutan konvensional (pembanding): hanya berdasarkan deadline terdekat.
export const sortByDeadline = (tasks: Task[]) =>
  [...tasks].sort((a, b) => a.deadline.localeCompare(b.deadline));
