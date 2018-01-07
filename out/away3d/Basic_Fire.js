var feng3d;
(function (feng3d) {
    var NUM_FIRES = 10;
    var scene;
    var camera;
    var view3D;
    var cameraController;
    var planeMaterial;
    var particleMaterial;
    var directionalLight;
    var particleGeometry;
    var timer;
    var plane;
    var fireObjects = [];
    var move = false;
    var lastPanAngle = NaN;
    var lastTiltAngle = NaN;
    var lastMouseX = NaN;
    var lastMouseY = NaN;
    initEngine();
    initLights();
    initMaterials();
    initObjects();
    initListeners();
    function initEngine() {
        view3D = new feng3d.Engine();
        camera = view3D.camera;
        scene = view3D.scene;
        cameraController = new feng3d.HoverController(camera.gameObject);
        cameraController.distance = 10;
        cameraController.minTiltAngle = 0;
        cameraController.maxTiltAngle = 90;
        cameraController.panAngle = 45;
        cameraController.tiltAngle = 20;
    }
    function initLights() {
        var gameObject = feng3d.GameObject.create();
        directionalLight = gameObject.addComponent(feng3d.DirectionalLight);
        directionalLight.transform.rx = 90;
        directionalLight.castsShadows = false;
        directionalLight.color.fromUnit(0xeedddd);
        directionalLight.intensity = .5;
        scene.gameObject.addChild(gameObject);
    }
    function initMaterials() {
        planeMaterial = new feng3d.StandardMaterial("resources/floor_diffuse.jpg", "resources/floor_normal.jpg", "resources/floor_specular.jpg");
        planeMaterial["specular"] = 10;
        particleMaterial = new feng3d.StandardMaterial("resources/blue.png");
        particleMaterial.diffuseMethod.difuseTexture.format = feng3d.TextureFormat.RGBA;
        particleMaterial.enableBlend = true;
    }
    function initParticles(particleAnimator) {
        particleAnimator.animations.billboard.enable = true;
        particleAnimator.animations.billboard.camera = camera.getComponent(feng3d.Camera);
        // fireAnimationSet["addAnimation"](new ParticleScaleNode(ParticlePropertiesMode.GLOBAL, false, false, 2.5, 0.5));
        // fireAnimationSet["addAnimation"](new ParticleVelocityNode(ParticlePropertiesMode.GLOBAL, new Vector3D(0, 80, 0)));
        // fireAnimationSet["addAnimation"](new ParticleColorNode(ParticlePropertiesMode.GLOBAL, true, true, false, false, new flash.ColorTransform(0, 0, 0, 1, 0xFF, 0x33, 0x01), new flash.ColorTransform(0, 0, 0, 1, 0x99)));
        // fireAnimationSet["addAnimation"](new ParticleVelocityNode(ParticlePropertiesMode.LOCAL_STATIC));
        //通过函数来创建粒子初始状态
        particleAnimator.numParticles = 500;
        particleAnimator.generateFunctions.push({
            generate: function (particle) {
                particle.color = new feng3d.Color(1, 0, 0, 1).mix(new feng3d.Color(0, 1, 0, 1), particle.index / particle.total);
                particle.birthTime = Math.random() * 5;
                particle.lifetime = Math.random() * 4 + 0.1;
                var degree1 = Math.random() * Math.PI * 2;
                var degree2 = Math.random() * Math.PI * 2;
                var r = 0.15;
                particle.velocity = new feng3d.Vector3D(r * Math.sin(degree1) * Math.cos(degree2), r * Math.cos(degree1) * Math.cos(degree2), r * Math.sin(degree2));
            }, priority: 0
        });
        particleGeometry = new feng3d.PlaneGeometry(0.10, 0.10, 1, 1, false);
    }
    function initObjects() {
        plane = feng3d.GameObject.create();
        var model = plane.addComponent(feng3d.MeshRenderer);
        model.geometry = new feng3d.PlaneGeometry(10, 10);
        model.geometry.scaleUV(2, 2);
        model.material = planeMaterial;
        plane.transform.y = -0.20;
        scene.gameObject.addChild(plane);
        for (var i = 0; i < NUM_FIRES; i++) {
            var particleMesh = feng3d.GameObject.create();
            var model = particleMesh.addComponent(feng3d.MeshRenderer);
            model.geometry = particleGeometry;
            model.material = particleMaterial;
            var particleAnimator = particleMesh.addComponent(feng3d.ParticleAnimator);
            initParticles(particleAnimator);
            var degree = i / NUM_FIRES * Math.PI * 2;
            particleMesh.transform.x = Math.sin(degree) * 4;
            particleMesh.transform.z = Math.cos(degree) * 4;
            particleMesh.transform.y = 0.05;
            fireObjects.push({ mesh: particleMesh, animator: particleAnimator, strength: 0 });
            scene.gameObject.addChild(particleMesh);
        }
        timer = new feng3d.Timer(1000, fireObjects.length);
        timer.on("timer", onTimer, this);
        timer.start();
    }
    function initListeners() {
        feng3d.ticker.onframe(onEnterFrame, this);
        feng3d.windowEventProxy.on("mousedown", onMouseDown, this);
        feng3d.windowEventProxy.on("mouseup", onMouseUp, this);
    }
    function getAllLights() {
        var lights = new Array();
        lights.push(directionalLight);
        for (var fireVO_key_a in fireObjects) {
            var fireVO = fireObjects[fireVO_key_a];
            if (fireVO.light)
                lights.push(fireVO.light);
        }
        return lights;
    }
    function onTimer(e) {
        var fireObject = fireObjects[timer.currentCount - 1];
        var lightObject = feng3d.GameObject.create();
        var light = lightObject.addComponent(feng3d.PointLight);
        light.color.fromUnit(0xFF3301);
        light.intensity = 0;
        lightObject.transform.position = fireObject.mesh.transform.position;
        fireObject.light = light;
    }
    function onEnterFrame() {
        if (move) {
            cameraController.panAngle = 0.3 * (feng3d.windowEventProxy.clientX - view3D.gl.canvas.clientLeft - lastMouseX) + lastPanAngle;
            cameraController.tiltAngle = 0.3 * (feng3d.windowEventProxy.clientY - view3D.gl.canvas.clientTop - lastMouseY) + lastTiltAngle;
        }
        var fireVO;
        var fireVO_key_a;
        for (fireVO_key_a in fireObjects) {
            fireVO = fireObjects[fireVO_key_a];
            var light = fireVO.light;
            if (!light)
                continue;
            if (fireVO.strength < 1)
                fireVO.strength += 0.1;
            light["fallOff"] = 3.80 + Math.random() * 0.20;
            light["radius"] = 2 + Math.random() * 0.30;
            light["diffuse"] = light["specular"] = fireVO.strength + Math.random() * .2;
        }
        // view["render"]();
    }
    function onMouseDown() {
        lastPanAngle = cameraController.panAngle;
        lastTiltAngle = cameraController.tiltAngle;
        lastMouseX = feng3d.windowEventProxy.clientX - view3D.gl.canvas.clientLeft;
        lastMouseY = feng3d.windowEventProxy.clientY - view3D.gl.canvas.clientTop;
        move = true;
    }
    function onMouseUp() {
        move = false;
    }
})(feng3d || (feng3d = {}));
//# sourceMappingURL=Basic_Fire.js.map