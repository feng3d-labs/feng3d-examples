namespace feng3d
{
    var view3D = new Engine();

    var scene = view3D.scene;

    var camera = view3D.camera;
    camera.transform.z = -500;
    camera.transform.y = 200;
    camera.transform.lookAt(new Vector3D());
    camera.gameObject.addComponent(FPSController);

    var root = 'resources/terrain/';
    //
    var terrain = GameObject.create("terrain");
    terrain.addComponent(MeshFilter).mesh = new TerrainGeometry(root + 'terrain_heights.jpg');
    var material = new StandardMaterial(root + 'terrain_diffuse.jpg', root + "terrain_normals.jpg");

    // var terrainMethod = new TerrainMergeMethod(root + 'terrain_splats.png',root + 'test3.jpg',new Vector3D(50, 50, 50));
    var terrainMethod = new TerrainMergeMethod(root + 'terrain_splats.png', root + 'test1.jpg', new Vector3D(50, 50, 50));
    material.addMethod(terrainMethod);
    terrain.addComponent(MeshRenderer).material = material;
    scene.transform.addChild(terrain.transform);

    //初始化光源
    var light1 = GameObject.create();
    var pointLight1 = light1.addComponent(PointLight);
    // pointLight1.range = 1000;
    pointLight1.color = new Color(1, 1, 0, 1);
    light1.transform.y = 300;
    // scene.transform.addChild(light1);

    //
    ticker.on("enterFrame", () =>
    {
        var time = new Date().getTime();
        var angle = time / 1000;
        light1.transform.x = Math.sin(angle) * 300;
        light1.transform.z = Math.cos(angle) * 300;
    });
}
