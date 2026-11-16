import { useState, type FormEvent } from "react";
import type { Priority, Task, TaskInput } from "../types";
import { PRIORITY_LABEL, todayStr } from "../utils";

interface Props {
  initial?: Task;
  courses: string[];
  onSubmit: (input: TaskInput) => Promise<void>;
  onCancel?: () => void;
}

const emptyForm = (): TaskInput => ({
  title: "",
  course: "",
  deadline: todayStr(),
  priority: "medium",
  progress: 0,
  estimateHours: 2,
  notes: "",
});

export default function TaskForm({ initial, courses, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<TaskInput>(
    initial
      ? {
          title: initial.title,
          course: initial.course,
          deadline: initial.deadline,
          priority: initial.priority,
          progress: initial.progress,
          estimateHours: initial.estimateHours,
          notes: initial.notes,
        }
      : emptyForm(),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof TaskInput>(key: K, value: TaskInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSubmit({ ...form, title: form.title.trim(), course: form.course.trim() });
      if (!initial) setForm(emptyForm());
    } catch {
      setError("Gagal menyimpan tugas. Coba lagi.");
    }
    setBusy(false);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Judul tugas
        <input required value={form.title} onChange={(e) => set("title", e.target.value)} />
      </label>
      <label>
        Mata kuliah
        <input
          required
          list="courses"
          value={form.course}
          onChange={(e) => set("course", e.target.value)}
        />
        <datalist id="courses">
          {courses.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>
      <label>
        Deadline
        <input
          type="date"
          required
          value={form.deadline}
          onChange={(e) => set("deadline", e.target.value)}
        />
      </label>
      <label>
        Prioritas
        <select value={form.priority} onChange={(e) => set("priority", e.target.value as Priority)}>
          {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Estimasi (jam)
        <input
          type="number"
          min={0.5}
          step={0.5}
          required
          value={form.estimateHours}
          onChange={(e) => set("estimateHours", Number(e.target.value))}
        />
      </label>
      <label className="full">
        Catatan
        <input value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </label>
      {error && <p className="error full">{error}</p>}
      <div className="full row">
        <button className="btn" disabled={busy}>
          {initial ? "Simpan" : "Tambah tugas"}
        </button>
        {onCancel && (
          <button type="button" className="btn ghost" onClick={onCancel}>
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
