import * as THREE from "three";

export function createScene() {
    
    const loader = new THREE.TextureLoader();
    
    const scene = new THREE.Scene();
    
    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const sunLight = new THREE.PointLight(0xaaeeff, 100, 300);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    const rimLight = new THREE.PointLight(0x55ddff, 2.2, 150);
    rimLight.position.set(0, 0, 0);
    scene.add(rimLight);

    // Star field
    const starGeo = new THREE.BufferGeometry();
    const starVerts = [];
    for (let i = 0; i < 2000; i++) {
        starVerts.push(
            (Math.random() - 0.5) * 600,
            (Math.random() - 1.0) * 600, // y-value is between 0 to -600 to keep it under the solar system
            (Math.random() - 0.5) * 600
        );
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
    const starMat = new THREE.PointsMaterial({ 
        color: 0xcceeff, 
        size: 0.5, 
        sizeAttenuation: true 
    });
    scene.add(new THREE.Points(starGeo, starMat));

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

    function createRepeatingTexture(path, repeatX = 2, repeatY = 1) {
        const tex = loader.load(path);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeatX, repeatY);
        return tex;
    }

    // Planets
    const planetData = [
        { level: 1, id: 1, radius: 1.1, orbitR: 14, speed:  0.8, angle:   0 * (Math.PI / 180), tilt: 0.2,  color: 0xff6644, emissive: 0x441100, texture: '/textures/planet1.png'},
        { level: 1, id: 2, radius: 1.1, orbitR: 14, speed:  0.8, angle: 120 * (Math.PI / 180),  tilt: 0.2,  color: 0xff6644, emissive: 0x441100, texture: '/textures/planet2.png'},
        { level: 1, id: 3, radius: 1.1, orbitR: 14, speed:  0.8, angle: 240 * (Math.PI / 180), tilt: 0.2,  color: 0xff6644, emissive: 0x441100, texture: '/textures/planet9.png'},
        { level: 2, id: 4, radius: 1.5, orbitR: 24, speed: 0.45, angle:   0 * (Math.PI / 180), tilt: 0.35, color: 0x44aaff, emissive: 0x001133, texture: '/textures/planet4.png' },
        { level: 2, id: 5, radius: 1.5, orbitR: 24, speed: 0.45, angle: 120 * (Math.PI / 180), tilt: 0.35, color: 0x44aaff, emissive: 0x001133, texture: '/textures/planet8.png' },
        { level: 2, id: 6, radius: 1.5, orbitR: 24, speed: 0.45, angle: 240 * (Math.PI / 180), tilt: 0.35, color: 0x44aaff, emissive: 0x001133, texture: '/textures/planet6.png' },
        { level: 3, id: 7, radius: 1.2, orbitR: 36, speed: 0.25, angle:   0 * (Math.PI / 180), tilt: 0.15, color: 0x88dd55, emissive: 0x112200, texture: '/textures/planet7.png'},
        { level: 3, id: 8, radius: 1.2, orbitR: 36, speed: 0.25, angle: 120 * (Math.PI / 180), tilt: 0.15, color: 0x88dd55, emissive: 0x112200, texture: '/textures/planet3.png'},
        { level: 3, id: 9, radius: 1.2, orbitR: 36, speed: 0.25, angle: 240 * (Math.PI / 180), tilt: 0.15, color: 0x88dd55, emissive: 0x112200, texture: '/textures/planet5.png'},
    ];

    const planets = planetData.map(planet => {
        
        // Orbit path
        const pts = [];
        for (let i = 0; i <= 128; i++) {
            const theta = 2 * Math.PI * (i / 128) ;
            pts.push(new THREE.Vector3(
                Math.cos(theta) * planet.orbitR,
                Math.sin(theta) * planet.tilt * planet.orbitR * 0.18,
                Math.sin(theta) * planet.orbitR
            ));
        }
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const orbitMat = new THREE.LineBasicMaterial({ 
            color: 0x334455, 
            transparent: true, 
            opacity: 0.30 
        });
        scene.add(new THREE.LineLoop(orbitGeo, orbitMat));

        // Each planet
        const planetGeo = new THREE.SphereGeometry(planet.radius, 36, 36);
        const planetMat = new THREE.MeshStandardMaterial({
            map: loader.load(planet.texture),
            roughness: 0.65,
            metalness: 0.05
        });
        const mesh = new THREE.Mesh(planetGeo, planetMat);
        scene.add(mesh);
        
        // Angular separation
        planet.angle += (Math.random() - 0.5) * ( 2 * Math.PI * (90/360));
        
        return {
            mesh, 
            ...planet,
        }
    });

    return {scene, sun, planets}
    
}
