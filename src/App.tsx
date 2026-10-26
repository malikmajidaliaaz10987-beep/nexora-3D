import React, { useState, useRef, useEffect } from 'react';
import {
  Wand2,
  Image as ImageIcon,
  User,
  Compass,
  Palette,
  Sparkles,
  Layers,
  Box,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';

import { Navbar, NavTab } from './components/navbar/Navbar';
import { ThreeViewport, ThreeViewportHandle } from './components/viewport/ThreeViewport';
import { SceneHierarchy } from './components/studio/SceneHierarchy';
import { PropertiesPanel } from './components/studio/PropertiesPanel';
import { LightingEnvironmentPanel } from './components/studio/LightingEnvironmentPanel';
import { AddObjectModal } from './components/studio/AddObjectModal';
import { Toolbar } from './components/studio/Toolbar';

import { HomeView } from './components/home/HomeView';
import { TextTo3DView } from './components/create/TextTo3DView';
import { ImageTo3DView } from './components/create/ImageTo3DView';
import { CharacterCreatorView } from './components/create/CharacterCreatorView';
import { SceneGeneratorView } from './components/create/SceneGeneratorView';
import { MaterialAssistantView } from './components/create/MaterialAssistantView';
import { ImageGeneratorView } from './components/create/ImageGeneratorView';
import { ProjectsView } from './components/projects/ProjectsView';
import { SettingsView } from './components/settings/SettingsView';

import { ProjectScene, LightingConfig, PBRMaterialData, ThreePrimitiveType } from './types/project';
import {
  getAppSettings,
  saveAppSettings,
  AppSettings,
  SAMPLE_PROJECTS,
  saveProject,
  DEFAULT_LIGHTING_CONFIG,
} from './lib/storage/projectStorage';
import { exportSceneToGLTF, downloadBlob } from './lib/three/exporter';
import { loadGLTFFromBlob } from './lib/three/importer';

type CreateToolTab =
  | 'text_to_3d'
  | 'image_to_3d'
  | 'character'
  | 'scene'
  | 'materials'
  | 'concept_art';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [createTool, setCreateTool] = useState<CreateToolTab>('text_to_3d');

  // Active Scene & Studio State
  const [currentProject, setCurrentProject] = useState<ProjectScene>(SAMPLE_PROJECTS[0]);
  const [lighting, setLighting] = useState<LightingConfig>(SAMPLE_PROJECTS[0].lighting || DEFAULT_LIGHTING_CONFIG);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [objectsList, setObjectsList] = useState<{ id: string; name: string; type: string; visible: boolean }[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Studio UI Panels toggling
  const [showHierarchy, setShowHierarchy] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLightingOpen, setIsLightingOpen] = useState(false);

  const viewportRef = useRef<ThreeViewportHandle>(null);

  // Sync objects list from SceneManager
  const updateObjectsFromManager = () => {
    const sm = viewportRef.current?.getSceneManager();
    if (sm) {
      setObjectsList(sm.getObjectsList());
    }
  };

  // Populate scene with project objects when project changes or when 3D Studio mounts
  const populateSceneFromProject = (project: ProjectScene) => {
    const sm = viewportRef.current?.getSceneManager();
    if (!sm) return;

    sm.resetScene();
    sm.applyLighting(project.lighting || DEFAULT_LIGHTING_CONFIG);
    setLighting(project.lighting || DEFAULT_LIGHTING_CONFIG);

    (project.objects || []).forEach((node) => {
      if (node.type === 'composite' && node.compositeType) {
        sm.addCompositeModel(node.compositeType, node.name);
      } else {
        sm.addPrimitive(node.type, node);
      }
    });

    updateObjectsFromManager();
    setHasUnsavedChanges(false);
  };

  // On tab change to 'studio', make sure viewport has current project
  useEffect(() => {
    if (currentTab === 'studio') {
      setTimeout(() => {
        populateSceneFromProject(currentProject);
      }, 50);
    }
  }, [currentTab]);

  // Initial population on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      populateSceneFromProject(currentProject);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenProjectInStudio = (project: ProjectScene) => {
    setCurrentProject(project);
    setCurrentTab('studio');
    setTimeout(() => {
      populateSceneFromProject(project);
    }, 50);
  };

  const handleNewProject = () => {
    const newProj: ProjectScene = {
      id: `proj_new_${Date.now()}`,
      name: 'Untitled 3D Scene',
      description: 'New blank 3D scene canvas.',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      polyCount: 1200,
      lighting: DEFAULT_LIGHTING_CONFIG,
      camera: { position: [4, 3, 5], target: [0, 1, 0], fov: 45 },
      tags: ['Custom', 'Scene'],
      objects: [],
    };

    saveProject(newProj);
    setCurrentProject(newProj);
    setCurrentTab('studio');
    setTimeout(() => {
      viewportRef.current?.getSceneManager()?.resetScene();
      // Add a hero cube as starter
      viewportRef.current?.getSceneManager()?.addPrimitive('cube', {
        name: 'Center_Cube',
        transform: { position: [0, 0.5, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        material: { color: '#06b6d4', roughness: 0.2, metalness: 0.85, clearcoat: 0.6 },
      });
      updateObjectsFromManager();
    }, 100);
  };

  const handleSaveScene = () => {
    setIsSaving(true);
    const sm = viewportRef.current?.getSceneManager();
    if (sm) {
      const snap = sm.captureSnapshot();
      const updatedProject: ProjectScene = {
        ...currentProject,
        updatedAt: Date.now(),
        thumbnail: snap,
        lighting,
      };
      saveProject(updatedProject);
      setCurrentProject(updatedProject);
      setHasUnsavedChanges(false);
    }
    setTimeout(() => setIsSaving(false), 1200);
  };

  const handleExportGLB = async () => {
    const sm = viewportRef.current?.getSceneManager();
    if (!sm) return;

    try {
      const root = sm.getExportableRoot();
      const blob = await exportSceneToGLTF(root, { binary: true });
      const filename = `${currentProject.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.glb`;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error('GLTF Export failed:', err);
      alert('Failed to export GLB file. Ensure scene has valid geometry.');
    }
  };

  const handleImportFile = async (file: File) => {
    const sm = viewportRef.current?.getSceneManager();
    if (!sm) return;

    try {
      const gltf = await loadGLTFFromBlob(file);
      sm.addImportedModel(gltf.scene, file.name);
      updateObjectsFromManager();
      setHasUnsavedChanges(true);
    } catch (err: any) {
      alert(`Failed to import 3D file: ${err.message}`);
    }
  };

  const handleAddPrimitive = (type: ThreePrimitiveType) => {
    const sm = viewportRef.current?.getSceneManager();
    if (sm) {
      sm.addPrimitive(type);
      updateObjectsFromManager();
      setHasUnsavedChanges(true);
    }
  };

  const handleAddComposite = (compType: string, name: string) => {
    const sm = viewportRef.current?.getSceneManager();
    if (sm) {
      sm.addCompositeModel(compType, name);
      updateObjectsFromManager();
      setHasUnsavedChanges(true);
    }
  };

  const handleApplyMaterialToActive = (matData: PBRMaterialData) => {
    const sm = viewportRef.current?.getSceneManager();
    if (sm) {
      if (selectedObjectId) {
        sm.updateObjectMaterial(selectedObjectId, matData);
      } else {
        const first = objectsList[0];
        if (first) {
          sm.updateObjectMaterial(first.id, matData);
        }
      }
      setHasUnsavedChanges(true);
    }
  };

  const selectedNode = objectsList.find((o) => o.id === selectedObjectId);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Global Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        settings={settings}
        activeProjectName={currentProject.name}
        onNewProject={handleNewProject}
      />

      {/* Main Body Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 1. HOME VIEW */}
        {currentTab === 'home' && (
          <div className="flex-1 overflow-y-auto">
            <HomeView
              settings={settings}
              onGoToTab={(tab) => {
                if (tab === 'studio') {
                  setCurrentTab('studio');
                } else {
                  setCurrentTab(tab);
                }
              }}
              onOpenSample={handleOpenProjectInStudio}
            />
          </div>
        )}

        {/* 2. CREATE WORKSPACE VIEW */}
        {currentTab === 'create' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Create Tools Nav Bar */}
            <div className="h-11 bg-slate-950/80 border-b border-slate-800/80 px-4 flex items-center justify-between overflow-x-auto select-none shrink-0">
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'text_to_3d', label: 'Text-to-3D', icon: <Wand2 className="w-3.5 h-3.5 text-cyan-400" /> },
                  { id: 'image_to_3d', label: 'Image-to-3D', icon: <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> },
                  { id: 'character', label: 'Character Creator', icon: <User className="w-3.5 h-3.5 text-purple-400" /> },
                  { id: 'scene', label: 'Scene Creator', icon: <Compass className="w-3.5 h-3.5 text-teal-400" /> },
                  { id: 'materials', label: 'Material Assistant', icon: <Palette className="w-3.5 h-3.5 text-pink-400" /> },
                  { id: 'concept_art', label: 'Concept Visuals (2D)', icon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> },
                ].map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setCreateTool(tool.id as CreateToolTab)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      createTool === tool.id
                        ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {tool.icon}
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentTab('studio')}
                className="hidden sm:flex items-center gap-1.5 text-xs text-cyan-400 hover:underline cursor-pointer"
              >
                <Box className="w-3.5 h-3.5" />
                <span>Return to 3D Viewport</span>
              </button>
            </div>

            {/* Sub-view switcher */}
            <div className="flex-1 overflow-y-auto">
              {createTool === 'text_to_3d' && (
                <TextTo3DView onOpenInStudio={handleOpenProjectInStudio} />
              )}
              {createTool === 'image_to_3d' && (
                <ImageTo3DView onOpenInStudio={handleOpenProjectInStudio} />
              )}
              {createTool === 'character' && (
                <CharacterCreatorView onOpenInStudio={handleOpenProjectInStudio} />
              )}
              {createTool === 'scene' && (
                <SceneGeneratorView onOpenInStudio={handleOpenProjectInStudio} />
              )}
              {createTool === 'materials' && (
                <MaterialAssistantView
                  onApplyMaterialToStudio={handleApplyMaterialToActive}
                  onGoToStudio={() => setCurrentTab('studio')}
                />
              )}
              {createTool === 'concept_art' && (
                <ImageGeneratorView
                  onUseAsReference={(text) => {
                    setCreateTool('text_to_3d');
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* 3. 3D STUDIO VIEW */}
        <div
          className={`flex-1 flex flex-col overflow-hidden ${
            currentTab === 'studio' ? 'block' : 'hidden'
          }`}
        >
          {/* Top Studio Toolbar */}
          <Toolbar
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenLightingModal={() => setIsLightingOpen(!isLightingOpen)}
            onSaveProject={handleSaveScene}
            isSaving={isSaving}
            onExportGLB={handleExportGLB}
            onResetScene={() => {
              if (window.confirm('Clear all objects from the current scene?')) {
                viewportRef.current?.resetScene();
                updateObjectsFromManager();
                setHasUnsavedChanges(true);
              }
            }}
            onTakeSnapshot={() => {
              viewportRef.current?.captureSnapshot();
            }}
            polyCount={currentProject.polyCount || 3840}
            hasUnsavedChanges={hasUnsavedChanges}
          />

          {/* Central Workspace Area */}
          <div className="flex-1 flex relative overflow-hidden">
            {/* Left Panel: Scene Hierarchy */}
            {showHierarchy && (
              <SceneHierarchy
                objects={objectsList}
                selectedId={selectedObjectId}
                onSelect={(id) => {
                  setSelectedObjectId(id);
                  viewportRef.current?.selectObject(id);
                }}
                onToggleVisibility={(id, visible) => {
                  viewportRef.current?.getSceneManager()?.setObjectVisibility(id, visible);
                  updateObjectsFromManager();
                  setHasUnsavedChanges(true);
                }}
                onDuplicate={(id) => {
                  viewportRef.current?.getSceneManager()?.duplicateObject(id);
                  updateObjectsFromManager();
                  setHasUnsavedChanges(true);
                }}
                onDelete={(id) => {
                  viewportRef.current?.getSceneManager()?.deleteObject(id);
                  updateObjectsFromManager();
                  setHasUnsavedChanges(true);
                }}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            )}

            {/* Toggle Left Panel Button */}
            <button
              onClick={() => setShowHierarchy(!showHierarchy)}
              title={showHierarchy ? 'Collapse Outliner' : 'Expand Outliner'}
              className="absolute left-2 top-2 z-10 p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-cyan-400 shadow-md cursor-pointer"
              style={{ left: showHierarchy ? '260px' : '8px' }}
            >
              {showHierarchy ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
            </button>

            {/* Center: 3D Viewport with bottom HUD dock */}
            <div className="flex-1 relative h-full">
              <ThreeViewport
                ref={viewportRef}
                lighting={lighting}
                onObjectSelected={(id) => {
                  setSelectedObjectId(id);
                }}
                onSceneChange={() => {
                  updateObjectsFromManager();
                  setHasUnsavedChanges(true);
                }}
              />

              {/* Lighting & Environment Panel Drawer */}
              {isLightingOpen && (
                <LightingEnvironmentPanel
                  lighting={lighting}
                  onChange={(updated) => {
                    setLighting(updated);
                    setHasUnsavedChanges(true);
                  }}
                  onClose={() => setIsLightingOpen(false)}
                />
              )}
            </div>

            {/* Toggle Right Panel Button */}
            <button
              onClick={() => setShowProperties(!showProperties)}
              title={showProperties ? 'Collapse Inspector' : 'Expand Inspector'}
              className="absolute right-2 top-2 z-10 p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-cyan-400 shadow-md cursor-pointer"
              style={{ right: showProperties ? '292px' : '8px' }}
            >
              {showProperties ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            </button>

            {/* Right Panel: Properties & Materials */}
            {showProperties && (
              <PropertiesPanel
                selectedId={selectedObjectId}
                objectName={selectedNode?.name}
                onUpdateTransform={(t) => {
                  if (selectedObjectId) {
                    viewportRef.current?.getSceneManager()?.updateObjectTransform(selectedObjectId, t);
                    setHasUnsavedChanges(true);
                  }
                }}
                onUpdateMaterial={(m) => {
                  if (selectedObjectId) {
                    viewportRef.current?.getSceneManager()?.updateObjectMaterial(selectedObjectId, m);
                    setHasUnsavedChanges(true);
                  }
                }}
                onDeleteSelected={() => {
                  if (selectedObjectId) {
                    viewportRef.current?.getSceneManager()?.deleteObject(selectedObjectId);
                    setSelectedObjectId(null);
                    updateObjectsFromManager();
                    setHasUnsavedChanges(true);
                  }
                }}
                onDuplicateSelected={() => {
                  if (selectedObjectId) {
                    viewportRef.current?.getSceneManager()?.duplicateObject(selectedObjectId);
                    updateObjectsFromManager();
                    setHasUnsavedChanges(true);
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* 4. MY PROJECTS VIEW */}
        {currentTab === 'projects' && (
          <div className="flex-1 overflow-y-auto">
            <ProjectsView
              onOpenProject={handleOpenProjectInStudio}
              onNewProject={handleNewProject}
            />
          </div>
        )}

        {/* 5. ACCOUNT & SETTINGS VIEW */}
        {currentTab === 'settings' && (
          <div className="flex-1 overflow-y-auto">
            <SettingsView
              settings={settings}
              onUpdateSettings={setSettings}
              onOpenInStudio={handleOpenProjectInStudio}
            />
          </div>
        )}
      </div>

      {/* Add Object Modal */}
      <AddObjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPrimitive={handleAddPrimitive}
        onAddComposite={handleAddComposite}
        onImportFile={handleImportFile}
      />
    </div>
  );
}
