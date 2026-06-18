// Import the Boid, Vector, and Predator classes from Boid.js
import { Boid, Vector, Predator } from './Boid.js';

// Get the canvas and its 2D rendering context
const canvas = document.getElementById('boids-canvas');
const ctx = canvas.getContext('2d');

// Get the control panel and its toggle button
const controlPanel = document.getElementById('control-panel');
const controlToggleButton = document.getElementById('control-toggle-button');

// Get the shapes panel and its toggle button
const shapesPanel = document.getElementById('shapes-panel');
const shapesToggleButton = document.getElementById('shapes-toggle-button');

// Get the flock slider and its corresponding value display
const flockSlider = document.getElementById('flock-slider');
const flockCount = document.getElementById('flock-count');

// Get the speed slider and its corresponding value display
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');

// Get the predator slider and its corresponding value display
const predatorSlider = document.getElementById('predator-slider');
const predatorCount = document.getElementById('predator-count');

// Get the container for the stationary shape sliders
const stationaryShapeSlidersContainer = document.getElementById('stationary-shape-sliders-container');

// Get all the shape elements
const shapes = document.querySelectorAll('.shape');

// Set the canvas width and height to the window size
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Create arrays to store the boids and predators
const boids = [];
const predators = [];

// Define an array of colors for the different flocks
const flockColors = [
    '#00ff00', '#ff0000', '#0000ff', '#ffff00', '#00ffff',
    '#ff00ff', '#ffffff', '#ff9900', '#9900ff', '#00ff99'
];

// Initialize a counter for the stationary shape IDs
let stationaryShapeIdCounter = 0;

// Function to create the flocks of boids
function createFlocks() {
    // Remove all existing fish-shaped boids
    for (let i = boids.length - 1; i >= 0; i--) {
        if(boids[i].shape === 'fish') {
            boids.splice(i, 1);
        }
    }

    // Get the number of flocks from the slider
    const numFlocks = parseInt(flockSlider.value);
    flockCount.textContent = numFlocks;

    // Define the number of boids per flock
    const boidsPerFlock = 50;

    // Get the speed from the slider
    const speed = parseFloat(speedSlider.value);

    // Create the boids for each flock
    for (let i = 0; i < numFlocks; i++) {
        const flockId = i;
        const color = flockColors[i % flockColors.length];
        for (let j = 0; j < boidsPerFlock; j++) {
            const boid = new Boid(Math.random() * width, Math.random() * height, width, height, flockId, color);
            boid.maxSpeed = speed;
            boid.shape = 'fish';
            boids.push(boid);
        }
    }
}

// Function to create predator boids
function createPredators() {
    predators.length = 0;
    const count = parseInt(predatorSlider.value);
    predatorCount.textContent = count;
    for (let i = 0; i < count; i++) {
        const p = new Predator(Math.random() * width, Math.random() * height, width, height);
        predators.push(p);
    }
}

