import { useState, useEffect, useMemo, useCallback } from "react";
import { FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useDebounce } from "use-debounce"; // Instalar con: npm install use-debounce

const ProductGrid = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300); // 300ms de delay
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/ListProds');
        if (!response.ok) {
          throw new Error("Error al obtener los productos");
        }
        const data = await response.json();
        setProducts(data.ListProds || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Memoizar la agrupación de productos
  const productGroups = useMemo(() => {
    const groups = {};
    
    products.forEach(product => {
      const modelCode = product.ARTICULO.toString().substring(0, 8);
      const baseDescription = product.DESCRIP.split(' T-')[0];
      
      if (!groups[modelCode]) {
        groups[modelCode] = {
          baseDescription,
          products: [],
          allVariants: []
        };
      }
      
      groups[modelCode].products.push(product);
      groups[modelCode].allVariants.push({
        color: product.DESCRIP.split(' ').slice(-2)[0],
        size: product.DESCRIP.split(' T-')[1] || 'UT'
      });
    });
    
    return groups;
  }, [products]);

  // Memoizar los grupos filtrados
  const filteredGroups = useMemo(() => {
    return Object.entries(productGroups).filter(
      ([_, group]) =>
        group.baseDescription.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        group.products.some(p => 
          p.ARTICULO.includes(debouncedSearchQuery) ||
          p.Linea.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          p.Marca.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        )
    );
  }, [productGroups, debouncedSearchQuery]);

  // Memoizar la función toggle
  const toggleGroup = useCallback((modelCode) => {
    setExpandedGroups(prev => ({
      ...prev,
      [modelCode]: !prev[modelCode]
    }));
  }, []);

  if (loading) {
    return (
      <div className="mt-5 mx-2 sm:mx-0 text-center py-8">
        <p>Cargando productos...</p>
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

  return (
    <div className="mt-5 mx-2 sm:mx-0">
      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Buscar productos por descripción, código, línea o marca..."
            className="w-full py-2 pl-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FiSearch className="absolute right-4 top-2.5 text-gray-400 text-xl" />
        </div>
      </div>

      {/* Resultados */}
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredGroups.map(([modelCode, group]) => {
            const firstProduct = group.products[0];
            const variantCount = group.products.length;
            const isExpanded = expandedGroups[modelCode];
            
            return (
              <div 
                key={modelCode}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {/* Contenedor de imagen */}
                <div className="bg-gray-100 h-48 flex items-center justify-center relative">
                  {firstProduct.IMAGEN ? (
                    <img 
                      src={firstProduct.IMAGEN} 
                      alt={group.baseDescription} 
                      className="h-full w-full object-contain"
                      loading="lazy" // Optimización para carga de imágenes
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Sin imagen</span>
                  )}
                  
                  {variantCount > 1 && (
                    <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {variantCount} variantes
                    </div>
                  )}
                </div>
                
                {/* Detalles del producto */}
                <div className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">
                    {group.baseDescription}
                  </h3>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-600 font-bold">${firstProduct.PRECIO1}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      parseInt(firstProduct.EXISTENCIA) > 0
                      ? parseInt(firstProduct.EXISTENCIA) < 6
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    }`}>
                      {parseInt(firstProduct.EXISTENCIA) > 0 ? parseInt(firstProduct.EXISTENCIA) < 6 ? "Pocas Existencias" : "Disponible" : "Agotado"}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    <div>Código: {modelCode}...</div>
                    <div>Línea: {firstProduct.Linea}</div>
                    <div>Marca: {firstProduct.Marca}</div>
                  </div>
                  
                  {variantCount > 1 && (
                    <div className="mt-2 border-t pt-2">
                      <button 
                        onClick={() => toggleGroup(modelCode)}
                        className="flex items-center text-xs text-blue-500 hover:text-blue-700"
                      >
                        {isExpanded ? (
                          <>
                            <FiChevronUp className="mr-1" /> Ocultar variantes
                          </>
                        ) : (
                          <>
                            <FiChevronDown className="mr-1" /> Mostrar {variantCount} variantes
                          </>
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-2 text-xs">
                          <div className="font-medium mb-1">Variantes disponibles:</div>
                          <div className="grid grid-cols-2 gap-1">
                            {group.allVariants.map((variant, idx) => (
                              <div key={idx} className="flex items-center">
                                <span className="inline-block w-3 h-3 rounded-full mr-1" 
                                  style={{backgroundColor: getColorCode(variant.color)}} />
                                {variant.color} - T{variant.size}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {debouncedSearchQuery ? "No se encontraron productos" : products.length === 0 ? "No hay productos disponibles" : "Ingrese un término de búsqueda"}
        </div>
      )}
    </div>
  );
};

// Función auxiliar para obtener código de color (simplificado)
const getColorCode = (colorName) => {
  const colors = {
    'BLANCO': '#FFFFFF',
    'AMARILLO': '#FFFF00',
    'ROSA': '#FFC0CB',
    'FUCSIA': '#FF00FF',
    'VERDE': '#00FF00',
    'MARINO': '#000080',
    'MULTICOLOR': 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)'
  };
  
  return colors[colorName.toUpperCase()] || '#CCCCCC';
};

export default ProductGrid;