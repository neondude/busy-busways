import { NYC_GAME } from "../constants/constantsNYC"
import { map } from "../main"
import { initializeGameState } from "./gameStateManager"
import { drawMarker, initMarkerManager } from "./markerManager"



export const initGame = () => {
    initializeGameState()
    initMarkerManager()
    loadLocationsState()
}

const loadLocationsState = () => {
    for (let i of NYC_GAME) {
        drawMarker(i,"view")

    }
}

export const increaseRevealProgress = () => {

}