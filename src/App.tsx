import { useState, useEffect } from 'react';
import { Node, TechnologyDomain, GraphData } from './types';
import { graphData } from './data/initialData';
import GraphView from './components/GraphView';
import TimelineControl from './components/TimelineControl';
import SearchAndFilter from './components/SearchAndFilter';
import NodeDetail from './components/NodeDetail';
import UserContribution from './components/UserContribution';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginModal from './components/auth/LoginModal';
import AuthButton from './components/auth/AuthButton';
import { Database, CircleUser, Github, MapPin, Moon, Sun, LogOut } from 'lucide-react';
import { auth } from './config/firebase';

function AppContent() {
    let authContextValue;
  try {
    authContextValue = useAuth();
    console.log('useAuth() returned:', authContextValue);
  } catch (error) {
    console.error('Error calling useAuth():', error);
    authContextValue = { currentUser: null };
  }

  const handleLogout = async () => {
  try {
    // Call the logout function from your AuthContext (which uses Firebase signOut)
    await logout();
    
    // Reset relevant state after successful logout
    setShowContribution(false);
    setSelectedNode(null);
    setShowLogin(false);
    
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Error logging out:', error);
    // Optionally show an error message to the user
  }
};

  const [data, setData] = useState<GraphData>(graphData);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filteredDomains, setFilteredDomains] = useState<TechnologyDomain[]>([]);
  const [timeRange, setTimeRange] = useState<[number, number]>([1940, 2050]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContribution, setShowContribution] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const { currentUser, logout } = useAuth();

  useEffect(() => {
    console.log('Auth state changed:', { currentUser, showLogin, showContribution });
  }, [currentUser, showLogin, showContribution]);

  // Handle login success - watch for currentUser changes
  useEffect(() => {
    if (currentUser && showLogin) {
      // User just logged in
      setShowLogin(false);
      setShowContribution(true);
      setSelectedNode(null);
    }
  }, [currentUser, showLogin]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleContributionAction = () => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }

    setShowContribution(true);
    setSelectedNode(null);
  }
  
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
  
  // Handle updating an existing node
  const handleUpdateNode = (updatedNode: Node) => {
    setData(prevData => {
      // Update the node in the nodes array
      const updatedNodes = prevData.nodes.map(node => 
        node.id === updatedNode.id ? updatedNode : node
      );
      
      // Handle link changes - remove old edges and add new ones
      const oldNode = prevData.nodes.find(node => node.id === updatedNode.id);
      const oldLinks = oldNode?.links || [];
      const newLinks = updatedNode.links || [];
      
      // Remove edges that are no longer linked
      let updatedEdges = prevData.edges.filter(edge => {
        // Keep edges that don't involve this node
        if (edge.source !== updatedNode.id && edge.target !== updatedNode.id) {
          return true;
        }
        // For edges involving this node, only keep if the link still exists
        const otherNodeId = edge.source === updatedNode.id ? edge.target : edge.source;
        return newLinks.includes(otherNodeId);
      });
      
      // Add new edges for new links
      newLinks.forEach(linkedNodeId => {
        const edgeExists = updatedEdges.some(edge => 
          (edge.source === updatedNode.id && edge.target === linkedNodeId) ||
          (edge.source === linkedNodeId && edge.target === updatedNode.id)
        );
        
        if (!edgeExists) {
          updatedEdges.push({
            source: updatedNode.id,
            target: linkedNodeId
          });
        }
      });
      
      return {
        nodes: updatedNodes,
        edges: updatedEdges
      };
    });
    
    // Update the selected node to reflect the changes
    setSelectedNode(updatedNode);
  };
  
  // Handle deleting a node
  const handleDeleteNode = (nodeId: string) => {
    setData(prevData => {
      // Remove the node from the nodes array
      const updatedNodes = prevData.nodes.filter(node => node.id !== nodeId);
      
      // Remove all edges connected to this node
      const updatedEdges = prevData.edges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      );
      
      return {
        nodes: updatedNodes,
        edges: updatedEdges
      };
    });
    
    // Clear the selected node if it was the one being deleted
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
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
          source: newId,
          target: targetId
        });
      });
    }
    
    setData({
      nodes: [...data.nodes, newNode],
      edges: newEdges
    });
    
    // Select the newly added node
    setSelectedNode(newNode);
    setShowContribution(false); // Close the contribution form
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
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode} // Add the delete handler
          existingNodes={data.nodes}
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
      
      {/* Add Node Button when no node is selected and contribution form is not shown */}
      {!selectedNode && !showContribution && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
          <p className="mb-4 text-center">Select a node to view details or contribute new knowledge</p>
          <button
            onClick={handleContributionAction}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Technology
          </button>
        </div>
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
              onClick={handleContributionAction}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <CircleUser size={18} />
              Contribute
            </button>
            <button
              onClick={() => window.open('https://github.com/clairem10/techdag#')} 
              className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Github size={18} />
              GitHub
            </button>
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              title={isDarkMode ? 'Switch to light mode': 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              {isDarkMode ? 'Light Mode': 'Dark Mode'}
            </button>

            {currentUser && (
              <button 
              onClick={handleLogout}
              className='flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray 300 hover:text-red-600 dark:hover:text-red-400'
              title="Logout"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
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
                handleContributionAction();
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
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {showSidebar ? '→' : '←'}
            </button>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <div className="w-full px-2 sm:px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-[600px] md:h-[800px]">
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
                <li>• Edit nodes by clicking the edit button in node details</li>
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

      {/* Login Modal */}
      {showLogin && (
        <LoginModal 
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          setShowLogin(false);
          setShowContribution(true);
          setSelectedNode(null);
      }}
      />
      )}
    </div>
  );
}

// Main App component with AuthProvider wrapper
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;