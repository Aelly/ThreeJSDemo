var scene = new THREE.Scene();
scene.background = new THREE.Color(0xb19180)

// FOV - Aspect ratio (with / height) - Near- Far
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Mesh
var cube = new THREE.BoxGeometry(1, 1, 1);
var sphere = new THREE.SphereGeometry(2, 32, 32);
var torus = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
var material = new THREE.MeshStandardMaterial({
    color: 0x58cad9
});
var mesh = new THREE.Mesh(torus, material);
scene.add(mesh);
// Lights
var light1 = new THREE.PointLight(0xffffff, 1, 100);
light1.position.set(5, 0, 0);
scene.add(light1);
var light2 = new THREE.PointLight(0xffffff, 1, 100);
light2.position.set(-5, 0, 0);
scene.add(light2);
var ambiantLight = new THREE.AmbientLight(0xffffff, 1);

var angle1 = 0;
var angle2 = 0;
var angleRad1 = 0;
var angleRad2 = 0;

var geometryEnum = {
    Cube: "Cube",
    Sphere: "Sphere",
    Torus: "Torus",
};

var Controller = function() {
    this.ambientLightBool = false;
    this.ambientLightIntensity = 1;
    this.ambientLightColor = "#ffffff";

    this.lightSpeed1 = 1;
    this.lightSpeed2 = 1;

    this.meshColor = "#58cad9";
    this.meshEmissiveColor = "#000000";
    this.meshEmisisveIntensity = 1;
    this.roughness = 0.5;
    this.metalness = 0.5;

    this.geometry = geometryEnum.Torus;
};
var controller = new Controller();

// Render loop
function animate() {
    requestAnimationFrame(animate);

    angle1 = angle1 + controller.lightSpeed1 >= 360 ? 0 : angle1 + controller.lightSpeed1;
    angle2 = angle2 + controller.lightSpeed2 >= 360 ? 0 : angle2 + controller.lightSpeed2;


    angleRad1 = angle1 * Math.PI / 180;
    angleRad2 = angle2 * Math.PI / 180;

    // Animation
    mesh.rotation.y += 0.001;

    light1.position.x = 10 * Math.sin(angleRad1);
    light1.position.z = 10 * Math.cos(angleRad1);

    light2.position.x = 10 * Math.sin(2 * Math.PI - angleRad2);
    light2.position.z = 10 * Math.cos(2 * Math.PI - angleRad2);

    renderer.render(scene, camera);
}
animate();


// Controller UI and Handle
var gui = new dat.GUI();

gui.add(controller, 'geometry', geometryEnum).onChange(function(newValue) {
    switch (newValue) {
        case geometryEnum.Cube:
            mesh.geometry = cube;
            break;
        case geometryEnum.Sphere:
            mesh.geometry = sphere;
            break;
        case geometryEnum.Torus:
            mesh.geometry = torus;
            break;
    }
});

var sceneFolder = gui.addFolder("Scene");
sceneFolder.open();
sceneFolder.add(controller, 'ambientLightBool').onChange(function(newValue) {
    if (newValue)
        scene.add(ambiantLight);
    else
        scene.remove(ambiantLight);
});
sceneFolder.add(controller, 'ambientLightIntensity', 0, 6).onChange(function(newValue) {
    ambiantLight.intensity = newValue;
});
sceneFolder.addColor(controller, 'ambientLightColor').onChange(function(colorValue) {
    colorValue.replace('#', '0x');
    var colorObject = new THREE.Color(colorValue);
    ambiantLight.color = colorObject;
});
sceneFolder.add(controller, 'lightSpeed1', 0, 5);
sceneFolder.add(controller, 'lightSpeed2', 0, 5);


var materialFolder = gui.addFolder("Material");
materialFolder.open();
materialFolder.addColor(controller, 'meshColor').onChange(function(colorValue) {
    colorValue.replace('#', '0x');
    var colorObject = new THREE.Color(colorValue);
    mesh.material.color = colorObject;
});
materialFolder.addColor(controller, 'meshEmissiveColor').onChange(function(colorValue) {
    colorValue.replace('#', '0x');
    var colorObject = new THREE.Color(colorValue);
    mesh.material.emissive = colorObject;
});
materialFolder.add(controller, 'meshEmisisveIntensity', 0, 1).onChange(function(newValue) {
    mesh.material.emissiveIntensity = newValue;
});
materialFolder.add(controller, 'roughness', 0, 1).onChange(function(newValue) {
    mesh.material.roughness = newValue;
});
materialFolder.add(controller, 'metalness', 0, 1).onChange(function(newValue) {
    mesh.material.metalness = newValue;
});