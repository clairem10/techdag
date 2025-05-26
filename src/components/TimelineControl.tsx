import React, { useState, useEffect } from 'react';
import { Node } from '../types';

interface TimelineControlProps {
  nodes: Node[];
  timeRange: [number, number];
  onTimeRangeChange: (range: [number, number]) => void;
}

const TimelineControl: React.FC<TimelineControlProps> = ({ 
  nodes, 
  timeRange, 
  onTimeRangeChange 
}) => {
  // Calculate the min and max years from all nodes
  const [minYear, setMinYear] = useState(1900);
  const [maxYear, setMaxYear] = useState(2050);
  
  useEffect(() => {
    if (nodes.length) {
      const years = nodes.map(node => node.year);
      setMinYear(Math.min(...years));
      setMaxYear(Math.max(...years));
    }
  }, [nodes]);

  // Helper to format years as decades for labels
  const formatDecade = (year: number) => {
    return `${Math.floor(year / 10) * 10}s`;
  };
  
  // Calculate timeline intervals for display
  const timelineIntervals = () => {
    const intervals = [];
    const step = Math.ceil((maxYear - minYear) / 8); // Aim for ~8 labels
    
    for (let year = minYear; year <= maxYear; year += step) {
      intervals.push(year);
    }
    
    return intervals;
  };
  
  // Calculate position percentage along timeline
  const getPositionPercent = (year: number) => {
    return ((year - minYear) / (maxYear - minYear)) * 100;
  };
  
  // Handle slider changes
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseInt(e.target.value);
    onTimeRangeChange([newMin, timeRange[1]]);
  };
  
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value);
    onTimeRangeChange([timeRange[0], newMax]);
  };

  return (
    <div className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4">Timeline Control</h3>
      
      {/* Visual timeline with decades */}
      <div className="relative w-full h-8 mb-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
        
        {timelineIntervals().map(year => (
          <div 
            key={year} 
            className="absolute top-0 h-3 w-0.5 bg-gray-400 dark:bg-gray-500"
            style={{ left: `${getPositionPercent(year)}%` }}
          >
            <span className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400">
              {formatDecade(year)}
            </span>
          </div>
        ))}
        
        {/* Node dots on timeline */}
        {nodes.map(node => (
          <div 
            key={node.id}
            className="absolute top-0 w-2 h-2 rounded-full bg-blue-500 transform -translate-x-1/2"
            style={{ 
              left: `${getPositionPercent(node.year)}%`,
              backgroundColor: node.year >= timeRange[0] && node.year <= timeRange[1] 
                ? 'var(--color-blue-500)' 
                : 'var(--color-gray-400)'
            }}
            title={`${node.label} (${node.year})`}
          ></div>
        ))}
        
        {/* Range selection indicators */}
        <div 
          className="absolute top-0 h-1 bg-blue-500 rounded"
          style={{ 
            left: `${getPositionPercent(timeRange[0])}%`, 
            width: `${getPositionPercent(timeRange[1]) - getPositionPercent(timeRange[0])}%` 
          }}
        ></div>
      </div>
      
      {/* Range sliders */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{timeRange[0]}</span>
        <span className="text-sm font-medium">{timeRange[1]}</span>
      </div>
      
      <div className="flex gap-4">
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={timeRange[0]}
          onChange={handleMinChange}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={timeRange[1]}
          onChange={handleMaxChange}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      {/* Quick time period buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button 
          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
          onClick={() => onTimeRangeChange([1940, 1980])}
        >
          Early Computing
        </button>
        <button 
          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
          onClick={() => onTimeRangeChange([1980, 2000])}
        >
          Internet Era
        </button>
        <button 
          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
          onClick={() => onTimeRangeChange([2000, 2020])}
        >
          Mobile Revolution
        </button>
        <button 
          className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
          onClick={() => onTimeRangeChange([2020, 2050])}
        >
          Future Tech
        </button>
        <button 
          className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full"
          onClick={() => onTimeRangeChange([minYear, maxYear])}
        >
          All Time
        </button>
      </div>
    </div>
  );
};

export default TimelineControl;