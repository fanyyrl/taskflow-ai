import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../hooks/useTasks";
import { useHolidays } from "../hooks/useHolidays";
import { prioritizeTasks, scheduleTasks } from "../services/ai";
import type { Priority, PriorityResult, ScheduleResult } from "../types";
import { daysLeft, formatDate, isOpen, PRIORITY_LABEL, sortByDeadline } from "../utils";

const PRIORITIES: Priority[] = ["low", "medium", "high"];

export default function Planner() {
  const { user } = useAuth();
  const { tasks, loading, updateTask } = useTasks(user?.uid ?? "");
  const { holidays } = useHolidays();
  const [hours, setHours] = useState(3);
  const [priority, setPriority] = useState<PriorityResult | null>(null);
  const [schedule, setSchedule] = useState<ScheduleResult | null>(null);
  const [busy, setBusy] = useState<"" | "priority" | "schedule" | "apply">("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const open = tasks.filter(isOpen);
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const titleOf = (id: string) => byId.get(id)?.title ?? "(tugas tidak ditemukan)";

  const run = async (kind: "priority" | "schedule", action: () => Promise<void>) => {
    setBusy(kind);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Permintaan AI gagal.");
    }
    setBusy("");
  };

  const applyPriorities = async () => {
    if (!priority) return;
    setBusy("apply");
    setError("");
    try {
      const valid = priority.items.filter(
        (i) => byId.has(i.id) && PRIORITIES.includes(i.priority),
      );
      await Promise.all(valid.map((i) => updateTask(i.id, { priority: i.priority })));
      setNotice(`Prioritas ${valid.length} tugas berhasil diperbarui.`);
    } catch {
      setError("Gagal menerapkan prioritas.");
    }
    setBusy("");
  };

  const ranked = priority ? [...priority.items].sort((a, b) => a.rank - b.rank) : [];
  const baseline = sortByDeadline(open);

  if (loading) return <p className="muted">Memuat...</p>;

  return (
    <>
      <h1>AI Planner</h1>
      <p className="sub">
        AI membantu menentukan prioritas dan menyusun jadwal pengerjaan berdasarkan deadline dan sisa
        pekerjaan.
      </p>

      <div className="card section">
        <div className="row wrap-row">
          <label className="inline">
            Jam belajar per hari
            <input
              type="number"
              min={1}
              max={12}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="narrow"
            />
          </label>
          <button
            className="btn"
            disabled={open.length === 0 || busy !== ""}
            onClick={() => run("priority", async () => setPriority(await prioritizeTasks(tasks)))}
          >
            {busy === "priority" ? "Menganalisis..." : "Tentukan prioritas"}
          </button>
          <button
            className="btn"
            disabled={open.length === 0 || busy !== ""}
            onClick={() =>
              run("schedule", async () => {
                const near = holidays.filter((h) => daysLeft(h.date) <= 14).map((h) => h.date);
                setSchedule(await scheduleTasks(tasks, hours, near));
              })
            }
          >
            {busy === "schedule" ? "Menyusun..." : "Susun jadwal"}
          </button>
        </div>
        {open.length === 0 && <p className="muted small">Tambahkan tugas yang belum selesai terlebih dahulu.</p>}
      </div>

      {error && <p className="error">{error}</p>}
      {notice && <p className="ok">{notice}</p>}

      {priority && (
        <div className="card section">
          <h2>Rekomendasi prioritas</h2>
          <ol className="list numbered">
            {ranked.map((i) => (
              <li key={i.id}>
                <div>
                  <strong>{titleOf(i.id)}</strong>
                  <div className="muted small">{i.reason}</div>
                </div>
                <span className={`chip ${i.priority}`}>{PRIORITY_LABEL[i.priority] ?? i.priority}</span>
              </li>
            ))}
          </ol>
          <p className="small muted">
            Urutan konvensional (hanya deadline): {baseline.map((t) => t.title).join(" → ")}
          </p>
          <button className="btn" disabled={busy !== ""} onClick={applyPriorities}>
            Terapkan prioritas ke tugas
          </button>
        </div>
      )}

      {schedule && (
        <div className="card section">
          <h2>Jadwal pengerjaan</h2>
          {schedule.days.map((d) => (
            <div key={d.date} className="day">
              <strong>{formatDate(d.date)}</strong>
              <ul className="list">
                {d.slots.map((s, idx) => (
                  <li key={idx}>
                    <div>
                      {titleOf(s.taskId)}
                      <div className="muted small">{s.focus}</div>
                    </div>
                    <span className="chip">{s.hours} jam</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {schedule.tips.length > 0 && (
            <>
              <h2>Saran</h2>
              <ul className="tips">
                {schedule.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </>
  );
}
