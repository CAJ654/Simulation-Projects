import type * as PIXI from 'pixi.js';

export interface FoodSource {
    id: number;
    x: number;
    y: number;
    quantity: number;
}

export interface PheromoneGrid {
    width: number;
    height: number;
    cellSize: number;
    grid: { toFood: Map<number, number>; toHome: number }[][];
}

export function getAntClass(PIXIInstance: typeof PIXI) {
    return class Ant {
        sprite: PIXI.Sprite;
        speed = 2;
        direction = Math.random() * Math.PI * 2;
        turningSpeed = 0.2;
        state: 'seeking-food' | 'returning-home' = 'seeking-food';
        lastPheromoneDrop = 0;
        carryingFoodId: number | null = null;

        constructor(texture: PIXI.Texture, x: number, y: number) {
            this.sprite = new PIXIInstance.Sprite(texture);
            this.sprite.anchor.set(0.5);
            this.sprite.position.set(x, y);
            this.sprite.rotation = this.direction;
        }

        // Returns the id of the delivered food source, or null if nothing delivered this tick.
        update(delta: number, foodSources: FoodSource[], nestLocation: PIXI.Point, pheromoneGrid: PheromoneGrid): number | null {
            if (this.state === 'seeking-food') {
                const gridX = Math.floor(this.sprite.x / pheromoneGrid.cellSize);
                const gridY = Math.floor(this.sprite.y / pheromoneGrid.cellSize);
                let maxPheromone = -1;
                let bestDirection = this.direction;

                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const newX = gridX + i;
                        const newY = gridY + j;
                        if (newX >= 0 && newX < pheromoneGrid.width && newY >= 0 && newY < pheromoneGrid.height) {
                            const cell = pheromoneGrid.grid[newY][newX];
                            cell.toFood.forEach((strength) => {
                                if (strength > maxPheromone) {
                                    maxPheromone = strength;
                                    bestDirection = Math.atan2(j, i);
                                }
                            });
                        }
                    }
                }

                if (maxPheromone > 0.1) {
                    let turn = bestDirection - this.direction;
                    if (turn > Math.PI) turn -= 2 * Math.PI;
                    if (turn < -Math.PI) turn += 2 * Math.PI;
                    this.direction += turn * 0.1;
                }

                if (this.sprite.position.x < 0 || this.sprite.position.x > pheromoneGrid.width * pheromoneGrid.cellSize ||
                    this.sprite.position.y < 0 || this.sprite.position.y > pheromoneGrid.height * pheromoneGrid.cellSize) {
                    this.direction += Math.PI;
                }

                for (const src of foodSources) {
                    const distanceToFood = Math.hypot(this.sprite.position.x - src.x, this.sprite.position.y - src.y);
                    if (distanceToFood < 10 && src.quantity > 0) {
                        this.carryingFoodId = src.id;
                        this.state = 'returning-home';
                        this.direction += Math.PI;
                        break;
                    }
                }
            } else { // returning-home
                const angleToNest = Math.atan2(nestLocation.y - this.sprite.y, nestLocation.x - this.sprite.x);
                this.direction = angleToNest;

                const distanceToNest = Math.hypot(this.sprite.position.x - nestLocation.x, this.sprite.position.y - nestLocation.y);
                if (distanceToNest < 10) {
                    this.state = 'seeking-food';
                    this.direction += Math.PI;
                    const deliveredId = this.carryingFoodId;
                    this.carryingFoodId = null;
                    return deliveredId;
                }
            }

            this.direction += (Math.random() - 0.5) * this.turningSpeed;

            this.sprite.x += Math.cos(this.direction) * this.speed * delta;
            this.sprite.y += Math.sin(this.direction) * this.speed * delta;
            this.sprite.rotation = this.direction;

            this.lastPheromoneDrop += delta;
            if (this.lastPheromoneDrop > 1) {
                this.lastPheromoneDrop = 0;
                if (this.state === 'returning-home' && this.carryingFoodId !== null) {
                    const gridX = Math.floor(this.sprite.x / pheromoneGrid.cellSize);
                    const gridY = Math.floor(this.sprite.y / pheromoneGrid.cellSize);

                    if (gridX >= 0 && gridX < pheromoneGrid.width && gridY >= 0 && gridY < pheromoneGrid.height) {
                        const cell = pheromoneGrid.grid[gridY][gridX];
                        const current = cell.toFood.get(this.carryingFoodId) ?? 0;
                        cell.toFood.set(this.carryingFoodId, Math.min(1, current + 0.5));
                    }
                }
            }
            return null;
        }
    };
}