// Function to animate the boids
function animate() {
    // Clear the canvas with a semi-transparent black
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // Update each fish boid (pass predators for flee force)
    boids.forEach(boid => {
        if (boid.shape === 'fish') {
            boid.flock(boids, predators);
            boid.update();
            boid.borders();
        }
    });

    // Update each predator
    const fishBoids = boids.filter(b => b.shape === 'fish');
    predators.forEach(pred => {
        pred.hunt(fishBoids);
        pred.update();
        pred.borders();
    });

    // Draw each boid on the canvas
    boids.forEach(boid => {
        ctx.save();
        ctx.translate(boid.position.x, boid.position.y);
        
        // Rotate the boid to face the direction of its velocity
        if(boid.shape === 'fish') {
            const angle = Math.atan2(boid.velocity.y, boid.velocity.x);
            ctx.rotate(angle);
        }

        // Draw the boid based on its shape
        if (boid.shape === 'fish') {
            ctx.fillStyle = boid.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, 10, 5, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(3, -1, 1.5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(3.5, -1, 0.5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = boid.color;
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(-18, -7);
            ctx.lineTo(-18, 7);
            ctx.closePath();
            ctx.fill();
        } else if (boid.shape === 'triangle') {
            ctx.fillStyle = boid.color;
            ctx.beginPath();
            const size = boid.size || 10;
            ctx.moveTo(size, 0);
            ctx.lineTo(-size, -size * 0.7);
            ctx.lineTo(-size, size * 0.7);
            ctx.closePath();
            ctx.fill();
        } else if (boid.shape === 'square') {
            ctx.fillStyle = boid.color;
            ctx.beginPath();
            const size = boid.size || 20;
            ctx.rect(-size / 2, -size / 2, size, size);
            ctx.fill();
        }
        ctx.restore();
    });

    // Draw predators as red shark silhouettes
    predators.forEach(pred => {
        ctx.save();
        ctx.translate(pred.position.x, pred.position.y);
        ctx.rotate(Math.atan2(pred.velocity.y, pred.velocity.x));
        ctx.fillStyle = '#ff2222';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 8, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(8, -20);
        ctx.lineTo(16, -8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(12, -2, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(12.5, -2, 0.8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    });

    // Request the next animation frame
    requestAnimationFrame(animate);
}

// Function to create a size slider for a stationary shape
function createStationaryShapeSlider(boidId, shapeType, initialSize) {
    const sliderId = 'size-slider-' + boidId;
    const label = document.createElement('label');
    label.htmlFor = sliderId;
    const shapeName = shapeType.charAt(0).toUpperCase() + shapeType.slice(1);
    label.textContent = shapeName + ' ' + boidId.split('-')[1] + ' Size: ';
    const span = document.createElement('span');
    span.id = 'size-value-' + boidId;
    span.textContent = initialSize;
    label.appendChild(span);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = sliderId;
    slider.min = 5;
    slider.max = 50;
    slider.value = initialSize;
    slider.step = 1;
    slider.style.width = '100%';
    slider.dataset.boidId = boidId;

    // Add an event listener to the slider to update the boid's size
    slider.addEventListener('input', e => {
        const newSize = parseFloat(e.target.value);
        const targetBoidId = e.target.dataset.boidId;
        const boid = boids.find(b => b.id === targetBoidId);
        if (boid) {
            boid.size = newSize;
        }
        document.getElementById('size-value-' + targetBoidId).textContent = newSize;
    });

    // Add the slider to the container
    stationaryShapeSlidersContainer.appendChild(label);
    stationaryShapeSlidersContainer.appendChild(slider);
}

// --- Event Listeners ---

// Toggle the control panel when the toggle button is clicked
controlToggleButton.addEventListener('click', () => {
    controlPanel.classList.toggle('hidden');
    if (controlPanel.classList.contains('hidden')) {
        controlToggleButton.innerHTML = '<';
    } else {
        controlToggleButton.innerHTML = '>';
    }
});

// Toggle the shapes panel when the toggle button is clicked
shapesToggleButton.addEventListener('click', () => {
    shapesPanel.classList.toggle('hidden');
    if (shapesPanel.classList.contains('hidden')) {
        shapesToggleButton.innerHTML = '<';
    } else {
        shapesToggleButton.innerHTML = '>';
    }
});

// Add a dragstart event listener to each shape
shapes.forEach(shape => {
    shape.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', e.target.dataset.shape);
    });
});

// Add a dragover event listener to the canvas
canvas.addEventListener('dragover', e => {
    e.preventDefault();
});

// Add a drop event listener to the canvas
canvas.addEventListener('drop', e => {
    e.preventDefault();
    const shape = e.dataTransfer.getData('text/plain');
    const x = e.clientX;
    const y = e.clientY;
    
    // Create a new boid with the dropped shape
    const boid = new Boid(x, y, width, height, -1, '#ffffff'); 
    boid.shape = shape;

    // If the shape is a square or triangle, make it stationary and create a size slider
    if (shape === 'square' || shape === 'triangle') {
        const shapeId = shape + '-' + stationaryShapeIdCounter++;
        boid.id = shapeId;
        boid.maxSpeed = 0; 
        boid.size = 20; 
        createStationaryShapeSlider(shapeId, shape, boid.size);
    } else {
        // Otherwise, add it to a random flock
        const flockId = Math.floor(Math.random() * parseInt(flockSlider.value));
        boid.flockId = flockId;
        boid.color = flockColors[flockId % flockColors.length];
        boid.maxSpeed = parseFloat(speedSlider.value);
    }
    boids.push(boid);
});

// Add an input event listener to the flock slider
flockSlider.addEventListener('input', createFlocks);

// Add an input event listener to the predator slider
predatorSlider.addEventListener('input', createPredators);

// Add an input event listener to the speed slider
speedSlider.addEventListener('input', () => {
    const newSpeed = parseFloat(speedSlider.value);
    speedValue.textContent = newSpeed;
    boids.forEach(boid => {
        if (boid.shape === 'fish') {
            boid.maxSpeed = newSpeed;
        }
    });
});

// Add a resize event listener to the window
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    boids.forEach(boid => {
        boid.width = width;
        boid.height = height;
    });
    predators.forEach(pred => {
        pred.width = width;
        pred.height = height;
    });
});

// --- Initialisation ---

// Hide the panels initially
shapesPanel.classList.add('hidden');
controlPanel.classList.add('hidden');
controlToggleButton.innerHTML = '<';
shapesToggleButton.innerHTML = '<';


// Create the initial flocks and predators
createFlocks();
createPredators();

// Set the initial speed value
speedValue.textContent = speedSlider.value;

// Start the animation
animate();