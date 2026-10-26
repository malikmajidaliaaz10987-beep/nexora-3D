import * as THREE from 'three';
import { getProceduralTexture } from './proceduralTextures';

export function createCyberMech(color = '#06b6d4', accentColor = '#8b5cf6'): THREE.Group {
  const root = new THREE.Group();
  root.name = 'CyberMech_Model';

  // Materials
  const armorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.85,
    roughness: 0.25,
    map: getProceduralTexture('carbon_fiber', color),
  });

  const innerFrameMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.5,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor),
    metalness: 0.7,
    roughness: 0.2,
  });

  const visorMat = new THREE.MeshPhysicalMaterial({
    color: 0x06b6d4,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.8,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.6,
    transparent: true,
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
  });

  // 1. Pelvis / Central Pivot (sits at y = 1.0)
  const pelvisGeo = new THREE.CylinderGeometry(0.35, 0.28, 0.4, 8);
  const pelvis = new THREE.Mesh(pelvisGeo, innerFrameMat);
  pelvis.position.y = 1.0;
  pelvis.castShadow = true;
  root.add(pelvis);

  // 2. Torso Chassis
  const torsoGeo = new THREE.BoxGeometry(0.9, 0.85, 0.6);
  const torso = new THREE.Mesh(torsoGeo, armorMat);
  torso.position.y = 1.6;
  torso.castShadow = true;
  root.add(torso);

  // 3. Cockpit Visor / Head
  const headGeo = new THREE.BoxGeometry(0.45, 0.35, 0.5);
  const head = new THREE.Mesh(headGeo, armorMat);
  head.position.set(0, 2.15, 0.05);
  head.castShadow = true;
  root.add(head);

  const visorGeo = new THREE.BoxGeometry(0.38, 0.14, 0.1);
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 2.15, 0.31);
  root.add(visor);

  // 4. Chest Arc Reactor
  const reactorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
  reactorGeo.rotateX(Math.PI / 2);
  const reactor = new THREE.Mesh(reactorGeo, glowMat);
  reactor.position.set(0, 1.7, 0.32);
  root.add(reactor);

  // 5. Left & Right Shoulder Pauldrons
  const pauldronGeo = new THREE.ConeGeometry(0.3, 0.45, 6);
  pauldronGeo.rotateZ(Math.PI / 2);

  const leftShoulder = new THREE.Mesh(pauldronGeo, accentMat);
  leftShoulder.position.set(-0.7, 1.85, 0);
  leftShoulder.castShadow = true;
  root.add(leftShoulder);

  const rightShoulder = new THREE.Mesh(pauldronGeo, accentMat);
  rightShoulder.position.set(0.7, 1.85, 0);
  rightShoulder.rotation.z = Math.PI;
  rightShoulder.castShadow = true;
  root.add(rightShoulder);

  // 6. Arms & Blaster Cannons
  [-0.65, 0.65].forEach((xSide, i) => {
    const armGroup = new THREE.Group();
    armGroup.position.set(xSide, 1.7, 0);

    const bicep = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.45, 8), innerFrameMat);
    bicep.position.y = -0.25;
    bicep.castShadow = true;
    armGroup.add(bicep);

    const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.22), armorMat);
    forearm.position.set(0, -0.6, 0.05);
    forearm.castShadow = true;
    armGroup.add(forearm);

    // Blaster Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.4, 12), innerFrameMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, -0.7, 0.3);
    armGroup.add(barrel);

    root.add(armGroup);
  });

  // 7. Left & Right Legs (Anchored flush to ground Y=0)
  [-0.32, 0.32].forEach((xSide) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(xSide, 1.0, 0);

    // Thigh
    const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.45, 0.26), armorMat);
    thigh.position.y = -0.22;
    thigh.castShadow = true;
    legGroup.add(thigh);

    // Knee joint
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), innerFrameMat);
    knee.position.y = -0.45;
    legGroup.add(knee);

    // Shin / Calf
    const calf = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.24), innerFrameMat);
    calf.position.y = -0.7;
    calf.castShadow = true;
    legGroup.add(calf);

    // Foot (Touches Y=0)
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.48), accentMat);
    foot.position.set(0, -0.94, 0.1);
    foot.castShadow = true;
    legGroup.add(foot);

    root.add(legGroup);
  });

  return root;
}

