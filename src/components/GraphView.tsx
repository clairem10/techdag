import React, { useEffect, useRef, useState } from 'react';
import { Node, Edge, TechnologyDomain, NodeStatus } from '../types';

interface GraphViewProps {
  nodes: Node[];
  edges: Edge[];
  onNodeSelect: (node: Node) => void;
  selectedNode: Node | null;
  filteredDomains: TechnologyDomain[];
  timeRange: [number, number];
}

const GraphView: React.FC<GraphViewProps> = ({ 
  nodes, 
  edges, 
  onNodeSelect, 
  selectedNode,
  filteredDomains,
  timeRange
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  // Filter nodes based on domain and time range
  const filteredNodes = nodes.filter(node => 
    (filteredDomains.length === 0 || filteredDomains.includes(node.domain)) &&
    node.year >= timeRange[0] && node.year <= timeRange[1]
  );
  
  // Only include edges where both source and target nodes are visible
  const filteredEdges = edges.filter(edge => {
    const sourceNode = filteredNodes.find(n => n.id === edge.source);
    const targetNode = filteredNodes.find(n => n.id === edge.target);
    return sourceNode && targetNode;
  });

  // Calculate static node positions based on time and domain
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number, y: number }>>({});

  useEffect(() => {
    const positions: Record<string, { x: number, y: number }> = {};
    const timeSpan = timeRange[1] - timeRange[0];
    const domainCount = Object.keys(TechnologyDomain).length;
    const baseSpacing = 200; // Increased spacing between nodes
    
    filteredNodes.forEach(node => {
      const timePosition = (node.year - timeRange[0]) / timeSpan;
      const domainIndex = Object.values(TechnologyDomain).indexOf(node.domain);
      
      // Calculate position with fixed offsets
      positions[node.id] = {
        x: 100 + timePosition * (window.innerWidth - 300), // Adjust for screen width
        y: 100 + (domainIndex / domainCount) * (window.innerHeight - 300) // Adjust for screen height
      };
    });
    
    setNodePositions(positions);
  }, [filteredNodes, timeRange]);

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAmount = e.deltaY < 0 ? 1.1 : 0.9;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(3, prev.scale * scaleAmount))
    }));
  };

  // Handle drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setTransform(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Get color based on domain
  const getDomainColor = (domain: TechnologyDomain) => {
    const colors: Record<TechnologyDomain, string> = {
      [TechnologyDomain.COMPUTING]: '#3B82F6',
      [TechnologyDomain.ENERGY]: '#10B981',
      [TechnologyDomain.TRANSPORTATION]: '#F59E0B',
      [TechnologyDomain.MEDICINE]: '#EC4899',
      [TechnologyDomain.COMMUNICATION]: '#8B5CF6',
      [TechnologyDomain.MATERIALS]: '#6366F1',
      [TechnologyDomain.AI]: '#EF4444',
      [TechnologyDomain.SPACE]: '#0EA5E9'
    };
    return colors[domain];
  };

  // Get node style based on status
  const getNodeStyle = (status: NodeStatus) => {
    switch (status) {
      case NodeStatus.HISTORICAL:
        return { opacity: 0.9, strokeWidth: 1 };
      case NodeStatus.CURRENT:
        return { opacity: 1, strokeWidth: 2 };
      case NodeStatus.EMERGING:
        return { opacity: 0.8, strokeWidth: 1, strokeDasharray: '3' };
      case NodeStatus.THEORETICAL:
        return { opacity: 0.6, strokeWidth: 1, strokeDasharray: '5' };
      default:
        return { opacity: 1, strokeWidth: 1 };
    }
  };

  return (
    <div className="w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900 relative">
      <svg
        ref={svgRef}
        className="w-full h-full cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 0, 0, 0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* Render edges */}
          {filteredEdges.map(edge => {
            const source = nodePositions[edge.source];
            const target = nodePositions[edge.target];
            
            if (!source || !target) return null;
            
            const isHighlighted = hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode);
            
            return (
              <line
                key={`${edge.source}-${edge.target}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isHighlighted ? "rgba(59, 130, 246, 0.5)" : "rgba(0, 0, 0, 0.2)"}
                strokeWidth={isHighlighted ? 2 : 1}
                className="transition-all duration-300"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          
          {/* Arrow marker for edges */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="rgba(0, 0, 0, 0.2)" />
            </marker>
          </defs>
          
          {/* Render nodes */}
          {filteredNodes.map(node => {
            const position = nodePositions[node.id];
            if (!position) return null;
            
            const color = getDomainColor(node.domain);
            const nodeStyle = getNodeStyle(node.status);
            const isSelected = selectedNode?.id === node.id;
            const isHovered = hoveredNode === node.id;
            
            return (
              <g 
                key={node.id}
                transform={`translate(${position.x}, ${position.y})`}
                onClick={() => onNodeSelect(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <circle
                  r={isSelected || isHovered ? 25 : 20}
                  fill={color}
                  fillOpacity={nodeStyle.opacity}
                  stroke={isSelected || isHovered ? "#000" : color}
                  strokeWidth={isSelected || isHovered ? 3 : nodeStyle.strokeWidth}
                  strokeDasharray={nodeStyle.strokeDasharray}
                  className="transition-all duration-300"
                />
                <text
                  textAnchor="middle"
                  dy="5"
                  fill="#fff"
                  fontSize={isSelected || isHovered ? "12px" : "10px"}
                  fontWeight={isSelected || isHovered ? "bold" : "normal"}
                  pointerEvents="none"
                  className="transition-all duration-300"
                >
                  {node.label.length > 15 ? `${node.label.substring(0, 12)}...` : node.label}
                </text>
                <text
                  textAnchor="middle"
                  dy="20"
                  fontSize="9px"
                  fill="#fff"
                  opacity="0.8"
                  pointerEvents="none"
                >
                  {node.year}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 flex flex-col">
        <button 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          onClick={() => setTransform(prev => ({ ...prev, scale: prev.scale * 1.2 }))}
        >
          +
        </button>
        <button 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(0.5, prev.scale / 1.2) }))}
        >
          -
        </button>
        <button 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mt-2"
          onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default GraphView;