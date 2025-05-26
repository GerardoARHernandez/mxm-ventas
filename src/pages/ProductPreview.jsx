import { useState, useEffect, useMemo } from 'react';
import { FiMinus, FiPlus, FiCheck, FiCalendar, FiPackage } from 'react-icons/fi';
import { useParams } from 'react-router-dom';

const SizeButton = ({ size, isSelected, onSelect }) => (
  <button
    onClick={() => onSelect(size.id)}
    className={`relative px-4 py-2 border rounded-md transition-all flex flex-col items-center hover:cursor-pointer ${
      isSelected
        ? 'border-black bg-gray-100 font-medium'
        : 'border-gray-300 hover:border-gray-400'
    } ${size.Exis === "0" ? 'opacity-50 cursor-not-allowed' : ''}`}
    disabled={size.Exis === "0"}
  >
    <span className="font-medium">{size.id}</span>
    <span className={`text-xs mt-1 ${
      parseInt(size.Exis) > 5 ? 'text-green-600' : 
      parseInt(size.Exis) > 0 ? 'text-yellow-600' : 'text-red-600'
    }`}>
      {size.Exis} disponible{size.Exis !== "1" ? 's' : ''}
    </span>
    {isSelected && (
      <FiCheck className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5" />
    )}
  </button>
);

const ProductPreview = () => {
  const { modelCode } = useParams();
  const [product, setProduct] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');

  // Obtener información del producto
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        // Primero obtenemos la lista de productos para encontrar el seleccionado
        const response = await fetch('https://systemweb.ddns.net/CarritoWeb/APICarrito/ListModelos');
        if (!response.ok) throw new Error("Error al obtener los productos");
        const data = await response.json();
        
        const foundProduct = data.ListModelos.find(p => p.modelo === modelCode);
        if (!foundProduct) throw new Error("Producto no encontrado");
        
        setProduct(foundProduct);
        
        // Luego obtenemos las tallas disponibles
        const sizesResponse = await fetch(`https://systemweb.ddns.net/CarritoWeb/APICarrito/ConsultaTallas?Modelo=${modelCode}`);
        if (!sizesResponse.ok) throw new Error("Error al obtener las tallas");
        const sizesData = await sizesResponse.json();
        
        setSizes(sizesData.sdtTalla || []);
        
        if (sizesData.sdtTalla && sizesData.sdtTalla.length > 0) {
          setSelectedSize(sizesData.sdtTalla[0].id);
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
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    const selectedSizeData = sizes.find(s => s.id === selectedSize);
    const maxQuantity = selectedSizeData ? parseInt(selectedSizeData.Exis) : 1;
    setQuantity(Math.max(1, Math.min(value, maxQuantity)));
  };

  const incrementQuantity = () => {
    const selectedSizeData = sizes.find(s => s.id === selectedSize);
    const maxQuantity = selectedSizeData ? parseInt(selectedSizeData.Exis) : 1;
    setQuantity(prev => Math.min(prev + 1, maxQuantity));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  if (loading) {
    return (
      <div className="mt-5 mx-2 sm:mx-0 text-center py-8">
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-5 mx-2 sm:mx-0 text-center py-8 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mt-5 mx-2 sm:mx-0 text-center py-8">
        <p>Producto no encontrado</p>
      </div>
    );
  }

  const selectedSizeData = sizes.find(s => s.id === selectedSize) || {};
  const isOutOfStock = selectedSizeData.Exis === "0";

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Contenedor del producto */}
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Imagen del producto */}
        <div className="h-[430px] bg-white flex items-center justify-center px-8 py-2 mt-3">
          {product.Foto ? (
            <img 
              src={product.Foto} 
              alt={product.Descrip}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          ) : (
            <span className="text-gray-400">Sin imagen disponible</span>
          )}
        </div>
        
        {/* Información del producto */}
        <div className="p-8">
          <h3 className="text-2xl font-bold text-center -mt-7 pb-12">{product.Descrip}</h3>
          
          {/* Detalles del producto */}
          <div className="grid grid-cols-2 gap-8 px-5 text-lg text-gray-800 mb-6">
            <div>
              <span className="font-semibold">Código:</span> {product.modelo}
            </div>
            <div>
              <span className="font-semibold">Precio:</span> ${product.Precio1}
            </div>
          </div>

          {/* Selector de tallas */}
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
          
          {/* Selector de cantidad y botones */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex items-center">
              <button 
                onClick={decrementQuantity}
                className="p-3 bg-black text-white rounded-l-lg hover:bg-gray-800 transition-colors hover:cursor-pointer"
                disabled={quantity === 1}
              >
                <FiMinus size={18} />
              </button>
              
              <input
                type="number"
                min="1"
                max={selectedSizeData.Exis || 1}
                value={quantity}
                onChange={handleQuantityChange}
                className="w-16 h-10 text-center border-t border-b border-gray-300 py-3 px-2 text-lg"
              />
              
              <button 
                onClick={incrementQuantity}
                className="p-3 bg-black text-white rounded-r-lg hover:bg-gray-800 transition-colors hover:cursor-pointer"
                disabled={quantity >= parseInt(selectedSizeData.Exis || 1)}
              >
                <FiPlus size={18} />
              </button>
            </div>
            
            {/* Botón de agregar al carrito */}
            <div className='mx-auto flex justify-center'>
              <button
                disabled={isOutOfStock}
                className={`w-[15rem] py-3 rounded-lg font-semibold text-lg transition-colors ${
                  !isOutOfStock
                    ? 'bg-rose-600 hover:bg-rose-700 text-white hover:cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isOutOfStock ? 'SIN EXISTENCIAS' : 'Agregar al carrito'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;