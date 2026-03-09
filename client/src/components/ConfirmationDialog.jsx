import { useState } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

const ConfirmationDialog = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = "Confirm & Proceed",
  message = "Are you sure you want to continue to the next step?",
  extractedData = null
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>

        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {extractedData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-sm text-gray-700 mb-2">
              Extracted Information Summary:
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              {Object.entries(extractedData.fields || {}).map(([key, value]) => (
                value && (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Check className="w-4 h-4" />
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
