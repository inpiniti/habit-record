'use client';

import { Button } from '@/components/ui/button';
import { useHabitStore } from '@/store/habit-store';
import { Habit } from '@/types';
import { Trash2 } from 'lucide-react';

interface HabitItemProps {
  habit: Habit;
  isSelected?: boolean;
}

export function HabitItem({ habit, isSelected }: HabitItemProps) {
  const deleteHabit = useHabitStore((state) => state.deleteHabit);

  return (
    <div
      className={
        `flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50` +
        (isSelected ? ' bg-primary/10 border-primary' : '')
      }
      data-habit-id={habit.id}
    >
      <div>
        <h3 className="text-lg font-semibold">{habit.name}</h3>
        {habit.description && (
          <p className="text-sm text-gray-500">{habit.description}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation(); // Prevent habit selection when deleting
          deleteHabit(habit.id);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
