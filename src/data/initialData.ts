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
      status: NodeStatus.HISTORICAL,
      links: ['statistics', 'linear-algebra', 'calculus']
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
    },
    {
      id: "operating-system",
      label: "Operating System",
      description: "Software that manages hardware and software resources on a computer.",
      year: 1969,
      domain: TechnologyDomain.COMPUTING,
      status: NodeStatus.HISTORICAL,
      links: ["personal-computer"]
    },
    {
      id: "linux",
      label: "Linux",
      description: "An open-source family of Unix-like operating systems.",
      year: 1991,
      domain: TechnologyDomain.COMPUTING,
      status: NodeStatus.HISTORICAL,
      links: ["operating-system"]
    },
    {
      id: "gpu",
      label: "GPU",
      description: "A specialized processor designed to accelerate graphics and parallel computing.",
      year: 1999,
      domain: TechnologyDomain.COMPUTING,
      status: NodeStatus.HISTORICAL,
      links: ["microprocessor"]
    },
    {
      id: "parallel-computing",
      label: "Parallel Computing",
      description: "Computing using multiple processors to solve problems faster.",
      year: 1985,
      domain: TechnologyDomain.COMPUTING,
      status: NodeStatus.HISTORICAL
    },
    {
      id: "tensorflow",
      label: "TensorFlow",
      description: "An open-source library for machine learning and deep learning.",
      year: 2015,
      domain: TechnologyDomain.COMPUTING,
      status: NodeStatus.CURRENT,
      links: ["deep-learning"]
    },
    {
      id: "neuromorphic-computing",
      label: "Neuromorphic Computing",
      description: "A computing approach that mimics the neural structure of the human brain.",
      year: 2021,
      domain: TechnologyDomain.COMPUTING,
      status: NodeStatus.EMERGING,
      links: ["deep-learning", "gpu"]
    },

    // --- COMMUNICATION ---
    {
      id: "email",
      label: "Email",
      description: "A method of exchanging digital messages over the Internet.",
      year: 1971,
      domain: TechnologyDomain.COMMUNICATION,
      status: NodeStatus.HISTORICAL,
      links: ["internet"]
    },
    {
      id: "voip",
      label: "Voice over IP (VoIP)",
      description: "Technology that allows voice calls over the internet.",
      year: 1995,
      domain: TechnologyDomain.COMMUNICATION,
      status: NodeStatus.HISTORICAL,
      links: ["internet"]
    },
    {
      id: "5g",
      label: "5G",
      description: "The fifth generation of mobile networks.",
      year: 2019,
      domain: TechnologyDomain.COMMUNICATION,
      status: NodeStatus.CURRENT,
      links: ["mobile-phone"]
    },
    {
      id: "satellite-internet",
      label: "Satellite Internet",
      description: "Internet access provided through communication satellites.",
      year: 2020,
      domain: TechnologyDomain.COMMUNICATION,
      status: NodeStatus.EMERGING,
      links: ["internet"]
    },

    // --- AI ---
    {
      id: "expert-systems",
      label: "Expert Systems",
      description: "AI systems that emulate decision-making ability of a human expert.",
      year: 1975,
      domain: TechnologyDomain.AI,
      status: NodeStatus.HISTORICAL,
      links: ["machine-learning"]
    },
    {
      id: "reinforcement-learning",
      label: "Reinforcement Learning",
      description: "A type of machine learning where agents learn by trial and error.",
      year: 1992,
      domain: TechnologyDomain.AI,
      status: NodeStatus.HISTORICAL,
      links: ["machine-learning"]
    },
    {
      id: "transformers",
      label: "Transformers",
      description: "A deep learning model architecture that uses self-attention mechanisms.",
      year: 2017,
      domain: TechnologyDomain.AI,
      status: NodeStatus.CURRENT,
      links: ["deep-learning"]
    },
    {
      id: "chatbot",
      label: "Chatbot",
      description: "A software application used to conduct conversations via text or voice.",
      year: 2016,
      domain: TechnologyDomain.AI,
      status: NodeStatus.CURRENT,
      links: ["natural-language-processing"]
    },
    {
      id: "natural-language-processing",
      label: "Natural Language Processing",
      description: "The branch of AI that deals with understanding and generating human language.",
      year: 1960,
      domain: TechnologyDomain.AI,
      status: NodeStatus.HISTORICAL,
      links: ['probability-theory']
    },
    {
      id: "foundation-models",
      label: "Foundation Models",
      description: "Large-scale pre-trained models used as the base for multiple AI tasks.",
      year: 2020,
      domain: TechnologyDomain.AI,
      status: NodeStatus.CURRENT,
      links: ["transformers"]
    },
    {
      id: "superintelligence",
      label: "Superintelligence",
      description: "A form of intelligence far surpassing human cognitive capabilities.",
      year: 2045,
      domain: TechnologyDomain.AI,
      status: NodeStatus.THEORETICAL,
      links: ["agi"]
    },

    // --- MATHEMATICS (new domain) ---
    {
      id: "calculus",
      label: "Calculus",
      description: "The mathematical study of continuous change.",
      year: 1666,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.HISTORICAL
    },
    {
      id: "linear-algebra",
      label: "Linear Algebra",
      description: "The branch of mathematics concerning vector spaces and linear mappings.",
      year: 1843,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.HISTORICAL
    },
    {
      id: "probability-theory",
      label: "Probability Theory",
      description: "A branch of mathematics concerned with analyzing random phenomena.",
      year: 1657,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.HISTORICAL
    },
    {
      id: "statistics",
      label: "Statistics",
      description: "The practice or science of collecting and analyzing numerical data.",
      year: 1749,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.HISTORICAL
    },
    {
      id: "fourier-transform",
      label: "Fourier Transform",
      description: "A mathematical transform that decomposes functions into oscillatory components.",
      year: 1822,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.HISTORICAL
    },
    {
      id: "complex-analysis",
      label: "Complex Analysis",
      description: "The study of functions of complex variables.",
      year: 1814,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.HISTORICAL
    },
    {
      id: "topology",
      label: "Topology",
      description: "A branch of mathematics concerning the properties of space that are preserved under continuous transformations.",
      year: 1901,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.HISTORICAL
    },
    {
      id: "graph-theory",
      label: "Graph Theory",
      description: "The study of graphs, which are mathematical structures used to model pairwise relations.",
      year: 1736,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.HISTORICAL
    },
    {
      id: "information-theory",
      label: "Information Theory",
      description: "A mathematical framework for quantifying information.",
      year: 1948,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.HISTORICAL
    },
    {
      id: "game-theory",
      label: "Game Theory",
      description: "The study of mathematical models of strategic interaction.",
      year: 1928,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.HISTORICAL
    },
    {
      id: "category-theory",
      label: "Category Theory",
      description: "A branch of mathematics that deals with abstract structures and relationships between them.",
      year: 1945,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.HISTORICAL
    },

    // --- CROSS-DOMAIN / INTERDISCIPLINARY ---
    {
      id: "cryptography",
      label: "Cryptography",
      description: "The art of secure communication using mathematical techniques.",
      year: 1976,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.HISTORICAL,
      links: ["information-theory"]
    },
    {
      id: "blockchain",
      label: "Blockchain",
      description: "A decentralized digital ledger of transactions.",
      year: 2008,
      domain: TechnologyDomain.COMPUTING,
      status: NodeStatus.CURRENT,
      links: ["cryptography", "internet"]
    },
    {
      id: "zero-knowledge-proofs",
      label: "Zero-Knowledge Proofs",
      description: "A method to prove possession of knowledge without revealing it.",
      year: 1985,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.HISTORICAL,
      links: ["cryptography"]
    },
    {
      id: "homomorphic-encryption",
      label: "Homomorphic Encryption",
      description: "Encryption allowing computation on ciphertexts.",
      year: 2009,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.EMERGING,
      links: ["cryptography"]
    },
    {
      id: "differential-privacy",
      label: "Differential Privacy",
      description: "A system for sharing information while protecting individual data privacy.",
      year: 2006,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.CURRENT,
      links: ["statistics"]
    },
    {
      id: "federated-learning",
      label: "Federated Learning",
      description: "A machine learning technique that trains models across decentralized devices.",
      year: 2017,
      domain: TechnologyDomain.AI,
      status: NodeStatus.EMERGING,
      links: ["machine-learning"]
    }, 
    {
      id: "vector-space",
      label: "Vector Space",
      description: "A foundational concept in linear algebra where vectors can be scaled and added.",
      year: 1844,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.HISTORICAL,
      links: ["linear-algebra"]
    },
    {
      id: "matrix-multiplication",
      label: "Matrix Multiplication",
      description: "Core operation in linear algebra used to model transformations and computations in ML.",
      year: 1858,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.HISTORICAL,
      links: ["linear-algebra", "machine-learning"]
    },
    {
      id: "eigendecomposition",
      label: "Eigendecomposition",
      description: "Decomposes a matrix into its eigenvalues and eigenvectors for deeper analysis.",
      year: 1900,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.HISTORICAL,
      links: ["linear-algebra"]
    },
    {
      id: "singular-value-decomposition",
      label: "Singular Value Decomposition (SVD)",
      description: "Factorizes a matrix into singular vectors and values, widely used in ML.",
      year: 1936,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.CURRENT,
      links: ["eigendecomposition", "machine-learning"]
    },
    {
      id: "dimensionality-reduction",
      label: "Dimensionality Reduction",
      description: "Mathematical methods for reducing data dimensions while retaining structure.",
      year: 1964,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.CURRENT,
      links: ["singular-value-decomposition", "machine-learning"]
    },
    {
      id: "feature-representation",
      label: "Feature Representation",
      description: "Mathematical encoding of real-world objects into numerical vectors for ML.",
      year: 1998,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.CURRENT,
      links: ["vector-space", "matrix-multiplication", "machine-learning"]
    },
    {
      id: "linear-regression",
      label: "Linear Regression",
      description: "A statistical and mathematical model used to predict outputs from linear inputs.",
      year: 1805,
      domain: TechnologyDomain.MATHEMATICS,
      status: NodeStatus.HISTORICAL,
      links: ["matrix-multiplication", "feature-representation", "machine-learning"]
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