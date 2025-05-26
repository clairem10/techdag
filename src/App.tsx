import React, { useState, useEffect } from 'react';
import { Node, TechnologyDomain, GraphData } from './types';
import { graphData } from './data/initialData';
import GraphView from './components/GraphView';
import TimelineControl from './components/TimelineControl';
import SearchAndFilter from './components/SearchAndFilter';
import NodeDetail from './components/NodeDetail';
import UserContribution from './components/UserContribution';
import { Database, CircleUser, Github, MapPin } from 'lucide-react';

function App() {
  const [data, setData] = useState<GraphData>(graphData);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filteredDomains, setFilteredDomains] = useState<TechnologyDomain[]>([]);
  const [timeRange, setTimeRange] = useState<[number, number]>([1940, 2050]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContribution, setShowContribution] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Effect to apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  // Handle domain filtering
  const handleFilterDomains = (domains: TechnologyDomain[]) => {
    setFilteredDomains(domains);
  };
  
  // Handle time range changes
  const handleTimeRangeChange = (range: [number, number]) => {
    setTimeRange(range);
  };
  
  // Get related nodes for the selected node
  const getRelatedNodes = (): Node[] => {
    if (!selectedNode) return [];
    
    // Find nodes that are connected to the selected node (either as source or target)
    const relatedNodeIds = data.edges
      .filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id)
      .map(edge => edge.source === selectedNode.id ? edge.target : edge.source);
    
    return data.nodes.filter(node => relatedNodeIds.includes(node.id));
  };
  
  // Handle adding a new node
  const handleAddNode = (newNodeData: Omit<Node, 'id'>) => {
    const newId = `${newNodeData.label.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
    const newNode: Node = {
      ...newNodeData,
      id: newId
    };
    
    // Create new edges based on links
    const newEdges = [...data.edges];
    if (newNodeData.links && newNodeData.links.length > 0) {
      newNodeData.links.forEach(targetId => {
        newEdges.push({
          source: targetId,
          target: newId
        });
      });
    }
    
    setData({
      nodes: [...data.nodes, newNode],
      edges: newEdges
    });
    
    // Select the newly added node
    setSelectedNode(newNode);
  };
  
  // Filter nodes based on search query
  const filteredNodes = searchQuery
    ? data.nodes.filter(node => 
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : data.nodes;
  
  // Setup main content and sidebar based on screen size
  const renderMainContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-grow">
        <GraphView 
          nodes={filteredNodes} 
          edges={data.edges}
          onNodeSelect={setSelectedNode}
          selectedNode={selectedNode}
          filteredDomains={filteredDomains}
          timeRange={timeRange}
        />
      </div>
      <div className="h-40 md:h-64">
        <TimelineControl 
          nodes={data.nodes}
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />
      </div>
    </div>
  );
  
  const renderSidebar = () => (
    <div className="flex flex-col h-full space-y-4 overflow-y-auto">
      <SearchAndFilter 
        onSearch={handleSearch}
        onFilterDomains={handleFilterDomains}
        filteredDomains={filteredDomains}
      />
      
      {selectedNode ? (
        <NodeDetail 
          node={selectedNode} 
          onClose={() => setSelectedNode(null)}
          relatedNodes={getRelatedNodes()}
        />
      ) : (
        showContribution && (
          <UserContribution 
            onAddNode={handleAddNode}
            existingNodes={data.nodes}
            onClose={() => setShowContribution(false)}
          />
        )
      )}
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors duration-300`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-lg md:text-xl font-bold">TechKnowledge Graph</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setShowContribution(true)}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <CircleUser size={18} />
              Contribute
            </button>
            <a 
              href="#" 
              className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Github size={18} />
              GitHub
            </a>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-gray-700 dark:text-gray-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </svg>
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 px-4 space-y-2 animate-fadeIn">
            <button 
              onClick={() => {
                setShowContribution(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full py-2 text-left text-gray-700 dark:text-gray-300"
            >
              <CircleUser size={18} />
              Contribute
            </button>
            <a 
              href="#" 
              className="flex items-center gap-2 w-full py-2 text-left text-gray-700 dark:text-gray-300"
            >
              <Github size={18} />
              GitHub
            </a>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center gap-2 w-full py-2 text-left text-gray-700 dark:text-gray-300"
            >
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-xl font-bold mb-2">Technology Knowledge Graph</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Explore the relationships between technological concepts, innovations, and discoveries 
            through an interactive directed acyclic graph. See how technologies build upon each other
            and evolve over time.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-[600px] md:h-[800px]">
            {renderMainContent()}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-[600px] md:h-[800px] overflow-y-auto">
            {renderSidebar()}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-lg font-medium mb-3">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="font-medium mb-2">Node Status</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-gray-700 dark:bg-gray-300 rounded-full"></span>
                  <span className="text-sm">Historical</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-sm">Current</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-full border border-dashed border-blue-700"></span>
                  <span className="text-sm">Emerging</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-purple-500 rounded-full opacity-60"></span>
                  <span className="text-sm">Theoretical</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Domains</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span className="text-sm">Computing</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-purple-500 rounded-full"></span>
                  <span className="text-sm">Communication</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-sm">AI</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-sm">Energy</span>
                </li>
              </ul>
            </div>
            
            <div className="col-span-2 md:col-span-2">
              <h4 className="font-medium mb-2">Navigation Tips</h4>
              <ul className="space-y-1 text-sm">
                <li>• Click and drag to pan around the graph</li>
                <li>• Use the zoom controls or mouse wheel to zoom in/out</li>
                <li>• Click on nodes to view detailed information</li>
                <li>• Use the timeline to focus on specific time periods</li>
                <li>• Filter by domain to focus on specific technological areas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-8 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-bold">TechKnowledge Graph</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Mapping the evolution of technological development
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                <MapPin size={20} />
              </a>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            © 2025 TechKnowledge Graph. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;