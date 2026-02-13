import { useState, useRef } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Función para detectar Safari en iOS
const isSafariOnIOS = () => {
  return /iP(ad|od|hone)/i.test(navigator.userAgent) && 
         /WebKit/i.test(navigator.userAgent) && 
         !/(CriOS|FxiOS|OPiOS|Mercury|EdgiOS)/i.test(navigator.userAgent);
};

export const BulkDownloadButton = ({ products, category }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [zipDownloadUrl, setZipDownloadUrl] = useState(null);
  const [zipFileName, setZipFileName] = useState('');

  const isCancelled = useRef(false);
  const isSafari = useRef(isSafariOnIOS());

  const showStatusMessage = (text, duration = 3000) => {
    setMessage(text);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
      setMessage('');
    }, duration);
  };

  // Función para cargar imagen con múltiples proxies (MEJORADA)
  const loadImageWithProxy = async (imageUrl) => {
    const proxies = [
      (url) => `https://images.weserv.nl/?url=${encodeURIComponent(url)}`,
      (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      (url) => url // Último intento: URL directa
    ];

    for (const proxyFn of proxies) {
      try {
        const proxyUrl = proxyFn(imageUrl);
        const img = new Image();
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

        return img; // Retornar la imagen cargada exitosamente
      } catch (error) {
        console.warn('Proxy falló, intentando siguiente...', error.message);
        continue;
      }
    }

    throw new Error('No se pudo cargar la imagen desde ningún proxy');
  };

  // Función para generar el canvas con la imagen y la información
  const generateCanvas = async (product, img, imageIndex) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const canvasWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;

    if (canvasWidth === 0 || imgHeight === 0) {
      throw new Error('Dimensiones de imagen inválidas');
    }

    const rightPadding = 60;
    let textContentHeight = 40;

    // Calcular altura del texto
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

    const totalCanvasHeight = imgHeight + textContentHeight + 40;
    canvas.width = canvasWidth;
    canvas.height = totalCanvasHeight;

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
      ctx.fillStyle = rgbMatch ? item.bgColor : '#8b5cf6';

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

    return canvas;
  };

  // Función para descargar imagen individual (MEJORADA)
  const downloadImageWithInfo = async (product, imageUrl, imageIndex) => {
    if (isCancelled.current) return false;

    try {
      // Cargar imagen con proxy
      const img = await loadImageWithProxy(imageUrl);
      
      // Generar canvas
      const canvas = await generateCanvas(product, img, imageIndex);

      // Descargar
      const link = document.createElement('a');
      link.download = `producto_${product.category}_${product.id}_img${imageIndex + 1}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      console.error('Error al generar imagen:', error);
      return false;
    }
  };

  // Función para generar ZIP (MEJORADA)
  const downloadAsZip = async () => {
    if (!products || products.length === 0) return;

    setIsDownloading(true);
    setProgress(0);
    isCancelled.current = false;

    try {
      const zip = new JSZip();
      const totalImages = products.reduce((total, product) => total + product.images.length, 0);
      let processedCount = 0;

      showStatusMessage(`Preparando archivo ZIP con ${totalImages} imágenes...`, 3000);

      for (const product of products) {
        if (isCancelled.current) break;

        for (let i = 0; i < product.images.length; i++) {
          if (isCancelled.current) break;

          try {
            // Cargar imagen con proxy
            const img = await loadImageWithProxy(product.images[i]);
            
            // Generar canvas
            const canvas = await generateCanvas(product, img, i);
            
            // Convertir a blob
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            const response = await fetch(dataUrl);
            const blob = await response.blob();

            // Añadir al ZIP
            const fileName = `producto_${product.category}_${product.id}_img${i + 1}.png`;
            zip.file(fileName, blob);

            processedCount++;
            setProgress(Math.round((processedCount / totalImages) * 100));

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

      // Generar ZIP
      showStatusMessage("Comprimiendo imágenes...", 3000);
      const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setProgress(Math.round(metadata.percent));
      });

      const fileName = `productos_${category}_${Date.now()}.zip`;

      if (isSafari.current) {
        const url = URL.createObjectURL(zipBlob);
        setZipDownloadUrl(url);
        setZipFileName(fileName);
        showStatusMessage("¡ZIP listo! Haz clic en el enlace para descargar.", 10000);
      } else {
        saveAs(zipBlob, fileName);
        showStatusMessage("¡ZIP descargado! Revisa tus descargas.", 4000);
      }

    } catch (error) {
      console.error('Error generando ZIP:', error);
      showStatusMessage(`Error al generar el ZIP: ${error.message}`, 3000);
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  // Función para descargar todo (MEJORADA)
  const downloadAllImagesWithInfo = async () => {
    if (!products || products.length === 0) return;

    setIsDownloading(true);
    setProgress(0);
    isCancelled.current = false;

    try {
      const totalImages = products.reduce((total, product) => total + product.images.length, 0);
      let downloadedCount = 0;
      let successfulDownloads = 0;

      showStatusMessage(`Iniciando descarga de ${totalImages} imágenes...`, 3000);

      for (const product of products) {
        if (isCancelled.current) break;

        for (let i = 0; i < product.images.length; i++) {
          if (isCancelled.current) break;

          const success = await downloadImageWithInfo(product, product.images[i], i);
          if (success) successfulDownloads++;

          downloadedCount++;
          setProgress(Math.round((downloadedCount / totalImages) * 100));

          if (downloadedCount % Math.max(1, Math.floor(totalImages / 4)) === 0) {
            showStatusMessage(`Descargando... ${Math.round((downloadedCount / totalImages) * 100)}% completado`, 1500);
          }

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
      console.error('Error en descarga masiva:', error);
      showStatusMessage('Error en la descarga. Intenta nuevamente.', 3000);
    } finally {
      setIsDownloading(false);
      setProgress(0);
      isCancelled.current = false;
    }
  };

  const startDownload = () => {
    if (!products || products.length === 0) return;

    if (isDownloading) {
      cancelDownload();
      return;
    }

    setShowConfirm(true);
  };

  const confirmDownload = () => {
    setShowConfirm(false);

    if (isSafari.current) {
      downloadAsZip();
    } else {
      downloadAllImagesWithInfo();
    }
  };

  const cancelDownload = () => {
    isCancelled.current = true;
    showStatusMessage('Cancelando descarga...', 3000);
  };

  const cancelConfirm = () => {
    setShowConfirm(false);
    showStatusMessage('Descarga cancelada', 3000);
  };

  return (
    <div className="relative">
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

      {/* Barra de progreso */}
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
        <div className="-bottom-10 left-0 right-0">
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

      {/* Enlace de descarga para Safari */}
      {zipDownloadUrl && (
        <div className="fixed bottom-4 left-4 right-4 bg-blue-900 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex justify-between items-center">
            <span>ZIP listo: {zipFileName}</span>
            
            <a
              href={zipDownloadUrl}
              download={zipFileName}
              className="ml-4 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-md font-medium"
              onClick={() => {
                setTimeout(() => {
                  setZipDownloadUrl(null);
                  URL.revokeObjectURL(zipDownloadUrl);
                }, 100);
              }}
            >
              Descargar ZIP
            </a>
            <button
              onClick={() => {
                setZipDownloadUrl(null);
                URL.revokeObjectURL(zipDownloadUrl);
              }}
              className="ml-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 rounded-md"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};