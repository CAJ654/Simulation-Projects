import { onMount } from 'solid-js';
import * as PIXI from 'pixi.js';
import { Ant } from '../../scripts/ant-logic';

const AntColonySimulator = () => {
  let canvasRef: HTMLCanvasElement;

  onMount(() => {
    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x1a1a1a,
      view: canvasRef,
    });

    const nestLocation = new PIXI.Point(app.screen.width / 2, app.screen.height / 2);
    const foodLocation = new PIXI.Point(app.screen.width * 0.9, app.screen.height * 0.9);

    const pheromoneTexture = PIXI.RenderTexture.create({ width: app.screen.width, height: app.screen.height });
    const pheromoneSprite = new PIXI.Sprite(pheromoneTexture);
    app.stage.addChild(pheromoneSprite);

    const pheromoneBrush = new PIXI.Graphics();

    const fadeRectangle = new PIXI.Graphics();
    fadeRectangle.beginFill(0x000000, 0.01);
    fadeRectangle.drawRect(0, 0, app.screen.width, app.screen.height);
    fadeRectangle.endFill();

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

    const antTexture = createAntTexture(app);
    const ants: Ant[] = [];
    for (let i = 0; i < 100; i++) {
      const ant = new Ant(antTexture, nestLocation.x, nestLocation.y);
      ants.push(ant);
      app.stage.addChild(ant.sprite);
    }

    app.ticker.add((delta) => {
        fadeRectangle.alpha = 0.02;
        app.renderer.render(fadeRectangle, { renderTexture: pheromoneTexture, clear: false });

        ants.forEach(ant => {
            ant.update(delta, foodLocation, nestLocation, pheromoneTexture, app);

            if (ant.shouldDropPheromone()) {
                const pheromoneColor = ant.carryingFood ? 0xff0000 : 0x00ff00;
                pheromoneBrush.clear();
                pheromoneBrush.beginFill(pheromoneColor, 0.8);
                pheromoneBrush.drawCircle(ant.sprite.x, ant.sprite.y, 2);
                pheromoneBrush.endFill();
                app.renderer.render(pheromoneBrush, { renderTexture: pheromoneTexture, clear: false });
            }
        });
    });

  });

  function createAntTexture(app: PIXI.Application): PIXI.Texture {
    const graphics = new PIXI.Graphics();
    // Body
    graphics.beginFill(0xffffff);
    graphics.drawEllipse(0, 0, 4, 2);
    graphics.endFill();
    // Head
    graphics.beginFill(0xffffff);
    graphics.drawCircle(3, 0, 2);
    graphics.endFill();
    return app.renderer.generateTexture(graphics);
  }

  return (
      <div>
          <h1>Ant Colony Simulation</h1>
          <p>The ants are searching for food (green). When they find it, they will return to the nest (blue), leaving a red pheromone trail. Other ants will follow the red trail to the food source.</p>
          <canvas ref={canvasRef}></canvas>
      </div>
  );
};

export default AntColonySimulator;
