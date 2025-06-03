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
          bgColor: '#FACB33',
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
          bgColor: '#FACB33',
          textColor: '#000000',
        },
        {
          code: "AM",
          description: "SHORT MARILY DENIM DESTROYER TALLAS:\nS/M, M/L, L/XL Y XL/XXL PRECIO ESPECIAL POR PAQUETE",
          bgColor: '#FACB33',
          textColor: '#000000',
        }
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header con efecto especial */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-400">
              Catálogo Exclusivo
            </span>
          </h1>
          <p className="text-lg text-gray-800 max-w-3xl mx-auto">
            Descubre nuestra colección premium de moda con los mejores precios y diseños únicos. 
          </p>
        </header>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} MXM. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const validRectangles = product.rectangles.filter(rect => 
    rect.code.trim() !== '' || rect.description.trim() !== ''
  );

  const getWidthClass = () => {
    if (validRectangles.length === 0) return 'hidden';
    if (validRectangles.length === 1) return 'w-full';
    return 'w-full md:w-1/2';
  };

  return (
    <div className="group rounded-xl overflow-hidden shadow-lg border border-gray-100 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Imagen del producto con efecto hover */}
      <div className="w-full aspect-[3/4] relative overflow-hidden">
        <img 
          src={product.image} 
          alt="Producto" 
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badge de nuevo (opcional) */}
        <span className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
          Nuevo
        </span>
      </div>

      {/* Contenedor de rectángulos */}
      <div className="flex flex-col md:flex-row w-full divide-y md:divide-y-0 md:divide-x divide-gray-200">
        {product.rectangles.map((rectangle, index) => {
          if (rectangle.code.trim() === '' && rectangle.description.trim() === '') {
            return null;
          }

          return (
            <div 
              key={index}
              className={`${getWidthClass()} px-4 py-4 flex items-center transition-colors duration-300`}
              style={{
                backgroundColor: rectangle.bgColor,
                color: rectangle.textColor,
                minHeight: '100px',
              }}
            >
              {index % 2 === 0 ? (
                <>
                  <div className="font-extrabold text-2xl mr-4 whitespace-nowrap transform transition-transform group-hover:scale-110">
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
                  <div className="font-extrabold text-2xl ml-4 whitespace-nowrap transform transition-transform group-hover:scale-110">
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