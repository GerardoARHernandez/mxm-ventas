import { useState, useEffect } from 'react';
import { products } from '../data';

const OutOfStockPreview = () => {
  const [stockAlerts, setStockAlerts] = useState([]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

  // Clasificar productos según su stock por talla
  useEffect(() => {
    const alerts = [];

    products.forEach(product => {
      product.variants.forEach(variant => {
        variant.sizes.forEach(size => {
          if (size.stock === 0) {
            alerts.push({
              productId: product.id,
              productName: product.name,
              variant: variant,
              size: size.code,
              status: 'AGOTADO',
              lastOrder: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toLocaleTimeString()
            });
          } else if (size.stock <= 5) { // Consideramos bajo stock si hay 5 o menos unidades
            alerts.push({
              productId: product.id,
              productName: product.name,
              variant: variant,
              size: size.code,
              status: 'ÚLTIMAS UNIDADES',
              remainingStock: size.stock,
              lastOrder: new Date(Date.now() - Math.floor(Math.random() * 60 * 60 * 1000)).toLocaleTimeString()
            });
          }
        });
      });
    });

    setStockAlerts(alerts);
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
          />
        ) : (
          <div className="text-center">
            <p className="text-3xl">Imagen no disponible</p>
          </div>
        )}
      </div>

      {/* Información del producto (50% derecho) */}
      <div className="w-3/5 px-3 py-6 flex flex-col mr-5">
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
          <div className="space-y-3 grid grid-cols-2">
            <p className="text-2xl">
              <span className="font-semibold">Color:</span> {currentAlert.variant.color}
            </p>
            <p className="text-2xl">
              <span className="font-semibold">SKU:</span> {currentAlert.variant.sku}
            </p>
            <p className="text-2xl">
              <span className="font-semibold">Precio:</span> ${currentAlert.variant.basePrice.toFixed(2)}
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
                  size.stock === 0 ? 'bg-red-700' : 
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