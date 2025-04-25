import { Link, useLocation } from "react-router-dom";
import { MdOutlineShoppingCart } from "react-icons/md";
import { useAuth } from '../context/AuthContext';
import { FiUser } from "react-icons/fi";

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const cartItemCount = 3; // Esto vendría del estado global o contexto

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-800 text-white shadow-md">
      {/* Logo */}
      <div className="text-xl font-bold tracking-tight">
        <Link 
          to={user ? "/" : "/login"} 
          className="hover:text-rose-300 transition-colors duration-200 flex items-center"
        >
          <span className="hidden sm:inline">MXM</span>
        </Link>
      </div>

      {/* Navegación */}
      <div className="flex-1 flex justify-center">
        <ul className="flex space-x-6">
          {user && location.pathname !== "/" && (
            <li className="flex items-center gap-4">
              <Link 
                to="/" 
                className="hover:text-pink-300 transition-colors duration-200 font-medium px-3 py-1 rounded-md hover:bg-gray-700"
              >
                Inicio
              </Link>
            </li>
          )}
          <li>
            {user ? (
              <div className="flex items-center gap-4">
                <div className=" inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-7 w-7 mx-2 text-pink-500" />
                  <span className="font-medium">{user.name}</span>
                </div>
                <Link 
                  to="/armador" 
                  className="hover:text-pink-300 transition-colors duration-200 font-medium px-3 py-1 rounded-md hover:bg-gray-700"
                >
                  Armador
                </Link>
                <button 
                  onClick={logout}
                  className="hover:text-pink-300 transition-colors duration-200 font-medium px-3 py-1 rounded-md hover:bg-gray-700 hover:cursor-pointer"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="hover:text-pink-300 transition-colors duration-200 font-medium px-3 py-1 rounded-md hover:bg-gray-700"
              >
                Login
              </Link>
            )}
          </li>
        </ul>
      </div>

      {/* Icono del carrito - solo visible cuando está autenticado */}
      {user && (
        <div className="relative">
          <Link 
            to="/carrito"
            className="p-2 hover:bg-gray-700 rounded-full transition-colors duration-200 relative hover:cursor-pointer block"
          >
            <MdOutlineShoppingCart className="text-2xl" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Header;
