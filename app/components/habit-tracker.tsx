'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useHabitStore } from '@/store/habit-store';

interface HabitTrackerProps {
  habitId: string;
}

export function HabitTracker({ habitId }: HabitTrackerProps) {
  const { getRecordsForHabit, toggleRecord } = useHabitStore();

  // Zustand 스토어에서 해당 습관의 기록된 날짜들을 가져옵니다.
  const [dates, setDates] = React.useState<Date[] | undefined>(
    getRecordsForHabit(habitId)
  );

  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i); // 0 to 11

  // 날짜 선택/해제 시 Zustand 스토어 업데이트
  const handleDateSelect = (newDates: Date[] | undefined) => {
    const oldDates = dates || [];
    const newDateSet = new Set(
      newDates?.map((d) => d.toISOString().split('T')[0])
    );
    const oldDateSet = new Set(
      oldDates.map((d) => d.toISOString().split('T')[0])
    );

    // This logic is flawed, it should find the changed date
    // and toggle it.
    const allDates = new Set([...(newDates || []), ...oldDates].map(d => d.toISOString().split('T')[0]));

    allDates.forEach(dateStr => {
        const inNew = newDateSet.has(dateStr);
        const inOld = oldDateSet.has(dateStr);
        if (inNew !== inOld) {
            toggleRecord(habitId, new Date(dateStr));
        }
    });


    setDates(getRecordsForHabit(habitId));
  };

  // Re-sync with store when habitId changes
  React.useEffect(() => {
    setDates(getRecordsForHabit(habitId));
  }, [habitId, getRecordsForHabit]);


  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-center">
        {currentYear}년 기록
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map((monthIndex) => (
          <div key={monthIndex}>
            <h3 className="text-lg font-semibold text-center mb-2">
              {new Date(currentYear, monthIndex).toLocaleString('default', {
                month: 'long',
              })}
            </h3>
            <Calendar
              mode="multiple"
              selected={dates}
              onSelect={handleDateSelect}
              defaultMonth={new Date(currentYear, monthIndex)}
              className="rounded-md border"
              // 다른 달의 날짜는 보이지 않게 처리
              showOutsideDays={false}
              // 네비게이션 버튼 숨기기
              classNames={{
                nav: 'hidden',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
