import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CartSection from "../components/CartSection";
import { useAuth } from "../context/AuthContext";
import ImageModal from "../components/ImageModal";

const Cart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const pedidoId = queryParams.get('pedido');
  
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagesData, setImagesData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false);

  // Función para obtener el modelo del artículo (caracteres 3-6)
  const getModeloFromArticulo = (articulo) => {
    return articulo.substring(2, 6);
  };

  // Función para obtener el código de variación (caracteres 3-7)
  const getCodigoVariacionFromArticulo = (articulo) => {
    return articulo.substring(2, 7);
  };

  // Función para buscar la imagen de un artículo
  const fetchImageForArticle = async (articulo) => {
    try {
      const modelo = getModeloFromArticulo(articulo);
      const codigoVariacion = getCodigoVariacionFromArticulo(articulo);
      
      const response = await fetch(
        `https://systemweb.ddns.net/CarritoWeb/APICarrito/ConsultaVariacionModelo?Modelo=${modelo}`
      );
      
      if (!response.ok) {
        throw new Error("Error al obtener variaciones del modelo");
      }
      
      const variaciones = await response.json();
      
      // Buscar la variación que coincida con nuestro código
      const variacion = variaciones.find(v => v.Codigo === codigoVariacion);
      
      if (variacion && variacion.Imagen) {
        const imagenPath = variacion.Imagen.replace(/\\/g, '/');
        console.log(`Imagen para artículo ${articulo}: ${imagenPath}`);
        return `https://systemweb.ddns.net/CarritoWeb/${imagenPath}`;
      }
      
      return null;
    } catch (error) {
      console.error(`Error al obtener imagen para artículo ${articulo}:`, error);
      return null;
    }
  };

  // Función para cargar todas las imágenes de los artículos del carrito
  const loadCartImages = async (partes) => {
    const images = {};
    
    for (const item of partes) {
      const imageUrl = await fetchImageForArticle(item.Articulo);
      images[item.Articulo] = imageUrl;
    }
    
    return images;
  };

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        
        if (pedidoId) {
          const response = await fetch(
            `https://systemweb.ddns.net/CarritoWeb/APICarrito/Pedido/${pedidoId}?t=${Date.now()}`,
            {
              cache: "no-store"
            }
          );
          
          if (!response.ok) {
            throw new Error("Error al obtener los datos del pedido");
          }
          
          const data = await response.json();
          setCartData(data);
          
          // Cargar imágenes para todos los artículos
          if (data.Part && data.Part.length > 0) {
            const images = await loadCartImages(data.Part);
            setImagesData(images);
          }
        } else {
          setCartData(null);
          setImagesData({});
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCartData();
    }
  }, [pedidoId, user]);

  // Separar artículos por Stock
  const { itemsStock, itemsNoStock } = useMemo(() => {
    if (!cartData?.Part) return { itemsStock: [], itemsNoStock: [] };
    
    const stockItems = [];
    const noStockItems = [];
    
    console.log("=== DEBUG CART ITEMS ===");
    cartData.Part.forEach((item, index) => {
      console.log(`Artículo ${item.Articulo}:`, {
        Descrip: item.Descrip,
        Stock: item.Stock,
        StockType: typeof item.Stock
      });

      const cartItem = {
        id: index,
        name: item.Descrip || `Artículo ${item.Articulo}`,
        price: parseFloat(item.Precio),
        quantity: parseInt(item.Cant),
        importe: parseFloat(item.Importe),
        code: item.Articulo,
        status: cartData.ESTADO === 'PE' ? 'preventa' : 'stock',
        image: imagesData[item.Articulo] || null,
        partId: item.PartId,
        partVta: item.PartVta,
        Stock: item.Stock
      };
      
      // Stock = 2 significa sin stock, cualquier otro valor es con stock
      if (item.Stock === 2) {
        noStockItems.push(cartItem);
        console.log(`→ Agregado a NO STOCK: ${item.Articulo}`);
      } else {
        stockItems.push(cartItem);
        console.log(`→ Agregado a STOCK: ${item.Articulo} (Stock: ${item.Stock})`);
      }
    });
    
    console.log("Resultado final:");
    console.log("- Items con stock:", stockItems.length);
    console.log("- Items sin stock:", noStockItems.length);
    console.log("=== FIN DEBUG ===");
    
    return { itemsStock: stockItems, itemsNoStock: noStockItems };
  }, [cartData, imagesData]);

  // Calcular totales
  const totalStock = itemsStock.reduce((sum, item) => sum + item.importe, 0);
  const totalNoStock = itemsNoStock.reduce((sum, item) => sum + item.importe, 0);
  const totalGeneral = totalStock + totalNoStock;

  // Determinar si mostrar el botón de confirmación parcial
  const showPartialConfirmButton = itemsStock.length > 0 && itemsNoStock.length > 0;

  console.log("=== BOTÓN CONFIRMACIÓN PARCIAL ===");
  console.log("Items con stock:", itemsStock.length);
  console.log("Items sin stock:", itemsNoStock.length);
  console.log("Mostrar botón parcial:", showPartialConfirmButton);
  console.log("=== FIN BOTÓN ===");

  // Función para abrir el modal de imagen
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Función para cerrar el modal
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const removeItem = async (index, isNoStockItem = false) => {
    try {
      const itemsArray = isNoStockItem ? itemsNoStock : itemsStock;
      const itemToRemove = itemsArray[index];
      
      if (!itemToRemove) {
        throw new Error("Artículo no encontrado en el carrito");
      }

      const response = await fetch(
        `https://systemweb.ddns.net/CarritoWeb/APICarrito/EliminarPartPed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Folio: pedidoId,
            PartId: itemToRemove.partId
          })
        }
      );
      
      if (!response.ok) {
        throw new Error("Error al eliminar el artículo del pedido");
      }
      
      // Actualizar el estado del carrito después de eliminar el artículo
      setCartData(prevData => ({
        ...prevData,
        Part: prevData.Part.filter(item => item.PartId !== itemToRemove.partId)
      }));

      alert(`Artículo eliminado del pedido #${pedidoId}`);
    } catch (err) {
      setError(err.message);
      alert(`Error al eliminar el artículo: ${err.message}`);
    }
  };

  const clearCart = async () => {
    if (!pedidoId) return;
    
    if (!window.confirm('¿Estás seguro que deseas vaciar todo el carrito? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://systemweb.ddns.net/CarritoWeb/APICarrito/VaciarPedido`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Folio: pedidoId
          })
        }
      );
      
      if (!response.ok) {
        throw new Error("Error al vaciar el carrito");
      }
      
      // Actualizar el estado del carrito
      setCartData(prevData => ({
        ...prevData,
        Part: [],
        TotVenta: 0
      }));
      
      alert('Carrito vaciado correctamente');
    } catch (err) {
      setError(err.message);
      alert(`Error al vaciar el carrito: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    if (!pedidoId) return;
    
    if (!window.confirm('¿Estás seguro que deseas CANCELAR COMPLETAMENTE este pedido? Esta acción es irreversible y eliminará todo el pedido.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://systemweb.ddns.net/CarritoWeb/APICarrito/CancelarPedido`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Folio: pedidoId
          })
        }
      );
      
      if (!response.ok) {
        throw new Error("Error al cancelar el pedido");
      }
      
      alert('Pedido cancelado correctamente');
      navigate('/');
    } catch (err) {
      setError(err.message);
      alert(`Error al cancelar el pedido: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Confirmar solo artículos en stock (Parcial = true)
  const confirmStockOnly = async () => {
    if (!pedidoId) return;
    
    if (!window.confirm('¿Estás seguro que deseas confirmar SOLO los artículos en stock? Los artículos sin stock permanecerán en el pedido.')) {
      return;
    }

    try {
      setProcessingOrder(true);
      const response = await fetch(
        `https://systemweb.ddns.net/CarritoWeb/APICarrito/ConfirmarPedido`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Folio: parseInt(pedidoId),
            EsParcial: true
          })
        }
      );
      
      if (!response.ok) {
        throw new Error("Error al confirmar el pedido parcial");
      }
      
      alert('Pedido parcial confirmado correctamente (solo artículos en stock)');
      navigate('/');
    } catch (err) {
      setError(err.message);
      alert(`Error al confirmar el pedido parcial: ${err.message}`);
    } finally {
      setProcessingOrder(false);
    }
  };

  // Confirmar todos los artículos (Parcial = false)
  const confirmAll = async () => {
    if (!pedidoId) return;
    
    if (!window.confirm('¿Estás seguro que deseas confirmar TODOS los artículos del pedido (stock y sin stock)?')) {
      return;
    }

    try {
      setProcessingOrder(true);
      const response = await fetch(
        `https://systemweb.ddns.net/CarritoWeb/APICarrito/ConfirmarPedido`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Folio: parseInt(pedidoId),
            EsParcial: false
          })
        }
      );
      
      if (!response.ok) {
        throw new Error("Error al confirmar el pedido completo");
      }
      
      alert('Pedido completo confirmado correctamente');
      navigate('/');
    } catch (err) {
      setError(err.message);
      alert(`Error al confirmar el pedido completo: ${err.message}`);
    } finally {
      setProcessingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando carrito...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!cartData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No se encontró información del pedido</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {pedidoId ? `Pedido #${pedidoId}` : 'Mi Carrito'}
                </h1>
                {pedidoId && (
                  <div className="mt-2">
                    <p className="text-gray-600">Cliente: {cartData?.NombreCLIENTE?.trim()}</p>
                    <p className="text-gray-600">Estado: {cartData?.ESTADO === 'PE' ? 'Pendiente' : 'Completado'}</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {pedidoId && (
                  <>
                    <Link 
                      to={`/productos?pedido=${pedidoId}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Agregar más productos
                    </Link>
                    <button
                      onClick={cancelOrder}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                    >
                      Cancelar Pedido
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Sección de Artículos en Stock */}
            {itemsStock.length > 0 && (
              <CartSection 
                title="🟢 Artículos en Stock" 
                items={itemsStock} 
                subtotal={totalStock}
                removeItem={(index) => removeItem(index, false)}
                loading={loading}
                onImageClick={openImageModal}
                showProcessButton={true}
                onProcess={confirmStockOnly}
                processButtonText="Confirmar Solo Stock"
                processButtonColor="yellow"
                onClean={clearCart}
              />
            )}

            {/* Sección de Artículos Sin Stock */}
            {itemsNoStock.length > 0 && (
              <div className="mt-8">
                <CartSection 
                  title="🟡 Artículos Sin Stock" 
                  items={itemsNoStock} 
                  subtotal={totalNoStock}
                  removeItem={(index) => removeItem(index, true)}
                  loading={loading}
                  onImageClick={openImageModal}
                  showProcessButton={false}
                  onClean={clearCart}
                />
              </div>
            )}

            {/* Resumen de Totales */}
            <div className="border-t border-gray-200 mt-6 pt-6 space-y-3">
              {itemsStock.length > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="font-semibold">Total Artículos en Stock:</span>
                  <span className="font-bold">${totalStock.toFixed(2)}</span>
                </div>
              )}
              
              {itemsNoStock.length > 0 && (
                <div className="flex justify-between items-center text-yellow-600">
                  <span className="font-semibold">Total Artículos Sin Stock:</span>
                  <span className="font-bold">${totalNoStock.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-lg border-t border-gray-300 pt-3">
                <span className="font-semibold">Total General:</span>
                <span className="font-bold">${totalGeneral.toFixed(2)}</span>
              </div>
            </div>

            {/* Botones de Acción Globales */}
            {(itemsStock.length > 0 || itemsNoStock.length > 0) && (
              <div className="mt-8 flex flex-wrap gap-4 justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={clearCart}
                    disabled={loading}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md disabled:opacity-50 transition-colors"
                  >
                    Vaciar Carrito
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {/* SOLO mostrar cuando hay ambos tipos de artículos */}
                  {showPartialConfirmButton && (
                    <button
                      onClick={confirmStockOnly}
                      disabled={processingOrder || loading}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-md disabled:opacity-50 transition-colors"
                    >
                      {processingOrder ? 'Procesando...' : 'Confirmar Solo Stock'}
                    </button>
                  )}
                  
                  <button
                    onClick={confirmAll}
                    disabled={processingOrder || loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md disabled:opacity-50 transition-colors"
                  >
                    {processingOrder ? 'Procesando...' : 'Confirmar Todos'}
                  </button>
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> 
                {itemsNoStock.length > 0 
                  ? ' Los artículos marcados como "Sin Stock" requieren confirmación especial. Puede confirmar solo los disponibles o todo el pedido.'
                  : ' Todos los artículos están disponibles en stock.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para imagen ampliada */}
      <ImageModal 
        imageUrl={selectedImage}
        isOpen={selectedImage !== null}
        onClose={closeImageModal}
      />
    </>
  );
};

export default Cart;
