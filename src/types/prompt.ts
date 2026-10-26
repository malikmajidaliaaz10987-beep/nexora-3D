export type VisualStyle =
  | 'cyberpunk_sci_fi'
  | 'industrial_hard_surface'
  | 'stylized_low_poly'
  | 'photorealistic_pbr'
  | 'anime_mecha'
  | 'minimalist_nordic'
  | 'biomorphic_organic'
  | 'retro_futurism';

export type OutputType =
  | 'real_3d_mesh'
  | 'composite_assembly'
  | 'scene_environment'
  | 'concept_reference_2d';

export type IntendedUse =
  | 'realtime_game_asset'
  | 'film_cgi_prop'
  | 'product_prototype'
  | 'metaverse_avatar'
  | 'architectural_visualization';

export type LevelOfDetail = 'low_poly' | 'medium_optimized' | 'high_fidelity';

export interface StructuredPrompt {
  subject: string;
  category: 'character' | 'vehicle' | 'prop' | 'architecture' | 'environment' | 'abstract';
  visualStyle: VisualStyle;
  proportions: 'balanced' | 'chunky_exaggerated' | 'slender_aerodynamic' | 'heavy_armored' | 'miniature';
  materials: string[];
  colorPalette: string[];
  lightingMood: 'dramatic_neon' | 'soft_studio' | 'golden_hour' | 'dark_nebula' | 'high_key_clean';
  cameraAngle: 'perspective_hero' | 'isometric' | 'eye_level' | 'low_angle_monumental' | 'top_down';
  environment: string;
  levelOfDetail: LevelOfDetail;
  intendedUse: IntendedUse;
  outputType: OutputType;
  negativeConstraints: string;
  additionalNotes?: string;
}

export const DEFAULT_STRUCTURED_PROMPT: StructuredPrompt = {
  subject: 'Cybernetic Combat Drone with quad-thrusters and energy cannon',
  category: 'vehicle',
  visualStyle: 'cyberpunk_sci_fi',
  proportions: 'balanced',
  materials: ['Titanium Alloy', 'Matte Carbon Fiber', 'Cyan Holographic Glass'],
  colorPalette: ['#0f172a', '#06b6d4', '#8b5cf6', '#e2e8f0'],
  lightingMood: 'dramatic_neon',
  cameraAngle: 'perspective_hero',
  environment: 'Futuristic Hangar with wet reflective floor and ambient fog',
  levelOfDetail: 'high_fidelity',
  intendedUse: 'realtime_game_asset',
  outputType: 'real_3d_mesh',
  negativeConstraints: 'low resolution, broken geometry, blurry textures, flat lighting, distorted proportions',
};
