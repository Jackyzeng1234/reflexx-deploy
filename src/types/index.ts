export interface TestResult {
  id: string;
  testType: string;
  score: number;
  duration?: number;
  timestamp: number;
  deviceInfo?: string;
}

export interface LeaderboardEntry {
  rank: number;
  score: number;
  timestamp: number;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
}

export type TestDuration = 1 | 5 | 10 | 30 | 60 | 100;

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface TestStats {
  totalTests: number;
  averageScore: number;
  bestScore: number;
  recentScores: number[];
}
