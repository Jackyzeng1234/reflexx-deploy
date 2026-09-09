// 统一评级:5 档 SD 常模分级(专业 + 诚实,无虚假百分位)
//
// 档位(5=最优):
//   5 Exceptional     —— 优于常模 ≥ 2 SD(前 ~2%)
//   4 Above average   —— 优于常模 0.5–2 SD
//   3 Average         —— 常模 ±0.5 SD(约 68% 人群)
//   2 Below average   —— 劣于常模 0.5–2 SD
//   1 Needs attention —— 劣于常模 ≥ 2 SD(后 ~2%)
//
// 阈值依据公开常模(均值 ± SD):简单/听觉/选择反应时、Hick 定律、经典 7±2 数字广度、
// CPS/WPM 人群分布等。落地前可用最新文献再校准,但量级已可参考。

export type RatingBucket = 1 | 2 | 3 | 4 | 5;

export type RatingLabelKey =
  | 'ratingExceptional'
  | 'ratingAboveAverage'
  | 'ratingAverage'
  | 'ratingBelowAverage'
  | 'ratingNeedsAttention';

const RATING_LABEL_KEY: Record<RatingBucket, RatingLabelKey> = {
  5: 'ratingExceptional',
  4: 'ratingAboveAverage',
  3: 'ratingAverage',
  2: 'ratingBelowAverage',
  1: 'ratingNeedsAttention'
};

const RATING_COLOR: Record<RatingBucket, string> = {
  5: 'var(--color-success-400)',
  4: 'var(--color-success-300)',
  3: 'var(--color-brand)',
  2: 'var(--color-warning-400)',
  1: 'var(--color-danger-400)'
};

export function ratingLabelKey(bucket: RatingBucket): RatingLabelKey {
  return RATING_LABEL_KEY[bucket];
}

export function ratingColor(bucket: RatingBucket): string {
  return RATING_COLOR[bucket];
}

// direction: 'lower' = 越小越好(ms);'higher' = 越大越好(cps/wpm/level/digits)
type Direction = 'lower' | 'higher';

type Norm = {
  // 四个分界值:[Exceptional, Above-average, Average-upper, Below-average-upper]
  cutoffs: [number, number, number, number];
  direction: Direction;
};

// 以提交到 scores 表的 test_type 为键
const NORMS: Record<string, Norm> = {
  'simple-reaction': { cutoffs: [190, 230, 310, 350], direction: 'lower' },
  'auditory-reaction': { cutoffs: [110, 140, 200, 235], direction: 'lower' },
  'choice-reaction': { cutoffs: [280, 370, 550, 640], direction: 'lower' },
  'aim-trainer': { cutoffs: [350, 450, 750, 900], direction: 'lower' },
  'click-speed': { cutoffs: [10, 8, 6, 5], direction: 'higher' },
  typing: { cutoffs: [70, 50, 30, 15], direction: 'higher' },
  'sequence-memory': { cutoffs: [14, 10, 7, 4], direction: 'higher' },
  chimp: { cutoffs: [12, 9, 6, 4], direction: 'higher' },
  'number-memory': { cutoffs: [11, 9, 7, 5], direction: 'higher' },
  // Stroop 按平均反应时(ms)评级,正确率留作门槛(见组件内封顶逻辑)
  stroop: { cutoffs: [550, 650, 800, 950], direction: 'lower' }
};

export function ratingBucket(testId: string, value: number): RatingBucket {
  const norm = NORMS[testId];
  if (!norm) return 3; // 未知测试 → 平均(安全默认)
  const [c0, c1, c2, c3] = norm.cutoffs;

  if (norm.direction === 'lower') {
    if (value <= c0) return 5;
    if (value <= c1) return 4;
    if (value <= c2) return 3;
    if (value <= c3) return 2;
    return 1;
  }

  if (value >= c0) return 5;
  if (value >= c1) return 4;
  if (value >= c2) return 3;
  if (value >= c3) return 2;
  return 1;
}
