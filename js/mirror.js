var scene;
var camera;
var cameraMirror;
var renderer;
var renderTarget;

var vertexText, fragmentText;

var textureCow;
var texturePanda1, texturePanda2, texturePanda3, texturePanda4;

var sphere;
var ball;


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
    camera.position.set(0,10,10);

    cameraMirror = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.RIGHT,
        MIDDLE: THREE.MOUSE.MIDDLE,
        RIGHT: THREE.MOUSE.LEFT
    };
    controls.target0.set(0,4,0);
    controls.reset();
    controls.enablePan = false;

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
        loader.load("../image/texture/panda1.jpg", function(texture){
            texturePanda1 = texture;
            loader.load("../image/texture/panda2.jpg", function(texture){
                texturePanda2 = texture;
                loader.load("../image/texture/panda3.jpg", function(texture){
                    texturePanda3 = texture;
                    loader.load("../image/texture/panda4.jpg", function(texture){
                        texturePanda4 = texture;
                        initObjects();
                    });
                });
            });
        });
    });
}


function initCube(){
    let planeGeometry = new THREE.PlaneBufferGeometry(10, 10);
    let plane1 = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial( {map: texturePanda1, side: THREE.BackSide} ));
    plane1.position.z = 5;
    plane1.position.y = 5;
    scene.add(plane1);
    let plane2 = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial( {map: texturePanda2, side: THREE.BackSide} ));
    plane2.position.x = 5;
    plane2.position.y = 5;
    plane2.rotation.y = Math.PI / 2;
    scene.add(plane2);
    let plane3 = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial( {map: texturePanda3, side: THREE.BackSide} ));
    plane3.position.z = -5;
    plane3.position.y = 5;
    plane3.rotation.y = Math.PI;
    scene.add(plane3);
    let plane4 = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial( {map: texturePanda4, side: THREE.BackSide} ));
    plane4.position.x = -5;
    plane4.position.y = 5;
    plane4.rotation.y = -(Math.PI / 2);
    scene.add(plane4);
    let plane5 = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial( {color: 0xaec6cf, side: THREE.BackSide} ));
    plane5.rotation.x = -(Math.PI / 2);
    plane5.position.y = 5;
    plane5.position.y = 10;
    scene.add(plane5);
    let plane6 = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial( {color: 0x77dd77, side: THREE.BackSide} ));
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

    var sphereGeometry = new THREE.SphereBufferGeometry( 2, 32, 32 );
    var sphereMaterial = new THREE.MeshBasicMaterial( {map: textureCow} );
    sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
    sphere.position.y = 2;
    scene.add( sphere );

    var ballGeometry = new THREE.SphereBufferGeometry(0.5, 8,8);
    var ballMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);
    ball.position.z = 5;
    ball.position.y = 1;

    animate();
}

var cameraDirection = new THREE.Vector3(); 
var target = new THREE.Vector3();
var ballRotation = 0;
function animate() {
    sphere.rotation.y += 0.01;
    ballRotation -= 0.01;

    ball.position.y = Math.cos(ballRotation*2) + 1 * 2.5;
    ball.position.x = 3 * Math.sin(ballRotation);
    ball.position.z = 3 * Math.cos(ballRotation);

    cameraMirror.position.set(camera.position.x, -camera.position.y, camera.position.z);

    camera.getWorldDirection(cameraDirection);

    target = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
    target.add(cameraDirection).reflect(new THREE.Vector3(0,1,0));
    cameraMirror.lookAt(target);
    
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, cameraMirror);
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
};

init();