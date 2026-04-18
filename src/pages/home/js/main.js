import * as THREE from "three";
import { createRenderer } from "./renderer.js";
import { createCamera, setupParallax, setupFocus } from "./camera.js";
import { createScene } from "./scene.js";

const ZOOM_DIST = 5;
const TWEEN_SPEED = 0.07;

export function main( canvas, onPlanetFocus ) {

    // --- Initialisation ---

    const renderer = createRenderer( canvas );

    const { camera, basePosition } = createCamera( canvas );

    const { scene, sun, planets } = createScene();

    const { targetOffset, currentOffset } = setupParallax( canvas );

    const { focus, zoomOut } = setupFocus( canvas, camera, planets, basePosition );

    const currentLookAt = new THREE.Vector3(0, 0, 0);
    const origin = new THREE.Vector3(0, 0, 0);

    
    function getLevel() {
        if (!focus.focusedPlanet) return 0;
        return focus.focusedPlanet.level;
    }
    
    // --- Render loop ---
    
    requestAnimationFrame(render);

    function render() {

        updateScene();
        updateCamera();
        handleResize();

        renderer.render(scene, camera);
        requestAnimationFrame(render); 
        
        // --- Done! (the rest is defining these functions) ---


        
        // Update the sun and planet motions, if not paused 
        function updateScene() {

            rotateSun()
            advancePlanetOrbits()
        
            function rotateSun() {
                if (!focus.paused) {
                    sun.rotation.y += 0.003;
                }
            }
            
            function advancePlanetOrbits() {
                planets.forEach(p => {
                    if (!focus.paused) p.angle += p.speed * 0.008;
            
                    p.mesh.position.set(
                        Math.cos(p.angle) * p.orbitR,
                        Math.sin(p.angle) * p.tilt * p.orbitR * 0.18,
                        Math.sin(p.angle) * p.orbitR
                    );
                    p.mesh.rotation.y += 0.01;
                });
            }
        
        }

        // Update the camera by tweening if needed, otherwise (unless paused, which is part of tweeening) do the parallax thing 
        function updateCamera() {
            
            updateFocusTarget();
        
            if (focus.tweening && focus.cameraTarget && focus.lookAtTarget) {
                updateCameraTween();
            } 
            else if (!focus.paused) {
                updateCameraParallax();
            }
        
            function updateFocusTarget() {
                
                if (!focus.focusedPlanet) return;
                const planetPosition = focus.focusedPlanet.mesh.position;
                const planetDirection = planetPosition.clone().normalize();
            
                focus.cameraTarget = planetPosition.clone().add(planetDirection.multiplyScalar(focus.focusedPlanet.radius + ZOOM_DIST));
                focus.cameraTarget.y += focus.focusedPlanet.radius * 0.8;
                focus.lookAtTarget = planetPosition.clone();
            }
            
            function updateCameraTween () {
            
                camera.position.lerp(focus.cameraTarget, TWEEN_SPEED);
                currentLookAt.lerp(focus.lookAtTarget, TWEEN_SPEED);
                camera.lookAt(currentLookAt);
            
                if (camera.position.distanceTo(focus.cameraTarget) < 0.05) {
                    focus.tweening = false;
                    if (focus.focusedPlanet && !focus.popupFired) {
                        focus.popupFired = true;
                        if (typeof onPlanetFocus === 'function') {
                            onPlanetFocus();
                    }
                }
                };
            
            }
        
            function updateCameraParallax() {
                
                currentOffset.x += (targetOffset.x - currentOffset.x) * 0.13;
                currentOffset.y += (targetOffset.y - currentOffset.y) * 0.13;
            
                camera.position.set(
                    basePosition.x + currentOffset.x,
                    basePosition.y + currentOffset.y,
                    basePosition.z
                );
            
                currentLookAt.lerp(origin, 0.1);
                camera.lookAt(currentLookAt);
                
            }
        }

        // Resize the canvas dimensions change, then update the camera so things don't get squashed
        function handleResize() {
    
            if (resizeRendererToDisplaySize( canvas, renderer )) {
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }
            
            function resizeRendererToDisplaySize( canvas, renderer ) {
                    
                const width  = canvas.clientWidth;
                const height = canvas.clientHeight;
                const needResize = canvas.width !== width || canvas.height !== height;
                
                if (needResize) {
                    renderer.setSize(width, height, false);
                }
                
                return needResize;
                
            }
            
        }
        
    }

    return { zoomOut, getLevel };
    
}