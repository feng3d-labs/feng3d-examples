var feng3d;
(function (feng3d) {
    class ColorMaterialTest {
        constructor() {
            this.init();
        }
        init() {
            var canvas = document.getElementById("glcanvas");
            this.view3D = new feng3d.View3D(canvas);
            var cube = new feng3d.CubeObject3D();
            cube.transform.position.z = 300;
            this.view3D.scene.addChild(cube);
            //初始化颜色材质
            var colorMaterial = cube.getOrCreateComponentByClass(feng3d.Model).material = new feng3d.ColorMaterial();
            //变化旋转与颜色
            setInterval(function () {
                cube.transform.rotation.y += 1;
            }, 15);
            setInterval(function () {
                colorMaterial.color.fromUnit(Math.random() * (1 << 32 - 1), true);
            }, 1000);
        }
    }
    feng3d.ColorMaterialTest = ColorMaterialTest;
})(feng3d || (feng3d = {}));
new feng3d.ColorMaterialTest();
//# sourceMappingURL=ColorMaterialTest.js.map