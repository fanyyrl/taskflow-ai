import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../hooks/useTasks";
import { useHolidays } from "../hooks/useHolidays";
import { daysLeft, formatDate, isOpen, PRIORITY_LABEL, sortByDeadline, statusLabel } from "../utils";

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, loading, error } = useTasks(user?.uid ?? "");
  const { holidays, error: holidayError } = useHolidays();

  const open = tasks.filter(isOpen);
  const done = tasks.length - open.length;
  const late = open.filter((t) => daysLeft(t.deadline) < 0).length;
  const overall = tasks.length
    ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length)
    : 0;

  const byCourse = new Map<string, { total: number; done: number; sum: number }>();
  for (const t of tasks) {
    const c = byCourse.get(t.course) ?? { total: 0, done: 0, sum: 0 };
    c.total += 1;
    c.sum += t.progress;
    if (t.progress >= 100) c.done += 1;
    byCourse.set(t.course, c);
  }

  const upcoming = sortByDeadline(open).slice(0, 5);

  if (loading) return <p className="muted">Memuat...</p>;

  return (
    <>
      <h1>Dashboard</h1>
      <p className="sub">Ringkasan tugas kuliah dan deadline terdekat.</p>
      {error && <p className="error">{error}</p>}

      <div className="grid">
        <div className="card stat">
          <b>{tasks.length}</b>
          <span>Total tugas</span>
        </div>
        <div className="card stat">
          <b>{done}</b>
          <span>Selesai</span>
        </div>
        <div className="card stat">
          <b>{open.length}</b>
          <span>Belum selesai</span>
        </div>
        <div className="card stat">
          <b className={late ? "danger" : ""}>{late}</b>
          <span>Terlambat</span>
        </div>
      </div>

      <div className="card section">
        <h2>Progress keseluruhan: {overall}%</h2>
        <div className="bar">
          <div style={{ width: `${overall}%` }} />
        </div>
      </div>

      <div className="grid-2 section">
        <div className="card">
          <h2>Deadline terdekat</h2>
          {upcoming.length === 0 ? (
            <p className="muted">
              Belum ada tugas aktif. <Link to="/tasks">Tambah tugas</Link>
            </p>
          ) : (
            <ul className="list">
              {upcoming.map((t) => (
                <li key={t.id}>
                  <div>
                    <strong>{t.title}</strong>
                    <div className="muted small">
                      {t.course} · {formatDate(t.deadline)} · Prioritas {PRIORITY_LABEL[t.priority]}
                    </div>
                  </div>
                  <span className={`chip ${daysLeft(t.deadline) < 0 ? "high" : ""}`}>
                    {statusLabel(t)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2>Progress per mata kuliah</h2>
          {byCourse.size === 0 ? (
            <p className="muted">Belum ada data.</p>
          ) : (
            [...byCourse.entries()].map(([course, c]) => (
              <div key={course} className="course">
                <div className="row between small">
                  <span>{course}</span>
                  <span className="muted">
                    {c.done}/{c.total} selesai
                  </span>
                </div>
                <div className="bar">
                  <div style={{ width: `${Math.round(c.sum / c.total)}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card section">
        <h2>Hari libur nasional terdekat</h2>
        {holidayError && <p className="muted">{holidayError}</p>}
        <ul className="list">
          {holidays.slice(0, 4).map((h) => (
            <li key={h.date + h.name}>
              <span>{h.localName}</span>
              <span className="muted small">{formatDate(h.date)}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
