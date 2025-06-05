import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CartSection from "../components/CartSection";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const pedidoId = queryParams.get('pedido');
  
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        
        if (pedidoId) {
          const response = await fetch(
            `https://systemweb.ddns.net/CarritoWeb/APICarrito/Pedido/${pedidoId}?t=${Date.now()}`,
            {
              cache: "no-store" // también puedes intentar esto
            }
          );
          
          if (!response.ok) {
            throw new Error("Error al obtener los datos del pedido");
          }
          
          const data = await response.json();
          setCartData(data);
        } else {
          // Lógica para carrito nuevo
          setCartData(null);
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

  // Transformar los datos del pedido al formato que espera CartSection
  const cartItems = useMemo(() => {
    if (!cartData?.Part) return [];
    
    return cartData.Part.map((item, index) => ({
      id: index, // Usamos el índice como ID temporal
      name: item.Descrip || `Artículo ${item.Articulo}`,
      price: parseFloat(item.Precio),
      quantity: parseInt(item.Cant),
      importe: parseFloat(item.Importe),
      code: item.Articulo,
      status: cartData.ESTADO === 'PE' ? 'preventa' : 'stock'
    }));
  }, [cartData]);

  const removeItem = (id) => {
    // Implementar lógica para eliminar item cuando la API esté disponible
    alert("Función de eliminar artículo no implementada aún");
  };

  const processOrder = () => {
    if (pedidoId) {
      // Implementar lógica para completar pedido cuando la API esté disponible
      alert(`Pedido #${pedidoId} marcado como completado`);
      navigate('/');
    } else {
      // Lógica para carrito nuevo
      alert("Procesando nuevo pedido");
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
            
            {pedidoId && (
              <Link 
                to={`/productos?pedido=${pedidoId}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Agregar más productos
              </Link>
            )}
          </div>

          <CartSection 
            title="Artículos del Pedido" 
            items={cartItems} 
            subtotal={parseFloat(cartData.TotVenta)} 
            onProcess={processOrder}
            processButtonText="Marcar como Completado"
            processButtonColor="blue"
            removeItem={removeItem}
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
  );
};

export default Cart;