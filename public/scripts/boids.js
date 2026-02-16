const canvas = document.getElementById('boids-canvas');
const ctx = canvas.getContext('2d');

// Panels and Toggles
const controlPanel = document.getElementById('control-panel');
const controlToggleButton = document.getElementById('control-toggle-button');
const shapesPanel = document.getElementById('shapes-panel');
const shapesToggleButton = document.getElementById('shapes-toggle-button');

// Controls
const flockSlider = document.getElementById('flock-slider');
const flockCount = document.getElementById('flock-count');
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const stationaryShapeSlidersContainer = document.getElementById('stationary-shape-sliders-container');

// Shapes
const shapes = document.querySelectorAll('.shape');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const boids = [];
const flockColors = [
    '#00ff00', '#ff0000', '#0000ff', '#ffff00', '#00ffff',
    '#ff00ff', '#ffffff', '#ff9900', '#9900ff', '#00ff99'
];

let stationaryShapeIdCounter = 0;

function createFlocks() {
    for (let i = boids.length - 1; i >= 0; i--) {
        if(boids[i].shape === 'fish') {
            boids.splice(i, 1);
        }
    }

    const numFlocks = parseInt(flockSlider.value);
    flockCount.textContent = numFlocks;
    const boidsPerFlock = 50;
    const speed = parseFloat(speedSlider.value);

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

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    boids.forEach(boid => {
        if (boid.shape === 'fish') {
            boid.flock(boids);
            boid.update();
            boid.borders();
        } 
    });

    boids.forEach(boid => {
        ctx.save();
        ctx.translate(boid.position.x, boid.position.y);
        
        if(boid.shape === 'fish') {
            const angle = Math.atan2(boid.velocity.y, boid.velocity.x);
            ctx.rotate(angle);
        }

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

    requestAnimationFrame(animate);
}

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

    slider.addEventListener('input', e => {
        const newSize = parseFloat(e.target.value);
        const targetBoidId = e.target.dataset.boidId;
        const boid = boids.find(b => b.id === targetBoidId);
        if (boid) {
            boid.size = newSize;
        }
        document.getElementById('size-value-' + targetBoidId).textContent = newSize;
    });

    stationaryShapeSlidersContainer.appendChild(label);
    stationaryShapeSlidersContainer.appendChild(slider);
}

// --- Event Listeners ---

controlToggleButton.addEventListener('click', () => {
    controlPanel.classList.toggle('hidden');
    if (controlPanel.classList.contains('hidden')) {
        controlToggleButton.innerHTML = '<';
    } else {
        controlToggleButton.innerHTML = '>';
    }
});

shapesToggleButton.addEventListener('click', () => {
    shapesPanel.classList.toggle('hidden');
    if (shapesPanel.classList.contains('hidden')) {
        shapesToggleButton.innerHTML = '>';
    } else {
        shapesToggleButton.innerHTML = '<';
    }
});

shapes.forEach(shape => {
    shape.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', e.target.dataset.shape);
    });
});

canvas.addEventListener('dragover', e => {
    e.preventDefault();
});

canvas.addEventListener('drop', e => {
    e.preventDefault();
    const shape = e.dataTransfer.getData('text/plain');
    const x = e.clientX;
    const y = e.clientY;
    
    const boid = new Boid(x, y, width, height, -1, '#ffffff'); 
    boid.shape = shape;

    if (shape === 'square' || shape === 'triangle') {
        const shapeId = shape + '-' + stationaryShapeIdCounter++;
        boid.id = shapeId;
        boid.maxSpeed = 0; 
        boid.size = 20; 
        createStationaryShapeSlider(shapeId, shape, boid.size);
    } else {
        const flockId = Math.floor(Math.random() * parseInt(flockSlider.value));
        boid.flockId = flockId;
        boid.color = flockColors[flockId % flockColors.length];
        boid.maxSpeed = parseFloat(speedSlider.value);
    }
    boids.push(boid);
});

flockSlider.addEventListener('input', createFlocks);

speedSlider.addEventListener('input', () => {
    const newSpeed = parseFloat(speedSlider.value);
    speedValue.textContent = newSpeed;
    boids.forEach(boid => {
        if (boid.shape === 'fish') {
            boid.maxSpeed = newSpeed;
        }
    });
});

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    boids.forEach(boid => {
        boid.width = width;
        boid.height = height;
    });
});

// --- Initialisation ---
shapesPanel.classList.add('hidden');
controlPanel.classList.add('hidden');

createFlocks();
speedValue.textContent = speedSlider.value;
animate();