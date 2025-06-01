import { Edge, GraphData, Node, NodeStatus, TechnologyDomain } from "../types";

// Initial dataset for the knowledge graph
export const initialData: GraphData = {
  nodes: [
    {
      id: "transistor",
      label: "Transistor",
      description: "A semiconductor device used to amplify or switch electronic signals.",
      year: 1947,
      domain: TechnologyDomain.COMPUTING,
      status: NodeStatus.HISTORICAL
    },
    {
      id: "integrated-circuit",
      label: "Integrated Circuit",
      description: "A set of electronic circuits on a small flat piece of semiconductor material.",
      year: 1958,
      domain: TechnologyDomain.COMPUTING,
      status: NodeStatus.HISTORICAL,
      links: ["transistor"]
    },
    {
      id: "microprocessor",
      label: "Microprocessor",
      description: "An integrated circuit that contains a CPU.",
      year: 1971,
      domain: TechnologyDomain.COMPUTING,
      status: NodeStatus.HISTORICAL,
      links: ["integrated-circuit"]
    },
    {
      id: "personal-computer",
      label: "Personal Computer",
      description: "A computer designed for use by an individual person.",
      year: 1975,
      domain: TechnologyDomain.COMPUTING,
      status: NodeStatus.HISTORICAL,
      links: ["microprocessor"]
    },
    {
      id: "world-wide-web",
      label: "World Wide Web",
      description: "An information system enabling documents to be accessed over the internet.",
      year: 1989,
      domain: TechnologyDomain.COMMUNICATION,
      status: NodeStatus.HISTORICAL,
      links: ["personal-computer", "internet"]
    },
    {
      id: "internet",
      label: "Internet",
      description: "A global system of interconnected computer networks.",
      year: 1983,
      domain: TechnologyDomain.COMMUNICATION,
      status: NodeStatus.HISTORICAL
    },
    {
      id: "smartphone",
      label: "Smartphone",
      description: "A mobile phone with advanced features.",
      year: 2007,
      domain: TechnologyDomain.COMMUNICATION,
      status: NodeStatus.CURRENT,
      links: ["personal-computer", "mobile-phone"]
    },
    {
      id: "mobile-phone",
      label: "Mobile Phone",
      description: "A portable telephone that can make calls using a radio link.",
      year: 1973,
      domain: TechnologyDomain.COMMUNICATION,
      status: NodeStatus.HISTORICAL
    },
    {
      id: "machine-learning",
      label: "Machine Learning",
      description: "A field of AI focused on building applications that learn from data.",
      year: 1959,
      domain: TechnologyDomain.AI,
      status: NodeStatus.HISTORICAL
    },
    {
      id: "deep-learning",
      label: "Deep Learning",
      description: "A subset of machine learning based on artificial neural networks.",
      year: 2012,
      domain: TechnologyDomain.AI,
      status: NodeStatus.CURRENT,
      links: ["machine-learning"]
    },
    {
      id: "agi",
      label: "Artificial General Intelligence",
      description: "Hypothetical AI with the ability to understand, learn, and apply knowledge across different domains.",
      year: 2035,
      domain: TechnologyDomain.AI,
      status: NodeStatus.THEORETICAL,
      links: ["deep-learning"]
    },
    {
      id: "quantum-computing",
      label: "Quantum Computing",
      description: "Computing using quantum-mechanical phenomena.",
      year: 2019,
      domain: TechnologyDomain.COMPUTING,
      status: NodeStatus.EMERGING,
      links: ["microprocessor"]
    },
    {
      id: "assembly-language",
      label: "Assembly Language",
      description: "A low-level programming language with symbolic code closely related to machine code.",
      year: 1949,
      domain: TechnologyDomain.COMPUTING,
      status: NodeStatus.HISTORICAL
    },
    {
      id: "c-language",
      label: "C Programming Language",
      description: "A general-purpose programming language that became the foundation for many modern languages.",
      year: 1972,
      domain: TechnologyDomain.COMPUTING,
      status: NodeStatus.HISTORICAL,
      links: ["assembly-language"]
    },
    {
      id: "cloud-computing",
      label: "Cloud Computing",
      description: "The delivery of computing services over the internet.",
      year: 2006,
      domain: TechnologyDomain.COMPUTING,
      status: NodeStatus.CURRENT,
      links: ["internet"]
    },
    {
      id: "containerization",
      label: "Containerizationwar",
      description: "A lightweight form of virtualization for packaging applications with dependencies.",
      year: 2013,
      domain: TechnologyDomain.COMPUTING,
      status: NodeStatus.CURRENT,
      links: ["cloud-computing"]
    },
    {
      id: "edge-computing",
      label: "Edge Computing",
      description: "Processing data near the source rather than relying on a centralized cloud.",
      year: 2016,
      domain: TechnologyDomain.COMPUTING,
      status: NodeStatus.EMERGING,
      links: ["cloud-computing"]
    }
  ],
  edges: []
};

// Process the links to create edges
export const processData = (data: GraphData): GraphData => {
  const processedData = { ...data };
  const edges: Edge[] = [];

  processedData.nodes.forEach(node => {
    if (node.links) {
      node.links.forEach(targetId => {
        edges.push({
          source: targetId,
          target: node.id
        });
      });
    }
  });

  processedData.edges = edges;
  return processedData;
};

export const graphData = processData(initialData);