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
export const initGame = () => {
  initializeGameState();
  initMarkerManager();
  displayInitialLocations();
  beginSpawningPassengers();
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
};

const beginSpawningPassengers = () => {
  const passengerSpawnRate = 4000;
  const passengerSpawnInterval = interval(passengerSpawnRate);
  passengerSpawnInterval.subscribe(
    (x) => {
      // console.log("spawn passenger");
      gameState.dispatch(markerStateSliceActions.addRandomPassenger());
    }
  );

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
