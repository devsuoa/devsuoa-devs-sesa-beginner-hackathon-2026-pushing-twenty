import * as THREE from "three";

export function createCamera( canvas ) {
    
    const fov = 45;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const near = 0.1;
    const far = 500;
    const basePosition = new THREE.Vector3(0, 40, 70);
    
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    
    camera.position.copy(basePosition);

    return { camera, basePosition };
    
}

export function setupParallax( canvas ) {
    
    // Mouse parallax
    const targetOffset = { x: 0, y: 0 };
    const currentOffset = { x: 0, y: 0 };

    window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width  - 0.5;
        const ny = (e.clientY - rect.top)  / rect.height - 0.5;
        targetOffset.x =  nx * 20;
        targetOffset.y = -ny * 20;
    });

    window.addEventListener('mouseleave', () => {
        targetOffset.x = 0;
        targetOffset.y = 0;
    });

    return { targetOffset, currentOffset };
    
}

export function setupFocus( canvas, camera, planets, basePosition ) {
    
    const focus = {
        raycaster:    new THREE.Raycaster(),
        pointer:      new THREE.Vector2(),
        paused:       false,
        focusedPlanet: null,
        cameraTarget:  null,
        lookAtTarget:  null,
        tweening:      false,
        popupFired: false,
    };

    canvas.addEventListener('click', e => {
        const rect = canvas.getBoundingClientRect();
        focus.pointer.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
        focus.pointer.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
        focus.raycaster.setFromCamera(focus.pointer, camera);

        const meshes = planets.map(p => p.mesh);
        const hits   = focus.raycaster.intersectObjects(meshes);

        if (hits.length > 0) {
            focus.focusedPlanet = planets.find(p => p.mesh === hits[0].object);
            focus.paused   = true;
            focus.tweening  = true;
            focus.popupFired = false;
        } 
        else {
            zoomOut();
        }
    });

    function zoomOut() {
        focus.focusedPlanet = null;
        focus.paused        = false;
        focus.tweening      = true;
        focus.cameraTarget  = basePosition.clone();
        focus.lookAtTarget  = new THREE.Vector3(0, 0, 0);
    }

    return { focus, zoomOut };
    
}



