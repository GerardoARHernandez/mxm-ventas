import { useState } from 'react';

export const CategoryFilter = ({ categories, selectedCategory, onCategoryChange, isScrolled }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Botón móvil */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`w-full px-4 py-3 rounded-xl font-semibold flex items-center justify-between transition-all duration-300 ${
            isScrolled
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md'
          }`}
        >
          <span className="truncate">
            {selectedCategory || 'Elige tu catálogo'}
          </span>
          <svg
            className={`w-5 h-5 transform transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Menú desplegable móvil */}
        {isMenuOpen && (
          <div className="mt-2 bg-gray-800/95 backdrop-blur-lg border border-purple-500/30 rounded-xl p-2 space-y-1 max-h-60 overflow-y-auto shadow-xl">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  onCategoryChange(category);
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-500/40 to-pink-500/40 text-purple-200 font-bold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/60 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menú desktop - Diseño mejorado */}
      <div className="hidden lg:flex flex-wrap gap-2 justify-center items-center">
        {/* Texto "Elige tu catálogo" solo cuando no hay categoría seleccionada */}
        {!selectedCategory && (
          <div className="px-4 py-2 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-lg border border-purple-500/30">
            <span className="text-purple-300 font-medium text-sm">
              Elige tu catálogo
            </span>
          </div>
        )}
        
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 text-sm min-w-[120px] text-center ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 transform hover:scale-105'
                : 'bg-gray-800/40 text-gray-300 hover:text-white hover:bg-gray-700/60 border border-gray-700/30 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};
