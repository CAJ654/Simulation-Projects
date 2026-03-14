import * as PIXI from 'pixi.js';

export enum PheromoneType {
  ToHome,
  ToFood,
}

export class Ant {
  sprite: PIXI.Sprite;
  direction: number = Math.random() * Math.PI * 2;
  carryingFood: boolean = false;
  private speed = 2;
  private pheromoneDropCounter = 0;

  constructor(texture: PIXI.Texture, x: number, y: number) {
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.anchor.set(0.5);
    this.sprite.rotation = this.direction;
  }

  update(delta: number, foodLocation: PIXI.Point, nestLocation: PIXI.Point, pheromoneTexture: PIXI.RenderTexture, app: PIXI.Application) {
    const pheromoneData = app.renderer.extract.pixels(pheromoneTexture);

    const turnStrength = 0.2;
    const sensorAngle = Math.PI / 4; // 45 degrees
    const sensorDistance = 10;

    const centerSensor = this.getSensor(this.direction, sensorDistance);
    const leftSensor = this.getSensor(this.direction - sensorAngle, sensorDistance);
    const rightSensor = this.getSensor(this.direction + sensorAngle, sensorDistance);

    const centerColor = this.getPixelColor(centerSensor, pheromoneData, app.screen.width);
    const leftColor = this.getPixelColor(leftSensor, pheromoneData, app.screen.width);
    const rightColor = this.getPixelColor(rightSensor, pheromoneData, app.screen.width);

    const targetPheromoneChannel = this.carryingFood ? 0 : 1; // 0 for Red (to home), 1 for Green (to food)

    const centerStrength = centerColor[targetPheromoneChannel];
    const leftStrength = leftColor[targetPheromoneChannel];
    const rightStrength = rightColor[targetPheromoneChannel];

    if (centerStrength > leftStrength && centerStrength > rightStrength) {
      // Continue straight
    } else if (leftStrength > rightStrength) {
      this.direction -= turnStrength;
    } else if (rightStrength > leftStrength) {
      this.direction += turnStrength;
    } else {
        // Wander
        this.direction += (Math.random() - 0.5) * 0.5;
    }

    // Food and Nest interaction
    if (!this.carryingFood && this.isNear(foodLocation, 15)) {
      this.carryingFood = true;
      this.direction += Math.PI; // Turn around
    }
    if (this.carryingFood && this.isNear(nestLocation, 15)) {
      this.carryingFood = false;
      this.direction += Math.PI; // Turn around
    }

    const vx = Math.cos(this.direction) * this.speed;
    const vy = Math.sin(this.direction) * this.speed;

    this.sprite.x += vx * delta;
    this.sprite.y += vy * delta;
    this.sprite.rotation = this.direction;

    // Boundary checks
    this.handleBoundaries(app.screen.width, app.screen.height);

    this.pheromoneDropCounter++;
  }

  shouldDropPheromone(): boolean {
      return this.pheromoneDropCounter % 10 === 0;
  }

  private getSensor(angle: number, distance: number): PIXI.Point {
      return new PIXI.Point(
          this.sprite.x + Math.cos(angle) * distance,
          this.sprite.y + Math.sin(angle) * distance
      );
  }

  private getPixelColor(point: PIXI.Point, data: Uint8Array, width: number): [number, number, number] {
      const x = Math.floor(point.x);
      const y = Math.floor(point.y);
      if (x < 0 || x >= width || y < 0 || y >= data.length / (width * 4)) {
          return [0, 0, 0];
      }
      const i = (y * width + x) * 4;
      return [data[i], data[i + 1], data[i + 2]]; // R, G, B
  }

  private isNear(point: PIXI.Point, radius: number): boolean {
    return (this.sprite.x - point.x) ** 2 + (this.sprite.y - point.y) ** 2 < radius ** 2;
  }

  private handleBoundaries(width: number, height: number) {
    const margin = 5;
    if (this.sprite.x < margin || this.sprite.x > width - margin || this.sprite.y < margin || this.sprite.y > height - margin) {
        this.direction += Math.PI * 0.9; // Turn back towards center
    }
  }
}
