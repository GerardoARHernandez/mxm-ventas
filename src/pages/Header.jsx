import { Link } from "react-router-dom";
import { MdOutlineShoppingCart } from "react-icons/md";

const Header = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white shadow-md">
      {/* Logo - Más prominente */}
      <div className="text-xl font-bold tracking-tight">
        <Link 
          to="/" 
          className="hover:text-rose-300 transition-colors duration-200 flex items-center"
        >
          {/* <span className="bg-blue-600 text-white px-3 py-1 rounded-md mr-2">MXM</span> */}
          <span className="hidden sm:inline">MXM</span>
        </Link>
      </div>

      {/* Contenedor central para el link de inicio */}
      <div className="flex-1 flex justify-center">
        <ul className="flex space-x-6">
          <li>
            <Link 
              to="/" 
              className="hover:text-pink-300 transition-colors duration-200 font-medium px-3 py-1 rounded-md hover:bg-gray-700"
            >
              Inicio
            </Link>
          </li>
          <li>
            <Link 
              to="/login" 
              className="hover:text-pink-300 transition-colors duration-200 font-medium px-3 py-1 rounded-md hover:bg-gray-700"
            >
              Login
            </Link>
          </li>
        </ul>
      </div>

      {/* Icono del carrito - Con indicador de items */}
      <div className="relative">
        <button className="p-2 hover:bg-gray-700 rounded-full transition-colors duration-200 relative hover:cursor-pointer">
          <MdOutlineShoppingCart className="text-2xl" />
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            2
          </span>
        </button>
      </div>
    </nav>
  );
};

export default Header;