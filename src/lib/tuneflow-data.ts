import type { LucideIcon } from 'lucide-react';
import {
  Smile,
  Frown,
  Zap,
  Cloud,
  Sunrise,
  Moon,
  Heart,
  BrainCircuit,
  Rocket,
  Guitar,
  Piano,
  Drum,
  Waves,
  Sparkles,
  Leaf,
  Castle,
  Clock3,
  Clock8,
  Clock,
} from 'lucide-react';

export type Option = {
  value: string;
  label: string;
  Icon: LucideIcon;
};

export const moods: Option[] = [
  { value: 'happy', label: 'ハッピー', Icon: Smile },
  { value: 'sad', label: '悲しい', Icon: Frown },
  { value: 'energetic', label: 'エネルギッシュ', Icon: Zap },
  { value: 'calm', label: '穏やか', Icon: Cloud },
  { value: 'romantic', label: 'ロマンチック', Icon: Heart },
  { value: 'epic', label: '壮大', Icon: Castle },
  { value: 'mysterious', label: 'ミステリアス', Icon: Moon },
  { value: 'uplifting', label: '高揚感', Icon: Sunrise },
];

export const genres: Option[] = [
  { value: 'pop', label: 'ポップ', Icon: Sparkles },
  { value: 'classical', label: 'クラシック', Icon: Piano },
  { value: 'jazz', label: 'ジャズ', Icon: Guitar },
  { value: 'rock', label: 'ロック', Icon: Drum },
  { value: 'electronic', label: 'エレクトロニック', Icon: BrainCircuit },
  { value: 'ambient', label: 'アンビエント', Icon: Waves },
  { value: 'lo-fi', label: 'ローファイ', Icon: Leaf },
  { value: 'sci-fi', label: 'SF', Icon: Rocket },
];

export const durations: Option[] = [
    { value: '15', label: '短い', Icon: Clock3 },
    { value: '30', label: '普通', Icon: Clock8 },
    { value: '60', label: '長い', Icon: Clock },
];
