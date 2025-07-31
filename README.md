# 습관 기록 앱 프로젝트 기획서

---

## 1. 프로젝트 개요

- **프로젝트명**: Habit Tracker (가칭)
- **목표**: 사용자가 자신의 습관을 생성하고, 캘린더를 통해 매일의 실천 여부를 시각적으로 기록하며 성취감을 느낄 수 있는 웹 애플리케이션을 개발합니다.
- **주요 기술 스택**:
  - **프레임워크**: Next.js (App Router)
  - **UI**: Tailwind CSS, shadcn/ui
  - **상태 관리**: Zustand
  - **언어**: TypeScript

---

## 2. 주요 기능 명세

### 2.1. 습관 관리

- **습관 생성**:
  - 사용자는 새로운 습관을 추가할 수 있습니다.
  - 입력 필드: 습관 이름 (필수), 설명 (선택)
  - `shadcn/ui`의 `Dialog` 또는 `Sheet` 컴포넌트를 사용하여 생성 폼을 제공합니다.
- **습관 목록 조회**:
  - 생성된 모든 습관이 목록 형태로 표시됩니다.
  - 각 습관 항목을 클릭하면 해당 습관의 기록 캘린더를 볼 수 있습니다.
- **습관 수정 및 삭제**:
  - 기존 습관의 이름이나 설명을 수정할 수 있습니다.
  - 불필요한 습관을 삭제할 수 있습니다.

### 2.2. 습관 기록 (캘린더)

- **연간 캘린더 뷰**:
  - 특정 습관을 선택하면, 해당 연도의 1월부터 12월까지의 모든 달력이 한 화면에 표시됩니다.
  - `shadcn/ui`의 `Calendar` 컴포넌트를 12개 렌더링하여 구현합니다.
- **다중 날짜 선택 (Multi-select)**:
  - 사용자는 캘린더에서 습관을 실천한 날짜들을 여러 개 선택하여 체크할 수 있습니다.
  - `Calendar` 컴포넌트의 `mode="multiple"` 속성을 활용합니다.
  - 선택된 날짜는 시각적으로 구분되어 표시됩니다.
- **데이터 연동**:
  - 각 습관별로 체크된 날짜 데이터가 저장되고, 캘린더에 반영됩니다.

---

## 3. 데이터 모델

상태 관리는 Zustand를 사용하며, 데이터 구조는 다음과 같이 설계할 수 있습니다. 데이터 영속성을 위해 초기에는 `localStorage`를 사용하고, 추후 데이터베이스(예: Supabase, Firebase) 연동을 고려할 수 있습니다.

```typescript
// app/types/index.ts

// 개별 습관의 형태
export interface Habit {
  id: string; // 고유 ID (e.g., UUID)
  name: string; // 습관 이름
  description?: string; // 습관 설명 (선택)
  createdAt: Date; // 생성일
}

// 습관 실천 기록
// 어떤 습관(habitId)을 언제(date) 실천했는지 기록
export interface HabitRecord {
  habitId: string;
  date: string; // 'YYYY-MM-DD' 형식의 문자열
}
```

---

## 4. 컴포넌트 구조 제안

```
app/
├── app/
│   ├── layout.tsx       # 루트 레이아웃
│   └── page.tsx         # 메인 페이지 (습관 목록 및 캘린더 표시)
├── components/
│   ├── habit-creator.tsx    # 새 습관 생성 다이얼로그
│   ├── habit-list.tsx       # 습관 목록
│   ├── habit-item.tsx       # 개별 습관 항목
│   └── habit-tracker.tsx    # 연간 캘린더 뷰 전체를 감싸는 컴포넌트
├── lib/
│   └── utils.ts         # shadcn/ui 기본 유틸리티 파일
└── store/
    └── habit-store.ts   # Zustand 스토어 (상태 및 액션 정의)
```

---

## 5. 상태 관리 (Zustand)

Zustand 스토어는 습관 목록과 기록을 전역적으로 관리합니다.

**`app/store/habit-store.ts` 예시:**

```typescript
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
```

_참고: `uuid` 라이브러리 설치가 필요합니다 (`npm install uuid @types/uuid`)._

---

## 6. 핵심 기능 코드 예시: 연간 캘린더 뷰

`shadcn/ui`의 `Calendar`를 사용하여 1월부터 12월까지 표시하는 컴포넌트의 기본 구조입니다.

**`app/components/habit-tracker.tsx` 예시:**

```tsx
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

    // 새로 추가된 날짜 찾기
    newDateSet.forEach((dateStr) => {
      if (!oldDateSet.has(dateStr)) {
        toggleRecord(habitId, new Date(dateStr));
      }
    });

    // 제거된 날짜 찾기
    oldDateSet.forEach((dateStr) => {
      if (!newDateSet.has(dateStr)) {
        toggleRecord(habitId, new Date(dateStr));
      }
    });

    setDates(newDates);
  };

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
```
