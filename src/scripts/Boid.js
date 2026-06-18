// Represents a single boid in the simulation.
export class Boid {
    // Initializes a new Boid object.
    constructor(x, y, width, height, flockId, color) {
        // The boid's position in 2D space.
        this.position = new Vector(x, y);
        // The boid's velocity, initialized to a random 2D vector.
        this.velocity = Vector.random2D();
        // Sets the magnitude of the velocity to a random value between 2 and 6.
        this.velocity.setMag(Math.random() * 4 + 2);
        // The boid's acceleration.
        this.acceleration = new Vector();
        // The maximum force that can be applied to the boid.
        this.maxForce = 0.2;
        // The maximum speed of the boid.
        this.maxSpeed = 4;
        // The width of the canvas.
        this.width = width;
        // The height of the canvas.
        this.height = height;
        // The ID of the flock this boid belongs to.
        this.flockId = flockId;
        // The color of the boid.
        this.color = color;
        // The shape of the boid.
        this.shape = 'fish';
        // The size of the boid.
        this.size = 10; 
    }

    // Calculates the alignment steering force for the boid.
    align(boids) {
        // The radius within which the boid perceives other boids.
        let perceptionRadius = 50;
        // The total number of perceived boids.
        let total = 0;
        // The steering force to be applied.
        let steering = new Vector();
        // Iterates through all boids in the simulation.
        for (let other of boids) {
            // Calculates the distance to the other boid.
            let d = this.position.dist(other.position);
            // If the other boid is within the perception radius and belongs to the same flock...
            if (other !== this && d < perceptionRadius && this.flockId === other.flockId) {
                // ...add its velocity to the steering force.
                steering.add(other.velocity);
                total++;
            }
        }
        // If there are perceived boids...
        if (total > 0) {
            // ...calculate the average velocity and apply it as a steering force.
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    // Calculates the cohesion steering force for the boid.
    cohesion(boids) {
        // The radius within which the boid perceives other boids.
        let perceptionRadius = 100;
        // The total number of perceived boids.
        let total = 0;
        // The steering force to be applied.
        let steering = new Vector();
        // Iterates through all boids in the simulation.
        for (let other of boids) {
            // Calculates the distance to the other boid.
            let d = this.position.dist(other.position);
            // If the other boid is within the perception radius and belongs to the same flock...
            if (other !== this && d < perceptionRadius && this.flockId === other.flockId) {
                // ...add its position to the steering force.
                steering.add(other.position);
                total++;
            }
        }
        // If there are perceived boids...
        if (total > 0) {
            // ...steer towards the center of the perceived boids.
            steering.div(total);
            steering.sub(this.position);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    // Calculates the separation steering force for the boid.
    separation(boids) {
        // The radius within which the boid perceives other boids to avoid collision.
        let perceptionRadius = 25;
        // The total number of perceived boids.
        let total = 0;
        // The steering force to be applied.
        let steering = new Vector();
        // Iterates through all boids in the simulation.
        for (let other of boids) {
            // Calculates the distance to the other boid.
            let d = this.position.dist(other.position);
            // If the other boid is too close...
            if (other !== this && d < perceptionRadius) {
                // ...calculate a vector pointing away from the other boid, weighted by distance.
                let diff = this.position.copy().sub(other.position);
                diff.div(d); // The closer the other boid, the stronger the force.
                steering.add(diff);
                total++;
            }
        }
        // If there are perceived boids...
        if (total > 0) {
            // ...calculate the average separation force and apply it.
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce * 1.5); // Give separation a bit more priority
        }
        return steering;
    }

    // Steers away from nearby predators, weighted by inverse distance.
    flee(predators) {
        const fleeRadius = 120;
        let steering = new Vector();
        let total = 0;
        for (let pred of predators) {
            const d = this.position.dist(pred.position);
            if (d < fleeRadius && d > 0) {
                let diff = this.position.copy().sub(pred.position);
                diff.div(d);
                steering.add(diff);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce * 3);
        }
        return steering;
    }

    // Applies the flocking rules to the boid.
    flock(boids, predators = []) {
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separation(boids);

        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);

        if (predators.length > 0) {
            let flee = this.flee(predators);
            flee.mult(2.5);
            this.acceleration.add(flee);
        }
    }

    // Updates the boid's position and velocity.
    update() {
        // Updates the position based on the velocity.
        this.position.add(this.velocity);
        // Updates the velocity based on the acceleration.
        this.velocity.add(this.acceleration);
        // Limits the velocity to the maximum speed.
        this.velocity.limit(this.maxSpeed);
        // Resets the acceleration to zero.
        this.acceleration.mult(0);
    }

    // Wraps the boid's position around the canvas borders.
    borders() {
        if (this.position.x > this.width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = this.width;
        }
        if (this.position.y > this.height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = this.height;
        }
    }
}

// Predator boid that hunts the nearest fish prey.
export class Predator extends Boid {
    constructor(x, y, width, height) {
        super(x, y, width, height, -1, '#ff2222');
        this.maxSpeed = 5;
        this.maxForce = 0.15;
        this.size = 20;
        this.shape = 'predator';
        this.huntRadius = 200;
        this.target = null;
    }

    hunt(preyBoids) {
        let nearest = null;
        let minDist = this.huntRadius;
        for (let b of preyBoids) {
            const d = this.position.dist(b.position);
            if (d < minDist) { minDist = d; nearest = b; }
        }
        this.target = nearest;

        if (this.target) {
            let desired = this.target.position.copy().sub(this.position);
            desired.setMag(this.maxSpeed);
            let steer = desired.sub(this.velocity);
            steer.limit(this.maxForce);
            this.acceleration.add(steer);
        } else {
            let wander = Vector.random2D();
            wander.mult(0.05);
            this.acceleration.add(wander);
        }
    }
}

// Represents a 2D vector.
export class Vector {
    // Initializes a new Vector object.
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // Creates a new random 2D vector.
    static random2D() {
        let angle = Math.random() * Math.PI * 2;
        return new Vector(Math.cos(angle), Math.sin(angle));
    }

    // Adds a vector to this vector.
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    // Subtracts a vector from this vector.
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    // Multiplies this vector by a scalar.
    mult(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }

    // Divides this vector by a scalar.
    div(n) {
        this.x /= n;
        this.y /= n;
        return this;
    }

    // Calculates the magnitude of this vector.
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // Sets the magnitude of this vector.
    setMag(n) {
        return this.normalize().mult(n);
    }

    // Normalizes this vector.
    normalize() {
        let len = this.mag();
        if (len !== 0) {
            this.mult(1 / len);
        }
        return this;
    }

    // Limits the magnitude of this vector.
    limit(max) {
        const mSq = this.mag() * this.mag();
        if (mSq > max * max) {
            this.div(Math.sqrt(mSq)).mult(max);
        }
        return this;
    }

    // Calculates the distance to another vector.
    dist(v) {
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Creates a copy of this vector.
    copy() {
        return new Vector(this.x, this.y);
    }
}
