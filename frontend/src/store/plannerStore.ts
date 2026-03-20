import { create } from "zustand";

type PlannerState = {
    selectedDate: string;
    setSelectedDate: (date: string) => void;
};

export const usePlannerStore = create<PlannerState>((set) => ({
    selectedDate: new Date().toISOString(),
    setSelectedDate: (date) => set({ selectedDate: date }),
}));