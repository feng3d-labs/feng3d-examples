


var clock = new Clock(true);

var container: HTMLDivElement;
var camera: feng3d.Camera, scene: feng3d.Scene3D, raycaster, renderer;

var room;
var isMouseDown = false;

var INTERSECTED;
var crosshair: feng3d.GameObject;

init();
animate();

function init()
{

    container = document.createElement('div');
    document.body.appendChild(container);

    var info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = '<a href="http://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - interactive cubes';
    container.appendChild(info);

    var engine = new feng3d.Engine();
    scene = engine.scene;
    scene.background.fromUnit(0x505050);

    camera = engine.camera;
    var lens = camera.lens = new feng3d.PerspectiveLens(70);
    lens.aspectRatio = window.innerWidth / window.innerHeight;
    lens.near = 0.1;
    lens.far = 10;

    crosshair = feng3d.GameObject.create("crosshair");
    var model = crosshair.addComponent(feng3d.MeshRenderer);
    model.geometry = new feng3d.TorusGeometry(0.01, 0.002, 32, 8, false);
    var material = model.material = new feng3d.StandardMaterial();
    material.enableBlend = true;
    material.diffuseMethod.color.a = 0.5;
    engine.camera.gameObject.addChild(crosshair);

    return;

    room = new THREE.Mesh(
        new THREE.BoxBufferGeometry(6, 6, 6, 8, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x404040, wireframe: true })
    );
    room.position.y = 3;
    scene.add(room);

    scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    var geometry = new THREE.BoxBufferGeometry(0.15, 0.15, 0.15);

    for (var i = 0; i < 200; i++)
    {

        var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));

        object.position.x = Math.random() * 4 - 2;
        object.position.y = Math.random() * 4 - 2;
        object.position.z = Math.random() * 4 - 2;

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        object.scale.x = Math.random() + 0.5;
        object.scale.y = Math.random() + 0.5;
        object.scale.z = Math.random() + 0.5;

        object.userData.velocity = new THREE.Vector3();
        object.userData.velocity.x = Math.random() * 0.01 - 0.005;
        object.userData.velocity.y = Math.random() * 0.01 - 0.005;
        object.userData.velocity.z = Math.random() * 0.01 - 0.005;

        room.add(object);

    }

    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.vr.enabled = true;
    container.appendChild(renderer.domElement);

    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    renderer.domElement.addEventListener('mouseup', onMouseUp, false);
    renderer.domElement.addEventListener('touchstart', onMouseDown, false);
    renderer.domElement.addEventListener('touchend', onMouseUp, false);

    window.addEventListener('resize', onWindowResize, false);

    //

    window.addEventListener('vrdisplaypointerrestricted', onPointerRestricted, false);
    window.addEventListener('vrdisplaypointerunrestricted', onPointerUnrestricted, false);

    document.body.appendChild(WEBVR.createButton(renderer));

}

function onMouseDown()
{

    isMouseDown = true;

}

function onMouseUp()
{

    isMouseDown = false;

}

function onPointerRestricted()
{
    var pointerLockElement = renderer.domElement;
    if (pointerLockElement && typeof (pointerLockElement.requestPointerLock) === 'function')
    {
        pointerLockElement.requestPointerLock();

    }
}

function onPointerUnrestricted()
{
    var currentPointerLockElement = document.pointerLockElement;
    var expectedPointerLockElement = renderer.domElement;
    if (currentPointerLockElement && currentPointerLockElement === expectedPointerLockElement && typeof (document.exitPointerLock) === 'function')
    {
        document.exitPointerLock();
    }
}

function onWindowResize()
{

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function animate()
{

    // renderer.animate(render);

}

function render()
{

    var delta = clock.getDelta() * 60;

    if (isMouseDown === true)
    {

        var cube = room.children[0];
        room.remove(cube);

        cube.position.set(0, 0, - 0.75);
        cube.position.applyQuaternion(camera.quaternion);
        cube.userData.velocity.x = (Math.random() - 0.5) * 0.02 * delta;
        cube.userData.velocity.y = (Math.random() - 0.5) * 0.02 * delta;
        cube.userData.velocity.z = (Math.random() * 0.01 - 0.05) * delta;
        cube.userData.velocity.applyQuaternion(camera.quaternion);
        room.add(cube);

    }

    // find intersections

    raycaster.setFromCamera({ x: 0, y: 0 }, camera);

    var intersects = raycaster.intersectObjects(room.children);

    if (intersects.length > 0)
    {

        if (INTERSECTED != intersects[0].object)
        {

            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex(0xff0000);

        }

    } else
    {

        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

        INTERSECTED = undefined;

    }

    // Keep cubes inside room

    for (var i = 0; i < room.children.length; i++)
    {

        var cube = room.children[i];

        cube.userData.velocity.multiplyScalar(1 - (0.001 * delta));

        cube.position.add(cube.userData.velocity);

        if (cube.position.x < - 3 || cube.position.x > 3)
        {

            cube.position.x = THREE.Math.clamp(cube.position.x, - 3, 3);
            cube.userData.velocity.x = - cube.userData.velocity.x;

        }

        if (cube.position.y < - 3 || cube.position.y > 3)
        {

            cube.position.y = THREE.Math.clamp(cube.position.y, - 3, 3);
            cube.userData.velocity.y = - cube.userData.velocity.y;

        }

        if (cube.position.z < - 3 || cube.position.z > 3)
        {

            cube.position.z = THREE.Math.clamp(cube.position.z, - 3, 3);
            cube.userData.velocity.z = - cube.userData.velocity.z;

        }

        cube.rotation.x += cube.userData.velocity.x * 2 * delta;
        cube.rotation.y += cube.userData.velocity.y * 2 * delta;
        cube.rotation.z += cube.userData.velocity.z * 2 * delta;

    }

    renderer.render(scene, camera);

}
