import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";

const ClientSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/ListClientes');
        if (!response.ok) {
          throw new Error("Error al obtener los clientes");
        }
        const data = await response.json();
        setClients(data.ListClientes || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Resto del componente permanece igual...
  // Filtrar clientes según la búsqueda
  const filteredClients = clients.filter(
    (client) =>
      client.NOMBRE.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.CORREO && client.CORREO.toLowerCase().includes(searchQuery.toLowerCase())) ||
      client.TELEFONO.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="mt-5 mx-2 sm:mx-0 text-center py-8">
        <p>Cargando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-5 mx-2 sm:mx-0 text-center py-8 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

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
                <tr key={client.CLIENTE} className="even:bg-white odd:bg-gray-100 hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{client.NOMBRE}</td>
                  <td className="border border-gray-300 px-4 py-2">{client.CORREO || "-"}</td>
                  <td className="border border-gray-300 px-4 py-2">{client.TELEFONO}</td>
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
                  {searchQuery ? "No se encontraron clientes" : clients.length === 0 ? "No hay clientes disponibles" : "Ingrese un término de búsqueda"}
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