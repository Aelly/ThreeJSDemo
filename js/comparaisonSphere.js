var scene = new THREE.Scene();

// FOV - Aspect ratio (with / height) - Near- Far
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

//  OrbitControls
let controls = new THREE.OrbitControls(camera);
controls.addEventListener('change', renderer);
controls.mouseButtons = { LEFT: THREE.MOUSE.RIGHT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.LEFT };
controls.enablePan = false;
controls.minDistance = 1;
controls.maxDistance = 20;

// Renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var light1 = new THREE.PointLight(0xffffff, 0.5, 100);
light1.position.set(0, 0, 5);
scene.add(light1);

var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);


scene.add(new THREE.AmbientLight(0x222222));

var lightParticuleGeometry = new THREE.SphereGeometry(0.1, 16, 16);
var lightParticuleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
var lightParticuleMesh = new THREE.Mesh(lightParticuleGeometry, lightParticuleMaterial);
lightParticuleMesh.position.set(0, 0, 5);
scene.add(lightParticuleMesh);

//  EnvMap (CubeTexture)
var loader = new THREE.CubeTextureLoader();
loader.setPath('https://raw.githubusercontent.com/Aelly/ThreeJSDemo/master/image/envMap/envMap_Park/');
var textureCube = loader.load([
    'px.jpg', 'nx.jpg', // left - right
    'py.jpg', 'ny.jpg', // top - botton
    'pz.jpg', 'nz.jpg' // 
]);
scene.background = textureCube;

// envMap: textureCube
// Sphere
var sphereGeometry = new THREE.SphereGeometry(0.4, 32, 32);
for (i = 0; i < 6; i++) {
    for (j = 0; j < 6; j++) {
        var material = new THREE.MeshPhongMaterial({ shininess: Math.pow(2, i * 3), reflectivity: j * 0.16, envMap: textureCube, color: 0xffffff });
        var mesh = new THREE.Mesh(sphereGeometry, material);
        scene.add(mesh);
        mesh.position.set(-3 + i, -3 + j, 0);
    }
}

var angle = 0;
var angleRad = 0;
// Render loop
function animate() {
    requestAnimationFrame(animate);

    angle = angle + 1 >= 360 ? 0 : angle + 1;
    angleRad = angle * Math.PI / 180;

    light1.position.x = 3 * Math.sin(angleRad);
    light1.position.z = 3 * Math.cos(angleRad);

    lightParticuleMesh.position.x = 3 * Math.sin(angleRad);
    lightParticuleMesh.position.z = 3 * Math.cos(angleRad);

    renderer.render(scene, camera);
}
animate();