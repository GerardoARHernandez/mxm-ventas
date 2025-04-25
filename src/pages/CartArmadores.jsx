import { useState } from "react";
import { FiCheck } from "react-icons/fi";

const CartArmadores = () => {
  // Estado inicial de las prendas
  const [prendas, setPrendas] = useState([
    {
      id: 1,
      name: "GABARDINA DONNIKA TWED INSPO CHANEL BLANCO 1114 T CH",
      ubicacion: 'Pasillo 2',
      quantity: 2,
      status: "Pendiente", // Nuevo campo para el estado
      maxQuantity: 3,
      selected: false
    },
    {
      id: 2,
      name: "VESTIDO ELEGANTE NEGRO T MD",
      ubicacion: 'Pasillo 4',
      quantity: 3,
      status: "Pendiente",
      maxQuantity: 5,
      selected: false
    },
    {
      id: 3,
      name: "CHAQUETA DE CUERO PREMIUM T GD",
      ubicacion: "Pasillo 10",
      quantity: 1,
      status: "Pendiente",
      maxQuantity: 1,
      selected: false
    }
  ]);

  // Filtrar prendas pendientes
  const prendasPendientes = prendas.filter(p => p.status === "Pendiente");
  const prendasSurtidas = prendas.filter(p => p.status === "Surtida");

  // Alternar selección de prenda
  const toggleSeleccion = (id) => {
    setPrendas(prendas.map(prenda => 
      prenda.id === id ? { ...prenda, selected: !prenda.selected } : prenda
    ));
  };

  // Confirmar prendas seleccionadas
  const confirmarPrendas = () => {
    setPrendas(prendas.map(prenda => 
      prenda.selected ? { ...prenda, status: "Surtida", selected: false } : prenda
    ));
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-950 mb-8 text-center upp">Prendas para Armado</h1>
        
        {/* Prendas Pendientes */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-7 py-4 border-b border-gray-300">
            <h2 className="text-xl font-medium text-gray-900">Prendas Pendientes</h2>
          </div>
          
          <div className="divide-y divide-gray-300">
            {prendasPendientes.length > 0 ? (
              <>
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-700 uppercase tracking-wider text-center">
                  <div className="col-span-2">Seleccionar</div>
                  <div className="col-span-5">Artículo</div>
                  <div className="col-span-3">Ubicación</div>
                  <div className="col-span-2 text-center">Cantidad</div>
                </div>
                
                {prendasPendientes.map((prenda) => (
                  <div key={prenda.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 text-center">
                    {/* Checkbox de selección */}
                    <div className="sm:col-span-2 flex justify-center !text-rose-600 rounded focus:!ring-rose-500 ">
                      <input
                        type="checkbox"
                        checked={prenda.selected}
                        onChange={() => toggleSeleccion(prenda.id)}
                        className="h-5 w-5 !text-rose-600 rounded focus:!ring-rose-500 hover:cursor-pointer"
                      />
                    </div>
                    
                    {/* Información de la prenda */}
                    <div className="sm:col-span-5">
                      <p className="font-medium text-gray-900">{prenda.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Disponible: {prenda.maxQuantity} unidad{prenda.maxQuantity !== 1 ? 'es' : ''}
                      </p>
                    </div>
                    
                    {/* Ubicación */}
                    <div className="sm:col-span-3">
                      <p className="text-gray-900">{prenda.ubicacion}</p>
                    </div>
                    
                    {/* Cantidad */}
                    <div className="sm:col-span-2 flex items-center justify-center">
                      <div className="border rounded-md px-4 py-2 text-center">
                        {prenda.quantity}
                      </div>
                    </div>
                    
                  </div>
                ))}
              </>
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                No hay prendas pendientes de armado
              </div>
            )}
          </div>
          
          {/* Botón de confirmación */}
          {prendasPendientes.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button 
                onClick={confirmarPrendas}
                disabled={!prendasPendientes.some(p => p.selected)}
                className={`flex items-center gap-2 py-2 px-6 rounded-md font-medium transition-colors ${
                  prendasPendientes.some(p => p.selected) 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white hover:cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FiCheck className="h-5 w-5" />
                Confirmar Prendas Seleccionadas ({prendasPendientes.filter(p => p.selected).length})
              </button>
            </div>
          )}
        </div>

        {/* Prendas Surtidas (Histórico) */}
        {prendasSurtidas.length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-medium text-gray-950">Prendas Surtidas</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-green-50 text-sm font-medium text-gray-800 uppercase tracking-wider text-center">
                <div className="col-span-5">Artículo</div>
                <div className="col-span-4">Ubicación</div>
                <div className="col-span-2 text-center">Cantidad</div>
                <div className="col-span-1">Estado</div>
              </div>
              
              {prendasSurtidas.map((prenda) => (
                <div key={prenda.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-4 items-center text-center">
                  <div className="sm:col-span-5">
                    <p className="font-medium text-gray-900">{prenda.name}</p>
                  </div>
                  
                  <div className="sm:col-span-4">
                    <p className="text-gray-900">{prenda.ubicacion}</p>
                  </div>
                  
                  <div className="sm:col-span-2 flex items-center justify-center">
                    <div className="border rounded-md px-4 py-2 text-center">
                      {prenda.quantity}
                    </div>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {prenda.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartArmadores;