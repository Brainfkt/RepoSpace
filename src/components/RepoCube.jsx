import { useRef, useState } from "react";
import { Edges, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getLanguageColor } from "../constants/languages";
import { useNavigationStore } from "../store/useNavigationStore";
import {
  getDescendantFiles,
  getDescendantSize,
  getRepoScale,
  layoutPreviewFiles,
} from "../utils/repoTree";

function PreviewBlock({ file, position, size }) {
  const color = getLanguageColor(file.language);

  return (
    <mesh position={position}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.14}
        metalness={0.1}
        roughness={0.55}
      />
    </mesh>
  );
}

export default function RepoCube({ position, repo }) {
  const openRepo = useNavigationStore((state) => state.openRepo);
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef(null);
  const materialRef = useRef(null);
  const scale = getRepoScale(getDescendantSize(repo));
  const previewFiles = layoutPreviewFiles(getDescendantFiles(repo), scale * 0.84);

  useFrame((state, delta) => {
    if (!groupRef.current || !materialRef.current) return;
    const damping = 1 - Math.exp(-delta * 7);
    const destination = hovered ? 1.05 : 1;
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(groupRef.current.scale.x, destination, damping),
    );
    groupRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.7 + position[0]) * 0.12;
    groupRef.current.rotation.y += delta * (hovered ? 0.08 : 0.025);
    materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      materialRef.current.emissiveIntensity,
      hovered ? 0.46 : 0.1,
      damping,
    );
  });

  function selectRepo(event) {
    event.stopPropagation();
    openRepo(repo.id);
  }

  return (
    <group position={position} ref={groupRef}>
      <mesh
        onClick={selectRepo}
        onPointerOut={() => setHovered(false)}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
      >
        <boxGeometry args={[scale, scale, scale]} />
        <meshStandardMaterial
          color="#162130"
          emissive="#7186a2"
          emissiveIntensity={0.1}
          opacity={hovered ? 0.2 : 0.1}
          ref={materialRef}
          transparent
        />
        <Edges color={hovered ? "#d2deef" : "#8a9aaf"} opacity={hovered ? 1 : 0.72} />
      </mesh>
      {previewFiles.map(({ file, position: previewPosition, size }) => (
        <PreviewBlock file={file} key={file.path} position={previewPosition} size={size} />
      ))}
      <Html center position={[scale * 0.82, 0, 0]} zIndexRange={[3, 0]}>
        <button
          className="repo-label"
          data-testid={`repo-${repo.id}`}
          onClick={selectRepo}
          type="button"
        >
          <strong>
            <span aria-hidden="true">&gt;</span>
            {repo.name}
          </strong>
          <small>
            <span>☆ {repo.stats.stars}</span>
            <span>|</span>
            <span>⑂ {repo.stats.forks}</span>
          </small>
        </button>
      </Html>
    </group>
  );
}
