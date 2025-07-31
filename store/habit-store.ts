import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Habit, HabitRecord } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface HabitState {
  habits: Habit[];
  records: HabitRecord[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  deleteHabit: (id: string) => void;
  toggleRecord: (habitId: string, date: Date) => void;
  getRecordsForHabit: (habitId: string) => Date[];
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      records: [],

      addHabit: (habit) => {
        const newHabit: Habit = {
          id: uuidv4(),
          ...habit,
          createdAt: new Date(),
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          records: state.records.filter((r) => r.habitId !== id),
        }));
      },

      toggleRecord: (habitId, date) => {
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const existingRecord = get().records.find(
          (r) => r.habitId === habitId && r.date === dateString
        );

        if (existingRecord) {
          // 기록이 있으면 제거 (토글)
          set((state) => ({
            records: state.records.filter(
              (r) => !(r.habitId === habitId && r.date === dateString)
            ),
          }));
        } else {
          // 기록이 없으면 추가
          set((state) => ({
            records: [...state.records, { habitId, date: dateString }],
          }));
        }
      },

      getRecordsForHabit: (habitId) => {
        return get()
          .records.filter((r) => r.habitId === habitId)
          .map((r) => new Date(r.date));
      },
    }),
    {
      name: 'habit-storage', // localStorage에 저장될 키 이름
      storage: createJSONStorage(() => localStorage),
    }
  )
);
