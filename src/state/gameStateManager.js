import { configureStore, createSlice } from "@reduxjs/toolkit";


export let gameState;

const markerSlice = createSlice({
  name: "marker",
  initialState: {
    chosenForPath : []
  },
  reducers: {
    addMarker: (state, action) => {
      console.log("add marker action")
        // if(state.choosenForPath.length == 2) {
        //     state.choosenForPath.pop();
        // }
        state.chosenForPath.push(action.payload)
    },
  },
});

export const markerListSelector = (state) => {
  return state.chosenForPath;
}

export const addChosenMarker = (position) => {
  console.log("add marker")
  gameState.dispatch(markerSlice.actions.addMarker(position))

}

// export const subscribeToMarkerSlice = (callBack) => {
  
// }
// function toObservable(store) {
//   return {
//     subscribe({ onNext }) {
//       let dispose = store.subscribe(() => onNext(store.getState()));
//       onNext(store.getState());
//       return { dispose };
//     }
//   }
// }

export let gameStateObservable;

export const initializeGameState = () => {
  gameState = configureStore({reducer : markerSlice.reducer})
  gameStateObservable = {
    subscribe({ onNext }) {
      let dispose = gameState.subscribe(() => onNext(gameState.getState()));
      onNext(gameState.getState());
      return { dispose };
    }
  }
}