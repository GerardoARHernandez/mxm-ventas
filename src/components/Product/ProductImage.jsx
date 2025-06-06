const ProductImage = ({ imageUrl, altText }) => (
  <div className="h-[430px] bg-white flex items-center justify-center px-8 py-2 mt-3">
    {imageUrl ? (
      <img 
        src={`https://systemweb.ddns.net/CarritoWeb/${imageUrl}`}
        alt={altText}
        className="max-h-full max-w-full object-contain"
        loading="lazy"
      />
    ) : (
      <span className="text-gray-400">Sin imagen disponible</span>
    )}
  </div>
);

export default ProductImage;