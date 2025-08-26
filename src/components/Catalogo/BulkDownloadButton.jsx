import { useState, useRef } from 'react';

// Función para detectar Safari en iOS
const isSafariOnIOS = () => {
  return /iP(ad|od|hone)/i.test(navigator.userAgent) && 
         /WebKit/i.test(navigator.userAgent) && 
         !/(CriOS|FxiOS|OPiOS|Mercury|EdgiOS)/i.test(navigator.userAgent);
};

// Componente para descarga masiva de imágenes CON información
export const BulkDownloadButton = ({ products, category }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showCancel, setShowCancel] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState('');
    const [safariDownloadIndex, setSafariDownloadIndex] = useState(0);
    const [showSafariConfirm, setShowSafariConfirm] = useState(false);
  
    // Referencia para controlar la cancelación
    const isCancelled = useRef(false);
    const downloadPromise = useRef(null);
    const isSafari = useRef(isSafariOnIOS());
    const currentProductIndex = useRef(0);
    const currentImageIndex = useRef(0);
    const downloadQueue = useRef([]);

    const showStatusMessage = (text, duration = 3000) => {
        setMessage(text);
        setShowMessage(true);
        setTimeout(() => {
            setShowMessage(false);
            setMessage('');
        }, duration);
    };

    const downloadImageWithInfo = async (product, imageUrl, imageIndex) => {
        if (isCancelled.current) return false;
    
        return new Promise(async (resolve) => {
        try {
        // Crear canvas y contexto
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Cargar la imagen
        const img = new Image();
        img.crossOrigin = "Anonymous";

        // Función para intentar múltiples métodos de carga de imagen
        const loadImageWithFallbacks = async (url) => {
          try {
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            if (response.ok) {
              const blob = await response.blob();
              return URL.createObjectURL(blob);
            }
          } catch (error) {
            console.log("Proxy CORS falló, intentando método directo");
          }

          return new Promise((resolve, reject) => {
            img.onload = () => resolve(url);
            img.onerror = reject;
            img.src = url;
          });
        };

        try {
          const loadedImageUrl = await loadImageWithFallbacks(imageUrl);
          img.src = loadedImageUrl;

          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        } catch (error) {
          console.error("Error cargando imagen:", error);
          // Crear imagen de placeholder
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
          
          resolve(false);
          return;
        }

        // Obtener dimensiones originales de la imagen
        const originalImgWidth = img.width;
        const originalImgHeight = img.height;
        
        // Establecer el ancho del canvas igual al ancho de la imagen
        const canvasWidth = originalImgWidth;
        
        // Calcular la altura proporcional de la imagen para el canvas
        const imgHeight = originalImgHeight;
        
        // Altura inicial del canvas (imagen + espacio estimado para texto)
        let canvasHeight = imgHeight + 100;
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

        // Definir padding derecho para todo el texto
        const rightPadding = 60;

        // Calcular la altura necesaria para el contenido textual
        let textContentHeight = 0;
        textContentHeight += 40;

        // Calcular altura para cada producto
        product.rectangles.forEach((item) => {
          const description = item.description
            .replace(/PRECIO ESPECIAL POR PAQUETE/g, '')
            .replace(/TALLA: UT/g, '')
            .trim();

          const tempCtx = canvas.getContext('2d');
          tempCtx.font = '30px Arial, sans-serif';

          const words = description.split(' ');
          const lines = [];
          let currentLine = words[0];
          const maxWidth = canvasWidth - 60 - rightPadding;

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

          textContentHeight += 60;
          textContentHeight += lines.length * 30;
          textContentHeight += 50;
          textContentHeight += 40;
        });

        // Altura total del canvas (imagen + contenido + márgenes)
        const totalCanvasHeight = imgHeight + textContentHeight + 40;

        // Si la altura calculada es mayor que la actual, redimensionar el canvas
        if (totalCanvasHeight > canvasHeight) {
          canvas.height = totalCanvasHeight;
          const newGradient = ctx.createLinearGradient(0, 0, canvasWidth, totalCanvasHeight);
          newGradient.addColorStop(0, '#1f2937');
          newGradient.addColorStop(0.5, '#374151');
          newGradient.addColorStop(1, '#111827');
          ctx.fillStyle = newGradient;
          ctx.fillRect(0, 0, canvasWidth, totalCanvasHeight);
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

        // Línea decorativa con márgenes
        const lineGradient = ctx.createLinearGradient(60, 0, canvasWidth - rightPadding, 0);
        lineGradient.addColorStop(0, '#8b5cf6');
        lineGradient.addColorStop(0.5, '#ec4899');
        lineGradient.addColorStop(1, '#f59e0b');
        ctx.fillStyle = lineGradient;
        ctx.fillRect(60, currentY, canvasWidth - 60 - rightPadding, 2);
        currentY += 30;

        // Información de productos
        product.rectangles.forEach((item, index) => {
          // Código del producto en rectángulo redondeado
          const codeWidth = 60;
          const codeHeight = 60;
          const codeX = 60;
          const codeY = currentY + 20;

          // Convertir RGB string a valores
          const rgbMatch = item.bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (rgbMatch) {
            ctx.fillStyle = item.bgColor;
          } else {
            ctx.fillStyle = '#8b5cf6';
          }

          // Dibujar rectángulo redondeado
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

          // Añadir sombra al rectángulo
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;
          ctx.fill();
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // Texto del código
          ctx.fillStyle = item.logoTextColor || '#ffffff';
          ctx.font = 'bold 28px Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.code.trim(), codeX + codeWidth / 2, codeY + codeHeight / 2);
          ctx.textBaseline = 'alphabetic';

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

          // Dibujar las líneas de descripción
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
            tags.push('IMPORTACIÓN');
          }
          tags.push('PRECIO ESPECIAL POR PAQUETE');

          tags.forEach((tag) => {
            ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
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
            ctx.font = 'bold 16px Arial, sans-serif';
            ctx.textBaseline = 'middle';
            ctx.fillText(tag, tagX + 10, tagY);
            ctx.textBaseline = 'alphabetic';

            tagX += tagWidth + 15;
          });

          currentY = tagY + 50;

          // Separador entre productos
          if (index < product.rectangles.length - 1) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(60, currentY, canvasWidth - 60 - rightPadding, 1);
            currentY += 30;
          }
        });

        // Crear y descargar la imagen
        const link = document.createElement('a');
        link.download = `producto_${product.category}_${product.id}_${imageIndex + 1}_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        resolve(true);
        
      } catch (error) {
        console.error('Error al generar la imagen:', error);
        resolve(false);
      }
    });
  };

  const downloadAllImagesWithInfo = async () => {
    if (!products || products.length === 0) return;
    
    setIsDownloading(true);
    setProgress(0);

    try {
        const totalImages = products.reduce((total, product) => total + product.images.length, 0);
        let downloadedCount = 0;
        let successfulDownloads = 0;

        // Para cada producto en la categoría
        for (const product of products) {
            // Para cada imagen del producto
            for (let i = 0; i < product.images.length; i++) {
                const success = await downloadImageWithInfo(product, product.images[i], i);
                if (success) {
                    successfulDownloads++;
                }
          
            downloadedCount++;
            setProgress(Math.round((downloadedCount / totalImages) * 100));
          
            // Pequeña pausa para evitar sobrecargar el navegador
            await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        setShowMessage(true);

        setTimeout(() => {
            setShowMessage(false);
        }, 3000); // Ocultar mensaje después de 3 segundos
      
    } catch (error) {
      console.error('Error en descarga masiva:', error);
      alert('Error al descargar las imágenes. Por favor, intenta de nuevo.');
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };
  
  // Función para generar y descargar ZIP en Safari
    const downloadAsZip = async () => {
        if (!products || products.length === 0) return;
        
        setIsDownloading(true);
        setProgress(0);
        isCancelled.current = false;

        try {
            const zip = new JSZip();
            const totalImages = products.reduce((total, product) => total + product.images.length, 0);
            let processedCount = 0;

            showStatusMessage("Preparando archivo ZIP...", 3000);

            // Para cada producto
            for (const product of products) {
                if (isCancelled.current) break;
                
                // Para cada imagen del producto
                for (let i = 0; i < product.images.length; i++) {
                    if (isCancelled.current) break;
                    
                    try {
                        // Crear canvas y generar imagen
                        const canvas = document.createElement('canvas');
                        const dataUrl = await generateImageForZip(product, product.images[i], i, canvas);
                        
                        if (dataUrl) {
                            // Convertir data URL a blob
                            const response = await fetch(dataUrl);
                            const blob = await response.blob();
                            
                            // Añadir al ZIP
                            const fileName = `producto_${product.category}_${product.id}_${i + 1}_${Date.now()}.png`;
                            zip.file(fileName, blob);
                        }
                        
                        processedCount++;
                        setProgress(Math.round((processedCount / totalImages) * 100));
                        
                        // Pequeña pausa para no sobrecargar el navegador
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } catch (error) {
                        console.error('Error procesando imagen para ZIP:', error);
                    }
                }
            }

            if (isCancelled.current) {
                showStatusMessage("Descarga cancelada", 3000);
                return;
            }

            // Generar el ZIP
            showStatusMessage("Comprimiendo imágenes...", 3000);
            const zipBlob = await zip.generateAsync({type: 'blob'}, (metadata) => {
                setProgress(Math.round(metadata.percent));
            });

            // Descargar el ZIP
            saveAs(zipBlob, `productos_${category}_${Date.now()}.zip`);
            showStatusMessage("¡ZIP descargado correctamente!", 4000);
            
        } catch (error) {
            console.error('Error generando ZIP:', error);
            showStatusMessage('Error al generar el ZIP', 3000);
        } finally {
            setIsDownloading(false);
            setProgress(0);
        }
    };

    const generateImageForZip = async (product, imageUrl, imageIndex, canvas) => {
    return new Promise(async (resolve) => {
        try {
            const ctx = canvas.getContext('2d');

            // Cargar la imagen
            const img = new Image();
            img.crossOrigin = "Anonymous";

            // Función para intentar múltiples métodos de carga de imagen
            const loadImageWithFallbacks = async (url) => {
                try {
                    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                    const response = await fetch(proxyUrl);
                    if (response.ok) {
                        const blob = await response.blob();
                        return URL.createObjectURL(blob);
                    }
                } catch (error) {
                    console.log("Proxy CORS falló, intentando método directo");
                }

                return new Promise((resolve, reject) => {
                    img.onload = () => resolve(url);
                    img.onerror = reject;
                    img.src = url;
                });
            };

            try {
                const loadedImageUrl = await loadImageWithFallbacks(imageUrl);
                img.src = loadedImageUrl;

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
            } catch (error) {
                console.error("Error cargando imagen:", error);
                // Crear imagen de placeholder
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

                resolve(canvas.toDataURL('image/png', 1.0));
                return;
            }

            // Obtener dimensiones originales de la imagen
            const originalImgWidth = img.width;
            const originalImgHeight = img.height;
            
            // Establecer el ancho del canvas igual al ancho de la imagen
            const canvasWidth = originalImgWidth;
            
            // Calcular la altura proporcional de la imagen para el canvas
            const imgHeight = originalImgHeight;
            
            // Altura inicial del canvas (imagen + espacio estimado para texto)
            let canvasHeight = imgHeight + 100;
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

            // Definir padding derecho para todo el texto
            const rightPadding = 60;

            // Calcular la altura necesaria para el contenido textual
            let textContentHeight = 0;
            textContentHeight += 40;

            // Calcular altura para cada producto
            product.rectangles.forEach((item) => {
                const description = item.description
                    .replace(/PRECIO ESPECIAL POR PAQUETE/g, '')
                    .replace(/TALLA: UT/g, '')
                    .trim();

                const tempCtx = canvas.getContext('2d');
                tempCtx.font = '30px Arial, sans-serif';

                const words = description.split(' ');
                const lines = [];
                let currentLine = words[0];
                const maxWidth = canvasWidth - 60 - rightPadding;

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

                textContentHeight += 60;
                textContentHeight += lines.length * 30;
                textContentHeight += 50;
                textContentHeight += 40;
            });

            // Altura total del canvas (imagen + contenido + márgenes)
            const totalCanvasHeight = imgHeight + textContentHeight + 40;

            // Si la altura calculada es mayor que la actual, redimensionar el canvas
            if (totalCanvasHeight > canvasHeight) {
                canvas.height = totalCanvasHeight;
                const newGradient = ctx.createLinearGradient(0, 0, canvasWidth, totalCanvasHeight);
                newGradient.addColorStop(0, '#1f2937');
                newGradient.addColorStop(0.5, '#374151');
                newGradient.addColorStop(1, '#111827');
                ctx.fillStyle = newGradient;
                ctx.fillRect(0, 0, canvasWidth, totalCanvasHeight);
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

            // Línea decorativa con márgenes
            const lineGradient = ctx.createLinearGradient(60, 0, canvasWidth - rightPadding, 0);
            lineGradient.addColorStop(0, '#8b5cf6');
            lineGradient.addColorStop(0.5, '#ec4899');
            lineGradient.addColorStop(1, '#f59e0b');
            ctx.fillStyle = lineGradient;
            ctx.fillRect(60, currentY, canvasWidth - 60 - rightPadding, 2);
            currentY += 30;

            // Información de productos
            product.rectangles.forEach((item, index) => {
                // Código del producto en rectángulo redondeado
                const codeWidth = 60;
                const codeHeight = 60;
                const codeX = 60;
                const codeY = currentY + 20;

                // Convertir RGB string a valores
                const rgbMatch = item.bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                if (rgbMatch) {
                    ctx.fillStyle = item.bgColor;
                } else {
                    ctx.fillStyle = '#8b5cf6';
                }

                // Dibujar rectángulo redondeado
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

                // Añadir sombra al rectángulo
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 4;
                ctx.fill();
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                // Texto del código
                ctx.fillStyle = item.logoTextColor || '#ffffff';
                ctx.font = 'bold 28px Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.code.trim(), codeX + codeWidth / 2, codeY + codeHeight / 2);
                ctx.textBaseline = 'alphabetic';

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

                // Dibujar las líneas de descripción
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
                    tags.push('IMPORTACIÓN');
                }
                tags.push('PRECIO ESPECIAL POR PAQUETE');

                tags.forEach((tag) => {
                    ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
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
                    ctx.font = 'bold 16px Arial, sans-serif';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(tag, tagX + 10, tagY);
                    ctx.textBaseline = 'alphabetic';

                    tagX += tagWidth + 15;
                });

                currentY = tagY + 50;

                // Separador entre productos
                if (index < product.rectangles.length - 1) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.fillRect(60, currentY, canvasWidth - 60 - rightPadding, 1);
                    currentY += 30;
                }
            });

            // Devolver data URL en lugar de descargar
            resolve(canvas.toDataURL('image/png', 1.0));
            
        } catch (error) {
            console.error('Error al generar la imagen para ZIP:', error);
            resolve(null);
        }
    });
};

    const startDownload = async () => {
      if (!products || products.length === 0) return;
  
      if (isDownloading) {
          cancelDownload();
          return;
      }

      // Para Safari, usar descarga ZIP
      if (isSafari.current) {
          setShowConfirm(true);
          return;
      }

      // Para otros navegadores, comportamiento normal
      setShowConfirm(true);
    };

    const confirmDownload = async () => {
        setShowConfirm(false);

        // Para Safari, usar descarga ZIP
        if (isSafari.current) {
          downloadAsZip();
          return;
        }

        setIsDownloading(true);
        setShowCancel(false);
        isCancelled.current = false;
        setProgress(0);

        downloadPromise.current = (async () => {
        try {
            const totalImages = products.reduce((total, product) => total + product.images.length, 0);
            let downloadedCount = 0;
            let successfulDownloads = 0;

            // Mostrar mensaje de inicio
            showStatusMessage(`Iniciando descarga de ${totalImages} imágenes...`, 3000);

            // Para cada producto en la categoría
            for (const product of products) {
            if (isCancelled.current) break;
            
            // Para cada imagen del producto
            for (let i = 0; i < product.images.length; i++) {
                if (isCancelled.current) break;
                
                const success = await downloadImageWithInfo(product, product.images[i], i);
                if (success) {
                successfulDownloads++;
                }
                
                downloadedCount++;
                setProgress(Math.round((downloadedCount / totalImages) * 100));
                
                // Mostrar mensaje de progreso cada 25%
                if (downloadedCount % Math.max(1, Math.floor(totalImages / 4)) === 0) {
                showStatusMessage(`Descargando... ${progress}% completado`, 1500);
                }
                
                // Pequeña pausa para evitar sobrecargar el navegador
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            }

            if (!isCancelled.current) {
            if (successfulDownloads === totalImages) {
                showStatusMessage(`¡Descarga completada! ${successfulDownloads} imágenes descargadas`, 4000);
            } else {
                showStatusMessage(`Descarga parcial: ${successfulDownloads} de ${totalImages} imágenes`, 4000);
            }
            } else {
            showStatusMessage(`Descarga cancelada. ${successfulDownloads} imágenes descargadas`, 3000);
            }
            
        } catch (error) {
            if (!isCancelled.current) {
            console.error('Error en descarga masiva:', error);
            showStatusMessage('Error en la descarga. Intenta nuevamente.', 3000);
            }
        } finally {
            setIsDownloading(false);
            setShowCancel(false);
            setProgress(0);
            isCancelled.current = false;
        }
        })();
    };

    const cancelDownload = () => {
        if (isDownloading) {
        isCancelled.current = true;
        setShowCancel(false);
        showStatusMessage('Cancelando descarga...', 3000);
        } else {
        setShowConfirm(false);
        }
    };

    const cancelConfirm = () => {
        setShowConfirm(false);
        showStatusMessage('Descarga cancelada', 3000);
    };

return (
    <div className="relative ">
      <button
          onClick={startDownload}
          disabled={!products || products.length === 0}
          className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 shadow-md border relative z-10 min-w-[140px] justify-center hover:cursor-pointer ${
          isDownloading 
              ? 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 border-red-400/30' 
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-green-400/30'
          } text-white`}
          title={isDownloading ? "Cancelar descarga" : "Descargar todas las imágenes con información"}
      >
          {isDownloading ? (
          <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm font-medium">Cancelar</span>
          </>
          ) : (
          <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">
                  {isSafari.current ? "Descargar ZIP" : "Descargar Todo"}
              </span>
          </>
          )}
      </button>

    {/* Barra de progreso debajo del botón cuando está descargando */}
    {isDownloading && (
        <div className="my-0.5 -bottom-2 left-0 right-0">
            <div className="my-2.5 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                className="h-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
                />
            </div>
            <div className="text-xs my-2.5 text-gray-400 text-center mt-1">
                {progress}% completado
            </div>
        </div>
    )}

    {/* Mensaje de estado */}
    {showMessage && (
        <div className=" -bottom-10 left-0 right-0">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg animate-pulse">
            {message}
        </div>
        </div>
    )}

    {/* Modal de confirmación */}
    {showConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/30 shadow-2xl">
            <div className="text-center">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">
                {isSafari.current ? "¿Descargar como ZIP?" : "¿Iniciar descarga masiva?"}
            </h3>
            <p className="text-gray-300 mb-6">
                {isSafari.current 
                    ? `Se creará un archivo ZIP con ${products.reduce((total, product) => total + product.images.length, 0)} imágenes. Esta opción es más compatible con Safari.` 
                    : `Esto descargará ${products.reduce((total, product) => total + product.images.length, 0)} imágenes con información. Puede tomar varios minutos.`}
            </p>
            
            <div className="flex space-x-4 justify-center">
                <button
                onClick={cancelConfirm}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                Cancelar
                </button>
                <button
                onClick={confirmDownload}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                {isSafari.current ? "Sí, crear ZIP" : "Sí, Descargar"}
                </button>
            </div>
            </div>
        </div>
        </div>
    )}

    </div>
  );
};