import { FiTrash2 } from "react-icons/fi";

const CartItem = ({ item, removeItem }) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-4">
        <div className="sm:col-span-6">
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className="text-sm text-gray-500 mt-1">
            Disponible: {item.maxQuantity} unidad{item.maxQuantity !== 1 ? 'es' : ''}
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
        <div className="sm:col-span-2 flex items-center justify-between">
          <p className="text-gray-900">$ {(item.price * item.quantity).toFixed(2)}</p>
          <button 
            onClick={() => removeItem(item.id)}
            className="text-rose-600 hover:text-rose-800"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    );
  };
  

export default CartItem