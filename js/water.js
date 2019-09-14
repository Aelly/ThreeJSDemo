var scene, sceneLight, cam, renderer;
var clock;
var waterSurface;
var mirrorCam;

var vertexText, fragmentText;
var renderTarget;

var plankTexture;
var waterNormalTexture;

function init() {
    scene = new THREE.Scene();

    renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerWidth);

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
            // texture_water.wrapS = texture_water.wrapT = THREE.RepeatWrapping;

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
    // scene.add(plank);

    plank.rotation.x = Math.PI / 2;
    plank.position.y = -3;

    var customUniforms = {
        normalSampler: {
            value: waterNormalTexture
        },
        reflectionTexture:{
            value: renderTarget.texture
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
        fragmentShader: fragmentText,
        side: THREE.DoubleSide
    });
    waterSurface = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(waterSurface);
    waterSurface.rotation.x = Math.PI / 2;
    waterSurface.position.y = 0;

    var cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 );
    var cubeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
    cube.position.set(0, 2, -5);
    scene.add( cube );

    cube2 = new THREE.Mesh(cubeGeometry, new THREE.MeshBasicMaterial({color: 0xff00ff}));
    cube2.position.set(0,3,3);
    scene.add(cube2);

    var lightParticuleGeometry = new THREE.SphereGeometry(1, 16, 16);
    var lightParticuleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
    var lightParticuleMesh = new THREE.Mesh(lightParticuleGeometry, lightParticuleMaterial);
    lightParticuleMesh.position.set(sceneLight.position.x, sceneLight.position.y, sceneLight.position.z);
    scene.add(lightParticuleMesh);

    animate();
}

var cameraDirection = new THREE.Vector3(); 
var target = new THREE.Vector3();
function animate() {
    waterSurface.material.uniforms.time.value = clock.getElapsedTime() / 10;

    mirrorCam.position.set(cam.position.x, -cam.position.y, cam.position.z);

    cam.getWorldDirection(cameraDirection);

    target = new THREE.Vector3(cam.position.x, cam.position.y, cam.position.z);
    target.add(cameraDirection).reflect(new THREE.Vector3(0,1,0));
    mirrorCam.lookAt(target);
    
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, mirrorCam);
    renderer.setRenderTarget(null);
    renderer.render(scene, cam);

    requestAnimationFrame(animate);
}

init();