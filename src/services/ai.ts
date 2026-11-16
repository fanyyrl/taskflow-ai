import type { PriorityResult, ScheduleResult, Task } from "../types";
import { isOpen, todayStr } from "../utils";

async function callAi<T>(
  mode: "prioritize" | "schedule",
  tasks: Task[],
  hoursPerDay: number,
  holidays: string[],
): Promise<T> {
  const payload = {
    mode,
    today: todayStr(),
    hoursPerDay,
    holidays,
    tasks: tasks.filter(isOpen).map((t) => ({
      id: t.id,
      title: t.title,
      course: t.course,
      deadline: t.deadline,
      priority: t.priority,
      progress: t.progress,
      estimateHours: t.estimateHours,
    })),
  };

  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as { result?: T; error?: string };
  if (!res.ok || !data.result) throw new Error(data.error ?? "Permintaan AI gagal.");
  return data.result;
}

export const prioritizeTasks = (tasks: Task[]) =>
  callAi<PriorityResult>("prioritize", tasks, 0, []);

export const scheduleTasks = (tasks: Task[], hoursPerDay: number, holidays: string[]) =>
  callAi<ScheduleResult>("schedule", tasks, hoursPerDay, holidays);
