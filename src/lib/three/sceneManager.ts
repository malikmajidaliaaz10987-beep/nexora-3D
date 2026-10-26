import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LightingConfig, SceneObjectNode, ThreePrimitiveType, PBRMaterialData } from '../../types/project';
import { createThreeMaterial } from './materials';
import { createGroundShadowTexture } from './proceduralTextures';
import {
  createCyberMech,
  createCombatDrone,
  createCyberHelmet,
  createCrystalMonolith,
  createSciFiPod,
} from './proceduralModels';

export class SceneManager {
  public container: HTMLElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;
  public transformControls: TransformControls;
  public isSoftwareGl: boolean;

  // Scene structures
  private objectsRoot: THREE.Group;
  private helpersGroup: THREE.Group;
  private gridHelper: THREE.GridHelper | null = null;
  private shadowPlane: THREE.Mesh | null = null;
  private keyLight: THREE.DirectionalLight | null = null;
  private fillLight: THREE.DirectionalLight | null = null;
  private rimLight: THREE.DirectionalLight | null = null;
  private hemiLight: THREE.HemisphereLight | null = null;
  private ambientLight: THREE.AmbientLight | null = null;

  // State
  private objectMap = new Map<string, THREE.Object3D>();
  private selectedObjectId: string | null = null;
  private animFrameId: number | null = null;
  private isDestroyed = false;
  private isTurntableActive = false;
  private isTransformDragging = false;
  private clock = new THREE.Clock();

