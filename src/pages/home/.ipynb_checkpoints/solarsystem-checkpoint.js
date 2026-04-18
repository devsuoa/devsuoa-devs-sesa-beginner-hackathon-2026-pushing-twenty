timport * as THREE from "three";

const ZOOM_DIST    = 5;       // how close the camera gets (in planet radii + offset)
const TWEEN_SPEED  = 0.07;    // lerp factor for camera movement

export function main(canvas, onPlanetFocus) {
    const loader = new THREE.TextureLoader();
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.0;

    const createRepeatingTexture = (path, repeatX = 2, repeatY = 1) => {
        const tex = loader.load(path);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeatX, repeatY);
        return tex;
    };

    const fov = 45;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const near = 0.1;
    const far = 500;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    const initPos = new THREE.Vector3(0, 40, 70);
    camera.position.copy(initPos);

    const scene = new THREE.Scene();

    // Lighting
    {
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambient);

        const sunLight = new THREE.PointLight(0xaaeeff, 100, 300);
        sunLight.position.set(0, 0, 0);
        scene.add(sunLight);

        const rimLight = new THREE.PointLight(0x55ddff, 2.2, 150);
        rimLight.position.set(0, 0, 0);
        scene.add(rimLight);
    }

    // Sun
    const sunGeo = new THREE.SphereGeometry(4.5, 64, 64);
    const sunMat = new THREE.MeshStandardMaterial({
        map: createRepeatingTexture('/textures/glorptest.png', 3, 3),
        emissiveMap: loader.load('/textures/suntexture.webp'), // same tex drives the glow
        emissive: 0x91ffaf,
        emissiveIntensity: 0.1,
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    // Planets
    const planetData = [
        { radius: 1.1, orbitR: 14, speed: 0.8,  tilt: 0.2,  color: 0xff6644, emissive: 0x441100, texture: '/textures/texture1.webp'},
        { radius: 1.5, orbitR: 24, speed: 0.45, tilt: 0.35, color: 0x44aaff, emissive: 0x001133, texture: '/textures/texture2.webp' },
        { radius: 1.2, orbitR: 36, speed: 0.25, tilt: 0.15, color: 0x88dd55, emissive: 0x112200, texture: '/textures/texture3.webp'},
    ];

    const planets = planetData.flatMap(d => {
    
        
        const pts = [];
        for (let i = 0; i <= 128; i++) {
            const a = (i / 128) * Math.PI * 2;
            pts.push(new THREE.Vector3(
                Math.cos(a) * d.orbitR,
                Math.sin(a) * d.tilt * d.orbitR * 0.18,
                Math.sin(a) * d.orbitR
            ));
        }
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const orbitMat = new THREE.LineBasicMaterial({ color: 0x334455, transparent: true, opacity: 0.30 });
        scene.add(new THREE.LineLoop(orbitGeo, orbitMat));

        const baseAngle = Math.random() * Math.PI * 2;

        return [0, 1, 2].map(i => {
            const geo = new THREE.SphereGeometry(d.radius, 36, 36);
            const mat = new THREE.MeshStandardMaterial({
                map: loader.load(d.texture),
                roughness: 0.65,
                metalness: 0.05
            });
            const mesh = new THREE.Mesh(geo, mat);
            scene.add(mesh);
            const minSeparation = Math.PI * (90 / 180);
            return { mesh, ...d, angle: baseAngle + (i * minSeparation) + (Math.random() * 0.5) };
        });
    });

    // Star field
    {
        const starGeo = new THREE.BufferGeometry();
        const starVerts = [];
        for (let i = 0; i < 2000; i++) {
            starVerts.push(
                (Math.random() - 0.5) * 600,
                (Math.random() - 1) * 600,
                (Math.random() - 0.5) * 600
            );
        }
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
        const starMat = new THREE.PointsMaterial({ color: 0xcceeff, size: 0.5, sizeAttenuation: true });
        scene.add(new THREE.Points(starGeo, starMat));
    }



    

    // Mouse parallax
    let targetOffset = { x: 0, y: 0 };
    let currentOffset = { x: 0, y: 0 };

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

    // Click to focus
    const raycaster = new THREE.Raycaster();
    const pointer   = new THREE.Vector2();

    let paused         = false;
    let focusedPlanet  = null;
    let cameraTarget   = null;
    let lookAtTarget   = null;
    let tweening       = false;
    let popupFired     = false;

    // Zoom out — resets focus and starts the camera tween back to the initial position.
    // Called both by canvas clicks on empty space and externally (e.g. the ✕ button).
    function zoomOut() {
        console.log("Hi");
        focusedPlanet = null;
        paused        = false;
        tweening      = true;
        cameraTarget  = initPos.clone();
        lookAtTarget  = new THREE.Vector3(0, 0, 0);
    }

    canvas.addEventListener('click', e => {
        const rect = canvas.getBoundingClientRect();
        pointer.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
        pointer.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const meshes = planets.map(p => p.mesh);
        const hits   = raycaster.intersectObjects(meshes);

        if (hits.length > 0) {
            const hit = hits[0];
            focusedPlanet = planets.find(p => p.mesh === hit.object);
            paused     = true;
            tweening   = true;
            popupFired = false;
        } else {
            zoomOut();
        }
    });

    // ─────────────────────────────────────────────────────────────────────

    function resizeRendererToDisplaySize(renderer) {
        const width  = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) renderer.setSize(width, height, false);
        return needResize;
    }

    const currentLookAt = new THREE.Vector3(0, 0, 0);

    function render() {

        planets.forEach(p => {
            if (!paused) {
                p.angle += p.speed * 0.008;
            }
            p.mesh.position.set(
                Math.cos(p.angle) * p.orbitR,
                Math.sin(p.angle) * p.tilt * p.orbitR * 0.18,
                Math.sin(p.angle) * p.orbitR
            );
            p.mesh.rotation.y += 0.01;
        });

        sun.rotation.y += 0.003;

        if (focusedPlanet) {
            const pPos = focusedPlanet.mesh.position;
            const dir = pPos.clone().normalize();
            cameraTarget = pPos.clone().add(dir.multiplyScalar(focusedPlanet.radius + ZOOM_DIST));
            cameraTarget.y += focusedPlanet.radius * 0.8;
            lookAtTarget = pPos.clone();
        }

        if (tweening && cameraTarget && lookAtTarget) {
            camera.position.lerp(cameraTarget, TWEEN_SPEED);
            currentLookAt.lerp(lookAtTarget, TWEEN_SPEED);
            camera.lookAt(currentLookAt);

            if (camera.position.distanceTo(cameraTarget) < 0.05) {
                tweening = false;

                if (focusedPlanet && !popupFired) {
                    popupFired = true;
                    if (typeof onPlanetFocus === 'function') {
                        onPlanetFocus();
                    }
                }
            }
        } else if (!paused) {
            currentOffset.x += (targetOffset.x - currentOffset.x) * 0.13;
            currentOffset.y += (targetOffset.y - currentOffset.y) * 0.13;

            camera.position.set(
                initPos.x + currentOffset.x,
                initPos.y + currentOffset.y,
                initPos.z
            );
            currentLookAt.lerp(new THREE.Vector3(0, 0, 0), 0.1);
            camera.lookAt(currentLookAt);
        }

        if (resizeRendererToDisplaySize(renderer)) {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    return { zoomOut };
}