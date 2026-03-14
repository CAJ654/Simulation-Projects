import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

const Whirlpool = () => {
  const canvasRef = useRef(null);
  const [strength, setStrength] = useState(5);
  const [friction, setFriction] = useState(0.95);
  const [density, setDensity] = useState(10);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    let animationFrameId;

    // Initialize particles
    const numParticles = density * 100;
    particlesRef.current = [];
    for (let i = 0; i < numParticles; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      particlesRef.current.forEach(p => {
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        if (dist > 0) {
          const force = strength / dist;
          const ax = -Math.sin(angle) * force;
          const ay = Math.cos(angle) * force;

          p.vx += ax;
          p.vy += ay;
        }

        p.vx *= friction;
        p.vy *= friction;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.vx = 0;
          p.vy = 0;
        }

        ctx.fillStyle = 'white';
        ctx.fillRect(p.x, p.y, 1, 1);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
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
