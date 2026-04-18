import * as THREE from "three";

export function createRenderer( canvas ) {
    
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        canvas 
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.0;

    return renderer
    
}