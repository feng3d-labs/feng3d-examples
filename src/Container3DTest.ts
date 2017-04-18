module feng3d
{

    /**
     * 测试3D容器
     */
    export class Container3DTest
    {

        view3D: View3D;
        constructor()
        {

            this.init();
        }

        init()
        {
            var canvas = document.getElementById("glcanvas");
            this.view3D = new View3D(canvas);

            //初始化颜色材质
            var cube = new CubeObject3D();
            cube.transform.position.z = 500;
            this.view3D.scene.addChild(cube);

            var colorMaterial = cube.getOrCreateComponentByClass(Model).material = new ColorMaterial();

            var cylinder = new CylinderObject3D();
            cylinder.transform.position.x = 200;
            cube.addChild(cylinder);

            //变化旋转与颜色
            setInterval(function ()
            {
                cube.transform.rotation.y += 1;
            }, 15);
            setInterval(function ()
            {
                colorMaterial.color.fromUnit(Math.random() * (1 << 32 - 1), true);
            }, 1000);
        }
    }
}
new feng3d.Container3DTest();