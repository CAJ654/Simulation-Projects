
import React, { useState, useEffect, useRef } from 'react';
import { Residential, Commercial, Industrial, Road } from '../../scripts/city-generation/buildings';

const MAX_TICKS = 50;

// Returns a 2D demand score grid. High-demand cells are empty lots near dense buildings.
function computeDemandGrid(grid: any[][], size: number): number[][] {
    const demand = Array.from({ length: size }, () => Array(size).fill(0));
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (grid[y][x]) continue;
            let score = 0;
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    const ny = y + dy, nx = x + dx;
                    if (ny < 0 || ny >= size || nx < 0 || nx >= size) continue;
                    const cell = grid[ny][nx];
                    if (!cell) continue;
                    if (cell.type === 'Road') { score += 1; continue; }
                    score += cell.density === 'high' ? 4 : cell.density === 'mid' ? 2 : 1;
                }
            }
            // Small base demand near center to bootstrap early growth
            const centerDist = Math.hypot(x / size - 0.5, y / size - 0.5);
            if (centerDist < 0.25) score += 0.5;
            demand[y][x] = score;
        }
    }
    return demand;
}

// Returns zone type based on position: industrial at edges, commercial ring, residential interior.
function getZoneType(x: number, y: number, gridSize: number): 'industrial' | 'commercial' | 'residential' {
    const xFrac = x / gridSize;
    const yFrac = y / gridSize;
    const centerDist = Math.hypot(xFrac - 0.5, yFrac - 0.5);
    if (xFrac < 0.20 || xFrac > 0.80) return 'industrial';
    if (centerDist > 0.15 && centerDist < 0.30) return 'commercial';
    return 'residential';
}

