import { combineReducers, configureStore, createSlice } from "@reduxjs/toolkit";


export let gameState;

export let gameStateObservable;

const markerStateSlice = createSlice({
  name: "markerState",
  initialState: [
    {
      /*
        location hash : {
          position : {lat:number, lng:number}
          mode: view | choosable | chosen 
          passengerCount: number
        }
       */

    }
  ]

})

const gameMetaSlice = createSlice({
  name: "gameMeta",
  initialState: {
    revealProgress: 0
  },
  reducers: {
    incrementRevealProgress: (state, action) => {
      state.revealProgress += 1
    },
    resetRevealProgress: (state, action) => {
      state.revealProgress = 0
    }
  }
})

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
  return state.markerSlice.chosenForPath;
}

export const addChosenMarker = (position) => {
  console.log("add marker")
  gameState.dispatch(markerSlice.actions.addMarker(position))

}




export const initializeGameState = () => {

  const gameReducers  = combineReducers({
    markerSlice : markerSlice.reducer,
    markerStateSlice : markerStateSlice.reducer,
    gameMetaSlice: gameMetaSlice.reducer
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
  gameState = configureStore({reducer: gameReducers});
    gameStateObservable = {
    subscribe({ onNext }) {
      let dispose = gameState.subscribe(() => onNext(gameState.getState()));
      onNext(gameState.getState());
      return { dispose };
    }
  }
}