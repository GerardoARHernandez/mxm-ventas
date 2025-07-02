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

  // Detectar inicio del touch
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  // Detectar final del touch y calcular la dirección del swipe
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // puedes ajustar la sensibilidad

    if (distance > minSwipeDistance) {
      // Swipe hacia la izquierda
      nextImage();
    } else if (distance < -minSwipeDistance) {
      // Swipe hacia la derecha
      prevImage();
    }

    // Reset refs
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="relative max-w-xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      {/* Imagen con flechas */}
      <div
        className="relative w-full h-full bg-white"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
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
      <div className="flex flex-col items-center gap-4 py-4 justify-end">
        {product.rectangles.map((rectangle, index) => (
          <div
            key={index}
            className={`flex w-full max-w-[95%] ${index % 2 !== 0 ? 'justify-end' : ''}`}
          >
            <div className={`flex ${index % 2 !== 0 ? 'flex-row-reverse' : ''} gap-4`}>
              <div
                className="w-16 h-16 flex items-center justify-center rounded-full text-3xl font-bold shrink-0 shadow-md transition-transform duration-300 hover:scale-110 text-shadow-md"
                style={{
                  backgroundColor: rectangle.bgColor,
                  color: rectangle.logoTextColor,
                }}
              >
                {rectangle.code}
              </div>
              <div
                className={`leading-snug break-words p-3 rounded-lg text-sm md:text-base ${
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
