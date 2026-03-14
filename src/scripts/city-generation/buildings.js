
import { Product } from "./product.js";

class Building {
  constructor(x, y, density, width = 1, height = 1) {
    if (density && !['high', 'mid', 'low'].includes(density)) {
      throw new Error('Invalid density. Must be one of "high", "mid", or "low".');
    }
    this.x = x;
    this.y = y;
    this.density = density;
    this.width = width;
    this.height = height;
  }
}

class Residential extends Building {
  constructor(x, y, density, maxPopulation, width, height) {
    super(x, y, density, width, height);
    this.maxPopulation = maxPopulation;
    this.residents = [];
    this.type = 'Residential';
  }
}

class Commercial extends Building {
  constructor(x, y, density, width, height) {
    super(x, y, density, width, height);
    this.employees = [];
    this.stock = [];
    this.type = 'Commercial';
  }
}

class Industrial extends Building {
  constructor(x, y, density, productName, productPrice, productDemand, width, height) {
    super(x, y, density, width, height);
    this.employees = [];
    this.product = new Product(productName, productPrice, productDemand);
    this.type = 'Industrial';
  }
}

class Office extends Building {
  constructor(x, y, density, width, height) {
    super(x, y, density, width, height);
    this.type = 'Office';
  }
}

class Municipal extends Building {
  constructor(x, y, density, width, height) {
    super(x, y, density, width, height);
    this.type = 'Municipal';
  }
}

class Road extends Building {
    constructor(x, y) {
        super(x, y);
        this.type = 'Road';
    }
}

export { Building, Residential, Commercial, Industrial, Office, Municipal, Road };
