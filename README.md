# 3D Piano React Application

This is a fun project that I've started. 3D piano application built with React, Next.js, Three.js (implied by the 3D scene), and Tone.js for audio synthesis.

## Project Overview

We render a 3D piano that users can interact with to play music. It initializes audio on user interaction (click, touch, or key press) and provides a visual 3D representation of a piano.

## Project Structure

The project follows a standard Next.js application structure:

- `app/` - Next.js app directory
  - `page.tsx` - Main entry point of the application
  - `layout.tsx` - Root layout component
  - `globals.css` - Global styles
  
- `components/` - Reusable React components
  - `layout/` - Layout-related components
  - `piano/` - Piano-specific components
  - `ui/` - General UI components

- `services/` - Service modules for external interactions
  - `midi-engine/` - Audio processing and management


- `public/` - Static assets including:
  - `models/` - 3D model files
  - `sounds/` - Audio files
  - `images/` - Image assets

- `styles/` - CSS modules and styling utilities

- `lib/` - Shared utility functions and helpers
  
- `hooks/` - Custom React hooks
  
- `stores/` - State management

- `types/` - TypeScript type definitions

- `config/` - Configuration files

## Features

- 3D piano visualization
- Audio synthesis using Tone.js
- Responsive design
- Audio initialization on user interaction
- Loading indicator

## Technical Stack

- React/Next.js - Frontend framework
- Tone.js - Audio synthesis
- Three.js (implied) - 3D rendering
- Zustand: state management

## Getting Started

To run this application locally:

1. Clone the repository
2. Install dependencies with `npm install` or `yarn`
3. Start the development server with `npm run dev` or `yarn dev`
4. Open your browser to `localhost:3000`

## Usage

Click, touch, or press keys to interact with the piano. The audio will initialize on the first interaction.
