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

let managedBusModels = {};

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
  distanceArray,
  wayPointArray,
  wayPointReachedCallback
) => {
  const scene = overlay.getScene();
  const SCALING_FACTOR = 2.5;
  // sum of durations
  const ANIMATION_DURATION =
    distanceArray.reduce((a, b) => a + b, 0) * SCALING_FACTOR;
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
    distanceArray,
    busModel,
    wayPointArray,
    animateCurve,
    overlay,
  );
  managedBusModels[pathHash] = {
    busModel,
    busAnimationManager,
    passengerCount : {
      oval: 0,
      square: 0,
    }
  };
  busAnimationManager.beginAnimation(wayPointReachedCallback);

  // const CAR_FRONT = new Vector3(0, 1, 0);
  // const tmpVec3 = new Vector3();
  // const busProgressSubscription = interval(1).subscribe((i) => {
  //   const animationProgress = (i % ANIMATION_DURATION) / ANIMATION_DURATION;
  //   animateCurve.getPointAt(animationProgress, busModel.position);

  //   animateCurve.getTangentAt(animationProgress, tmpVec3);
  //   busModel.quaternion.setFromUnitVectors(CAR_FRONT, tmpVec3);
  //   overlay.requestRedraw();
  // });

  
};

export const removeBus = (pathHash) => {
  // const pathHash = getPathHash(pathArray);
  const { busModel, busAnimationManager } = managedBusModels[pathHash];
  busAnimationManager.stopAnimation();
  delete managedBusModels[pathHash];
}

export const addPassengersToBus = (pathHash, passengerCount, passengerType) => {
  if (managedBusModels[pathHash]) {
    managedBusModels[pathHash].passengerCount[passengerType] += passengerCount;
    console.log("passengerCount on bus", pathHash, managedBusModels[pathHash].passengerCount);
  } else {
    console.log("bus not found", pathHash);
  }
}

export const removePassengersFromBus = (pathHash, passengerType) => {
  if (managedBusModels[pathHash]) {
    const temp = managedBusModels[pathHash].passengerCount[passengerType];
    managedBusModels[pathHash].passengerCount[passengerType] = 0;
    console.log("temp dropped passengers", temp, passengerType);
    return temp;
  } else {
    console.log("bus not found", pathHash);
  }
}
// a class to manage the bus object and its animation
export class BusAnimationManager {
  static SCALING_FACTOR = 3;// this should be whole number for simplicity
  constructor(pathArray, distanceArray, busModel, wayPointArray, animateCurve, overlay) {
    this.CAR_FRONT = new Vector3(0, 1, 0);
    this.tmpVec3 = new Vector3();
    this.pathArray = pathArray;
    this.pathHash = getPathHash(pathArray);
    this.totalDistance = distanceArray.reduce((a, b) => a + b, 0);
    this.distanceArray = distanceArray;
    this.pathHash = getPathHash(pathArray);
    this.busModel = busModel;
    // this.wayPointArray = wayPointArray
    // reverse and append wayPointArray to itself
    this.wayPointArray = [...wayPointArray, ...wayPointArray.reverse().slice(1)];
    this.animateCurve = animateCurve;
    this.overlay = overlay;

    this.animateForward = true;

    // cumulative sum of distanceArray
    this.cumulativeDistanceArray = distanceArray.reduce((a, b) => {
      const last = a[a.length - 1];
      a.push(last + b);
      return a;
    }, [0]);
    this.cumulativeDistanceArray = [...this.cumulativeDistanceArray, ...this.cumulativeDistanceArray.reverse().slice(1)]

    console.log("distanceArray", this.distanceArray);
    console.log("cumulative distance array",this.cumulativeDistanceArray);
   

    this.distanceIndex = 0;
    this.elapsedDistance = 0;
    this.waitTime = 0;
  }

  beginAnimation(wayPointReachedCallback) {
    this.setCurrentBusPosition(0);

    this.busProgressSubscription = interval(1).subscribe((i) => {

      
      if (this.waitTime > 0) {        
        this.waitTime--;
        return;
      }

      
      // sum distanceArray from 0 to distanceIndex
      let nextCheckPoint = this.cumulativeDistanceArray[this.distanceIndex];
      if (this.elapsedDistance === nextCheckPoint){
        if(nextCheckPoint == 0){
          this.setCurrentBusPosition(0);
          this.distanceIndex = 0;
        }
        this.waitTime = 500;

        wayPointReachedCallback(this.wayPointArray[this.distanceIndex],this.pathHash);


        this.distanceIndex += 1;
        if(this.distanceIndex === this.cumulativeDistanceArray.length +1) {
          this.distanceIndex = 0;
        }
        // if(this.elapsedDistance === this.totalDistance) {          
        //   this.elapsedDistance = 0;
        // }

        // console.log("after")
        // console.log("waypoint reached", this.pathArray[this.distanceIndex]);
        // console.log("elapsedDistance", this.elapsedDistance);
        // // console.log("nextCheckPoint", nextCheckPoint);
        // console.log("distanceIndex", this.distanceIndex);
        // console.log("wayPointArray", this.wayPointArray);
        // console.log("next checkpoint", this.cumulativeDistanceArray[this.distanceIndex]);
        return;
      }

      // let reverse = this.distanceIndex >= this.cumulativeDistanceArray.length/2;

      let animationProgress = (this.elapsedDistance % this.totalDistance) / (this.totalDistance);
      this.setCurrentBusPosition(animationProgress, reverse);

      if(this.distanceIndex >= this.cumulativeDistanceArray.length/2) {
        this.elapsedDistance -= 1;
      } else {
        this.elapsedDistance += 1;
      }
      console.log("elapsedDistance", this.elapsedDistance);
      
    });
  }

  setCurrentBusPosition(animationProgress) {
      this.animateCurve.getPointAt(animationProgress, this.busModel.position);
      this.animateCurve.getTangentAt(animationProgress, this.tmpVec3);
      this.busModel.quaternion.setFromUnitVectors(this.CAR_FRONT, this.tmpVec3);
      this.overlay.requestRedraw();    
  }
    

  // stop the bus animation
  stopAnimation() {
    this.busProgressSubscription.unsubscribe();
    this.overlay.getScene().remove(this.busModel);
    delete this.animateCurve;

  }
}
