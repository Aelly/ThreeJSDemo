var scene, sceneLight, cam, renderer;
var scene
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

function calculateTangent(geometry) {
    var positionAttributes = geometry.getAttribute('position');
    var uvAttributes = geometry.getAttribute('uv');


    var realVertices = [];
    var realUvs = [];

    for (var i = 0; i < positionAttributes.array.length; i += 3) {
        realVertices.push(new THREE.Vector3(positionAttributes.array[i + 0], positionAttributes.array[i + 1], positionAttributes.array[i + 2]));
    }

    for (var i = 0; i < uvAttributes.array.length; i += 2) {
        realUvs.push(new THREE.Vector2(uvAttributes.array[i], uvAttributes.array[i + 1]));
    }

    var tangents = new Float32Array(positionAttributes.array.length);
    var bitangents = new Float32Array(positionAttributes.array.length);


    var tangArray = [];
    var bitangentArray = [];

    for (var i = 0; i < realVertices.length; i += 3) {
        var v0 = realVertices[i + 0];
        var v1 = realVertices[i + 1];
        var v2 = realVertices[i + 2];

        var uv0 = realUvs[i + 0];
        var uv1 = realUvs[i + 1];
        var uv2 = realUvs[i + 2];


        var deltaPos1 = v1.sub(v0);
        var deltaPos2 = v2.sub(v0);

        var deltaUV1 = uv1.sub(uv0);
        var deltaUV2 = uv2.sub(uv0);

        var r = 1.0 / (deltaUV1.x * deltaUV2.y - deltaUV1.y * deltaUV2.x);
        var tangent = deltaPos1.multiplyScalar(deltaUV2.y).sub(deltaPos2.multiplyScalar(deltaUV1.y)).multiplyScalar(r); //p1 * uv2.y - p2 * uv1.y
        var bitangent = deltaPos2.multiplyScalar(deltaUV2.x).sub(deltaPos1.multiplyScalar(deltaUV2.x)).multiplyScalar(r);

        tangArray.push(tangent.x);
        tangArray.push(tangent.y);
        tangArray.push(tangent.z);

        tangArray.push(tangent.x);
        tangArray.push(tangent.y);
        tangArray.push(tangent.z);

        tangArray.push(tangent.x);
        tangArray.push(tangent.y);
        tangArray.push(tangent.z);

        bitangentArray.push(bitangent.x);
        bitangentArray.push(bitangent.y);
        bitangentArray.push(bitangent.z);

        bitangentArray.push(bitangent.x);
        bitangentArray.push(bitangent.y);
        bitangentArray.push(bitangent.z);

        bitangentArray.push(bitangent.x);
        bitangentArray.push(bitangent.y);
        bitangentArray.push(bitangent.z);
    }

    for (var i = 0; i < bitangentArray.length; i++) {
        tangents[i] = tangArray[i];
        bitangents[i] = bitangentArray[i];
    }


    geometry.addAttribute('tangent', new THREE.BufferAttribute(tangents, 3));
    geometry.addAttribute('bitangent', new THREE.BufferAttribute(bitangents, 3));
}

function initWater() {
    let geometry = new THREE.PlaneBufferGeometry(30, 30, 32);
    // calculateTangent(geometry);

    var customUniforms = {
        normalSampler: {
            value: waterNormalTexture
        },
        reflectionTexture: {
            value: renderTarget.texture
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
    let geometry = new THREE.PlaneBufferGeometry(30, 30, 32);
    let material = new THREE.MeshBasicMaterial({
        map: plankTexture,
        side: THREE.DoubleSide
    });

    var plank = new THREE.Mesh(geometry, material);
    // scene.add(plank);

    plank.rotation.x = Math.PI / 2;
    plank.position.y = -3;

    initWater();

    var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    var cubeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00
    });
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 2, -5);
    scene.add(cube);

    cube2 = new THREE.Mesh(cubeGeometry, new THREE.MeshBasicMaterial({
        color: 0xff00ff
    }));
    cube2.position.set(0, 3, 3);
    scene.add(cube2);

    var lightParticuleGeometry = new THREE.SphereGeometry(1, 16, 16);
    var lightParticuleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff
    })
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
    target.add(cameraDirection).reflect(new THREE.Vector3(0, 1, 0));
    mirrorCam.lookAt(target);

    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, mirrorCam);
    renderer.setRenderTarget(null);
    renderer.render(scene, cam);

    requestAnimationFrame(animate);
}

init();