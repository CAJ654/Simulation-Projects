
# Application Blueprint

## Overview

This project is a static-first web application built with Astro.js, designed to showcase a variety of interactive web simulations and creative coding projects. It leverages Astro's "Islands Architecture" to deliver a high-performance, content-focused website with minimal client-side JavaScript by default. The application integrates multiple UI frameworks (React, Preact, Svelte) to demonstrate the flexibility of Astro in a multi-framework environment.

## Project Structure & Features

### Styling & Layout

*   **Global Styles:** A central `global.css` file provides base styling, including a dark theme, modern fonts, and consistent layout properties.
*   **Layout Component:** A primary `Layout.astro` component wraps all pages, ensuring a consistent header, footer, and metadata.
*   **Navigation:** A simple and intuitive navigation bar is present on the homepage, linking to the different simulation pages. Each simulation page includes a "Back to Home" link.

### Implemented simulations

| Feature                 | Framework | Description                                                                                                                              |
| ----------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Fish Boids**          | Astro     | A vanilla JavaScript boids simulation rendered on an HTML canvas. The Astro component handles the UI controls and embeds the script.        |
| **Whirlpool**           | Preact    | A particle simulation based on a vector field (Perlin noise).                                                                            |
| **City Generation**     | React     | A simulation that procedurally generates a city map, including buildings, roads, and agents (people).                                    |
| **Forest Fire**         | React     | An interactive grid-based simulation of a forest fire, where users can set fires and observe the spread based on adjustable parameters. |

## Current Task: Migrate Forest Fire Simulator to Svelte

**Plan:**

1.  **Create New Svelte Component:** Create a new file at `src/components/svelte/ForestFireSimulator.svelte`.
2.  **Translate Component Logic:** Convert the existing React logic from `src/components/react/ForestFireSimulator.tsx` to Svelte. This involves:
    *   Re-implementing state management using Svelte's native reactivity.
    *   Converting the JSX template to Svelte's HTML-based template syntax.
    *   Moving the component's styling into a `<style>` block within the `.svelte` file.
3.  **Update Astro Page:** Modify the `src/pages/cajd-projects.astro` file to remove the React component and import/render the new Svelte component.
4.  **Remove Old React Component:** Delete the now-unused `src/components/react/ForestFireSimulator.tsx` file.
5.  **Verify:** Check the browser preview to ensure the Svelte-based Forest Fire Simulator is working correctly.
