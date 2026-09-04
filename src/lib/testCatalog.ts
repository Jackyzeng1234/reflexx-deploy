// 共享测试清单 — 首页 / 测试列表页 / 导航栏统一引用，避免三处重复维护
import {
  SimpleReactionIcon,
  AuditoryReactionIcon,
  ClickSpeedIcon,
  AimTrainerIcon,
  TypingIcon,
  ChoiceReactionIcon,
  SequenceMemoryIcon,
  ChimpTestIcon,
  StroopTestIcon,
  NumberMemoryIcon,
} from '@/components/TestIcons';
import { translations } from '@/lib/i18n/translations';

export type TestCategory = 'reaction' | 'speed' | 'memory' | 'cognitive';
export type Difficulty = 'easy' | 'medium' | 'hard';

type I18nT = typeof translations.en;

export interface TestEntry {
  id: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  difficulty: Difficulty;
  category: TestCategory;
  titleKey: keyof I18nT;
  descKey: keyof I18nT;
}

export const TEST_CATALOG: TestEntry[] = [
  { id: 'simple-reaction', href: '/tests/simple-reaction', icon: SimpleReactionIcon, difficulty: 'easy', category: 'reaction', titleKey: 'simpleReaction', descKey: 'simpleReactionDesc' },
  { id: 'auditory-reaction', href: '/tests/auditory-reaction', icon: AuditoryReactionIcon, difficulty: 'easy', category: 'reaction', titleKey: 'auditoryReactionTitle', descKey: 'auditoryReactionDesc' },
  { id: 'click-speed', href: '/tests/click-speed', icon: ClickSpeedIcon, difficulty: 'easy', category: 'speed', titleKey: 'clickSpeed', descKey: 'clickSpeedDesc' },
  { id: 'aim-trainer', href: '/tests/aim-trainer', icon: AimTrainerIcon, difficulty: 'easy', category: 'speed', titleKey: 'aimTrainer', descKey: 'aimTrainerDesc' },
  { id: 'typing', href: '/tests/typing', icon: TypingIcon, difficulty: 'medium', category: 'speed', titleKey: 'typingTitle', descKey: 'typingDesc' },
  { id: 'choice-reaction', href: '/tests/choice-reaction', icon: ChoiceReactionIcon, difficulty: 'medium', category: 'reaction', titleKey: 'choiceReaction', descKey: 'choiceReactionDesc' },
  { id: 'sequence-memory', href: '/tests/sequence-memory', icon: SequenceMemoryIcon, difficulty: 'medium', category: 'memory', titleKey: 'sequenceMemoryTitle', descKey: 'sequenceMemoryDesc' },
  { id: 'chimp-test', href: '/tests/chimp-test', icon: ChimpTestIcon, difficulty: 'hard', category: 'memory', titleKey: 'chimpTestTitle', descKey: 'chimpTestDesc' },
  { id: 'stroop-test', href: '/tests/stroop-test', icon: StroopTestIcon, difficulty: 'hard', category: 'cognitive', titleKey: 'stroopTestTitle', descKey: 'stroopTestDesc' },
  { id: 'number-memory', href: '/tests/number-memory', icon: NumberMemoryIcon, difficulty: 'hard', category: 'memory', titleKey: 'numberMemoryTitle', descKey: 'numberMemoryDesc' },
];

// 解析翻译后的测试条目（title/description 为当前语言文案）
export function getTests(t: I18nT) {
  return TEST_CATALOG.map((entry) => ({
    ...entry,
    title: t[entry.titleKey],
    description: t[entry.descKey],
  }));
}
