module feng3d
{
    export class TerrainTest
    {
        view3D: View3D;
        controller: FPSController;
        cameraObj: Object3D;

        constructor()
        {

            this.init();

            this.cameraObj = this.view3D.camera;
            this.cameraObj.transform.position.z = -500;
            this.cameraObj.transform.position.y = 200;
            this.cameraObj.transform.lookAt(new Vector3D());
            //
            this.controller = new FPSController();
            //
            this.process();
            setInterval(this.process.bind(this), 17);


            input.addEventListener("mousedown", this.onMousedown, this);
            input.addEventListener("mouseup", this.onMouseup, this);
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

            var scene = this.view3D.scene;

            var canvasImg = <HTMLCanvasElement>document.createElement("canvas");
            canvasImg.width = 2048;
            canvasImg.height = 2048;

            var ctxt = canvasImg.getContext('2d');

            var loadedNum = 0;
            var imagePaths = ['terrain_heights.jpg', 'terrain_diffuse.jpg', 'terrain_splats.png', 'beach.jpg', 'grass.jpg', 'rock.jpg', 'brush.png'];
            var images: HTMLImageElement[] = [];
            for (var i = 0; i < imagePaths.length; i++)
            {
                var image = images[i] = new Image();
                image.onload = function ()
                {
                    loadedNum++;
                    if (loadedNum == imagePaths.length)
                    {
                        //获取高度图
                        var heightImage = images[0];
                        ctxt.drawImage(heightImage, 0, 0);
                        var terrainHeightData = ctxt.getImageData(0, 0, heightImage.width, heightImage.height);//读取整张图片的像素。
                        // ctxt.putImageData(terrainHeightData, terrainHeightData.width, terrainHeightData.height)
                        //
                        terrain = new Object3D("terrain");
                        terrain.getOrCreateComponentByClass(Model).geometry = new TerrainGeometry(terrainHeightData);
                        var terrainMaterial = new TerrainMaterial();
                        terrainMaterial.diffuseTexture = new Texture2D(images[1]);
                        terrainMaterial.blendTexture = new Texture2D(images[2]);
                        terrainMaterial.splatTexture1 = new Texture2D(images[3]);
                        terrainMaterial.splatTexture2 = new Texture2D(images[4]);
                        terrainMaterial.splatTexture3 = new Texture2D(images[5]);
                        terrainMaterial.splatRepeats = new Vector3D(1, 50, 150, 100);
                        terrainMaterial.brushTexture = new Texture2D(images[6]);
                        

                        terrain.getOrCreateComponentByClass(Model).material = terrainMaterial;
                        scene.addChild(terrain);
                    }
                }
                image.src = 'resources/terrain/' + imagePaths[i];
            }
        }

    }
}

new feng3d.TerrainTest();

var terrain;