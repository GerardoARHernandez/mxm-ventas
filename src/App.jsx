import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import Header from "./pages/Header";
import Home from "./pages/Home";
import ProductPreview from "./pages/ProductPreview";
import Login from "./pages/Login";
import ClientSearch from "./pages/ClientSearch";
import Cart from "./pages/Cart";
import { AuthProvider, useAuth } from './context/AuthContext';
import Armadores from './pages/Armadores';
import OutOfStockPreview from './pages/OutOfStockPreview';
import ProductGrid from './components/ProductGrid';
import { CartProvider } from './context/CartContext.jsx'
import Catalog from './pages/Catalog.jsx';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Si no se especifican roles permitidos o el usuario tiene un rol permitido
  if (!allowedRoles || allowedRoles.includes(user.role)) {
    return children;
  }
  
  // Redirigir según el rol del usuario
  if (user.role === 'ARM') {
    return <Navigate to="/armador" replace />;
  }
  
  // Para otros roles no autorizados, redirigir a la página principal
  return <Navigate to="/" replace />;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

function AppContent() {
  return (
    <Routes>
      {/* Rutas Publicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/agotados" element={<OutOfStockPreview />} />
      <Route path="/catalogo" element={<Catalog />} />

      {/* Rutas que comparten el Header y el contenedor */}
      <Route path="/" element={<MainLayout />}>
        <Route
          index
          element={
            <ProtectedRoute allowedRoles={['VEN']}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="productos"
          element={
            <ProtectedRoute allowedRoles={['VEN']}>
              <ProductGrid />
            </ProtectedRoute>
          }
        />
        <Route
          path="producto/:modelCode"
          element={
            <ProtectedRoute allowedRoles={['VEN']}>
              <ProductPreview />
            </ProtectedRoute>
          }
        />
        <Route
          path="nuevo"
          element={
            <ProtectedRoute allowedRoles={['VEN']}>
              <ClientSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="carrito"
          element={
            <ProtectedRoute allowedRoles={['VEN']}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="armador/*"
          element={
            <ProtectedRoute allowedRoles={['ARM']}>
              <Armadores />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function MainLayout() {
  const location = useLocation();
  const showHeader = !['/agotados'].includes(location.pathname);

  return (
    <>
      {showHeader && <Header />}
      <div className="container mx-auto">
        <Outlet /> {/* Aquí se renderizarán los componentes de las rutas anidadas */}
      </div>
    </>
  );
}

export default App;