import { create } from "zustand";

/**
 * Task model (frontend-ready and backend-friendly)
 * ------------------------------------------------
 * id: string
 * title: string (required)
 * status: "todo" | "in-progress" | "done"
 * plannedDate: "YYYY-MM-DD" (the day user plans to work on it)  ✅ used by Calendar/Board
 * deadline: "YYYY-MM-DD" | "" (optional, used for overdue and due-today)
 * priority: "high" | "medium" | "low" (computed)
 * category: string
 * notes: string
 * importance: number | ""  (optional)
 * effort: number | ""      (optional, hours)
 */

const useTaskStore = create((set) => ({
    tasks: [],

    addTask: (task) =>
        set((state) => ({
            tasks: [task, ...state.tasks], // newest first (more real-world)
        })),

    deleteTask: (id) =>
        set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
        })),

    updateTask: (updatedTask) =>
        set((state) => ({
            tasks: state.tasks.map((task) =>
                task.id === updatedTask.id ? updatedTask : task
            ),
        })),
}));

export default useTaskStore;