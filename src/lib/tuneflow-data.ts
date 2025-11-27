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
} from 'lucide-react';

export type Option = {
  value: string;
  label: string;
  Icon: LucideIcon;
};

export const moods: Option[] = [
  { value: 'happy', label: 'Happy', Icon: Smile },
  { value: 'sad', label: 'Sad', Icon: Frown },
  { value: 'energetic', label: 'Energetic', Icon: Zap },
  { value: 'calm', label: 'Calm', Icon: Cloud },
  { value: 'romantic', label: 'Romantic', Icon: Heart },
  { value: 'epic', label: 'Epic', Icon: Castle },
  { value: 'mysterious', label: 'Mysterious', Icon: Moon },
  { value: 'uplifting', label: 'Uplifting', Icon: Sunrise },
];

export const genres: Option[] = [
  { value: 'pop', label: 'Pop', Icon: Sparkles },
  { value: 'classical', label: 'Classical', Icon: Piano },
  { value: 'jazz', label: 'Jazz', Icon: Guitar },
  { value: 'rock', label: 'Rock', Icon: Drum },
  { value: 'electronic', label: 'Electronic', Icon: BrainCircuit },
  { value: 'ambient', label: 'Ambient', Icon: Waves },
  { value: 'lo-fi', label: 'Lo-fi', Icon: Leaf },
  { value: 'sci-fi', label: 'Sci-Fi', Icon: Rocket },
];
