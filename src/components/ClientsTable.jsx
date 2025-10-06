import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useState } from "react";

const ClientsTable = ({ clients, onSelectClient, creatingOrder, creatingQuote }) => {
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30);

  // Cálculos para paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = clients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(clients.length / itemsPerPage);

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="overflow-x-auto relative">
      {/* Tabla */}
      <table className="min-w-full table-auto border-collapse border border-gray-50">
        <thead>
          <tr className="bg-white">
            <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Teléfono</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((client) => (
              <tr key={client.CLIENTE} className="even:bg-white odd:bg-gray-100 hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{client.NOMBRE}</td>
                <td className="border border-gray-300 px-4 py-2">{client.CORREO || "-"}</td>
                <td className="border border-gray-300 px-4 py-2">{client.TELEFONO}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex gap-2">
                    {/* Botón Nuevo Pedido */}
                    <button
                      onClick={() => onSelectClient(client.CLIENTE, false)}
                      disabled={creatingOrder}
                      className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                        creatingOrder 
                          ? 'bg-gray-400 text-white cursor-not-allowed' 
                          : 'bg-green-600 text-white hover:bg-green-700 hover:cursor-pointer'
                      }`}
                    >
                      {creatingOrder ? 'Creando...' : 'Pedido'}
                    </button>
                    
                    {/* Botón Cotización */}
                    <button
                      onClick={() => onSelectClient(client.CLIENTE, true)}
                      disabled={creatingQuote}
                      className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                        creatingQuote 
                          ? 'bg-gray-400 text-white cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 hover:cursor-pointer'
                      }`}
                    >
                      {creatingQuote ? 'Creando...' : 'Cotización'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="border border-gray-300 px-4 py-4 text-center text-gray-500">
                No se encontraron clientes
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Paginación */}
      {clients.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 py-5 space-y-4 sm:space-y-0">
          {/* Botones de navegación */}
          <div className="flex space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-1 border rounded-md disabled:opacity-50 hover:cursor-pointer hover:bg-rose-200 transition-colors duration-150 text-sm sm:text-base"
            >
              <FiChevronLeft className="mr-1" /> Anterior
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-1 border rounded-md disabled:opacity-50 hover:cursor-pointer hover:bg-rose-200 transition-colors duration-150 text-sm sm:text-base"
            >
              Siguiente <FiChevronRight className="ml-1" />
            </button>
          </div>

          {/* Números de página */}
          <div className="flex flex-wrap justify-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-150 hover:cursor-pointer ${currentPage === pageNumber ? 'bg-rose-600 text-white shadow-md' : 'text-gray-700 bg-white border border-gray-300 hover:bg-rose-100'}`}
                >
                  {pageNumber}
                </button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="px-3 py-1 text-sm">...</span>
            )}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <button
                onClick={() => paginate(totalPages)}
                className="px-3 py-1 border rounded-md hover:cursor-pointer hover:bg-rose-200 transition-colors duration-150 text-sm"
              >
                {totalPages}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsTable;