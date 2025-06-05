import { GoPencil } from "react-icons/go";
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MdOutlineShoppingCart } from "react-icons/md";

const Home = () => {
    const { user } = useAuth();
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                if (!user) return;
                
                const userId = user.username;
                const response = await fetch(`https://systemweb.ddns.net/CarritoWeb/APICarrito/ConsultaPedidos?Usuario=${userId}`);
                
                if (!response.ok) {
                    throw new Error('Error al obtener los pedidos');
                }
                
                const data = await response.json();
                
                // Transformar los datos incluyendo TotVenta como importe
                const transformedData = await Promise.all(
                  data.ListPedidos.map(async item => {
                    // Obtener detalles del pedido para el importe
                    const detalleResponse = await fetch(`https://systemweb.ddns.net/CarritoWeb/APICarrito/Pedido/${item.VENTA}?t=${Date.now()}`);
                    if (detalleResponse.ok) {
                      const detalleData = await detalleResponse.json();
                      return {
                        venta: item.VENTA,
                        nombre: item.NombreCLIENTE,
                        importe: parseFloat(detalleData.TotVenta) || 0,
                        estado: item.ESTADO,
                        pzas: parseInt(detalleData.TotPzas) || 0
                      };
                    }
                    return {
                      venta: item.VENTA,
                      nombre: item.NombreCLIENTE,
                      importe: 0,
                      estado: item.ESTADO,
                      pzas: 0
                    };
                  })
                ).then(results => results.filter(item => item.estado === 'PE'));
                
                setSalesData(transformedData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching sales data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchSalesData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Cargando ventas pendientes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="mt-5 mx-2 sm:mx-0">
            <Link to={'/nuevo'}>
                <button className="border border-rose-500 text-pink-800 px-3 py-1.5 mb-1.5 hover:cursor-pointer hover:bg-pink-50 transition-colors">
                    + Nuevo
                </button>
            </Link>
            <div className="overflow-x-auto pt-3">
                {salesData.length === 0 ? 
                    <div className="flex justify-center items-center h-64">
                        <p className="text-gray-500">No hay ventas pendientes.</p>
                    </div>
                :
                    <table className="min-w-full table-auto border-collapse border border-blue-100">
                        <thead>
                            <tr className="bg-white">
                                <th className="border border-blue-400 px-4 py-2 text-left">Venta</th>
                                <th className="border border-blue-400 px-4 py-2 text-left">Nombre</th>
                                <th className="border border-blue-400 px-4 py-2 text-left">Importe</th>
                                <th className="border border-blue-400 px-4 py-2 text-left">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesData.map((item) => (
                                <tr key={item.venta} className="even:bg-white odd:bg-blue-100 hover:bg-blue-50">
                                    <td className="border border-blue-400 px-4 py-2">{item.venta}</td>
                                    <td className="border border-blue-400 px-4 py-2">
                                        <div className="flex justify-between gap-2">
                                            {item.nombre}
                                            <div className="flex gap-2">
                                              <Link 
                                                to={`/carrito?pedido=${item.venta}`}
                                                className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
                                                title="Ver carrito"
                                              >
                                                <MdOutlineShoppingCart className="text-blue-600 hover:text-blue-800 cursor-pointer" />
                                              </Link>
                                              <Link 
                                                to={`/productos?pedido=${item.venta}`} 
                                                className="text-gray-500 hover:text-rose-600 transition-colors duration-200"
                                                title="Agregar productos"
                                              >
                                                <GoPencil className="text-rose-600 hover:text-rose-800 cursor-pointer" />
                                              </Link>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-blue-400 px-4 py-2">${item.importe.toFixed(2)}</td>
                                    <td className="border border-blue-400 px-4 py-2">{item.estado}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table> 
                }
            </div>
        </div>
    );
};

export default Home;