import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { clients } from "../data";

const ClientSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrar clientes según la búsqueda
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  return (
    <div className="mt-5 mx-2 sm:mx-0">
      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative max-w-3xl">
          <input
            type="text"
            placeholder="Buscar clientes por nombre, email o teléfono..."
            className="w-full py-2 pl-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FiSearch className="absolute right-4 top-2.5 text-gray-400 text-xl" />
        </div>
      </div>

      {/* Resultados */}
      <div className="overflow-x-auto">
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
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <tr key={client.id} className="even:bg-white odd:bg-gray-100 hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{client.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{client.email}</td>
                  <td className="border border-gray-300 px-4 py-2">{client.phone}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button className="text-rose-600 hover:text-rose-800 transition-colors duration-200">
                      Seleccionar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border border-gray-300 px-4 py-4 text-center text-gray-500">
                  {searchQuery ? "No se encontraron clientes" : "Ingrese un término de búsqueda"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientSearch;