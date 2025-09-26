import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CartSection from "../components/CartSection";
import { useAuth } from "../context/AuthContext";
import ImageModal from "../components/ImageModal"; // Nuevo componente que crearemos

const Cart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const pedidoId = queryParams.get('pedido');
  
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagesData, setImagesData] = useState({}); // Para almacenar las imágenes
  const [selectedImage, setSelectedImage] = useState(null); // Para el modal

  // Función para obtener el modelo del artículo (caracteres 3-6)
  const getModeloFromArticulo = (articulo) => {
    return articulo.substring(2, 6); // Índices 2 a 5 (caracteres 3-6)
  };

  // Función para obtener el código de variación (caracteres 3-7)
  const getCodigoVariacionFromArticulo = (articulo) => {
    return articulo.substring(2, 7); // Índices 2 a 6 (caracteres 2-7)
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
        // Reemplazar las barras invertidas por barras normales y construir la URL
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

  console.log(imagesData);

  // Transformar los datos del pedido al formato que espera CartSection
  const cartItems = useMemo(() => {
    if (!cartData?.Part) return [];
    
    return cartData.Part.map((item, index) => ({
      id: index,
      name: item.Descrip || `Artículo ${item.Articulo}`,
      price: parseFloat(item.Precio),
      quantity: parseInt(item.Cant),
      importe: parseFloat(item.Importe),
      code: item.Articulo,
      status: cartData.ESTADO === 'PE' ? 'preventa' : 'stock',
      image: imagesData[item.Articulo] || null // Agregar la imagen
    }));
  }, [cartData, imagesData]);

  // Función para abrir el modal de imagen
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Función para cerrar el modal
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const removeItem = async (index) => {
    try {
      // Obtenemos el PartId real del artículo a eliminar
      const itemToRemove = cartData.Part[index];
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
            PartId: itemToRemove.PartId // Usamos el PartId real del artículo
          })
        }
      );
      
      if (!response.ok) {
        throw new Error("Error al eliminar el artículo del pedido");
      }
      
      // Actualizar el estado del carrito después de eliminar el artículo
      setCartData(prevData => ({
        ...prevData,
        Part: prevData.Part.filter(item => item.PartId !== itemToRemove.PartId)
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
      
      // Redirigir a la página principal después de cancelar
      alert('Pedido cancelado correctamente');
      navigate('/');
    } catch (err) {
      setError(err.message);
      alert(`Error al cancelar el pedido: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const processOrder = async () => {
    if (!pedidoId) {
      alert("Procesando nuevo pedido");
      return;
    }

    if (!window.confirm('¿Estás seguro que deseas CONFIRMAR este pedido como completado?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://systemweb.ddns.net/CarritoWeb/APICarrito/ConfirmarPedido`,
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
        throw new Error("Error al confirmar el pedido");
      }
      
      alert('Pedido confirmado como completado');
      navigate('/');
    } catch (err) {
      setError(err.message);
      alert(`Error al confirmar el pedido: ${err.message}`);
    } finally {
      setLoading(false);
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
            <div className="flex justify-between items-start mb-4">
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
              
              <div className="flex flex-wrap gap-2 font-semibold">
                {pedidoId && (
                  <>
                    <Link 
                      to={`/productos?pedido=${pedidoId}`}
                      className="bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white px-4 py-2 rounded-md"
                    >
                      Agregar más productos
                    </Link>
                    <button
                      onClick={cancelOrder}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 hover:cursor-pointer text-white px-4 py-2 rounded-md disabled:opacity-50"
                    >
                      Cancelar Pedido
                    </button>
                  </>
                )}
              </div>
            </div>

            <CartSection 
              title="Artículos del Pedido" 
              items={cartItems} 
              subtotal={parseFloat(cartData.TotVenta)} 
              onProcess={processOrder}
              processButtonText="Confirmar Pedido"
              processButtonColor="green"
              removeItem={removeItem}
              loading={loading}
              onClean={clearCart}
              onImageClick={openImageModal} // Pasar función para abrir modal
            />

            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold">${parseFloat(cartData.TotVenta).toFixed(2)}</span>
              </div>
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