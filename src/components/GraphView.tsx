import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Node, Edge, TechnologyDomain, NodeStatus } from '../types';
import { Graphviz } from '@hpcc-js/wasm';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [graphvizSvg, setGraphvizSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Filter nodes based on domain and time range
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => 
      (filteredDomains.length === 0 || filteredDomains.includes(node.domain)) &&
      node.year >= timeRange[0] && node.year <= timeRange[1]
    );
  }, [nodes, filteredDomains, timeRange]);
  
  // Only include edges where both source and target nodes are visible
  const filteredEdges = useMemo(() => {
    return edges.filter(edge => {
      const sourceNode = filteredNodes.find(n => n.id === edge.source);
      const targetNode = filteredNodes.find(n => n.id === edge.target);
      return sourceNode && targetNode;
    });
  }, [edges, filteredNodes]);

  // Get color based on domain
  const getDomainColor = (domain: TechnologyDomain) => {
    const colors: Record<TechnologyDomain, string> = {
      [TechnologyDomain.COMPUTING]: '#3B82F6', // Blue
      [TechnologyDomain.ENERGY]: '#10B981', // Green
      [TechnologyDomain.TRANSPORTATION]: '#F59E0B', // Amber
      [TechnologyDomain.MEDICINE]: '#EC4899', // Pink
      [TechnologyDomain.COMMUNICATION]: '#8B5CF6', // Purple
      [TechnologyDomain.MATERIALS]: '#6366F1', // Indigo
      [TechnologyDomain.AI]: '#EF4444', // Red
      [TechnologyDomain.SPACE]: '#0EA5E9'  // Sky blue
    };
    return colors[domain];
  };

  // Get node style based on status
  const getNodeStyleAttributes = (status: NodeStatus) => {
    switch (status) {
      case NodeStatus.HISTORICAL:
        return 'style="filled,solid" penwidth="1"';
      case NodeStatus.CURRENT:
        return 'style="filled,solid" penwidth="2"';
      case NodeStatus.EMERGING:
        return 'style="filled,dashed" penwidth="1"';
      case NodeStatus.THEORETICAL:
        return 'style="filled,dotted" penwidth="1"';
      default:
        return 'style="filled,solid" penwidth="1"';
    }
  };

  // Generate DOT string
  const generateDotString = useCallback(() => {
    const nodeCount = filteredNodes.length;
    const edgeCount = filteredEdges.length;
    
    // Choose layout engine based on graph characteristics
    let engine = 'dot'; // Default hierarchical layout
    if (nodeCount < 20 && edgeCount < 30) {
      engine = 'neato'; // Force-directed for smaller graphs
    } else if (nodeCount > 50) {
      engine = 'sfdp'; // Scalable force-directed for large graphs
    }

    let dot = `digraph TechGraph {
  graph [rankdir="TB", nodesep="1.5", ranksep="2", bgcolor="transparent"];
  node [shape="box", style="filled,rounded", fontname="Arial", fontsize="10", margin="0.3,0.1"];
  edge [color="rgba(0,0,0,0.3)", arrowsize="0.7"];
  
`;

    // Add nodes
    filteredNodes.forEach(node => {
      const color = getDomainColor(node.domain);
      const styleAttrs = getNodeStyleAttributes(node.status);
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode === node.id;
      
      // Escape quotes in labels
      const escapedLabel = node.label.replace(/"/g, '\\"');
      
      dot += `  "${node.id}" [
    label="${escapedLabel}\\n(${node.year})"
    fillcolor="${color}"
    fontcolor="white"
    ${styleAttrs}
    ${isSelected || isHovered ? 'penwidth="3" color="black"' : ''}
  ];\n`;
    });

    // Add edges
    filteredEdges.forEach(edge => {
      const isHighlighted = hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode);
      dot += `  "${edge.source}" -> "${edge.target}"`;
      if (isHighlighted) {
        dot += ' [color="rgba(59,130,246,0.8)" penwidth="2"]';
      }
      dot += ';\n';
    });

    dot += '}';
    return dot;
  }, [filteredNodes, filteredEdges, selectedNode, hoveredNode]);

  // Fallback SVG creation if Graphviz fails
  const createFallbackSvg = () => {
    console.log('Creating fallback SVG...');
    let svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="rgba(0,0,0,0.3)" />
        </marker>
      </defs>`;
    
    // Simple grid layout for nodes
    const cols = Math.ceil(Math.sqrt(filteredNodes.length));
    const nodeWidth = 120;
    const nodeHeight = 60;
    const spacing = 150;
    
    filteredNodes.forEach((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = 50 + col * spacing;
      const y = 50 + row * spacing;
      
      const color = getDomainColor(node.domain);
      const isSelected = selectedNode?.id === node.id;
      
      svg += `
        <g class="node" data-node-id="${node.id}">
          <title>${node.id}</title>
          <rect x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" 
                fill="${color}" stroke="${isSelected ? '#000' : color}" 
                stroke-width="${isSelected ? '3' : '1'}" rx="5"/>
          <text x="${x + nodeWidth/2}" y="${y + nodeHeight/2 - 5}" 
                text-anchor="middle" fill="white" font-size="12" font-weight="bold">
            ${node.label}
          </text>
          <text x="${x + nodeWidth/2}" y="${y + nodeHeight/2 + 10}" 
                text-anchor="middle" fill="white" font-size="10">
            (${node.year})
          </text>
        </g>`;
    });
    
    svg += '</svg>';
    setGraphvizSvg(svg);
  };

  // Generate SVG using Graphviz
  useEffect(() => {
    const generateSvg = async () => {
      if (filteredNodes.length === 0) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        console.log('Loading Graphviz...');
        const graphviz = await Graphviz.load();
        console.log('Graphviz loaded successfully');
        
        const dotString = generateDotString();
        console.log('Generated DOT string:', dotString);
        
        const svg = graphviz.layout(dotString, "svg", "dot");
        console.log('SVG generated, length:', svg.length);
        
        setGraphvizSvg(svg);
        setError('');
      } catch (error) {
        console.error('Error generating graph layout:', error);
        setError(`Failed to generate graph: ${error}`);
        
        // Fallback: create a simple SVG with positioned nodes
        createFallbackSvg();
      } finally {
        setIsLoading(false);
      }
    };

    generateSvg();
  }, [generateDotString, filteredNodes.length]);

  // Update node visual styles when selection changes
  const updateNodeStyles = useCallback(() => {
    if (!svgRef.current) return;

    const nodeGroups = svgRef.current.querySelectorAll('g.node, g[data-node-id]');
    
    nodeGroups.forEach(group => {
      const title = group.querySelector('title');
      const nodeId = title?.textContent?.trim() || group.getAttribute('data-node-id');
      
      if (nodeId) {
        const node = filteredNodes.find(n => n.id === nodeId);
        if (!node) return;

        const isSelected = selectedNode?.id === nodeId;
        const isHovered = hoveredNode === nodeId;
        
        // Find the shape element (polygon, ellipse, or rect)
        const shapeElements = group.querySelectorAll('polygon, ellipse, rect, path');
        const textElements = group.querySelectorAll('text');
        
        shapeElements.forEach(shape => {
          const svgShape = shape as SVGElement; 

          if (isSelected || isHovered) {
            svgShape.setAttribute('stroke', '#000');
            svgShape.setAttribute('stroke-width', '3');
            svgShape.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))';
          } else {
            const color = getDomainColor(node.domain);
            svgShape.setAttribute('stroke', color);
            svgShape.setAttribute('stroke-width', '1');
            svgShape.style.filter = 'none';
          }
        });

        // Update text styling for better visibility when selected/hovered
        textElements.forEach(text => {
          if (isSelected || isHovered) {
            text.setAttribute('font-weight', 'bold');
            text.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))';
          } else {
            text.setAttribute('font-weight', 'normal');
            text.style.filter = 'none';
          }
        });
      }
    });

    // Update edge highlighting
    const edgeElements = svgRef.current.querySelectorAll('g.edge');
    edgeElements.forEach(edge => {
      const title = edge.querySelector('title');
      if (title) {
        const edgeTitle = title.textContent?.trim();
        if (edgeTitle) {
          // Parse edge title (usually in format "source->target")
          const [source, target] = edgeTitle.split('->').map(s => s.trim());
          const isHighlighted = hoveredNode && (source === hoveredNode || target === hoveredNode);
          
          const pathElements = edge.querySelectorAll('path, polygon');
          pathElements.forEach(path => {
            if (isHighlighted) {
              path.setAttribute('stroke', 'rgba(59,130,246,0.8)');
              path.setAttribute('stroke-width', '2');
              path.setAttribute('fill', 'rgba(59,130,246,0.8)');
            } else {
              path.setAttribute('stroke', 'rgba(0,0,0,0.3)');
              path.setAttribute('stroke-width', '1');
              path.setAttribute('fill', 'rgba(0,0,0,0.3)');
            }
          });
        }
      }
    });
  }, [filteredNodes, selectedNode, hoveredNode]);

  // Setup SVG interactions 
  useEffect(() => {
    if (!graphvizSvg || !svgRef.current) {
      console.log('SVG setup skipped - missing graphvizSvg or svgRef');
      return;
    }

    console.log('Setting up SVG interactions...');
    console.log('filteredNodes:', filteredNodes.map(n => n.id));
    
    try {
      // Clear any existing event listeners by replacing innerHTML
      svgRef.current.innerHTML = graphvizSvg;
      
      // Wait for DOM to update, then add event listeners
      setTimeout(() => {
        if (!svgRef.current) {
          console.log('svgRef lost during timeout');
          return;
        }

        // Find all node groups - try multiple selectors
        const nodeGroups = svgRef.current.querySelectorAll('g.node, g[class*="node"], g[data-node-id]');
        console.log('Found node groups with classes:', nodeGroups.length);
        
        // If no groups found with class, try finding by structure (title + polygon/rect)
        if (nodeGroups.length === 0) {
          const allGroups = svgRef.current.querySelectorAll('g');
          console.log('Total groups found:', allGroups.length);
          
          allGroups.forEach((group, index) => {
            const title = group.querySelector('title');
            const hasShape = group.querySelector('polygon, rect, ellipse, path');
            
            console.log(`Group ${index}:`, {
              hasTitle: !!title,
              titleText: title?.textContent?.trim(),
              hasShape: !!hasShape,
              shapeType: hasShape?.tagName
            });
            
            if (title && hasShape) {
              const nodeId = title.textContent?.trim() || '';
              console.log(`Setting up interaction for node: "${nodeId}"`);
              setupNodeInteraction(group, nodeId);
            }
          });
        } else {
          // Setup interactions for found node groups
          nodeGroups.forEach((group, index) => {
            const title = group.querySelector('title');
            const nodeId = title?.textContent?.trim() || group.getAttribute('data-node-id');
            
            console.log(`Node group ${index}: "${nodeId}"`);
            if (nodeId) {
              setupNodeInteraction(group, nodeId);
            }
          });
        }
        
        // Initial style update
        setTimeout(updateNodeStyles, 50);
        
      }, 100); // Give DOM time to update
      
      console.log('SVG setup complete');
    } catch (error) {
      console.error('Error setting up SVG interactions:', error);
      setError(`SVG setup failed: ${error}`);
    }
  }, [graphvizSvg, filteredNodes]);

  function makeSvgResponsive(svgString: string): string {
  const widthMatch = svgString.match(/width="([\d.]+)pt"/);
  const heightMatch = svgString.match(/height="([\d.]+)pt"/);

  if (widthMatch && heightMatch) {
    const widthPt = parseFloat(widthMatch[1]);
    const heightPt = parseFloat(heightMatch[1]);

    // Convert pt to px (1pt = 1.333px)
    const width = widthPt * 1.333;
    const height = heightPt * 1.333;

    svgString = svgString
      // Replace <svg ...> with responsive version
      .replace(/<svg([^>]+)>/, `<svg$1 viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">`)
      // Replace fixed dimensions
      .replace(/width="[^"]+"/, 'width="100%"')
      .replace(/height="[^"]+"/, 'height="100%"');
  }

  return svgString;
}

  // Helper function to setup interaction for a single node
  const setupNodeInteraction = (group: Element, nodeId: string) => {
    console.log(`setupNodeInteraction called with nodeId: "${nodeId}"`);
    
    if (!nodeId || !(group instanceof Element)) {
      console.log('Invalid nodeId or group element');
      return;
    }
    
    const node = filteredNodes.find(n => n.id === nodeId);
    if (!node) {
      console.log(`Node not found in filteredNodes: "${nodeId}"`);
      console.log('Available nodes:', filteredNodes.map(n => n.id));
      return;
    }
    
    console.log(`Setting up interaction for node: "${nodeId}"`);
    
    // Remove existing listeners by cloning the element
    const newGroup = group.cloneNode(true) as HTMLElement;
    group.parentNode?.replaceChild(newGroup, group);
    
    // Set cursor and add visual feedback
    newGroup.style.cursor = 'pointer';
    newGroup.style.userSelect = 'none';
    
    // Add click listener with detailed logging
    const clickHandler = (e: Event) => {
      console.log('=== CLICK EVENT FIRED ===');
      console.log('Event:', e);
      console.log('Target:', e.target);
      console.log('CurrentTarget:', e.currentTarget);
      console.log('Node ID:', nodeId);
      console.log('Node object:', node);
      
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Calling onNodeSelect...');
      onNodeSelect(node);
      console.log('onNodeSelect called');
    };

    newGroup.addEventListener('click', clickHandler);
    
    // Add hover listeners
    newGroup.addEventListener('mouseenter', (e) => {
      e.stopPropagation();
      console.log('Node hovered:', nodeId);
      setHoveredNode(nodeId);
    });
    
    newGroup.addEventListener('mouseleave', (e) => {
      e.stopPropagation();
      console.log('Node unhovered:', nodeId);
      setHoveredNode(null);
    });
    
    // Add a test event to verify the element is interactive
    newGroup.addEventListener('mousedown', () => {
      console.log('Mouse down on node:', nodeId);
    });
    
    console.log(`Node interaction setup complete for: "${nodeId}"`);
  };

  // Update styles when selection or hover changes
  useEffect(() => {
    updateNodeStyles();
  }, [selectedNode, hoveredNode, updateNodeStyles]);

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      const scaleAmount = e.deltaY < 0 ? 1.1 : 0.9;
      setTransform(prev => ({
        ...prev,
        scale: Math.max(0.5, Math.min(3, prev.scale * scaleAmount))
      }));
    }
  };

  // Handle drag - FIXED to prevent interference with node clicks
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the background (not on a node)
    const target = e.target as Element;
    const isNodeClick = target.closest('g.node, g[class*="node"], g[data-node-id]') || 
                       target.closest('g')?.querySelector('title');
    
    if (e.button === 0 && !isNodeClick) {
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


  const centerGraph = () => {
    if (svgRef.current && containerRef.current) {
      const svgBBox = svgRef.current.getBBox();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      const scaleX = containerRect.width / svgBBox.width;
      const scaleY = containerRect.height / svgBBox.height;
      const scale = Math.min(scaleX, scaleY, 1) * 0.9; // 90% of available space
      
      const centerX = (containerRect.width - svgBBox.width * scale) / 2;
      const centerY = (containerRect.height - svgBBox.height * scale) / 2;
      
      setTransform({
        x: centerX - svgBBox.x * scale,
        y: centerY - svgBBox.y * scale,
        scale: scale
      });
    }
  };

  // Center graph when it first loads - IMPROVED
  useEffect(() => {
    if (graphvizSvg && svgRef.current) {
      // Longer delay to ensure SVG is fully rendered and measured correctly
      setTimeout(() => {
        if (svgRef.current && containerRef.current) {
          try {
            // Try to get the actual content bounds
            const svgElement = svgRef.current.querySelector('svg') || svgRef.current;
            const bbox = svgElement.getBBox();
            console.log('SVG BBox:', bbox);
            
            const containerRect = containerRef.current.getBoundingClientRect();
            console.log('Container rect:', containerRect);
            
            if (bbox.width > 0 && bbox.height > 0) {
              const scaleX = (containerRect.width * 0.9) / bbox.width;
              const scaleY = (containerRect.height * 0.9) / bbox.height;
              const scale = Math.min(scaleX, scaleY, 1);
              
              const centerX = (containerRect.width - bbox.width * scale) / 2;
              const centerY = (containerRect.height - bbox.height * scale) / 2;
              
              console.log('Centering with scale:', scale, 'center:', centerX, centerY);
              
              setTransform({
                x: centerX - bbox.x * scale,
                y: centerY - bbox.y * scale,
                scale: scale
              });
            } else {
              console.log('Invalid bbox, using default centering');
              // Fallback: just center with default scale
              setTransform({
                x: containerRect.width / 4,
                y: containerRect.height / 4,
                scale: 0.8
              });
            }
          } catch (error) {
            console.error('Error centering graph:', error);
            // Fallback positioning
            setTransform({ x: 50, y: 50, scale: 0.8 });
          }
        }
      }, 300); // Increased delay
    }
  }, [graphvizSvg]);

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        position: 'relative',}}
      className="w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900 relative"
    >
      <div
        className="w-full h-full"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
            style={{ 
              pointerEvents: 'all',
              overflow: 'visible',
              minWidth: '100%',
              minHeight: '100%'
            }}
            preserveAspectRatio="xMidYMid meet"
        >
          {/* SVG content will be populated by Graphviz */}
        </svg>
      </div>
      
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
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mt-2"
          onClick={centerGraph}
        >
          Center
        </button>
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mt-2"
          onClick={() => {
            if (containerRef.current?.requestFullscreen) {
              containerRef.current.requestFullscreen();
            } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
              (containerRef.current as any).webkitRequestFullscreen();
            } else if ((containerRef.current as any)?.msRequestFullscreen) {
              (containerRef.current as any).msRequestFullscreen();
            }
          }}
        >
          ⛶
        </button>
      </div>
      
      {/* Loading indicator */}
      {(isLoading || (!graphvizSvg && filteredNodes.length > 0)) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75">
          <div className="text-lg text-gray-600 dark:text-gray-400">
            {isLoading ? 'Generating graph layout...' : 'Loading...'}
          </div>
        </div>
      )}
      
      {/* Error display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75">
          <div className="text-center">
            <div className="text-lg text-red-600 dark:text-red-400 mb-2">
              Error loading graph
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
    
    </div>
  );
};

export default GraphView;