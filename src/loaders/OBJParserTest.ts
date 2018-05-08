namespace feng3d
{

    export class OBJParserTest extends feng3d.Script
    {
        /**
         * 初始化时调用
         */
        init()
        {
            var scene = this.gameObject.scene;
            var camera = scene.getComponentsInChildren(feng3d.Camera)[0];
            var canvas = document.getElementById("glcanvas");

            var object: GameObject;

            // //变化旋转
            setInterval(function ()
            {
                if (object)
                {
                    object.transform.ry += 1;
                }
            }, 15);

            // var objUrl = "resources/cube.obj";
            var objUrl = "resources/head.obj";

            var material = materialFactory.create("standard");
            material.uniforms.s_diffuse.url = "resources/head_diffuse.jpg";
            material.uniforms.s_normal.url = "resources/head_normals.jpg";
            material.uniforms.s_specular.url = "resources/head_specular.jpg";
            // var material = materialFactory.create("color");
            material.renderParams.cullFace = CullFace.NONE;

            ObjLoader.load(objUrl, function (gameObject: GameObject)
            {
                object = gameObject;
                object.transform.sx = 20;
                object.transform.sy = 20;
                object.transform.sz = 20;
                object.transform.z = 300;
                scene.gameObject.addChild(gameObject);

                var meshRenderers = gameObject.getComponentsInChildren(MeshRenderer);
                meshRenderers.forEach(element =>
                {
                    element.material = material;
                });
            });
        }
        /**
         * 更新
         */
        update()
        {
        }

        /**
        * 销毁时调用
        */
        dispose()
        {

        }
    }
}