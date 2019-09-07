let scene, camera, renderer;
let mesh;
let ambiantLight;

function init() {
    //  Scene - Camera - Renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 45, 30000);
    camera.position.set(-900, -200, -900);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //  OrbitControls
    let controls = new THREE.OrbitControls(camera);
    controls.addEventListener('change', renderer);
    controls.mouseButtons = { LEFT: THREE.MOUSE.RIGHT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.LEFT };
    controls.enablePan = false;
    controls.minDistance = 300;
    controls.maxDistance = 1500;

    //  EnvMap (CubeTexture)
    var loader = new THREE.CubeTextureLoader();
    loader.setPath('https://raw.githubusercontent.com/Aelly/ThreeJSDemo/master/image/envMap/');
    var textureCube = loader.load([
        'heather_ft.jpg', 'heather_bk.jpg',
        'heather_up.jpg', 'heather_dn.jpg',
        'heather_rt.jpg', 'heather_lf.jpg'
    ]);

    scene.background = textureCube;


    // Mesh
    var sphere = new THREE.SphereGeometry(200, 32, 32);
    var material = new THREE.MeshStandardMaterial({
        color: 0x58cad9,
        envMap: textureCube
    });
    mesh = new THREE.Mesh(sphere, material);
    scene.add(mesh);

    //  Light
    ambiantLight = new THREE.AmbientLight(0xffffff, 1);

    animate();
}

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
init();

//  GUI Controler
var Controller = function() {
    this.ambiantLight = false;
    this.ambientLightIntensity = 1;
    this.meshColor = '#58cad9';
    this.roughness = 0.5;
    this.metalness = 0.5;
};
var controller = new Controller();

var gui = new dat.GUI();

gui.add(controller, 'ambiantLight').onChange(function(newValue) {
    if (newValue)
        scene.add(ambiantLight);
    else
        scene.remove(ambiantLight);
});
gui.add(controller, 'ambientLightIntensity', 0, 6).onChange(function(newValue) {
    ambiantLight.intensity = newValue;
});
gui.addColor(controller, 'meshColor').onChange(function(colorValue) {
    colorValue.replace('#', '0x');
    var colorObject = new THREE.Color(colorValue);
    mesh.material.color = colorObject;
});
gui.add(controller, 'roughness', 0, 1).onChange(function(newValue) {
    mesh.material.roughness = newValue;
});
gui.add(controller, 'metalness', 0, 1).onChange(function(newValue) {
    mesh.material.metalness = newValue;
});