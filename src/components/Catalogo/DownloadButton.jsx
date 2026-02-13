import { useState } from 'react';

// Componente para manejar la descarga de la imagen
export const DownloadButton = ({ product, currentImage }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  // Lista de proxies CORS gratuitos
  const corsProxies = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://yacdn.org/proxy/'
  ];

  const loadImageWithCORS = async (imageUrl) => {
    // Intentar con diferentes proxies
    for (const proxy of corsProxies) {
      try {
        const proxyUrl = `${proxy}${encodeURIComponent(imageUrl)}`;
        const response = await fetch(proxyUrl, {
          mode: 'cors',
          headers: {
            'Origin': window.location.origin
          }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        }
      } catch (error) {
        console.log(`Proxy ${proxy} falló:`, error);
      }
    }
    
    throw new Error('No se pudo cargar la imagen con ningún proxy');
  };

  const downloadProductImage = async () => {
    setIsDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Cargar imagen usando proxies
      let imageUrl;
      try {
        imageUrl = await loadImageWithCORS(product.images[currentImage]);
      } catch (error) {
        console.error("Todos los proxies fallaron:", error);
        await generatePlaceholderImage(canvas, ctx);
        throw new Error("Imagen no disponible para descarga");
      }

      // Cargar imagen en elemento Image
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Generar imagen con overlay
      await generateProductImage(canvas, ctx, img, product);

    } catch (error) {
      console.error('Error al generar la imagen:', error);
      if (!error.message.includes("Imagen no disponible")) {
        alert('Error al generar la imagen. Por favor, intenta de nuevo.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const generatePlaceholderImage = async (canvas, ctx) => {
    const placeholderWidth = 600;
    const placeholderHeight = 400;
    canvas.width = placeholderWidth;
    canvas.height = placeholderHeight;
    
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, placeholderWidth, placeholderHeight);
    
    ctx.fillStyle = '#4B5563';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Imagen no disponible', placeholderWidth / 2, placeholderHeight / 2);

    const link = document.createElement('a');
    link.download = `producto_${product.category}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateProductImage = async (canvas, ctx, img, product) => {
    // Obtener dimensiones
    const originalImgWidth = img.width;
    const originalImgHeight = img.height;
    
    const canvasWidth = originalImgWidth;
    const canvasHeight = originalImgHeight + 100;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Dibujar fondo
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, '#1f2937');
    gradient.addColorStop(0.5, '#374151');
    gradient.addColorStop(1, '#111827');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Dibujar imagen
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;
    ctx.drawImage(img, 0, 0, canvasWidth, originalImgHeight);
    ctx.shadowColor = 'transparent';

    // Dibujar overlay (tu código existente para dibujar rectángulos y texto)
    // ... (mantén tu código actual para dibujar los rectángulos y texto)

    // Descargar imagen
    const link = document.createElement('a');
    link.download = `producto_${product.category}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={downloadProductImage}
      disabled={isDownloading}
      className="absolute top-4 right-4 z-10 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
      title="Descargar imagen del producto"
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
  );
};