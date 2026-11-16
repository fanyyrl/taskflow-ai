import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Task, TaskInput } from "../types";

export function useTasks(uid: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uid) {
      setTasks([]);
      setLoading(false);
      return;
    }
    const q = query(collection(db, "tasks"), where("ownerUid", "==", uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Task);
        rows.sort((a, b) => a.deadline.localeCompare(b.deadline));
        setTasks(rows);
        setLoading(false);
      },
      () => {
        setError("Gagal memuat tugas. Periksa Security Rules dan koneksi.");
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [uid]);

  const addTask = async (input: TaskInput) => {
    await addDoc(collection(db, "tasks"), { ...input, ownerUid: uid, createdAt: Date.now() });
  };

  const updateTask = async (id: string, patch: Partial<TaskInput>) => {
    await updateDoc(doc(db, "tasks", id), patch);
  };

  const removeTask = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  return { tasks, loading, error, addTask, updateTask, removeTask };
}
