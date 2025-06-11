import { useState, useEffect } from "react";
import { FiCheck, FiRotateCcw, FiX, FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const CartArmadores = () => {
  // Estados para los pedidos
  const [pedidos, setPedidos] = useState([]);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPedidos, setExpandedPedidos] = useState({});
  
  // Estado para controlar el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15); // Número de pedidos por página

  // Obtener lista de pedidos confirmados
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch(`https://systemweb.ddns.net/CarritoWeb/APICarrito/ConsultaPedidosConfirmados?t=${Date.now()}`);
        if (!response.ok) {
          throw new Error('Error al obtener los pedidos');
        }
        const data = await response.json();
        setPedidos(data.ListPedidos || []);
        
        // Inicializar estado expandido para cada pedido
        const initialExpanded = {};
        data.ListPedidos.forEach(pedido => {
          initialExpanded[pedido.VENTA] = false;
        });
        setExpandedPedidos(initialExpanded);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPedidos();
  }, []);

  // Obtener detalles de un pedido específico
  const fetchPedidoDetalle = async (ventaId) => {
    try {
      const response = await fetch(`https://systemweb.ddns.net/CarritoWeb/APICarrito/PedidoConfirmado/${ventaId}?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Error al obtener el detalle del pedido');
      }
      const data = await response.json();
      setPedidoDetalle(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Alternar estado expandido de un pedido
  const togglePedidoExpandido = async (ventaId) => {
    // Si el pedido no está expandido, obtener sus detalles
    if (!expandedPedidos[ventaId]) {
      await fetchPedidoDetalle(ventaId);
    }
    
    setExpandedPedidos(prev => ({
      ...prev,
      [ventaId]: !prev[ventaId]
    }));
  };

  // Cambiar estado de la prenda (simulado, ya que la API real no tiene este campo)
  const cambiarEstadoPrenda = (ventaId, partId) => {
    setPedidoDetalle(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        Part: prev.Part.map(part => 
          part.PartId === partId 
            ? { ...part, Status: part.Status.trim() === "0" ? "1" : "0" } 
            : part
        )
      };
    });
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

  // Lógica de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pedidos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pedidos.length / itemsPerPage);

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Cargando pedidos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-red-600">Error: {error}</div>
      </div>
    );
  }

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
            Pedidos Confirmados para Armado
          </h1>
          <div className="text-center text-sm text-gray-500 mt-2">
            Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, pedidos.length)} de {pedidos.length} pedidos
          </div>
        </header>

        {/* Lista de Pedidos */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                Pedidos Pendientes
              </h2>
              {/* Selector de items por página (opcional) */}
              <div className="flex items-center">
                <span className="text-sm mr-2">Mostrar:</span>
                <select 
                  className="border rounded p-1 text-sm"
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  value={itemsPerPage}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                </select>
              </div> 
            </div>
            
            {pedidos.length > 0 ? (
              <>
                <ul className="divide-y divide-gray-200">
                  {currentItems.map((pedido) => (
                    <li key={pedido.VENTA} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col">
                        {/* Encabezado del pedido */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              Pedido #{pedido.VENTA} - {pedido.NombreCLIENTE}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">ID Cliente:</span> {pedido.IDCLIENTE}
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Estado:</span> 
                                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {pedido.ESTADO === "CO" ? "Confirmado" : pedido.ESTADO}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Botón para expandir/colapsar */}
                          <button
                            onClick={() => togglePedidoExpandido(pedido.VENTA)}
                            className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-800 hover:cursor-pointer"
                          >
                            {expandedPedidos[pedido.VENTA] ? (
                              <>
                                <span className="font-semibold">Ocultar</span>
                                <FiChevronUp className="h-4 w-4" />
                              </>
                            ) : (
                              <>
                                <span className="font-semibold">Ver detalles</span>
                                <FiChevronDown className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </div>
                        
                        {/* Detalles del pedido (si está expandido) */}
                        {expandedPedidos[pedido.VENTA] && pedidoDetalle && pedidoDetalle.VENTA === pedido.VENTA && (
                          <div className="mt-4 pl-4 border-l-2 border-gray-200">
                            <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="text-sm">
                                <span className="font-medium">Total Piezas:</span> {pedidoDetalle.TotPzas}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Total Venta:</span> ${pedidoDetalle.TotVenta}
                              </div>
                            </div>
                            
                            <h4 className="font-medium text-gray-800 mb-2">Partes del Pedido:</h4>
                            <ul className="divide-y divide-gray-200">
                              {pedidoDetalle.Part.map((part) => (
                                <li key={part.PartId} className="py-3">
                                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Checkbox - Tablet/Desktop */}
                                    <div className="hidden md:block">
                                      <label className="inline-flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={part.Status.trim() === "1"}
                                          onChange={() => cambiarEstadoPrenda(pedido.VENTA, part.PartId)}
                                          className="h-6 w-6 text-rose-600 rounded focus:ring-rose-500 hover:cursor-pointer"
                                        />
                                      </label>
                                    </div>
                                    
                                    {/* Información de la parte */}
                                    <div className="flex-1">
                                      <div className="font-medium">{part.Descrip}</div>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                        <div className="text-sm text-gray-600">
                                          <span className="font-medium">Artículo:</span> {part.Articulo}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          <span className="font-medium">Cantidad:</span> {part.Cant}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          <span className="font-medium">Precio:</span> ${part.Precio}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          <span className="font-medium">Importe:</span> ${part.Importe}
                                        </div>
                                        {part.Imagen && (
                                          <div className="text-sm text-gray-600 col-span-2 md:col-span-1">
                                            <span className="font-medium">Imagen:</span>
                                            <img 
                                              src={part.Imagen} 
                                              alt={part.Descrip} 
                                              className="w-16 h-16 object-cover mt-1 cursor-pointer hover:opacity-80 transition-opacity"
                                              onClick={() => openImageModal(part.Imagen)}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Estado y checkbox - Mobile */}
                                    <div className="md:hidden flex justify-between items-center">
                                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                                        part.Status.trim() === "1" 
                                          ? "bg-green-100 text-green-800" 
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}>
                                        {part.Status.trim() === "1" ? "Surtido" : "Pendiente"}
                                      </span>
                                      <label className="inline-flex items-center ml-2">
                                        <input
                                          type="checkbox"
                                          checked={part.Status.trim() === "1"}
                                          onChange={() => cambiarEstadoPrenda(pedido.VENTA, part.PartId)}
                                          className="h-5 w-5 text-rose-600 rounded focus:ring-rose-500 hover:cursor-pointer"
                                        />
                                      </label>
                                    </div>
                                    
                                    {/* Estado - Desktop */}
                                    <div className="hidden md:block">
                                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                                        part.Status.trim() === "1" 
                                          ? "bg-green-100 text-green-800" 
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}>
                                        {part.Status.trim() === "1" ? "Surtido" : "Pendiente"}
                                      </span>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Paginación */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Anterior
                    </button>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Siguiente
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">{Math.min(indexOfLastItem, pedidos.length)}</span> de <span className="font-medium">{pedidos.length}</span> resultados
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Anterior</span>
                          <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        
                        {/* Números de página */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === number
                                ? 'z-10 bg-rose-50 border-rose-500 text-rose-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {number}
                          </button>
                        ))}
                        
                        <button
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Siguiente</span>
                          <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No hay pedidos confirmados para mostrar
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CartArmadores;