# Kitchen Sink: Microfrontends with Astro

This example showcases Astro's built-in support for multiple frameworks, demonstrating how to integrate and use React, Preact, and Svelte within a single project.

No configuration is needed to enable these frameworks beyond installing the integrations—just start writing components in `src/components`.

## Implemented Simulations

This project contains several interactive simulations, each built with a different technology to highlight the flexibility of Astro's island architecture.

| Project                 | Technology        | Why?                                                                                                                              |
| ----------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Fish Boids**          | Vanilla JS        | Demonstrates Astro's ability to include and manage standard JavaScript files for performance-critical tasks like canvas animations.     |
| **Whirlpool**           | Preact            | Fast, small, and familiar (React-like) for math-heavy simulations where a small bundle size is important.                         |
| **City Generation**     | React             | Leverages the robust and widely-used React ecosystem for building a complex, stateful simulation UI.                            |
| **Forest Fire**         | Svelte            | Moves reactivity to a compile step, resulting in highly optimized, vanilla-JS-like code ideal for efficient grid-based updates. |


**Pro-tip for Astro:** Since you are using multiple frameworks, remember to add the integrations in your `astro.config.mjs` and use the `client:load` or `client:visible` directives on your components so the JavaScript actually runs in the browser!
