# Project Blueprint

## Overview

This project is a web application that showcases various interactive simulations and generative art built with Astro.js, React, and Preact. The focus is on creating a visually engaging and performant experience.

## Implemented Features

### City Generation

*   **Generative Model:** The application generates a new city layout each time the "Generate" button is clicked.
*   **Dynamic Grid:** The city is built on a dynamic grid that can be resized by the user.
*   **Building Types:** The generation includes Residential, Commercial, and Industrial building types, each with a unique color.
*   **Improved Road Network:** Roads are generated to create a realistic city layout with a central highway and branching roads.
*   **Variable Building Sizes:** Buildings are generated with random widths and heights.
*   **Building Merging:** Adjacent buildings of the same type and density are merged into larger structures.
*   **Density-Based Coloring:** Buildings are colored based on their density, with high-density buildings appearing darker and low-density buildings appearing lighter.
*   **Zoning:** The city is divided into zones for different building types (Industrial, Downtown/Commercial, and Residential).

### Fish Boids Simulation

*   **Flocking Behavior:** The simulation implements the classic boids algorithm for flocking behavior, including alignment, cohesion, and separation.
*   **Interactive Controls:** Users can adjust the number of flocks and the speed of the boids.
*   **Shape Variety:** The simulation includes various shapes for the boids, including fish, triangles, and squares.

### Whirlpool Simulation

*   **Particle System:** A particle system is used to visualize a vector field.
*   **Whirlpool Force:** Particles are influenced by a central whirlpool force, creating a vortex effect.
*   **Interactive Controls:** Users can adjust the "Strength," "Friction," and "Density" of the simulation in real-time.

## Current Task: Implement Whirlpool Simulation

The Whirlpool simulation has been implemented using Preact.

1.  **Particle System:** Created a particle system to visualize the vector field.
2.  **Whirlpool Logic:** Implemented the physics for a whirlpool force that attracts and rotates the particles.
3.  **Interactive Controls:** Added sliders to control the `Strength`, `Friction`, and `Density` of the simulation.
4.  **Component Integration:** The Preact component is rendered within an Astro page.
