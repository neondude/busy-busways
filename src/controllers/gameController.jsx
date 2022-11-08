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
  // adding delay because the html element takes time to be added to the DOM
  from([NYC_GAME[0], NYC_GAME[1]])
    .pipe(concatMap((item) => of(item).pipe(delay(500))))
    .subscribe((x) => {
      addMarker(x);
    });
};
