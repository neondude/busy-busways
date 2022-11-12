import { map } from "../main";

import ThreeJSOverlayView from "@ubilabs/threejs-overlay-view";
import { Subject } from "rxjs";

export let overLayAnimationRunning = true;
export let overlay;
export let overlayUpdateSubject = new Subject();

export const initThreeJSOverlay = (overlayCenter) => {
    overlay = new ThreeJSOverlayView(overlayCenter);
    overlay.setMap(map);
    overlay.update = () => {
      overlayUpdateSubject.next();
  
      if (overLayAnimationRunning) {
        overlay.requestRedraw();
      }
    };
    overlay.requestRedraw();
  };