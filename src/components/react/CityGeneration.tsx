
import React, { useState, useEffect, useRef } from 'react';
import { Residential, Commercial, Industrial, Road } from '../../scripts/city-generation/buildings';

const CityGeneration = () => {
  const [gridSize, setGridSize] = useState(50);
  const [cellSize, setCellSize] = useState(16);
  const [grid, setGrid] = useState(() =>
    Array.from({ length: gridSize }, () => Array(gridSize).fill(null))
  );
  const [buildings, setBuildings] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    drawGrid(context, grid);
  }, [grid, gridSize, cellSize]);

  const getDensityColor = (baseColor, density) => {
    if (!density) return baseColor;
    switch (baseColor) {
      case 'blue':
        if (density === 'high') return '#000080'; // Dark Blue
        if (density === 'mid') return '#0000FF'; // Blue
        if (density === 'low') return '#ADD8E6'; // Light Blue
        break;
      case 'purple':
        if (density === 'high') return '#4B0082'; // Indigo
        if (density === 'mid') return '#800080'; // Purple
        if (density === 'low') return '#EE82EE'; // Violet
        break;
      case 'orange':
        if (density === 'high') return '#FF8C00'; // Dark Orange
        if (density === 'mid') return '#FFA500'; // Orange
        if (density === 'low') return '#FFD700'; // Gold
        break;
      default:
        return baseColor;
    }
  };

  const drawGrid = (context, grid) => {
    canvasRef.current.width = gridSize * cellSize;
    canvasRef.current.height = gridSize * cellSize;
    const drawnBuildings = new Set();

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const cell = grid[y][x];
        if (cell && !drawnBuildings.has(cell)) {
          let baseColor;
          if (cell.type === 'Residential') {
            baseColor = 'blue';
          } else if (cell.type === 'Commercial') {
            baseColor = 'purple';
          } else if (cell.type === 'Industrial') {
            baseColor = 'orange';
          } else if (cell.type === 'Road') {
            baseColor = 'grey';
          } else {
            baseColor = '#CCC';
          }
          context.fillStyle = getDensityColor(baseColor, cell.density);
          const width = (cell.width || 1) * cellSize;
          const height = (cell.height || 1) * cellSize;
          context.fillRect(x * cellSize, y * cellSize, width, height);
          drawnBuildings.add(cell);
        } else if (!cell) {
          context.fillStyle = '#CCC';
          context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
        context.strokeStyle = '#888';
        context.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  };

  const handleGenerate = () => {
    // Initial setup
    let newBuildings = [];
    const newGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
    const densities = ['high', 'mid', 'low'];

    // 1. Create a network of connected roads
    const roads = generateImprovedRoads(newGrid, gridSize);

    // 2. Place buildings only in lots adjacent to roads
    const buildingTypes = [Residential, Commercial, Industrial];
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (!newGrid[y][x]) {
                const hasAdjacentRoad = (
                    (newGrid[y-1] && newGrid[y-1][x] && newGrid[y-1][x].type === 'Road') ||
                    (newGrid[y+1] && newGrid[y+1][x] && newGrid[y+1][x].type === 'Road') ||
                    (newGrid[y][x-1] && newGrid[y][x-1].type === 'Road') ||
                    (newGrid[y][x+1] && newGrid[y][x+1].type === 'Road')
                );

                if (hasAdjacentRoad) {
                    let randomBuildingType, density;
                    // Industrial Zone with transition
                    if(x < gridSize * 0.25){
                        randomBuildingType = Industrial;
                        const industrialZoneEnd = gridSize * 0.25;
                        const x_norm = x / industrialZoneEnd; // Normalized position (0 to 1)

                        const p_low = (1 - x_norm) * (1 - x_norm);
                        const p_high = x_norm * x_norm;
                        const p_mid = 1 - p_low - p_high;

                        const rand = Math.random();
                        if (rand < p_low) {
                            density = 'low';
                        } else if (rand < p_low + p_mid) {
                            density = 'mid';
                        } else {
                            density = 'high';
                        }
                    } 
                    // Downtown/Commercial Zone
                    else if (x >= gridSize * 0.25 && x < gridSize * 0.5) {
                        const availableTypes = [Residential, Commercial];
                        randomBuildingType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

                        if (randomBuildingType === Residential) {
                            const availableDensities = ['high', 'mid'];
                            density = availableDensities[Math.floor(Math.random() * availableDensities.length)];
                        } else { // Commercial
                            const availableDensities = ['high', 'mid', 'low'];
                            density = availableDensities[Math.floor(Math.random() * availableDensities.length)];
                        }
                    } 
                    // Residential Zone with transition
                    else { 
                        randomBuildingType = Residential;
                        const transitionStart = gridSize * 0.5;
                        const transitionEnd = gridSize;
                        // The probability of 'low' density increases as x moves to the right
                        const probOfLow = (x - transitionStart) / (transitionEnd - transitionStart);

                        if (Math.random() < probOfLow) {
                            density = 'low';
                        } else {
                            density = 'mid';
                        }
                    }
                    
                    const width = Math.min(gridSize - x, Math.floor(Math.random() * 4) + 1);
                    const height = Math.min(gridSize - y, Math.floor(Math.random() * 4) + 1);
                    let canPlace = true;

                    for(let i=0; i<height; i++){
                        for(let j=0; j<width; j++){
                            if(newGrid[y+i] && newGrid[y+i][x+j]){
                                canPlace = false;
                                break;
                            }
                        }
                        if(!canPlace) break;
                    }
                    
                    if(canPlace){
                        let newBuilding;
                        if (randomBuildingType === Residential) {
                            newBuilding = new Residential(x, y, density, 10);
                        } else if (randomBuildingType === Commercial) {
                            newBuilding = new Commercial(x, y, density);
                        } else { // Industrial
                            newBuilding = new Industrial(x, y, density, 'Wood', 10, 100);
                        }

                        newBuilding.width = width;
                        newBuilding.height = height;

                        for(let i=0; i<height; i++){
                            for(let j=0; j<width; j++){
                                newGrid[y+i][x+j] = newBuilding;
                            }
                        }
                        newBuildings.push(newBuilding);
                    }
                }
            }
        }
    }

    mergeBuildings(newGrid, newBuildings, gridSize);

    setBuildings([...roads, ...newBuildings]);
    setGrid(newGrid);
  };

  const generateImprovedRoads = (grid, size) => {
    const roads = [];
    const roadCoords = new Set();
    const highwayY = Math.floor(size / 2);

    // Create a horizontal highway
    for (let x = 0; x < size; x++) {
        const road = new Road(x, highwayY);
        grid[highwayY][x] = road;
        roads.push(road);
        roadCoords.add(`${x},${highwayY}`);
    }

    const numBranches = size; // Control the number of branches

    for (let i = 0; i < numBranches; i++) {
        // Pick a random existing road point to branch from
        const existingRoadIndex = Math.floor(Math.random() * roads.length);
        const startNode = roads[existingRoadIndex];
        
        let x = startNode.x;
        let y = startNode.y;

        const branchLength = Math.floor(Math.random() * (size / 3)) + 2;
        const dir = Math.floor(Math.random() * 4); // 0: up, 1: down, 2: left, 3: right

        for (let j = 0; j < branchLength; j++) {
            if (dir === 0 && y > 0) y--;
            else if (dir === 1 && y < size - 1) y++;
            else if (dir === 2 && x > 0) x--;
            else if (dir === 3 && x < size - 1) x++;

            const coordKey = `${x},${y}`;
            if (!roadCoords.has(coordKey) && x > 0 && x < size - 1 && y > 0 && y < size - 1) {
                const newRoad = new Road(x, y);
                grid[y][x] = newRoad;
                roads.push(newRoad);
                roadCoords.add(coordKey);
            } else {
                // Stop branch if it hits another road or edge
                break;
            }
        }
    }

    return roads;
}

  const mergeBuildings = (grid, buildings, size) => {
    const mergedBuildings = new Set();

    for(let i = 0; i < buildings.length; i++){
        const buildingA = buildings[i];
        if(mergedBuildings.has(buildingA)) continue;

        for(let j = i + 1; j < buildings.length; j++){
            const buildingB = buildings[j];
            if(mergedBuildings.has(buildingB)) continue;

            if(buildingA.type === buildingB.type && buildingA.density === buildingB.density){
                const aX = buildingA.x;
                const aY = buildingA.y;
                const aW = buildingA.width || 1;
                const aH = buildingA.height || 1;

                const bX = buildingB.x;
                const bY = buildingB.y;
                const bW = buildingB.width || 1;
                const bH = buildingB.height || 1;

                // Check if they are adjacent
                if (aX < bX + bW && aX + aW > bX && aY < bY + bH && aY + aH > bY) {
                     const newX = Math.min(aX, bX);
                     const newY = Math.min(aY, bY);
                     const newW = Math.max(aX + aW, bX + bW) - newX;
                     const newH = Math.max(aY + aH, bY + bH) - newY;

                     // check if they truly form a rectangle
                     if((aX === bX && aW === bW && (aY + aH === bY || bY + bH === aY)) ||
                        (aY === bY && aH === bH && (aX + aW === bX || bX + bW === aX))){
                        
                        buildingA.x = newX;
                        buildingA.y = newY;
                        buildingA.width = newW;
                        buildingA.height = newH;

                        for(let row = bY; row < bY + bH; row++){
                            for(let col = bX; col < bX + bW; col++){
                                grid[row][col] = buildingA;
                            }
                        }
                        mergedBuildings.add(buildingB);
                     }
                }
            }
        }
    }

    const newBuildings = buildings.filter(b => !mergedBuildings.has(b));
    buildings.length = 0;
    buildings.push(...newBuildings);
  }

  const handleReset = () => {
    setGrid(Array.from({ length: gridSize }, () => Array(gridSize).fill(null)));
    setBuildings([]);
  };

  const handleSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setGridSize(newSize);
    setGrid(Array.from({ length: newSize }, () => Array(newSize).fill(null)));
    setCellSize(800 / newSize);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid black' }}
      />
      <div style={{ marginTop: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
            <span style={{ marginRight: '1rem' }}>■ Road</span>
            <span style={{ marginRight: '1rem' }}>■ Empty Lot</span>
            <div>
                <b>Residential:</b>
                <span style={{ color: '#ADD8E6', marginRight: '0.5rem' }}>■ Low</span>
                <span style={{ color: '#0000FF', marginRight: '0.5rem' }}>■ Mid</span>
                <span style={{ color: '#000080', marginRight: '1rem' }}>■ High</span>
            </div>
            <div>
                <b>Commercial:</b>
                <span style={{ color: '#EE82EE', marginRight: '0.5rem' }}>■ Low</span>
                <span style={{ color: '#800080', marginRight: '0.5rem' }}>■ Mid</span>
                <span style={{ color: '#4B0082', marginRight: '1rem' }}>■ High</span>
            </div>
            <div>
                <b>Industrial:</b>
                <span style={{ color: '#FFD700', marginRight: '0.5rem' }}>■ Low</span>
                <span style={{ color: '#FFA500', marginRight: '0.5rem' }}>■ Mid</span>
                <span style={{ color: '#FF8C00', marginRight: '1rem' }}>■ High</span>
            </div>
        </div>
        <label htmlFor="size-slider">Grid Size: {gridSize}</label>
        <input
          id="size-slider"
          type="range"
          min="10"
          max="100"
          value={gridSize}
          onChange={handleSizeChange}
        />
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleGenerate}>
          Generate
        </button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};

export default CityGeneration;
