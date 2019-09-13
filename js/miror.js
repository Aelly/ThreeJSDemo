var scene;
var camera;
var cameraMirror;
var renderer;
var renderTarget;

var vertexText, fragmentText;

var textureCow;

var sphere;

const mirrorHeight = -4.99;

window.addEventListener('resize', onResize, false);

var w, h;

function onResize() {

    w = window.innerWidth;
    h = window.innerHeight;

    renderTarget.setSize(w, h);
    renderer.setSize(w,h);
};

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x3f3f3f );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat } );
    renderTarget.texture.generateMipmaps = false;

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0,10,15);

    cameraMirror = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.RIGHT,
        MIDDLE: THREE.MOUSE.MIDDLE,
        RIGHT: THREE.MOUSE.LEFT
    };
    // controls.enablePan = false;

    loadShader();
}

function loadShader() {
    ShaderLoader("../Shader/mirror_vertex.glsl", "../Shader/mirror_fragment.glsl", function (vertex, fragment) {
        vertexText = vertex;
        fragmentText = fragment;
        loadTexture();
    });
}

function loadTexture(){
    let loader = new THREE.TextureLoader();
    loader.load("../image/texture/cow.jpg", function (texture) {
        textureCow = texture;
        initObjects();
    });
}


function initCube(){
    let planeGeometry = new THREE.PlaneBufferGeometry(10, 10);
    let plane1 = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial( {color: 0x52489c, side: THREE.BackSide} ));
    plane1.position.z = 5;
    plane1.position.y = 5;
    scene.add(plane1);
    let plane2 = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial( {color: 0x4062bb, side: THREE.BackSide} ));
    plane2.position.x = 5;
    plane2.position.y = 5;
    plane2.rotation.y = Math.PI / 2;
    scene.add(plane2);
    let plane3 = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial( {color: 0x59c3c3, side: THREE.BackSide} ));
    plane3.position.z = -5;
    plane3.position.y = 5;
    plane3.rotation.y = Math.PI;
    scene.add(plane3);
    let plane4 = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial( {color: 0xebebeb, side: THREE.BackSide} ));
    plane4.position.x = -5;
    plane4.position.y = 5;
    plane4.rotation.y = -(Math.PI / 2);
    scene.add(plane4);
    let plane5 = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial( {color: 0xf45b69, side: THREE.BackSide} ));
    plane5.rotation.x = -(Math.PI / 2);
    plane5.position.y = 5;
    plane5.position.y = 10;
    scene.add(plane5);
    let plane6 = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial( {color: 0xf036a5, side: THREE.BackSide} ));
    plane6.rotation.x = Math.PI / 2;
    plane6.position.y = -0.01;
    scene.add(plane6);
}

function initObjects(){
    initCube();

    var circleGeometry = new THREE.CircleBufferGeometry( 5, 32 );

    var customUniforms = {
        reflectionTexture: {
            value: renderTarget.texture
        }
    };
    
    let shaderMaterial = new THREE.ShaderMaterial({
        uniforms: customUniforms,
        vertexShader: vertexText,
        fragmentShader: fragmentText
    });
    var circle = new THREE.Mesh( circleGeometry, shaderMaterial );
    circle.rotation.x = -(Math.PI / 2);
    circle.position.y = 0;
    scene.add( circle );

    var geometry = new THREE.SphereBufferGeometry( 2, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {map: textureCow} );
    sphere = new THREE.Mesh( geometry, material );
    sphere.position.y = 2;
    scene.add( sphere );

    animate();
}

var cameraDirection = new THREE.Vector3(); 
var target = new THREE.Vector3();
function animate() {
    sphere.rotation.y += 0.01;

    camera.getWorldDirection(cameraDirection);

    target = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
    target.add(cameraDirection).reflect(new THREE.Vector3(0,1,0));
    cameraMirror.lookAt(target);

    cameraMirror.position.set(camera.position.x, -camera.position.y, camera.position.z);
    
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, cameraMirror);
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
};

init();