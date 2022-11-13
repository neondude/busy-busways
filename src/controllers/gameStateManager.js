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
          passengerCount: number,
          markerType: oval | square
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
        markerType: Object.keys(state).length % 2 === 0 ? "oval" : "square",
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
    setAllMarkersModeView: (state, action) => {
      console.log("setAllMarkersModeView");
      for (const markerPositionHash in state) {
        state[markerPositionHash].mode = "view";
      }
    },
    addRandomPassenger: (state, action) => {
      // choose a random marker
      const markerPositionHashes = Object.keys(state);
      const randomMarkerPositionHash = markerPositionHashes[
        Math.floor(Math.random() * markerPositionHashes.length)
      ];
      state[randomMarkerPositionHash].passengerCount += 1;
    },
    removeAllPassengersFromMarker: (state, action) => {
      const { markerPositionHash } = action.payload;
      state[markerPositionHash].passengerCount = 0;
    }
  },
});

export const pathControlSlice = createSlice({
  name: "paths",
  initialState: {
    /*index : {
      pathHash: string,
      color: string,
    }*/
    1: {
      pathHash: null,
      color: "#ff4a09",//"#ff0000",

    },
    2: {
      pathHash: null,
      color: "#2ea754",//"#00ff00",

    },
    3: {
      pathHash: null,
      color: "#3973e1",//"#0000ff",

    },
    4: {
      pathHash: null,
      color: "#f39f17",//"#0000ff",

    },
  },
  reducers: {
    addPathHash: (state, action) => {
      const { pathHash, index } = action.payload;
      state[index].pathHash = pathHash;
    },
  },
});

export const gameScoreSlice = createSlice({
  name: "gameScore",
  initialState: 0,
  reducers: {
    addScore: (state, action) => {
      const { score } = action.payload;
      return state + score;
    },
  },
});

export const markerStateSliceActions =  markerStateSlice.actions;
export const pathControlSliceActions =  pathControlSlice.actions;
export const gameScoreSliceActions =  gameScoreSlice.actions;


export const initializeGameState = () => {
  const gameReducers = combineReducers({
    markerStateSlice: markerStateSlice.reducer,
    pathControlSlice: pathControlSlice.reducer,
    gameScoreSlice: gameScoreSlice.reducer,
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
