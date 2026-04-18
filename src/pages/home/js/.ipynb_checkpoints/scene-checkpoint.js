import * as THREE from "three";

export function createScene() {

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
        color: 0xe8ffff,
        emissive: 0x88ffee,
        emissiveIntensity: 3.2,
        roughness: 0.0,
        metalness: 0.0
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    // Planets
    const planetLevels = [
        { level: 1, radius: 1.1, orbitR: 14, speed: 0.8,  tilt: 0.2,  color: 0xff6644, emissive: 0x441100 },
        { level: 2, radius: 1.5, orbitR: 24, speed: 0.45, tilt: 0.35, color: 0x44aaff, emissive: 0x001133 },
        { level: 3, radius: 1.8, orbitR: 36, speed: 0.25, tilt: 0.15, color: 0x88dd55, emissive: 0x112200 },
    ];

    const planets = planetLevels.flatMap(level => {
        
        // Orbit path
        const pts = [];
        for (let i = 0; i <= 128; i++) {
            const theta = 2 * Math.PI * (i / 128) ;
            pts.push(new THREE.Vector3(
                Math.cos(theta) * level.orbitR,
                Math.sin(theta) * level.tilt * level.orbitR * 0.18,
                Math.sin(theta) * level.orbitR
            ));
        }
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const orbitMat = new THREE.LineBasicMaterial({ 
            color: 0x334455, 
            transparent: true, 
            opacity: 0.30 
        });
        scene.add(new THREE.LineLoop(orbitGeo, orbitMat));

        return [0, 1, 2].map(planet => {

            // Each planet
            const planetGeo = new THREE.SphereGeometry(level.radius, 36, 36);
            const planetMat = new THREE.MeshStandardMaterial({
                color: level.color,
                emissive: level.emissive,
                emissiveIntensity: 1.0,
                roughness: 0.65,
                metalness: 0.05
            });
            const mesh = new THREE.Mesh(planetGeo, planetMat);
            scene.add(mesh);
            
            // Angular separation
            const minSeparation = 2 * Math.PI * (120 / 360);
            const maxSeparation = 2 * Math.PI * (240 / 360);
            const p = Math.random()
            let angle = planet * minSeparation + p * (maxSeparation - minSeparation)
            
            return {
                id: `${level.level}-${planet}`,
                mesh: mesh, 
                angle: angle,
                ...level,
            }
            
        });
    });


    return {scene, sun, planets}
    
}

