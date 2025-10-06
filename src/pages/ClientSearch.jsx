import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { debounce } from "lodash";
import ClientsTable from "../components/ClientsTable";
import { FiSearch } from "react-icons/fi";

const ClientSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [creatingQuote, setCreatingQuote] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://systemweb.ddns.net/CarritoWeb/APICarrito/ListClientes', {
          headers: {
            'Origin': import.meta.env.VITE_API_ORIGIN
          },
        });
        if (!response.ok) {
          throw new Error("Error al obtener los clientes");
        }
        const data = await response.json();
        setClients(data.ListClientes || []);
        setFilteredClients(data.ListClientes || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Debounce para el buscador
  const debouncedFilter = useCallback(
    debounce((query, clientList) => {
      if (!query) {
        setFilteredClients(clientList);
        return;
      }

      const filtered = clientList.filter(
        (client) =>
          client.NOMBRE.toLowerCase().includes(query.toLowerCase()) ||
          (client.CORREO && client.CORREO.toLowerCase().includes(query.toLowerCase())) ||
          client.TELEFONO.includes(query)
      );

      setFilteredClients(filtered);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFilter(searchQuery, clients);
    return () => debouncedFilter.cancel();
  }, [searchQuery, clients, debouncedFilter]);

  const handleCreateOrder = async (clientId, isQuote = false) => {
    if (!user || creatingOrder || creatingQuote) return;
    
    if (isQuote) {
      setCreatingQuote(true);
    } else {
      setCreatingOrder(true);
    }
    
    try {
      const response = await fetch('https://systemweb.ddns.net/CarritoWeb/APICarrito/CrearPedido', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': import.meta.env.VITE_API_ORIGIN
        },
        body: JSON.stringify({
          Usuario: user.username,
          cliente: clientId,
          Cotizacion: isQuote
        })
      });

      if (!response.ok) {
        throw new Error("Error al crear el " + (isQuote ? "cotización" : "pedido"));
      }

      const data = await response.json();
      navigate(`/productos?pedido=${data.Folio}${isQuote ? '&cotizacion=true' : ''}`);
    } catch (err) {
      console.error("Error al crear " + (isQuote ? "cotización" : "pedido") + ":", err);
      alert(`Ocurrió un error al crear ${isQuote ? "la cotización" : "el pedido"}. Por favor intenta nuevamente.`);
    } finally {
      if (isQuote) {
        setCreatingQuote(false);
      } else {
        setCreatingOrder(false);
      }
    }
  };

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

      <ClientsTable
        clients={filteredClients} 
        onSelectClient={handleCreateOrder} 
        creatingOrder={creatingOrder}
        creatingQuote={creatingQuote}
      />
    </div>
  );
};

export default ClientSearch;