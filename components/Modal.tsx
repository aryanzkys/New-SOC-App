
import React, { ReactNode } from 'react';

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold text-soc-navy">{title}</h3>
        </div>
        <div className="p-6">
          <p className="text-soc-gray">{children}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-soc-navy rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-soc-navy text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
