import { writable } from 'svelte/store';
import type { DiagramData } from '../types/diagram';

// Initialize with the example data
import exampleData from '../diagram/example-diagram.json';

export const diagramStore = writable<DiagramData>(exampleData); 