// data.js  
  export const salesData = [
    { venta: 1, nombre: 'Juan Pérez', importe: 1500, estado: 'PE' },
    { venta: 2, nombre: 'María López', importe: 2000, estado: 'PE' },
    { venta: 3, nombre: 'Carlos García', importe: 1800, estado: 'PE' },
    { venta: 4, nombre: 'Daniel Macias', importe: 1200, estado: 'PE' },
  ];
  

  export const clients = [
    { id: 1, name: "Juan Pérez", email: "juan@example.com", phone: "555-1234" },
    { id: 2, name: "María López", email: "maria@example.com", phone: "555-5678" },
    { id: 3, name: "Carlos García", email: "carlos@example.com", phone: "555-9012" },
    { id: 4, name: "Ana Martínez", email: "ana@example.com", phone: "555-3456" },
  ];

  export const cartProducts = [
    {
      id: 1,
      name: "GABARDINA DONNIKA TWED INSPO CHANEL BLANCO 1114 T CH",
      price: 545.00,
      quantity: 1, // Esta cantidad viene determinada por el stock disponible
      status: "stock",
      maxQuantity: 3 // Stock máximo disponible
    },
    {
      id: 2,
      name: "VESTIDO ELEGANTE NEGRO T MD",
      price: 650.00,
      quantity: 1,
      status: "stock",
      maxQuantity: 5
    },
    {
      id: 3,
      name: "CHAQUETA DE CUERO PREMIUM T GD",
      price: 1200.00,
      quantity: 1,
      status: "preventa",
      maxQuantity: 2
    }
  ];

  export const products = [
    {
      id: 1,
      name: 'SET KARLAM #25 MAXIPANTALON & BLUSA JARETA TERRY DELUXE',
      variants: [
        {
          id: 1,
          imageUrl: 'images/1-rojo.webp',
          color: 'Rojo',
          sku: 'CP2023-RJ',
          basePrice: 429.99,
          sizes: [
            { code: 'UT', price: 409.99, stock: 15 }
          ],
          prev: [
            { code: 'UT', price: 399.99, stock: 0 }
          ]
        },
        {
          id: 2,
          imageUrl: 'images/1-blanco.webp',
          color: 'Blanco',
          sku: 'CP2023-BL',
          basePrice: 399.99,
          sizes: [
            { code: 'UT', price: 399.99, stock: 5 }
          ],
          prev: [
            { code: 'UT', price: 399.99, stock: 20 },
          ]
        },
        {
          id: 3,
          imageUrl: 'images/1-cafe.webp',
          color: 'Café',
          sku: 'CP2023-CF',
          basePrice: 399.99,
          sizes: [
            { code: 'UT', price: 419.99, stock: 0 },
          ],
          prev: [
            { code: 'UT', price: 399.99, stock: 20 },
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'MAXIVESTIDO CHLOE TEJIDO CON DETALLES MESH',
      variants: [
        {
          id: 4,
          imageUrl: 'images/2-azul.webp',
          color: 'Azul',
          sku: 'CP2025-AZ',
          basePrice: 399.99,
          sizes: [
            { code: 'S', price: 399.99, stock: 10 },
            { code: 'M', price: 399.99, stock: 3 },
            { code: 'L', price: 419.99, stock: 16 },
            { code: 'XL', price: 419.99, stock: 2 },
          ],
          prev: [
            { code: 'S', price: 399.99, stock: 0 },
            { code: 'M', price: 399.99, stock: 20 },
            { code: 'L', price: 419.99, stock: 16 },
            { code: 'XL', price: 419.99, stock: 20 },
          ]
        },
        {
          id: 5,
          imageUrl: 'images/2-blanco.webp',
          color: 'Blanco',
          sku: 'CP2025-BL',
          basePrice: 399.99,
          sizes: [
            { code: 'S', price: 399.99, stock: 10 },
            { code: 'M', price: 399.99, stock: 0 },
            { code: 'L', price: 419.99, stock: 16 },
            { code: 'XL', price: 419.99, stock: 7 },
          ],
          prev: [
            { code: 'S', price: 399.99, stock: 20 },
            { code: 'M', price: 399.99, stock: 20 },
            { code: 'L', price: 419.99, stock: 4 },
            { code: 'XL', price: 419.99, stock: 20 },
          ]
        }
      ]
    }
  ];