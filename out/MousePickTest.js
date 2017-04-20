var feng3d;
(function (feng3d) {
    /**
     * 操作方式:鼠标按下后可以使用移动鼠标改变旋转，wasdqe平移
     */
    class MousePickTest {
        constructor() {
            this.init();
            this.cameraObj = this.view3D.camera;
            this.cameraObj.position.z = -500;
            this.cameraObj.lookAt(new feng3d.Vector3D());
            //
            this.controller = new feng3d.FPSController();
            //
            this.process();
            setInterval(this.process.bind(this), 17);
            feng3d.input.addEventListener("mousedown", this.onMousedown, this);
            feng3d.input.addEventListener("mouseup", this.onMouseup, this);
        }
        onMousedown() {
            this.controller.target = this.cameraObj;
        }
        onMouseup() {
            this.controller.target = null;
        }
        process() {
            this.controller.update();
        }
        init() {
            var canvas = document.getElementById("glcanvas");
            this.view3D = new feng3d.View3D(canvas);
            var scene3D = this.view3D.scene;
            var cube = new feng3d.CubeObject3D();
            cube.position = new feng3d.Vector3D(0, 0, 0);
            scene3D.addChild(cube);
            var plane = new feng3d.PlaneObject3D();
            plane.position = new feng3d.Vector3D(150, 0, 0);
            plane.rotation = new feng3d.Vector3D(90, 0, 0);
            scene3D.addChild(plane);
            var sphere = new feng3d.SphereObject3D();
            sphere.position = new feng3d.Vector3D(-150, 0, 0);
            scene3D.addChild(sphere);
            var capsule = new feng3d.CapsuleObject3D();
            capsule.position = new feng3d.Vector3D(300, 0, 0);
            scene3D.addChild(capsule);
            var cylinder = new feng3d.CylinderObject3D();
            cylinder.position = new feng3d.Vector3D(-300, 0, 0);
            scene3D.addChild(cylinder);
            scene3D.addEventListener(feng3d.Mouse3DEvent.CLICK, this.onMouseClick, this);
        }
        onMouseClick(event) {
            var object3D = event.target;
            var material = object3D.getComponentByType(feng3d.Model).material = new feng3d.ColorMaterial();
            material.color.fromUnit(Math.random() * (1 << 24));
        }
    }
    feng3d.MousePickTest = MousePickTest;
})(feng3d || (feng3d = {}));
new feng3d.MousePickTest();
//# sourceMappingURL=MousePickTest.js.map