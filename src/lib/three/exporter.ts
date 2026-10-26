import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

export interface ExportOptions {
  binary?: boolean;
  onlyVisible?: boolean;
  filename?: string;
}

export function exportSceneToGLTF(
  sceneOrObject: THREE.Object3D,
  options: ExportOptions = {}
): Promise<Blob> {
  const { binary = true, onlyVisible = true } = options;

  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      sceneOrObject,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          const blob = new Blob([gltf], { type: 'model/gltf-binary' });
          resolve(blob);
        } else {
          const output = JSON.stringify(gltf, null, 2);
          const blob = new Blob([output], { type: 'application/json' });
          resolve(blob);
        }
      },
      (error) => {
        reject(error);
      },
      {
        binary,
        onlyVisible,
      }
    );
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
