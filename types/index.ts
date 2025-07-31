// src/types/index.ts

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