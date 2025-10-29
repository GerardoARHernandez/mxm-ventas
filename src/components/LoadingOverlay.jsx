// components/LoadingOverlay.jsx
import React from 'react';

const LoadingOverlay = ({ isLoading, message = "Procesando..." }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4 min-w-80">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-700 font-medium text-lg">{message}</p>
        <p className="text-gray-500 text-sm text-center">
          Por favor espere, esto puede tomar unos segundos...
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;