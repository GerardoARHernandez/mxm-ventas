import { FiMinus, FiPlus } from 'react-icons/fi';

const QuantitySelector = ({
  value,
  min = 1,
  max,
  onChange,
  onIncrement,
  onDecrement,
  disabled = false,
  theme = 'default' // 'default' or 'blue'
}) => {
  const themeClasses = {
    default: {
      button: 'bg-black text-white hover:bg-gray-800',
      inputBorder: 'border-gray-300',
      inputBg: disabled ? 'bg-gray-100' : ''
    },
    blue: {
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      inputBorder: 'border-blue-300',
      inputBg: disabled ? 'bg-blue-100' : ''
    }
  };

  const currentTheme = themeClasses[theme];

  return (
    <div className="flex items-center">
      <button 
        onClick={onDecrement}
        className={`p-3 rounded-l-lg transition-colors ${currentTheme.button}`}
        disabled={value <= min || disabled}
      >
        <FiMinus size={18} />
      </button>
      
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className={`w-16 h-10 text-center border-t border-b py-3 px-2 text-lg ${currentTheme.inputBorder} ${currentTheme.inputBg}`}
        disabled={disabled}
      />
      
      <button 
        onClick={onIncrement}
        className={`p-3 rounded-r-lg transition-colors ${currentTheme.button}`}
        disabled={value >= max || disabled}
      >
        <FiPlus size={18} />
      </button>
    </div>
  );
};

export default QuantitySelector;