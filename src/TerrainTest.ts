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
            if (terrainGeometry)
            {
                //获取鼠标射线
                var ray = this.view3D.getMouseRay3D();
                //射线转换到模型空间
                var inverseGlobalMatrix3D = terrain.transform.inverseGlobalMatrix3D
                inverseGlobalMatrix3D.transformVector(ray.position, ray.position);
                inverseGlobalMatrix3D.deltaTransformVector(ray.direction, ray.direction);
                var result = terrainGeometry.intersectionRay(ray);
                if (result)
                {
                    brushUVScaleOffset.z = -(result.x / images[6].width - 0.5);
                    brushUVScaleOffset.w = -((images[1].height - result.y) / images[6].height - 0.5);
                }
            }
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
            images = [];
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
                        terrainGeometry = terrain.getOrCreateComponentByClass(Model).geometry = new TerrainGeometry(terrainHeightData);
                        var terrainMaterial = new TerrainMaterial();
                        terrainMaterial.diffuseTexture = new Texture2D(images[1]);
                        terrainMaterial.blendTexture = new Texture2D(images[2]);
                        terrainMaterial.splatTexture1 = new Texture2D(images[3]);
                        terrainMaterial.splatTexture2 = new Texture2D(images[4]);
                        terrainMaterial.splatTexture3 = new Texture2D(images[5]);
                        terrainMaterial.splatRepeats = new Vector3D(1, 50, 150, 100);
                        terrainMaterial.brushTexture = new Texture2D(images[6]);
                        terrainMaterial.brushTexture.wrapS = GL.CLAMP_TO_EDGE;
                        terrainMaterial.brushTexture.wrapT = GL.CLAMP_TO_EDGE;
                        terrainMaterial.brushTexture.generateMipmap = false;
                        terrainMaterial.brushTexture.minFilter = GL.LINEAR;
                        terrainMaterial.brushUVScaleOffset.x = images[1].width / images[6].width;
                        terrainMaterial.brushUVScaleOffset.y = images[1].height / images[6].height;
                        terrainMaterial.brushUVScaleOffset.z = 0;
                        terrainMaterial.brushUVScaleOffset.w = 0;
                        brushUVScaleOffset = terrainMaterial.brushUVScaleOffset;

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

var terrain: feng3d.Object3D;
var brushUVScaleOffset: feng3d.Vector3D;
var terrainGeometry: feng3d.TerrainGeometry;
var images: HTMLImageElement[];