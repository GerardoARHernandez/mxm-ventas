import { useState, useRef } from 'react';
import { DownloadButton } from "./DownloadButton";
import { useLocation, useNavigate } from 'react-router-dom';

export const ProductCatalog = ({ product }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isUsuarioRoute = location.pathname === '/catalogousuario';
  
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

  // Función para navegar a los detalles del modelo específico usando el SKU
  const handleViewDetails = (rectangle) => {
    // Usar el SKU del rectangle para buscar las variaciones
    const modelSku = rectangle.sku;
    console.log('Navegando a modelo con SKU:', modelSku, 'desde rectangle:', rectangle);
    
    if (!modelSku || modelSku.trim() === '') {
      console.error('No hay SKU disponible para este modelo');
      alert('No se puede ver detalles: SKU no disponible');
      return;
    }
    
    navigate(`/modelo/${modelSku}`);
  };

  // Función para obtener todos los SKUs disponibles
  const getAvailableSKUs = () => {
    return product.rectangles
      .filter(rectangle => rectangle.sku?.trim() !== '')
      .map(rectangle => rectangle.sku.trim());
  };

  // Función para renderizar los badges de SKU
  const renderSKUBadges = () => {
    const availableSKUs = getAvailableSKUs();
    
    if (availableSKUs.length === 0) return null;

    if (availableSKUs.length === 1) {
      return (
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium border border-white/20">
          SKU: {availableSKUs[0]}
        </div>
      );
    } else {
      return (
        <>
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium border border-white/20">
            SKU: {availableSKUs[0]}
          </div>
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium border border-white/20">
            SKU: {availableSKUs[1]}
          </div>
        </>
      );
    }
  };
  
  return (
    <div className="group relative max-w-4xl mx-auto w-full overflow-x-hidden">
      <div className="relative bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-xl border border-gray-700/30 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-purple-500/20 hover:border-purple-500/30">
        
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
        
        {isUsuarioRoute && (
          <DownloadButton product={product} currentImage={currentImage} />
        )}
        
        <div className="flex flex-col lg:flex-row">
          {/* Sección de imagen */}
          <div className="lg:w-1/2 relative w-full">
            <div
              className="relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden w-full"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                id={`product-image-${currentImage}`}
                src={product.images[currentImage]}
                alt="Producto de moda"
                className="w-full h-auto max-w-full object-cover transition-all duration-700 group-hover:scale-105"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {renderSKUBadges()}

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition-all duration-300 group/btn"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-800 group-hover/btn:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition-all duration-300 group/btn"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-800 group-hover/btn:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

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
          <div className="lg:w-1/2 p-4 lg:p-12 flex flex-col justify-center w-full">
            <div className="space-y-4 lg:space-y-8 w-full">
              {product.rectangles.map((item, index) => (
                <div key={index} className="group/item w-full">
                  {/* Contenedor principal del modelo */}
                  <div className="relative">
                    {/* Badge con código y descripción */}                  
                    <div className="flex items-start space-x-3 mb-3 w-full">
                      <div 
                        className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center text-lg lg:text-2xl font-bold shadow-lg transform transition-all duration-300 group-hover/item:scale-105 group-hover/item:rotate-3 flex-shrink-0"
                        style={{
                          backgroundColor: item.bgColor,
                          color: item.logoTextColor,
                        }}
                      >
                        {item.code.trim()}
                      </div>
                      
                      <div className="flex-1 bg-gray-800/50 backdrop-blur-sm rounded-xl lg:rounded-2xl px-4 py-1 lg:p-6 border border-gray-700/30 transition-all duration-300 hover:border-purple-500/30 hover:bg-gray-800/70 min-w-0">
                        <p 
                          className="text-sm lg:text-lg leading-relaxed font-medium break-words"
                          style={{ color: '#ffffff' }}
                        >
                          {item.description.replace(/PRECIO ESPECIAL POR PAQUETE/g, '').replace(/TALLA: UT/g, '').trim()}
                        </p>
                        
                        {/* Mostrar el SKU debajo de la descripción */}
                        {item.sku && item.sku.trim() !== '' && (
                          <div className="mt-2 text-xs text-gray-400">
                            SKU: {item.sku}
                          </div>
                        )}
                      </div>                    
                    </div>

                    {/* Botón de Ver Detalles para CADA modelo individual */}
                    {isUsuarioRoute && item.sku && item.sku.trim() !== '' && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Ver Detalles</span>
                        </button>
                      </div>
                    )}

                    {/* Mensaje si no hay SKU disponible */}
                    {isUsuarioRoute && (!item.sku || item.sku.trim() === '') && (
                      <div className="mt-3 flex justify-end">
                        <span className="text-xs text-gray-400 italic">
                          SKU no disponible para ver detalles
                        </span>
                      </div>
                    )}
                  </div>                                 

                  {/* Separador elegante - solo en desktop */}
                  {index < product.rectangles.length - 1 && (
                    <div className="hidden lg:flex items-center justify-center my-8">
                      <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                      <div className="w-2 h-2 bg-purple-500/50 rounded-full mx-4"></div>
                      <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                    </div>
                  )}

                  {/* Etiquetas debajo */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.isImport && (
                      <div className="inline-block px-2 py-1 lg:px-3 lg:py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-xs font-semibold text-purple-300">
                        EN IMPORTACIÓN NO HAY CAMBIOS
                      </div>
                    )}
                    <div className="inline-block px-2 py-1 lg:px-3 lg:py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-xs font-semibold text-purple-300">
                      PRECIO ESPECIAL POR PAQUETE
                    </div>
                  </div>
                  {item.isLastPieces && (
                    <div className="bg-red-500 text-white mt-2 px-2 py-1 rounded text-lg text-center font-bold animate-pulse">
                      ¡Ultimas Piezas!
                    </div>
                  )}  
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};