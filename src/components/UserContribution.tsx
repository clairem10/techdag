import React, { useState } from 'react';
import { TechnologyDomain, NodeStatus, Node } from '../types';
import { PlusCircle, X } from 'lucide-react';

interface UserContributionProps {
  onAddNode: (node: Omit<Node, 'id'>) => void;
  existingNodes: Node[];
  onClose: () => void;
}

const UserContribution: React.FC<UserContributionProps> = ({ 
  onAddNode, 
  existingNodes,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    year: new Date().getFullYear(),
    domain: TechnologyDomain.COMPUTING,
    status: NodeStatus.CURRENT,
    links: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const yearValue = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, year: yearValue }));
  };
  
  const handleNodeSelect = (nodeId: string) => {
    setSelectedLinks(prev => 
      prev.includes(nodeId) 
        ? prev.filter(id => id !== nodeId) 
        : [...prev, nodeId]
    );
  };
  
  const filteredNodes = existingNodes.filter(node => 
    node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.label.trim()) {
      newErrors.label = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (isNaN(formData.year) || formData.year < 1800 || formData.year > 2100) {
      newErrors.year = 'Year must be between 1800 and 2100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddNode({
        ...formData,
        links: selectedLinks
      });
      
      // Reset form after submission
      setFormData({
        label: '',
        description: '',
        year: new Date().getFullYear(),
        domain: TechnologyDomain.COMPUTING,
        status: NodeStatus.CURRENT,
        links: []
      });
      setSelectedLinks([]);
      setIsOpen(false);
      onClose();
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div 
        className="p-4 cursor-pointer flex justify-between items-center"
        onClick={toggleOpen}
      >
        <div className="flex items-center gap-2">
          <PlusCircle size={20} className="text-blue-500" />
          <h3 className="text-lg font-medium">Suggest New Technology</h3>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      
      {isOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name input */}
              <div>
                <label htmlFor="label" className="block text-sm font-medium mb-1">
                  Technology Name
                </label>
                <input
                  type="text"
                  id="label"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-md border ${
                    errors.label 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g., Quantum Neural Networks"
                />
                {errors.label && (
                  <p className="mt-1 text-xs text-red-500">{errors.label}</p>
                )}
              </div>
              
              {/* Description input */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-md border ${
                    errors.description 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Describe this technology and its significance..."
                ></textarea>
                {errors.description && (
                  <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                )}
              </div>
              
              {/* Year input */}
              <div>
                <label htmlFor="year" className="block text-sm font-medium mb-1">
                  Year
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleYearChange}
                  min="1800"
                  max="2100"
                  className={`w-full px-3 py-2 rounded-md border ${
                    errors.year 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.year && (
                  <p className="mt-1 text-xs text-red-500">{errors.year}</p>
                )}
              </div>
              
              {/* Domain select */}
              <div>
                <label htmlFor="domain" className="block text-sm font-medium mb-1">
                  Domain
                </label>
                <select
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(TechnologyDomain).map(domain => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Status select */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(NodeStatus).map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Dependencies/Links */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Related Technologies (Dependencies)
                </label>
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
                        const node = existingNodes.find(n => n.id === nodeId);
                        return node ? (
                          <span 
                            key={nodeId}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs flex items-center gap-1"
                          >
                            {node.label}
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
                      {filteredNodes.map(node => (
                        <li 
                          key={node.id}
                          className={`p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                            selectedLinks.includes(node.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                          onClick={() => handleNodeSelect(node.id)}
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">{node.label}</span>
                            <span className="text-sm text-gray-500">{node.year}</span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{node.description}</p>
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
              
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserContribution;