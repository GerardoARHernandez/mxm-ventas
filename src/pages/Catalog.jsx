import { ProductCatalog } from '../components/Catalogo/ProductCatalog';

const Catalog = () => {
  const products = [
    {
      id: 1,
      images: ['/images/1-cafe.webp', '/images/1-blanco.webp'],
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
          description:
            'T SHIRT NEGRA BOOT COQUETTE OVERSIZED TALLA: UT PRECIO ESPECIAL POR PAQUETE',
          bgColor: '#F99DB6',
          textColor: '#000000',
          logoTextColor: '#ffffff',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-blue-100 px-4 py-12">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-3 md:mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 animate-text">
            COLECCIÓN EXCLUSIVA
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Diseños únicos que inspiran y marcan tendencia esta temporada
        </p>
        <div className="mt-4 flex justify-center items-center">
          <span className="inline-block w-12 sm:w-16 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></span>
          <span className="inline-block w-3 h-3 mx-2 bg-pink-500 rounded-full transform rotate-45"></span>
          <span className="inline-block w-8 sm:w-12 h-1 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"></span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-20">
        {products.map((product) => (
          <ProductCatalog key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};


export default Catalog;