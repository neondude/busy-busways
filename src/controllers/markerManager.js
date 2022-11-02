import objectHash from "object-hash";
import { NYC_CENTER } from "../constants/constantsNYC";
import { map } from "../main";
import {
  gameState,
  gameStateObservable,
  markerListSelector,
} from "./gameStateManager";

let currentMarkers;

export const getPositionHash = (thePos) => {
  return objectHash(thePos);
};

export const initMarkerManager = () => {
  currentMarkers = {
    /*
        markerPositionHash : {
            markerViewRef : markerView
            listenerSubject : 
        }
         */
  };
  // gameStateObservable.subscribe({onNext: handleStateChange})
};

// const handleStateChange = (state) => {
//     const markerList = markerListSelector(state)
//     for (const markerItem of markerList) {
//         drawMarker(markerItem)
//     }
// }

export const drawMarker = (position, mode) => {
    console.log("drawMarker" + position.lat + " " + position.lng)
  const thePosHash = getPositionHash(position);
  let markerView;
console.log("drawMarker hash" + thePosHash)
  if (!(thePosHash in currentMarkers)) {
    console.log("drawMarker the pos hash not exists")
    const pinElement = document.createElement("pin-component");
    pinElement.setAttribute("id", thePosHash)
    markerView = new google.maps.marker.AdvancedMarkerView({
      map,
      position: position,
      content: pinElement,
    });
    currentMarkers[thePosHash] = {
      theMarkerView: markerView,
      thePinElement: pinElement,
    };
    markerView.addListener("click", ({ domEvent, latLng }) => {
        // console.log(thePosHash + " has been click and the mode is " + pinElement.getAttribute("mode"))
        console.log("markerclicked")
    //   callback({ domEvent, latLng, markerId });
    });
  }
};
