import Header from "./pages/Header";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductPreview from "./pages/ProductPreview";
import Login from "./pages/Login";

function App() {

  return (
    <>
      <Header />
      <div className="container mx-auto">
        <Routes>
          <Route path="/" element={ <Home /> } />
          <Route path="/producto" element={ <ProductPreview /> } />
          <Route path="/login" element={ <Login /> } />
        </Routes>
      </div>
    </>
  )
}

export default App
