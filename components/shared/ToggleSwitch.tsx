'use client';

import React from 'react';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const ToggleSwitch = ({
  id,
  checked,
  onChange,
  disabled = false,
}: ToggleSwitchProps) => {
  return (
    <label
      htmlFor={id}
      className={`
        relative inline-flex items-center
        ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
      `}
    >
      <input
        id={id}
        type="checkbox"
        className="sr-only peer" 
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)} // Prevent changes if disabled
        disabled={disabled}
      />

      <div
        className="
          w-11 h-6 bg-gray-300 rounded-full 
          transition-colors duration-200 ease-in-out
          peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-green-500
          peer-checked:bg-green-600
        "
      ></div>

      <div
        className="
          absolute left-0.5 top-0.5 bg-white border-gray-300 border w-5 h-5 rounded-full
          shadow-sm
          transition-transform duration-200 ease-in-out
          peer-checked:translate-x-5
        "
      ></div>
    </label>
  );
};