import { useState } from "react";
import { FiCheck, FiRotateCcw, FiX } from "react-icons/fi";

const CartArmadores = () => {
  // Estado inicial de las prendas
  const [prendas, setPrendas] = useState([
    {
      id: 1,
      name: "GABARDINA DONNIKA TWED INSPO CHANEL BLANCO 1114 T CH",
      ubicacion: 'Pasillo 2',
      quantity: 2,
      status: "Pendiente",
      maxQuantity: 3,
      image: 'https://permachef.com/cdn/shop/files/707c7627-167c-41f5-bf35-8fcc5e7a0e64_1512x.jpg?v=1683241257'
    },
    {
      id: 2,
      name: "VESTIDO ELEGANTE NEGRO T MD",
      ubicacion: 'Pasillo 4',
      quantity: 3,
      status: "Pendiente",
      maxQuantity: 5,
      image: ''
    },
    {
      id: 3,
      name: "CHAQUETA DE CUERO PREMIUM T GD",
      ubicacion: "Pasillo 10",
      quantity: 1,
      status: "Pendiente",
      maxQuantity: 1,
      image: ''
    }
  ]);

  // Estado para controlar el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');

  // Filtrar prendas
  const prendasPendientes = prendas.filter(p => p.status === "Pendiente");
  const prendasSurtidas = prendas.filter(p => p.status === "Surtida");

  // Cambiar estado de la prenda
  const cambiarEstadoPrenda = (id) => {
    setPrendas(prendas.map(prenda => 
      prenda.id === id 
        ? { ...prenda, status: prenda.status === "Pendiente" ? "Surtida" : "Pendiente" } 
        : prenda
    ));
  };

  // Revertir prenda a pendiente
  const revertirPrenda = (id) => {
    setPrendas(prendas.map(prenda => 
      prenda.id === id ? { ...prenda, status: "Pendiente" } : prenda
    ));
  };

  // Abrir modal con la imagen
  const openImageModal = (imageUrl) => {
    setCurrentImage(imageUrl);
    setModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setModalOpen(false);
    setCurrentImage('');
  };

  return (
    <div className="min-h-screen">
      {/* Modal para imagen */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button 
              onClick={closeModal}
              className="absolute -top-10 right-0 text-white hover:text-rose-500"
            >
              <FiX className="h-6 w-6 hover:cursor-pointer" />
            </button>
            <img 
              src={currentImage} 
              alt="Prenda ampliada" 
              className="w-full h-full object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 md:p-6">
        {/* Header */}
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">
            Prendas para Armado
          </h1>
        </header>

        {/* Prendas Pendientes */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                Prendas Pendientes
              </h2>
            </div>
            
            {prendasPendientes.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {prendasPendientes.map((prenda) => (
                  <li key={prenda.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Checkbox - Tablet/Desktop */}
                      <div className="hidden md:block">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            onChange={() => cambiarEstadoPrenda(prenda.id)}
                            className="h-6 w-6 text-rose-600 rounded focus:ring-rose-500 hover:cursor-pointer"
                          />
                        </label>
                      </div>
                      
                      {/* Información principal */}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{prenda.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Ubicación:</span> {prenda.ubicacion}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Cantidad:</span> {prenda.quantity}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Disponible:</span> {prenda.maxQuantity}
                          </div>
                          {prenda.image && (
                            <div className="text-sm text-gray-600 col-span-1 md:col-span-1">
                              <span className="font-medium">Imagen:</span>
                              <img 
                                src={prenda.image} 
                                alt={prenda.name} 
                                className="w-16 h-16 object-cover mt-1 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => openImageModal(prenda.image)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Checkbox - Mobile */}
                      <div className="md:hidden flex justify-between items-center">
                        <button
                          onClick={() => cambiarEstadoPrenda(prenda.id)}
                          className="bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:cursor-pointer"
                        >
                          Confirmar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No hay prendas pendientes de armado
              </div>
            )}
          </div>
        </section>

        {/* Prendas Surtidas */}
        {prendasSurtidas.length > 0 && (
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-green-50 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                  Prendas Surtidas
                </h2>
              </div>
              
              <ul className="divide-y divide-gray-200">
                {prendasSurtidas.map((prenda) => (
                  <li key={prenda.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Información principal */}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{prenda.name}</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Cantidad:</span> {prenda.quantity}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Estado:</span> 
                            <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              {prenda.status}
                            </span>
                          </div>
                          {prenda.image && (
                            <div className="text-sm text-gray-600 col-span-2">
                              <span className="font-medium">Imagen:</span>
                              <img 
                                src={prenda.image} 
                                alt={prenda.name} 
                                className="w-16 h-16 object-cover mt-1 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => openImageModal(prenda.image)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Botón de revertir */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => revertirPrenda(prenda.id)}
                          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 hover:cursor-pointer"
                          title="Revertir a pendiente"
                        >
                          <FiRotateCcw className="h-4 w-4" />
                          <span className="font-semibold">Revertir</span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CartArmadores;