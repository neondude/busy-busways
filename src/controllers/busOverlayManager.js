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
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { map } from "../main";
import { getPathHash } from "./pathManager";
import { overlay } from "./threeJSOverlayManager";

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

let mangaedBusModels = {};

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

export const drawAndAnimateBus = async (
  pathArray,
  durationArray,
  wayPointArray
) => {
  const scene = overlay.getScene();
  const SCALING_FACTOR = 2.5;
  // sum of durations
  const ANIMATION_DURATION =
    durationArray.reduce((a, b) => a + b, 0) * SCALING_FACTOR;
  // const ANIMATION_DURATION = 455 * SCALING_FACTOR;
  const pathHash = getPathHash(pathArray);

  const animatePoints = pathArray.map((p) => overlay.latLngAltToVector3(p));

  const animateCurve = new CatmullRomCurve3(
    animatePoints,
    false,
    "catmullrom",
    0.2
  );
  animateCurve.updateArcLengths();

  let busModel = await loadBusModel();
  scene.add(busModel);

  const busAnimationManager = new BusAnimationManager(
    pathArray,
    durationArray,
    busModel,
    wayPointArray,
    animateCurve,
    overlay,
  );
  busAnimationManager.beginAnimation(()=> {
    console.log("waypoint reached");
  });

  // const CAR_FRONT = new Vector3(0, 1, 0);
  // const tmpVec3 = new Vector3();
  // const busProgressSubscription = interval(1).subscribe((i) => {
  //   const animationProgress = (i % ANIMATION_DURATION) / ANIMATION_DURATION;
  //   animateCurve.getPointAt(animationProgress, busModel.position);

  //   animateCurve.getTangentAt(animationProgress, tmpVec3);
  //   busModel.quaternion.setFromUnitVectors(CAR_FRONT, tmpVec3);
  //   overlay.requestRedraw();
  // });

  mangaedBusModels[pathHash] = {
    busModel,
    busAnimationManager,
  };
};

export const removeBus = (pathHash) => {
  // const pathHash = getPathHash(pathArray);
  const { busModel, busAnimationManager } = mangaedBusModels[pathHash];
  busAnimationManager.stopAnimation();
  delete mangaedBusModels[pathHash];
}


// a class to manage the bus object and its animation
export class BusAnimationManager {
  static SCALING_FACTOR = 3;// this should be whole number for simplicity
  constructor(pathArray, durationArray, busModel, wayPointArray, animateCurve, overlay) {
    this.CAR_FRONT = new Vector3(0, 1, 0);
    this.tmpVec3 = new Vector3();
    this.pathArray = pathArray;
    this.durationArray = durationArray;
    this.totalDuration = durationArray.reduce((a, b) => a + b, 0);
    this.pathHash = getPathHash(pathArray);
    this.busModel = busModel;
    this.wayPointArray = wayPointArray;
    this.animateCurve = animateCurve;
    this.overlay = overlay;

    

    this.durationIndex = 0;
    this.wayPointIndex = 0;
    this.elapsedDuration = 0;
    this.animationProgress = 0;
    this.waitTime = 0;
  }

  beginAnimation(wayPointReachedCallback) {
    this.busProgressSubscription = interval(1).subscribe((i) => {
      // check if mod of i is equal to the duration of the current segment
      
      
      if (this.waitTime > 0) {
        
        this.waitTime--;
        return;
      }

      this.elapsedDuration++;

      let currentDurationProgress = (this.elapsedDuration % (this.totalDuration * BusAnimationManager.SCALING_FACTOR))

      console.log("currentDurationProgress", currentDurationProgress, (this.durationArray[this.durationIndex] * BusAnimationManager.SCALING_FACTOR));
      
      if (currentDurationProgress === (this.durationArray[this.durationIndex] * BusAnimationManager.SCALING_FACTOR)-1) {
        wayPointReachedCallback(this.wayPointArray[this.wayPointIndex]);
        this.durationIndex = this.durationIndex + 1 % this.durationArray.length;
        this.wayPointIndex = this.wayPointIndex + 1 % this.wayPointArray.length;
        this.waitTime = 2000;
      }
      this.animationProgress =
        (this.elapsedDuration % (this.totalDuration * BusAnimationManager.SCALING_FACTOR)) /
        (this.totalDuration * BusAnimationManager.SCALING_FACTOR);
      this.animateCurve.getPointAt(this.animationProgress, this.busModel.position);

      this.animateCurve.getTangentAt(this.animationProgress, this.tmpVec3);
      this.busModel.quaternion.setFromUnitVectors(this.CAR_FRONT, this.tmpVec3);
      this.overlay.requestRedraw();
    });
  }

  // stop the bus animation
  stopAnimation() {
    this.busProgressSubscription.unsubscribe();
    this.overlay.getScene().remove(this.busModel);
    delete this.animateCurve;

  }
}
