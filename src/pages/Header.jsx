import { Link, useLocation } from "react-router-dom";
import { MdOutlineShoppingCart } from "react-icons/md";
import { useAuth } from '../context/AuthContext';
import { FiUser } from "react-icons/fi";
import { IoMenuOutline, IoCloseOutline } from "react-icons/io5";
import { useState } from "react";

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const cartItemCount = 3; // Esto vendría del estado global o contexto
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="flex items-center justify-between px-4 sm:px-10 py-5 bg-gray-800 text-white shadow-md relative">
      {/* Logo */}
      <div className="text-xl font-bold tracking-tight z-10">
        <Link 
          to={user ? "/" : "/login"} 
          className="hover:text-rose-300 transition-colors duration-200 flex items-center"
        >
          <span>MXM</span>
        </Link>
      </div>

      {/* Menú Hamburguesa - Solo móvil */}
      <div className="md:hidden absolute left-1/2 transform -translate-x-1/2 z-10">
        <button 
          onClick={toggleMenu}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors duration-200"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <IoCloseOutline className="text-2xl" />
          ) : (
            <IoMenuOutline className="text-2xl" />
          )}
        </button>
      </div>

      {/* Navegación Desktop */}
      <div className="hidden md:flex flex-1 justify-center">
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
              <h2 className="hover:text-pink-300 transition-colors duration-200 font-medium px-3 py-1 rounded-md hover:bg-gray-700"
              >Login</h2>
            )}
          </li>
        </ul>
      </div>

      {/* Menú móvil desplegable */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-800 z-0 pt-15 px-4">
          <ul className="flex flex-col space-y-3">
            {user && location.pathname !== "/" && (
              <li>
                <Link 
                  to="/" 
                  className="block hover:text-pink-300 transition-colors duration-200 font-medium px-3 py-3 rounded-md hover:bg-gray-700 text-center"
                  onClick={toggleMenu}
                >
                  Inicio
                </Link>
              </li>
            )}
            {user && (
              <>
                <li className="flex items-center justify-center gap-2 px-3 py-3">
                  <FiUser className="h-7 w-7 text-pink-500" />
                  <span className="font-medium">{user.name}</span>
                </li>
                <li>
                  <Link 
                    to="/armador" 
                    className="block hover:text-pink-300 transition-colors duration-200 font-medium px-3 py-3 rounded-md hover:bg-gray-700 text-center"
                    onClick={toggleMenu}
                  >
                    Armador
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      logout();
                      toggleMenu();
                    }}
                    className="w-full hover:text-pink-300 transition-colors duration-200 font-medium px-3 py-3 rounded-md hover:bg-gray-700 hover:cursor-pointer"
                  >
                    Cerrar sesión
                  </button>
                </li>
              </>
            )}
            {!user && (
              <li>
                <Link 
                  to="/login" 
                  className="block hover:text-pink-300 transition-colors duration-200 font-medium px-3 py-3 rounded-md hover:bg-gray-700 text-center"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Icono del carrito - solo visible cuando está autenticado */}
      {user && (
        <div className="relative z-10">
          <Link 
            to="/carrito"
            className="p-2 hover:bg-gray-700 rounded-full transition-colors duration-200 relative hover:cursor-pointer block"
            onClick={() => setIsMenuOpen(false)}
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