  // Callbacks
  public onObjectSelected?: (id: string | null) => void;
  public onObjectTransformed?: (id: string, transform: { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number] }) => void;
  public onSceneDirty?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Hierarchy
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0a0e17');

    this.objectsRoot = new THREE.Group();
    this.objectsRoot.name = '__user_objects_root__';
    this.scene.add(this.objectsRoot);

    this.helpersGroup = new THREE.Group();
    this.helpersGroup.name = '__helpers_root__';
    this.scene.add(this.helpersGroup);

    // 4. Camera & OrbitControls
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(4, 3, 5);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 1, 0);
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't go deep beneath ground

    // 5. TransformControls
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.size = 0.85;
    this.scene.add(this.transformControls.getHelper());

    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.controls.enabled = !event.value;
      this.isTransformDragging = !!event.value;
      if (!event.value && this.selectedObjectId) {
        const obj = this.objectMap.get(this.selectedObjectId);
        if (obj && this.onObjectTransformed) {
          this.onObjectTransformed(this.selectedObjectId, {
            position: [obj.position.x, obj.position.y, obj.position.z],
            rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
            scale: [obj.scale.x, obj.scale.y, obj.scale.z],
          });
        }
      }
    });

    this.transformControls.addEventListener('change', () => {
      if (this.isTransformDragging && this.selectedObjectId) {
        const obj = this.objectMap.get(this.selectedObjectId);
        if (obj && this.onObjectTransformed) {
          this.onObjectTransformed(this.selectedObjectId, {
            position: [obj.position.x, obj.position.y, obj.position.z],
            rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
            scale: [obj.scale.x, obj.scale.y, obj.scale.z],
          });
        }
      }
    });

    // 6. Mandatory Studio Environment
    this.setupEnvironment();

    // 7. Grid & Ground Shadow
    this.setupGridAndGround();

    // 8. Event listeners
    window.addEventListener('resize', this.handleResize);
    this.renderer.domElement.addEventListener('pointerdown', this.handlePointerDown);

    // 9. Start Render Loop
    this.clock.start();
    this.animate();
  }

  private setupEnvironment() {
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {
      // Fallback
    }
  }

  private setupGridAndGround() {
    // Grid
    this.gridHelper = new THREE.GridHelper(20, 20, 0x06b6d4, 0x1e293b);
    this.gridHelper.position.y = 0;
    this.helpersGroup.add(this.gridHelper);

    // Contact Ground Shadow plane
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: createGroundShadowTexture(),
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    this.shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.y = 0.005;
    this.helpersGroup.add(this.shadowPlane);
  }

  public applyLighting(config: LightingConfig) {
    // Remove existing lights
    [this.keyLight, this.fillLight, this.rimLight, this.hemiLight, this.ambientLight].forEach((l) => {
      if (l) this.scene.remove(l);
    });

    // Key Light
    this.keyLight = new THREE.DirectionalLight(config.keyLight.color, config.keyLight.intensity);
    this.keyLight.position.set(...config.keyLight.position);
    this.keyLight.castShadow = config.keyLight.castShadow && !this.isSoftwareGl;
    if (this.keyLight.castShadow) {
      this.keyLight.shadow.mapSize.width = 1024;
      this.keyLight.shadow.mapSize.height = 1024;
      this.keyLight.shadow.camera.near = 0.5;
      this.keyLight.shadow.camera.far = 25;
      this.keyLight.shadow.bias = -0.0005;
      this.keyLight.shadow.normalBias = 0.02;
      const d = 5;
      this.keyLight.shadow.camera.left = -d;
      this.keyLight.shadow.camera.right = d;
      this.keyLight.shadow.camera.top = d;
      this.keyLight.shadow.camera.bottom = -d;
    }
    this.scene.add(this.keyLight);

    // Fill Light
    this.fillLight = new THREE.DirectionalLight(config.fillLight.color, config.fillLight.intensity);
    this.fillLight.position.set(...config.fillLight.position);
    this.scene.add(this.fillLight);

    // Rim Light
    this.rimLight = new THREE.DirectionalLight(config.rimLight.color, config.rimLight.intensity);
    this.rimLight.position.set(...config.rimLight.position);
    this.scene.add(this.rimLight);

    // Hemisphere Light
    this.hemiLight = new THREE.HemisphereLight(
      config.hemisphere.skyColor,
      config.hemisphere.groundColor,
      config.hemisphere.intensity
    );
    this.scene.add(this.hemiLight);

    // Ambient
    this.ambientLight = new THREE.AmbientLight(0xffffff, config.ambientIntensity);
    this.scene.add(this.ambientLight);

    // Grid / Floor visibility
    if (this.gridHelper) this.gridHelper.visible = config.showGrid;
    if (this.shadowPlane) this.shadowPlane.visible = config.showFloor;

    // Environment Preset
    switch (config.environmentPreset) {
      case 'cyberpunk':
        this.scene.background = new THREE.Color('#030712');
        if (config.fog.enabled) {
          this.scene.fog = new THREE.Fog('#030712', config.fog.near, config.fog.far);
        } else {
          this.scene.fog = null;
        }
        break;
      case 'nebula':
        this.scene.background = new THREE.Color('#0b091a');
        if (config.fog.enabled) {
          this.scene.fog = new THREE.Fog('#0b091a', config.fog.near, config.fog.far);
        } else {
          this.scene.fog = null;
        }
        break;
      case 'clean_white':
        this.scene.background = new THREE.Color('#f1f5f9');
        if (config.fog.enabled) {
          this.scene.fog = new THREE.Fog('#f1f5f9', config.fog.near, config.fog.far);
        } else {
          this.scene.fog = null;
        }
        break;
      case 'sunset':
        this.scene.background = new THREE.Color('#1c1017');
        if (config.fog.enabled) {
          this.scene.fog = new THREE.Fog('#1c1017', config.fog.near, config.fog.far);
        } else {
          this.scene.fog = null;
        }
        break;
      case 'studio':
      default:
        this.scene.background = new THREE.Color('#0a0e17');
        if (config.fog.enabled) {
          this.scene.fog = new THREE.Fog('#0a0e17', config.fog.near, config.fog.far);
        } else {
          this.scene.fog = null;
        }
        break;
    }
  }

  // Raycasting selection
  private handlePointerDown = (event: PointerEvent) => {
    // Only left click
    if (event.button !== 0) return;
    if (this.isTransformDragging) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

    const intersects = raycaster.intersectObjects(this.objectsRoot.children, true);

    if (intersects.length > 0) {
      let hit: THREE.Object3D | null = intersects[0].object;
      // Walk up until we find an object directly inside objectsRoot or with an id mapped
      while (hit && hit.parent && hit.parent !== this.objectsRoot) {
        if (this.findIdByObject(hit)) break;
        hit = hit.parent;
      }
      const matchedId = hit ? this.findIdByObject(hit) : null;
      this.selectObject(matchedId);
    } else {
      // Clicked void
      this.selectObject(null);
    }
  };

  private findIdByObject(obj: THREE.Object3D): string | null {
    for (const [id, o] of this.objectMap.entries()) {
      if (o === obj || o.getObjectById(obj.id)) {
        return id;
      }
    }
    return null;
  }

  public selectObject(id: string | null) {
    this.selectedObjectId = id;
    if (id && this.objectMap.has(id)) {
      const obj = this.objectMap.get(id)!;
      this.transformControls.attach(obj);
    } else {
      this.transformControls.detach();
    }
    if (this.onObjectSelected) {
      this.onObjectSelected(id);
    }
  }

  public setTransformMode(mode: 'translate' | 'rotate' | 'scale') {
    this.transformControls.setMode(mode);
  }

  public getTransformMode(): 'translate' | 'rotate' | 'scale' {
    return this.transformControls.getMode();
  }

  public setTransformSpace(space: 'world' | 'local') {
    this.transformControls.setSpace(space);
  }

  public addPrimitive(type: ThreePrimitiveType, nodeData?: Partial<SceneObjectNode>): string {
    const id = nodeData?.id || `obj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const name = nodeData?.name || `${type.charAt(0).toUpperCase() + type.slice(1)}_${this.objectMap.size + 1}`;

    let meshOrGroup: THREE.Object3D;
    const mat = createThreeMaterial(
      nodeData?.material || {
        color: '#06b6d4',
        roughness: 0.25,
        metalness: 0.8,
        clearcoat: 0.5,
      },
      this.isSoftwareGl
    );

    switch (type) {
      case 'cube': {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        meshOrGroup = new THREE.Mesh(geo, mat);
        meshOrGroup.position.set(0, 0.5, 0);
        break;
      }
      case 'sphere': {
        const geo = new THREE.SphereGeometry(0.6, 32, 24);
        meshOrGroup = new THREE.Mesh(geo, mat);
        meshOrGroup.position.set(0, 0.6, 0);
        break;
      }
      case 'cylinder': {
        const geo = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 32);
        meshOrGroup = new THREE.Mesh(geo, mat);
        meshOrGroup.position.set(0, 0.6, 0);
        break;
      }
      case 'cone': {
        const geo = new THREE.ConeGeometry(0.6, 1.2, 32);
        meshOrGroup = new THREE.Mesh(geo, mat);
        meshOrGroup.position.set(0, 0.6, 0);
        break;
      }
      case 'torus': {
        const geo = new THREE.TorusGeometry(0.6, 0.2, 16, 32);
        meshOrGroup = new THREE.Mesh(geo, mat);
        meshOrGroup.position.set(0, 0.6, 0);
        meshOrGroup.rotation.x = Math.PI / 2;
        break;
      }
      case 'capsule': {
        const geo = new THREE.CapsuleGeometry(0.4, 0.8, 16, 24);
        meshOrGroup = new THREE.Mesh(geo, mat);
        meshOrGroup.position.set(0, 0.8, 0);
        break;
      }
      case 'plane': {
        const geo = new THREE.PlaneGeometry(2, 2);
        meshOrGroup = new THREE.Mesh(geo, mat);
        meshOrGroup.position.set(0, 1.0, 0);
        break;
      }
      case 'dodecahedron': {
        const geo = new THREE.DodecahedronGeometry(0.7);
        meshOrGroup = new THREE.Mesh(geo, mat);
        meshOrGroup.position.set(0, 0.7, 0);
        break;
      }
      default: {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        meshOrGroup = new THREE.Mesh(geo, mat);
        meshOrGroup.position.set(0, 0.5, 0);
      }
    }

    if (nodeData?.transform) {
      meshOrGroup.position.set(...nodeData.transform.position);
      meshOrGroup.rotation.set(...nodeData.transform.rotation);
      meshOrGroup.scale.set(...nodeData.transform.scale);
    }

    meshOrGroup.name = name;
    meshOrGroup.castShadow = !this.isSoftwareGl;
    meshOrGroup.receiveShadow = !this.isSoftwareGl;
    meshOrGroup.userData = { id, type, nodeData };

    this.objectsRoot.add(meshOrGroup);
    this.objectMap.set(id, meshOrGroup);
    this.selectObject(id);
    if (this.onSceneDirty) this.onSceneDirty();

    return id;
  }

  public addCompositeModel(compositeType: string, customName?: string): string {
    const id = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let group: THREE.Group;

    switch (compositeType) {
      case 'cyber_mech':
        group = createCyberMech('#06b6d4', '#8b5cf6');
        break;
      case 'combat_drone':
        group = createCombatDrone('#06b6d4', '#38bdf8');
        break;
      case 'cyber_helmet':
        group = createCyberHelmet('#8b5cf6');
        break;
      case 'crystal_monolith':
        group = createCrystalMonolith('#06b6d4');
        break;
      case 'scifi_pod':
        group = createSciFiPod('#3b82f6');
        break;
      default:
        group = createCyberMech();
    }

    group.name = customName || `${compositeType.replace('_', ' ').toUpperCase()}`;
    group.userData = { id, type: 'composite', compositeType };

    this.objectsRoot.add(group);
    this.objectMap.set(id, group);
    this.selectObject(id);
    if (this.onSceneDirty) this.onSceneDirty();

    return id;
  }

  public addImportedModel(gltfGroup: THREE.Group, filename: string): string {
    const id = `import_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    gltfGroup.name = filename.replace(/\.(glb|gltf)$/i, '');
    gltfGroup.userData = { id, type: 'imported' };

    // Auto-normalize bounding box so model fits nicely in view
    const bbox = new THREE.Box3().setFromObject(gltfGroup);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const maxAxis = Math.max(size.x, size.y, size.z);
    if (maxAxis > 0) {
      const scale = 2.0 / maxAxis;
      gltfGroup.scale.set(scale, scale, scale);
    }
    // Ground model
    const adjustedBox = new THREE.Box3().setFromObject(gltfGroup);
    gltfGroup.position.y = -adjustedBox.min.y;

    this.objectsRoot.add(gltfGroup);
    this.objectMap.set(id, gltfGroup);
    this.selectObject(id);
    if (this.onSceneDirty) this.onSceneDirty();

    return id;
  }

  public updateObjectTransform(
    id: string,
    transform: { position?: [number, number, number]; rotation?: [number, number, number]; scale?: [number, number, number] }
  ) {
    const obj = this.objectMap.get(id);
    if (!obj) return;

    if (transform.position) obj.position.set(...transform.position);
    if (transform.rotation) obj.rotation.set(...transform.rotation);
    if (transform.scale) obj.scale.set(...transform.scale);

    if (this.onSceneDirty) this.onSceneDirty();
  }

  public updateObjectMaterial(id: string, matData: Partial<PBRMaterialData>) {
    const obj = this.objectMap.get(id);
    if (!obj) return;

    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const currentMat = mesh.material as THREE.MeshStandardMaterial;
          if (matData.color) currentMat.color.set(matData.color);
          if (matData.roughness !== undefined) currentMat.roughness = matData.roughness;
          if (matData.metalness !== undefined) currentMat.metalness = matData.metalness;
          if (matData.wireframe !== undefined) currentMat.wireframe = matData.wireframe;
          if (matData.emissive) currentMat.emissive.set(matData.emissive);
          if (matData.emissiveIntensity !== undefined) currentMat.emissiveIntensity = matData.emissiveIntensity;
        }
      }
    });

    if (this.onSceneDirty) this.onSceneDirty();
  }

  public setObjectVisibility(id: string, visible: boolean) {
    const obj = this.objectMap.get(id);
    if (obj) {
      obj.visible = visible;
      if (!visible && this.selectedObjectId === id) {
        this.selectObject(null);
      }
      if (this.onSceneDirty) this.onSceneDirty();
    }
  }

  public duplicateObject(id: string): string | null {
    const obj = this.objectMap.get(id);
    if (!obj) return null;

    const clone = obj.clone(true);
    const newId = `obj_${Date.now()}_copy`;
    clone.name = `${obj.name}_Copy`;
    clone.position.x += 0.8; // Offset slightly
    clone.userData = { ...obj.userData, id: newId };

    this.objectsRoot.add(clone);
    this.objectMap.set(newId, clone);
    this.selectObject(newId);
    if (this.onSceneDirty) this.onSceneDirty();

    return newId;
  }

  public deleteObject(id: string) {
    const obj = this.objectMap.get(id);
    if (!obj) return;

    if (this.selectedObjectId === id) {
      this.selectObject(null);
    }

    this.objectsRoot.remove(obj);
    this.objectMap.delete(id);

    // Dispose geometries & materials
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => mat.dispose());
        } else {
          m.material?.dispose();
        }
      }
    });

    if (this.onSceneDirty) this.onSceneDirty();
  }

  public resetScene() {
    this.selectObject(null);
    const ids = Array.from(this.objectMap.keys());
    ids.forEach((id) => this.deleteObject(id));
  }

  public resetCamera() {
    this.camera.position.set(4, 3, 5);
    this.controls.target.set(0, 1, 0);
    this.controls.update();
  }

  public setCameraView(preset: 'perspective' | 'front' | 'top' | 'side' | 'isometric') {
    const target = this.controls.target;
    switch (preset) {
      case 'front':
        this.camera.position.set(target.x, target.y + 0.5, target.z + 5);
        break;
      case 'top':
        this.camera.position.set(target.x, target.y + 6, target.z + 0.001);
        break;
      case 'side':
        this.camera.position.set(target.x + 5, target.y + 0.5, target.z);
        break;
      case 'isometric':
        this.camera.position.set(target.x + 4, target.y + 4, target.z + 4);
        break;
      case 'perspective':
      default:
        this.camera.position.set(target.x + 3.5, target.y + 2.5, target.z + 4.5);
        break;
    }
    this.controls.update();
  }

  public toggleTurntable(enabled?: boolean) {
    this.isTurntableActive = enabled !== undefined ? enabled : !this.isTurntableActive;
    return this.isTurntableActive;
  }

  public getObjectsList(): { id: string; name: string; type: string; visible: boolean }[] {
    const list: { id: string; name: string; type: string; visible: boolean }[] = [];
    this.objectMap.forEach((obj, id) => {
      list.push({
        id,
        name: obj.name,
        type: obj.userData?.type || 'primitive',
        visible: obj.visible,
      });
    });
    return list;
  }

  public captureSnapshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  public getExportableRoot(): THREE.Object3D {
    return this.objectsRoot;
  }

  private handleResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    if (this.isDestroyed) return;

    const delta = this.clock.getDelta();

    // Turntable slow rotation
    if (this.isTurntableActive && !this.isTransformDragging) {
      this.objectsRoot.rotation.y += delta * 0.4;
    }

    if (this.controls.enabled) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
    this.animFrameId = requestAnimationFrame(this.animate);
  };

  public destroy() {
    this.isDestroyed = true;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    window.removeEventListener('resize', this.handleResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);

    this.controls.dispose();
    this.transformControls.dispose();
    this.resetScene();

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
