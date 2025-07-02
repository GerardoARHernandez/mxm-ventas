import { ProductCatalog } from '../components/Catalogo/ProductCatalog';

const Catalog = () => {
  const products = [
    {
      id: 1,
      images: ['/images/1-cafe.webp', '/images/1-blanco.webp', '/images/1-rojo.webp'],
      rectangles: [
        {
          code: 'AM',
          description: 'T SHIRT #428 JESSIE COWGIRL PIXAR FULL PRINT COTTON OVERSIZED TALLA: UT PRECIO ESPECIAL POR PAQUETE',
          bgColor: '#FACB33',
          textColor: '#000000',
          logoTextColor: '#ffffff',
        },
        {
          code: 'AZ',
          description: 'SHORT FALDA SOLEIL BOHEME LINEN C/GUIPUR TALLA: UT PRECIO ESPECIAL POR PAQUETE',
          bgColor: '#3D4ED4',
          logoTextColor: '#ffffff',
          textColor: '#000000',
        },
      ],
    },
    {
      id: 2,
      images: ['/images/2-azul.webp'],
      rectangles: [
        {
          code: 'RP',
          description: 'T SHIRT NEGRA BOOT COQUETTE OVERSIZED TALLA: UT PRECIO ESPECIAL POR PAQUETE',
          bgColor: '#F99DB6',
          textColor: '#000000',
          logoTextColor: '#ffffff',
        },
      ],
    },
  ];

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
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200 mb-6 leading-tight">
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