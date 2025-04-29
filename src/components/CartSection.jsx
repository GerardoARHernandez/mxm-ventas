import CartItem from "./CartItem";

const CartSection = ({ title, items, subtotal, onProcess, processButtonColor = 'blue', removeItem }) => {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {items.length > 0 ? (
            <>
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-6">Artículo</div>
                <div className="col-span-2 text-right">Precio</div>
                <div className="col-span-2 text-center">Cantidad</div>
                <div className="col-span-2 text-right">Importe</div>
              </div>
              
              {items.map((item) => (
                <CartItem key={item.id} item={item} removeItem={removeItem} />
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
                <span className="font-medium">SubTotal {title}: </span>
                <span className="font-medium">$ {subtotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={onProcess}
                className={`bg-${processButtonColor}-600 hover:bg-${processButtonColor}-700 text-white py-2 px-6 rounded-md font-medium transition-colors hover:cursor-pointer`}
              >
                Completado
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

export default CartSection