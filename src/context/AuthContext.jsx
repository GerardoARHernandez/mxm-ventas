import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { users } from '../data';

const AuthContext = createContext();
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutos

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Cargar usuario inicial desde localStorage
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [lastActivity, setLastActivity] = useState(() => {
    // Cargar última actividad inicial desde localStorage
    const storedLastActivity = localStorage.getItem('lastActivity');
    return storedLastActivity ? parseInt(storedLastActivity) : Date.now();
  });
  
  const [isLoading, setIsLoading] = useState(true); // Estado de carga inicial
  const navigate = useNavigate();

  // Efecto para verificar la sesión al cargar
  useEffect(() => {
    const verifySession = () => {
      if (user) {
        const timeSinceLastActivity = Date.now() - lastActivity;
        
        if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
          // Sesión expirada
          logout();
        } else {
          // Actualizar última actividad al cargar
          updateLastActivity();
        }
      }
      setIsLoading(false);
    };

    verifySession();
  }, []);

  // Configurar temporizador de inactividad
  useEffect(() => {
    if (!user) return;

    const inactivityTimer = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);

    return () => clearTimeout(inactivityTimer);
  }, [user, lastActivity]);

  // Escuchar eventos de interacción del usuario
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleUserActivity = () => updateLastActivity();

    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [user]);

  const updateLastActivity = () => {
    const now = Date.now();
    setLastActivity(now);
    localStorage.setItem('lastActivity', now.toString());
  };

  const login = (username, password) => {
    const foundUser = users.find(
      u => u.username === username && u.password === password
    );
    
    if (foundUser) {
      setUser(foundUser);
      const now = Date.now();
      setLastActivity(now);
      localStorage.setItem('user', JSON.stringify(foundUser));
      localStorage.setItem('lastActivity', now.toString());
      navigate('/');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    navigate('/login');
  };

  // Esperar a terminar la verificación inicial antes de renderizar
  if (isLoading) {
    return null; 
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);