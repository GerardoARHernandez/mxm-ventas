import { useState, useRef } from 'react';

export const ProductCatalog = ({ product }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

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

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextImage();
    } else if (distance < -minSwipeDistance) {
      prevImage();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="group relative max-w-4xl mx-auto">
      {/* Contenedor principal con efecto glassmorphism */}
      <div className="relative bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-xl border border-gray-700/30 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-purple-500/20 hover:border-purple-500/30">
        
        {/* Header decorativo */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
        
        <div className="flex flex-col lg:flex-row">
          {/* Sección de imagen */}
          <div className="lg:w-1/2 relative">
            <div
              className="relative aspect-[4/6.5] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={product.images[currentImage]}
                alt="Producto de moda"
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Navegación de imágenes */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition-all duration-300 group/btn"
                  >
                    <svg className="w-6 h-6 text-gray-800 group-hover/btn:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition-all duration-300 group/btn"
                  >
                    <svg className="w-6 h-6 text-gray-800 group-hover/btn:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Indicadores de imagen modernos */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        idx === currentImage 
                          ? 'bg-white w-6' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sección de información */}
          <div className="lg:w-1/2 p-4 lg:p-12 flex flex-col justify-center">
            <div className="space-y-4 lg:space-y-8">
              {product.rectangles.map((item, index) => (
                <div key={index} className="group/item">
                  {/* Badge con código */}
                  <div className="flex items-start space-x-3 mb-3">
                    <div 
                      className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center text-lg lg:text-2xl font-bold shadow-lg transform transition-all duration-300 group-hover/item:scale-105 group-hover/item:rotate-3"
                      style={{
                        backgroundColor: item.bgColor,
                        color: item.logoTextColor,
                      }}
                    >
                      {item.code}
                    </div>
                    
                    {/* Descripción estilizada */}
                    <div className="flex-1 bg-gray-800/50 backdrop-blur-sm rounded-xl lg:rounded-2xl px-4 py-1 lg:p-6 border border-gray-700/30 transition-all duration-300 hover:border-purple-500/30 hover:bg-gray-800/70">
                      <p 
                        className="text-sm lg:text-lg leading-relaxed font-medium"
                        style={{ color: '#ffffff' }}
                      >
                        {item.description.replace(/PRECIO ESPECIAL POR PAQUETE/g, '').replace(/TALLA: UT/g, '').trim()}
                      </p>
                    </div>
                  </div>                  

                  {/* Separador elegante - solo en desktop */}
                  {index < product.rectangles.length - 1 && (
                    <div className="hidden lg:flex items-center justify-center my-8">
                      <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                      <div className="w-2 h-2 bg-purple-500/50 rounded-full mx-4"></div>
                      <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                    </div>
                  )}
                </div>
              ))}

              {/* Etiquetas debajo */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="inline-block px-2 py-1 lg:px-3 lg:py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-xs font-semibold text-purple-300">
                      IMPORTACIÓN
                    </div>
                    <div className="inline-block px-2 py-1 lg:px-3 lg:py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-xs font-semibold text-purple-300">
                      PRECIO ESPECIAL POR PAQUETE
                    </div>
                  </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};