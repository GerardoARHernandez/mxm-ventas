import { FiShoppingCart, FiCalendar, FiPackage } from 'react-icons/fi';
import QuantitySelector from './QuantitySelector';

const ProductActions = ({
  availableStock,
  preorderStock,
  quantity,
  preorderQuantity,
  onQuantityChange,
  onPreorderQuantityChange,
  onIncrementQuantity,
  onDecrementQuantity,
  onIncrementPreorderQuantity,
  onDecrementPreorderQuantity,
  onAddToCart,
  onPreorder,
  onAddPackage,
  onPreorderPackage,
  allSizesHaveStock,
  allSizesHavePreorderStock,
  addingToCart,
  individualPrice,
  packagePrice,
  canSellByPackage,
  packageDetails
}) => (
  <div className="space-y-6">
    {/* Selector de cantidad para stock disponible */}
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg font-semibold text-gray-700">Cantidad:</span>
        <span className="text-lg font-bold text-rose-600">
          ${individualPrice ? (individualPrice * quantity).toFixed(2) : '0.00'}
        </span>
      </div>
      
      <QuantitySelector
        value={quantity}
        max={availableStock}
        onChange={onQuantityChange}
        onIncrement={onIncrementQuantity}
        onDecrement={onDecrementQuantity}
        disabled={availableStock === 0 || addingToCart}
      />
      
      <button
        onClick={onAddToCart}
        disabled={availableStock === 0 || addingToCart}
        className={`w-full max-w-xs py-3 px-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
          availableStock > 0 && !addingToCart
            ? 'bg-rose-600 hover:bg-rose-700 hover:cursor-pointer text-white'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        <FiShoppingCart className='text-3xl'/>
        {addingToCart 
          ? 'Agregando...'
          : availableStock > 0 
            ? `Agregar al carrito (${availableStock} disponibles)`
            : 'Sin existencias'}
      </button>
    </div>

    {/* Botón para agregar por paquete - Solo mostrar si se puede vender por paquete */}
    {canSellByPackage && (
      <div className="space-y-4">
        {/* Paquete desde inventario */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold text-gray-700">Paquete desde inventario:</span>
            <span className="text-lg font-bold text-purple-600">
              ${packagePrice ? (packagePrice * packageDetails.piecesPerPackage).toFixed(2) : '0.00'}
            </span>
            <span className="text-sm text-purple-500">
              ({packageDetails.piecesPerPackage} piezas por color/talla requerido)
            </span>
          </div>
          
          <button
            onClick={onAddPackage}
            disabled={!allSizesHaveStock || addingToCart}
            className={`w-full max-w-xs py-3 px-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
              allSizesHaveStock && !addingToCart
                ? 'bg-purple-600 hover:bg-purple-700 text-white hover:cursor-pointer'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FiPackage className='text-2xl'/>
            {addingToCart 
              ? 'Agregando paquete...'
              : allSizesHaveStock
                ? `Agregar paquete completo`
                : 'No hay stock completo para paquete'}
          </button>
        </div>

        {/* Paquete en preventa */}
        {allSizesHavePreorderStock && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-semibold text-gray-700">Paquete en preventa:</span>
              <span className="text-lg font-bold text-orange-600">
                ${packagePrice ? (packagePrice * packageDetails.piecesPerPackage).toFixed(2) : '0.00'}
              </span>
              <span className="text-sm text-orange-500">
                ({packageDetails.piecesPerPackage} piezas por color/talla requerido)
              </span>
            </div>
            
            <button
              onClick={onPreorderPackage}
              disabled={!allSizesHavePreorderStock || addingToCart}
              className={`w-full max-w-xs py-3 px-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
                allSizesHavePreorderStock && !addingToCart
                  ? 'bg-orange-600 hover:bg-orange-700 text-white hover:cursor-pointer'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FiCalendar className='text-2xl'/>
              {addingToCart 
                ? 'Agregando paquete preventa...'
                : `Agregar paquete en preventa`}
            </button>
          </div>
        )}
      </div>
    )}

    {/* Selector de cantidad para preventa individual */}
    {preorderStock > 0 && (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-semibold text-gray-700">Preventa individual:</span>
          <span className="text-lg font-bold text-blue-600">
            ${individualPrice ? (individualPrice * preorderQuantity).toFixed(2) : '0.00'}
          </span>
        </div>
      
        <QuantitySelector
          value={preorderQuantity}
          max={preorderStock}
          onChange={onPreorderQuantityChange}
          onIncrement={onIncrementPreorderQuantity}
          onDecrement={onDecrementPreorderQuantity}
          disabled={preorderStock === 0 || addingToCart}
          theme="blue"
        />
        
        <button
          onClick={onPreorder}
          disabled={preorderStock === 0 || addingToCart}
          className={`w-full max-w-xs py-3 px-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
            preorderStock > 0 && !addingToCart
              ? 'bg-blue-600 hover:bg-blue-700 text-white hover:cursor-pointer'
              : 'bg-blue-100 text-blue-400 cursor-not-allowed'
          }`}
        >
          <FiCalendar className='text-2xl'/>
          {addingToCart 
            ? 'Agregando preventa...'
            : `Agregar preventa (${preorderStock} disponibles)`}
        </button>
      </div>
    )}

    {/* Mensaje informativo cuando se está procesando */}
    {addingToCart && (
      <div className="text-center">
        <p className="text-sm text-gray-500 animate-pulse">
          Procesando... Por favor espere, esto puede tomar unos segundos.
        </p>
      </div>
    )}
  </div>
);

export default ProductActions;