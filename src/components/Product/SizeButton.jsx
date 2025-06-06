import { FiCheck } from 'react-icons/fi';

const SizeButton = ({ size, isSelected, onSelect }) => (
  <button
    onClick={() => onSelect(size.id)}
    className={`relative px-4 py-2 border rounded-md transition-all flex flex-col items-center hover:cursor-pointer ${
      isSelected
        ? 'border-black bg-gray-100 font-medium'
        : 'border-gray-300 hover:border-gray-400'
    } ${size.Exis === "0" && size.PorRecibir === "0" ? 'opacity-50 cursor-not-allowed' : ''}`}
    disabled={size.Exis === "0" && size.PorRecibir === "0"}
  >
    <span className="font-medium">{size.id}</span>
    <div className="flex flex-col items-center">
      <span className={`text-xs ${parseInt(size.Exis) > 0 ? 'text-green-600' : 'text-gray-500'}`}>
        {size.Exis} en stock
      </span>
      <span className={`text-xs ${parseInt(size.PorRecibir) > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
        {size.PorRecibir} por recibir
      </span>
    </div>
    {isSelected && (
      <FiCheck className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5" />
    )}
  </button>
);

export default SizeButton;