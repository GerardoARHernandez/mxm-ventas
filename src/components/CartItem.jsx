import { FiTrash2, FiImage } from "react-icons/fi";
import { useState } from "react";

const CartItem = ({ item, removeItem, loading, onImageClick }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeItem(item.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageClick = () => {
    if (item.image && onImageClick) {
      onImageClick(item.image);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-4">
      {/* Columna de Imagen */}
      <div className="sm:col-span-1 flex items-center justify-center">
        {item.image ? (
          <div 
            className="relative group cursor-pointer"
            onClick={handleImageClick}
          >
            <img 
              src={item.image} 
              alt={item.name}
              className="w-12 h-12 object-cover rounded border border-gray-300 group-hover:opacity-80 transition-opacity"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded flex items-center justify-center">
              <FiImage className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ) : (
          <div 
            className="w-12 h-12 bg-gray-200 rounded border border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
            onClick={handleImageClick}
            title="No hay imagen disponible"
          >
            <FiImage className="text-gray-500" />
          </div>
        )}
      </div>

      {/* Columna de Artículo */}
      <div className="sm:col-span-4">
        <p className="font-medium text-gray-900">{item.name}</p>
        <p className="text-sm text-gray-500 mt-1">
          Código: {item.code} | {item.status === 'preventa' ? 'Preventa' : 'En stock'}
        </p>
      </div>

      {/* Columna de Precio */}
      <div className="sm:col-span-2 text-right">
        <p className="text-gray-900">$ {item.price.toFixed(2)}</p>
      </div>

      {/* Columna de Cantidad */}
      <div className="sm:col-span-2 flex items-center justify-center">
        <div className="border rounded-md px-4 py-2 text-center">
          {item.quantity}
        </div>
      </div>

      {/* Columna de Importe y Eliminar */}
      <div className="sm:col-span-3 flex items-center justify-between gap-4">
        <p className="text-gray-900">$ {item.importe.toFixed(2)}</p>
        <button 
          onClick={handleDelete}
          disabled={loading || isDeleting}
          className={`text-rose-600 hover:text-rose-800 ${
            (loading || isDeleting) ? 'opacity-50 cursor-not-allowed' : 'hover:cursor-pointer'
          }`}
          aria-label="Eliminar artículo"
        >
          {isDeleting ? (
            <span className="animate-pulse">Eliminando...</span>
          ) : (
            <FiTrash2 />
          )}
        </button>
      </div>
    </div>
  );
};

export default CartItem;