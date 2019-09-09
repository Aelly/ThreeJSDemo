var scene, sceneLight, portailLight, cam, renderer, clock, portailParticules = [],
    smokeParticules = [];

function init() {
    scene = new THREE.Scene();

    sceneLight = new THREE.DirectionalLight(0xffffff, 0.5);
    sceneLight.position.set(0, 0, 1);
    scene.add(sceneLight);

    portailLight = new THREE.PointLight(0xFF66E5, 30, 600, 1.7);
    portailLight.position.set(0, 0, 250);
    scene.add(portailLight);

    cam = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 10000);
    cam.position.z = 1000;
    scene.add(cam);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    particleSetup();
}

function particleSetup() {
    let loader = new THREE.TextureLoader();
    loader.load("../image/texture/smoke.png", function (texture) {
        portailGeo = new THREE.PlaneBufferGeometry(350, 350);
        portailMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true
        });
        smokeGeo = new THREE.PlaneBufferGeometry(1000, 1000);
        smokeMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true
        });

        // Parterne sphérique
        for (let p = 880; p > 250; p--) {
            let particle = new THREE.Mesh(portailGeo, portailMaterial);
            // https://en.wikipedia.org/wiki/Conical_spiral
            particle.position.set(
                0.5 * p * Math.cos((4 * p * Math.PI) / 180),
                0.5 * p * Math.sin((4 * p * Math.PI) / 180),
                0.1 * p
            );
            particle.rotation.z = Math.random() * 360;
            portailParticules.push(particle);
            scene.add(particle);
        }
        // Background
        // Parterne sphérique
        for (let p = 0; p < 40; p++) {
            let particle = new THREE.Mesh(smokeGeo, smokeMaterial);
            // https://en.wikipedia.org/wiki/Conical_spiral
            particle.position.set(
                Math.random() * 1000 - 500,
                Math.random() * 400 - 200,
                25
            );
            particle.rotation.z = Math.random() * 360;
            particle.material.opacity = 0.4;
            smokeParticules.push(particle);
            scene.add(particle);
        }

        clock = new THREE.Clock();
        animate();
    });
}

function animate() {
    let delta = clock.getDelta();

    portailParticules.forEach(p => {
        p.rotation.z -= delta * 1.5;
    });
    smokeParticules.forEach(p => {
        p.rotation.z -= delta * 1.5;
    });
    if (Math.random() > 0.9) {
        portailLight.power = 350 + Math.random() * 500;
    }

    renderer.render(scene, cam);
    requestAnimationFrame(animate);
}

init();