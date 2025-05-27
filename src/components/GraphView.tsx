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
    
    // Create a larger virtual canvas
    const virtualWidth = Math.max(window.innerWidth * 3, 3000);
    const virtualHeight = Math.max(window.innerHeight * 3, 2000);
    const padding = 200;
    
    filteredNodes.forEach(node => {
      const timePosition = (node.year - timeRange[0]) / timeSpan;
      const domainIndex = Object.values(TechnologyDomain).indexOf(node.domain);
      
      // Add some controlled randomness to prevent exact alignment
      const randomOffset = {
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 100
      };
      
      positions[node.id] = {
        x: padding + timePosition * (virtualWidth - padding * 2) + randomOffset.x,
        y: padding + (domainIndex / (domainCount - 1)) * (virtualHeight - padding * 2) + randomOffset.y
      };
    });
    
    setNodePositions(positions);
    
    // Reset transform to show the center of the virtual canvas
    setTransform({
      x: (window.innerWidth - virtualWidth) / 2,
      y: (window.innerHeight - virtualHeight) / 2,
      scale: 0.5
    });
  }, [filteredNodes, timeRange]);

  // Handle zoom with improved scaling
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAmount = e.deltaY < 0 ? 1.2 : 0.8;
    const pointer = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y
    };
    
    const newScale = Math.max(0.2, Math.min(2, transform.scale * scaleAmount));
    const scaleRatio = newScale / transform.scale;
    
    setTransform(prev => ({
      scale: newScale,
      x: e.clientX - pointer.x * scaleRatio,
      y: e.clientY - pointer.y * scaleRatio
    }));
  };

  // Handle drag with improved smoothness
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
        return { opacity: 0.9, strokeWidth: 3 };
      case NodeStatus.CURRENT:
        return { opacity: 1, strokeWidth: 4 };
      case NodeStatus.EMERGING:
        return { opacity: 0.8, strokeWidth: 3, strokeDasharray: '8' };
      case NodeStatus.THEORETICAL:
        return { opacity: 0.7, strokeWidth: 3, strokeDasharray: '10' };
      default:
        return { opacity: 1, strokeWidth: 3 };
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
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0, 0, 0, 0.05)" strokeWidth="0.5" />
          </pattern>
          
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
          </linearGradient>
          
          <marker
            id="arrowhead"
            markerWidth="16"
            markerHeight="12"
            refX="12"
            refY="6"
            orient="auto"
          >
            <path d="M0,0 L16,6 L0,12" fill="rgba(59, 130, 246, 0.8)" />
          </marker>
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
                stroke={isHighlighted ? "url(#edgeGradient)" : "rgba(59, 130, 246, 0.4)"}
                strokeWidth={isHighlighted ? 4 : 3}
                className="transition-all duration-300"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          
          {/* Render nodes */}
          {filteredNodes.map(node => {
            const position = nodePositions[node.id];
            if (!position) return null;
            
            const color = getDomainColor(node.domain);
            const nodeStyle = getNodeStyle(node.status);
            const isSelected = selectedNode?.id === node.id;
            const isHovered = hoveredNode === node.id;
            const baseRadius = 40; // Increased base radius
            
            return (
              <g 
                key={node.id}
                transform={`translate(${position.x}, ${position.y})`}
                onClick={() => onNodeSelect(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                {/* Node background glow */}
                {(isSelected || isHovered) && (
                  <circle
                    r={baseRadius + 12}
                    fill={color}
                    opacity={0.2}
                    className="transition-all duration-300"
                  />
                )}
                
                {/* Main node circle */}
                <circle
                  r={isSelected || isHovered ? baseRadius + 6 : baseRadius}
                  fill={color}
                  fillOpacity={nodeStyle.opacity}
                  stroke={isSelected || isHovered ? "#000" : color}
                  strokeWidth={nodeStyle.strokeWidth}
                  strokeDasharray={nodeStyle.strokeDasharray}
                  className="transition-all duration-300"
                />
                
                {/* Node label */}
                <text
                  textAnchor="middle"
                  dy="-4"
                  fill="#fff"
                  fontSize={isSelected || isHovered ? "18px" : "16px"}
                  fontWeight={isSelected || isHovered ? "bold" : "normal"}
                  pointerEvents="none"
                  className="transition-all duration-300"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                >
                  {node.label.length > 20 ? `${node.label.substring(0, 17)}...` : node.label}
                </text>
                
                {/* Year label */}
                <text
                  textAnchor="middle"
                  dy="20"
                  fontSize="14px"
                  fill="#fff"
                  opacity="0.9"
                  pointerEvents="none"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
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
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xl font-bold"
          onClick={() => setTransform(prev => ({ ...prev, scale: prev.scale * 1.2 }))}
        >
          +
        </button>
        <button 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xl font-bold"
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(0.2, prev.scale / 1.2) }))}
        >
          -
        </button>
        <button 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mt-2 text-sm"
          onClick={() => setTransform({ x: 0, y: 0, scale: 0.5 })}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default GraphView;