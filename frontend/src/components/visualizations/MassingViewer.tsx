'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Plane, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface MassingViewerProps {
  climateZone?: string;
  plotArea?: number;
  orientation?: number; // degrees
}

function BuildingMass({ orientation = 0 }: { orientation?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Example building dimension
  const width = 10;
  const height = 6;
  const depth = 15;

  return (
    <Box
      ref={meshRef}
      args={[width, height, depth]}
      position={[0, height / 2, 0]}
      rotation={[0, (orientation * Math.PI) / 180, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color="#eeeeee" />
    </Box>
  );
}

export default function MassingViewer({
  climateZone = 'Composite',
  plotArea = 500,
  orientation = 15,
}: MassingViewerProps) {
  return (
    <div className="w-full h-[400px] bg-slate-50 rounded-lg border overflow-hidden relative">
      <Canvas shadows camera={{ position: [20, 20, 20], fov: 40 }}>
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        
        {/* Helper Objects */}
        <axesHelper args={[5]} />
        <gridHelper args={[50, 50]} position={[0, 0.01, 0]} />

        {/* Core Subject */}
        <BuildingMass orientation={orientation} />

        {/* Environment setup for better lighting/reflections if needed */}
        {/* <Environment preset="city" /> */}

        {/* Ground */}
        <Plane
          args={[50, 50]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <meshStandardMaterial color="#e2e8f0" />
        </Plane>
        
        {/* Controls */}
        <OrbitControls makeDefault />
      </Canvas>
      <div className="absolute top-4 left-4 pointer-events-none bg-slate-100 p-2 rounded text-sm shadow">
        <p className="font-semibold text-gray-700">3D Massing</p>
        <p className="text-xs text-gray-500">Zone: {climateZone}</p>
        <p className="text-xs text-gray-500">Orientation: {orientation}°</p>
      </div>
    </div>
  );
}
