import { onMount } from 'solid-js';
import type { PheromoneGrid } from '../../scripts/ant-logic';

const AntColonySimulator = () => {
  let containerRef: HTMLDivElement;

  onMount(() => {
    // Dynamically import PIXI.js and the ant logic factory
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
        grid: Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(0).map(() => ({ toFood: 0, toHome: 0 }))),
      };

      const pheromoneGraphics = new PIXI.Graphics();
      app.stage.addChild(pheromoneGraphics);

      const nestLocation = new PIXI.Point(app.screen.width / 2, app.screen.height / 2);
      let foodLocation = new PIXI.Point(app.screen.width * 0.9, app.screen.height * 0.9);
      let foodCount = 0;

      const nestGraphic = new PIXI.Graphics();
      nestGraphic.beginFill(0x4444ff);
      nestGraphic.drawCircle(nestLocation.x, nestLocation.y, 10);
      nestGraphic.endFill();
      app.stage.addChild(nestGraphic);

      const foodGraphic = new PIXI.Graphics();
      foodGraphic.beginFill(0x00ff00);
      foodGraphic.drawCircle(foodLocation.x, foodLocation.y, 15);
      foodGraphic.endFill();
      app.stage.addChild(foodGraphic);

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

      const moveFood = () => {
          let newFoodLocation;
          do {
              newFoodLocation = new PIXI.Point(
                  Math.random() * (app.screen.width - 30) + 15, // padding
                  Math.random() * (app.screen.height - 30) + 15
              );
          } while (
              Math.hypot(newFoodLocation.x - nestLocation.x, newFoodLocation.y - nestLocation.y) < 100 ||
              Math.hypot(newFoodLocation.x - foodLocation.x, newFoodLocation.y - foodLocation.y) < 1
          );
          foodLocation = newFoodLocation;

          // Clear old food pheromones
          pheromoneGrid.grid.forEach(row => {
              row.forEach(cell => {
                  cell.toFood = 0;
              });
          });

          foodGraphic.clear();
          foodGraphic.beginFill(0x00ff00);
          foodGraphic.drawCircle(foodLocation.x, foodLocation.y, 15);
          foodGraphic.endFill();
      };


      app.ticker.add((ticker) => {
        const delta = ticker.deltaTime;

        pheromoneGraphics.clear();
        for (let y = 0; y < gridHeight; y++) {
          for (let x = 0; x < gridWidth; x++) {
            const cell = pheromoneGrid.grid[y][x];
            if (cell.toFood > 0) {
              pheromoneGraphics.beginFill(0x00ff00, cell.toFood * 0.5);
              pheromoneGraphics.drawRect(x * cellSize, y * cellSize, cellSize, cellSize);
              pheromoneGraphics.endFill();
              cell.toFood = Math.max(0, cell.toFood - 0.005 * delta);
            }
            if (cell.toHome > 0) {
              pheromoneGraphics.beginFill(0xff0000, cell.toHome * 0.5);
              pheromoneGraphics.drawRect(x * cellSize, y * cellSize, cellSize, cellSize);
              pheromoneGraphics.endFill();
              cell.toHome = Math.max(0, cell.toHome - 0.005 * delta);
            }
          }
        }

        ants.forEach(ant => {
          if (ant.update(delta, foodLocation, nestLocation, pheromoneGrid)) {
              foodCount++;
              if (foodCount >= 10) {
                  foodCount = 0;
                  moveFood();
              }
          }
        });
      });
    });
  });

  return (
      <div ref={containerRef} style={{ border: '1px solid #ccc', width: '800px', height: '600px' }}></div>
  );
};

export default AntColonySimulator;
