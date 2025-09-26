import { FiX, FiZoomIn, FiZoomOut, FiRotateCw } from "react-icons/fi";
import { useState, useEffect } from "react";

const ImageModal = ({ imageUrl, isOpen, onClose }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Reiniciar transformaciones cuando se abre el modal
      setScale(1);
      setRotation(0);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl max-h-full">
        {/* Controles */}
        <div className="absolute top-4 right-4 z-10 flex gap-2 bg-black bg-opacity-50 rounded-lg p-2">
          <button 
            onClick={handleZoomIn}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            title="Acercar"
          >
            <FiZoomIn size={20} />
          </button>
          <button 
            onClick={handleZoomOut}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            title="Alejar"
          >
            <FiZoomOut size={20} />
          </button>
          <button 
            onClick={handleRotate}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            title="Rotar"
          >
            <FiRotateCw size={20} />
          </button>
          <button 
            onClick={handleReset}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            title="Reiniciar"
          >
            Reiniciar
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-white hover:bg-red-600 rounded transition-colors"
            title="Cerrar"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Imagen */}
        <div className="overflow-auto max-h-[90vh]">
          <img 
            src={imageUrl} 
            alt="Vista previa del producto"
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
          />
        </div>

        {/* Indicador de zoom */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
};

export default ImageModal;