export interface Node {
  id: string;
  label: string;
  description: string;
  year: number;
  domain: TechnologyDomain;
  status: NodeStatus;
  links?: string[]; // IDs of connected nodes (dependencies)
}

export enum TechnologyDomain {
  COMPUTING = "Computing",
  ENERGY = "Energy",
  TRANSPORTATION = "Transportation",
  MEDICINE = "Medicine",
  COMMUNICATION = "Communication",
  MATERIALS = "Materials",
  AI = "Artificial Intelligence",
  SPACE = "Space Technology",
  MATHEMATICS = "MATHEMATICS"
}

export enum NodeStatus {
  HISTORICAL = "Historical",
  CURRENT = "Current",
  EMERGING = "Emerging",
  THEORETICAL = "Theoretical"
}

export interface Edge {
  source: string;
  target: string;
  label?: string;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}