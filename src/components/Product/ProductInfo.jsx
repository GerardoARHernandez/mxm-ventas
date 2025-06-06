const ProductInfo = ({ product, selectedSizeData }) => (
  <div className="p-8">
    <h3 className="text-2xl font-bold text-center -mt-7 pb-12">{product.Descrip}</h3>
    
    <div className="grid grid-cols-2 gap-8 px-5 text-lg text-gray-800 mb-6">
      <div>
        <span className="font-semibold">Código:</span> {product.modelo}
      </div>
      <div>
        <span className="font-semibold">Precio:</span> ${product.Precio1}
      </div>
      {selectedSizeData?.Articulo && (
        <div className="col-span-2">
          <span className="font-semibold">Código de artículo:</span> {selectedSizeData.Articulo}
        </div>
      )}
    </div>
  </div>
);

export default ProductInfo;