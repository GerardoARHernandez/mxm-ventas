import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Pagination from "./Pagination";

const PedidoList = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch(`https://systemweb.ddns.net/CarritoWeb/APICarrito/ConsultaPedidosConfirmados?t=${Date.now()}`);
        if (!response.ok) throw new Error('Error al obtener los pedidos');
        
        const data = await response.json();
        setPedidos(data.ListPedidos || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPedidos();
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pedidos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pedidos.length / itemsPerPage);

  return (
    <div className="mx-auto p-4 md:p-6">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">
          Pedidos Confirmados para Armado
        </h1>
        <div className="text-center text-sm text-gray-500 mt-2">
          Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, pedidos.length)} de {pedidos.length} pedidos
        </div>
      </header>

      <section className="mb-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800">
              Pedidos Pendientes
            </h2>
            <ItemsPerPageSelector 
              itemsPerPage={itemsPerPage} 
              setItemsPerPage={setItemsPerPage} 
            />
          </div>
          
          {pedidos.length > 0 ? (
            <>
              <ul className="divide-y divide-gray-200">
                {currentItems.map((pedido) => (
                  <PedidoListItem key={pedido.VENTA} pedido={pedido} />
                ))}
              </ul>
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                indexOfFirstItem={indexOfFirstItem}
                indexOfLastItem={indexOfLastItem}
                pedidosLength={pedidos.length}
                setCurrentPage={setCurrentPage}
              />
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </section>
    </div>
  );
};

const PedidoListItem = ({ pedido }) => (
  <li className="p-4 hover:bg-gray-50 transition-colors">
    <Link to={`pedido/${pedido.VENTA}`} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <PedidoHeader pedido={pedido} />
      <ViewDetailsButton />
    </Link>
  </li>
);

const ViewDetailsButton = () => (
  <div className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-800 hover:cursor-pointer">
    <span className="font-semibold">Ver detalles</span>
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </div>
);

const PedidoHeader = ({ pedido }) => (
  <div className="flex-1">
    <h3 className="font-medium text-gray-900">
      Pedido #{pedido.VENTA} - {pedido.NombreCLIENTE}
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
      <div className="text-sm text-gray-600">
        <span className="font-medium">ID Cliente:</span> {pedido.IDCLIENTE}
      </div>
      <div className="text-sm text-gray-600">
        <span className="font-medium">Estado:</span> 
        <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {pedido.ESTADO === "CO" ? "Confirmado" : pedido.ESTADO}
        </span>
      </div>
    </div>
  </div>
);

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-xl font-semibold text-gray-700">Cargando pedidos...</div>
  </div>
);

const ErrorScreen = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-xl font-semibold text-red-600">Error: {error}</div>
  </div>
);

const ItemsPerPageSelector = ({ itemsPerPage, setItemsPerPage }) => (
  <div className="flex items-center">
    <span className="text-sm mr-2">Mostrar:</span>
    <select 
      className="border rounded p-1 text-sm"
      onChange={(e) => setItemsPerPage(Number(e.target.value))}
      value={itemsPerPage}
    >
      <option value="10">10</option>
      <option value="15">15</option>
      <option value="20">20</option>
    </select>
  </div>
);

const EmptyState = () => (
  <div className="p-6 text-center text-gray-500">
    No hay pedidos confirmados para mostrar
  </div>
);

export default PedidoList;