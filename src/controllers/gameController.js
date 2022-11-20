import { NYC_GAME } from "../constants/constantsNYC";
import { map } from "../main";
import {
  fromEvent,
  from,
  scan,
  debounce,
  interval,
  of,
  delay,
  concatMap,
} from "rxjs";
import {
  initializeGameState,
  markerStateSliceActions,
  gameState,
  markerStateSlice,
  VIEW_MODE,
  gameScoreSlice,
  gameScoreSliceActions,
} from "./gameStateManager";
import { initMarkerManager } from "./markerManager";
import { addPassengersToBus, removePassengersFromBus } from "./busOverlayManager";

let initialSpawnRate = 5 * 1000; // initial spawn rate is 4 seconds
let passengerSpawnRate;
let gameStartTime;
let passengerSpawnAudio;

export const initGame = () => {
  initializeGameState();
  initMarkerManager();
  displayInitialLocations();
  // set gameStartTime to current time
  gameStartTime = new Date().getTime();
  passengerSpawnAudio = new Audio("/assets/drop_003.ogg");
  beginSpawningPassengers()
};

const displayInitialLocations = () => {
  const addMarker = (position, mode, passengerCount) => {
    // set default values for mode and passengerCount
    if (!mode) {
      mode = VIEW_MODE;
    }
    if (!passengerCount) {
      passengerCount = 0;
    }

    gameState.dispatch(
      markerStateSlice.actions.addMarker({
        position,
        mode,
        passengerCount,
      })
    );
  };
  // adding delay because the html element takes time to be added to the DOM and i don't want the draw marker function to be called before the element is added
  from(NYC_GAME.slice(0, 2))
    .pipe(concatMap((item) => of(item).pipe(delay(250))))
    .subscribe((x) => {
      addMarker(x);
    });
  from(NYC_GAME.slice(2))
  .pipe(concatMap((item) => of(item).pipe(delay(15 * 1000))))
  .subscribe((x) => {
    addMarker(x);
  });

  // call function after 15 seconds
  setTimeout(() => {
    // if map zoom level greater than 15, then set it as 15
    if (map.getZoom() > 15) {
      map.setZoom(15);
    }
  }, 15 * 1000 * 7);
};

const beginSpawningPassengers = () => {
  // update passenger spawn rate based on gameStartTime. The passenger spawn rate will decrease as the game progress.
  // the passenger spawn rate will be 4 seconds at the start of the game and will decrease by 0.5 seconds every 10 seconds
  passengerSpawnRate = initialSpawnRate - Math.floor((new Date().getTime() - gameStartTime) / (15 * 1000)) * 500;

  // call set timeout function at passengerSpawnRate
  setTimeout(() => {
    gameState.dispatch(markerStateSliceActions.addRandomPassenger());
    // check if the passengerSpawnAdio is loaded
    if (passengerSpawnAudio.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
      passengerSpawnAudio.play();
    }
    beginSpawningPassengers();
  }, passengerSpawnRate);

  

};

export const pickUpPassenger = (pathHash, markerPositionHash) => {
  console.log("pickup passenger", gameState.getState().markerStateSlice[markerPositionHash]);
  const passengersAtMarker = gameState.getState().markerStateSlice[markerPositionHash].passengerCount;
  const markerTypeOfPosition = gameState.getState().markerStateSlice[markerPositionHash].markerType;
  gameState.dispatch(markerStateSliceActions.removeAllPassengersFromMarker({ markerPositionHash }));
  const markerTypeOfDestination = markerTypeOfPosition === "oval" ? "square" : "oval";
  addPassengersToBus(pathHash, passengersAtMarker, markerTypeOfDestination);
  
}

export const dropOffPassenger = (pathHash, markerPositionHash) => {
  const markerType = gameState.getState().markerStateSlice[markerPositionHash].markerType;
  const passengersOnBus = removePassengersFromBus(pathHash, markerType);
  gameState.dispatch(gameScoreSliceActions.addScore({score: passengersOnBus * 10}));
}
