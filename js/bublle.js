var scene = new THREE.Scene();

// FOV - Aspect ratio (with / height) - Near- Far
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Background
var texture = new THREE.TextureLoader().load('../image/town-hdr.jpg');
scene.background = texture;

// Buble
var sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
var material = new THREE.MeshStandardMaterial();
var mesh = new THREE.Mesh(sphereGeometry, material);
scene.add(mesh);

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();