export function createCombatDrone(primaryColor = '#06b6d4', glowColor = '#38bdf8'): THREE.Group {
  const root = new THREE.Group();
  root.name = 'CombatDrone_Model';

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.3,
    map: getProceduralTexture('hex_grid', primaryColor),
  });

  const rotorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(primaryColor),
    metalness: 0.8,
    roughness: 0.2,
  });

  const sensorMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(glowColor),
    emissive: new THREE.Color(glowColor),
    emissiveIntensity: 0.9,
    roughness: 0.1,
  });

  // 1. Central Aerodynamic Pod (raised off ground)
  const hull = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 16), bodyMat);
  hull.scale.set(1.2, 0.5, 1.4);
  hull.position.y = 1.2;
  hull.castShadow = true;
  root.add(hull);

  // 2. Optical Sensor Dome
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), sensorMat);
  eye.position.set(0, 1.2, 0.75);
  root.add(eye);

  // 3. 4 Rotor Booms (X configuration)
  const angles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  angles.forEach((rad) => {
    const armLen = 1.1;
    const px = Math.cos(rad) * armLen;
    const pz = Math.sin(rad) * armLen;

    // Boom arm
    const boomGeo = new THREE.CylinderGeometry(0.04, 0.05, armLen, 8);
    boomGeo.rotateZ(Math.PI / 2);
    const boom = new THREE.Mesh(boomGeo, bodyMat);
    boom.position.set(px * 0.5, 1.25, pz * 0.5);
    boom.rotation.y = -rad;
    boom.castShadow = true;
    root.add(boom);

    // Motor Pod
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.22, 16), bodyMat);
    motor.position.set(px, 1.3, pz);
    motor.castShadow = true;
    root.add(motor);

    // Ducted Fan / Guard Ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.035, 12, 24), rotorMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(px, 1.35, pz);
    root.add(ring);
  });

  // 4. Ventral Gimbal Weapon
  const gimbal = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), bodyMat);
  gimbal.position.set(0, 0.95, 0.1);
  root.add(gimbal);

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 12), bodyMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.92, 0.35);
  barrel.castShadow = true;
  root.add(barrel);

  // 5. Landing Skids (touches Y=0)
  [-0.4, 0.4].forEach((xSide) => {
    const strut1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6), bodyMat);
    strut1.position.set(xSide, 0.65, 0.2);
    strut1.rotation.z = xSide * 0.3;
    root.add(strut1);

    const strut2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6), bodyMat);
    strut2.position.set(xSide, 0.65, -0.2);
    strut2.rotation.z = xSide * 0.3;
    root.add(strut2);

    const skid = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 1.2), rotorMat);
    skid.position.set(xSide * 1.3, 0.04, 0);
    skid.castShadow = true;
    root.add(skid);
  });

  return root;
}

export function createCyberHelmet(color = '#8b5cf6'): THREE.Group {
  const root = new THREE.Group();
  root.name = 'CyberHelmet_Model';

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.9,
    roughness: 0.25,
    map: getProceduralTexture('brushed_metal', color),
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.95,
    roughness: 0.15,
  });

  const visorMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.7,
    roughness: 0.05,
    metalness: 0.2,
    transmission: 0.8,
    transparent: true,
  });

  // Base Plinth / Display Stand (sits at ground level 0)
  const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.15, 32), shellMat);
  standBase.position.y = 0.08;
  standBase.castShadow = true;
  root.add(standBase);

  const standStem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 16), goldMat);
  standStem.position.y = 0.55;
  root.add(standStem);

  // Helmet Cranial Dome
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 20), shellMat);
  dome.scale.set(0.9, 1.05, 1.0);
  dome.position.y = 1.5;
  dome.castShadow = true;
  root.add(dome);

  // Curved Facet Visor
  const visorGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.5, 16, 1, false, 0, Math.PI);
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 1.45, 0.12);
  visor.rotation.y = -Math.PI / 2;
  root.add(visor);

  // Temple Audio/Comms Hubs
  [-0.68, 0.68].forEach((xSide) => {
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.15, 16), goldMat);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(xSide, 1.45, 0);
    root.add(hub);

    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.4), shellMat);
    fin.position.set(xSide * 1.05, 1.5, -0.2);
    root.add(fin);
  });

  // Jaw Rebreather Modules
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.28, 0.4), shellMat);
  jaw.position.set(0, 1.1, 0.45);
  jaw.castShadow = true;
  root.add(jaw);

  return root;
}

