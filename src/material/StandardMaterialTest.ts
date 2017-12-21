namespace feng3d
{
    var view3D = new Engine();

    var cube = GameObject.create();
    cube.transform.z = 300;
    cube.transform.y = -100;
    view3D.scene.gameObject.addChild(cube);

    //变化旋转与颜色
    setInterval(function ()
    {
        cube.transform.ry += 1;
    }, 15);

    var model = cube.addComponent(MeshRenderer);
    model.geometry = new CubeGeometry(100, 100, 100, 1, 1, 1, false);
    // model.geometry = new PlaneGeometry();
    //材质
    var textureMaterial = model.material = new StandardMaterial();
    textureMaterial.diffuseMethod.difuseTexture.url = 'resources/m.png';
    // textureMaterial.diffuseMethod.difuseTexture.url = 'resources/nonpowerof2.png';
    textureMaterial.diffuseMethod.difuseTexture.format = TextureFormat.RGBA;
    // textureMaterial.diffuseMethod.alphaThreshold = 0.1;

    textureMaterial.diffuseMethod.difuseTexture.anisotropy = 16;

    textureMaterial.enableBlend = true;
    textureMaterial.diffuseMethod.color.a = 0.2;
}