namespace feng3d
{
    var view3D = new Engine();

    var segment = GameObject.create("segment");
    segment.transform.z = 300;
    view3D.scene.transform.addChild(segment.transform);

    //初始化材质
    segment.addComponent(MeshRenderer).material = new SegmentMaterial();
    var segmentGeometry = segment.addComponent(MeshFilter).mesh = new SegmentGeometry();

    var length = 200;
    var height = 200 / Math.PI;
    var preVec: Vector3D;
    for (var x = -length; x <= length; x++)
    {
        var angle = x / length * Math.PI;
        if (preVec == null)
        {
            preVec = new Vector3D(x, Math.sin(angle) * height, 0);
        } else
        {
            var vec = new Vector3D(x, Math.sin(angle) * height, 0);
            segmentGeometry.addSegment(new Segment(preVec, vec));
            preVec = vec;
        }
    }

    //变化旋转
    setInterval(function ()
    {
        segment.transform.ry += 1;
    }, 15);
}