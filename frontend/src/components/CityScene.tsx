import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

/**
 * Lightweight smart-city point cloud. Deliberately modest (a few hundred
 * points on a dark grid) so it stays smooth on average laptops and phones.
 * Skipped entirely when the user prefers reduced motion.
 */
function CityCloud({ variant }: { variant: 'hero' | 'ambient' }) {
  const group = useRef<THREE.Group>(null);
  const reduced = usePrefersReducedMotion();

  const geometry = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const span = 12;
    const step = variant === 'hero' ? 0.55 : 0.8;
    const cyan = new THREE.Color('#22D3EE');
    const violet = new THREE.Color('#8B5CF6');
    const blue = new THREE.Color('#38BDF8');

    for (let x = -span; x <= span; x += step) {
      for (let z = -span; z <= span; z += step) {
        const dist = Math.sqrt(x * x + z * z);
        if (dist > span) continue;
        // City blocks: taller near the centre, mostly empty at the edges.
        const h = Math.max(0.04, (1 - dist / span) * (Math.random() * 2.2 + 0.15));
        positions.push(x + (Math.random() - 0.5) * 0.12, h, z + (Math.random() - 0.5) * 0.12);
        const c = dist < span * 0.35 ? cyan : dist < span * 0.7 ? blue : violet;
        colors.push(c.r, c.g, c.b);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, [variant]);

  useFrame((state) => {
    if (!group.current || reduced) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.045;
    group.current.position.y = Math.sin(t * 0.4) * 0.12;
  });

  return (
    <group ref={group} rotation={[0, 0, 0]}>
      <points geometry={geometry}>
        <pointsMaterial
          size={variant === 'hero' ? 0.075 : 0.055}
          vertexColors
          transparent
          opacity={variant === 'hero' ? 0.95 : 0.5}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* Grid floor */}
      <gridHelper args={[24, 24, '#1e3a5f', '#122238']} position={[0, -0.01, 0]} />
      {/* Scanner ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[4.2, 4.28, 96]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')),
    );
  } catch {
    return false;
  }
}

function StaticBackdrop() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.16),transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(6,10,24,0.9),transparent)]" />
    </div>
  );
}

/** If WebGL is unavailable or the scene throws, show a static gradient instead. */
class SceneErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    // Silently degrade: the hero must never take down the app.
  }
  render() {
    return this.state.failed ? <StaticBackdrop /> : this.props.children;
  }
}

export function CityScene({ variant = 'hero' }: { variant?: 'hero' | 'ambient' }) {
  const reduced = usePrefersReducedMotion();
  const [supported, setSupported] = React.useState(true);

  React.useEffect(() => {
    setSupported(hasWebGL());
  }, []);

  if (reduced || !supported) {
    return <StaticBackdrop />;
  }

  return (
    <SceneErrorBoundary>
      <div className="h-full w-full" aria-hidden>
        <Canvas
          dpr={[1, 1.6]}
          camera={{ position: variant === 'hero' ? [0, 5.2, 11] : [0, 6, 12], fov: 46 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          frameloop="always"
        >
          <color attach="background" args={['#04070F']} />
          <fog attach="fog" args={['#04070F', 12, 26]} />
          <ambientLight intensity={0.6} />
          <CityCloud variant={variant} />
        </Canvas>
      </div>
    </SceneErrorBoundary>
  );
}

export default CityScene;
