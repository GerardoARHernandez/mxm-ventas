
const ProductCatalog = () => {
  const products = [
    {
      id: 1,
      image: '/images/1-cafe.webp', 
      rectangles: [
        {
          code: "RP",
          description: "T SHIRT #392 BOOT COQUETTE 3D VINTAGE FULL\nPRINT OVERSIZED TALLA: UT PRECIO ESPECIAL POR PAQUETE",
          bgColor: '#F99DB6',
          textColor: '#000000',
        },
        {
          code: "AM",
          description: "SHORT MARILY DENIM DESTROYER TALLAS:\nS/M, M/L, L/XL Y XL/XXL PRECIO ESPECIAL POR PAQUETE",
          bgColor: '#facb33',
          textColor: '#000000',
        }
      ]
    },
    {
      id: 2,
      image: '/images/placeholder-product.jpeg', 
      rectangles: [
        {
          code: "",
          description: "",
          bgColor: '#facb33',
          textColor: '#000000',
        },
        {
          code: "AM",
          description: "SHORT MARILY DENIM DESTROYER TALLAS:\nS/M, M/L, L/XL Y XL/XXL PRECIO ESPECIAL POR PAQUETE",
          bgColor: '#facb33',
          textColor: '#000000',
        }
      ]
    },
  ];

  return (
    <div className="container mx-auto p-4 bg-blue-50">
      <h1 className="text-3xl font-bold mb-8">Catálogo de Ropa</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const rectangles = product.rectangles;

  // Verificamos si uno está vacío
  const validRects = rectangles.map(r => r.code.trim() !== '' || r.description.trim() !== '');
  const hasOneEmpty = validRects.filter(Boolean).length === 1;

  return (
    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
      {/* Imagen del producto */}
      <div className="w-full">
        <img 
          src={product.image} 
          alt="Producto" 
          className="w-full object-cover"
        />
      </div>

      {/* Rectángulos como banners horizontales */}
      <div className="flex flex-row w-full">
        {rectangles.map((rectangle, index) => {
          const isRight = index % 2 === 1;
          const isEmpty = rectangle.code.trim() === '' && rectangle.description.trim() === '';

          // Tamaño dinámico según contenido
          const baseWidth = hasOneEmpty
            ? isEmpty ? 'md:w-1/3' : 'md:w-2/3'
            : 'md:w-1/2';

          return (
            <div 
              key={index}
              className={`flex items-center justify-between w-full ${baseWidth} px-4 py-4`}
              style={{
                backgroundColor: rectangle.bgColor,
                color: rectangle.textColor,
                minHeight: '100px',
              }}
            >
              {isEmpty ? null : isRight ? (
                <>
                  <div className="text-sm leading-snug text-left whitespace-pre-wrap">
                    {rectangle.description}
                  </div>
                  <div className="font-extrabold text-2xl ml-4 whitespace-nowrap">
                    {rectangle.code}
                  </div>
                </>
              ) : (
                <>
                  <div className="font-extrabold text-2xl mr-4 whitespace-nowrap">
                    {rectangle.code}
                  </div>
                  <div className="text-sm leading-snug text-left whitespace-pre-wrap">
                    {rectangle.description}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};



export default ProductCatalog;
