import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../hooks/useTasks";
import TaskForm from "../components/TaskForm";
import { daysLeft, formatDate, PRIORITY_LABEL, statusLabel } from "../utils";

type StatusFilter = "all" | "open" | "done";

export default function Tasks() {
  const { user } = useAuth();
  const { tasks, loading, error, addTask, updateTask, removeTask } = useTasks(user?.uid ?? "");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [course, setCourse] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState("");

  const courses = [...new Set(tasks.map((t) => t.course))].sort();

  const visible = tasks.filter((t) => {
    if (course !== "all" && t.course !== course) return false;
    if (status === "open" && t.progress >= 100) return false;
    if (status === "done" && t.progress < 100) return false;
    return t.title.toLowerCase().includes(search.toLowerCase());
  });

  const run = async (action: () => Promise<void>) => {
    setActionError("");
    try {
      await action();
    } catch {
      setActionError("Aksi gagal. Periksa koneksi lalu coba lagi.");
    }
  };

  return (
    <>
      <h1>Tugas</h1>
      <p className="sub">Catat tugas, deadline, prioritas, dan progres pengerjaan.</p>

      <div className="card section">
        <h2>Tambah tugas</h2>
        <TaskForm courses={courses} onSubmit={addTask} />
      </div>

      <div className="card section filters">
        <input
          placeholder="Cari tugas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={course} onChange={(e) => setCourse(e.target.value)}>
          <option value="all">Semua mata kuliah</option>
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
          <option value="all">Semua status</option>
          <option value="open">Belum selesai</option>
          <option value="done">Selesai</option>
        </select>
      </div>

      {(error || actionError) && <p className="error">{error || actionError}</p>}
      {loading && <p className="muted">Memuat...</p>}
      {!loading && visible.length === 0 && <p className="muted">Tidak ada tugas yang cocok.</p>}

      {visible.map((t) =>
        editingId === t.id ? (
          <div key={t.id} className="card section">
            <TaskForm
              initial={t}
              courses={courses}
              onCancel={() => setEditingId(null)}
              onSubmit={async (input) => {
                await updateTask(t.id, input);
                setEditingId(null);
              }}
            />
          </div>
        ) : (
          <div key={t.id} className="card section task">
            <div className="row between">
              <div>
                <strong className={t.progress >= 100 ? "struck" : ""}>{t.title}</strong>
                <div className="muted small">
                  {t.course} · {formatDate(t.deadline)} · ±{t.estimateHours} jam
                </div>
                {t.notes && <div className="small">{t.notes}</div>}
              </div>
              <div className="row">
                <span className={`chip ${t.priority}`}>{PRIORITY_LABEL[t.priority]}</span>
                <span className={`chip ${t.progress < 100 && daysLeft(t.deadline) < 0 ? "high" : ""}`}>
                  {statusLabel(t)}
                </span>
              </div>
            </div>
            <div className="bar">
              <div style={{ width: `${t.progress}%` }} />
            </div>
            <div className="row between">
              <label className="inline small">
                Progres
                <select
                  value={t.progress}
                  onChange={(e) => run(() => updateTask(t.id, { progress: Number(e.target.value) }))}
                >
                  {[0, 25, 50, 75, 100].map((p) => (
                    <option key={p} value={p}>
                      {p}%
                    </option>
                  ))}
                </select>
              </label>
              <div className="row">
                <button className="btn ghost" onClick={() => setEditingId(t.id)}>
                  Edit
                </button>
                <button
                  className="btn danger-btn"
                  onClick={() => {
                    if (window.confirm(`Hapus tugas "${t.title}"?`)) run(() => removeTask(t.id));
                  }}
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ),
      )}
    </>
  );
}
