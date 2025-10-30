import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiRotateCcw, FiX } from "react-icons/fi";
import ImageModal from "./ImageModal";

const PedidoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Clave para el localStorage
  const storageKey = `pedido_${id}_surtido`;

  // Cargar datos guardados del localStorage al iniciar
  const cargarDatosGuardados = () => {
    try {
      const datosGuardados = localStorage.getItem(storageKey);
      if (datosGuardados) {
        return JSON.parse(datosGuardados);
      }
    } catch (error) {
      console.error("Error al cargar datos del localStorage:", error);
    }
    return null;
  };

  // Guardar datos en el localStorage
  const guardarEnLocalStorage = (partesActualizadas) => {
    try {
      const datosAGuardar = {
        pedidoId: id,
        fechaGuardado: new Date().toISOString(),
        partes: partesActualizadas
      };
      localStorage.setItem(storageKey, JSON.stringify(datosAGuardar));
    } catch (error) {
      console.error("Error al guardar en localStorage:", error);
    }
  };

  // Limpiar datos del localStorage
  const limpiarLocalStorage = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Error al limpiar localStorage:", error);
    }
  };

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
        
        // Obtener detalle del pedido con ubicación, imagen y stock
        const detalleResponse = await fetch(`https://systemweb.ddns.net/CarritoWeb/APICarrito/PedidoConfirmado/${id}?t=${Date.now()}`);
        if (!detalleResponse.ok) throw new Error('Error al obtener el detalle del pedido');
        
        const detalleData = await detalleResponse.json();
        
        // Cargar datos guardados del localStorage
        const datosGuardados = cargarDatosGuardados();
        
        if (datosGuardados && detalleData.Part) {
          // Combinar datos de la API con los datos guardados en localStorage
          const partesCombinadas = detalleData.Part.map(part => {
            const parteGuardada = datosGuardados.partes.find(p => p.PartId === part.PartId);
            if (parteGuardada) {
              return {
                ...part,
                Status: parteGuardada.Status
              };
            }
            return part;
          });
          
          setDetalle({
            ...detalleData,
            Part: partesCombinadas
          });
          
        } else {
          setDetalle(detalleData);
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Filtrar partes: mostrar solo las que tienen Stock = 1 y NO empiezan con 99PAQ
  const partesFiltradas = () => {
    if (!detalle || !detalle.Part) return [];
    return detalle.Part.filter(part => 
      part.Stock === 1 && !part.Articulo?.startsWith('99PAQ')
    );
  };

  // Función para contar artículos ocultos (sin stock + 99PAQ)
  const contarArticulosOcultos = () => {
    if (!detalle || !detalle.Part) return 0;
    return detalle.Part.filter(part => 
      part.Stock !== 1 || part.Articulo?.startsWith('99PAQ')
    ).length;
  };

  // Función para contar artículos 99PAQ específicamente
  const contarArticulos99PAQ = () => {
    if (!detalle || !detalle.Part) return 0;
    return detalle.Part.filter(part => 
      part.Articulo?.startsWith('99PAQ')
    ).length;
  };

  const cambiarEstadoPrenda = (partId) => {
    setDetalle(prev => {
      if (!prev || !prev.Part) return prev;
      
      const partesActualizadas = prev.Part.map(part => 
        part.PartId === partId 
          ? { ...part, Status: part.Status.trim() === "0" ? "1" : "0" } 
          : part
      );
      
      // Guardar en localStorage después de actualizar
      const partesFiltradasParaGuardar = partesActualizadas.filter(part => 
        part.Stock === 1 && !part.Articulo?.startsWith('99PAQ')
      );
      
      guardarEnLocalStorage(partesFiltradasParaGuardar);
      
      return {
        ...prev,
        Part: partesActualizadas
      };
    });
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
        // Limpiar localStorage después de guardar exitosamente en la API
        limpiarLocalStorage();
        
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

  // Función para limpiar el progreso manualmente
  const limpiarProgreso = () => {
    if (window.confirm("¿Estás seguro de que quieres limpiar todo el progreso de surtido? Esta acción no se puede deshacer.")) {
      limpiarLocalStorage();
      
      // Resetear todos los status a "0"
      setDetalle(prev => {
        if (!prev || !prev.Part) return prev;
        
        const partesReseteadas = prev.Part.map(part => ({
          ...part,
          Status: "0"
        }));
        
        return {
          ...prev,
          Part: partesReseteadas
        };
      });
      
      alert("Progreso limpiado correctamente");
    }
  };

  const getImageUrl = (imageName) => {
    if (!imageName || imageName === 'imgMXM\\Catalogo\\') return null;
    
    if (imageName.startsWith('http')) return imageName;
    
    // Convertir backslashes a forward slashes y codificar espacios
    let processedImageName = imageName.replace(/\\/g, '/');
    
    // Codificar caracteres especiales en la URL
    const baseUrl = 'https://systemweb.ddns.net/CarritoWeb/';
    const encodedPath = processedImageName.split('/').map(part => 
      encodeURIComponent(part)
    ).join('/');
    
    return baseUrl + encodedPath;
  };

  // Función para verificar si una imagen existe
  const [imageErrors, setImageErrors] = useState({});
  const handleImageError = (partId) => {
    setImageErrors(prev => ({ ...prev, [partId]: true }));
  };

  const openImageModal = (imageUrl) => {
    if (imageUrl) {
      setCurrentImage(imageUrl);
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentImage('');
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  if (!pedido || !detalle) return <ErrorScreen error="No se pudo cargar la información del pedido" />;

  const partesMostrar = partesFiltradas();
  const partesOcultadas = contarArticulosOcultos();
  const partes99PAQ = contarArticulos99PAQ();

  // Calcular total de piezas y piezas surtidas
  const totalPiezas = partesMostrar.reduce((total, part) => total + parseInt(part.Cant), 0);
  const piezasSurtidas = partesMostrar.reduce((total, part) => 
    total + (part.Status.trim() === "1" ? parseInt(part.Cant) : 0), 0
  );

  // Verificar si hay datos guardados en localStorage
  const hayDatosGuardados = !!localStorage.getItem(storageKey);

  return (
    <div className="min-h-screen bg-blue-50">
      <ImageModal 
        isOpen={modalOpen} 
        imageUrl={currentImage} 
        onClose={closeModal} 
      />

      <div className="mx-auto p-4 md:p-6">
        <div className="mb-4 flex justify-between items-center">
          <Link 
            to=".." 
            className="inline-flex items-center text-rose-600 hover:text-rose-800 font-medium"
          >
            <FiArrowLeft className="mr-2" /> Volver a la lista de pedidos
          </Link>
          
          {hayDatosGuardados && (
            <button
              onClick={limpiarProgreso}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:cursor-pointer"
              title="Limpiar todo el progreso guardado"
            >
              <FiX className="mr-1" /> Limpiar progreso
            </button>
          )}
        </div>
        
        <header className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Pedido #{pedido.VENTA}
            </h1>            
            <p className="text-sm font-medium text-gray-500">Vendedor:{' '}
              <span className="text-base font-semibold text-gray-800">{detalle.Vendedor}</span>
            </p>
          </div>
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
              <p className="text-sm text-gray-600">{totalPiezas} piezas</p>
            </div>
          </div>
          
          {hayDatosGuardados && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700 flex items-center">
                <FiCheck className="mr-2" />
                <strong>Progreso guardado:</strong> Tienes {piezasSurtidas} de {totalPiezas} piezas surtidas. 
                Tu progreso se guarda automáticamente.
              </p>
            </div>
          )}
        </header>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            {partes99PAQ > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Los artículos PAQ(Envio) están excluidos del proceso de armado
              </p>
            )}
          </div>
          
          {partesMostrar.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                No hay artículos disponibles para mostrar 
                {(detalle.Part?.length > 0) && " (todos están sin stock o son artículos PAQ)"}
              </p>
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
                  {partesMostrar.map((part) => {
                    const imageUrl = getImageUrl(part.Imagen);
                    const hasImageError = imageErrors[part.PartId];
                    
                    return (
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
                          {imageUrl && !hasImageError ? (
                            <img 
                              src={imageUrl} 
                              alt={part.Descrip} 
                              className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={() => openImageModal(imageUrl)}
                              onError={() => handleImageError(part.PartId)}
                            />
                          ) : (
                            'No Disponible'
                          )} 
                        </td>
                      </tr>
                    );
                  })}
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
                {piezasSurtidas} de {totalPiezas} piezas surtidas
              </p>
              {todosSurtidos() && (
                <p className="text-base bg-green-600 text-white mx-1 px-2 font-bold uppercase mt-1">
                  ¡Todos los artículos han sido surtidos!
                </p>
              )}
              {hayDatosGuardados && (
                <p className="text-xs text-blue-600 mt-1">
                  ✓ Tu progreso está guardado automáticamente
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