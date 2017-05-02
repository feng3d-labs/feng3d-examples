var feng3d;
(function (feng3d) {
    /**
     * 操作方式:鼠标按下后可以使用移动鼠标改变旋转，wasdqe平移
     */
    class FPSControllerTest {
        constructor() {
            this.init();
            this.cameraObj = this.view3D.camera;
            this.cameraObj.z = -500;
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
            var screenPos = this.view3D.project(sphere.scenePosition);
            console.log("球体视窗坐标" + screenPos.toString());
        }
        init() {
            var canvas = document.getElementById("glcanvas");
            this.view3D = new feng3d.View3D(canvas);
            var scene3D = this.view3D.scene;
            var cube = new feng3d.CubeObject3D();
            scene3D.addChild(cube);
            var plane = new feng3d.PlaneObject3D();
            plane.setPosition(150, 0, 0);
            plane.rotationX = 90;
            scene3D.addChild(plane);
            sphere = new feng3d.SphereObject3D();
            sphere.setPosition(-150, 0, 0);
            scene3D.addChild(sphere);
            var capsule = new feng3d.CapsuleObject3D();
            capsule.setPosition(300, 0, 0);
            scene3D.addChild(capsule);
            var cylinder = new feng3d.CylinderObject3D();
            cylinder.setPosition(-300, 0, 0);
            scene3D.addChild(cylinder);
        }
    }
    feng3d.FPSControllerTest = FPSControllerTest;
    var sphere;
})(feng3d || (feng3d = {}));
new feng3d.FPSControllerTest();
//# sourceMappingURL=FPSControllerTest.js.map