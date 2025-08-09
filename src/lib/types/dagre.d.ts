declare module 'dagre' {
  export interface Graph {
    setGraph(options: any): Graph;
    setDefaultEdgeLabel(fn: () => any): Graph;
    setNode(id: string, node: { width: number; height: number }): Graph;
    setEdge(source: string, target: string): Graph;
    node(id: string): { x: number; y: number; width: number; height: number };
  }

  export interface GraphLib {
    Graph: new () => Graph;
    layout(g: Graph): void;
  }

  export interface Dagre {
    graphlib: GraphLib;
    layout(g: Graph): void;
  }

  const dagre: Dagre;
  export default dagre;
}
