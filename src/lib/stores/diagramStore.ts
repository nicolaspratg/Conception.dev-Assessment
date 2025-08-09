import { writable } from 'svelte/store';
import type { DiagramData } from '../types/diagram';
import exampleDataJson from '../diagram/example-diagram.json' with { type: "json" };

// Type assertion for the JSON data
const exampleData: DiagramData = exampleDataJson as DiagramData;

export const diagramStore = writable<DiagramData>(exampleData); 