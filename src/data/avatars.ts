export interface AvatarOption {
  id: string;
  colorClass: string; // tailwind bg + text classes applied to the avatar circle
  label: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'indigo', colorClass: 'bg-indigo-600 text-white', label: 'Indigo' },
  { id: 'emerald', colorClass: 'bg-emerald-600 text-white', label: 'Emerald' },
  { id: 'amber', colorClass: 'bg-amber-600 text-white', label: 'Amber' },
  { id: 'rose', colorClass: 'bg-rose-600 text-white', label: 'Rose' },
  { id: 'sky', colorClass: 'bg-sky-600 text-white', label: 'Sky' },
  { id: 'teal', colorClass: 'bg-teal-600 text-white', label: 'Teal' },
  { id: 'fuchsia', colorClass: 'bg-fuchsia-600 text-white', label: 'Fuchsia' },
  { id: 'neutral', colorClass: 'bg-neutral-800 text-white', label: 'Graphite' },
  { id: 'cyan', colorClass: 'bg-cyan-600 text-white', label: 'Cyan' },
  { id: 'violet', colorClass: 'bg-violet-600 text-white', label: 'Violet' },
  { id: 'orange', colorClass: 'bg-orange-600 text-white', label: 'Orange' },
  { id: 'lime', colorClass: 'bg-lime-600 text-white', label: 'Lime' },
];

export const DEFAULT_AVATAR = AVATAR_OPTIONS[0].colorClass;

export const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'TM';
