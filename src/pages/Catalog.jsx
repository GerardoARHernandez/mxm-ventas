import { useEffect, useState } from 'react';
import { ProductCatalog } from '../components/Catalogo/ProductCatalog';
import { CategoryFilter } from '../components/Catalogo/CategoryFilter';
import { BulkDownloadButton } from '../components/Catalogo/BulkDownloadButton';
import { useLocation } from 'react-router-dom';

const Catalog = () => {
  const location = useLocation().pathname === '/catalogousuario';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null); // Cambiado a null
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://systemweb.ddns.net/CarritoWeb/APICarrito/ListCatMXM_RGB');
        if (!response.ok) {
          throw new Error('Error al obtener los datos');
        }
        const data = await response.json();
        const transformedProducts = transformApiData(data.sdtCatMXM_RGB);
        setProducts(transformedProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const transformApiData = (apiData) => {
    const productsByCategory = {};
    
    apiData.forEach(item => {
      const categoryKey = `${item.NombreCat.trim()}-${item.Id}`;
      
      if (!productsByCategory[categoryKey]) {
        productsByCategory[categoryKey] = {
          id: item.Id,
          category: item.NombreCat.trim(), 
          rectangles: [],
          images: []
        };
      }
      
      for (let i = 1; i <= 2; i++) {
        const cajaKey = `Caja${i}`;
        if (item[cajaKey]) {
          const caja = item[cajaKey];
          const imageName = caja[`Imagen${i}`];
          
          const hasValidData = caja[`descrip${i}`]?.trim() !== '' || 
                              caja[`SKU${i}`]?.trim() !== '';
          
          if (imageName && imageName.trim() !== '') {
            const imageUrl = `https://systemweb.ddns.net/CarritoWeb/imgMXM/Catalogo/${imageName.trim()}`;
            if (!productsByCategory[categoryKey].images.includes(imageUrl)) {
              productsByCategory[categoryKey].images.push(imageUrl);
            }
          }
          
          if (hasValidData) {
            productsByCategory[categoryKey].rectangles.push({
              id: `${item.Id}-${i}`,
              code: caja[`LT${i}`]?.trim() || '',
              description: caja[`descrip${i}`]?.trim() || '',
              bgColor: `rgb(${caja[`R${i}`] || '0'}, ${caja[`G${i}`] || '0'}, ${caja[`B${i}`] || '0'})`,
              textColor: '#000000',
              logoTextColor: '#ffffff',
              price: caja[`precio1_${i}`],
              sku: caja[`SKU${i}`]?.trim() || '',
              stock: caja[`existencia${i}`],
              image: imageName,
              isImport: caja[`LogoImp${i}`] == 1 
            });
          }
        }
      }
    });
    
    return Object.values(productsByCategory)
      .map(product => ({
        ...product,
        images: product.images.length > 0 
          ? product.images 
          : [`https://placehold.co/400/orange/white?text=Imagen\n+No+Disponible`]
      }))
      .filter(product => product.rectangles.length > 0);
  };

  // Obtener todas las categorías únicas de los productos
  const categories = [...new Set(products.map(product => product.category))];
  
  // Filtrar productos por categoría seleccionada
  const filteredProducts = selectedCategory
    ? products.filter(product => product.category === selectedCategory)
    : [];

  const productsByCategory = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Cargando catálogo...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-x-hidden">
      {/* Efectos de fondo animados */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-pink-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Menú sticky */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-700/30 shadow-xl py-2' 
          : 'bg-transparent py-3'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            isScrolled={isScrolled}
          />
        </div>
      </div>

      {/* Contenido principal con padding para el menú fijo */}
      <div className="relative z-10 pt-20 pb-12 w-full">
        <div className="max-w-7xl mx-auto px-4 space-y-20 w-full">
          {selectedCategory ? (
          <>
          {location && (
            /* Botón de descarga masiva */
            <div className="text-left mb-10">
              <BulkDownloadButton 
                products={filteredProducts} 
                category={selectedCategory} 
              />
            </div>
          )}
            

            {/* Productos con botón de descarga individual */}
            {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
              <div key={category} className="space-y-12 w-full">
                {categoryProducts.map((product) => (
                  <ProductCatalog 
                    key={`${category}-${product.id}`} 
                    product={product} 
                  />
                ))}
              </div>
            ))}
          </>
          ) : (
            // Mensaje cuando no hay categoría seleccionada
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl mb-6 shadow-lg">
                ✨
              </div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-4">
                Descubre Nuestras Colecciones
              </h2>
              <p className="text-gray-300 text-lg max-w-md">
                Selecciona uno de nuestros catálogos en el menú superior para explorar nuestros productos exclusivos.
              </p>
              <div className="mt-8 w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            </div>
          )}
        </div>

        {selectedCategory && (
          <div className="text-center mt-20 pt-12 border-t border-gray-700/30 w-full">
            <div className="flex justify-center space-x-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                ♡
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
