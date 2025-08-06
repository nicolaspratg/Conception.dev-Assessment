export const SHAPES = {
  component: "rectangle",
  datastore: "cylinder",
  external: "circle",
} as const;

export type ShapeType = keyof typeof SHAPES;
export type ShapeValue = typeof SHAPES[ShapeType]; 