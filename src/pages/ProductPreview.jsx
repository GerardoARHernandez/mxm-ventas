import { useState } from 'react';
import { FiMinus, FiPlus, FiSearch, FiCheck } from 'react-icons/fi';

const ProductPreview = () => {
  const [quantity, setQuantity] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState('GD');
  
  // Datos mockeados
  const productVariants = [
    {
      id: 1,
      imageUrl: 'https://permachef.com/cdn/shop/files/707c7627-167c-41f5-bf35-8fcc5e7a0e64_1512x.jpg?v=1683241257',
      name: 'Camiseta Premium de Algodón',
      color: 'Negro',
      sku: 'CP2023-NG',
      basePrice: 429.99,
      sizes: [
        { code: 'CH', price: 429.99, stock: 15 },
        { code: 'MD', price: 429.99, stock: 8 },
        { code: 'GD', price: 449.99, stock: 5 }
      ]
    },
    {
      id: 2,
      imageUrl: 'https://img.ltwebstatic.com/v4/j/spmp/2025/04/02/0e/17435841115d3ceeffda4d256245572c7f22b5c93c_thumbnail_405x.jpg',
      name: 'Camiseta Premium de Algodón',
      color: 'Blanco',
      sku: 'CP2023-BL',
      basePrice: 399.99,
      sizes: [
        { code: 'CH', price: 399.99, stock: 10 },
        { code: 'MD', price: 399.99, stock: 12 },
        { code: 'GD', price: 419.99, stock: 0 }
      ]
    }
  ];

  const product = productVariants[selectedVariant];
  const currentSize = product.sizes.find(size => size.code === selectedSize) || product.sizes[0];

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Barra de búsqueda */}
      <div className="mb-8">
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full py-3 pl-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FiSearch className="absolute right-4 top-3.5 text-gray-400 text-xl" />
        </div>
      </div>

      {/* Selector de variantes */}
      <div className="flex justify-center mb-8 space-x-4">
        {productVariants.map((variant, index) => (
          <button
            key={variant.id}
            onClick={() => {
              setSelectedVariant(index);
              setSelectedSize(variant.sizes[0].code);
            }}
            className={`px-6 py-2 rounded-full border-2 transition-colors hover:cursor-pointer ${
              selectedVariant === index 
                ? 'border-rose-900 bg-rose-900 text-white' 
                : 'border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            {variant.color}
          </button>
        ))}
      </div>
      
      {/* Contenedor del producto */}
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Imagen del producto */}
        <div className="h-96 bg-white flex items-center justify-center px-8 py-4">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        
        {/* Información del producto */}
        <div className="p-8">
          <h3 className="text-2xl font-bold text-center -mt-7 pb-12">{product.name}</h3>
          
          {/* Selector de tallas con existencias */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Seleccionar talla:</h4>
            <div className="flex space-x-3">
              {product.sizes.map(size => (
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
              <span className="font-semibold">Color:</span> {product.color}
            </div>
            <div>
              <span className="font-semibold">SKU:</span> {product.sku}
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