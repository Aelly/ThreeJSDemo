var scene, sceneLight, cam, renderer;
var clock;
var waterSurface;
var mirrorCam;

var vertexText, fragmentText;
var renderTargetReflection;
var renderTargetRefraction;

var floorTexture;
var waterNormalTexture;
var waterDistortionTexture;

var cameraDirection = new THREE.Vector3();
var target = new THREE.Vector3();

// Tableau des objets devant être réfléchi et réfracté
var objectToReflect = [];
var objectToRefract = [];

// Listener pour resize la fenetre de rendu
window.addEventListener('resize', onResize, false);
var w, h;
function onResize() {

    w = window.innerWidth;
    h = window.innerHeight;

    renderTargetReflection.setSize(w, h);
    renderTargetRefraction.setSize(w, h);
    renderer.setSize(w,h);
};

function init() {
    scene = new THREE.Scene();

    renderTargetReflection = new THREE.WebGLRenderTarget(window.innerWidth, window.innerWidth);
    renderTargetRefraction = new THREE.WebGLRenderTarget(window.innerWidth, window.innerWidth);

    sceneLight = new THREE.DirectionalLight(0xffffff, 0.5);
    sceneLight.position.set(0, 8, -10);
    scene.add(sceneLight);

    var ambiantLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambiantLight);

    cam = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 10000);
    cam.position.z = 5;
    cam.position.y = 10;
    scene.add(cam);

    mirrorCam = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 10000);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let controls = new THREE.OrbitControls(cam, renderer.domElement);
    controls.addEventListener('change', renderer);
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.RIGHT,
        MIDDLE: THREE.MOUSE.MIDDLE,
        RIGHT: THREE.MOUSE.LEFT
    };
    controls.minDistance = 0;
    controls.maxDistance = 20;

    clock = new THREE.Clock();

    var loader = new THREE.CubeTextureLoader();
    loader.setPath('https://raw.githubusercontent.com/Aelly/ThreeJSDemo/master/image/envMap/envMap_Heather/');
    var textureCube = loader.load([
        'heather_ft.jpg', 'heather_bk.jpg',
        'heather_up.jpg', 'heather_dn.jpg',
        'heather_rt.jpg', 'heather_lf.jpg'
    ]);

    scene.background = textureCube;

    loadShader();
}

function loadShader() {
    ShaderLoader("../Shader/water_vertex.glsl", "../Shader/water_fragment.glsl", function (vertex, fragment) {
        vertexText = vertex;
        fragmentText = fragment;
        loadTexture();
    });
}

function loadTexture() {
    let loader = new THREE.TextureLoader();
    loader.load("../image/texture/ocean-floor.jpg", function (floor_Texture) {
        floorTexture = floor_Texture;
        loader.load("../image/map/water_normal.png", function (texture_water) {
            waterNormalTexture = texture_water;
            waterNormalTexture.wrapS = waterNormalTexture.wrapT = THREE.RepeatWrapping
            loader.load("../image/map/water_dudv.png", function(texture_distortion){
                waterDistortionTexture = texture_distortion;
                initObject();
            });

        });
    });
}

function initWater() {
    let geometry = new THREE.PlaneBufferGeometry(30, 30, 32);

    var customUniforms = {
        normalSampler: {
            value: waterNormalTexture
        },
        reflectionTexture: {
            value: renderTargetReflection.texture
        },
        refractionTexture: {
            value: renderTargetRefraction.texture
        },
        dudvTexture : {
            value: waterDistortionTexture
        },
        lightPosition: {
            type: 'vec3',
            value: sceneLight.position
        },
        eyePosition: {
            type: 'vec3',
            value: cam.position
        },
        time: {
            value: 1
        },
        waterDistortionStrength: {
            value: 0.015
        },
        waterReflectivity: {
            value: 0.2
        }
    };

    let shaderMaterial = new THREE.ShaderMaterial({
        uniforms: customUniforms,
        vertexShader: vertexText,
        fragmentShader: fragmentText,
        side: THREE.DoubleSide,
        vertexTangents : true
    });
    waterSurface = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(waterSurface);
    waterSurface.rotation.x = Math.PI / 2;
    waterSurface.position.y = 0;
}

function initObject() {
    // Floor
    let geometry = new THREE.PlaneBufferGeometry(30, 30, 32);
    let material = new THREE.MeshBasicMaterial({
        map: floorTexture,
        side: THREE.DoubleSide
    });

    var floor = new THREE.Mesh(geometry, material);
    scene.add(floor);
    objectToRefract.push(floor);

    floor.rotation.x = Math.PI / 2;
    floor.position.y = -3;

    // Water
    initWater();

    // Cubes
    var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    var cubeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00
    });
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 2, -5);
    scene.add(cube);
    objectToReflect.push(cube);

    cube2 = new THREE.Mesh(cubeGeometry, new THREE.MeshBasicMaterial({
        color: 0xff00ff
    }));
    cube2.position.set(0, 3, 3);
    scene.add(cube2);
    objectToReflect.push(cube2);

    // Light particule
    var lightParticuleGeometry = new THREE.SphereGeometry(1, 16, 16);
    var lightParticuleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff
    })
    var lightParticuleMesh = new THREE.Mesh(lightParticuleGeometry, lightParticuleMaterial);
    lightParticuleMesh.position.set(sceneLight.position.x, sceneLight.position.y, sceneLight.position.z);
    scene.add(lightParticuleMesh);
    objectToReflect.push(lightParticuleMesh);

    setUpUI();

    clock = new THREE.Clock();

    animate();
}

function setUpUI(){
    var Controller = function(){
        this.waterDistortion = 0.015;
        this.waterReflectivity = 0.2;
    }
    var controller = new Controller();

    var gui = new dat.GUI();
    
    gui.add(controller, "waterDistortion", 0, 0.1).onChange(function (newValue){
        waterSurface.material.uniforms.waterDistortionStrength.value = newValue;
    });
    gui.add(controller, "waterReflectivity", 0, 1).onChange(function (newValue){
        waterSurface.material.uniforms.waterReflectivity.value = newValue;
    });
    
}

function animate() {
    waterSurface.material.uniforms.time.value = clock.getElapsedTime() / 20;

    mirrorCam.position.set(cam.position.x, -cam.position.y, cam.position.z);

    cam.getWorldDirection(cameraDirection);

    target = new THREE.Vector3(cam.position.x, cam.position.y, cam.position.z);
    target.add(cameraDirection).reflect(new THREE.Vector3(0, 1, 0));
    mirrorCam.lookAt(target);
    
    // Render Reflection (disable refraction)
    objectToRefract.forEach(element => {
        scene.remove(element);
    });
    renderer.setRenderTarget(renderTargetReflection);
    renderer.render(scene, mirrorCam);
    // Render Refraction (disable reflection, add refraction)
    objectToRefract.forEach(element => {
        scene.add(element);
    });
    objectToReflect.forEach(element => {
        scene.remove(element);
    });
    renderer.setRenderTarget(renderTargetRefraction);
    renderer.render(scene, cam);
    // Render whole scene (add reflection back)
    objectToReflect.forEach(element => {
        scene.add(element);
    });
    renderer.setRenderTarget(null);
    renderer.render(scene, cam);

    requestAnimationFrame(animate);
}

init();