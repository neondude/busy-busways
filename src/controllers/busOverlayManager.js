import ThreeJSOverlayView from "@ubilabs/threejs-overlay-view";
import { delay, interval, Observable, Subject, timeout } from "rxjs";

import {
  BoxGeometry,
  CatmullRomCurve3,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from "three";
import {Line2} from 'three/examples/jsm/lines/Line2.js';
import {LineMaterial} from 'three/examples/jsm/lines/LineMaterial.js';
import {LineGeometry} from 'three/examples/jsm/lines/LineGeometry.js';

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { map } from "../main";

// export let overLayAnimationRunning = true;
// export let overlay;
// export let animateSubject = new Subject();

// export const initThreeJSOverlay = (overlayCenter) => {
//   overlay = new ThreeJSOverlayView(overlayCenter);
//   overlay.setMap(map);
//   overlay.update = () => {
//     animateSubject.next();

//     if (overLayAnimationRunning) {
//       overlay.requestRedraw();
//     }
//   };
//   overlay.requestRedraw();
// };

async function loadBusModel() {
  const loader = new GLTFLoader();

  return new Promise((resolve) => {
    // loader.load('/assets/lowpoly-sedan.glb', gltf => {
    loader.load("/assets/low_poly_bus.glb", (gltf) => {
      const group = gltf.scene;
      console.log("car", group);
      // const carModel = group.getObjectByName('sedan');
      const carModel = group.getObjectByName("Sketchfab_model");

      carModel.scale.setScalar(10);
      // carModel.rotation.set(Math.PI / 2, 0, Math.PI, 'ZXY');
      carModel.rotation.set(2 * Math.PI, 0, Math.PI, "ZXY");

      resolve(group);
    });
  });
}

export const drawAndAnimateBus = async (animationPath) => {
  const scene = overlay.getScene();
  const SCALING_FACTOR = 2.5;
  const ANIMATION_DURATION = 455 * SCALING_FACTOR;
  
  const animatePoints = animationPath
    .slice(0, -1)
    .map((p) => overlay.latLngAltToVector3(p));

  const animateCurve = new CatmullRomCurve3(
    animatePoints,
    false,
    "catmullrom",
    0.2
  );
  animateCurve.updateArcLengths();

  let busModel = await loadBusModel()
  scene.add(busModel);
  // .then((obj) => {
  //   busModel = obj;
  //   scene.add(busModel);

  //   // since loading the car-model happened asynchronously, we need to
  //   // explicitly trigger a redraw.
  //   // overlay.requestRedraw();
  // });

  const CAR_FRONT = new Vector3(0, 1, 0);
  const tmpVec3 = new Vector3();
  const busProgressSubscription = interval(1).subscribe((i) => {
    const animationProgress = (i % ANIMATION_DURATION) / ANIMATION_DURATION;
    animateCurve.getPointAt(animationProgress, busModel.position);
    const busLatLon = overlay.vector3ToLatLngAlt(busModel.position);
    // {lat: 40.75791927642595,lng: -73.97764875351876 }
    if(busLatLon.lat === 40.757919276425) {
      console.log('busLatLon', busLatLon);
    }
    
    animateCurve.getTangentAt(animationProgress, tmpVec3);
    busModel.quaternion.setFromUnitVectors(CAR_FRONT, tmpVec3);
    overlay.requestRedraw();
  });
  
  // animateSubject.subscribe({
  //   next: () => {
  //     // trackLine.material.resolution.copy(overlay.getViewportSize())
  //     if (!busModel) return;

  //     const animationProgress =
  //       (performance.now() % ANIMATION_DURATION) / ANIMATION_DURATION;

  //     animateCurve.getPointAt(animationProgress, busModel.position);
  //     animateCurve.getTangentAt(animationProgress, tmpVec3);
  //     busModel.quaternion.setFromUnitVectors(CAR_FRONT, tmpVec3);

  //     // overlay.requestRedraw();
  //   },
  // });
};


// export const draw3dPath = (path) => {
//   const scene = overlay.getScene();
//   const points = path.map((p) => overlay.latLngAltToVector3(p));
//   const curve = new CatmullRomCurve3(points, false, "catmullrom", 0.2);
//   curve.updateArcLengths();
//   const trackLine = createTrackLine(curve);
//   scene.add(trackLine);
//   animateSubject.subscribe({
//     next: () => {
//       trackLine.material.resolution.copy(overlay.getViewportSize());
//       overlay.requestRedraw();
//     },
// });
// }

// function createTrackLine(curve) {
//   const numPoints = 10 * curve.points.length;
//   const curvePoints = curve.getSpacedPoints(numPoints);
  
//   const positions = new Float32Array(numPoints * 3);

//   for (let i = 0; i < numPoints; i++) {
//     curvePoints[i].toArray(positions, 3 * i);
//   }

//   const trackLine = new Line2(
//     new LineGeometry(),
//     new LineMaterial({
//       color: 0xd01b1b,
//       linewidth: 5
//     })
//   );

//   trackLine.geometry.setPositions(positions);

//   return trackLine;
// }