var scene, sceneLight, cam, renderer;
var clock;
var waterSurface;

var vertexText, fragmentText;

var plankTexture;
var waterNormalTexture;

function init() {
    scene = new THREE.Scene();

    sceneLight = new THREE.DirectionalLight(0xffffff, 0.5);
    sceneLight.position.set(0, 0, 1);
    scene.add(sceneLight);

    cam = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 10000);
    cam.position.z = 5;
    cam.position.y = 10;
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
    // controls.enablePan = false;
    controls.minDistance = 0;
    controls.maxDistance = 10;

    clock = new THREE.Clock();

    loadShader();
}

function loadShader() {
    ShaderLoader("../Shader/vertexShader.glsl", "../Shader/fragmentShader.glsl", function (vertex, fragment) {
        vertexText = vertex;
        fragmentText = fragment;
        loadTexture();
    });
}

function loadTexture() {
    let loader = new THREE.TextureLoader();
    loader.load("../image/texture/plank.jpg", function (texture_plank) {
        plankTexture = texture_plank;
        loader.load("../image/map/water_normal.png", function (texture_water) {
            texture_water.wrapS = texture_water.wrapT = THREE.RepeatWrapping;
            texture_water.repeat.set( 3, 3 );

            waterNormalTexture = texture_water;
            initObject();
        });
    });
}

function initObject() {
    let geometry = new THREE.PlaneBufferGeometry(30, 30, 32);
    let material = new THREE.MeshBasicMaterial({
        map: plankTexture,
        side: THREE.DoubleSide
    });
    var plank = new THREE.Mesh(geometry, material);
    scene.add(plank);

    plank.rotation.x = -90;
    plank.position.y = -3;

    var customUniforms = {
        normalSampler: {
            value: waterNormalTexture
        },
        sunDirection: {
            type: 'vec3',
            value: sceneLight.position
        },
        eyePosition: {
            type: 'vec3',
            value: cam.position
        },
        time: {
            value: 1
        }
    };

    let shaderMaterial = new THREE.ShaderMaterial({
        uniforms: customUniforms,
        vertexShader: vertexText,
        fragmentShader: fragmentText
    });
    waterSurface = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(waterSurface);
    waterSurface.rotation.x = -90;
    waterSurface.position.y = -2.8;

    var vertexDisplacement = new Float32Array(geometry.attributes.position.count);
    for (var i = 0; i < vertexDisplacement.length; i += 1) {
        vertexDisplacement[i] = Math.sin(i);
    }
    geometry.addAttribute('vertexDisplacement', new THREE.BufferAttribute(vertexDisplacement, 1));

    animate();
}

function animate() {
    waterSurface.material.uniforms.time.value = clock.getElapsedTime() / 10;

    renderer.render(scene, cam);

    requestAnimationFrame(animate);
}

init();