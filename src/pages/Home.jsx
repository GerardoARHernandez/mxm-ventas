import { GoPencil } from "react-icons/go";
import { Link } from "react-router-dom";
import { salesData } from '../data';

const Home = () => {
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
                    <table className="min-w-full table-auto border-collapse border border-gray-50">
                        <thead>
                            <tr className="bg-white">
                                <th className="border border-gray-300 px-4 py-2 text-left">Venta</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Importe</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesData.map((item) => (
                                <tr key={item.venta} className="even:bg-white odd:bg-gray-100 hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">{item.venta}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <div className="flex justify-between gap-2">
                                            {item.nombre}
                                            <Link to={'/productos'} className="text-gray-500 hover:text-rose-600 transition-colors duration-200">
                                            <GoPencil className="text-rose-600 hover:text-rose-800 cursor-pointer" />
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">{item.importe}</td>
                                    <td className="border border-gray-300 px-4 py-2">{item.estado}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table> }
            </div>
        </div>
    );
};

export default Home;