# Project Blueprint

## Overview

This project is a web application that showcases various interactive simulations built with Astro.js and React. The focus is on creating a visually engaging and performant experience.

## Implemented Features

### City Simulation

*   **Dynamic Grid:** The city is built on a dynamic grid that can be resized by the user.
*   **Building Types:** The simulation includes Residential, Commercial, and Industrial building types, each with a unique color.
*   **Improved Road Network:** Roads are generated to create a realistic city layout with a central highway, zone connectors, and branching roads.
*   **Variable Building Sizes:** Buildings are generated with random widths and heights.
*   **Building Merging:** Adjacent buildings of the same type and density are merged into larger structures.
*   **Density-Based Coloring:** Buildings are colored based on their density, with high-density buildings appearing darker and low-density buildings appearing lighter.
*   **Zoning:** The city is divided into zones for different building types (Industrial, Low-Density Residential, and a central zone for others).

### Fish Boids Simulation

*   **Flocking Behavior:** The simulation implements the classic boids algorithm for flocking behavior, including alignment, cohesion, and separation.
*   **Interactive Controls:** Users can adjust the number of flocks and the speed of the boids.
*   **Shape Variety:** The simulation includes various shapes for the boids, including fish, triangles, and squares.

## Current Task: Improved Road Generation

The following changes have been implemented to create a more realistic and connected city layout:

1.  **Central Highway:** A horizontal highway has been added through the center of the city to serve as a main artery.
2.  **Zone Connectors:** Vertical roads now connect the industrial and low-density residential zones directly to the central highway.
3.  **Branching Roads:** The road network is now more complex, with smaller roads branching off from the main highway and connector roads to ensure better connectivity throughout the city.
