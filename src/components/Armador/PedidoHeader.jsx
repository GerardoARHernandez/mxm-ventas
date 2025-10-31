import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";

const PedidoHeader = ({ 
  pedido, 
  detalle, 
  hayDatosGuardados, 
  piezasSurtidas, 
  totalPiezas, 
  onLimpiarProgreso 
}) => {
  return (
    <header className="mb-6 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <Link 
          to=".." 
          className="inline-flex items-center text-rose-600 hover:text-rose-800 font-medium"
        >
          ← Volver a la lista de pedidos
        </Link>
        
        {hayDatosGuardados && (
          <button
            onClick={onLimpiarProgreso}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:cursor-pointer"
            title="Limpiar todo el progreso guardado"
          >
            <FiX className="mr-1" /> Limpiar progreso
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Pedido #{pedido.VENTA}
        </h1>            
        <p className="text-sm font-medium text-gray-500">Vendedor:{' '}
          <span className="text-base font-semibold text-gray-800">{detalle.Vendedor}</span>
        </p>
      </div>

      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h2 className="text-sm font-medium text-gray-500">Cliente</h2>
          <p className="text-lg font-semibold text-gray-800">{pedido.NombreCLIENTE}</p>
          <p className="text-sm text-gray-600">ID: {pedido.IDCLIENTE}</p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-gray-500">Estado</h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            pedido.ESTADO === "CO" 
              ? "bg-blue-100 text-blue-800" 
              : pedido.ESTADO === "EA"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}>
            {pedido.ESTADO === "CO" ? "Confirmado" : 
             pedido.ESTADO === "EA" ? "En Armado" : 
             pedido.ESTADO === "PA" ? "Parcial" : pedido.ESTADO}
          </span>
          {pedido.ESTADO === "EA" && detalle.UsuarioNombre && (
            <p className="text-xs text-gray-600 mt-1">
              Armador: {detalle.UsuarioNombre}
            </p>
          )}
        </div>
        <div>
          <h2 className="text-sm font-medium text-gray-500">Total</h2>
          <p className="text-xl font-bold text-gray-800">${detalle.TotVenta}</p>
          <p className="text-sm text-gray-600">{totalPiezas} piezas</p>
        </div>
      </div>
      
      {hayDatosGuardados && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Progreso guardado:</strong> Tienes {piezasSurtidas} de {totalPiezas} piezas surtidas. 
            Tu progreso se guarda automáticamente.
          </p>
        </div>
      )}
    </header>
  );
};

export default PedidoHeader;