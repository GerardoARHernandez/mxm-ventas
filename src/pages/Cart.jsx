import { useState, useMemo, useCallback } from "react";
import { cartProducts } from "../data";
import CartSection from "../components/CartSection";

const Cart = () => {
  const [cartItems, setCartItems] = useState([cartProducts[0], cartProducts[1], cartProducts[2]]);

  // Memoizar cálculos para mejor rendimiento
  const { stockItems, preorderItems, stockSubtotal, preorderSubtotal } = useMemo(() => {
    const stockItems = cartItems.filter(item => item.status === "stock");
    const preorderItems = cartItems.filter(item => item.status === "preventa");
    
    return {
      stockItems,
      preorderItems,
      stockSubtotal: stockItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      preorderSubtotal: preorderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
  }, [cartItems]);

  // Usar useCallback para funciones que pasamos a componentes hijos
  const removeItem = useCallback((id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  const processStock = useCallback(() => {
    alert(`Procesando ${stockItems.length} productos en stock. Total: $${stockSubtotal.toFixed(2)}`);
    setCartItems(prevItems => prevItems.filter(item => item.status !== "stock"));
  }, [stockItems.length, stockSubtotal]);

  const processPreorder = useCallback(() => {
    alert(`Procesando ${preorderItems.length} productos en preventa. Total: $${preorderSubtotal.toFixed(2)}`);
    setCartItems(prevItems => prevItems.filter(item => item.status !== "preventa"));
  }, [preorderItems.length, preorderSubtotal]);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Mi Carrito</h1>
        
        <CartSection 
          title="En Stock" 
          items={stockItems} 
          subtotal={stockSubtotal} 
          onProcess={processStock}
          processButtonColor="blue"
          removeItem={removeItem}
        />

        <CartSection 
          title="En Preventa" 
          items={preorderItems} 
          subtotal={preorderSubtotal} 
          onProcess={processPreorder}
          processButtonColor="rose"
          removeItem={removeItem}
        />
      </div>
    </div>
  );
};

export default Cart;