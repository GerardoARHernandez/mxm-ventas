import { Link } from "react-router-dom";
import { usePedidoDetail } from "../../hooks/usePedidoDetail";
import PedidoHeader from "./PedidoHeader";
import PartesTable from "./PartesTable";

const PedidoDetail = () => {
  const {
    pedido,
    detalle,
    loading,
    error,
    saving,
    startingArmado,
    sortField,
    sortDirection,
    navigate,
    iniciarArmado,
    handleSort,
    getSortIcon,
    cambiarEstadoPrenda,
    guardarCambios,
    limpiarProgreso,
    partesOrdenadas,
    partesFiltradas,
    contarArticulosOcultos,
    contarArticulos99PAQ,
    todosSurtidos,
    hayDatosGuardados,
    totalPiezas,
    piezasSurtidas
  } = usePedidoDetail();

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  if (!pedido || !detalle) return <ErrorScreen error="No se pudo cargar la información del pedido" />;

  const partesMostrar = partesOrdenadas();
  const partesOcultadas = contarArticulosOcultos();
  const partes99PAQ = contarArticulos99PAQ();
  const puedeIniciarArmado = pedido.ESTADO === "CO";
  const puedeSurtir = pedido.ESTADO === "EA";

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="mx-auto p-4 md:p-6">
        <PedidoHeader
          pedido={pedido}
          detalle={detalle}
          hayDatosGuardados={hayDatosGuardados}
          piezasSurtidas={piezasSurtidas}
          totalPiezas={totalPiezas}
          onLimpiarProgreso={limpiarProgreso}
        />

        {/* Botón de Iniciar Armado */}
        {puedeIniciarArmado && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Iniciar Proceso de Armado</h3>
                <p className="text-sm text-gray-500">
                  El pedido está confirmado. Debes iniciar el armado para poder surtir los artículos.
                </p>
              </div>
              <button
                onClick={iniciarArmado}
                disabled={startingArmado}
                className={`px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:cursor-pointer ${
                  startingArmado
                    ? "bg-blue-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {startingArmado ? 'Iniciando...' : 'Iniciar Armado'}
              </button>
            </div>
          </div>
        )}

        {/* Mensaje cuando está en armado */}
        {puedeSurtir && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">📦</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Pedido en proceso de armado
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Ahora puedes marcar los artículos como surtidos. 
                    {detalle.UsuarioNombre && ` Armador: ${detalle.UsuarioNombre}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Artículos a surtir
            </h3>
            {partes99PAQ > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Los artículos PAQ(Envio) están excluidos del proceso de armado
              </p>
            )}
            {!puedeSurtir && (
              <p className="text-sm text-yellow-600 mt-1">
                Debes iniciar el armado para poder surtir los artículos
              </p>
            )}
          </div>
          
          {partesMostrar.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                No hay artículos disponibles para mostrar 
                {(detalle.Part?.length > 0) && " (todos están sin stock o son artículos PAQ)"}
              </p>
            </div>
          ) : (
            <PartesTable
              partes={partesMostrar}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onCambiarEstado={cambiarEstadoPrenda}
              pedidoEstado={pedido.ESTADO}
              getSortIcon={(field) => getSortIcon(field)}
            />
          )}
        </div>

        {/* Resumen y acciones */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Resumen del pedido</h3>
              <p className="text-sm text-gray-500">
                {piezasSurtidas} de {totalPiezas} piezas surtidas
              </p>
              {todosSurtidos() && (
                <p className="text-base bg-green-600 text-white mx-1 px-2 font-bold uppercase mt-1">
                  ¡Todos los artículos han sido surtidos!
                </p>
              )}
              {hayDatosGuardados && (
                <p className="text-xs text-blue-600 mt-1">
                  ✓ Tu progreso está guardado automáticamente
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate("..")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 hover:ring-rose-500 hover:cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCambios}
                disabled={!todosSurtidos() || saving || partesFiltradas().length === 0 || !puedeSurtir}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 hover:cursor-pointer ${
                  todosSurtidos() && partesFiltradas().length > 0 && puedeSurtir
                    ? "bg-rose-600 hover:bg-rose-700" 
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedidoDetail;

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-xl font-semibold text-gray-700">Cargando detalles del pedido...</div>
  </div>
);

const ErrorScreen = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="max-w-md text-center">
      <div className="text-xl font-semibold text-red-600 mb-2">Error al cargar el pedido</div>
      <div className="text-gray-600 mb-4">{error}</div>
      <Link 
        to=".."   
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700"
      >
        Volver a la lista de pedidos
      </Link>
    </div>
  </div>
);