import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
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
  const { updateCartCount } = useCart();
  
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
  const [canSellByPackage, setCanSellByPackage] = useState(false);
  const [packageDetails, setPackageDetails] = useState({ pzasPaq: 0, hasPackageStock: false });
  
  // Nuevo estado para el precio personalizado
  const [customPrice, setCustomPrice] = useState('');
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  // Verificar si es un modelo PAQ
  const isPAQModel = modelCode === 'PAQ';

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
        const packageVariation = variationsData.find(variation => variation.pzasPaq > 0);
        const canPackage = !!packageVariation;
        setCanSellByPackage(canPackage);
        
        if (packageVariation) {
          const hasPackageStock = checkPackageStock(packageVariation.pzasPaq, variationsData);
          setPackageDetails({
            pzasPaq: packageVariation.pzasPaq,
            hasPackageStock
          });
        }
        
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

  // Función para verificar stock para paquete
  const checkPackageStock = (pzasPaq, variationsData) => {
    return variationsData.every(variation => {
      return variation.Tallas?.every(size => {
        const availableStock = parseInt(size.Exis) || 0;
        return availableStock >= pzasPaq;
      });
    });
  };

  // Actualizar el precio personalizado cuando cambia la variación seleccionada
  useEffect(() => {
    if (isPAQModel && variations.length > 0 && selectedColor && selectedSize) {
      const price = getIndividualPrice();
      setCustomPrice(price.toString());
    }
  }, [selectedColor, selectedSize, variations, isPAQModel]);

  // Actualizar estado del paquete cuando cambian las variaciones
  useEffect(() => {
    if (variations.length > 0 && canSellByPackage) {
      const packageVariation = variations.find(variation => variation.pzasPaq > 0);
      if (packageVariation) {
        const hasPackageStock = checkPackageStock(packageVariation.pzasPaq, variations);
        setPackageDetails({
          pzasPaq: packageVariation.pzasPaq,
          hasPackageStock
        });
      }
    }
  }, [variations, canSellByPackage]);

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

  // Manejar cambio del precio personalizado
  const handleCustomPriceChange = (e) => {
    const value = e.target.value;
    // Permitir solo números y punto decimal
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomPrice(value);
    }
  };

  // Activar/desactivar edición del precio
  const togglePriceEdit = () => {
    setIsEditingPrice(!isEditingPrice);
  };

  // Obtener el precio final a usar (personalizado o normal)
  const getFinalPrice = () => {
    if (isPAQModel && customPrice) {
      return parseFloat(customPrice);
    }
    return getIndividualPrice();
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

      const finalPrice = getFinalPrice();
      const desdeInventario = availableStock > 0;

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
          precio: finalPrice, // Usar el precio final (personalizado o normal)
          venta: pedidoId || 'NUEVO',
          desdeInventario: desdeInventario
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

      const finalPrice = getFinalPrice();
      const ventaId = pedidoId || 'NUEVO';
      const desdeInventario = false;
      
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
          precio: finalPrice, // Usar el precio final (personalizado o normal)
          venta: ventaId,
          desdeInventario: desdeInventario
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
    if (!packageDetails.hasPackageStock) return;
    
    setAddingToCart(true);
    try {
      const ventaId = pedidoId || 'NUEVO';
      let lastResponse = null;
      let successCount = 0;
      
      // Agregar pzasPaq cantidad de cada color/talla
      for (const variation of variations) {
        for (const size of variation.Tallas) {
          const finalPrice = isPAQModel && customPrice ? parseFloat(customPrice) : (parseFloat(size.precio3) || 0);
          const desdeInventario = parseInt(size.Exis) > 0;

          const response = await fetch('https://systemweb.ddns.net/CarritoWeb/APICarrito/agregaArtPed', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Origin': import.meta.env.VITE_API_ORIGIN
            },
            body: JSON.stringify({
              Usuario: user.username,
              articulo: size.Articulo,
              cantidad: packageDetails.pzasPaq, // Agregar la cantidad especificada en pzasPaq
              precio: finalPrice,
              venta: ventaId,
              desdeInventario: desdeInventario
            })
          });

          if (!response.ok) {
            throw new Error(`Error al agregar el artículo ${size.Articulo} al pedido`);
          }
          
          lastResponse = response;
          successCount++;
        }
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
  const finalPrice = getFinalPrice();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <ProductImage 
          imageUrl={selectedVariation.Imagen} 
          altText={product.Descrip} 
        />
        
        {/* Componente ProductInfo modificado para manejar precio editable */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{product.Descrip}</h2>
          
          {/* Precio editable para modelos PAQ */}
          {isPAQModel ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio {isEditingPrice ? '(Editable)' : ''}
              </label>
              <div className="flex items-center gap-2">
                {isEditingPrice ? (
                  <input
                    type="text"
                    value={customPrice}
                    onChange={handleCustomPriceChange}
                    onBlur={togglePriceEdit}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <span 
                    className="text-3xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={togglePriceEdit}
                    title="Haz clic para editar el precio"
                  >
                    ${finalPrice.toFixed(2)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={togglePriceEdit}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {isEditingPrice ? 'Cancelar' : 'Editar'}
                </button>
              </div>
              {!isEditingPrice && (
                <p className="text-sm text-gray-500 mt-1">
                  Precio original: ${individualPrice.toFixed(2)} - Haz clic en el precio para editarlo
                </p>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">
                ${individualPrice.toFixed(2)}
              </span>
              {packagePrice > 0 && canSellByPackage && (
                <p className="text-lg text-green-600 font-semibold">
                  Precio por paquete: ${packagePrice.toFixed(2)}
                </p>
              )}
            </div>
          )}
          
          <p className="text-gray-600 mb-4">{product.Descrip}</p>
          
          {selectedSizeData && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Artículo:</span> {selectedSizeData.Articulo}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Stock disponible:</span> {availableStock}
              </p>
              {preorderStock > 0 && (
                <p className="text-sm text-orange-600">
                  <span className="font-semibold">Por recibir:</span> {preorderStock}
                </p>
              )}
            </div>
          )}

          {/* Información del paquete */}
          {canSellByPackage && (
            <div className="bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Venta por paquete disponible:</strong> {packageDetails.pzasPaq} piezas por color/talla
              </p>
              <p className="text-sm text-blue-600">
                {packageDetails.hasPackageStock 
                  ? `✓ Stock suficiente para paquete (${packageDetails.pzasPaq} piezas de cada color/talla)`
                  : `✗ Stock insuficiente para paquete (se necesitan ${packageDetails.pzasPaq} piezas de cada color/talla)`
                }
              </p>
            </div>
          )}
        </div>

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
            allSizesHaveStock={packageDetails.hasPackageStock}
            addingToCart={addingToCart}
            individualPrice={finalPrice}
            packagePrice={packagePrice}
            canSellByPackage={canSellByPackage}
            packageDetails={packageDetails}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;