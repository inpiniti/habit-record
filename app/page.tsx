'use client';


import { useState, useEffect } from 'react';
import { HabitCreator } from './components/habit-creator';
import { HabitList } from './components/habit-list';
import { HabitTracker } from './components/habit-tracker';
import { useHabitStore } from '../store/habit-store';

// 모바일 감지 훅 (Tailwind sm 이하)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768); // tailwind md 기준
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function Home() {
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const habits = useHabitStore((state) => state.habits);
  const isMobile = useIsMobile();

  // 모바일: 목록/상세 분리, 데스크탑: 기존처럼
  // 모바일에서 습관 추가 후 자동 상세 진입 방지
  useEffect(() => {
    if (!selectedHabitId && habits.length > 0 && !isMobile) {
      setSelectedHabitId(habits[0].id);
    }
    // 모바일에서 습관이 삭제되어 selected가 없으면 목록으로
    if (isMobile && selectedHabitId && !habits.find(h => h.id === selectedHabitId)) {
      setSelectedHabitId(null);
    }
  }, [habits, selectedHabitId, isMobile]);

  // 습관명 가져오기
  const selectedHabit = habits.find(h => h.id === selectedHabitId) || null;

  return (
    <main className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Habit Tracker</h1>
        <HabitCreator />
      </header>

      {/* 모바일: 목록/상세 분리 */}
      {isMobile ? (
        <div>
          {/* 상세화면 */}
          {selectedHabitId && selectedHabit ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <button
                  className="flex items-center gap-1 text-lg font-semibold px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => setSelectedHabitId(null)}
                >
                  <span className="text-2xl">&#60;</span>
                  <span>{selectedHabit.name}</span>
                </button>
              </div>
              <HabitTracker habitId={selectedHabitId} />
            </>
          ) : (
            // 목록화면
            <>
              <h2 className="text-2xl font-semibold mb-4">My Habits</h2>
              <div>
                <HabitList onSelectHabit={setSelectedHabitId} selectedHabitId={selectedHabitId} />
              </div>
            </>
          )}
        </div>
      ) : (
        // 데스크탑: 기존 레이아웃
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <aside className="md:col-span-1">
            <h2 className="text-2xl font-semibold mb-4">My Habits</h2>
            <div>
              <HabitList onSelectHabit={setSelectedHabitId} selectedHabitId={selectedHabitId} />
            </div>
          </aside>
          <section className="md:col-span-2">
            {selectedHabitId ? (
              <HabitTracker habitId={selectedHabitId} />
            ) : (
              <div className="flex items-center justify-center h-full border rounded-lg bg-gray-50">
                <p className="text-gray-500">
                  Select a habit to see your progress.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