const CityGeneration = () => {
  const [gridSize, setGridSize] = useState(50);
  const [cellSize, setCellSize] = useState(16);
  const [grid, setGrid] = useState<any[][]>(() =>
    Array.from({ length: gridSize }, () => Array(gridSize).fill(null))
  );
  const [buildings, setBuildings] = useState<any[]>([]);
  const [growMode, setGrowMode] = useState(false);
  const [tick, setTick] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const growStateRef = useRef<{
    grid: any[][] | null;
    roads: any[];
    roadCoords: Set<string>;
    buildings: any[];
  }>({ grid: null, roads: [], roadCoords: new Set(), buildings: [] });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    drawGrid(context, grid);
  }, [grid, gridSize, cellSize]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => { if (tickIntervalRef.current) clearInterval(tickIntervalRef.current); };
  }, []);

  const getDensityColor = (baseColor: string, density: string) => {
    if (!density) return baseColor;
    switch (baseColor) {
      case 'blue':
        if (density === 'high') return '#000080';
        if (density === 'mid') return '#0000FF';
        if (density === 'low') return '#ADD8E6';
        break;
      case 'purple':
        if (density === 'high') return '#4B0082';
        if (density === 'mid') return '#800080';
        if (density === 'low') return '#EE82EE';
        break;
      case 'orange':
        if (density === 'high') return '#FF8C00';
        if (density === 'mid') return '#FFA500';
        if (density === 'low') return '#FFD700';
        break;
      default:
        return baseColor;
    }
  };

  const drawGrid = (context: CanvasRenderingContext2D, grid: any[][]) => {
    if (!canvasRef.current) return;
    canvasRef.current.width = gridSize * cellSize;
    canvasRef.current.height = gridSize * cellSize;
    const drawnBuildings = new Set();

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const cell = grid[y][x];
        if (cell && !drawnBuildings.has(cell)) {
          let baseColor;
          if (cell.type === 'Residential') baseColor = 'blue';
          else if (cell.type === 'Commercial') baseColor = 'purple';
          else if (cell.type === 'Industrial') baseColor = 'orange';
          else if (cell.type === 'Road') baseColor = 'grey';
          else baseColor = '#CCC';
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

  const tickGrow = () => {
    const state = growStateRef.current;
    if (!state.grid) return;
    const { grid, roads, roadCoords, buildings } = state;
    const size = gridSize;

    // Find top demand cells and branch roads toward them
    const demand = computeDemandGrid(grid, size);
    const candidates: { x: number; y: number; score: number }[] = [];
    for (let y = 1; y < size - 1; y++) {
        for (let x = 1; x < size - 1; x++) {
            if (!grid[y][x] && demand[y][x] > 0) {
                candidates.push({ x, y, score: demand[y][x] });
            }
        }
    }
    candidates.sort((a, b) => b.score - a.score);

    for (const target of candidates.slice(0, 3)) {
        let nearest = roads[0];
        let minD = Infinity;
        for (const r of roads) {
            const d = Math.hypot(r.x - target.x, r.y - target.y);
            if (d < minD) { minD = d; nearest = r; }
        }
        const dx = Math.sign(target.x - nearest.x);
        const dy = Math.sign(target.y - nearest.y);
        let nx = nearest.x, ny = nearest.y;
        if (dx !== 0) nx += dx; else if (dy !== 0) ny += dy; else nx += 1;

        const key = `${nx},${ny}`;
        if (!roadCoords.has(key) && nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1) {
            const r = new Road(nx, ny);
            grid[ny][nx] = r;
            roads.push(r);
            roadCoords.add(key);
        }
    }

    // Fill empty cells adjacent to roads based on improved zone rules
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (grid[y][x]) continue;
            const adj = [grid[y-1]?.[x], grid[y+1]?.[x], grid[y]?.[x-1], grid[y]?.[x+1]];
            if (!adj.some((c: any) => c?.type === 'Road')) continue;

            const zone = getZoneType(x, y, size);
            const xFrac = x / size;
            let bldg: any;
            if (zone === 'industrial') {
                const density = (xFrac < 0.10 || xFrac > 0.90) ? 'high'
                              : (xFrac < 0.15 || xFrac > 0.85) ? 'mid' : 'low';
                bldg = new Industrial(x, y, density, 'Wood', 10, 100);
            } else if (zone === 'commercial') {
                const density = ['high', 'mid', 'low'][Math.floor(Math.random() * 3)];
                bldg = new Commercial(x, y, density);
            } else {
                const density = Math.random() < 0.3 ? 'high' : Math.random() < 0.5 ? 'mid' : 'low';
                bldg = new Residential(x, y, density, 10);
            }
            grid[y][x] = bldg;
            buildings.push(bldg);
        }
    }

    setGrid(grid.map(row => [...row]));
    setBuildings([...roads, ...buildings]);
  };

  const handleGrow = () => {
    if (growMode) {
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
        setGrowMode(false);
        return;
    }

    // Initialise fresh grid with a central highway
    const newGrid: any[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
    const highwayY = Math.floor(gridSize / 2);
    const initRoads: any[] = [];
    const initCoords = new Set<string>();
    for (let x = 0; x < gridSize; x++) {
        const r = new Road(x, highwayY);
        newGrid[highwayY][x] = r;
        initRoads.push(r);
        initCoords.add(`${x},${highwayY}`);
    }

    growStateRef.current = { grid: newGrid, roads: initRoads, roadCoords: initCoords, buildings: [] };
    setTick(0);
    setGrid(newGrid.map(row => [...row]));
    setBuildings([...initRoads]);
    setGrowMode(true);

    tickIntervalRef.current = setInterval(() => {
        setTick(prev => {
            if (prev >= MAX_TICKS) {
                if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
                setGrowMode(false);
                return prev;
            }
            tickGrow();
            return prev + 1;
        });
    }, 200);
  };

  const handleGenerate = () => {
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    setGrowMode(false);

    let newBuildings: any[] = [];
    const newGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
    const densities = ['high', 'mid', 'low'];

    const roads = generateImprovedRoads(newGrid, gridSize);

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
                    if (x < gridSize * 0.25) {
                        randomBuildingType = Industrial;
                        const industrialZoneEnd = gridSize * 0.25;
                        const x_norm = x / industrialZoneEnd;
                        const p_low = (1 - x_norm) * (1 - x_norm);
                        const p_high = x_norm * x_norm;
                        const p_mid = 1 - p_low - p_high;
                        const rand = Math.random();
                        if (rand < p_low) density = 'low';
                        else if (rand < p_low + p_mid) density = 'mid';
                        else density = 'high';
                    } else if (x >= gridSize * 0.25 && x < gridSize * 0.5) {
                        const availableTypes = [Residential, Commercial];
                        randomBuildingType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
                        if (randomBuildingType === Residential) {
                            density = ['high', 'mid'][Math.floor(Math.random() * 2)];
                        } else {
                            density = ['high', 'mid', 'low'][Math.floor(Math.random() * 3)];
                        }
                    } else {
                        randomBuildingType = Residential;
                        const transitionStart = gridSize * 0.5;
                        const transitionEnd = gridSize;
                        const probOfLow = (x - transitionStart) / (transitionEnd - transitionStart);
                        density = Math.random() < probOfLow ? 'low' : 'mid';
                    }

                    const width = Math.min(gridSize - x, Math.floor(Math.random() * 4) + 1);
                    const height = Math.min(gridSize - y, Math.floor(Math.random() * 4) + 1);
                    let canPlace = true;
                    for (let i = 0; i < height; i++) {
                        for (let j = 0; j < width; j++) {
                            if (newGrid[y+i] && newGrid[y+i][x+j]) { canPlace = false; break; }
                        }
                        if (!canPlace) break;
                    }
                    if (canPlace) {
                        let newBuilding: any;
                        if (randomBuildingType === Residential) newBuilding = new Residential(x, y, density, 10);
                        else if (randomBuildingType === Commercial) newBuilding = new Commercial(x, y, density);
                        else newBuilding = new Industrial(x, y, density, 'Wood', 10, 100);
                        newBuilding.width = width;
                        newBuilding.height = height;
                        for (let i = 0; i < height; i++) {
                            for (let j = 0; j < width; j++) {
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

  const generateImprovedRoads = (grid: any[][], size: number) => {
    const roads: any[] = [];
    const roadCoords = new Set<string>();
    const highwayY = Math.floor(size / 2);

    for (let x = 0; x < size; x++) {
        const road = new Road(x, highwayY);
        grid[highwayY][x] = road;
        roads.push(road);
        roadCoords.add(`${x},${highwayY}`);
    }

    const numBranches = size;
    for (let i = 0; i < numBranches; i++) {
        const startNode = roads[Math.floor(Math.random() * roads.length)];
        let x = startNode.x;
        let y = startNode.y;
        const branchLength = Math.floor(Math.random() * (size / 3)) + 2;
        const dir = Math.floor(Math.random() * 4);
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
                break;
            }
        }
    }
    return roads;
  };

  const mergeBuildings = (grid: any[][], buildings: any[], size: number) => {
    const mergedBuildings = new Set();
    for (let i = 0; i < buildings.length; i++) {
        const buildingA = buildings[i];
        if (mergedBuildings.has(buildingA)) continue;
        for (let j = i + 1; j < buildings.length; j++) {
            const buildingB = buildings[j];
            if (mergedBuildings.has(buildingB)) continue;
            if (buildingA.type === buildingB.type && buildingA.density === buildingB.density) {
                const aX = buildingA.x, aY = buildingA.y, aW = buildingA.width || 1, aH = buildingA.height || 1;
                const bX = buildingB.x, bY = buildingB.y, bW = buildingB.width || 1, bH = buildingB.height || 1;
                if (aX < bX + bW && aX + aW > bX && aY < bY + bH && aY + aH > bY) {
                    if ((aX === bX && aW === bW && (aY + aH === bY || bY + bH === aY)) ||
                        (aY === bY && aH === bH && (aX + aW === bX || bX + bW === aX))) {
                        buildingA.x = Math.min(aX, bX);
                        buildingA.y = Math.min(aY, bY);
                        buildingA.width = Math.max(aX + aW, bX + bW) - buildingA.x;
                        buildingA.height = Math.max(aY + aH, bY + bH) - buildingA.y;
                        for (let row = bY; row < bY + bH; row++) {
                            for (let col = bX; col < bX + bW; col++) {
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
  };

  const handleReset = () => {
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    setGrowMode(false);
    setTick(0);
    growStateRef.current = { grid: null, roads: [], roadCoords: new Set(), buildings: [] };
    setGrid(Array.from({ length: gridSize }, () => Array(gridSize).fill(null)));
    setBuildings([]);
  };

  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    setGrowMode(false);
    setTick(0);
    const newSize = parseInt(event.target.value, 10);
    setGridSize(newSize);
    setGrid(Array.from({ length: newSize }, () => Array(newSize).fill(null)));
    setCellSize(800 / newSize);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <canvas ref={canvasRef} style={{ border: '1px solid black' }} />
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
      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button onClick={handleGenerate}>Generate</button>
        <button onClick={handleGrow}>{growMode ? 'Stop Growing' : 'Grow'}</button>
        <button onClick={handleReset}>Reset</button>
        {growMode && <span style={{ fontSize: '0.85rem', color: '#666' }}>Tick: {tick}/{MAX_TICKS}</span>}
      </div>
    </div>
  );
};

export default CityGeneration;
