# Visual Mock-up Generator

A prototype web application that turns plain-language descriptions of apps into interactive visual mock-ups.

## Features

- **Diagram Renderer**: Renders architecture diagrams with different shapes for components, data stores, and external APIs
- **SVG-based Visualization**: Uses SVG elements to create scalable, interactive diagrams
- **TypeScript Support**: Full type safety with TypeScript
- **Tailwind CSS**: Modern styling with Tailwind CSS and Skeleton UI

## Tech Stack

- **SvelteKit 2** - Full-stack web framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Skeleton UI** - Component library
- **Vitest** - Unit testing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Testing

Run the test suite:
```bash
npm test
```

## Project Structure

```
src/
├── lib/
│   ├── Diagram.svelte          # Main diagram component
│   ├── diagram/
│   │   ├── constants.ts        # Shape type definitions
│   │   └── example-diagram.json # Sample diagram data
│   └── Diagram.test.ts         # Unit tests
├── routes/
│   ├── +layout.svelte          # Root layout
│   ├── +page.svelte            # Home page (redirects to playground)
│   └── playground/
│       └── +page.svelte        # Diagram playground
└── app.css                     # Global styles
```

## Shape Legend

| Shape     | Semantic role                      | Example label     |
| --------- | ---------------------------------- | ----------------- |
| rectangle | internal component / micro‑service | "Web Client"      |
| circle    | external API / 3rd‑party           | "OpenAI API"      |
| cylinder  | data store                         | "PostgreSQL"      |

## Architecture

The diagram renderer follows a simple architecture:

1. **Data Layer**: JSON schema defining nodes and edges
2. **Component Layer**: Svelte component that renders the diagram
3. **Styling Layer**: Tailwind CSS for responsive design

## Development Roadmap

- [x] Bootstrap UI renderer with hard-coded example
- [ ] Natural language prompt processing
- [ ] LLM integration for schema generation
- [ ] Interactive diagram editing
- [ ] Export functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is part of the Conception.dev assessment.
# Conception.dev-Assessment
