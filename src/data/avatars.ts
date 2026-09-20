export interface AvatarOption {
  id: string;
  colorClass: string;
  label: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'navy', colorClass: 'bg-[#14213D] text-white', label: 'Navy' },
  { id: 'amber', colorClass: 'bg-[#FCA311] text-[#14213D]', label: 'Amber' },
  { id: 'black', colorClass: 'bg-[#000000] text-white', label: 'Black' },
  { id: 'white-navy', colorClass: 'bg-white text-[#14213D] border border-[#14213D]', label: 'White' },
  { id: 'gray-navy', colorClass: 'bg-[#E4E4E4] text-[#14213D]', label: 'Gray' },
  { id: 'amber-navy', colorClass: 'bg-[#FCA311] text-[#14213D] border border-[#14213D]', label: 'Amber Outlined' },
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
