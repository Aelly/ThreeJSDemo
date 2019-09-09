var scene, sceneLight, cam, renderer;
var waterSurface;

function init() {
    scene = new THREE.Scene();

    sceneLight = new THREE.DirectionalLight(0xffffff, 0.5);
    sceneLight.position.set(0, 0, 1);
    scene.add(sceneLight);

    cam = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 10000);
    cam.position.z = 5;
    scene.add(cam);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let controls = new THREE.OrbitControls(cam);
    controls.addEventListener('change', renderer);
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.RIGHT,
        MIDDLE: THREE.MOUSE.MIDDLE,
        RIGHT: THREE.MOUSE.LEFT
    };
    controls.enablePan = false;
    controls.minDistance = 0;
    controls.maxDistance = 10;

    initObject();
}

function initObject() {
    let loader = new THREE.TextureLoader();
    loader.load("../image/texture/plank.jpg", function (texture) {
        let geometry = new THREE.PlaneBufferGeometry(5, 5, 32);
        let material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });
        var plank = new THREE.Mesh(geometry, material);
        scene.add(plank);

        plank.rotation.x = -90;
        plank.position.y = -3;

        var customUniforms = {
            delta: {value: 0}
        };
        let shaderMaterial = new THREE.ShaderMaterial({
            uniforms: customUniforms,
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent
        });
        waterSurface = new THREE.Mesh(geometry, shaderMaterial);
        scene.add(waterSurface);
        waterSurface.rotation.x = -90;
        waterSurface.position.y = -2.8;

        var vertexDisplacement = new Float32Array(geometry.attributes.position.count);
        for(var i = 0; i < vertexDisplacement.length; i += 1){
            vertexDisplacement[i] = Math.sin(i);
        }
        geometry.addAttribute('vertexDisplacement', new THREE.BufferAttribute(vertexDisplacement, 1));

        animate();
    });
}

var delta = 0;
function animate() {
    delta += 0.1;
    waterSurface.material.uniforms.delta.value = 0.5 + Math.sin(delta) * 0.5;

    renderer.render(scene, cam);

    requestAnimationFrame(animate);
}

init();