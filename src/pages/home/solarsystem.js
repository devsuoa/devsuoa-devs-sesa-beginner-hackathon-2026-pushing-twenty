import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function main(canvas) {

	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
    renderer.setPixelRatio(window.devicePixelRatio);  
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.0;

	const fov = 45;
	const aspect = canvas.clientWidth / canvas.clientHeight;
	const near = 0.1;
	const far = 500;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
    const initPos = new THREE.Vector3(0, 40, 70);
    camera.position.copy(initPos);

	const scene = new THREE.Scene();

    // Lighting
    {

        const ambient = new THREE.AmbientLight( 0xffffff, 0.4 );
        scene.add(ambient);

        const sunLight = new THREE.PointLight( 0xaaeeff, 100, 300 );
        sunLight.position.set(0, 0, 0);
        scene.add(sunLight);

        const rimLight = new THREE.PointLight(0x55ddff, 2.2, 150 );
        rimLight.position.set(0, 0, 0);
        scene.add(rimLight);
        
	}

    // Sun
    const sunGeo = new THREE.SphereGeometry(
        4.5,  // radius
        64,   // horizontal segments (more = smoother)
        64    // vertical segments
    );
    
    const sunMat = new THREE.MeshStandardMaterial({
        color: 0xe8ffff,          // near-white with a cyan tint
        emissive: 0x88ffee,       // the self-glow colour (cyan)
        emissiveIntensity: 3.2,   // how strongly it glows regardless of lighting
        roughness: 0.0,           // perfectly smooth surface
        metalness: 0.0
    });
    
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    // Planets
    const planetData = [
        {
            radius:  1.1,       // size of the sphere
            orbitR:  14,        // distance from the star
            speed:   0.8,       // how fast it orbits (higher = faster)
            tilt:    0.2,       // slight vertical wobble in the orbit path
            color:   0xff6644,  // surface colour (orange-red)
            emissive: 0x441100  // dark-side glow colour (very dim red)
        },
        {
            radius:  1.5,
            orbitR:  24,
            speed:   0.45,
            tilt:    0.35,
            color:   0x44aaff,  // blue
            emissive: 0x001133
        },
        {
            radius:  1.2,
            orbitR:  36,
            speed:   0.25,
            tilt:    0.15,
            color:   0x88dd55,  // green
            emissive: 0x112200
        },
    ];

    // Build 3 planets for each orbit, then store them for animation
    const planets = planetData.flatMap(d => {
        
        // Create an orbit ring once per data entry
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
        const orbitMat = new THREE.LineBasicMaterial({
            color: 0x334455, transparent: true, opacity: 0.30
        });
        scene.add(new THREE.LineLoop(orbitGeo, orbitMat));

        const baseAngle = Math.random() * Math.PI * 2;
        
        // Create 3 planets for this specific orbit
        return [0, 1, 2].map(i => {
            const geo = new THREE.SphereGeometry(d.radius, 36, 36);
            const mat = new THREE.MeshStandardMaterial({
                color: d.color,
                emissive: d.emissive,
                emissiveIntensity: 1.0,
                roughness: 0.65,
                metalness: 0.05
            });
            const mesh = new THREE.Mesh(geo, mat);
            scene.add(mesh);

            // Logic: Base angle + (index * minimum separation) + random jitter
            // 45 degrees is Math.PI / 4
            const minSeparation = Math.PI * (90 / 180); 
            
            return {
                mesh,
                ...d,
                angle: baseAngle + (i * minSeparation) + (Math.random() * 0.5)
            };
        });
    });

    // // Build each planet mesh + orbit ring, then store them for animation
    // const planets = planetData.map(d => {
    
    //     // Planet sphere
    //     const geo = new THREE.SphereGeometry(d.radius, 36, 36);
    //     const mat = new THREE.MeshStandardMaterial({
    //     color:            d.color,
    //     emissive:         d.emissive,
    //     emissiveIntensity: 1.0,   // dark side stays faintly visible
    //     roughness:        0.65,
    //     metalness:        0.05
    //     });
    //     const mesh = new THREE.Mesh(geo, mat);
    //     scene.add(mesh);
        
    //     // Orbit ring — 128 points laid out in a circle (with a tiny vertical tilt)
    //     const pts = [];
    //     for (let i = 0; i <= 128; i++) {
    //         const a = (i / 128) * Math.PI * 2;  // angle in radians
    //             pts.push(new THREE.Vector3(
    //                 Math.cos(a) * d.orbitR,                    // X
    //                 Math.sin(a) * d.tilt * d.orbitR * 0.18,    // Y (tiny tilt)
    //                 Math.sin(a) * d.orbitR                     // Z
    //         ));
    //     }
    //     const orbitGeo = new THREE.BufferGeometry().setFromPoints(pts);
    //     const orbitMat = new THREE.LineBasicMaterial({
    //     color: 0x334455, transparent: true, opacity: 0.30
    //     });
    //     scene.add(new THREE.LineLoop(orbitGeo, orbitMat));
        
    //     // Start each planet at a random position on its orbit
    //     return { mesh, ...d, angle: Math.random() * Math.PI * 2 };

    // });

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
        
        const starMat = new THREE.PointsMaterial({
            color: 0xcceeff,  // blue-tinted white dots
            size: 0.5,
            sizeAttenuation: true  // farther stars appear smaller
        });
        
        scene.add(new THREE.Points(starGeo, starMat));
        
    }

    // Mouse 
    let targetOffset = { x: 0, y: 0 };   // where we WANT the camera to be
    let currentOffset = { x: 0, y: 0 };  // where the camera currently is (lerped)
    
    window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        // Normalise mouse to -0.5 … +0.5
        const nx = (e.clientX - rect.left) / rect.width  - 0.5;
        const ny = (e.clientY - rect.top)  / rect.height - 0.5;
        
        targetOffset.x =  nx * 20;   // horizontal range ±9 units
        targetOffset.y = -ny * 20;    // vertical range ±4.5 (inverted Y)
    });
    
    window.addEventListener('mouseleave', () => {
        // Drift back to centre when the mouse leaves
        targetOffset.x = 0;
        targetOffset.y = 0;
    });

    function resizeRendererToDisplaySize( renderer ) {

		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {

			renderer.setSize( width, height, false );

		}

		return needResize;

	}
    
    function render() {

        // Move each planet along its orbit
        planets.forEach(p => {
        p.angle += p.speed * 0.008;  // advance angle each frame
        
        // Convert polar angle → XYZ position on the orbit ellipse
        p.mesh.position.set(
            Math.cos(p.angle) * p.orbitR,
            Math.sin(p.angle) * p.tilt * p.orbitR * 0.18,
            Math.sin(p.angle) * p.orbitR
        );
        
        p.mesh.rotation.y += 0.01;  // spin the planet on its own axis
        });
        
        // Slowly spin the star
        sun.rotation.y += 0.003;

        // Smoothly interpolate the camera offset toward the mouse target.
        // 0.13 is the "lerp factor" — higher = snappier, lower = more lag.
        currentOffset.x += (targetOffset.x - currentOffset.x) * 0.13;
        currentOffset.y += (targetOffset.y - currentOffset.y) * 0.13;
        
        camera.position.set(
        initPos.x + currentOffset.x,
        initPos.y + currentOffset.y,
        initPos.z
        );
        camera.lookAt(0, 0, 0);

		if ( resizeRendererToDisplaySize( renderer ) ) {

			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );
    
}