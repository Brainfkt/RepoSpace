import { Edges, Grid, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useNavigationStore } from "../store/useNavigationStore";
import { useRepositoryStore } from "../store/useRepositoryStore";
import { getVisibleChildren, layoutBlocks } from "../utils/repoTree";
import CameraRig from "./CameraRig";
import FileBlock from "./FileBlock";
import FolderBlock from "./FolderBlock";
import RepoCube from "./RepoCube";

const REPO_POSITIONS = [
  [-5.8, 2.3, -1.8],
  [5.8, 2.35, -1.4],
  [0, 0.15, 0.4],
  [-5.6, -3.05, 0],
  [5.9, -3.1, 0.5],
];

function Overview({ repositories }) {
  return repositories.map((repo, index) => (
    <RepoCube key={repo.id} position={getRepoPosition(index)} repo={repo} />
  ));
}

function RepositoryShell() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[12.6, 8.6, 6.4]} />
        <meshStandardMaterial
          color="#111c29"
          emissive="#3b516c"
          emissiveIntensity={0.08}
          opacity={0.075}
          transparent
        />
        <Edges color="#7890ad" opacity={0.65} />
      </mesh>
    </group>
  );
}

function RepositoryInterior({ repo, folderPath }) {
  const visibleChildren = getVisibleChildren(repo, folderPath);
  const blocks = layoutBlocks(visibleChildren, {
    columns: visibleChildren.length > 8 ? 4 : 3,
    spacing: visibleChildren.length > 8 ? 2.7 : 3.15,
    rowSpacing: visibleChildren.length > 8 ? 3.25 : 3.72,
    depthOffset: 0.14,
  });

  return (
    <group>
      <RepositoryShell />
      {blocks.map(({ node, position }) =>
        node.type === "folder" ? (
          <FolderBlock folder={node} key={node.path} position={position} />
        ) : (
          <FileBlock file={node} key={node.path} position={position} />
        ),
      )}
    </group>
  );
}

function SceneContent() {
  const activeRepoId = useNavigationStore((state) => state.activeRepoId);
  const currentFolderPath = useNavigationStore((state) => state.currentFolderPath);
  const clearSelection = useNavigationStore((state) => state.clearSelection);
  const repositories = useRepositoryStore((state) => state.repositories);
  const repo =
    repositories.find((repository) => repository.id === activeRepoId) ?? null;

  return (
    <>
      <color args={["#030609"]} attach="background" />
      <fog args={["#030609", 18, 48]} attach="fog" />
      <ambientLight intensity={0.58} />
      <directionalLight color="#ccddff" intensity={1.2} position={[6, 10, 8]} />
      <pointLight color="#2959a4" intensity={6} position={[-8, -3, 4]} />
      <pointLight color="#1f9898" intensity={4} position={[8, 3, -5]} />
      <Stars count={650} depth={48} factor={1.6} fade radius={48} saturation={0} speed={0.12} />
      <Grid
        args={[58, 58]}
        cellColor="#152436"
        cellSize={1}
        cellThickness={0.5}
        fadeDistance={40}
        fadeStrength={1.2}
        position={[0, -5.2, 0]}
        sectionColor="#26364b"
        sectionSize={5}
        sectionThickness={0.8}
      />
      <group onPointerMissed={clearSelection}>
        {repo ? (
          <RepositoryInterior folderPath={currentFolderPath} repo={repo} />
        ) : (
          <Overview repositories={repositories} />
        )}
      </group>
      <CameraRig />
    </>
  );
}

function getRepoPosition(index) {
  if (REPO_POSITIONS[index]) return REPO_POSITIONS[index];

  const overflowIndex = index - REPO_POSITIONS.length;
  const angle = (overflowIndex / 8) * Math.PI * 2;
  const ring = Math.floor(overflowIndex / 8);
  const radius = 7.5 + ring * 2.1;

  return [
    Math.cos(angle) * radius,
    ((overflowIndex % 3) - 1) * 2.25,
    Math.sin(angle) * 1.8 - 2.4,
  ];
}

export default function Scene() {
  return (
    <div className="scene-canvas">
      <Canvas
        camera={{ fov: 44, position: [0, 4.8, 18.5] }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onPointerMissed={() => useNavigationStore.getState().clearSelection()}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
