import { useState, useRef } from 'react';

export const ProductCatalog = ({ product }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
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

  const downloadProductImage = async () => {
    setIsDownloading(true);
    
    try {
      // Crear canvas y contexto
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Tamaño del canvas - mantener ancho pero ajustar altura según contenido
      const canvasWidth = 800;
      // Altura inicial, se ajustará dinámicamente después
      let canvasHeight = 1000;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Fondo degradado
      const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      gradient.addColorStop(0, '#1f2937');
      gradient.addColorStop(0.5, '#374151');
      gradient.addColorStop(1, '#111827');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Intentar cargar la imagen con diferentes métodos
      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      // Función para intentar múltiples métodos de carga de imagen
      const loadImageWithFallbacks = async (imageUrl) => {
        // Método 1: Intentar con proxy CORS
        try {
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;
          const response = await fetch(proxyUrl);
          if (response.ok) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
          }
        } catch (error) {
          console.log("Proxy CORS falló, intentando método alternativo");
        }
        
        // Método 2: Intentar con otro proxy
        try {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`;
          const response = await fetch(proxyUrl);
          if (response.ok) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
          }
        } catch (error) {
          console.log("Segundo proxy falló, intentando método directo");
        }
        
        // Método 3: Intentar carga directa (puede fallar por CORS)
        return new Promise((resolve, reject) => {
          img.onload = () => resolve(imageUrl);
          img.onerror = reject;
          img.src = imageUrl;
        });
      };
      
      try {
        const imageUrl = await loadImageWithFallbacks(product.images[currentImage]);
        img.src = imageUrl;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      } catch (error) {
        console.error("Todos los métodos de carga fallaron:", error);
        alert("No se pudo cargar la imagen para descarga. Se usará un marcador de posición.");
        
        // Crear una imagen de placeholder
        ctx.fillStyle = '#4B5563';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Imagen no disponible', canvasWidth / 2, canvasHeight / 2);
        
        throw new Error("Imagen no disponible para descarga");
      }
      
      // Calcular dimensiones para la imagen - AHORA MÁS GRANDE
      const imgMaxWidth = canvasWidth - 40;  // Menos margen
      const imgMaxHeight = canvasHeight * 0.7; // 70% del canvas para la imagen (aumentado de 0.5)
      
      let imgWidth = img.width;
      let imgHeight = img.height;
      
      if (imgWidth > imgMaxWidth) {
        imgHeight = (imgHeight * imgMaxWidth) / imgWidth;
        imgWidth = imgMaxWidth;
      }
      
      if (imgHeight > imgMaxHeight) {
        imgWidth = (imgWidth * imgMaxHeight) / imgHeight;
        imgHeight = imgMaxHeight;
      }
      
      // Dibujar la imagen centrada
      const imgX = (canvasWidth - imgWidth) / 2;
      const imgY = 20;  // Menos espacio superior
      
      // Sombra para la imagen
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 8;
      
      ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Calcular la altura necesaria para el contenido textual
      let textContentHeight = 0;
      
      // Altura del título y separadores
      textContentHeight += 90; // Título + línea decorativa + espacios
      
      // Calcular altura para cada producto
      product.rectangles.forEach((item) => {
        const description = item.description
          .replace(/PRECIO ESPECIAL POR PAQUETE/g, '')
          .replace(/TALLA: UT/g, '')
          .trim();
        
        // Simular el contexto para medir texto
        const tempCtx = canvas.getContext('2d');
        tempCtx.font = '20px Arial, sans-serif';
        
        const words = description.split(' ');
        const lines = [];
        let currentLine = words[0];
        const maxWidth = canvasWidth - 140;
        
        for (let i = 1; i < words.length; i++) {
          const testLine = currentLine + ' ' + words[i];
          const testWidth = tempCtx.measureText(testLine).width;
          
          if (testWidth > maxWidth && i > 1) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);
        
        // Altura del bloque de producto
        textContentHeight += 30; // Círculo del código
        textContentHeight += lines.length * 24; // Líneas de texto
        textContentHeight += 40; // Espacio para etiquetas
        textContentHeight += 30; // Espaciado entre productos
      });
      
      // Altura total del canvas (imagen + contenido + márgenes)
      const totalCanvasHeight = imgY + imgHeight + textContentHeight + 40;
      
      // Si la altura calculada es mayor que la actual, redimensionar el canvas
      if (totalCanvasHeight > canvasHeight) {
        canvas.height = totalCanvasHeight;
        // Redibujar el fondo con la nueva altura
        const newGradient = ctx.createLinearGradient(0, 0, canvasWidth, totalCanvasHeight);
        newGradient.addColorStop(0, '#1f2937');
        newGradient.addColorStop(0.5, '#374151');
        newGradient.addColorStop(1, '#111827');
        ctx.fillStyle = newGradient;
        ctx.fillRect(0, 0, canvasWidth, totalCanvasHeight);
        // Redibujar la imagen
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 8;
        ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      
      // Área de información
      const infoY = imgY + imgHeight + 30;  // Menos espacio entre imagen y texto
      let currentY = infoY;
      
      // Título de la categoría
      ctx.fillStyle = '#e5e7eb';
      ctx.font = 'bold 28px Arial, sans-serif';  // Texto un poco más pequeño
      ctx.textAlign = 'center';
      ctx.fillText(product.category, canvasWidth / 2, currentY);
      currentY += 50;
      
      // Línea decorativa
      const lineGradient = ctx.createLinearGradient(canvasWidth * 0.25, 0, canvasWidth * 0.75, 0);
      lineGradient.addColorStop(0, '#8b5cf6');
      lineGradient.addColorStop(0.5, '#ec4899');
      lineGradient.addColorStop(1, '#f59e0b');
      ctx.fillStyle = lineGradient;
      ctx.fillRect(canvasWidth * 0.25, currentY, canvasWidth * 0.5, 2);  // Línea más delgada
      currentY += 25;
      
      // Información de productos
      product.rectangles.forEach((item, index) => {
        // Código del producto en círculo
        const codeSize = 35;
        const codeX = 50;
        const codeY = currentY + 15;
        
        // Convertir RGB string a valores
        const rgbMatch = item.bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          ctx.fillStyle = item.bgColor;
        } else {
          ctx.fillStyle = '#8b5cf6';
        }
        
        ctx.beginPath();
        ctx.arc(codeX, codeY, codeSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Texto del código
        ctx.fillStyle = item.logoTextColor || '#ffffff';
        ctx.font = 'bold 16px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.code.trim(), codeX, codeY + 5);
        
        // Descripción del producto
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial, sans-serif';  // Texto más pequeño
        ctx.textAlign = 'left';
        
        const description = item.description
          .replace(/PRECIO ESPECIAL POR PAQUETE/g, '')
          .replace(/TALLA: UT/g, '')
          .trim();
        
        // Dividir texto en líneas
        const words = description.split(' ');
        const lines = [];
        let currentLine = words[0];
        const maxWidth = canvasWidth - 120;
        
        for (let i = 1; i < words.length; i++) {
          const testLine = currentLine + ' ' + words[i];
          const testWidth = ctx.measureText(testLine).width;
          
          if (testWidth > maxWidth && i > 1) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);
        
        // Dibujar las líneas de descripción
        let lineY = currentY;
        lines.forEach(line => {
          ctx.fillText(line, codeX + codeSize + 15, lineY + 5);
          lineY += 22;  // Menos espacio entre líneas
        });
        
        currentY = lineY + 12;
        
        // Etiquetas
        let tagX = codeX + codeSize + 15;
        let tagY = currentY;
        
        const tags = [];
        if (item.isImport) {
          tags.push('IMPORTACIÓN');
        }
        tags.push('PRECIO ESPECIAL POR PAQUETE');
        
        tags.forEach((tag, tagIndex) => {
          // Fondo de la etiqueta
          ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
          const tagWidth = ctx.measureText(tag).width + 14;
          const tagHeight = 20;
          
          ctx.fillRect(tagX, tagY - 14, tagWidth, tagHeight);
          
          // Texto de la etiqueta
          ctx.fillStyle = '#c4b5fd';
          ctx.font = 'bold 11px Arial, sans-serif';
          ctx.fillText(tag, tagX + 7, tagY - 3);
          
          tagX += tagWidth + 8;
          if (tagX + 120 > canvasWidth) {
            tagX = codeX + codeSize + 15;
            tagY += 25;
          }
        });
        
        currentY = tagY + 30;
        
        // Añadir separador entre productos si no es el último
        if (index < product.rectangles.length - 1) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(canvasWidth * 0.1, currentY, canvasWidth * 0.8, 1);
          currentY += 15;
        }
      });
      
      // Crear y descargar la imagen
      const link = document.createElement('a');
      link.download = `producto_${product.category}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error al generar la imagen:', error);
      if (!error.message.includes("Imagen no disponible")) {
        alert('Error al generar la imagen. Por favor, intenta de nuevo.');
      }
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <div className="group relative max-w-4xl mx-auto w-full overflow-x-hidden">
      {/* Contenedor principal con efecto glassmorphism */}
      <div className="relative bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-xl border border-gray-700/30 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-purple-500/20 hover:border-purple-500/30">
        
        {/* Header decorativo */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
        
        {/* Botón de descarga */}
        <button
          onClick={downloadProductImage}
          disabled={isDownloading}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </button>
        
        <div className="flex flex-col lg:flex-row">
          {/* Sección de imagen */}
          <div className="lg:w-1/2 relative w-full">
            <div
              className="relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden w-full"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={product.images[currentImage]}
                alt="Producto de moda"
                className="w-full h-auto max-w-full object-cover transition-all duration-700 group-hover:scale-105"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Navegación de imágenes */}
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
          <div className="lg:w-1/2 p-4 lg:p-12 flex flex-col justify-center w-full">
            <div className="space-y-4 lg:space-y-8 w-full">
              {product.rectangles.map((item, index) => (
                <div key={index} className="group/item w-full">
                  {/* Badge con código */}
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
                    
                    {/* Descripción estilizada */}
                    <div className="flex-1 bg-gray-800/50 backdrop-blur-sm rounded-xl lg:rounded-2xl px-4 py-1 lg:p-6 border border-gray-700/30 transition-all duration-300 hover:border-purple-500/30 hover:bg-gray-800/70 min-w-0">
                      <p 
                        className="text-sm lg:text-lg leading-relaxed font-medium break-words"
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

                  {/* Etiquetas debajo */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.isImport && (
                      <div className="inline-block px-2 py-1 lg:px-3 lg:py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-xs font-semibold text-purple-300">
                        IMPORTACIÓN
                      </div>
                    )}
                    <div className="inline-block px-2 py-1 lg:px-3 lg:py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full text-xs font-semibold text-purple-300">
                      PRECIO ESPECIAL POR PAQUETE
                    </div>
                  </div>
                </div>
              ))}              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};