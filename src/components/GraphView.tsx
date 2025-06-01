import React, { useEffect, useRef, useState, useMemo } from 'react';
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
<<<<<<< HEAD
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [nodeDragStart, setNodeDragStart] = useState({ x: 0, y: 0 });

   
=======
  
>>>>>>> 720175335e028d78b408dff49a27e6ca372fab83
  // Filter nodes based on domain and time range
  const filteredNodes = useMemo(() => {
  return nodes.filter(node => 
    (filteredDomains.length === 0 || filteredDomains.includes(node.domain)) &&
    node.year >= timeRange[0] && node.year <= timeRange[1]
  );
  }, [nodes, filteredDomains, timeRange]);
  
  // Only include edges where both source and target nodes are visible
  const filteredEdges = edges.filter(edge => {
    const sourceNode = filteredNodes.find(n => n.id === edge.source);
    const targetNode = filteredNodes.find(n => n.id === edge.target);
    return sourceNode && targetNode;
  });

<<<<<<< HEAD
  const nodeConnectionCounts = useMemo(() => {
  const counts: Record<string, number> = {};

  filteredEdges.forEach(edge => {
    counts[edge.source] = (counts[edge.source] || 0) + 1;
    counts[edge.target] = (counts[edge.target] || 0) + 1;
  });

  return counts;
  }, [filteredEdges]);

  const wrapText = (text: string, maxChars: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};


  // Node positioning - Simple force-based layout simulation
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number, y: number }>>({});

  useEffect(() => {
    const width = svgRef.current?.clientWidth ?? window.innerWidth;
    const height = svgRef.current?.clientHeight ?? window.innerHeight;

    const positions: Record<string, { x: number, y: number }> = {};
    const timeSpan = timeRange[1] - timeRange[0];
    const domainCount = Object.keys(TechnologyDomain).length;

    const nodeRadius = 40; // Base radius
    const verticalPadding = 10;

    // Step 1: Initial layout
    filteredNodes.forEach(node => {
      const timePosition = (node.year - timeRange[0]) / timeSpan;
      const domainIndex = Object.values(TechnologyDomain).indexOf(node.domain);

      positions[node.id] = {
        x: 100 + timePosition * (width - 300),
        y: 100 + (domainIndex / domainCount) * (height - 300)
=======
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
>>>>>>> 720175335e028d78b408dff49a27e6ca372fab83
      };
    });

    // Step 2: Simple vertical collision avoidance
    const placed: { id: string, x: number, y: number }[] = [];
    filteredNodes.forEach(node => {
      let { x, y } = positions[node.id];
      let tries = 0;
      const radius = nodeRadius + Math.min(15, (nodeConnectionCounts[node.id] || 0) * 5);

      // Try shifting down if overlapping with any previously placed node
      while (
        placed.some(p => {
          const dx = x - p.x;
          const dy = y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const otherRadius = nodeRadius + Math.min(15, (nodeConnectionCounts[p.id] || 0) * 5);
          return distance < radius + otherRadius + verticalPadding;
        }) && tries < 20
      ) {
        y += radius + verticalPadding;
        tries++;
      }

      positions[node.id] = { x, y };
      placed.push({ id: node.id, x, y });
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
    if (isDragging && !isDraggingNode) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setTransform(prev => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isDraggingNode && draggedNodeId) {
      // Handle node dragging
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const dx = (e.clientX - nodeDragStart.x) / transform.scale;
        const dy = (e.clientY - nodeDragStart.y) / transform.scale;
        
        setNodePositions(prev => ({
          ...prev,
          [draggedNodeId]: {
            x: prev[draggedNodeId].x + dx,
            y: prev[draggedNodeId].y + dy
          }
        }));
        
        setNodeDragStart({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsDraggingNode(false);
    setDraggedNodeId(null);
  };

  // Node-specific drag handlers
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation(); // Prevent canvas drag
    if (e.button === 0) { // Left click only
      setIsDraggingNode(true);
      setDraggedNodeId(nodeId);
      setNodeDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleNodeClick = (node: Node, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDraggingNode) { // Only select if we weren't dragging
      onNodeSelect(node);
    }
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
        
        <g>
          {/* Render edges */}
          {filteredEdges.map(edge => {
            const source = nodePositions[edge.source];
            const target = nodePositions[edge.target];
            
            if (!source || !target) return null;

            const isHighlighted = hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode);
            
            const isHighlighted = hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode);
            
            return (
              <line
                key={`${edge.source}-${edge.target}`}
<<<<<<< HEAD
                x1={source.x * transform.scale + transform.x}
                y1={source.y * transform.scale + transform.y}
                x2={target.x * transform.scale + transform.x}
                y2={target.y * transform.scale + transform.y}
                stroke={isHighlighted ? "rgba(59, 130, 246, 0.5)" : "rgba(0, 0, 0, 0.2)"}
                strokeWidth={isHighlighted ? 3 : 1}
=======
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isHighlighted ? "url(#edgeGradient)" : "rgba(59, 130, 246, 0.4)"}
                strokeWidth={isHighlighted ? 4 : 3}
>>>>>>> 720175335e028d78b408dff49a27e6ca372fab83
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
<<<<<<< HEAD
            const isBeingDragged = draggedNodeId == node.id;
            const scaledX = position.x * transform.scale + transform.x;
            const scaledY = position.y * transform.scale + transform.y;
=======
            const baseRadius = 40; // Increased base radius
>>>>>>> 720175335e028d78b408dff49a27e6ca372fab83
            
            return (
              <g 
                key={node.id}
<<<<<<< HEAD
                transform={`translate(${scaledX}, ${scaledY})`}
                onClick={(e) => handleNodeClick(node, e)}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className={`${isBeingDragged ? 'cursor-grabbing': 'cursor-grab'}`}
                style={{ pointerEvents: 'all' }}
=======
                transform={`translate(${position.x}, ${position.y})`}
                onClick={() => onNodeSelect(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
>>>>>>> 720175335e028d78b408dff49a27e6ca372fab83
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
<<<<<<< HEAD
                  r={isSelected || isHovered ? 60 + Math.min(15, (nodeConnectionCounts[node.id] || 0) * 5) : 40 + Math.min(15, (nodeConnectionCounts[node.id] || 0) * 5)}
                  fill={color}
                  fillOpacity={nodeStyle.opacity}
                  stroke={isSelected || isHovered ? "#000" : color}
                  strokeWidth={isSelected || isHovered ? 3 : nodeStyle.strokeWidth}
=======
                  r={isSelected || isHovered ? baseRadius + 6 : baseRadius}
                  fill={color}
                  fillOpacity={nodeStyle.opacity}
                  stroke={isSelected || isHovered ? "#000" : color}
                  strokeWidth={nodeStyle.strokeWidth}
>>>>>>> 720175335e028d78b408dff49a27e6ca372fab83
                  strokeDasharray={nodeStyle.strokeDasharray}
                  className="transition-all duration-300"
                />
                
                {/* Node label */}
                <text
<<<<<<< HEAD
                textAnchor="middle"
                fill="#fff"
                fontSize={isSelected || isHovered ? "12px" : "10px"}
                fontWeight={isSelected || isHovered ? "bold" : "normal"}
                pointerEvents="none"
                className="transition-all duration-300"
                >
                  {wrapText(node.label, 12).map((line, index) => (
                    <tspan x="0" dy={index === 0 ? "0.35em" : "1.2em"} key={index}>{line}
                    </tspan>
                  ))}
                  </text>

=======
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
>>>>>>> 720175335e028d78b408dff49a27e6ca372fab83
                <text
                  textAnchor="middle"
                  dy="20"
                  fontSize="14px"
                  fill="#fff"
                  opacity="0.9"
                  pointerEvents="none"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                >
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
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mt-2"
          onClick={() => {
            if (svgRef.current?.requestFullscreen) {
              svgRef.current.requestFullscreen();
            } else if ((svgRef.current as any)?.webkitRequestFullscreen) {
              // Safari support
              (svgRef.current as any).webkitRequestFullscreen();
            } else if ((svgRef.current as any)?.msRequestFullscreen) {
              // IE11 support
              (svgRef.current as any).msRequestFullscreen();
          }
          }}
          >
            ⛶
          </button>
      </div>
    </div>
  );
};

export default GraphView;