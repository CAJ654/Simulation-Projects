# Kitchen Sink: Microfrontends with Astro

```sh
npm create astro@latest -- --template framework-multiple
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/framework-multiple)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/framework-multiple)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/framework-multiple/devcontainer.json)

This example showcases Astro's built-in support for multiple frameworks ([React](https://react.dev), [Preact](https://preactjs.com), [Svelte](https://svelte.dev), and [Vue (`v3.x`)](https://v3.vuejs.org/)).

No configuration is needed to enable these frameworks—just start writing components in `src/components`.


//Don't touch outside of comments or adding more things to avoid breaking stuff

Adding:
1. The "Whirlpool" (Vector Field Simulation)
Tech Stack: Astro + Preact
 * Why Preact? Preact is "React-lite." It’s perfect for simulations that require high performance and a small bundle size. Since a vector field involves a grid of thousands of invisible "arrows," Preact’s minimal overhead ensures the UI (controls for strength, friction, and density) doesn't compete with the Canvas rendering loop.
  * The Project: Create a background grid of vectors. Use Perlin Noise to make the "water" look organic. Allow the user to click and drag to create "whirlpools" (vortices) that suck in or repel particles.
   * Key Learning: Integrating a high-frequency animation loop with a reactive UI without the "weight" of standard React.
   2. Genetic Algorithm Creatures (Evolution Sim)
   Tech Stack: Astro + Solid JS
    * Why Solid JS? Solid uses "Fine-grained reactivity." Unlike React or Preact, it doesn't re-render components; it only updates the specific DOM nodes that change. In an evolution sim where you might have 100+ creatures each with unique stats (speed, vision, health bars), Solid is the fastest way to keep the UI synced with the underlying data.
     * The Project: Build a simulation where "bugs" hunt for food. Each bug has a DNA string (array of floats) determining its traits. When they eat enough, they split and mutate. Use a sidebar to show the "Top Stats" in the current generation.
      * Key Learning: Managing a complex, rapidly changing state (the gene pool) with maximum performance.
      3. Submarine "Sonar" Ripple Map
      Tech Stack: Astro + Vue JS
       * Why Vue JS? Vue’s template system and "Single File Components" make it incredibly easy to build sophisticated control dashboards. The "Sonar" project is highly visual and interactive, and Vue’s v-model and transition system are great for building the "high-tech" HUD (Heads-Up Display) feel this project needs.
        * The Project: A dark canvas representing the deep sea. The user "pings" the sonar, creating a ripple that expands. You’ll use a heightmap grid (similar to your Fire Sim logic but with wave propagation) to reveal hidden shipwrecks or rocks as the wave passes over them.
         * Key Learning: Using Vue to manage a "layered" UI where the simulation sits behind a complex, interactive dashboard.
         4. Crowd Movement / Traffic Flow
         Tech Stack: Astro + Svelte
          * Why Svelte? Svelte moves the "reactivity" to a compile-step, meaning there is no virtual DOM at all. It is famous for its "stores" and built-in spring/tween animations. For a crowd or traffic simulation, where you want smooth transitions when a stoplight changes or a person changes direction, Svelte’s motion library makes it look professional with almost zero effort.
           * The Project: Model a simple intersection or a building exit. Use A* pathfinding for the agents. When a user clicks to "Place an Obstacle," watch the crowd recalculate their paths in real-time.
            * Key Learning: Leveraging Svelte’s built-in motion and store system to handle pathfinding logic and smooth agent movement.
            Summary Table for your Portfolio:
            | Project | Framework | Why? |
            |---|---|---|
            | Whirlpool (Vector Field) | Preact | Fast, small, and familiar (React-like) for math-heavy sims. |
            | Genetic Evolution | Solid JS | Best-in-class performance for tracking 100+ individual agent stats. |
            | Sonar Ripple Map | Vue JS | Excellent for building the "Sci-Fi HUD" UI and dashboard. |
            | Crowd/Traffic Sim | Svelte | Easy pathfinding state management and built-in smooth animations. |
            Pro-tip for Astro: Since you are using multiple frameworks, remember to add the integrations in your astro.config.mjs and use the client:load or client:visible directives on your components so the JavaScript actually runs in the browser!
        