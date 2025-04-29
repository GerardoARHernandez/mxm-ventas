import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from "./pages/Header";
import Home from "./pages/Home";
import ProductPreview from "./pages/ProductPreview";
import Login from "./pages/Login";
import ClientSearch from "./pages/ClientSearch";
import Cart from "./pages/Cart";
import { AuthProvider, useAuth } from './context/AuthContext';
import CartArmadores from './pages/CartArmadores';
import OutOfStockPreview from './pages/OutOfStockPreview';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const location = useLocation();

  // Determinar si debemos mostrar el header basado en la ruta actual
  const showHeader = !['/agotados'].includes(location.pathname);

  return (
    <>
      {showHeader && <Header />}
      <div className="container mx-auto">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/producto" 
            element={
              <ProtectedRoute>
                <ProductPreview />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/nuevo" 
            element={
              <ProtectedRoute>
                <ClientSearch />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/carrito" 
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/armador" 
            element={
              <ProtectedRoute>
                <CartArmadores />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
      <Routes>
        <Route 
          path="/agotados" 
          element={<OutOfStockPreview />} 
        />
      </Routes>
    </>
  );
}

export default App;