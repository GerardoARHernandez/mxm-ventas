import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiRotateCcw, FiX } from "react-icons/fi";
import ImageModal from "./ImageModal";

const PedidoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [detalleStock, setDetalleStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener lista de pedidos
        const pedidosResponse = await fetch(`https://systemweb.ddns.net/CarritoWeb/APICarrito/ConsultaPedidosConfirmados?t=${Date.now()}`);
        if (!pedidosResponse.ok) throw new Error('Error al obtener los pedidos');
        
        const pedidosData = await pedidosResponse.json();
        const pedidoEncontrado = pedidosData.ListPedidos?.find(p => p.VENTA === id);
        if (!pedidoEncontrado) throw new Error('Pedido no encontrado');
        
        setPedido(pedidoEncontrado);
        
        // Obtener detalle del pedido con ubicación e imagen
        const detalleResponse = await fetch(`https://systemweb.ddns.net/CarritoWeb/APICarrito/PedidoConfirmado/${id}?t=${Date.now()}`);
        if (!detalleResponse.ok) throw new Error('Error al obtener el detalle del pedido');
        
        const detalleData = await detalleResponse.json();
        setDetalle(detalleData);
        
        // Obtener detalle del pedido con información de stock
        const stockResponse = await fetch(`https://systemweb.ddns.net/CarritoWeb/APICarrito/Pedido/${id}?t=${Date.now()}`);
        if (!stockResponse.ok) throw new Error('Error al obtener la información de stock');
        
        const stockData = await stockResponse.json();
        setDetalleStock(stockData);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Combinar la información de ambas APIs
  const obtenerPartesCombinadas = () => {
    if (!detalle || !detalleStock || !detalle.Part || !detalleStock.Part) return [];
    
    return detalle.Part.map(part => {
      // Buscar la información de stock correspondiente
      const stockInfo = detalleStock.Part.find(
        stockPart => stockPart.PartId === part.PartId || stockPart.Articulo === part.Articulo
      );
      
      return {
        ...part,
        Stock: stockInfo ? stockInfo.Stock : 1 // Por defecto mostrar si no se encuentra
      };
    });
  };

  // Filtrar partes: mostrar solo las que tienen Stock = 1
  const partesFiltradas = () => {
    const partesCombinadas = obtenerPartesCombinadas();
    return partesCombinadas.filter(part => part.Stock === 1);
  };

  const cambiarEstadoPrenda = (partId) => {
    setDetalle(prev => ({
      ...prev,
      Part: prev.Part.map(part => 
        part.PartId === partId 
          ? { ...part, Status: part.Status.trim() === "0" ? "1" : "0" } 
          : part
      )
    }));
  };

  // Función para verificar si todos los artículos están surtidos
  const todosSurtidos = () => {
    const partes = partesFiltradas();
    if (partes.length === 0) return false;
    return partes.every(part => part.Status.trim() === "1");
  };

  const guardarCambios = async () => {
    try {
      setSaving(true);
      
      // Preparar los datos para la API usando las partes filtradas
      const partesParaGuardar = partesFiltradas();
      
      const requestData = {
        SDTPedidoAR: {
          VENTA: parseInt(id),
          Part: partesParaGuardar.map(part => ({
            PartId: part.PartId,
            Status: part.Status.trim()
          }))
        }
      };

      // Llamar a la API para guardar los cambios
      const response = await fetch('https://systemweb.ddns.net/CarritoWeb/APICarrito/FinArmadoPedido', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) throw new Error('Error en la respuesta del servidor');

      const result = await response.json();
      
      if (!result.error) {
        alert(result.Mensaje || "Cambios guardados correctamente");
        navigate("..");
      } else {
        throw new Error(result.Mensaje || 'Error al guardar los cambios');
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      alert(err.message || "Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    if (imageName.startsWith('http')) return imageName;
    return `https://systemweb.ddns.net/CarritoWeb/imgMXM/Catalogo/${imageName}`;
  };

  const openImageModal = (imageUrl) => {
    setCurrentImage(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentImage('');
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  if (!pedido || !detalle || !detalleStock) return <ErrorScreen error="No se pudo cargar la información del pedido" />;

  const partesMostrar = partesFiltradas();
  const partesOcultadas = obtenerPartesCombinadas().filter(part => part.Stock !== 1).length;

  return (
    <div className="min-h-screen bg-blue-50">
      <ImageModal 
        isOpen={modalOpen} 
        imageUrl={currentImage} 
        onClose={closeModal} 
      />

      <div className="mx-auto p-4 md:p-6">
        <div className="mb-4">
          <Link 
            to=".." 
            className="inline-flex items-center text-rose-600 hover:text-rose-800 font-medium"
          >
            <FiArrowLeft className="mr-2" /> Volver a la lista de pedidos
          </Link>
        </div>
        
        <header className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Pedido #{pedido.VENTA}
          </h1>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Cliente</h2>
              <p className="text-lg font-semibold text-gray-800">{pedido.NombreCLIENTE}</p>
              <p className="text-sm text-gray-600">ID: {pedido.IDCLIENTE}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Estado</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                pedido.ESTADO === "CO" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {pedido.ESTADO === "CO" ? "Confirmado" : pedido.ESTADO === "PA" ? "Parcial" : pedido.ESTADO}
              </span>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Total</h2>
              <p className="text-xl font-bold text-gray-800">${detalle.TotVenta}</p>
              <p className="text-sm text-gray-600">{detalle.TotPzas} piezas</p>
            </div>
          </div>
          {partesOcultadas > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> {partesOcultadas} artículo(s) oculto(s) por falta de stock
              </p>
            </div>
          )}
        </header>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Partes del pedido {partesOcultadas > 0 && `(${partesMostrar.length} de ${detalle.Part.length} artículos en stock)`}
            </h3>
          </div>
          
          {partesMostrar.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No hay artículos disponibles para mostrar (todos están sin stock)</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artículo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imagen
                    </th>                  
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {partesMostrar.map((part) => (
                    <tr key={part.PartId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {part.Articulo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        {part.Descrip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {part.Cant}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {part.Ubicacion}
                      </td>                    
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => cambiarEstadoPrenda(part.PartId)}
                            className={`px-3 py-2 rounded-md flex items-center space-x-2 transition-colors hover:cursor-pointer ${
                              part.Status.trim() === "1" 
                                ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                          >
                            {part.Status.trim() === "1" ? (
                              <FiCheck className="flex-shrink-0" />
                            ) : (
                              <FiRotateCcw className="flex-shrink-0" />
                            )}
                            <span className={`text-xs font-normal px-2 py-0.5 rounded-full ${
                              part.Status.trim() === "1" 
                                ? "bg-green-200 text-green-800" 
                                : "bg-yellow-200 text-yellow-800"
                            }`}>
                              {part.Status.trim() === "1" ? "Surtido" : "Pendiente"}
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getImageUrl(part.Imagen) && (
                          <img 
                            src={getImageUrl(part.Imagen)} 
                            alt={part.Descrip} 
                            className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() => openImageModal(getImageUrl(part.Imagen))}
                          />
                        ) || 'No Disponible'} 
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resumen y acciones */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Resumen del pedido</h3>
              <p className="text-sm text-gray-500">
                {partesMostrar.filter(p => p.Status.trim() === "1").length} de {partesMostrar.length} piezas surtidas
                {partesOcultadas > 0 && ` (${partesOcultadas} ocultas por stock)`}
              </p>
              {todosSurtidos() && (
                <p className="text-base bg-green-600 text-white mx-1 px-2 font-bold uppercase mt-1">
                  ¡Todos los artículos han sido surtidos!
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate("..")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 hover:ring-rose-500 hover:cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCambios}
                disabled={!todosSurtidos() || saving || partesMostrar.length === 0}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 hover:cursor-pointer ${
                  todosSurtidos() && partesMostrar.length > 0
                    ? "bg-rose-600 hover:bg-rose-700" 
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-xl font-semibold text-gray-700">Cargando detalles del pedido...</div>
  </div>
);

const ErrorScreen = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="max-w-md text-center">
      <div className="text-xl font-semibold text-red-600 mb-2">Error al cargar el pedido</div>
      <div className="text-gray-600 mb-4">{error}</div>
      <Link 
        to=".."   
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700"
      >
        Volver a la lista de pedidos
      </Link>
    </div>
  </div>
);

export default PedidoDetail;