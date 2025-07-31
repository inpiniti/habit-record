'use client';

import { useHabitStore } from '@/store/habit-store';
import { HabitItem } from './habit-item';
import * as React from 'react';

interface HabitListProps {
  selectedHabitId?: string | null;
  onSelectHabit?: (id: string) => void;
}

export function HabitList({ selectedHabitId, onSelectHabit }: HabitListProps = {}) {
  const habits = useHabitStore((state) => state.habits);

  if (habits.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        <p>아직 추가된 습관이 없어요.</p>
        <p>새로운 습관을 추가해 보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <div
          key={habit.id}
          data-habit-id={habit.id}
          onClick={() => onSelectHabit?.(habit.id)}
          className={onSelectHabit ? 'cursor-pointer' : ''}
        >
          <HabitItem habit={habit} isSelected={habit.id === selectedHabitId} />
        </div>
      ))}
    </div>
  );
}
