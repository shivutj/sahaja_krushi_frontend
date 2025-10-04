import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'danger';
  buttonText?: string;
}

const SuccessModal: React.FC<ModalProps> = ({ isOpen, onClose, title, message, variant = 'success', buttonText }) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const accentBg = isDanger ? 'bg-red-100' : 'bg-green-100';
  const accentText = isDanger ? 'text-red-600' : 'text-green-600';
  const buttonBg = isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';
  const iconPath = isDanger
    ? 'M19 7l-8 8-4-4' // check fallback if trash is too detailed; replace with exclamation triangle
    : 'M5 13l4 4L19 7';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-4 animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div className={`${accentBg} rounded-full p-3 mb-4`}>
            <svg
              className={`h-8 w-8 ${accentText}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className={`w-full ${buttonBg} text-white font-medium py-2 rounded-lg transition duration-150 ease-in-out`}
          >
            {buttonText || 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
