import { useRef, useState } from "react";
import { Edges, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getLanguageColor } from "../constants/languages";
import { useNavigationStore } from "../store/useNavigationStore";
import { clampFileSize } from "../utils/repoTree";

const NORMAL_SCALE = new THREE.Vector3(1, 1, 1);
const HOVER_SCALE = new THREE.Vector3(1.08, 1.08, 1.08);

export default function FileBlock({
  file,
  labelMode = "always",
  labelOffset = [0, 0, 0],
  maxVisualSize = Infinity,
  position,
}) {
  const selectedFile = useNavigationStore((state) => state.selectedFile);
  const selectFile = useNavigationStore((state) => state.selectFile);
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef(null);
  const materialRef = useRef(null);
  const size = Math.min(clampFileSize(file.size), maxVisualSize);
  const color = getLanguageColor(file.language);
  const isSelected = selectedFile?.path === file.path;
  const isDensityHidden = labelMode === "hover" && !hovered && !isSelected;

  useFrame((_, delta) => {
    if (!groupRef.current || !materialRef.current) return;
    const damping = 1 - Math.exp(-delta * 9);
    groupRef.current.scale.lerp(hovered || isSelected ? HOVER_SCALE : NORMAL_SCALE, damping);
    materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      materialRef.current.emissiveIntensity,
      isSelected ? 1.15 : hovered ? 0.68 : 0.16,
      damping,
    );
  });

  function openFile(event) {
    event.stopPropagation();
    selectFile(file);
  }

  return (
    <group position={position} ref={groupRef}>
      <mesh
        castShadow
        onClick={openFile}
        onPointerOut={() => setHovered(false)}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
      >
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1.15 : 0.16}
          metalness={0.14}
          ref={materialRef}
          roughness={0.48}
        />
        <Edges color={isSelected ? "#c7dcff" : color} opacity={isSelected ? 1 : 0.62} />
      </mesh>
      <Html
        center
        position={[
          labelOffset[0],
          -size * 0.92 + labelOffset[1],
          size * 0.52 + labelOffset[2],
        ]}
        zIndexRange={[3, 0]}
      >
        <button
          className={`block-label block-label--file ${
            isSelected ? "is-selected" : ""
          } ${isDensityHidden ? "is-density-hidden" : ""}`}
          data-testid={`file-${file.path}`}
          onBlur={() => setHovered(false)}
          onClick={openFile}
          onFocus={() => setHovered(true)}
          type="button"
        >
          <span className="block-label__color" style={{ backgroundColor: color }} />
          {file.name}
        </button>
      </Html>
    </group>
  );
}
