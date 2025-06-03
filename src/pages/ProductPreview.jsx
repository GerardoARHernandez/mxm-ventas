import { useState, useEffect } from 'react';
import { FiMinus, FiPlus, FiCheck, FiShoppingCart, FiCalendar } from 'react-icons/fi';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SizeButton = ({ size, isSelected, onSelect }) => (
  <button
    onClick={() => onSelect(size.id)}
    className={`relative px-4 py-2 border rounded-md transition-all flex flex-col items-center hover:cursor-pointer ${
      isSelected
        ? 'border-black bg-gray-100 font-medium'
        : 'border-gray-300 hover:border-gray-400'
    } ${size.Exis === "0" && size.PorRecibir === "0" ? 'opacity-50 cursor-not-allowed' : ''}`}
    disabled={size.Exis === "0" && size.PorRecibir === "0"}
  >
    <span className="font-medium">{size.id}</span>
    <div className="flex flex-col items-center">
      <span className={`text-xs ${parseInt(size.Exis) > 0 ? 'text-green-600' : 'text-gray-500'}`}>
        {size.Exis} en stock
      </span>
      <span className={`text-xs ${parseInt(size.PorRecibir) > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
        {size.PorRecibir} por recibir
      </span>
    </div>
    {isSelected && (
      <FiCheck className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5" />
    )}
  </button>
);


const ColorButton = ({ color, isSelected, onSelect }) => (
  <div>
    <button
      onClick={() => onSelect(color.Codigo)}
      className={`relative p-1 border-2 rounded-full transition-all hover:cursor-pointer ${
        isSelected ? 'border-black' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <div className="w-20 h-20 rounded-full overflow-hidden">
        <img 
          src={`https://systemweb.ddns.net/CarritoWeb/${color.Imagen}`}
          alt={color.cvariacion}
          className="w-full h-full object-cover"
        />
      </div>
      {isSelected && (
        <FiCheck className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5" />
      )}
    </button>
    <p className="text-xs text-center mt-1">{color.cvariacion}</p>
  </div>
);

const ProductPreview = () => {
  const { modelCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Obtener el número de pedido de la URL si existe
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

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch('https://systemweb.ddns.net/CarritoWeb/APICarrito/ListModelos', {
          headers: { 'Origin': import.meta.env.VITE_API_ORIGIN },
        });
        if (!response.ok) throw new Error("Error al obtener los productos");
        const data = await response.json();
        
        const foundProduct = data.ListModelos.find(p => p.modelo === modelCode);
        if (!foundProduct) throw new Error("Producto no encontrado");
        
        setProduct(foundProduct);
        
        const variationsResponse = await fetch(`https://systemweb.ddns.net/CarritoWeb/APICarrito/ConsultaVariacionModelo?Modelo=${modelCode}`, {
          headers: { 'Origin': import.meta.env.VITE_API_ORIGIN },
        });
        if (!variationsResponse.ok) throw new Error("Error al obtener las variaciones");
        const variationsData = await variationsResponse.json();
        
        setVariations(variationsData || []);
        
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

  // Funciones para manejar cantidades normales
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

  // Funciones para manejar cantidades de preventa
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

  // Obtener stock disponible
  const getAvailableStock = () => {
    const selectedVariation = variations.find(v => v.Codigo === selectedColor);
    const selectedSizeData = selectedVariation?.Tallas?.find(s => s.id === selectedSize);
    return selectedSizeData ? parseInt(selectedSizeData.Exis) : 0;
  };

  // Obtener stock por recibir (preventa)
  const getPreorderStock = () => {
    const selectedVariation = variations.find(v => v.Codigo === selectedColor);
    const selectedSizeData = selectedVariation?.Tallas?.find(s => s.id === selectedSize);
    return selectedSizeData ? parseInt(selectedSizeData.PorRecibir) : 0;
  };

  // Manejar agregar al carrito normal
  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) return;
    
    setAddingToCart(true);
    try {
      // Obtener el artículo específico de la talla seleccionada
      const selectedVariation = variations.find(v => v.Codigo === selectedColor);
      const selectedSizeData = selectedVariation?.Tallas?.find(s => s.id === selectedSize);
      
      if (!selectedSizeData || !selectedSizeData.Articulo) {
        throw new Error("No se pudo determinar el código de artículo");
      }

      const ventaId = pedidoId || 'NUEVO';
      
      const response = await fetch('https://systemweb.ddns.net/CarritoWeb/APICarrito/agregaArtPed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': import.meta.env.VITE_API_ORIGIN
        },
        body: JSON.stringify({
          Usuario: user.username,
          articulo: selectedSizeData.Articulo, // Usamos el código de artículo específico
          cantidad: quantity,
          precio: product.Precio1,
          venta: ventaId
        })
      });

      if (!response.ok) {
        throw new Error("Error al agregar el artículo al pedido");
      }

      const result = await response.json();
      
      if (pedidoId) {
        navigate(`/carrito?pedido=${pedidoId}`);
      } else {
        navigate(`/carrito?pedido=${result.Folio}`);
      }
    } catch (err) {
      console.error("Error al agregar al carrito:", err);
      alert(err.message || "Ocurrió un error al agregar el artículo. Por favor intenta nuevamente.");
    } finally {
      setAddingToCart(false);
    }
  };

  // Manejar preventa
  const handlePreorder = async () => {
    if (!selectedColor || !selectedSize) return;
    
    setAddingToCart(true);
    try {
      const selectedVariation = variations.find(v => v.Codigo === selectedColor);
      const selectedSizeData = selectedVariation?.Tallas?.find(s => s.id === selectedSize);
      
      if (!selectedSizeData || !selectedSizeData.Articulo) {
        throw new Error("No se pudo determinar el código de artículo");
      }

      const ventaId = pedidoId || 'NUEVO';
      
      const response = await fetch('https://systemweb.ddns.net/CarritoWeb/APICarrito/agregaArtPed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': import.meta.env.VITE_API_ORIGIN
        },
        body: JSON.stringify({
          Usuario: user.username,
          articulo: selectedSizeData.Articulo, // Usamos el código de artículo específico
          cantidad: preorderQuantity,
          precio: product.Precio1,
          venta: ventaId
        })
      });

      if (!response.ok) {
        throw new Error("Error al agregar la preventa al pedido");
      }

      const result = await response.json();
      
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

  if (loading) return <div className="mt-5 mx-2 sm:mx-0 text-center py-8"><p>Cargando producto...</p></div>;
  if (error) return <div className="mt-5 mx-2 sm:mx-0 text-center py-8 text-red-500"><p>Error: {error}</p></div>;
  if (!product) return <div className="mt-5 mx-2 sm:mx-0 text-center py-8"><p>Producto no encontrado</p></div>;

  const selectedVariation = variations.find(v => v.Codigo === selectedColor) || {};
  const sizes = selectedVariation.Tallas || [];
  const selectedSizeData = sizes.find(s => s.id === selectedSize) || {};
  const availableStock = getAvailableStock();
  const preorderStock = getPreorderStock();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="h-[430px] bg-white flex items-center justify-center px-8 py-2 mt-3">
          {selectedVariation.Imagen ? (
            <img 
              src={`https://systemweb.ddns.net/CarritoWeb/${selectedVariation.Imagen}`}
              alt={product.Descrip}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          ) : (
            <span className="text-gray-400">Sin imagen disponible</span>
          )}
        </div>
        
        <div className="p-8">
          <h3 className="text-2xl font-bold text-center -mt-7 pb-12">{product.Descrip}</h3>
          
          <div className="grid grid-cols-2 gap-8 px-5 text-lg text-gray-800 mb-6">
            <div>
              <span className="font-semibold">Código:</span> {product.modelo}
            </div>
            <div>
              <span className="font-semibold">Precio:</span> ${product.Precio1}
            </div>
            {selectedSize && (
              <div className="col-span-2">
                <span className="font-semibold">Código de artículo:</span> {selectedSizeData?.Articulo}
              </div>
            )}
          </div>

          {variations.length > 0 && (
            <div className="mb-4">
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
            <div className="mb-4">
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
          
          <div className="space-y-6">
            {/* Selector de cantidad para stock disponible */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center">
                <button 
                  onClick={decrementQuantity}
                  className="p-3 bg-black text-white rounded-l-lg hover:bg-gray-800 transition-colors hover:cursor-pointer"
                  disabled={quantity === 1 || availableStock === 0}
                >
                  <FiMinus size={18} />
                </button>
                
                <input
                  type="number"
                  min="1"
                  max={availableStock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className={`w-16 h-10 text-center border-t border-b py-3 px-2 text-lg ${
                    availableStock > 0 ? 'border-gray-300' : 'border-gray-200 bg-gray-100'
                  }`}
                  disabled={availableStock === 0}
                />
                
                <button 
                  onClick={incrementQuantity}
                  className="p-3 bg-black text-white rounded-r-lg hover:bg-gray-800 transition-colors hover:cursor-pointer"
                  disabled={quantity >= availableStock || availableStock === 0}
                >
                  <FiPlus size={18} />
                </button>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={availableStock === 0 || addingToCart}
                className={`w-full max-w-xs py-3 px-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
                  availableStock > 0 && !addingToCart
                    ? 'bg-rose-600 hover:bg-rose-700 hover:cursor-pointer text-white'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FiShoppingCart className='text-3xl'/>
                {addingToCart 
                  ? 'Agregando...'
                  : availableStock > 0 
                    ? `Agregar al carrito (${availableStock} disponibles)`
                    : 'Sin existencias'}
              </button>
            </div>

            {/* Selector de cantidad para preventa - SIEMPRE VISIBLE */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center">
                <button 
                  onClick={decrementPreorderQuantity}
                  className={`p-3 rounded-l-lg transition-colors ${
                    preorderStock > 0
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-200 text-blue-500 cursor-not-allowed'
                  }`}
                  disabled={preorderQuantity === 1 || preorderStock === 0}
                >
                  <FiMinus size={18} />
                </button>
                
                <input
                  type="number"
                  min="1"
                  max={preorderStock}
                  value={preorderQuantity}
                  onChange={handlePreorderQuantityChange}
                  className={`w-16 h-10 text-center border-t border-b py-3 px-2 text-lg ${
                    preorderStock > 0 ? 'border-blue-300' : 'border-blue-200 bg-blue-100'
                  }`}
                  disabled={preorderStock === 0}
                />
                
                <button 
                  onClick={incrementPreorderQuantity}
                  className={`p-3 rounded-r-lg transition-colors ${
                    preorderStock > 0
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-200 text-blue-500 cursor-not-allowed'
                  }`}
                  disabled={preorderQuantity >= preorderStock || preorderStock === 0}
                >
                  <FiPlus size={18} />
                </button>
              </div>
              
              <button
                onClick={handlePreorder}
                disabled={preorderStock === 0 || addingToCart}
                className={`w-full max-w-xs py-3 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
                  preorderStock > 0 && !addingToCart
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-100 text-blue-400 cursor-not-allowed'
                }`}
              >
                <FiCalendar />
                {addingToCart
                  ? 'Agregando...'
                  : preorderStock > 0
                    ? `Reservar preventa (${preorderStock} por recibir)`
                    : 'No hay próximos ingresos'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;