export function createCrystalMonolith(glowColor = '#06b6d4'): THREE.Group {
  const root = new THREE.Group();
  root.name = 'CrystalMonolith_Model';

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.8,
    metalness: 0.1,
  });

  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(glowColor),
    emissive: new THREE.Color(glowColor),
    emissiveIntensity: 0.6,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.85,
    transparent: true,
  });

  // Octagonal Stone Base Plinth (at Y=0)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.3, 8), stoneMat);
  base.position.y = 0.15;
  base.castShadow = true;
  root.add(base);

  // Main Floating Obelisk Crystal
  const crystalGeo = new THREE.ConeGeometry(0.5, 2.4, 6);
  const crystalTop = new THREE.Mesh(crystalGeo, crystalMat);
  crystalTop.position.y = 1.7;
  crystalTop.castShadow = true;
  root.add(crystalTop);

  const crystalBottom = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 6), crystalMat);
  crystalBottom.position.y = 0.8;
  crystalBottom.rotation.x = Math.PI;
  crystalBottom.castShadow = true;
  root.add(crystalBottom);

  // 4 Orbiting Resonant Shards
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const shard = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 5), crystalMat);
    shard.position.set(Math.cos(angle) * 1.0, 1.4 + (i % 2) * 0.2, Math.sin(angle) * 1.0);
    shard.rotation.z = 0.2;
    root.add(shard);
  }

  return root;
}

export function createSciFiPod(color = '#3b82f6'): THREE.Group {
  const root = new THREE.Group();
  root.name = 'SciFiPod_Model';

  const hullMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.85,
    roughness: 0.2,
  });

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.9,
    roughness: 0.3,
    map: getProceduralTexture('carbon_fiber', color),
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.4,
    transmission: 0.9,
    roughness: 0.05,
    transparent: true,
  });

  // Base Capsule Body
  const pod = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 1.2, 16, 24), hullMat);
  pod.rotation.x = Math.PI / 2;
  pod.position.y = 0.9;
  pod.castShadow = true;
  root.add(pod);

  // Panoramic Bubble Canopy
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.48, 20, 16), glassMat);
  glass.scale.set(0.9, 0.7, 1.2);
  glass.position.set(0, 1.15, 0.2);
  root.add(glass);

  // Winglets
  [-0.7, 0.7].forEach((xSide) => {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.8), carbonMat);
    wing.position.set(xSide, 0.85, -0.2);
    wing.rotation.y = xSide * 0.2;
    wing.castShadow = true;
    root.add(wing);
  });

  // Engine Thruster
  const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.4, 16), carbonMat);
  thruster.rotation.x = Math.PI / 2;
  thruster.position.set(0, 0.9, -1.0);
  root.add(thruster);

  // Landing Feet (touches Y=0)
  [-0.5, 0.5].forEach((xSide) => {
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 1.4), carbonMat);
    foot.position.set(xSide * 1.1, 0.05, 0);
    foot.castShadow = true;
    root.add(foot);

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), hullMat);
    leg.position.set(xSide * 0.8, 0.45, 0);
    leg.rotation.z = xSide * 0.4;
    root.add(leg);
  });

  return root;
}
