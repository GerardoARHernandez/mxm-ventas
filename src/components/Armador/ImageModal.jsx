// src/components/Armador/ImageModal.jsx
import { FiX } from "react-icons/fi";

const ImageModal = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
      <div className="relative max-w-4xl w-full max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-rose-500"
        >
          <FiX className="h-6 w-6 hover:cursor-pointer" />
        </button>
        <img 
          src={imageUrl} 
          alt="Prenda ampliada" 
          className="w-full h-full object-contain max-h-[80vh]"
        />
      </div>
    </div>
  );
};

export default ImageModal;