import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { SceneManager } from '../../lib/three/sceneManager';
import { ViewportOverlay } from './ViewportOverlay';
import { LightingConfig } from '../../types/project';
import { downloadBlob } from '../../lib/three/exporter';

export interface ThreeViewportHandle {
  getSceneManager: () => SceneManager | null;
  captureSnapshot: () => string | null;
  addPrimitive: (type: any, data?: any) => string;
  addCompositeModel: (compositeType: string, name?: string) => string;
  selectObject: (id: string | null) => void;
  deleteSelectedObject: () => void;
  resetScene: () => void;
}

interface ThreeViewportProps {
  lighting: LightingConfig;
  onObjectSelected?: (id: string | null) => void;
  onSceneChange?: () => void;
  className?: string;
}

export const ThreeViewport = forwardRef<ThreeViewportHandle, ThreeViewportProps>(
  ({ lighting, onObjectSelected, onSceneChange, className = '' }, ref) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneManagerRef = useRef<SceneManager | null>(null);

    const [currentTransformMode, setCurrentTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
    const [isTurntableActive, setIsTurntableActive] = useState(false);
    const [showGrid, setShowGrid] = useState(lighting.showGrid);
    const [selectedObjectName, setSelectedObjectName] = useState<string | null>(null);

    // Keep callback refs stable
    const onObjectSelectedRef = useRef(onObjectSelected);
    onObjectSelectedRef.current = onObjectSelected;
    const onSceneChangeRef = useRef(onSceneChange);
    onSceneChangeRef.current = onSceneChange;

    useEffect(() => {
      if (!mountRef.current) return;

      const sm = new SceneManager(mountRef.current);
      sceneManagerRef.current = sm;

      sm.applyLighting(lighting);

      sm.onObjectSelected = (id) => {
        if (id) {
          const list = sm.getObjectsList();
          const found = list.find((item) => item.id === id);
          setSelectedObjectName(found ? found.name : id);
        } else {
          setSelectedObjectName(null);
        }
        if (onObjectSelectedRef.current) {
          onObjectSelectedRef.current(id);
        }
      };

      sm.onSceneDirty = () => {
        if (onSceneChangeRef.current) {
          onSceneChangeRef.current();
        }
      };

      return () => {
        sm.destroy();
        sceneManagerRef.current = null;
      };
    }, []);

    // Update lighting when prop changes without resetting canvas
    useEffect(() => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.applyLighting(lighting);
        setShowGrid(lighting.showGrid);
      }
    }, [lighting]);

    // Imperative handles for parent components
    useImperativeHandle(ref, () => ({
      getSceneManager: () => sceneManagerRef.current,
      captureSnapshot: () => {
        return sceneManagerRef.current ? sceneManagerRef.current.captureSnapshot() : null;
      },
      addPrimitive: (type, data) => {
        if (!sceneManagerRef.current) return '';
        return sceneManagerRef.current.addPrimitive(type, data);
      },
      addCompositeModel: (compositeType, name) => {
        if (!sceneManagerRef.current) return '';
        return sceneManagerRef.current.addCompositeModel(compositeType, name);
      },
      selectObject: (id) => {
        sceneManagerRef.current?.selectObject(id);
      },
      deleteSelectedObject: () => {
        // ...
      },
      resetScene: () => {
        sceneManagerRef.current?.resetScene();
      },
    }));

    const handleSetTransformMode = (mode: 'translate' | 'rotate' | 'scale') => {
      setCurrentTransformMode(mode);
      sceneManagerRef.current?.setTransformMode(mode);
    };

    const handleSetCameraView = (preset: 'perspective' | 'front' | 'top' | 'side' | 'isometric') => {
      sceneManagerRef.current?.setCameraView(preset);
    };

    const handleResetCamera = () => {
      sceneManagerRef.current?.resetCamera();
    };

    const handleToggleTurntable = () => {
      if (sceneManagerRef.current) {
        const active = sceneManagerRef.current.toggleTurntable();
        setIsTurntableActive(active);
      }
    };

    const handleToggleGrid = () => {
      const next = !showGrid;
      setShowGrid(next);
      if (sceneManagerRef.current) {
        sceneManagerRef.current.applyLighting({ ...lighting, showGrid: next });
      }
    };

    const handleCaptureSnapshot = () => {
      if (!sceneManagerRef.current) return;
      const dataUrl = sceneManagerRef.current.captureSnapshot();
      // Download PNG directly
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `nexora_3d_${Date.now()}.png`;
      a.click();
    };

    return (
      <div className={`relative w-full h-full overflow-hidden bg-slate-950 select-none ${className}`}>
        {/* Isolated WebGL Mount container */}
        <div ref={mountRef} className="absolute inset-0 w-full h-full" />

        {/* Collapsible Ergonomic UI Overlay */}
        <ViewportOverlay
          currentTransformMode={currentTransformMode}
          onSetTransformMode={handleSetTransformMode}
          onSetCameraView={handleSetCameraView}
          onResetCamera={handleResetCamera}
          isTurntableActive={isTurntableActive}
          onToggleTurntable={handleToggleTurntable}
          showGrid={showGrid}
          onToggleGrid={handleToggleGrid}
          onCaptureSnapshot={handleCaptureSnapshot}
          selectedObjectName={selectedObjectName}
        />
      </div>
    );
  }
);
