import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { freezeTransforms } from "./matrixUpdates";

/** A small timber cottage. Parts are merged by finish, with no downloaded assets. */
export function buildOwnerHouse(): THREE.Group {
  const group = new THREE.Group();
  group.name = "owner-cottage";
  const finishes = {
    plaster: "#f1dfbb",
    timber: "#76513c",
    roof: "#52766d",
    brass: "#cba45e",
    stone: "#b6ad99",
    leaves: "#50714b",
    flowers: "#df928e",
    glass: "#f4c979",
  };
  type Finish = keyof typeof finishes;
  const parts = new Map<Finish, THREE.BufferGeometry[]>();
  const add = (finish: Finish, geometry: THREE.BufferGeometry, position: [number, number, number], rotation: [number, number, number] = [0, 0, 0]) => {
    // Extruded gables are non-indexed; all pieces must use the same layout to merge.
    if (geometry.index) {
      const expanded = geometry.toNonIndexed();
      geometry.dispose();
      geometry = expanded;
    }
    const matrix = new THREE.Matrix4().compose(new THREE.Vector3(...position), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)), new THREE.Vector3(1, 1, 1));
    geometry.applyMatrix4(matrix);
    const bucket = parts.get(finish) ?? [];
    bucket.push(geometry);
    parts.set(finish, bucket);
  };
  const box = (finish: Finish, dimensions: [number, number, number], position: [number, number, number], rotation?: [number, number, number]) => add(finish, new THREE.BoxGeometry(...dimensions), position, rotation);
  const beam = (from: [number, number, number], to: [number, number, number], thickness = 0.055) => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const geometry = new THREE.BoxGeometry(thickness, end.distanceTo(start), thickness);
    geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize()));
    add("timber", geometry, start.add(end).multiplyScalar(0.5).toArray() as [number, number, number]);
  };

  // Raised stone footing, cream plaster, exposed corner posts and floor band.
  box("stone", [1.74, 0.14, 1.4], [0, 0.07, 0]);
  box("plaster", [1.62, 1.08, 1.28], [0, 0.68, 0]);
  for (const x of [-0.8, 0.8]) for (const z of [-0.64, 0.64]) box("timber", [0.075, 1.14, 0.075], [x, 0.7, z]);
  for (const y of [0.19, 1.2]) box("timber", [1.71, 0.065, 1.35], [0, y, 0]);

  // Solid triangular gables and overhanging pitched roof.
  const gable = new THREE.Shape();
  gable.moveTo(-0.81, 0);
  gable.lineTo(0.81, 0);
  gable.lineTo(0, 0.65);
  gable.closePath();
  add("plaster", new THREE.ExtrudeGeometry(gable, { depth: 1.28, bevelEnabled: false }), [0, 1.22, -0.64]);
  const slope = Math.atan2(0.72, 0.99);
  for (const side of [-1, 1]) {
    box("roof", [1.24, 0.085, 1.66], [side * 0.49, 1.55, 0], [0, 0, -side * slope]);
    for (const z of [-0.84, 0.84]) box("timber", [1.27, 0.055, 0.065], [side * 0.49, 1.53, z], [0, 0, -side * slope]);
    // Thin raised standing seams add depth without noisy roof textures.
    for (const z of [-0.58, -0.29, 0, 0.29, 0.58]) box("roof", [1.24, 0.025, 0.025], [side * 0.49, 1.607, z], [0, 0, -side * slope]);
  }
  box("brass", [0.075, 0.075, 1.71], [0, 1.925, 0]);
  beam([-0.83, 1.24, 0.666], [0, 1.89, 0.666]);
  beam([0.83, 1.24, 0.666], [0, 1.89, 0.666]);

  // Front door with carved slats, a transom and small brass handle.
  box("timber", [0.42, 0.82, 0.055], [0, 0.56, 0.67]);
  box("glass", [0.24, 0.16, 0.022], [0, 0.82, 0.705]);
  for (const x of [-0.22, 0.22]) box("brass", [0.022, 0.84, 0.025], [x, 0.57, 0.709]);
  for (const x of [-0.13, -0.065, 0, 0.065, 0.13]) box("brass", [0.01, 0.44, 0.012], [x, 0.4, 0.705]);
  add("brass", new THREE.SphereGeometry(0.029, 8, 6), [0.13, 0.56, 0.722]);

  // Cross-paned windows and flower boxes on both front corners and side walls.
  const window = (x: number, z: number, rotation: number) => {
    const transform = new THREE.Matrix4().makeRotationY(rotation).setPosition(x, 0, z);
    const windowBox = (finish: Finish, dims: [number, number, number], pos: [number, number, number]) => {
      const geometry = new THREE.BoxGeometry(...dims).translate(...pos);
      geometry.applyMatrix4(transform);
      add(finish, geometry, [0, 0, 0]);
    };
    windowBox("timber", [0.39, 0.48, 0.07], [0, 0.77, 0]);
    windowBox("glass", [0.29, 0.37, 0.018], [0, 0.77, 0.045]);
    windowBox("timber", [0.025, 0.39, 0.025], [0, 0.77, 0.065]);
    windowBox("timber", [0.31, 0.025, 0.025], [0, 0.77, 0.065]);
    windowBox("timber", [0.46, 0.12, 0.17], [0, 0.47, 0.09]);
    for (let k = 0; k < 5; k++) {
      const pos = new THREE.Vector3((k - 2) * 0.075, 0.565, 0.1).applyMatrix4(transform);
      add("leaves", new THREE.IcosahedronGeometry(0.065, 0), pos.toArray() as [number, number, number]);
      pos.y += 0.04;
      add("flowers", new THREE.IcosahedronGeometry(0.034, 0), pos.toArray() as [number, number, number]);
    }
  };
  window(-0.54, 0.66, 0);
  window(0.54, 0.66, 0);
  window(0.82, 0, Math.PI / 2);
  window(-0.82, 0, -Math.PI / 2);
  window(0, -0.66, Math.PI);

  // Round attic window, sheltered porch and two shallow entrance steps.
  add("timber", new THREE.CylinderGeometry(0.17, 0.17, 0.035, 24), [0, 1.51, 0.668], [Math.PI / 2, 0, 0]);
  add("glass", new THREE.CylinderGeometry(0.125, 0.125, 0.02, 24), [0, 1.51, 0.695], [Math.PI / 2, 0, 0]);
  box("brass", [0.02, 0.24, 0.02], [0, 1.51, 0.713]);
  box("brass", [0.24, 0.02, 0.02], [0, 1.51, 0.713]);
  box("roof", [0.7, 0.06, 0.55], [0, 1.14, 0.86], [-0.12, 0, 0]);
  for (const x of [-0.3, 0.3]) box("timber", [0.045, 0.94, 0.045], [x, 0.63, 1.08]);
  box("stone", [0.68, 0.1, 0.3], [0, 0.12, 0.87]);
  box("stone", [0.76, 0.06, 0.24], [0, 0.03, 1.1]);
  box("stone", [0.24, 0.52, 0.25], [0.48, 1.73, -0.33]);
  box("timber", [0.3, 0.065, 0.31], [0.48, 2.015, -0.33]);

  for (const [finish, geometries] of parts) {
    const geometry = mergeGeometries(geometries, false)!;
    geometries.forEach((part) => part.dispose());
    const material = new THREE.MeshStandardMaterial({ color: finishes[finish], roughness: finish === "brass" ? 0.45 : 0.85, metalness: finish === "brass" ? 0.25 : 0 });
    if (finish === "glass") {
      material.emissive.set("#ffb45d");
      material.emissiveIntensity = 0.15;
      material.name = "owner-window";
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = finish !== "glass";
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  freezeTransforms(group);
  return group;
}
