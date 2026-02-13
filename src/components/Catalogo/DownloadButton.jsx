import { useState } from 'react';

export const DownloadButton = ({ product, currentImage }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadProductImage = async () => {
    setIsDownloading(true);

    try {
      const proxies = [
        (url) => `https://images.weserv.nl/?url=${encodeURIComponent(url)}`,
        (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
        (url) => url // Último intento: URL directa
      ];

      let img = null;
      let successfulProxy = null;

      for (const proxyFn of proxies) {
        try {
          const proxyUrl = proxyFn(product.images[currentImage]);
          console.log('Intentando con:', proxyUrl);

          img = new Image();
          img.crossOrigin = "anonymous";

          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Timeout')), 10000);
            img.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
            img.onerror = () => {
              clearTimeout(timeout);
              reject(new Error('Error de carga'));
            };
            img.src = proxyUrl;
          });

          successfulProxy = proxyUrl;
          console.log('✓ Proxy exitoso:', successfulProxy);
          break;
        } catch (error) {
          console.warn('✗ Proxy falló:', error.message);
          continue;
        }
      }

      if (!successfulProxy) {
        alert('No se pudo cargar la imagen desde ningún servidor. Intenta más tarde.');
        return;
      }

      // Ahora sí, crear el canvas con la imagen cargada
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      const canvasWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;
      
      console.log('Dimensiones de la imagen:', canvasWidth, 'x', imgHeight);

      if (canvasWidth === 0 || imgHeight === 0) {
        throw new Error('La imagen tiene dimensiones inválidas');
      }

      // Definir padding
      const rightPadding = 60;

      // Calcular altura del texto
      let textContentHeight = 40;

      product.rectangles.forEach((item) => {
        const description = item.description
          .replace(/PRECIO ESPECIAL POR PAQUETE/g, '')
          .replace(/TALLA: UT/g, '')
          .trim();

        ctx.font = '30px Arial, sans-serif';
        const words = description.split(' ');
        const lines = [];
        let currentLine = words[0] || '';
        const maxWidth = canvasWidth - 60 - rightPadding;

        for (let i = 1; i < words.length; i++) {
          const testLine = currentLine + ' ' + words[i];
          const testWidth = ctx.measureText(testLine).width;

          if (testWidth > maxWidth) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);

        textContentHeight += 60 + (lines.length * 30) + 50 + 40;
      });

      // Configurar canvas final
      const totalCanvasHeight = imgHeight + textContentHeight + 40;
      canvas.width = canvasWidth;
      canvas.height = totalCanvasHeight;

      console.log('Dimensiones del canvas final:', canvasWidth, 'x', totalCanvasHeight);

      // Fondo degradado
      const gradient = ctx.createLinearGradient(0, 0, canvasWidth, totalCanvasHeight);
      gradient.addColorStop(0, '#1f2937');
      gradient.addColorStop(0.5, '#374151');
      gradient.addColorStop(1, '#111827');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, totalCanvasHeight);

      // Dibujar imagen
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 8;
      ctx.drawImage(img, 0, 0, canvasWidth, imgHeight);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      console.log('Imagen dibujada en el canvas');

      // Área de información
      let currentY = imgHeight + 20;

      // Línea decorativa
      const lineGradient = ctx.createLinearGradient(60, 0, canvasWidth - rightPadding, 0);
      lineGradient.addColorStop(0, '#8b5cf6');
      lineGradient.addColorStop(0.5, '#ec4899');
      lineGradient.addColorStop(1, '#f59e0b');
      ctx.fillStyle = lineGradient;
      ctx.fillRect(60, currentY, canvasWidth - 60 - rightPadding, 2);
      currentY += 30;

      // Información de productos
      product.rectangles.forEach((item, index) => {
        const codeWidth = 60;
        const codeHeight = 60;
        const codeX = 60;
        const codeY = currentY + 20;

        // Color
        const rgbMatch = item.bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          ctx.fillStyle = item.bgColor;
        } else {
          ctx.fillStyle = '#8b5cf6';
        }

        // Rectángulo redondeado
        const borderRadius = 16;
        ctx.beginPath();
        ctx.moveTo(codeX + borderRadius, codeY);
        ctx.lineTo(codeX + codeWidth - borderRadius, codeY);
        ctx.quadraticCurveTo(codeX + codeWidth, codeY, codeX + codeWidth, codeY + borderRadius);
        ctx.lineTo(codeX + codeWidth, codeY + codeHeight - borderRadius);
        ctx.quadraticCurveTo(codeX + codeWidth, codeY + codeHeight, codeX + codeWidth - borderRadius, codeY + codeHeight);
        ctx.lineTo(codeX + borderRadius, codeY + codeHeight);
        ctx.quadraticCurveTo(codeX, codeY + codeHeight, codeX, codeY + codeHeight - borderRadius);
        ctx.lineTo(codeX, codeY + borderRadius);
        ctx.quadraticCurveTo(codeX, codeY, codeX + borderRadius, codeY);
        ctx.closePath();
        ctx.fill();

        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Código
        ctx.fillStyle = item.logoTextColor || '#ffffff';
        ctx.font = 'bold 28px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.code.trim(), codeX + codeWidth / 2, codeY + codeHeight / 2);
        ctx.textBaseline = 'alphabetic';

        // Descripción
        ctx.fillStyle = '#ffffff';
        ctx.font = '35px Arial, sans-serif';
        ctx.textAlign = 'left';

        const description = item.description
          .replace(/PRECIO ESPECIAL POR PAQUETE/g, '')
          .replace(/TALLA: UT/g, '')
          .trim();

        const words = description.split(' ');
        const lines = [];
        let currentLine = words[0] || '';
        const maxWidth = canvasWidth - codeX - codeWidth - 20 - rightPadding;

        for (let i = 1; i < words.length; i++) {
          const testLine = currentLine + ' ' + words[i];
          const testWidth = ctx.measureText(testLine).width;

          if (testWidth > maxWidth) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);

        let lineY = currentY + 15;
        lines.forEach(line => {
          ctx.fillText(line, codeX + codeWidth + 20, lineY + 5);
          lineY += 40;
        });

        currentY = lineY + 25;

        // Etiquetas
        let tagX = codeX + codeWidth + 20;
        let tagY = currentY;
        const maxTagX = canvasWidth - rightPadding - 20;

        const tags = [];
        if (item.isImport) {
          tags.push('EN IMPORTACIÓN NO HAY CAMBIOS');
        }
        tags.push('PRECIO ESPECIAL POR PAQUETE');

        tags.forEach((tag) => {
          ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
          ctx.font = 'bold 16px Arial, sans-serif';
          const tagWidth = ctx.measureText(tag).width + 20;
          const tagHeight = 32;

          if (tagX + tagWidth > maxTagX) {
            tagX = codeX + codeWidth + 20;
            tagY += 40;
          }

          ctx.beginPath();
          ctx.roundRect(tagX, tagY - 18, tagWidth, tagHeight, 8);
          ctx.fill();

          ctx.fillStyle = '#c4b5fd';
          ctx.textBaseline = 'middle';
          ctx.fillText(tag, tagX + 10, tagY);
          ctx.textBaseline = 'alphabetic';

          tagX += tagWidth + 15;
        });

        currentY = tagY + 50;

        if (index < product.rectangles.length - 1) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(60, currentY, canvasWidth - 60 - rightPadding, 1);
          currentY += 30;
        }
      });

      // Descargar
      const link = document.createElement('a');
      link.download = `producto_${product.category}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✓ Descarga completada');

    } catch (error) {
      console.error('Error completo:', error);
      alert(`Error al generar la imagen: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
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