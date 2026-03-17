'use client';

import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface MassingViewerProps {
  climateZone?: string;
  plotArea?: number;
  orientation?: number; // degrees
}

function BuildingGroup({ climateZone = 'Composite', orientation = 0 }: MassingViewerProps) {
    const groupRef = useRef<THREE.Group>(null);

    const isHotDry = climateZone === "Hot-Dry";
    const boxArgs: [number, number, number] = isHotDry ? [10, 6, 12] : [14, 4, 8];
    const buildingColor = isHotDry ? "#E5D9C5" : "#D4E0D1";

    return (
        <group ref={groupRef} rotation={[0, (orientation * Math.PI) / 180, 0]}>
            <mesh position={[0, boxArgs[1] / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={boxArgs} />
                <meshStandardMaterial color={buildingColor} roughness={0.8} />
            </mesh>
            {isHotDry ? (
                <mesh position={[0, boxArgs[1] / 2 + 0.1, 0]} receiveShadow>
                    <boxGeometry args={[4, boxArgs[1] + 0.2, 4]} />
                    <meshStandardMaterial color="#A39A8E" roughness={0.9} />
                </mesh>
            ) : (
                <mesh position={[0, boxArgs[1] + 1.5, 0]} castShadow>
                     <coneGeometry args={[10, 3, 4]} rotation={[0, Math.PI / 4, 0]} />
                     <meshStandardMaterial color="#B85D3B" roughness={0.9} />
                </mesh>
            )}
        </group>
    );
}

export default function MassingViewer({
  climateZone = 'Composite',
  plotArea = 500,
  orientation = 15,
}: MassingViewerProps) {
  return (
    <div className="w-full h-[400px] bg-slate-50 rounded-lg border overflow-hidden relative group">
      <Canvas shadows camera={{ position: [20, 15, 25], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        
        <axesHelper args={[5]} />
        <gridHelper args={[50, 50]} position={[0, 0.01, 0]} />

        <BuildingGroup climateZone={climateZone} orientation={orientation} />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.1, 0]}
          receiveShadow
        >
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        
        <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.4} far={10} color="#000000" />
        <Environment preset="city" />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.05} />
      </Canvas>
      <div className="absolute top-4 left-4 pointer-events-none bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-1">Proposed 3D Massing</h3>
        <div className="text-xs text-slate-500 space-y-1">
            <p>Zone: <span className="font-medium text-primary-600">{climateZone}</span></p>
            <p>Orientation: <span className="font-medium text-primary-600">{orientation}°</span></p>
        </div>
      </div>
    </div>
  );
}
