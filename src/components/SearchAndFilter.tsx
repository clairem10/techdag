import React, { useState } from 'react';
import { TechnologyDomain } from '../types';
import { Search, Filter } from 'lucide-react';

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilterDomains: (domains: TechnologyDomain[]) => void;
  filteredDomains: TechnologyDomain[];
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ 
  onSearch, 
  onFilterDomains, 
  filteredDomains 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };
  
  const handleDomainToggle = (domain: TechnologyDomain) => {
    const newFilters = filteredDomains.includes(domain)
      ? filteredDomains.filter(d => d !== domain)
      : [...filteredDomains, domain];
    
    onFilterDomains(newFilters);
  };
  
  const handleClearFilters = () => {
    onFilterDomains([]);
  };
  
  const getDomainColor = (domain: TechnologyDomain) => {
    const colors: Record<TechnologyDomain, { bg: string, text: string }> = {
      [TechnologyDomain.COMPUTING]: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300' },
      [TechnologyDomain.ENERGY]: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
      [TechnologyDomain.TRANSPORTATION]: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-300' },
      [TechnologyDomain.MEDICINE]: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-800 dark:text-pink-300' },
      [TechnologyDomain.COMMUNICATION]: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300' },
      [TechnologyDomain.MATERIALS]: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-800 dark:text-indigo-300' },
      [TechnologyDomain.AI]: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
      [TechnologyDomain.SPACE]: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-800 dark:text-sky-300' },
      [TechnologyDomain.MATHEMATICS]: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300' }
    };
    return colors[domain];
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      {/* Search input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          placeholder="Search technologies..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      
      {/* Filter toggle button */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Filters</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <Filter size={16} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      
      {/* Domain filters */}
      {showFilters && (
        <div className="mt-3 space-y-4 animate-fadeIn">
          <div className="flex flex-wrap gap-2">
            {Object.values(TechnologyDomain).map(domain => {
              const isActive = filteredDomains.includes(domain);
              const colors = getDomainColor(domain);
              
              return (
                <button
                  key={domain}
                  onClick={() => handleDomainToggle(domain)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                    ${isActive 
                      ? `${colors.bg} ${colors.text}` 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {domain}
                </button>
              );
            })}
          </div>
          
          {filteredDomains.length > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;