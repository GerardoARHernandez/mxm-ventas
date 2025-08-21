import { useState } from 'react';

// Componente para manejar la descarga de la imagen
export const DownloadButton = ({ product, currentImage }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadProductImage = async () => {
    setIsDownloading(true);

    try {
      // Crear canvas y contexto
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

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

        // Descargar la imagen de placeholder
        const link = document.createElement('a');
        link.download = `producto_${product.category}_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        throw new Error("Imagen no disponible para descarga");
      }

      // Obtener dimensiones originales de la imagen
      const originalImgWidth = img.width;
      const originalImgHeight = img.height;
      
      // Establecer el ancho del canvas igual al ancho de la imagen
      const canvasWidth = originalImgWidth;
      
      // Calcular la altura proporcional de la imagen para el canvas
      const imgHeight = originalImgHeight;
      
      // Altura inicial del canvas (imagen + espacio estimado para texto)
      let canvasHeight = imgHeight + 100; // Espacio adicional para texto
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Fondo degradado
      const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      gradient.addColorStop(0, '#1f2937');
      gradient.addColorStop(0.5, '#374151');
      gradient.addColorStop(1, '#111827');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Dibujar la imagen a su tamaño original
      const imgX = 0;
      const imgY = 0;

      // Sombra para la imagen
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 8;

      ctx.drawImage(img, imgX, imgY, canvasWidth, imgHeight);

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Calcular la altura necesaria para el contenido textual
      let textContentHeight = 0;

      // Altura del título y separadores
      textContentHeight += 40; // Título + línea decorativa + espacios

      // Calcular altura para cada producto
      product.rectangles.forEach((item) => {
        const description = item.description
          .replace(/PRECIO ESPECIAL POR PAQUETE/g, '')
          .replace(/TALLA: UT/g, '')
          .trim();

        // Simular el contexto para medir texto
        const tempCtx = canvas.getContext('2d');
        tempCtx.font = '30px Arial, sans-serif';

        const words = description.split(' ');
        const lines = [];
        let currentLine = words[0];
        const maxWidth = canvasWidth - 80; // Margen reducido

        for (let i = 1; i < words.length; i++) {
          const testLine = currentLine + ' ' + words[i];
          const testWidth = tempCtx.measureText(testLine).width;

          if (testWidth > maxWidth) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);

        // Altura del bloque de producto
        textContentHeight += 40; // Círculo del código (aumentado)
        textContentHeight += lines.length * 30; // Líneas de texto (más espacio)
        textContentHeight += 50; // Espacio para etiquetas (aumentado)
        textContentHeight += 40; // Espaciado entre productos (aumentado)
      });

      // Altura total del canvas (imagen + contenido + márgenes)
      const totalCanvasHeight = imgHeight + textContentHeight + 40;

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
        ctx.drawImage(img, imgX, imgY, canvasWidth, imgHeight);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      // Área de información
      const infoY = imgHeight + 20;
      let currentY = infoY;

      // Línea decorativa
      const lineGradient = ctx.createLinearGradient(canvasWidth * 0.1, 0, canvasWidth * 0.9, 0);
      lineGradient.addColorStop(0, '#8b5cf6');
      lineGradient.addColorStop(0.5, '#ec4899');
      lineGradient.addColorStop(1, '#f59e0b');
      ctx.fillStyle = lineGradient;
      ctx.fillRect(canvasWidth * 0.1, currentY, canvasWidth * 0.8, 2);
      currentY += 30;

      // Información de productos
      product.rectangles.forEach((item, index) => {
        // Código del producto en círculo
        const codeSize = 40;
        const codeX = 45;
        const codeY = currentY + 20;

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
        ctx.font = 'bold 26px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.code.trim(), codeX, codeY + 5);

        // Descripción del producto
        ctx.fillStyle = '#ffffff';
        ctx.font = '35px Arial, sans-serif';
        ctx.textAlign = 'left';

        const description = item.description
          .replace(/PRECIO ESPECIAL POR PAQUETE/g, '')
          .replace(/TALLA: UT/g, '')
          .trim();

        // Dividir texto en líneas
        const words = description.split(' ');
        const lines = [];
        let currentLine = words[0];
        const maxWidth = canvasWidth - 80; // Margen reducido

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

        // Dibujar las líneas de descripción con más interlineado
        let lineY = currentY + 10; // Añadido espacio adicional
        lines.forEach(line => {
          ctx.fillText(line, codeX + codeSize + 15, lineY + 5);
          lineY += 40; // Aumentado el interlineado de 24 a 40
        });

        currentY = lineY + 20; // Aumentado espacio después del texto

        // Etiquetas - recuadros más grandes
        let tagX = codeX + codeSize + 15;
        let tagY = currentY;

        const tags = [];
        if (item.isImport) {
          tags.push('IMPORTACIÓN');
        }
        tags.push('PRECIO ESPECIAL POR PAQUETE');

        tags.forEach((tag, tagIndex) => {
          // Fondo de la etiqueta - recuadro más grande
          ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
          const tagWidth = ctx.measureText(tag).width + 20; // Aumentado de 14 a 20
          const tagHeight = 28; // Aumentado de 20 a 28

          // Dibujar recuadro redondeado
          ctx.beginPath();
          ctx.roundRect(tagX, tagY - 16, tagWidth, tagHeight, 6);
          ctx.fill();

          // Texto de la etiqueta - centrado verticalmente
          ctx.fillStyle = '#c4b5fd';
          ctx.font = 'bold 16px Arial, sans-serif'; // Aumentado de 14 a 16
          ctx.fillText(tag, tagX + 10, tagY); // Ajustada posición vertical

          tagX += tagWidth + 12; // Aumentado espacio entre etiquetas
          if (tagX + 120 > canvasWidth) {
            tagX = codeX + codeSize + 15;
            tagY += 35; // Aumentado espacio entre líneas de etiquetas
          }
        });

        currentY = tagY + 45; // Aumentado espacio después de las etiquetas

        // Añadir separador entre productos si no es el último
        if (index < product.rectangles.length - 1) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(canvasWidth * 0.1, currentY, canvasWidth * 0.8, 1);
          currentY += 25; // Aumentado espacio después del separador
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