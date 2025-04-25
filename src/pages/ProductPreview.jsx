import { useState, useEffect, useMemo, memo } from 'react';
import { FiMinus, FiPlus, FiSearch, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { products } from '../data';

const VariantButton = memo(({ variant, index, isSelected, onClick }) => (
  <button
    onClick={() => onClick(index)}
    className={`px-6 py-2 rounded-full border-2 transition-colors hover:cursor-pointer ${
      isSelected 
        ? 'border-rose-900 bg-rose-900 text-white font-semibold' 
        : 'border-gray-300 text-gray-700 hover:border-gray-400'
    }`}
  >
    {variant.color}
  </button>
));

const SizeButton = memo(({ size, isSelected, onSelect, stock }) => (
  <button
    onClick={() => onSelect(size.code)}
    className={`relative px-4 py-2 border rounded-md transition-all flex flex-col items-center hover:cursor-pointer ${
      isSelected
        ? 'border-black bg-gray-100 font-medium'
        : 'border-gray-300 hover:border-gray-400'
    } ${stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
    disabled={stock === 0}
  >
    <span className="font-medium">{size.code}</span>
    <span className={`text-xs mt-1 ${
      stock > 5 ? 'text-green-600' : 
      stock > 0 ? 'text-yellow-600' : 'text-red-600'
    }`}>
      {stock} disponible{stock !== 1 ? 's' : ''}
    </span>
    {isSelected && (
      <FiCheck className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5" />
    )}
  </button>
));

const ProductPreview = () => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const product = products[selectedProductIndex];
  const variant = product.variants[selectedVariantIndex];
  const currentSize = useMemo(() => 
    variant.sizes.find(size => size.code === selectedSize) || variant.sizes[0],
    [variant.sizes, selectedSize]
  );

  // Pre-cargar imágenes
  useEffect(() => {
    product.variants.forEach(v => {
      const img = new Image();
      img.src = v.imageUrl;
    });
  }, [product.variants]);

  // Inicializar tamaño seleccionado
  useEffect(() => {
    if (variant.sizes.length > 0 && !variant.sizes.some(s => s.code === selectedSize)) {
      setSelectedSize(variant.sizes[0].code);
    }
    setQuantity(0);
  }, [variant.sizes, selectedSize]);

  // Buscar productos
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results = products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variants.some(v => 
        v.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    setSearchResults(results);
    setShowResults(true);
  }, [searchQuery]);

  const handleSearchItemClick = (productIndex) => {
    setSelectedProductIndex(productIndex);
    setSelectedVariantIndex(0);
    setSearchQuery('');
    setShowResults(false);
    navigate('/producto');
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setQuantity(0);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setQuantity(Math.max(0, Math.min(value, currentSize.stock)));
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, currentSize.stock));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(0, prev - 1));
  };

  const variantButtons = useMemo(() => (
    product.variants.map((v, idx) => (
      <VariantButton
        key={v.sku}
        variant={v}
        index={idx}
        isSelected={selectedVariantIndex === idx}
        onClick={setSelectedVariantIndex}
      />
    ))
  ), [product.variants, selectedVariantIndex]);

  const sizeButtons = useMemo(() => (
    variant.sizes.map(size => (
      <SizeButton
        key={size.code}
        size={size}
        isSelected={selectedSize === size.code}
        onSelect={handleSizeChange}
        stock={size.stock}
      />
    ))
  ), [variant.sizes, selectedSize]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Barra de búsqueda */}
      <div className="mb-8 relative">
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full py-3 pl-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowResults(true)}
          />
          <FiSearch className="absolute right-4 top-3.5 text-gray-400 text-xl" />
        </div>
        
        {/* Resultados de búsqueda */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full max-w-xl mx-auto mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {searchResults.map((product, index) => (
              <div 
                key={product.id}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                onClick={() => handleSearchItemClick(index)}
              >
                <div className="font-semibold">{product.name}</div>
                <div className="text-sm text-gray-600">
                  Colores: {product.variants.map(v => v.color).join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Selector de variantes */}
      <div className="flex justify-center mb-8 space-x-4">
        {variantButtons}
      </div>
      
      {/* Contenedor del producto */}
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Imagen del producto */}
        <div className="h-96 bg-white flex items-center justify-center px-8 py-4">
          <img 
            src={variant.imageUrl} 
            alt={product.name}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        </div>
        
        {/* Información del producto */}
        <div className="p-8">
          <h3 className="text-2xl font-bold text-center -mt-7 pb-12">{product.name}</h3>
          
          {/* Selector de tallas con existencias */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Seleccionar talla:</h4>
            <div className="flex space-x-3">
              {variant.sizes.map(size => (
                <button
                  key={size.code}
                  onClick={() => handleSizeChange(size.code)}
                  className={`relative px-4 py-2 border rounded-md transition-all flex flex-col items-center hover:cursor-pointer ${
                    selectedSize === size.code
                      ? 'border-black bg-gray-100 font-medium'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${size.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={size.stock === 0}
                >
                  <span className="font-medium">{size.code}</span>
                  <span className={`text-xs mt-1 ${
                    size.stock > 5 ? 'text-green-600' : 
                    size.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {size.stock} disponible{size.stock !== 1 ? 's' : ''}
                  </span>
                  {selectedSize === size.code && (
                    <FiCheck className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Detalles del producto */}
          <div className="grid grid-cols-2 gap-8 px-5 text-lg text-gray-800 mb-6">
            <div>
              <span className="font-semibold">Color:</span> {variant.color}
            </div>
            <div>
              <span className="font-semibold">SKU:</span> {variant.sku}
            </div>
            <div>
              <span className="font-semibold">Precio:</span> ${currentSize.price.toFixed(2)}
            </div>
            <div>
              <span className="font-semibold">Talla seleccionada:</span> {selectedSize}
            </div>
          </div>
          
          {/* Selector de cantidad */}
          <div className="flex items-center justify-center mb-6">
            <button 
              onClick={decrementQuantity}
              className="p-3 bg-black text-white rounded-l-lg hover:bg-gray-800 transition-colors hover:cursor-pointer"
              disabled={quantity === 0}
            >
              <FiMinus size={18} />
            </button>
            
            <input
              type="number"
              min="0"
              max={currentSize.stock}
              value={quantity}
              onChange={handleQuantityChange}
              className="w-16 h-10 text-center border-t border-b border-gray-300 py-3 px-2 text-lg"
            />
            
            <button 
              onClick={incrementQuantity}
              className="p-3 bg-black text-white rounded-r-lg hover:bg-gray-800 transition-colors hover:cursor-pointer"
              disabled={quantity >= currentSize.stock}
            >
              <FiPlus size={18} />
            </button>
          </div>
          
          {/* Botón de agregar al carrito */}
          <button
            disabled={quantity === 0 || currentSize.stock === 0}
            className={`w-full py-3 rounded-lg font-semibold text-lg transition-colors ${
              quantity > 0 && currentSize.stock > 0
                ? 'bg-rose-600 hover:bg-rose-700 text-white hover:cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {currentSize.stock === 0 ? 'SIN EXISTENCIAS' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;