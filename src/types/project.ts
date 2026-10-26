export type ThreePrimitiveType =
  | 'cube'
  | 'sphere'
  | 'cylinder'
  | 'cone'
  | 'torus'
  | 'plane'
  | 'capsule'
  | 'dodecahedron'
  | 'composite'
  | 'imported';

export interface TransformData {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface PBRMaterialData {
  color: string;
  roughness: number;
  metalness: number;
  clearcoat?: number;
  transmission?: number;
  emissive?: string;
  emissiveIntensity?: number;
  wireframe?: boolean;
  opacity?: number;
  transparent?: boolean;
  proceduralTexture?: 'none' | 'carbon_fiber' | 'brushed_metal' | 'hex_grid' | 'circuit' | 'marble' | 'hologram';
}

export interface SceneObjectNode {
  id: string;
  name: string;
  type: ThreePrimitiveType;
  compositeType?: string;
  transform: TransformData;
  material: PBRMaterialData;
  visible: boolean;
  locked?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  children?: SceneObjectNode[];
  animationTrack?: {
    type: 'rotate_y' | 'float' | 'pulse' | 'turntable' | 'orbit' | 'none';
    speed: number;
  };
}

export interface LightingConfig {
  keyLight: {
    color: string;
    intensity: number;
    position: [number, number, number];
    castShadow: boolean;
  };
  fillLight: {
    color: string;
    intensity: number;
    position: [number, number, number];
  };
  rimLight: {
    color: string;
    intensity: number;
    position: [number, number, number];
  };
  hemisphere: {
    skyColor: string;
    groundColor: string;
    intensity: number;
  };
  ambientIntensity: number;
  environmentPreset: 'studio' | 'cyberpunk' | 'nebula' | 'sunset' | 'clean_white';
  showGrid: boolean;
  showFloor: boolean;
  fog: {
    enabled: boolean;
    color: string;
    near: number;
    far: number;
  };
}

export interface ProjectScene {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  polyCount: number;
  objects: SceneObjectNode[];
  lighting: LightingConfig;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
  };
  tags: string[];
}

export interface GenerationHistoryItem {
  id: string;
  timestamp: number;
  type: 'text_to_3d' | 'image_to_3d' | 'character' | 'scene' | 'material' | 'concept_art';
  prompt: string;
  status: 'completed' | 'failed' | 'processing';
  resultSummary: string;
  assetCount?: number;
  thumbnail?: string;
  projectSnapshot?: ProjectScene;
}

export interface ProviderStatus {
  id: string;
  name: string;
  type: '3d_mesh' | 'multimodal_ai' | 'concept_art';
  isConfigured: boolean;
  statusText: string;
  latencyMs?: number;
  docsUrl: string;
  description: string;
  capabilities: string[];
}
