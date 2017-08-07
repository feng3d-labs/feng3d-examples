var feng3d;
(function (feng3d) {
    var view = new feng3d.Engine();
    var scene = view.scene;
    view.camera.transform.z = -600;
    view.camera.transform.y = 500;
    view.camera.transform.lookAt(new feng3d.Vector3D());
    var plane = feng3d.GameObject.create();
    plane.addComponent(feng3d.MeshFilter).mesh = new feng3d.PlaneGeometry(700, 700);
    var model = plane.addComponent(feng3d.MeshRenderer);
    var material = model.material = new feng3d.StandardMaterial("resources/floor_diffuse.jpg");
    scene.gameObject.addChild(plane);
    feng3d.ticker.on("enterFrame", function (e) {
        plane.transform.ry += 1;
    });
})(feng3d || (feng3d = {}));
//# sourceMappingURL=Basic_View.js.map