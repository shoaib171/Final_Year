// Shirt.jsx
import React, { useRef, useState } from 'react';
import { easing } from 'maath';
import { useSnapshot } from 'valtio';
import { useFrame } from '@react-three/fiber';
import { Decal, useGLTF, useTexture } from '@react-three/drei';
import state from '../store';

const Shirt = () => {
	const snap = useSnapshot(state);
	const { nodes, materials } = useGLTF('/shirt_baked.glb');
	const logoTexture = useTexture(snap.logoDecal);
	const fullTexture = useTexture(snap.fullDecal);

	const shirtMesh = useRef();
	const [targetRotation, setTargetRotation] = useState(6.28319); // This is approximately 2 * Math.PI, a full circle

	useFrame((state, delta) => {
		easing.dampC(materials.lambert1.color, snap.color, 0.25, delta);

		if (shirtMesh.current.rotation.y < targetRotation) {
			shirtMesh.current.rotation.y += 0.01; // Adjust the rotation speed as needed
		}
	});

	const stateString = JSON.stringify(state);

	return (
		<group key={stateString}>
			<mesh
				ref={shirtMesh}
				castShadow
				geometry={nodes.T_Shirt_male.geometry}
				material={materials.lambert1}
				material-roughness={1}
				dispose={null}>
				{snap.isFullTexture && (
					<Decal
						position={[0, 0, 0]}
						rotation={[0, 0, 0]}
						scale={1}
						map={fullTexture}
					/>
				)}

				{snap.isLogoTexture && (
					<Decal
						position={[0, 0.04, 0.15]}
						rotation={[0, 0, 0]}
						scale={0.15}
						map={logoTexture}
						anisotropy={16}
						depthTest={false}
						depthWrite={true}
					/>
				)}
			</mesh>
		</group>
	);
};

export default Shirt;
