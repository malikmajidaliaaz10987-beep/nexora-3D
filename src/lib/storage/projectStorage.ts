import { ProjectScene, GenerationHistoryItem, LightingConfig } from '../../types/project';

const STORAGE_KEY_PROJECTS = 'nexora_3d_projects_v1';
const STORAGE_KEY_HISTORY = 'nexora_3d_history_v1';
const STORAGE_KEY_SETTINGS = 'nexora_3d_settings_v1';

export const DEFAULT_LIGHTING_CONFIG: LightingConfig = {
  keyLight: {
    color: '#ffffff',
    intensity: 2.2,
    position: [5, 6, 4],
    castShadow: true,
  },
  fillLight: {
    color: '#06b6d4',
    intensity: 1.0,
    position: [-5, 3, -3],
  },
  rimLight: {
    color: '#8b5cf6',
    intensity: 1.4,
    position: [0, 5, -5],
  },
  hemisphere: {
    skyColor: '#0ea5e9',
    groundColor: '#0f172a',
    intensity: 0.6,
  },
  ambientIntensity: 0.35,
  environmentPreset: 'studio',
  showGrid: true,
  showFloor: true,
  fog: {
    enabled: true,
    color: '#0a0e17',
    near: 12,
    far: 35,
  },
};

export const SAMPLE_PROJECTS: ProjectScene[] = [
  {
    id: 'proj_combat_drone_default',
    name: 'AeroStrike Drone TX-9',
    description: 'High-speed autonomous reconnaissance drone with ducted quad rotors and telemetry pod.',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000,
    polyCount: 3840,
    camera: {
      position: [3.8, 2.5, 4.2],
      target: [0, 1.2, 0],
      fov: 45,
    },
    lighting: DEFAULT_LIGHTING_CONFIG,
    tags: ['Drone', 'Sci-Fi', 'Aerospace', 'Hard Surface'],
    objects: [
      {
        id: 'comp_drone_1',
        name: 'CombatDrone_Model',
        type: 'composite',
        compositeType: 'combat_drone',
        transform: {
          position: [0, 0, 0],
          rotation: [0, 0.4, 0],
          scale: [1, 1, 1],
        },
        material: {
          color: '#06b6d4',
          roughness: 0.2,
          metalness: 0.85,
          clearcoat: 0.8,
        },
        visible: true,
      },
    ],
  },
  {
    id: 'proj_cyber_mech_default',
    name: 'Apex Strider Titan Mk.IV',
    description: 'Heavy bipedal mobile armor suit with dual heavy energy cannons and reactive plating.',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000,
    polyCount: 5120,
    camera: {
      position: [4.5, 2.8, 5.0],
      target: [0, 1.4, 0],
      fov: 45,
    },
    lighting: {
      ...DEFAULT_LIGHTING_CONFIG,
      environmentPreset: 'cyberpunk',
      keyLight: {
        ...DEFAULT_LIGHTING_CONFIG.keyLight,
        color: '#38bdf8',
      },
    },
    tags: ['Mecha', 'Robot', 'Armor', 'Character'],
    objects: [
      {
        id: 'comp_mech_1',
        name: 'CyberMech_Model',
        type: 'composite',
        compositeType: 'cyber_mech',
        transform: {
          position: [0, 0, 0],
          rotation: [0, -0.3, 0],
          scale: [1, 1, 1],
        },
        material: {
          color: '#06b6d4',
          roughness: 0.25,
          metalness: 0.85,
        },
        visible: true,
      },
    ],
  },
  {
    id: 'proj_crystal_monolith_default',
    name: 'Resonant Monolith Altar',
    description: 'Ancient alien obelisk radiating cyan pulse frequencies with floating satellite crystals.',
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 86400000 * 3,
    polyCount: 1980,
    camera: {
      position: [3.5, 2.4, 4.0],
      target: [0, 1.3, 0],
      fov: 45,
    },
    lighting: {
      ...DEFAULT_LIGHTING_CONFIG,
      environmentPreset: 'nebula',
    },
    tags: ['Environment', 'Artifact', 'Crystal', 'Alien'],
    objects: [
      {
        id: 'comp_monolith_1',
        name: 'CrystalMonolith_Model',
        type: 'composite',
        compositeType: 'crystal_monolith',
        transform: {
          position: [0, 0, 0],
          rotation: [0, 0.2, 0],
          scale: [1, 1, 1],
        },
        material: {
          color: '#06b6d4',
          roughness: 0.1,
          metalness: 0.1,
          transmission: 0.85,
        },
        visible: true,
      },
    ],
  },
];

export interface AppSettings {
  appName: string;
  themeAccent: string; // hex
  customBrandSubtext: string;
  autoSave: boolean;
  performanceMode: boolean;
  gridSnap: boolean;
  customGeminiKeyConfigured: boolean;
  activeProvider: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'NEXORA 3D AI',
  themeAccent: '#06b6d4',
  customBrandSubtext: 'Next-Gen Procedural & Neural 3D Engine',
  autoSave: true,
  performanceMode: false,
  gridSnap: false,
  customGeminiKeyConfigured: true,
  activeProvider: 'nexora_procedural',
};

// Projects CRUD
export function getSavedProjects(): ProjectScene[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(SAMPLE_PROJECTS));
      return SAMPLE_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_PROJECTS;
  } catch {
    return SAMPLE_PROJECTS;
  }
}

export function saveProject(project: ProjectScene): void {
  try {
    const list = getSavedProjects();
    const index = list.findIndex((p) => p.id === project.id);
    if (index >= 0) {
      list[index] = { ...project, updatedAt: Date.now() };
    } else {
      list.unshift({ ...project, createdAt: Date.now(), updatedAt: Date.now() });
    }
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save project:', e);
  }
}

export function deleteProject(id: string): void {
  try {
    const list = getSavedProjects().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to delete project:', e);
  }
}

export function duplicateProject(id: string): ProjectScene | null {
  const list = getSavedProjects();
  const existing = list.find((p) => p.id === id);
  if (!existing) return null;

  const duplicate: ProjectScene = {
    ...JSON.parse(JSON.stringify(existing)),
    id: `proj_${Date.now()}_copy`,
    name: `${existing.name} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  list.unshift(duplicate);
  localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(list));
  return duplicate;
}

// History CRUD
export function getGenerationHistory(): GenerationHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addGenerationHistory(item: Omit<GenerationHistoryItem, 'id' | 'timestamp'>): void {
  try {
    const history = getGenerationHistory();
    const newItem: GenerationHistoryItem = {
      ...item,
      id: `gen_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    history.unshift(newItem);
    if (history.length > 50) history.pop();
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history item:', e);
  }
}

// Settings
export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: Partial<AppSettings>): AppSettings {
  try {
    const current = getAppSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
