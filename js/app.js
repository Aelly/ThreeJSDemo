var scene = new THREE.Scene();

// FOV - Aspect ratio (with / height) - Near- Far
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

// Renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Sphere
var geometry = new THREE.SphereGeometry(3, 32, 32);
var material = new THREE.MeshStandardMaterial({
    color: 0x58cad9
});
var sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);
// Lights
var light1 = new THREE.PointLight(0xffffff, 1, 100);
light1.position.set(5, 0, 0);
scene.add(light1);
var light2 = new THREE.PointLight(0xffffff, 1, 100);
light2.position.set(-5, 0, 0);
scene.add(light2);

var angle = 0;
var angleRad = 0;
// Render loop
function animate() {
    requestAnimationFrame(animate);
    angle = angle + 1 >= 360 ? 0 : angle + 1;
    angleRad = angle * Math.PI / 180;

    // Animation
    sphere.rotation.y += 0.001;

    light1.position.x = 10 * Math.sin(angleRad);
    light1.position.z = 10 * Math.cos(angleRad);

    light2.position.x = 10 * Math.sin(2 * Math.PI - angleRad);
    light2.position.z = 10 * Math.cos(2 * Math.PI - angleRad);

    renderer.render(scene, camera);
}
animate();



// Controller
var FizzyColor = function() {
    this.color = "#58cad9";
};

var gui = new dat.GUI();
var colorControl = new FizzyColor();

var folder1 = gui.addFolder("Material");
folder1.open();
var colorControl = folder1.addColor(colorControl, 'color');
colorControl.onChange(function(colorValue) {
    colorValue.replace('#', '0x');
    var colorObject = new THREE.Color(colorValue);
    sphere.material.color = colorObject;
});