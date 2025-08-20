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
              ? 'bg-gray-800/80 text-white border border-gray-700/50'
              : 'bg-gray-800/50 text-gray-200 hover:text-white border border-gray-700/30'
          }`}
        >
          <span className="truncate">{selectedCategory}</span>
          <svg
            className={`w-4 h-4 transform transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Menú desplegable móvil */}
        {isMenuOpen && (
          <div className="mt-1 bg-gray-800/95 backdrop-blur-lg border border-gray-700/30 rounded-xl p-2 space-y-1 max-h-60 overflow-y-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  onCategoryChange(category);
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menú desktop compacto */}
      <div className="hidden lg:flex flex-wrap gap-1 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-gray-800/40 text-gray-300 hover:bg-gray-700/60 hover:text-white border border-gray-700/20'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};