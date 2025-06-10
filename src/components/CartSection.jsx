import CartItem from "./CartItem";

const CartSection = ({ 
  title, 
  items, 
  subtotal, 
  onProcess, 
  onClean,
  processButtonText = "Completar", 
  processButtonColor = 'blue', 
  removeItem,
  loading = false
}) => {
  return (
    <div className="bg-white shadow border border-gray-400 rounded-lg overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-gray-300">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {items.length > 0 ? (
          <>
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">Artículo</div>
              <div className="col-span-2 text-right">Precio Unit.</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-3 text-left">Importe</div>
            </div>
            
            {items.map((item) => (
              <CartItem 
                key={item.code} // Mejor usar item.code que item.id
                item={item} 
                removeItem={removeItem} 
                loading={loading} // Pasamos el estado de carga
              />
            ))}
          </>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            No hay artículos en {title.toLowerCase()}
          </div>
        )}
      </div>
      
      {items.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">Total: </span>
              <span className="font-bold">$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex gap-2 font-semibold">
              <button 
                onClick={onClean}
                disabled={loading}
                className="bg-red-800 hover:bg-red-900 hover:cursor-pointer text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                Vaciar Carrito
              </button>
              <button 
                onClick={onProcess}
                disabled={loading}
                className={`bg-${processButtonColor}-600 hover:bg-${processButtonColor}-700 text-white py-2 px-6 rounded-md hover:cursor-pointer transition-colors disabled:opacity-50`}
              >
                {loading ? 'Procesando...' : processButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSection;