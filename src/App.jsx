import { Routes, Route, Navigate } from 'react-router-dom';
import Header from "./pages/Header";
import Home from "./pages/Home";
import ProductPreview from "./pages/ProductPreview";
import Login from "./pages/Login";
import ClientSearch from "./pages/ClientSearch";
import Cart from "./pages/Cart";
import { AuthProvider, useAuth } from './context/AuthContext';

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
  return (
    <>
      <Header />
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
        </Routes>
      </div>
    </>
  );
}

export default App;