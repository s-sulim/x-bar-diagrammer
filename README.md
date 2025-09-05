# X-Bar Diagrammer

A modern web application for creating and visualizing X-bar theory syntax trees in linguistics. Built with React and TypeScript, this tool provides an intuitive interface for constructing hierarchical syntactic structures used in generative grammar.

## 🎯 Purpose

X-Bar Diagrammer is designed for linguists, students, and researchers who need to create and analyze syntactic trees based on X-bar theory. The application allows users to build complex syntactic structures with proper hierarchical relationships, making it easier to visualize and understand sentence structure in generative grammar.

## 🛠️ Tech Stack

-   **Frontend**: React 19.1.1 with TypeScript
-   **Build Tool**: Vite 7.1.2
-   **Styling**: Tailwind CSS 3.4.0
-   **Diagram Engine**: ReactFlow 11.11.4
-   **Layout Algorithm**: Dagre 0.8.5
-   **ID Generation**: UUID 11.1.0
-   **Development**: ESLint, PostCSS, Autoprefixer

## ✨ Features

### Core Functionality

-   **Interactive Node Creation**: Add X-bar nodes with customizable categories and bar levels
-   **Linguistic Categories**: Support for S, N, V, A, Adv, P, Det, and custom text nodes
-   **Bar Levels**: XP (maximal projection), X′ (intermediate projection), X (head)
-   **Smart Auto-labeling**: Automatic text generation based on category and bar level combinations

### Layout & Visualization

-   **Dual Layout Modes**: Top-Bottom (TB) and Left-Right (LR) orientations
-   **Auto-layout**: One-click automatic arrangement using Dagre algorithm
-   **Dynamic Handle Positioning**: Connection handles adapt to layout direction
-   **Manual Positioning**: Drag and drop nodes for custom arrangements
-   **View Controls**: Zoom, pan, and center view functionality

### Node Management

-   **Real-time Editing**: Click to select and modify node properties
-   **Category Switching**: Change linguistic categories (S, N, V, A, Adv, P, Det)
-   **Bar Level Adjustment**: Modify projection levels (XP, X′, X)
-   **Node Deletion**: Remove nodes and their connections with keyboard shortcuts

### Data Persistence

-   **JSON Export**: Save diagrams as structured JSON files
-   **JSON Import**: Load previously saved diagrams
-   **Position Preservation**: Maintains manual node positions during import
-   **Cross-session Compatibility**: Export/import works across different sessions

### User Experience

-   **Responsive Design**: Works on desktop and tablet devices
-   **Keyboard Shortcuts**: Delete key for quick node removal
-   **Visual Feedback**: Selected nodes highlighted with blue borders
-   **Intuitive Controls**: Clean, accessible interface with tooltips
-   **Mini-map**: Overview of large diagrams
-   **Background Grid**: Visual reference for alignment

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd x-bar-diagrammer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
npm run preview
```

## 📖 Usage

1. **Create Nodes**: Select a category and bar level, then click "Add"
2. **Add Children**: Select a node and add children to it (no structure validation yet)
3. **Edit Properties**: Click a node to select and modify its category/bar level
4. **Layout Options**: Use "Auto-layout" for automatic arrangement or drag manually
5. **Save Work**: Export to JSON for later use
6. **Load Diagrams**: Import previously saved JSON files

## 🎨 Linguistic Categories

-   **S**: Sentence/Clause
-   **N**: Noun phrase
-   **V**: Verb phrase
-   **A**: Adjective phrase
-   **Adv**: Adverb phrase
-   **P**: Prepositional phrase
-   **Det**: Determiner
-   **\_**: Custom text (editable)

## 📊 Bar Levels

-   **XP**: Maximal projection (complete phrase)
-   **X′**: Intermediate projection (phrase with specifier)
-   **X**: Head (lexical item)

## 🔧 Development

### Project Structure

```
src/
├── components/         # React components
│   ├── XBarNode.tsx    # Custom node component
│   └── XBarEdge.tsx    # Custom edge component
├── types/              # TypeScript type definitions
│   ├── Category.ts     # Linguistic categories
│   ├── XBarData.ts     # Node data structure
│   ├── XBarLevel.ts    # Bar level types
│   └── XBarNode.ts     # Node type definition
├── XBarDiagram.tsx     # Main application component
└── main.tsx            # Application entry point
```

### Key Technologies

-   **ReactFlow**: Provides the diagram canvas and interaction handling
-   **Dagre**: Implements automatic hierarchical layout algorithms
-   **Tailwind CSS**: Utility-first styling framework
-   **TypeScript**: Type-safe development with full IntelliSense support

---

_Built for the linguistics community to make syntactic analysis more accessible and visual._
