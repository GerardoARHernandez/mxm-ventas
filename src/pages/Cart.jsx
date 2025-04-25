import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { useState } from "react";
import { cartProducts } from "../data";

const Cart = () => {
  // Estado del carrito con datos de ejemplo
  const [cartItems, setCartItems] = useState([ cartProducts[0], cartProducts[1], cartProducts[2] ]);

  // Filtrar items
  const stockItems = cartItems.filter(item => item.status === "stock");
  const preorderItems = cartItems.filter(item => item.status === "preventa");
  
  // Calcular totales
  const stockSubtotal = stockItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const preorderSubtotal = preorderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Funciones para manejar el carrito
  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const processStock = () => {
    // Lógica para procesar solo los items en stock
    alert(`Procesando ${stockItems.length} productos en stock. Total: $${stockSubtotal.toFixed(2)}`);
    setCartItems(cartItems.filter(item => item.status !== "stock"));
  };

  const processPreorder = () => {
    // Lógica para procesar solo los items en preventa
    alert(`Procesando ${preorderItems.length} productos en preventa. Total: $${preorderSubtotal.toFixed(2)}`);
    setCartItems(cartItems.filter(item => item.status !== "preventa"));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Mi Carrito</h1>
        
        {/* Productos en Stock */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">En Stock</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {stockItems.length > 0 ? (
              <>
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-6">Artículo</div>
                  <div className="col-span-2 text-right">Precio</div>
                  <div className="col-span-2 text-center">Cantidad</div>
                  <div className="col-span-2 text-right">Importe</div>
                </div>
                
                {stockItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-4">
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
                ))}
              </>
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                No hay artículos en stock
              </div>
            )}
          </div>
          
          {stockItems.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">SubTotal Stock: </span>
                  <span className="font-medium">$ {stockSubtotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={processStock}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-medium transition-colors"
                >
                  Completado
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Productos en Preventa */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">En Preventa</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {preorderItems.length > 0 ? (
              <>
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-6">Artículo</div>
                  <div className="col-span-2 text-right">Precio</div>
                  <div className="col-span-2 text-center">Cantidad</div>
                  <div className="col-span-2 text-right">Importe</div>
                </div>
                
                {preorderItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-4">
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
                ))}
              </>
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                No hay artículos en preventa
              </div>
            )}
          </div>
          
          {preorderItems.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">SubTotal Preventa: </span>
                  <span className="font-medium">$ {preorderSubtotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={processPreorder}
                  className="bg-rose-600 hover:bg-rose-700 text-white py-2 px-6 rounded-md font-medium transition-colors"
                >
                  Completado
                </button>
              </div>
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
};

export default Cart;