export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  course: string;
  deadline: string; // YYYY-MM-DD
  priority: Priority;
  progress: number; // 0-100
  estimateHours: number;
  notes: string;
  ownerUid: string;
  createdAt: number;
}

export type TaskInput = Omit<Task, "id" | "ownerUid" | "createdAt">;

export interface HolidayItem {
  date: string;
  localName: string;
  name: string;
}

export interface PriorityItem {
  id: string;
  rank: number;
  priority: Priority;
  reason: string;
}

export interface PriorityResult {
  items: PriorityItem[];
}

export interface ScheduleSlot {
  taskId: string;
  hours: number;
  focus: string;
}

export interface ScheduleDay {
  date: string;
  slots: ScheduleSlot[];
}

export interface ScheduleResult {
  days: ScheduleDay[];
  tips: string[];
}
