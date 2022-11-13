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
} from "./gameStateManager";
import { initMarkerManager } from "./markerManager";
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
  from(NYC_GAME)
    .pipe(concatMap((item) => of(item).pipe(delay(250))))
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
