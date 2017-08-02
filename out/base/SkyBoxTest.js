var feng3d;
(function (feng3d) {
    var view3D = new feng3d.Engine();
    var scene = view3D.scene;
    var camera = view3D.camera;
    camera.transform.z = -500;
    camera.transform.lookAt(new feng3d.Vector3D());
    camera.gameObject.addComponent(feng3d.FPSController);
    //
    var skybox = feng3d.GameObject.create("skybox");
    var model = skybox.addComponent(feng3d.MeshRenderer);
    skybox.addComponent(feng3d.MeshFilter).mesh = new feng3d.SkyBoxGeometry();
    model.material = new feng3d.SkyBoxMaterial([
        'resources/skybox/px.jpg',
        'resources/skybox/py.jpg',
        'resources/skybox/pz.jpg',
        'resources/skybox/nx.jpg',
        'resources/skybox/ny.jpg',
        'resources/skybox/nz.jpg'
    ]);
    scene.transform.addChild(skybox.transform);
})(feng3d || (feng3d = {}));
//# sourceMappingURL=SkyBoxTest.js.map