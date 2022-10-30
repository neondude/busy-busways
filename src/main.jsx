import { configureStore } from '@reduxjs/toolkit'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './components/App'
import { initGame } from './controllers/gameController'
import './css/index.css'
import { gameState } from './state/gameStateManager'

export let map;

export const NYC_CENTER = {
  "lat": 40.72272082997079,
  "lng": -73.99463750732538
};

const loadMap = async () => {
  map = await new google.maps.Map(document.getElementById("map"), {
    center: NYC_CENTER,
    zoom: 14,
    heading: 0,
    tilt: 47.5,
    mapId: "188985496c7786bd",
    // gestureHandling: 'greedy',
    mapTypeControl: false,
    zoomControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    disableDoubleClickZoom: true,
  });
  
  
};

async function initMap() {
  // googleLib = google;
  console.log("init map called");
  await loadMap();
  initGame();

  

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Provider store={gameState}>
        <App />
      </Provider>
    </React.StrictMode>
  )
}

window.initMap = initMap;