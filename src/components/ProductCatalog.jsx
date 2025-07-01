import { useState } from 'react';

const ProductCatalog = () => {
  const products = [
    {
      id: 1,
      images: ['/images/1-cafe.webp', '/images/1-blanco.webp'], // Agrega más si tienes
      rectangles: [
        {
          code: 'AM',
          description:
            'T SHIRT #428 JESSIE COWGIRL PIXAR FULL PRINT COTTON OVERSIZED TALLA: UT PRECIO ESPECIAL POR PAQUETE',
          bgColor: '#FACB33',
          textColor: '#000000',
          logoTextColor: '#000000',
        },
        {
          code: 'AZ',
          description:
            'SHORT FALDA SOLEIL BOHEME LINEN C/GUIPUR TALLA: UT PRECIO ESPECIAL POR PAQUETE',
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
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const [currentImage, setCurrentImage] = useState(0);

  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="relative max-w-xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      {/* Imagen con flechas */}
      <div className="relative w-full h-full bg-white">
        <img
          src={product.images[currentImage]}
          alt="Producto"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onLoad={(e) => {
            e.target.classList.add('opacity-100');
            e.target.classList.remove('opacity-0');
          }}
          style={{ transition: 'opacity 0.5s ease' }}
        />

        {/* Flechas de navegación */}
        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 w-10 h-10 flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition-all duration-300 hover:shadow-xl hover:cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 w-10 h-10 flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition-all duration-300 hover:shadow-xl hover:cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Indicadores de imagen */}
      <div className="flex justify-center mt-4 space-x-2">
        {product.images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentImage(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 hover:cursor-pointer ${
              idx === currentImage ? 'bg-gray-800 scale-125' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Etiquetas con código y descripción */}
      <div className="flex flex-col items-center gap-4 p-4">
        {product.rectangles.map((rectangle, index) => (
          <div
            key={index}
            className={`flex w-full max-w-[90%] ${index % 2 !== 0 ? 'justify-end' : ''}`}
          >
            <div className={`flex ${index % 2 !== 0 ? 'flex-row-reverse' : ''} gap-4`}>
              {/* Círculo con código */}
              <div
                className="w-16 h-16 flex items-center justify-center rounded-full text-3xl font-bold shrink-0 shadow-md transition-transform duration-300 hover:scale-110"
                style={{
                  backgroundColor: rectangle.bgColor,
                  color: rectangle.logoTextColor,
                }}
              >
                {rectangle.code}
              </div>

              {/* Descripción con ancho controlado y centrado */}
              <div
                className={`leading-snug max-w-[350px] break-words p-3 rounded-lg ${
                  index % 2 !== 0 ? 'text-right bg-gray-50' : 'text-left bg-gray-50'
                }`}
                style={{
                  color: rectangle.textColor,
                }}
              >
                {rectangle.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCatalog;