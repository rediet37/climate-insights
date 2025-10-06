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
          w-12 h-6 bg-gray-200 rounded-full 
          transition-colors duration-300 ease-in-out
          peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-blue-300
          peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-green-500
          shadow-inner
        "
      ></div>

      <div
        className="
          absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full
          shadow-md
          transition-all duration-300 ease-in-out
          peer-checked:translate-x-6 peer-checked:scale-110
          flex items-center justify-center
        "
      >
        {checked && (
          <div className="absolute w-2 h-2 bg-blue-500 rounded-full opacity-70"></div>
        )}
      </div>
    </label>
  );
};