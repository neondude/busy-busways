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
let gameOver = false;
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
  if(gameOver)
  {
    return;
  }
  // loop through all the markers in the state
  for (const markerPositionHash in state) {
    // if any passengerCOunt is 10 or greater then game over
    if (state[markerPositionHash].passengerCount >= 10) {
      // throw alert and reload page after ok is pressed
       gameOver = true;
      alert("Game Over.To many passengers were waiting for a ride");
      window.location.reload();
    }
    // call drawMarker on each marker with the marker's position and mode from state
    drawMarker(
      state[markerPositionHash].position,
      state[markerPositionHash].mode,
      state[markerPositionHash].markerType,
      state[markerPositionHash].passengerCount
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

export const drawMarker = (position, mode, markerType, passengerCount) => {
  // console.log("drawMarker" + position.lat + " " + position.lng);
  const thePosHash = getPositionHash(position);

  //todo - check state instead of element
  // check if html element with id thePosHash exists
  const theMarker = document.getElementById(thePosHash);
  if (theMarker) {
    // console.log("updateMarker");
    // if position, mode and passengerCount are the same, do nothing
    if (theMarker.getAttribute("mode") === mode && theMarker.getAttribute("pcount") === passengerCount.toString()) {
      console.log("no update needed");
      return;
    }
    updateMarker(position, mode, markerType, passengerCount);
  } else {
    // console.log("createNewMarker");
    createNewMarker(position, mode, markerType, passengerCount);
  }
};

const createNewMarker = (position, mode, markerType, passengerCount) => {
  const thePosHash = getPositionHash(position);
  const pinElement = document.createElement("pin-component");
  pinElement.setAttribute("id", thePosHash);
  //set mode attribute to pin element
  pinElement.setAttribute("mode", mode);
  pinElement.setAttribute("pcount", passengerCount);
  pinElement.setAttribute("mtype", markerType);
  pinElement.classList.add("pin-view");
  const markerView = new google.maps.marker.AdvancedMarkerView({
    map,
    position,
    content: pinElement,
  });
  markerView.addListener("click", ({ domEvent, latLng }) => {
    const elementId = domEvent.target.getAttribute("pos");
    markerClickSubject.next(elementId);
  });
  managedMarkers[thePosHash] = markerView;
};

export const setAllMarkersModeChoosable = () => {
  for (const markerPositionHash in managedMarkers) {
    const theMarkerViewElement = managedMarkers[markerPositionHash].content;
    theMarkerViewElement.setAttribute("mode", "choosable");
  }
};

export const setAllMarkersModeView = () => {
  for (const markerPositionHash in managedMarkers) {
    const theMarkerViewElement = managedMarkers[markerPositionHash].content;
    theMarkerViewElement.setAttribute("mode", "view");
  }
};


const updateMarker = (position, mode, markerType, passengerCount) => {
  console.log("updateMarker");
  const thePosHash = getPositionHash(position);
  const theMarker = document.getElementById(thePosHash);
  theMarker.setAttribute("mode", mode);
  theMarker.setAttribute("pcount", passengerCount);
};

export const getMarkerPcount = (position) => {
  const thePosHash = getPositionHash(position);
  const theMarker = document.getElementById(thePosHash);
  return theMarker.getAttribute("pcount");
}
