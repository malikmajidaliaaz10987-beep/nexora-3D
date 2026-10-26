import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/addons/loaders/GLTFLoader.js';

export function loadGLTFFromBlob(file: File | Blob): Promise<GLTF> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target?.result;
      if (!contents) {
        reject(new Error('Failed to read file contents'));
        return;
      }
      const loader = new GLTFLoader();
      loader.parse(
        contents as ArrayBuffer,
        '',
        (gltf) => {
          resolve(gltf);
        },
        (error) => {
          reject(error);
        }
      );
    };
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}
