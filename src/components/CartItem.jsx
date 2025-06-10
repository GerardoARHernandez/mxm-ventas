import { FiTrash2 } from "react-icons/fi";
import { useState } from "react";

const CartItem = ({ item, removeItem, loading }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeItem(item.id); 
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-4">
      <div className="sm:col-span-5">
        <p className="font-medium text-gray-900">{item.name}</p>
        <p className="text-sm text-gray-500 mt-1">
          Código: {item.code} | {item.status === 'preventa' ? 'Preventa' : 'En stock'}
        </p>
      </div>
      <div className="sm:col-span-2 text-right">
        <p className="text-gray-900">$ {item.price.toFixed(2)}</p>
      </div>
      <div className="sm:col-span-2 flex items-center justify-center">
        <div className="border rounded-md px-4 py-2 text-center">
          {item.quantity}
        </div>
      </div>
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