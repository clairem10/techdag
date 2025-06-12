import React, { useState } from 'react';
import { Node, NodeStatus, TechnologyDomain } from '../types';
import { X, Edit2, Save, Trash2 } from 'lucide-react';

interface NodeDetailProps {
  node: Node | null;
  onClose: () => void;
  relatedNodes: Node[];
  onUpdateNode: (updatedNode: Node) => void;
  onDeleteNode: (nodeId: string) => void; // New prop for deleting nodes
  existingNodes: Node[];
}

const NodeDetail: React.FC<NodeDetailProps> = ({ 
  node, 
  onClose, 
  relatedNodes, 
  onUpdateNode,
  onDeleteNode,
  existingNodes 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Node | null>(null);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!node) return null;

  // Initialize edit mode
  const handleStartEdit = () => {
    setEditData({ ...node });
    setSelectedLinks(node.links || []);
    setIsEditing(true);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
    setSelectedLinks([]);
    setErrors({});
  };

  // Handle input changes during editing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editData) return;
    
    const { name, value } = e.target;
    setEditData(prev => prev ? { ...prev, [name]: value } : null);
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle year change
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editData) return;
    const yearValue = parseInt(e.target.value);
    setEditData(prev => prev ? { ...prev, year: yearValue } : null);
  };

  // Handle node link selection
  const handleNodeSelect = (nodeId: string) => {
    setSelectedLinks(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId) 
        : [...prev, nodeId]
    );
  };

  // Validate form
  const validateForm = () => {
    if (!editData) return false;
    
    const newErrors: Record<string, string> = {};
    
    if (!editData.label.trim()) {
      newErrors.label = 'Name is required';
    }
    
    if (!editData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save changes
  const handleSave = () => {
    if (!editData || !validateForm()) return;
    
    const updatedNode: Node = {
      ...editData,
      links: selectedLinks
    };
    
    onUpdateNode(updatedNode);
    setIsEditing(false);
    setEditData(null);
    setSelectedLinks([]);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    onDeleteNode(node.id);
    setShowDeleteConfirm(false);
  };

  // Filter nodes for linking (exclude current node)
  const filteredNodes = existingNodes.filter(n => 
    n.id !== node.id &&
    (n.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
     n.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Helper function to get status badge style
  const getStatusBadge = (status: NodeStatus) => {
    switch (status) {
      case NodeStatus.HISTORICAL:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case NodeStatus.CURRENT:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case NodeStatus.EMERGING:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case NodeStatus.THEORETICAL:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Helper function to get domain badge style
  const getDomainBadge = (domain: TechnologyDomain) => {
    const styles: Record<TechnologyDomain, string> = {
      [TechnologyDomain.COMPUTING]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      [TechnologyDomain.ENERGY]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      [TechnologyDomain.TRANSPORTATION]: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      [TechnologyDomain.MEDICINE]: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      [TechnologyDomain.COMMUNICATION]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      [TechnologyDomain.MATERIALS]: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      [TechnologyDomain.AI]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      [TechnologyDomain.SPACE]: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
      [TechnologyDomain.MATHEMATICS]: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    };
    return styles[domain];
  };

  const currentData = editData || node;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-fadeIn">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        {isEditing ? (
          <input
            type="text"
            name="label"
            value={currentData.label}
            onChange={handleInputChange}
            className={`text-xl font-bold bg-transparent border-b-2 ${
              errors.label 
                ? 'border-red-500' 
                : 'border-gray-300 dark:border-gray-600'
            } focus:outline-none focus:border-blue-500`}
          />
        ) : (
          <h2 className="text-xl font-bold">{node.label}</h2>
        )}
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave}
                className="p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-800 text-green-600 transition-colors"
                title="Save changes"
              >
                <Save size={20} />
              </button>
              <button 
                onClick={handleCancelEdit}
                className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-800 text-red-600 transition-colors"
                title="Cancel editing"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleStartEdit}
                className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-600 transition-colors"
                title="Edit node"
              >
                <Edit2 size={20} />
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-800 text-red-600 transition-colors"
                title="Delete node"
              >
                <Trash2 size={20} />
              </button>
            </>
          )}
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Delete Technology</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete "{node.label}"? This action cannot be undone and will remove all connections to this technology.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4">
        {/* Badges/Selectors */}
        <div className="flex flex-wrap gap-2 mb-4">
          {isEditing ? (
            <>
              <select
                name="status"
                value={currentData.status}
                onChange={handleInputChange}
                className="px-2 py-1 rounded-full text-xs font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              >
                {Object.values(NodeStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <select
                name="domain"
                value={currentData.domain}
                onChange={handleInputChange}
                className="px-2 py-1 rounded-full text-xs font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              >
                {Object.values(TechnologyDomain).map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
              <input
                type="number"
                name="year"
                value={currentData.year}
                onChange={handleYearChange}
                min="1800"
                max="2100"
                className="px-2 py-1 rounded-full text-xs font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 w-20"
              />
            </>
          ) : (
            <>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(node.status)}`}>
                {node.status}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDomainBadge(node.domain)}`}>
                {node.domain}
              </span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium">
                {node.year}
              </span>
            </>
          )}
        </div>
        
        {/* Description */}
        {isEditing ? (
          <textarea
            name="description"
            value={currentData.description}
            onChange={handleInputChange}
            rows={4}
            className={`w-full p-2 rounded-md border ${
              errors.description 
                ? 'border-red-500' 
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6`}
          />
        ) : (
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {node.description}
          </p>
        )}

        {/* Error messages */}
        {Object.entries(errors).map(([field, error]) => (
          <p key={field} className="text-xs text-red-500 mb-2">{error}</p>
        ))}
        
        {/* Related nodes section */}
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Related Technologies</h3>
          
          {/* Edit mode: Link selection */}
          {isEditing && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search for technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 mb-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {selectedLinks.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium mb-1">Selected ({selectedLinks.length}):</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedLinks.map(nodeId => {
                      const linkedNode = existingNodes.find(n => n.id === nodeId);
                      return linkedNode ? (
                        <span 
                          key={nodeId}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs flex items-center gap-1"
                        >
                          {linkedNode.label}
                          <button 
                            type="button"
                            onClick={() => handleNodeSelect(nodeId)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              
              <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
                {filteredNodes.length > 0 ? (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredNodes.map(n => (
                      <li 
                        key={n.id}
                        className={`p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          selectedLinks.includes(n.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => handleNodeSelect(n.id)}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">{n.label}</span>
                          <span className="text-sm text-gray-500">{n.year}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{n.description}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-3 text-sm text-gray-500 dark:text-gray-400">
                    No technologies found matching your search.
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Display mode: Show related nodes */}
          {!isEditing && (
            relatedNodes.length > 0 ? (
              <div className="space-y-3">
                {relatedNodes.map(relNode => (
                  <div key={relNode.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{relNode.label}</h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{relNode.year}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{relNode.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">No related technologies found.</p>
            )
          )}
        </div>
        
        {/* Additional information for future/theoretical nodes */}
        {!isEditing && node.status === NodeStatus.THEORETICAL && (
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-purple-700 dark:text-purple-300">Future Implications</h3>
            <p className="text-gray-700 dark:text-gray-300">
              This is a theoretical technology that has not yet been fully realized. The estimated timeline 
              and capabilities are based on current development trajectories and expert predictions.
            </p>
          </div>
        )}
        
        {/* Sources and references placeholder */}
        {!isEditing && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Sources & References</h3>
            <ul className="list-disc list-inside text-blue-600 dark:text-blue-400">
              <li><a href="#" className="hover:underline">Wikipedia</a></li>
              <li><a href="#" className="hover:underline">Academic Papers</a></li>
              <li><a href="#" className="hover:underline">Historical Archives</a></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeDetail;