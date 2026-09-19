import React from 'react';
import { AVATAR_OPTIONS, getInitials } from '../../data/avatars';

interface AvatarPickerProps {
  value: string; // tailwind color class
  onChange: (colorClass: string) => void;
  name: string;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ value, onChange, name }) => {
  const initials = getInitials(name);

  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
        Avatar
      </label>

      <div className="flex items-center gap-3">
        {/* Live preview */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ring-2 ring-white shadow-sm transition-colors ${value}`}
        >
          {initials}
        </div>

        {/* Color swatches */}
        <div className="grid grid-cols-6 gap-1.5 flex-1">
          {AVATAR_OPTIONS.map((opt) => {
            const selected = value === opt.colorClass;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange(opt.colorClass)}
                title={opt.label}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${opt.colorClass} ${
                  selected
                    ? 'ring-2 ring-offset-2 ring-neutral-900 scale-105'
                    : 'ring-1 ring-black/5 hover:scale-105'
                }`}
              >
                {selected && (
                  <span className="w-2 h-2 rounded-full bg-white/90" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-[11px] text-neutral-400 mt-1">Pick a color for this member's avatar</p>
    </div>
  );
};
