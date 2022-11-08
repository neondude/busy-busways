import { combineReducers, configureStore, createSlice } from "@reduxjs/toolkit";
import { Subject, distinctUntilChanged } from "rxjs";
import { getPositionHash } from "./markerManager";
export let gameState;
export let gameStateObservable;
export let gameMetaSubject;
export let gameMarkerStateSubject;

export const VIEW_MODE = 'view';
export const CHOOSABLE_MODE = 'choosable';
export const CHOSEN_MODE = 'chosen';
export const HIDDEN_MODE = 'hidden';


export const markerStateSlice = createSlice({
  name: "markerState",
  initialState: {
    /*
        location hash : {
          position : {lat:number, lng:number}
          mode: view | choosable | chosen | hidden
          passengerCount: number
        }
       */
  },
  reducers: {
    addMarker: (state, action) => {
      const { position, mode, passengerCount } = action.payload;
      const thePosHash = getPositionHash(position);
      state[thePosHash] = {
        position,
        mode,
        passengerCount,
      };
    },
    setMarkerModeView: (state, action) => {
      const { markerPositionHash } = action.payload;
      state[markerPositionHash].mode = "view";
    },
    setMarkerModeChosen: (state, action) => {
      const { markerPositionHash } = action.payload;
      state[markerPositionHash].mode = "chosen";
      state[markerPositionHash].timeChosen = new Date().getTime(); // so that I can order them for the path
    },
    setMarkerModeChoosable: (state, action) => {
      const { markerPositionHash } = action.payload;
      state[markerPositionHash].mode = "choosable";
    },
    setAllMarkersModeChoosable: (state, action) => {
      for (const markerPositionHash in state) {
        state[markerPositionHash].mode = "choosable";
      }
    },
  },
});

export const markerStateSliceActions =  markerStateSlice.actions;


export const initializeGameState = () => {
  const gameReducers = combineReducers({
    markerStateSlice: markerStateSlice.reducer,
    // gameMetaSlice: gameMetaSlice.reducer,
  });

  // function toObservable(store) {
  //   return {
  //     subscribe({ onNext }) {
  //       let dispose = store.subscribe(() => onNext(store.getState()));
  //       onNext(store.getState());
  //       return { dispose };
  //     }
  //   }
  // }
  gameState = configureStore({ reducer: gameReducers });
  gameStateObservable = {
    subscribe({ onNext }) {
      let dispose = gameState.subscribe(() => onNext(gameState.getState()));
      onNext(gameState.getState());
      return { dispose };
    },
  };

  gameMarkerStateSubject = (new Subject());
  gameStateObservable.subscribe({ onNext: (state) => {
    gameMarkerStateSubject.next(state.markerStateSlice);
  }});



};
