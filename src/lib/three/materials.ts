import * as THREE from 'three';
import { PBRMaterialData } from '../../types/project';
import { getProceduralTexture } from './proceduralTextures';

export interface MaterialPreset {
  id: string;
  name: string;
  category: 'metal' | 'glass' | 'special' | 'matte' | 'emissive';
  data: PBRMaterialData;
}

export const MATERIAL_PRESETS: MaterialPreset[] = [
  {
    id: 'cyber_cyan',
    name: 'Cyber Cyan PBR',
    category: 'metal',
    data: {
      color: '#06b6d4',
      roughness: 0.18,
      metalness: 0.85,
      clearcoat: 0.8,
      emissive: '#083344',
      emissiveIntensity: 0.2,
      proceduralTexture: 'hex_grid',
    },
  },
  {
    id: 'carbon_titanium',
    name: 'Carbon Titanium',
    category: 'metal',
    data: {
      color: '#1e293b',
      roughness: 0.25,
      metalness: 0.95,
      clearcoat: 0.6,
      proceduralTexture: 'carbon_fiber',
    },
  },
  {
    id: 'brushed_gold',
    name: 'Imperial Gold',
    category: 'metal',
    data: {
      color: '#fbbf24',
      roughness: 0.15,
      metalness: 0.9,
      clearcoat: 0.9,
      proceduralTexture: 'brushed_metal',
    },
  },
  {
    id: 'obsidian_matte',
    name: 'Obsidian Stealth',
    category: 'matte',
    data: {
      color: '#090d16',
      roughness: 0.7,
      metalness: 0.1,
      clearcoat: 0.1,
    },
  },
  {
    id: 'holographic_shield',
    name: 'Holo Iridescent',
    category: 'special',
    data: {
      color: '#a855f7',
      roughness: 0.08,
      metalness: 0.3,
      transmission: 0.75,
      transparent: true,
      opacity: 0.85,
      clearcoat: 1.0,
      emissive: '#6366f1',
      emissiveIntensity: 0.4,
      proceduralTexture: 'hologram',
    },
  },
  {
    id: 'crystal_emerald',
    name: 'Vibrant Emerald',
    category: 'glass',
    data: {
      color: '#10b981',
      roughness: 0.05,
      metalness: 0.05,
      transmission: 0.9,
      transparent: true,
      opacity: 0.9,
      clearcoat: 1.0,
    },
  },
  {
    id: 'neon_plasma',
    name: 'Plasma Overdrive',
    category: 'emissive',
    data: {
      color: '#ec4899',
      roughness: 0.3,
      metalness: 0.1,
      emissive: '#ec4899',
      emissiveIntensity: 1.2,
    },
  },
  {
    id: 'ceramic_white',
    name: 'Clean Lab Ceramic',
    category: 'matte',
    data: {
      color: '#f8fafc',
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.4,
    },
  },
];

export function createThreeMaterial(
  matData: PBRMaterialData,
  isSoftwareGl = false
): THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial {
  const params: THREE.MeshPhysicalMaterialParameters = {
    color: new THREE.Color(matData.color),
    roughness: matData.roughness ?? 0.5,
    metalness: matData.metalness ?? 0.0,
    wireframe: matData.wireframe ?? false,
    transparent: matData.transparent || (matData.opacity !== undefined && matData.opacity < 1),
    opacity: matData.opacity ?? 1.0,
  };

  if (matData.clearcoat) {
    params.clearcoat = matData.clearcoat;
    params.clearcoatRoughness = 0.1;
  }

  if (matData.transmission && !isSoftwareGl) {
    params.transmission = matData.transmission;
    params.ior = 1.5;
    params.thickness = 1.2;
    params.transparent = true;
  }

  if (matData.emissive) {
    params.emissive = new THREE.Color(matData.emissive);
    params.emissiveIntensity = matData.emissiveIntensity ?? 1.0;
  }

  if (matData.proceduralTexture && matData.proceduralTexture !== 'none') {
    params.map = getProceduralTexture(matData.proceduralTexture, matData.color);
  }

  return new THREE.MeshPhysicalMaterial(params);
}
