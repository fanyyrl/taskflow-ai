const gap = [
  ["Pencatatan tugas & deadline", "Ya", "Ya"],
  ["Kategori per mata kuliah, progres", "Ya", "Ya"],
  ["Rekomendasi prioritas", "Manual", "AI (LLM)"],
  ["Pembagian waktu harian", "Manual", "AI menyusun jadwal"],
  ["Mempertimbangkan sisa pekerjaan & hari libur", "Tidak", "Ya"],
];

const services = [
  ["Authentication", "Daftar, login, dan logout pengguna dengan Email/Password."],
  ["Cloud Firestore", "Database dokumen NoSQL: collection tasks berisi dokumen tugas."],
  ["Security Rules", "Aturan akses baca/tulis; tiap pengguna hanya mengakses data miliknya (ownerUid)."],
  ["onSnapshot", "Listener realtime: perubahan data langsung tampil tanpa refresh."],
];

const compare = [
  ["Struktur", "Collection → document", "Table → row/column"],
  ["Skema", "Fleksibel", "Formal dengan relasi"],
  ["Akses data", "Langsung dari SDK + Security Rules", "Melalui backend/API"],
  ["Realtime", "Bawaan (onSnapshot)", "Perlu implementasi tambahan"],
];

const flow = [
  "Pengguna login lewat Firebase Authentication.",
  "Tugas disimpan di Cloud Firestore dengan ownerUid pengguna.",
  "Saat AI diminta, data tugas dikirim ke endpoint server /api/ai.",
  "Server memanggil Gemini dengan API key rahasia, lalu mengembalikan JSON terstruktur.",
  "Aplikasi menampilkan prioritas/jadwal dan dapat menerapkannya ke Firestore.",
  "REST API Nager.Date menyediakan hari libur nasional untuk dashboard dan jadwal.",
];

export default function Learn() {
  return (
    <>
      <h1>Materi</h1>
      <p className="sub">Latar belakang riset dan konsep Firebase yang dipakai pada aplikasi ini.</p>

      <div className="card section">
        <h2>Paper acuan</h2>
        <p>
          Bhattacharjee et al., CHI ’24 — <em>Understanding the Role of Large Language Models in
          Personalizing and Scaffolding Strategies to Combat Academic Procrastination</em>. Paper ini
          membahas pemanfaatan LLM untuk mempersonalisasi dan menuntun strategi mengatasi prokrastinasi
          akademik.
        </p>
        <p>
          <strong>Peluang pengembangan:</strong> to-do list konvensional hanya mencatat tugas dan
          deadline. TaskFlow AI mengubah data tugas nyata pengguna menjadi rekomendasi prioritas dan
          jadwal pengerjaan yang konkret, dan hasilnya dapat diuji.
        </p>
      </div>

      <div className="card section">
        <h2>To-do konvensional vs TaskFlow AI</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Aspek</th>
                <th>Konvensional</th>
                <th>TaskFlow AI</th>
              </tr>
            </thead>
            <tbody>
              {gap.map((r) => (
                <tr key={r[0]}>
                  {r.map((c) => (
                    <td key={c}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card section">
        <h2>Firebase sebagai Backend as a Service</h2>
        <p>
          Firebase adalah platform dari Google yang menyediakan layanan backend terkelola dengan SDK
          untuk web dan mobile, sehingga aplikasi tidak selalu memerlukan backend sendiri.
        </p>
        <ul className="list">
          {services.map(([name, desc]) => (
            <li key={name}>
              <div>
                <strong>{name}</strong>
                <div className="muted small">{desc}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card section">
        <h2>Cloud Firestore vs MySQL</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Aspek</th>
                <th>Cloud Firestore</th>
                <th>MySQL</th>
              </tr>
            </thead>
            <tbody>
              {compare.map((r) => (
                <tr key={r[0]}>
                  {r.map((c) => (
                    <td key={c}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card section">
        <h2>Alur sistem</h2>
        <ol className="tips">
          {flow.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ol>
        <p className="small muted">
          Keamanan: konfigurasi Firebase web bukan kredensial admin sehingga Security Rules tetap
          wajib, sedangkan API key Gemini hanya berada di server.
        </p>
      </div>
    </>
  );
}
