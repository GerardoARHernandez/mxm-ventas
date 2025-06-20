import { useState, useEffect } from 'react';

const OutOfStockPreview = () => {
  const [stockAlerts, setStockAlerts] = useState([]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedModels, setLoadedModels] = useState(0);
  const [totalModels, setTotalModels] = useState(0);

  // Obtener datos de productos y stock
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        
        // 1. Obtener lista de modelos (con caché)
        const cacheKey = 'modelosCache';
        const cachedModelos = localStorage.getItem(cacheKey);
        let modelos = [];
        
        if (cachedModelos) {
          modelos = JSON.parse(cachedModelos);
        } else {
          const modelosResponse = await fetch('https://systemweb.ddns.net/CarritoWeb/APICarrito/ListModelos');
          if (!modelosResponse.ok) throw new Error('Error al obtener modelos');
          const modelosData = await modelosResponse.json();
          modelos = modelosData.ListModelos || [];
          localStorage.setItem(cacheKey, JSON.stringify(modelos));
        }
        
        setTotalModels(modelos.length);
        
        // 2. Procesar modelos en lotes
        const batchSize = 5; // Procesar 5 modelos a la vez
        const alerts = [];
        
        for (let i = 0; i < modelos.length; i += batchSize) {
          const batch = modelos.slice(i, i + batchSize);
          
          // Procesar el lote actual en paralelo
          const batchResults = await Promise.all(
            batch.map(async (modelo) => {
              try {
                const variacionesResponse = await fetch(
                  `https://systemweb.ddns.net/CarritoWeb/APICarrito/ConsultaVariacionModelo?Modelo=${modelo.modelo}`,
                  { priority: 'low' } // Navegadores modernos
                );
                
                if (!variacionesResponse.ok) return [];
                
                const variacionesData = await variacionesResponse.json();
                if (!Array.isArray(variacionesData)) return [];
                
                const modelAlerts = [];
                
                variacionesData.forEach(variacion => {
                  if (!Array.isArray(variacion.Tallas)) return;
                  
                  variacion.Tallas.forEach(talla => {
                    const stock = parseInt(talla.Exis) || 0;
                    
                    if (stock <= 5) { // Solo nos interesan los bajos stocks
                      modelAlerts.push({
                        productId: modelo.modelo,
                        productName: modelo.Descrip,
                        variant: {
                          color: variacion.cvariacion || 'Sin color',
                          sku: variacion.Codigo || 'Sin SKU',
                          imageUrl: variacion.Imagen 
                            ? `https://systemweb.ddns.net/CarritoWeb/${variacion.Imagen}`
                            : null,
                          sizes: variacion.Tallas.map(t => ({
                            code: t.id || 'Sin talla',
                            stock: parseInt(t.Exis) || 0,
                            articulo: t.Articulo || 'Sin artículo'
                          }))
                        },
                        size: talla.id || 'Sin talla',
                        status: stock <= 0 ? 'AGOTADO' : 'ÚLTIMAS UNIDADES',
                        remainingStock: stock,
                        lastOrder: new Date().toLocaleTimeString()
                      });
                    }
                  });
                });
                
                return modelAlerts;
              } catch (err) {
                console.error(`Error procesando modelo ${modelo.modelo}:`, err);
                return [];
              } finally {
                setLoadedModels(prev => prev + 1);
              }
            })
          );
          
          // Agregar los resultados del lote actual
          alerts.push(...batchResults.flat());
          
          // Actualizar el estado con lo que llevamos
          setStockAlerts(current => [...current, ...batchResults.flat()]);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  // Rotar alertas cada 5 segundos
  useEffect(() => {
    if (stockAlerts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentAlertIndex(prev => 
        prev === stockAlerts.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [stockAlerts]);

    if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-100">
        <div className="text-center">
          <p className="text-2xl mb-4">Cargando información de stock...</p>
          <progress 
            value={loadedModels} 
            max={totalModels}
            className="w-64 h-4"
          />
          <p className="mt-2">
            Progreso: {loadedModels} de {totalModels*2} modelos procesados
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-100">
        <p className="text-2xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (stockAlerts.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-blue-100">
        <p className="text-2xl">No hay productos agotados o con bajo stock</p>
      </div>
    );
  }

  const currentAlert = stockAlerts[currentAlertIndex];

  return (
    <div className="bg-gray-900 text-white h-screen overflow-hidden flex py-auto">
      {/* Imagen del producto (50% izquierdo) */}
      <div className="w-2/5 bg-gray-950 flex items-center justify-center">
        {currentAlert.variant.imageUrl ? (
          <img 
            src={currentAlert.variant.imageUrl} 
            alt={currentAlert.productName}
            className="object-contain h-full w-full"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = 'https://via.placeholder.com/500x750?text=Imagen+no+disponible';
            }}
          />
        ) : (
          <div className="text-center">
            <p className="text-3xl">Imagen no disponible</p>
          </div>
        )}
      </div>

      {/* Información del producto (50% derecho) */}
      <div className="w-3/5 px-6 py-6 flex flex-col mr-5">
        {/* Estado del producto (AGOTADO/ÚLTIMAS UNIDADES) */}
        <div className={`mb-4 p-4 rounded-2xl ${
          currentAlert.status === 'AGOTADO' ? 'bg-red-600' : 'bg-yellow-600'
        }`}>
          <h2 className="text-3xl font-bold">{currentAlert.status} - TALLA {currentAlert.size}</h2>
          {currentAlert.remainingStock && (
            <p className="text-xl mt-2">Quedan: {currentAlert.remainingStock} unidades</p>
          )}
        </div>

        {/* Detalles del producto */}
        <div className="mb-4">
          <h1 className="text-[2.5rem]/12 text-center font-bold mb-4">{currentAlert.productName}</h1>
          <div className="space-y-3 grid grid-cols-2 px-8">
            <p className="text-2xl">
              <span className="font-semibold">Color:</span> {currentAlert.variant.color}
            </p>
            <p className="text-2xl">
              <span className="font-semibold">SKU:</span> {currentAlert.variant.sku}
            </p>
            <p className="text-2xl">
              <span className="font-semibold">Modelo:</span> {currentAlert.productId}
            </p>
          </div>
        </div>

        {/* Todas las tallas disponibles */}
        <div className="mt-4 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl font-bold mb-2">STOCK POR TALLA</h3>
          <div className="grid grid-cols-3 gap-2">
            {currentAlert.variant.sizes.map((size, index) => (
              <div 
                key={index} 
                className={`p-2 rounded text-center ${
                  size.stock <= 0 ? 'bg-red-700' : 
                  size.stock <= 5 ? 'bg-yellow-700' : 'bg-green-700'
                } ${size.code === currentAlert.size ? 'ring-2 ring-white' : ''}`}
              >
                <p className="font-bold">{size.code}</p>
                <p>{size.stock} unidades</p>
              </div>
            ))}
          </div>
        </div>

        {/* Último pedido y contador */}
        <div className="my-auto flex justify-between items-center">
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xl">Último pedido: {currentAlert.lastOrder}</p>
          </div>
          <div className="bg-gray-800 p-2 rounded-lg">
            <p className="text-lg">
              {currentAlertIndex + 1}/{stockAlerts.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutOfStockPreview;