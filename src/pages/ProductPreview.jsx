import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; // Importar el contexto del carrito
import SizeButton from '../components/Product/SizeButton';
import ColorButton from '../components/Product/ColorButton';
import ProductImage from '../components/Product/ProductImage';
import ProductInfo from '../components/Product/ProductInfo';
import ProductActions from '../components/Product/ProductActions';

const ProductPreview = () => {
  const { modelCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateCartCount } = useCart(); // Usar el contexto del carrito
  
  const queryParams = new URLSearchParams(location.search);
  const pedidoId = queryParams.get('pedido');
  
  const [product, setProduct] = useState(null);
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [preorderQuantity, setPreorderQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Nuevo estado para controlar si se puede vender por paquete
  const [canSellByPackage, setCanSellByPackage] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch('https://systemweb.ddns.net/CarritoWeb/APICarrito/ListModelos', {
          headers: { 
            'Origin': import.meta.env.VITE_API_ORIGIN,
          },
          cache: 'no-store'
        });
        if (!response.ok) throw new Error("Error al obtener los productos");
        const data = await response.json();
        
        const foundProduct = data.ListModelos.find(p => p.modelo === modelCode);
        if (!foundProduct) throw new Error("Producto no encontrado");
        
        setProduct(foundProduct);
        
        const variationsResponse = await fetch(
          `https://systemweb.ddns.net/CarritoWeb/APICarrito/ConsultaVariacionModelo?Modelo=${modelCode}&t=${Date.now()}`,
          {
            headers: { 'Origin': import.meta.env.VITE_API_ORIGIN },
          }
        );

        if (!variationsResponse.ok) throw new Error("Error al obtener las variaciones");
        const variationsData = await variationsResponse.json();
        
        setVariations(variationsData || []);
        
        // Verificar si se puede vender por paquete
        const canPackage = variationsData.some(variation => variation.pzasPaq === 1);
        setCanSellByPackage(canPackage);
        
        if (variationsData.length > 0) {
          setSelectedColor(variationsData[0].Codigo);
          if (variationsData[0].Tallas?.length > 0) {
            setSelectedSize(variationsData[0].Tallas[0].id);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [modelCode]);

  const handleSizeChange = (sizeId) => {
    setSelectedSize(sizeId);
    setQuantity(1);
    setPreorderQuantity(1);
  };

  const handleColorChange = (colorCode) => {
    setSelectedColor(colorCode);
    const selectedVariation = variations.find(v => v.Codigo === colorCode);
    if (selectedVariation?.Tallas?.length > 0) {
      setSelectedSize(selectedVariation.Tallas[0].id);
    } else {
      setSelectedSize('');
    }
    setQuantity(1);
    setPreorderQuantity(1);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const max = getAvailableStock();
    setQuantity(Math.max(1, Math.min(value, max)));
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, getAvailableStock()));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handlePreorderQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const max = getPreorderStock();
    setPreorderQuantity(Math.max(1, Math.min(value, max)));
  };

  const incrementPreorderQuantity = () => {
    setPreorderQuantity(prev => Math.min(prev + 1, getPreorderStock()));
  };

  const decrementPreorderQuantity = () => {
    setPreorderQuantity(prev => Math.max(1, prev - 1));
  };

  const getAvailableStock = () => {
    const selectedVariation = variations.find(v => v.Codigo === selectedColor);
    const selectedSizeData = selectedVariation?.Tallas?.find(s => s.id === selectedSize);
    return selectedSizeData ? parseInt(selectedSizeData.Exis) : 0;
  };

  const getPreorderStock = () => {
    const selectedVariation = variations.find(v => v.Codigo === selectedColor);
    const selectedSizeData = selectedVariation?.Tallas?.find(s => s.id === selectedSize);
    return selectedSizeData ? parseInt(selectedSizeData.PorRecibir) : 0;
  };

  // Obtener precio individual (precio2)
  const getIndividualPrice = () => {
    const selectedVariation = variations.find(v => v.Codigo === selectedColor);
    const selectedSizeData = selectedVariation?.Tallas?.find(s => s.id === selectedSize);
    return selectedSizeData ? parseFloat(selectedSizeData.precio2) : 0;
  };

  // Obtener precio por paquete (precio3)
  const getPackagePrice = () => {
    const selectedVariation = variations.find(v => v.Codigo === selectedColor);
    const selectedSizeData = selectedVariation?.Tallas?.find(s => s.id === selectedSize);
    return selectedSizeData ? parseFloat(selectedSizeData.precio3) : 0;
  };

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) return;
    
    setAddingToCart(true);
    setSuccessMessage('');
    try {
      const selectedVariation = variations.find(v => v.Codigo === selectedColor);
      const selectedSizeData = selectedVariation?.Tallas?.find(s => s.id === selectedSize);
      
      if (!selectedSizeData || !selectedSizeData.Articulo) {
        throw new Error("No se pudo determinar el código de artículo");
      }

      const individualPrice = getIndividualPrice();
      const desdeInventario = availableStock > 0; // true si hay stock, false si no hay

      // Actualizar stock localmente
      const updatedVariations = variations.map(variation => {
        if (variation.Codigo === selectedColor) {
          return {
            ...variation,
            Tallas: variation.Tallas.map(size => {
              if (size.id === selectedSize) {
                return {
                  ...size,
                  Exis: (parseInt(size.Exis) - quantity).toString()
                };
              }
              return size;
            })
          };
        }
        return variation;
      });
      setVariations(updatedVariations);

      const response = await fetch('https://systemweb.ddns.net/CarritoWeb/APICarrito/agregaArtPed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': import.meta.env.VITE_API_ORIGIN
        },
        body: JSON.stringify({
          Usuario: user.username,
          articulo: selectedSizeData.Articulo,
          cantidad: quantity,
          precio: individualPrice, // Usar precio2 individual
          venta: pedidoId || 'NUEVO',
          desdeInventario: desdeInventario // Nuevo parámetro agregado
        })
      });

      if (!response.ok) {
        // Revertir cambios locales si hay error
        setVariations(variations);
        throw new Error("Error al agregar el artículo al pedido");
      }

      const result = await response.json();
      
      // Actualizar contador del carrito
      updateCartCount(true);
      
      setSuccessMessage('Pedido agregado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error("Error al agregar al carrito:", err);
      alert(err.message || "Ocurrió un error al agregar el artículo. Por favor intenta nuevamente.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handlePreorder = async () => {
    if (!selectedColor || !selectedSize) return;
    
    setAddingToCart(true);
    try {
      const selectedVariation = variations.find(v => v.Codigo === selectedColor);
      const selectedSizeData = selectedVariation?.Tallas?.find(s => s.id === selectedSize);
      
      if (!selectedSizeData || !selectedSizeData.Articulo) {
        throw new Error("No se pudo determinar el código de artículo");
      }

      const individualPrice = getIndividualPrice();
      const ventaId = pedidoId || 'NUEVO';
      const desdeInventario = false; // Para preventas siempre es false
      
      const response = await fetch('https://systemweb.ddns.net/CarritoWeb/APICarrito/agregaArtPed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': import.meta.env.VITE_API_ORIGIN
        },
        body: JSON.stringify({
          Usuario: user.username,
          articulo: selectedSizeData.Articulo,
          cantidad: preorderQuantity,
          precio: individualPrice, // Usar precio2 individual para preventas
          venta: ventaId,
          desdeInventario: desdeInventario // Nuevo parámetro agregado
        })
      });

      if (!response.ok) {
        throw new Error("Error al agregar la preventa al pedido");
      }

      const result = await response.json();
      
      // Actualizar contador del carrito
      updateCartCount(true);
      
      if (pedidoId) {
        navigate(`/carrito?pedido=${pedidoId}`);
      } else {
        navigate(`/carrito?pedido=${result.Folio}`);
      }
    } catch (err) {
      console.error("Error al agregar preventa:", err);
      alert(err.message || "Ocurrió un error al agregar la preventa. Por favor intenta nuevamente.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddPackage = async () => {
    if (!selectedColor || !allSizesHaveStock()) return;
    
    setAddingToCart(true);
    try {
      const selectedVariation = variations.find(v => v.Codigo === selectedColor);
      const ventaId = pedidoId || 'NUEVO';
      let lastResponse = null;
      
      for (const size of selectedVariation.Tallas) {
        const packagePrice = parseFloat(size.precio3) || 0; // Usar precio3 para paquetes
        const desdeInventario = parseInt(size.Exis) > 0; // true si hay stock, false si no hay

        const response = await fetch('https://systemweb.ddns.net/CarritoWeb/APICarrito/agregaArtPed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': import.meta.env.VITE_API_ORIGIN
          },
          body: JSON.stringify({
            Usuario: user.username,
            articulo: size.Articulo,
            cantidad: 1, // Siempre 1 por talla en paquete
            precio: packagePrice, // Usar precio3 (descuento por paquete)
            venta: ventaId,
            desdeInventario: desdeInventario // Nuevo parámetro agregado
          })
        });

        if (!response.ok) {
          throw new Error(`Error al agregar el artículo ${size.Articulo} al pedido`);
        }
        
        lastResponse = response;
      }

      const result = await lastResponse.json();
      
      // Actualizar contador del carrito
      updateCartCount(true);
      
      if (pedidoId) {
        navigate(`/carrito?pedido=${pedidoId}`);
      } else {
        navigate(`/carrito?pedido=${result.Folio}`);
      }
    } catch (err) {
      console.error("Error al agregar paquete:", err);
      alert(err.message || "Ocurrió un error al agregar el paquete. Por favor intenta nuevamente.");
    } finally {
      setAddingToCart(false);
    }
  };

  // Modificar la validación para incluir pzasPaq
  const allSizesHaveStock = () => {
    const selectedVariation = variations.find(v => v.Codigo === selectedColor);
    if (!selectedVariation || !selectedVariation.Tallas) return false;
    
    // Verificar que todas las tallas tengan stock y que se pueda vender por paquete
    const hasStockForAllSizes = selectedVariation.Tallas.every(size => 
      parseInt(size.Exis) > 0 || parseInt(size.PorRecibir) > 0
    );
    
    return hasStockForAllSizes && selectedVariation.pzasPaq === 1;
  };

  if (loading) return <div className="mt-5 mx-2 sm:mx-0 text-center py-8"><p>Cargando producto...</p></div>;
  if (error) return <div className="mt-5 mx-2 sm:mx-0 text-center py-8 text-red-500"><p>Error: {error}</p></div>;
  if (!product) return <div className="mt-5 mx-2 sm:mx-0 text-center py-8"><p>Producto no encontrado</p></div>;

  const selectedVariation = variations.find(v => v.Codigo === selectedColor) || {};
  const sizes = selectedVariation.Tallas || [];
  const selectedSizeData = sizes.find(s => s.id === selectedSize) || {};
  const availableStock = getAvailableStock();
  const preorderStock = getPreorderStock();
  const individualPrice = getIndividualPrice();
  const packagePrice = getPackagePrice();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <ProductImage 
          imageUrl={selectedVariation.Imagen} 
          altText={product.Descrip} 
        />
        
        <ProductInfo 
          product={product} 
          selectedSizeData={selectedSizeData}
          individualPrice={individualPrice}
          packagePrice={packagePrice}
          canSellByPackage={canSellByPackage}
        />
        
        {variations.length > 0 && (
          <div className="mb-4 px-8">
            <h4 className="text-lg font-semibold mb-3">Colores disponibles:</h4>
            <div className="flex flex-wrap gap-5 md:gap-3">
              {variations.map(variation => (
                <ColorButton
                  key={variation.Codigo}
                  color={variation}
                  isSelected={selectedColor === variation.Codigo}
                  onSelect={handleColorChange}
                />
              ))}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div className="mb-4 px-8">
            <h4 className="text-lg font-semibold mb-3">Tallas disponibles:</h4>
            <div className="flex flex-wrap gap-3">
              {sizes.map(size => (
                <SizeButton
                  key={size.id}
                  size={size}
                  isSelected={selectedSize === size.id}
                  onSelect={handleSizeChange}
                />
              ))}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="px-8">
            <div className="bg-green-600 uppercase font-semibold text-white text-center py-2 rounded-md mb-4">
              {successMessage}
            </div>
          </div>
        )}
        
        <div className="px-8 pb-8">
          <ProductActions
            availableStock={availableStock}
            preorderStock={preorderStock}
            quantity={quantity}
            preorderQuantity={preorderQuantity}
            onQuantityChange={handleQuantityChange}
            onPreorderQuantityChange={handlePreorderQuantityChange}
            onIncrementQuantity={incrementQuantity}
            onDecrementQuantity={decrementQuantity}
            onIncrementPreorderQuantity={incrementPreorderQuantity}
            onDecrementPreorderQuantity={decrementPreorderQuantity}
            onAddToCart={handleAddToCart}
            onPreorder={handlePreorder}
            onAddPackage={handleAddPackage}
            allSizesHaveStock={allSizesHaveStock()}
            addingToCart={addingToCart}
            individualPrice={individualPrice}
            packagePrice={packagePrice}
            canSellByPackage={canSellByPackage}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;