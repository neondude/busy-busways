import objectHash from "object-hash";
import { Subject, distinctUntilChanged } from "rxjs";
import { NYC_CENTER } from "../constants/constantsNYC";
import { map } from "../main";
import {
  gameMarkerStateSubject,
  gameState,
  markerStateSliceActions,
} from "./gameStateManager";

let managedMarkers = {};
export const markerClickSubject = new Subject();

const handleMarkerClick = (markerPositionHash) => {
  if (gameState.getState().markerStateSlice[markerPositionHash]) {
    const currentMarkerState = gameState.getState().markerStateSlice[markerPositionHash];
    if (currentMarkerState) {
      if (currentMarkerState.mode === "choosable") {
        gameState.dispatch(
          markerStateSliceActions.setMarkerModeChosen({ markerPositionHash })
        );
      } else if (currentMarkerState.mode === "chosen") {
        gameState.dispatch(
          markerStateSliceActions.setMarkerModeChoosable({ markerPositionHash })
        );
      }
    }
  }
};

const handleGameMarkerStateChange = (state) => {
  // loop through all the markers in the state
  for (const markerPositionHash in state) {
    // call drawMarker on each marker with the marker's position and mode from state
    drawMarker(
      state[markerPositionHash].position,
      state[markerPositionHash].mode
    );
  }
};

export const getPositionHash = (thePos) => {
  return objectHash(thePos);
};

export const initMarkerManager = () => {
  gameMarkerStateSubject.subscribe(handleGameMarkerStateChange);
  markerClickSubject.subscribe(handleMarkerClick);
};

export const drawMarker = (position, mode, passengerCount) => {
  // console.log("drawMarker" + position.lat + " " + position.lng);
  const thePosHash = getPositionHash(position);

  //todo - check state instead of element
  // check if html element with id thePosHash exists
  const theMarker = document.getElementById(thePosHash);
  if (theMarker) {
    console.log("updateMarker");
    // if position, mode and passengerCount are the same, do nothing
    if (theMarker.getAttribute("mode") === mode) {
      // console.log("no update needed");
      return;
    }
    updateMarker(position, mode, passengerCount);
  } else {
    console.log("createNewMarker");
    createNewMarker(position, mode, passengerCount);
  }
};

const createNewMarker = (position, mode, passengerCount) => {
  const thePosHash = getPositionHash(position);
  const pinElement = document.createElement("pin-component");
  pinElement.setAttribute("id", thePosHash);
  //set mode attribute to pin element
  pinElement.setAttribute("mode", mode);
  const markerView = new google.maps.marker.AdvancedMarkerView({
    map,
    position,
    content: pinElement,
  });
  markerView.addListener("click", ({ domEvent, latLng }) => {
    const elementId = domEvent.target.getAttribute("pos");
    console.log("thePosHash marker click event", elementId);
    markerClickSubject.next(elementId);
  });
};

const updateMarker = (position, mode, passengerCount) => {
  console.log("updateMarker" + position.lat + " " + position.lng);
  const thePosHash = getPositionHash(position);
  const theMarker = document.getElementById(thePosHash);
  theMarker.setAttribute("mode", mode);
};
