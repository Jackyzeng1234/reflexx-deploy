// 测试图标 — 统一 lucide-react 线性图标(替换原 emoji)
import {
  Zap,
  Volume2,
  MousePointerClick,
  Keyboard,
  ArrowLeftRight,
  Grid3x3,
  Puzzle,
  Palette,
  Hash,
  Target,
} from 'lucide-react';

interface TestIconProps {
  className?: string;
  size?: number;
}

// Simple Reaction - 闪电 / 反应速度
export const SimpleReactionIcon = ({ className = '', size = 40 }: TestIconProps) => (
  <Zap className={className} size={size} strokeWidth={1.75} />
);

// Auditory Reaction - 声音 / 听觉
export const AuditoryReactionIcon = ({ className = '', size = 40 }: TestIconProps) => (
  <Volume2 className={className} size={size} strokeWidth={1.75} />
);

// Click Speed - 鼠标点击
export const ClickSpeedIcon = ({ className = '', size = 40 }: TestIconProps) => (
  <MousePointerClick className={className} size={size} strokeWidth={1.75} />
);

// Typing Test - 键盘打字
export const TypingIcon = ({ className = '', size = 40 }: TestIconProps) => (
  <Keyboard className={className} size={size} strokeWidth={1.75} />
);

// Choice Reaction - 选择反应
export const ChoiceReactionIcon = ({ className = '', size = 40 }: TestIconProps) => (
  <ArrowLeftRight className={className} size={size} strokeWidth={1.75} />
);

// Sequence Memory - 序列记忆(3x3 瓦片)
export const SequenceMemoryIcon = ({ className = '', size = 40 }: TestIconProps) => (
  <Grid3x3 className={className} size={size} strokeWidth={1.75} />
);

// Chimp Test - 数字谜题
export const ChimpTestIcon = ({ className = '', size = 40 }: TestIconProps) => (
  <Puzzle className={className} size={size} strokeWidth={1.75} />
);

// Stroop Test - 颜色认知
export const StroopTestIcon = ({ className = '', size = 40 }: TestIconProps) => (
  <Palette className={className} size={size} strokeWidth={1.75} />
);

// Number Memory - 数字记忆
export const NumberMemoryIcon = ({ className = '', size = 40 }: TestIconProps) => (
  <Hash className={className} size={size} strokeWidth={1.75} />
);

// Aim Trainer - 瞄准训练
export const AimTrainerIcon = ({ className = '', size = 40 }: TestIconProps) => (
  <Target className={className} size={size} strokeWidth={1.75} />
);
