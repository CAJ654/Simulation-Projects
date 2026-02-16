import React, { useState, useEffect, useRef, useCallback } from 'react';

// Define the structure of a tile
const vegetationTypes = ['Forest', 'Grassland', 'Desert', 'Tundra', 'Ice', 'Mountains', 'Swamp', 'River'];
const densityTypes = ['dense', 'planted', 'patchy', 'sparse'];
const temperatureTypes = ['cold', 'neutral', 'warm'];

const vegetationRules = {
  Forest: { densities: ['dense', 'planted', 'patchy'], temperatures: ['cold', 'neutral', 'warm'] },
  Grassland: { densities: ['patchy', 'planted'], temperatures: ['cold', 'neutral', 'warm'] },
  Desert: { densities: ['sparse'], temperatures: ['warm'] },
  Tundra: { densities: ['patchy', 'sparse'], temperatures: ['cold'] },
  Ice: { densities: ['sparse'], temperatures: ['cold'] },
  Mountains: { densities: ['patchy', 'sparse'], temperatures: ['cold', 'neutral', 'warm'] },
  Swamp: { densities: ['planted', 'dense'], temperatures: ['neutral', 'warm'] },
  River: { densities: [], temperatures: [] }
};

const ForestFireSimulator = () => {
  const [gridSize, setGridSize] = useState(30);
  const [grid, setGrid] = useState([]);
  const [running, setRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const fireSpreadProbability = 0.5;

  const runningRef = useRef(running);
  runningRef.current = running;

  const initializeGrid = useCallback(() => {
    const newGrid = [];
    for (let row = 0; row < gridSize; row++) {
      const currentRow = [];
      for (let col = 0; col < gridSize; col++) {
        const vegetation = vegetationTypes[Math.floor(Math.random() * vegetationTypes.length)];
        const rules = vegetationRules[vegetation];
        const density = rules.densities.length > 0 ? rules.densities[Math.floor(Math.random() * rules.densities.length)] : 'sparse';
        const temperature = rules.temperatures.length > 0 ? rules.temperatures[Math.floor(Math.random() * rules.temperatures.length)] : 'neutral';
        
        currentRow.push({
          vegetation,
          density,
          temperature,
          isBurning: false,
          isBurnt: false,
        });
      }
      newGrid.push(currentRow);
    }
    
    // Find a random flammable tile to start the fire
    let foundStartFire = false;
    while (!foundStartFire) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      const tile = newGrid[row][col];
      
      const isFlammable = tile.vegetation !== 'River' && tile.vegetation !== 'Ice' && tile.density !== 'sparse';

      if (isFlammable) {
        newGrid[row][col].isBurning = true;
        foundStartFire = true;
      }
    }


    setGrid(newGrid);
    setHasStarted(false);
  }, [gridSize]);

  useEffect(() => {
    initializeGrid();
  }, [gridSize, initializeGrid]);

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }

    setGrid(g => {
      const newGrid = JSON.parse(JSON.stringify(g));
      const burningCells = [];

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          if (g[row][col].isBurning) {
            burningCells.push([row, col]);
          }
        }
      }

      burningCells.forEach(([row, col]) => {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) {
              continue;
            }

            const newRow = row + i;
            const newCol = col + j;

            if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
              const neighbor = g[newRow][newCol];
              if (!neighbor.isBurning && !neighbor.isBurnt) {
                
                let chance = fireSpreadProbability;

                if (neighbor.density === 'sparse' || neighbor.vegetation === 'River' || neighbor.vegetation === 'Ice') {
                  chance = 0;
                } else if (neighbor.density === 'planted') {
                  chance *= 1.33;
                } else if (neighbor.density === 'dense') {
                  chance *= 1.77;
                }
                
                if (neighbor.temperature === 'cold') {
                  chance *= 0.67;
                } else if (neighbor.temperature === 'warm') {
                  chance *= 1.33;
                }
                
                if (Math.random() < chance) {
                  newGrid[newRow][newCol].isBurning = true;
                }
              }
            }
          }
        }
        newGrid[row][col].isBurning = false;
        newGrid[row][col].isBurnt = true;
      });

      return newGrid;
    });

    setTimeout(runSimulation, 200);
  }, [gridSize, fireSpreadProbability]);
  
  useEffect(() => {
    if (running) {
      runningRef.current = true;
      runSimulation();
    } else {
      runningRef.current = false;
    }
  }, [running, runSimulation]);

  const toggleSimulation = () => {
    if (!hasStarted) {
      setHasStarted(true);
    }
    setRunning(!running);
  }
  
  const getCellClass = (cell) => {
    if (cell.isBurning) {
      return 'burning';
    }
    if (cell.isBurnt) {
      return 'burnt';
    }
    return cell.vegetation.toLowerCase();
  }

  return (
    <div>
      <div className="controls">
        <button onClick={toggleSimulation}>
          {!hasStarted ? 'Start' : running ? 'Pause' : 'Unpause'}
        </button>
        <button onClick={() => { setRunning(false); initializeGrid(); }}>Reset</button>
        <div className="slider">
          <label>Grid Size: {gridSize}</label>
          <input
            type="range"
            min="10"
            max="60"
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
          />
        </div>
      </div>
      <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
        <div className="grid-container" style={{ gridTemplateColumns: `repeat(${gridSize}, 20px)` }}>
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`grid-cell ${getCellClass(cell)}`}>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="legend">
        <h3>Legend</h3>
        <div className="legend-item">
          <div className="legend-color forest"></div>
          <span>Forest</span>
        </div>
        <div className="legend-item">
          <div className="legend-color grassland"></div>
          <span>Grassland</span>
        </div>
        <div className="legend-item">
          <div className="legend-color desert"></div>
          <span>Desert</span>
        </div>
        <div className="legend-item">
          <div className="legend-color swamp"></div>
          <span>Swamp</span>
        </div>
        <div className="legend-item">
          <div className="legend-color tundra"></div>
          <span>Tundra</span>
        </div>
        <div className="legend-item">
          <div className="legend-color mountains"></div>
          <span>Mountains</span>
        </div>
        <div className="legend-item">
          <div className="legend-color river"></div>
          <span>River</span>
        </div>
        <div className="legend-item">
          <div className="legend-color ice"></div>
          <span>Ice</span>
        </div>
        <div className="legend-item">
          <div className="legend-color burning"></div>
          <span>Burning</span>
        </div>
        <div className="legend-item">
          <div className="legend-color burnt"></div>
          <span>Burnt</span>
        </div>
      </div>
    </div>
  );
};

export default ForestFireSimulator;