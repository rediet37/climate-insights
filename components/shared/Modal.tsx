'use client';

import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  // Effect to handle the 'Escape' key press for closing the modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    // The main modal container, fixed to cover the entire viewport
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* 1. The semi-transparent backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={onClose} // Close the modal when the backdrop is clicked
      ></div>

      {/* 2. The modal panel itself - with animation */}
      <div
        className="
          relative bg-white rounded-xl shadow-2xl 
          w-full max-w-2xl max-h-[90vh] 
          flex flex-col
          transform transition-all animate-fadeIn
          overflow-hidden
        "
        style={{animation: 'fadeInScale 0.3s ease-out'}}
      >
        {/* Modal Header - Improved styling */}
        <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold" id="modal-title">
            {title}
          </h3>
          <button
            type="button"
            className="text-white bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors duration-200"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body with improved styling */}
        <div className="p-6 space-y-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          <div className="prose prose-blue max-w-none">
            {children}
          </div>
        </div>
        
        
      </div>
    </div>
  );
};