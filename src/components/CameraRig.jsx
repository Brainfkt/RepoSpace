import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useNavigationStore } from "../store/useNavigationStore";

const OVERVIEW_POSITION = new THREE.Vector3(0, 4.8, 18.5);
const REPO_POSITION = new THREE.Vector3(0, 1.2, 13.5);
const FOLDER_POSITION = new THREE.Vector3(0, 0.4, 11.2);
const ORIGIN = new THREE.Vector3(0, 0, 0);

export default function CameraRig() {
  const activeRepoId = useNavigationStore((state) => state.activeRepoId);
  const currentFolderPath = useNavigationStore((state) => state.currentFolderPath);
  const controlsRef = useRef(null);
  const transitioningRef = useRef(true);
  const destinationRef = useRef(OVERVIEW_POSITION.clone());
  const targetRef = useRef(ORIGIN.clone());
  const { camera } = useThree();

  useEffect(() => {
    destinationRef.current = !activeRepoId
      ? OVERVIEW_POSITION.clone()
      : currentFolderPath
        ? FOLDER_POSITION.clone()
        : REPO_POSITION.clone();
    targetRef.current = ORIGIN.clone();
    transitioningRef.current = true;
  }, [activeRepoId, currentFolderPath]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls || !transitioningRef.current) return;

    const damping = 1 - Math.exp(-delta * 4.8);
    camera.position.lerp(destinationRef.current, damping);
    controls.target.lerp(targetRef.current, damping);
    controls.update();

    if (camera.position.distanceTo(destinationRef.current) < 0.04) {
      camera.position.copy(destinationRef.current);
      transitioningRef.current = false;
    }
  });

  return (
    <OrbitControls
      enableDamping
      enablePan={false}
      maxDistance={activeRepoId ? 16 : 24}
      maxPolarAngle={Math.PI * 0.68}
      minDistance={activeRepoId ? 7.5 : 14}
      minPolarAngle={Math.PI * 0.24}
      ref={controlsRef}
      rotateSpeed={0.45}
      zoomSpeed={0.6}
    />
  );
}
