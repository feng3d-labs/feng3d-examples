module feng3d
{

    export class SceneLoadTest
    {

        view3D: View3D;
        controller: FPSController;
        cameraObj: Object3D;

        constructor()
        {

            this.init();

            this.cameraObj = this.view3D.camera;
            this.cameraObj.transform.position.z = -500;
            this.cameraObj.transform.lookAt(new Vector3D());
            //
            this.controller = new FPSController();
            //
            this.process();
            setInterval(this.process.bind(this), 17);


            engine.input.addEventListener("mousedown", this.onMousedown, this);
            engine.input.addEventListener("mouseup", this.onMouseup, this);
        }

        private onMousedown()
        {

            this.controller.target = this.cameraObj.transform;
        }

        private onMouseup()
        {

            this.controller.target = null;
        }

        process()
        {

            this.controller.update();
        }

        init()
        {
            var canvas = document.getElementById("glcanvas");
            this.view3D = new View3D(canvas);
            var scene3D = this.view3D.scene;

            var loader = new Loader();
            loader.addEventListener(LoaderEvent.COMPLETE, function ()
            {
                var json = JSON.parse(loader.content);
                var scene: Scene3D = engine.serialization.readObject(json);
                for (var i = 0; i < scene.numChildren; i++)
                {
                    scene3D.addChild(scene.getChildAt(i));
                }
            }, this);
            loader.loadText("resources/scene/scene.json");
        }

    }
}

new feng3d.SceneLoadTest();