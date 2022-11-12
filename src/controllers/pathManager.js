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
import { overlay, overlayUpdateSubject } from "./threeJSOverlayManager";
import objectHash from "object-hash";

let directionsService;
let managedPaths = {};

export const initDirectionsService = async () => {
  directionsService = await new google.maps.DirectionsService();
};

export const getPathHash =  (pathArray) => {
  const hash = objectHash(pathArray, { unorderedArrays : false})
  return hash;
}

export const getPathData = async (chosenArray) => {
  // log arguments
  let theOrigin = chosenArray[0];
  let theDestination = chosenArray[chosenArray.length - 1];
  let waypoints = chosenArray.slice(1, chosenArray.length - 1);

  console.log("getPathArray", theOrigin, theDestination, waypoints);
  //set default value for waypoints
  waypoints = waypoints ?? [];
  waypoints = waypoints.map((waypoint) => {
    return {
      location: waypoint,
      stopover: true,
    };
  });
  const response = await directionsService.route({
    origin: theOrigin,
    destination: theDestination,
    waypoints,
    travelMode: google.maps.TravelMode.DRIVING,
  });
  console.log("directions response", response);

  let legDistances = [];
  for (let i = 0; i < response.routes[0].legs.length; i++) {
    legDistances.push(response.routes[0].legs[i].distance.value);
  }

  let pathArray = [];
  const overviewPath = response.routes[0].overview_path;
  for (let i = 0; i < overviewPath.length; i++) {
    pathArray.push({
      lat: overviewPath[i].lat(),
      lng: overviewPath[i].lng(),
    });
  }
  

  return {
    pathArray,
    legDistances,
    pathHash : getPathHash(pathArray)
  };
};

export const save3dPath = (pathArray, index) => {
  
  dispatch(pathControlSlice.actions.addPath({ pathArray, index }));
}

export const draw3dPath = (pathArray, color, index) => {
  //check if path already exists in managedPaths
  const pathHash = getPathHash(pathArray)
  if (managedPaths[pathHash]) {
    console.log("path already exists")
    return;
  }
  const scene = overlay.getScene();
  const points = pathArray.map((p) => overlay.latLngAltToVector3(p));
  const curve = new CatmullRomCurve3(points, false, "catmullrom", 0.2);
  curve.updateArcLengths();
  const trackLine = createTrackLine(curve, color, index);
  scene.add(trackLine);

  const trackUpdateSubscription = overlayUpdateSubject.subscribe({
    next: () => {
      trackLine.material.resolution.copy(overlay.getViewportSize());
      overlay.requestRedraw();
    },
  });
  managedPaths[pathHash] = {
    trackLine,
    trackUpdateSubscription,
  };
}

export const remove3dPath = (pathHash) => {
  if (!managedPaths[pathHash]) {
    console.log("path does not exist")
    return;
  }
  const scene = overlay.getScene();
  const { trackLine, trackUpdateSubscription } = managedPaths[pathHash];
  scene.remove(trackLine);
  trackUpdateSubscription.unsubscribe();
  delete managedPaths[pathHash];
}

function createTrackLine(curve, color, index) {
  
  const numPoints = 10 * curve.points.length;
  const curvePoints = curve.getSpacedPoints(numPoints);
  
  const positions = new Float32Array(numPoints * 3);

  for (let i = 0; i < numPoints; i++) {
    curvePoints[i].toArray(positions, 3 * i);
  }

  const trackLine = new Line2(
    new LineGeometry(),
    new LineMaterial({
      color: color,
      linewidth: (20 - (index * 3)),
    })
  );
  
  // increase z index of trackLine to be above the map
  trackLine.position.z += 3 * index;


  trackLine.geometry.setPositions(positions);

  return trackLine;
}


// draw a google maps polyline
export const drawPolyline = (thePathArray) => {
  const lineSymbol = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    strokeColor: "#393",
    strokeWeight: "2px",
    fillOpacity: 0.8,
    fillColor: "#efefef",
  };
  const thePolyLinePath = new google.maps.Polyline({
    path: thePathArray,
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 0,
    editable: false,
    icons: [
      {
        icon: lineSymbol,
        repeat: "24px",
      },
    ],
  });

  thePolyLinePath.setMap(map);
};
