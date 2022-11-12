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

export const initDirectionsService = async () => {
  directionsService = await new google.maps.DirectionsService();
};

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
    legDistances
  };
};

export const getPathHash =  (pathArray) => {
  const hash = objectHash(pathArray, { unorderedArrays : false})
  console.log(hash)
}


export const draw3dPath = (pathArray) => {
  const scene = overlay.getScene();
  const points = pathArray.map((p) => overlay.latLngAltToVector3(p));
  const curve = new CatmullRomCurve3(points, false, "catmullrom", 0.2);
  curve.updateArcLengths();
  const trackLine = createTrackLine(curve);
  scene.add(trackLine);
  overlayUpdateSubject.subscribe({
    next: () => {
      trackLine.material.resolution.copy(overlay.getViewportSize());
      overlay.requestRedraw();
    },
});
}

function createTrackLine(curve) {
  const numPoints = 10 * curve.points.length;
  const curvePoints = curve.getSpacedPoints(numPoints);
  
  const positions = new Float32Array(numPoints * 3);

  for (let i = 0; i < numPoints; i++) {
    curvePoints[i].toArray(positions, 3 * i);
  }

  const trackLine = new Line2(
    new LineGeometry(),
    new LineMaterial({
      color: 0xd01b1b,
      linewidth: 5
    })
  );

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
