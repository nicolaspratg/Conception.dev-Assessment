import type { DiagramData } from '../../types/diagram.js';

export interface GenerateRequest {
  prompt: string;
}

export interface GenerateResponse {
  nodes: DiagramData['nodes'];
  edges: DiagramData['edges'];
}

export class DiagramApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async generateDiagram(request: GenerateRequest): Promise<GenerateResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate diagram: ${response.statusText}`);
    }

    return response.json();
  }

  async generateMockDiagram(request: GenerateRequest): Promise<GenerateResponse> {
    const response = await fetch(`${this.baseUrl}/api/mock-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate mock diagram: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export a default instance
export const diagramApi = new DiagramApiClient();
