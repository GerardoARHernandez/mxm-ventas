// data.js
export const products = [
    { id: 1, name: 'Producto 1', price: 100, description: 'Descripción del producto 1' },
    { id: 2, name: 'Producto 2', price: 200, description: 'Descripción del producto 2' },
    { id: 3, name: 'Producto 3', price: 300, description: 'Descripción del producto 3' },
  ];
  
  export const salesData = [
    { venta: 1, nombre: 'Juan Pérez', importe: 1500, estado: 'PE' },
    { venta: 2, nombre: 'María López', importe: 2000, estado: 'PE' },
    { venta: 3, nombre: 'Carlos García', importe: 1800, estado: 'PE' },
    { venta: 4, nombre: 'Daniel Macias', importe: 1200, estado: 'PE' },
  ];
  
  export const users = [
    { id: 1, username: 'admin', password: 'admin123', name: 'Administrador' },
    { id: 2, username: 'user1', password: 'user123', name: 'Usuario de Prueba' },
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