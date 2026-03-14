<script>
  import { onMount } from 'svelte';

  let gridSize = 30;
  let grid = [];
  let running = false;
  let hasStarted = false;
  const fireSpreadProbability = 0.5;

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

  const initializeGrid = () => {
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

    grid = newGrid;
    hasStarted = false;
  };

  onMount(initializeGrid);

  const runSimulation = () => {
    if (!running) {
      return;
    }

    const newGrid = JSON.parse(JSON.stringify(grid));
    const burningCells = [];

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (grid[row][col].isBurning) {
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
            const neighbor = grid[newRow][newCol];
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

    grid = newGrid;

    setTimeout(runSimulation, 200);
  }

  $: {
    if (running) {
      setTimeout(runSimulation, 200);
    } 
  }

  const toggleSimulation = () => {
    if (!hasStarted) {
      hasStarted = true;
    }
    running = !running;
  }

  const resetGrid = () => {
    running = false;
    initializeGrid();
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
</script>

<div>
  <div class="controls">
    <button on:click={toggleSimulation}>
      {!hasStarted ? 'Start' : running ? 'Pause' : 'Unpause'}
    </button>
    <button on:click={resetGrid}>Reset</button>
    <div class="slider">
      <label>Grid Size: {gridSize}</label>
      <input
        type="range"
        min="10"
        max="60"
        bind:value={gridSize}
        on:input={initializeGrid}
      />
    </div>
  </div>
  <div style="max-width: 100%; overflow-x: auto;">
    <div class="grid-container" style="grid-template-columns: repeat({gridSize}, 20px);">
      {#each grid as row, rowIndex}
        {#each row as cell, colIndex}
          <div
            class="grid-cell {getCellClass(cell)}"
          ></div>
        {/each}
      {/each}
    </div>
  </div>
  <div class="legend">
    <h3>Legend</h3>
    <div class="legend-item">
      <div class="legend-color forest"></div>
      <span>Forest</span>
    </div>
    <div class="legend-item">
      <div class="legend-color grassland"></div>
      <span>Grassland</span>
    </div>
    <div class="legend-item">
      <div class="legend-color desert"></div>
      <span>Desert</span>
    </div>
    <div class="legend-item">
      <div class="legend-color swamp"></div>
      <span>Swamp</span>
    </div>
    <div class="legend-item">
      <div class="legend-color tundra"></div>
      <span>Tundra</span>
    </div>
    <div class="legend-item">
      <div class="legend-color mountains"></div>
      <span>Mountains</span>
    </div>
    <div class="legend-item">
      <div class="legend-color river"></div>
      <span>River</span>
    </div>
    <div class="legend-item">
      <div class="legend-color ice"></div>
      <span>Ice</span>
    </div>
    <div class="legend-item">
      <div class="legend-color burning"></div>
      <span>Burning</span>
    </div>
    <div class="legend-item">
      <div class="legend-color burnt"></div>
      <span>Burnt</span>
    </div>
  </div>
</div>

<style>
  .controls {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .slider {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .grid-container {
    display: grid;
    border: 1px solid #333;
  }

  .grid-cell {
    width: 20px;
    height: 20px;
  }

  .legend {
    margin-top: 20px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }

  .legend-color {
    width: 20px;
    height: 20px;
    margin-right: 10px;
    border: 1px solid #ccc;
  }

  .forest { background-color: #228B22; }
  .grassland { background-color: #7CFC00; }
  .desert { background-color: #F4A460; }
  .swamp { background-color: #556B2F; }
  .tundra { background-color: #A9A9A9; }
  .mountains { background-color: #8B4513; }
  .river { background-color: #1E90FF; }
  .ice { background-color: #ADD8E6; }
  .burning {
    background-color: #FF4500;
    animation: fire-animation 0.5s infinite alternate;
  }
  .burnt { background-color: #36454F; }

  @keyframes fire-animation {
    from { background-color: #FF4500; }
    to { background-color: #FFD700; }
  }
</style>
