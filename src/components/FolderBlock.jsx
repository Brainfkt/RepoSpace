import { useRef, useState } from "react";
import { Edges, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getLanguageColor } from "../constants/languages";
import { useNavigationStore } from "../store/useNavigationStore";
import {
  clampFolderSize,
  getDescendantFiles,
  getDescendantSize,
  layoutPreviewFiles,
} from "../utils/repoTree";

const NORMAL_SCALE = new THREE.Vector3(1, 1, 1);
const HOVER_SCALE = new THREE.Vector3(1.045, 1.045, 1.045);

function HintBlock({ file, position, size }) {
  const color = getLanguageColor(file.language);

  return (
    <mesh position={position} renderOrder={2}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.22}
        metalness={0.08}
        roughness={0.48}
      />
    </mesh>
  );
}

export default function FolderBlock({
  folder,
  labelMode = "always",
  labelOffset = [0, 0, 0],
  maxVisualSize = Infinity,
  position,
}) {
  const openFolder = useNavigationStore((state) => state.openFolder);
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef(null);
  const descendantFiles = getDescendantFiles(folder);
  const shellSize = Math.min(
    clampFolderSize(getDescendantSize(folder), descendantFiles.length),
    maxVisualSize,
  );
  const hints = layoutPreviewFiles(descendantFiles, shellSize * 0.78);
  const isDensityHidden = labelMode === "hover" && !hovered;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const damping = 1 - Math.exp(-delta * 9);
    groupRef.current.scale.lerp(hovered ? HOVER_SCALE : NORMAL_SCALE, damping);
  });

  function drillIn(event) {
    event.stopPropagation();
    openFolder(folder);
  }

  return (
    <group position={position} ref={groupRef}>
      <mesh
        onClick={drillIn}
        onPointerOut={() => setHovered(false)}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        renderOrder={1}
      >
        <boxGeometry args={[shellSize, shellSize, shellSize]} />
        <meshStandardMaterial
          color="#223143"
          depthWrite={false}
          emissive="#52769f"
          emissiveIntensity={hovered ? 0.34 : 0.1}
          opacity={hovered ? 0.22 : 0.12}
          transparent
        />
        <Edges color={hovered ? "#90b7e4" : "#5b7088"} opacity={hovered ? 0.95 : 0.62} />
      </mesh>
      <group position={[0, 0, shellSize * 0.1]}>
        {hints.map(({ file, position: hintPosition, size }) => (
          <HintBlock file={file} key={file.path} position={hintPosition} size={size} />
        ))}
      </group>
      <Html
        center
        position={[
          labelOffset[0],
          -shellSize * 0.72 + labelOffset[1],
          shellSize * 0.5 + labelOffset[2],
        ]}
        zIndexRange={[3, 0]}
      >
        <button
          className={`block-label block-label--folder ${
            isDensityHidden ? "is-density-hidden" : ""
          }`}
          data-testid={`folder-${folder.path}`}
          onBlur={() => setHovered(false)}
          onClick={drillIn}
          onFocus={() => setHovered(true)}
          type="button"
        >
          <span aria-hidden="true">+</span>
          {folder.name}
        </button>
      </Html>
    </group>
  );
}
