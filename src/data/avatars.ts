export interface AvatarOption {
  id: string;
  colorClass: string; // tailwind bg + text classes applied to the avatar circle
  label: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'teal', colorClass: 'bg-teal-600 text-white', label: 'Teal' },
  { id: 'emerald', colorClass: 'bg-emerald-600 text-white', label: 'Emerald' },
  { id: 'amber', colorClass: 'bg-amber-600 text-white', label: 'Amber' },
  { id: 'rose', colorClass: 'bg-rose-600 text-white', label: 'Rose' },
  { id: 'sky', colorClass: 'bg-sky-600 text-white', label: 'Sky' },
  { id: 'cyan', colorClass: 'bg-cyan-600 text-white', label: 'Cyan' },
  { id: 'orange', colorClass: 'bg-orange-600 text-white', label: 'Orange' },
  { id: 'neutral', colorClass: 'bg-neutral-800 text-white', label: 'Graphite' },
  { id: 'blue', colorClass: 'bg-blue-600 text-white', label: 'Blue' },
  { id: 'green', colorClass: 'bg-green-600 text-white', label: 'Green' },
  { id: 'red', colorClass: 'bg-red-600 text-white', label: 'Red' },
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
