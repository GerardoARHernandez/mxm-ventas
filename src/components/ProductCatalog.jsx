import React from 'react';

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
  // Filtramos los rectángulos vacíos
  const validRectangles = product.rectangles.filter(rect => 
    rect.code.trim() !== '' || rect.description.trim() !== ''
  );

  // Calculamos las clases de ancho según la cantidad de rectángulos válidos
  const getWidthClass = () => {
    if (validRectangles.length === 0) return 'hidden';
    if (validRectangles.length === 1) return 'w-full';
    return 'w-full md:w-1/2';
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white">
      {/* Imagen del producto */}
      <div className="w-full aspect-square">
        <img 
          src={product.image} 
          alt="Producto" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Contenedor de rectángulos */}
      <div className="flex flex-col md:flex-row w-full">
        {product.rectangles.map((rectangle, index) => {
          // Ocultamos completamente si está vacío
          if (rectangle.code.trim() === '' && rectangle.description.trim() === '') {
            return null;
          }

          return (
            <div 
              key={index}
              className={`${getWidthClass()} px-4 py-4 flex items-center`}
              style={{
                backgroundColor: rectangle.bgColor,
                color: rectangle.textColor,
                minHeight: '100px',
              }}
            >
              {/* Posicionamiento del código según su ubicación */}
              {index % 2 === 0 ? (
                <>
                  <div className="font-extrabold text-2xl mr-4 whitespace-nowrap">
                    {rectangle.code}
                  </div>
                  <div className="text-sm leading-snug text-left whitespace-pre-wrap flex-1">
                    {rectangle.description}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm leading-snug text-left whitespace-pre-wrap flex-1">
                    {rectangle.description}
                  </div>
                  <div className="font-extrabold text-2xl ml-4 whitespace-nowrap">
                    {rectangle.code}
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