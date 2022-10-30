import { initializeGameState } from "../state/gameStateManager"
import { initMarkerManager } from "./markerManager"



export const initGame = () => {
    initializeGameState()
    initMarkerManager()
}