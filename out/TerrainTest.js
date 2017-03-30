var feng3d;
(function (feng3d) {
    class TerrainTest {
        constructor() {
            this.init();
            this.cameraObj = this.view3D.camera;
            this.cameraObj.transform.position.z = -500;
            this.cameraObj.transform.position.y = 200;
            this.cameraObj.transform.lookAt(new feng3d.Vector3D());
            //
            this.controller = new feng3d.FPSController();
            //
            this.process();
            setInterval(this.process.bind(this), 17);
            feng3d.input.addEventListener("mousedown", this.onMousedown, this);
            feng3d.input.addEventListener("mouseup", this.onMouseup, this);
        }
        onMousedown() {
            this.controller.target = this.cameraObj.transform;
        }
        onMouseup() {
            this.controller.target = null;
        }
        process() {
            this.controller.update();
            if (terrainGeometry) {
                //获取鼠标射线
                var ray = this.view3D.getMouseRay3D();
                //射线转换到模型空间
                var inverseGlobalMatrix3D = terrain.transform.inverseGlobalMatrix3D;
                inverseGlobalMatrix3D.transformVector(ray.position, ray.position);
                inverseGlobalMatrix3D.deltaTransformVector(ray.direction, ray.direction);
                var result = terrainGeometry.intersectionRay(ray);
                if (result) {
                    brushUVScaleOffset.z = -(result.x / images[6].width - 0.5);
                    brushUVScaleOffset.w = -((images[1].height - result.y) / images[6].height - 0.5);
                }
            }
        }
        init() {
            var canvas = document.getElementById("glcanvas");
            this.view3D = new feng3d.View3D(canvas);
            var scene = this.view3D.scene;
            var canvasImg = document.createElement("canvas");
            canvasImg.width = 2048;
            canvasImg.height = 2048;
            var ctxt = canvasImg.getContext('2d');
            var loadedNum = 0;
            var imagePaths = ['terrain_heights.jpg', 'terrain_diffuse.jpg', 'terrain_splats.png', 'beach.jpg', 'grass.jpg', 'rock.jpg', 'brush.png'];
            images = [];
            for (var i = 0; i < imagePaths.length; i++) {
                var image = images[i] = new Image();
                image.onload = function () {
                    loadedNum++;
                    if (loadedNum == imagePaths.length) {
                        //获取高度图
                        var heightImage = images[0];
                        ctxt.drawImage(heightImage, 0, 0);
                        var terrainHeightData = ctxt.getImageData(0, 0, heightImage.width, heightImage.height); //读取整张图片的像素。
                        // ctxt.putImageData(terrainHeightData, terrainHeightData.width, terrainHeightData.height)
                        //
                        terrain = new feng3d.Object3D("terrain");
                        terrainGeometry = terrain.getOrCreateComponentByClass(feng3d.Model).geometry = new feng3d.TerrainGeometry(terrainHeightData);
                        var terrainMaterial = new feng3d.TerrainMaterial();
                        terrainMaterial.diffuseTexture = new feng3d.Texture2D(images[1]);
                        terrainMaterial.blendTexture = new feng3d.Texture2D(images[2]);
                        terrainMaterial.splatTexture1 = new feng3d.Texture2D(images[3]);
                        terrainMaterial.splatTexture2 = new feng3d.Texture2D(images[4]);
                        terrainMaterial.splatTexture3 = new feng3d.Texture2D(images[5]);
                        terrainMaterial.splatRepeats = new feng3d.Vector3D(1, 50, 150, 100);
                        terrainMaterial.brushTexture = new feng3d.Texture2D(images[6]);
                        terrainMaterial.brushTexture.wrapS = feng3d.GL.CLAMP_TO_EDGE;
                        terrainMaterial.brushTexture.wrapT = feng3d.GL.CLAMP_TO_EDGE;
                        terrainMaterial.brushTexture.generateMipmap = false;
                        terrainMaterial.brushTexture.minFilter = feng3d.GL.LINEAR;
                        terrainMaterial.brushUVScaleOffset.x = images[1].width / images[6].width;
                        terrainMaterial.brushUVScaleOffset.y = images[1].height / images[6].height;
                        terrainMaterial.brushUVScaleOffset.z = 0;
                        terrainMaterial.brushUVScaleOffset.w = 0;
                        brushUVScaleOffset = terrainMaterial.brushUVScaleOffset;
                        terrain.getOrCreateComponentByClass(feng3d.Model).material = terrainMaterial;
                        scene.addChild(terrain);
                    }
                };
                image.src = 'resources/terrain/' + imagePaths[i];
            }
        }
    }
    feng3d.TerrainTest = TerrainTest;
})(feng3d || (feng3d = {}));
new feng3d.TerrainTest();
var terrain;
var brushUVScaleOffset;
var terrainGeometry;
var images;
//# sourceMappingURL=TerrainTest.js.map