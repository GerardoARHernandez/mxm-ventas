import { useEffect, useState } from 'react';
import { ProductCatalog } from '../components/Catalogo/ProductCatalog';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const transformApiData = (apiData) => {
    // Primero agrupamos por ID de producto
    const productsById = {};
    
    apiData.forEach(item => {
      if (!productsById[item.Id]) {
        productsById[item.Id] = {
          id: item.Id,
          category: item.RGBNombreCat,
          rectangles: [],
          images: []
        };
      }
      
      // Agregamos todas las cajitas del producto
      for (let i = 1; i <= 3; i++) {
        const cajaKey = `Caja${i}`;
        if (item[cajaKey]) {
          const caja = item[cajaKey];
          const imageName = caja[`RGBImagen${i}`];
          
          productsById[item.Id].rectangles.push({
            id: `${item.Id}-${i}`,
            code: caja[`RGBLT${i}`],
            description: caja[`RGBdescrip${i}`],
            bgColor: `rgb(${caja[`RGBR${i}`] || '0'}, ${caja[`RGBG${i}`] || '0'}, ${caja[`RGBB${i}`] || '0'})`,
            textColor: '#000000',
            logoTextColor: '#ffffff',
            price: caja[`RGBprecio1_${i}`],
            sku: caja[`RGBSKU${i}`],
            stock: caja[`RGBexistencia${i}`],
            image: imageName
          });
          
          // Si hay imagen, la agregamos con la URL completa
          if (imageName && imageName.trim() !== '') {
            const imageUrl = `https://systemweb.ddns.net/CarritoWeb/imgMXM/${imageName.trim()}`;
            // Verificamos que no exista ya en el array
            if (!productsById[item.Id].images.includes(imageUrl)) {
              productsById[item.Id].images.push(imageUrl);
            }
          }
        }
      }
    });
    
    // Convertimos a array y aseguramos al menos una imagen por producto
    return Object.values(productsById).map(product => ({
      ...product,
      images: product.images.length > 0 
        ? product.images 
        : [`https://placehold.co/400/orange/white?text=Imagen\n+No+Disponible`]
    }));
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Efectos de fondo animados */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-pink-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 px-4 py-12">
        {/* Header mejorado */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full text-purple-300 text-sm font-semibold border border-purple-500/30">
              ✨ NUEVA TEMPORADA
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-100 mb-6 leading-tight">
            COLECCIÓN VERANO 2025
          </h1>
          
          {/* Decoración del título */}
          <div className="flex justify-center items-center -mt-4 space-x-4">
            <div className="w-24 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700"></div>
            <div className="w-3.5 h-3.5 bg-gradient-to-r from-pink-500 to-pink-800 rounded-full"></div>
            <div className="w-20 h-0.5 bg-gradient-to-r from-pink-500 to-orange-500"></div>
          </div>
        </div>

        {/* Productos */}
        <div className="max-w-7xl mx-auto space-y-20">
          {products.map((product) => (
            <ProductCatalog key={product.id} product={product} />
          ))}
        </div>

        {/* Footer decorativo */}
        <div className="text-center mt-20 pt-12 border-t border-gray-700/30">
          <p className="text-gray-400 text-lg mb-4">Descubre tu estilo único</p>
          <div className="flex justify-center space-x-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              ♡
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;