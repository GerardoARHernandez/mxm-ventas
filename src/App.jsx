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
import ProductCatalog from './components/ProductCatalog';
import { CartProvider } from './context/CartContext.jsx'

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
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
      <Route path="/login" element={<Login />} />
      <Route path="/agotados" element={<OutOfStockPreview />} />
      <Route path="/catalog" element={<ProductCatalog />} />

      {/* Rutas que comparten el Header y el contenedor */}
      <Route path="/" element={<MainLayout />}>
        <Route
          index // path="/" dentro de MainLayout
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="productos"
          element={
            <ProtectedRoute>
              <ProductGrid />
            </ProtectedRoute>
          }
        />
        <Route
          path="producto/:modelCode"
          element={
            <ProtectedRoute>
              <ProductPreview />
            </ProtectedRoute>
          }
        />
        <Route
          path="nuevo"
          element={
            <ProtectedRoute>
              <ClientSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="carrito"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="armador/*"
          element={
            <ProtectedRoute>
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