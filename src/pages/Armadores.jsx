import { Routes, Route } from 'react-router-dom';
import PedidoList from '../components/Armador/PedidoList';
import PedidoDetail from '../components/Armador/PedidoDetail';

const Armadores = () => {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route index element={<PedidoList />} />        {/* /armador */}
        <Route path="pedido/:id" element={<PedidoDetail />} />  {/* /armador/pedido/:id */}
      </Routes>
    </div>
  );
};

export default Armadores;