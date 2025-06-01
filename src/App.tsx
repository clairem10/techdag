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
  const [showSidebar, setShowSidebar] = useState(true);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleFilterDomains = (domains: TechnologyDomain[]) => {
    setFilteredDomains(domains);
  };
  
  const handleTimeRangeChange = (range: [number, number]) => {
    setTimeRange(range);
  };
  
  const getRelatedNodes = (): Node[] => {
    if (!selectedNode) return [];
    
    const relatedNodeIds = data.edges
      .filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id)
      .map(edge => edge.source === selectedNode.id ? edge.target : edge.source);
    
    return data.nodes.filter(node => relatedNodeIds.includes(node.id));
  };
  
  const handleAddNode = (newNodeData: Omit<Node, 'id'>) => {
    const newId = `${newNodeData.label.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
    const newNode: Node = {
      ...newNodeData,
      id: newId
    };
    
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
    
    setSelectedNode(newNode);
  };
  
  const filteredNodes = searchQuery
    ? data.nodes.filter(node => 
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : data.nodes;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md fixed top-0 left-0 right-0 z-50">
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
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {showSidebar ? '→' : '←'}
            </button>
          </div>
          
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
        
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 px-4 space-y-2">
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
      <div className="flex h-screen pt-16">
        {/* Main graph area */}
        <div className="flex-grow h-full relative">
          <div className="absolute inset-0">
            <GraphView 
              nodes={filteredNodes} 
              edges={data.edges}
              onNodeSelect={setSelectedNode}
              selectedNode={selectedNode}
              filteredDomains={filteredDomains}
              timeRange={timeRange}
            />
          </div>
          
          {/* Timeline control at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 backdrop-blur">
            <TimelineControl 
              nodes={data.nodes}
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
            />
          </div>
        </div>
        
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-96 h-full bg-white dark:bg-gray-800 shadow-lg overflow-y-auto flex flex-col">
            <div className="p-4">
              <SearchAndFilter 
                onSearch={handleSearch}
                onFilterDomains={handleFilterDomains}
                filteredDomains={filteredDomains}
              />
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto">
              {selectedNode ? (
                <NodeDetail 
                  node={selectedNode} 
                  onClose={() => setSelectedNode(null)}
                  relatedNodes={getRelatedNodes()}
                />
              ) : showContribution ? (
                <UserContribution 
                  onAddNode={handleAddNode}
                  existingNodes={data.nodes}
                  onClose={() => setShowContribution(false)}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;