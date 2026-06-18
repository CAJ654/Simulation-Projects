import { onMount } from 'solid-js';
import type { FoodSource, PheromoneGrid } from '../../scripts/ant-logic';

const AntColonySimulator = () => {
  let containerRef!: HTMLDivElement;
  let addFoodFn: () => void = () => {};

  onMount(() => {
    Promise.all([
      import('pixi.js'),
      import('../../scripts/ant-logic.ts')
    ]).then(async ([PIXI, { getAntClass }]) => {

      const Ant = getAntClass(PIXI);

      const app = new PIXI.Application();
      await app.init({
        width: 800,
        height: 600,
        backgroundColor: 0x1a1a1a,
      });
      containerRef.appendChild(app.canvas as unknown as Node);

      const cellSize = 10;
      const gridWidth = Math.floor(app.screen.width / cellSize);
      const gridHeight = Math.floor(app.screen.height / cellSize);

      const pheromoneGrid: PheromoneGrid = {
        width: gridWidth,
        height: gridHeight,
        cellSize: cellSize,
        grid: Array(gridHeight).fill(0).map(() =>
          Array(gridWidth).fill(0).map(() => ({ toFood: new Map<number, number>(), toHome: 0 }))
        ),
      };

      const pheromoneGraphics = new PIXI.Graphics();
      app.stage.addChild(pheromoneGraphics);

      const nestLocation = new PIXI.Point(app.screen.width / 2, app.screen.height / 2);

      const nestGraphic = new PIXI.Graphics();
      nestGraphic.beginFill(0x4444ff);
      nestGraphic.drawCircle(nestLocation.x, nestLocation.y, 10);
      nestGraphic.endFill();
      app.stage.addChild(nestGraphic);

      // Track active food sources with their PIXI objects
      interface ActiveFood extends FoodSource {
        graphic: InstanceType<typeof PIXI.Graphics>;
        label: InstanceType<typeof PIXI.Text>;
      }
      const foodSources: ActiveFood[] = [];
      let nextFoodId = 0;

      function createFoodSource(x: number, y: number) {
        const id = nextFoodId++;
        const quantity = 20;

        const graphic = new PIXI.Graphics();
        const radius = 8 + quantity * 0.35;
        graphic.beginFill(0x00ff00);
        graphic.drawCircle(x, y, radius);
        graphic.endFill();
        app.stage.addChild(graphic);

        const label = new PIXI.Text(String(quantity), { fontSize: 11, fill: 0xffffff });
        label.anchor.set(0.5);
        label.position.set(x, y - 20);
        app.stage.addChild(label);

        foodSources.push({ id, x, y, quantity, graphic, label });
      }

      function spawnFoodSource(exhaustedId: number) {
        // Clear only the pheromone trails for this source
        pheromoneGrid.grid.forEach(row => row.forEach(cell => {
          cell.toFood.delete(exhaustedId);
        }));

        // Remove from array and destroy PIXI objects
        const idx = foodSources.findIndex(s => s.id === exhaustedId);
        if (idx !== -1) {
          const src = foodSources[idx];
          app.stage.removeChild(src.graphic);
          src.graphic.destroy();
          app.stage.removeChild(src.label);
          src.label.destroy();
          foodSources.splice(idx, 1);
        }

        // Spawn replacement at a random position away from nest
        let nx: number, ny: number;
        do {
          nx = Math.random() * (app.screen.width - 30) + 15;
          ny = Math.random() * (app.screen.height - 30) + 15;
        } while (Math.hypot(nx - nestLocation.x, ny - nestLocation.y) < 100);

        createFoodSource(nx, ny);
      }

      // Expose to the Add Food button in JSX
      addFoodFn = () => {
        if (foodSources.length >= 5) return;
        let nx: number, ny: number;
        do {
          nx = Math.random() * (app.screen.width - 30) + 15;
          ny = Math.random() * (app.screen.height - 30) + 15;
        } while (Math.hypot(nx - nestLocation.x, ny - nestLocation.y) < 100);
        createFoodSource(nx, ny);
      };

      // Initialise with one food source
      createFoodSource(app.screen.width * 0.9, app.screen.height * 0.9);

      const createAntTexture = (): PIXI.Texture => {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xffffff);
        graphics.drawEllipse(0, 0, 4, 2);
        graphics.endFill();
        graphics.beginFill(0xffffff);
        graphics.drawCircle(3, 0, 2);
        graphics.endFill();
        const texture = app.renderer.extract.texture(graphics);
        graphics.destroy();
        return texture;
      };

      const antTexture = createAntTexture();
      const ants: InstanceType<typeof Ant>[] = [];
      for (let i = 0; i < 150; i++) {
        const ant = new Ant(antTexture, nestLocation.x, nestLocation.y);
        ants.push(ant);
        app.stage.addChild(ant.sprite);
      }

      app.ticker.add((ticker) => {
        const delta = ticker.deltaTime;

        // Evaporate pheromones and render
        pheromoneGraphics.clear();
        for (let y = 0; y < gridHeight; y++) {
          for (let x = 0; x < gridWidth; x++) {
            const cell = pheromoneGrid.grid[y][x];

            // Evaporate per-source toFood and collect max for rendering
            let maxToFood = 0;
            cell.toFood.forEach((val, key) => {
              const next = Math.max(0, val - 0.005 * delta);
              if (next === 0) {
                cell.toFood.delete(key);
              } else {
                cell.toFood.set(key, next);
                if (next > maxToFood) maxToFood = next;
              }
            });
            if (maxToFood > 0) {
              pheromoneGraphics.beginFill(0x00ff00, maxToFood * 0.5);
              pheromoneGraphics.drawRect(x * cellSize, y * cellSize, cellSize, cellSize);
              pheromoneGraphics.endFill();
            }

            if (cell.toHome > 0) {
              pheromoneGraphics.beginFill(0xff0000, cell.toHome * 0.5);
              pheromoneGraphics.drawRect(x * cellSize, y * cellSize, cellSize, cellSize);
              pheromoneGraphics.endFill();
              cell.toHome = Math.max(0, cell.toHome - 0.005 * delta);
            }
          }
        }

        // Update ants; handle food delivery
        ants.forEach(ant => {
          const deliveredId = ant.update(delta, foodSources, nestLocation, pheromoneGrid);
          if (deliveredId !== null) {
            const src = foodSources.find(s => s.id === deliveredId);
            if (src) {
              src.quantity = Math.max(0, src.quantity - 1);
              src.label.text = String(src.quantity);
              // Shrink graphic as quantity decreases
              const radius = 8 + src.quantity * 0.35;
              src.graphic.clear();
              src.graphic.beginFill(0x00ff00);
              src.graphic.drawCircle(src.x, src.y, radius);
              src.graphic.endFill();

              if (src.quantity <= 0) {
                spawnFoodSource(deliveredId);
              }
            }
          }
        });
      });
    });
  });

  return (
    <div>
      <div ref={containerRef} style={{ border: '1px solid #ccc', width: '800px', height: '600px' }}></div>
      <div style={{ 'margin-top': '0.5rem' }}>
        <button onClick={() => addFoodFn()}>+ Add Food Source</button>
        <span style={{ 'margin-left': '0.75rem', 'font-size': '0.85rem', color: '#666' }}>
          (max 5 active sources)
        </span>
      </div>
    </div>
  );
};

export default AntColonySimulator;
