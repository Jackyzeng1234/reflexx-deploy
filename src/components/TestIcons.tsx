// 3D Emoji图标组件
import React from 'react';

interface TestIconProps {
  className?: string;
}

// Simple Reaction - 闪电/反应速度
export const SimpleReactionIcon: React.FC<TestIconProps> = ({ className = "" }) => (
  <span className={className} style={{ fontSize: '56px', lineHeight: 1 }}>
    ⚡
  </span>
);

// Auditory Reaction - 声音/听觉
export const AuditoryReactionIcon: React.FC<TestIconProps> = ({ className = "" }) => (
  <span className={className} style={{ fontSize: '56px', lineHeight: 1 }}>
    🔊
  </span>
);

// Click Speed - 鼠标点击
export const ClickSpeedIcon: React.FC<TestIconProps> = ({ className = "" }) => (
  <span className={className} style={{ fontSize: '56px', lineHeight: 1 }}>
    🖱️
  </span>
);

// Typing Test - 键盘打字
export const TypingIcon: React.FC<TestIconProps> = ({ className = "" }) => (
  <span className={className} style={{ fontSize: '56px', lineHeight: 1 }}>
    ⌨️
  </span>
);

// Choice Reaction - 选择反应
export const ChoiceReactionIcon: React.FC<TestIconProps> = ({ className = "" }) => (
  <span className={className} style={{ fontSize: '56px', lineHeight: 1 }}>
    🎮
  </span>
);

// Sequence Memory - 序列记忆
export const SequenceMemoryIcon: React.FC<TestIconProps> = ({ className = "" }) => (
  <span className={className} style={{ fontSize: '56px', lineHeight: 1 }}>
    🧠
  </span>
);

// Chimp Test - 黑猩猩测试
export const ChimpTestIcon: React.FC<TestIconProps> = ({ className = "" }) => (
  <span className={className} style={{ fontSize: '56px', lineHeight: 1 }}>
    🐒
  </span>
);

// Stroop Test - 斯特鲁普测试（颜色认知）
export const StroopTestIcon: React.FC<TestIconProps> = ({ className = "" }) => (
  <span className={className} style={{ fontSize: '56px', lineHeight: 1 }}>
    🎨
  </span>
);

// Number Memory - 数字记忆
export const NumberMemoryIcon: React.FC<TestIconProps> = ({ className = "" }) => (
  <span className={className} style={{ fontSize: '56px', lineHeight: 1 }}>
    🔢
  </span>
);
