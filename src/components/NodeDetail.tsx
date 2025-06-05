import React from 'react';
import { Node, NodeStatus, TechnologyDomain } from '../types';
import { X } from 'lucide-react';

interface NodeDetailProps {
  node: Node | null;
  onClose: () => void;
  relatedNodes: Node[];
}

const NodeDetail: React.FC<NodeDetailProps> = ({ node, onClose, relatedNodes }) => {
  if (!node) return null;
  
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-fadeIn">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold">{node.label}</h2>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(node.status)}`}>
            {node.status}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDomainBadge(node.domain)}`}>
            {node.domain}
          </span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium">
            {node.year}
          </span>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {node.description}
        </p>
        
        {/* Related nodes section */}
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Related Technologies</h3>
          
          {relatedNodes.length > 0 ? (
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
          )}
        </div>
        
        {/* Additional information for future/theoretical nodes */}
        {node.status === NodeStatus.THEORETICAL && (
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-purple-700 dark:text-purple-300">Future Implications</h3>
            <p className="text-gray-700 dark:text-gray-300">
              This is a theoretical technology that has not yet been fully realized. The estimated timeline 
              and capabilities are based on current development trajectories and expert predictions.
            </p>
          </div>
        )}
        
        {/* Sources and references placeholder */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Sources & References</h3>
          <ul className="list-disc list-inside text-blue-600 dark:text-blue-400">
            <li><a href="#" className="hover:underline">Wikipedia</a></li>
            <li><a href="#" className="hover:underline">Academic Papers</a></li>
            <li><a href="#" className="hover:underline">Historical Archives</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NodeDetail;