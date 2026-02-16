import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

const Whirlpool = () => {
  const canvasRef = useRef(null);
  const [strength, setStrength] = useState(5);
  const [friction, setFriction] = useState(0.95);
  const [density, setDensity] = useState(10);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // Vector field simulation logic will go here
    // For now, let's just draw a placeholder
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Vector Field Simulation Placeholder', canvas.width / 2, canvas.height / 2);
  }, [strength, friction, density]);

  return (
    <div>
      <canvas ref={canvasRef} width="800" height="600" style={{ border: '1px solid black' }}></canvas>
      <div>
        <label>
          Strength:
          <input type="range" min="1" max="10" value={strength} onInput={(e) => setStrength(e.currentTarget.value)} />
          {strength}
        </label>
      </div>
      <div>
        <label>
          Friction:
          <input type="range" min="0.9" max="0.99" step="0.01" value={friction} onInput={(e) => setFriction(e.currentTarget.value)} />
          {friction}
        </label>
      </div>
      <div>
        <label>
          Density:
          <input type="range" min="1" max="20" value={density} onInput={(e) => setDensity(e.currentTarget.value)} />
          {density}
        </label>
      </div>
    </div>
  );
};

export default Whirlpool;
