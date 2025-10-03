const ProductInfo = ({ 
  product, 
  selectedSizeData, 
  individualPrice, 
  packagePrice, 
  canSellByPackage 
}) => (
  <div className="p-8">
    <h3 className="text-2xl font-bold text-center -mt-7 pb-12">{product.Descrip}</h3>
    
    <div className="grid grid-cols-2 gap-8 px-5 text-lg text-gray-800 mb-6">
      <div>
        <span className="font-semibold">Código:</span> {product.modelo}
      </div>
      <div>
        <span className="font-semibold">Precio individual:</span> ${individualPrice ? individualPrice.toFixed(2) : '0.00'}
      </div>
      
      {canSellByPackage && packagePrice > 0 && (
        <div className="col-span-2 bg-purple-50 p-3 rounded-lg">
          <span className="font-semibold text-purple-700">Precio por paquete:</span> 
          <span className="ml-2 font-bold text-purple-600">${packagePrice.toFixed(2)}</span>
          <span className="ml-2 text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
            Ahorras ${((individualPrice * (selectedSizeData?.Tallas?.length || 1)) - packagePrice).toFixed(2)}
          </span>
        </div>
      )}
      
      {selectedSizeData?.Articulo && (
        <div className="col-span-2">
          <span className="font-semibold">Código de artículo:</span> {selectedSizeData.Articulo}
        </div>
      )}
    </div>

    {/* Información de stock */}
    {selectedSizeData && (
      <div className="grid grid-cols-2 gap-4 text-sm mb-4 px-5">
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="font-semibold text-gray-700">Stock disponible:</span>
          <span className={`ml-2 font-bold ${parseInt(selectedSizeData.Exis) > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {selectedSizeData.Exis}
          </span>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <span className="font-semibold text-gray-700">Por recibir:</span>
          <span className={`ml-2 font-bold ${parseInt(selectedSizeData.PorRecibir) > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
            {selectedSizeData.PorRecibir}
          </span>
        </div>
      </div>
    )}
  </div>
);

export default ProductInfo;