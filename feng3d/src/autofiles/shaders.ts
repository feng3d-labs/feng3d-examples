module feng3d
{
feng3d.shaderFileMap = {
	"shaders/color.fragment.glsl": "\r\n\r\nprecision mediump float;\r\n\r\nuniform vec4 u_diffuseInput;\r\n\r\n\r\n\r\nvoid main(void) {\r\n   \r\n    gl_FragColor = u_diffuseInput;\r\n}\r\n",
	"shaders/color.vertex.glsl": "\r\n\r\nattribute vec3 a_position;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvoid main(void) {\r\n\r\n    vec4 globalPosition = u_modelMatrix * vec4(a_position, 1.0);\r\n    gl_Position = u_viewProjection * globalPosition;\r\n}",
	"shaders/modules/envmap.fragment.glsl": "uniform samplerCube s_envMap;\r\nuniform float u_reflectivity;\r\n\r\nvec4 envmapMethod(vec4 finalColor)\r\n{\r\n    vec3 cameraToVertex = normalize( v_globalPosition - u_cameraMatrix[3].xyz );\r\n    vec3 reflectVec = reflect( cameraToVertex, v_normal );\r\n    vec4 envColor = textureCube( s_envMap, reflectVec );\r\n    finalColor.xyz += envColor.xyz * u_reflectivity;\r\n    return finalColor;\r\n}",
	"shaders/modules/fog.fragment.glsl": "#define FOGMODE_NONE    0.\r\n#define FOGMODE_EXP     1.\r\n#define FOGMODE_EXP2    2.\r\n#define FOGMODE_LINEAR  3.\r\n#define E 2.71828\r\n\r\nuniform float u_fogMode;\r\nuniform float u_fogMinDistance;\r\nuniform float u_fogMaxDistance;\r\nuniform float u_fogDensity;\r\nuniform vec3 u_fogColor;\r\n\r\nfloat CalcFogFactor(float fogDistance)\r\n{\r\n\tfloat fogCoeff = 1.0;\r\n\tif (FOGMODE_LINEAR == u_fogMode)\r\n\t{\r\n\t\tfogCoeff = (u_fogMaxDistance - fogDistance) / (u_fogMaxDistance - u_fogMinDistance);\r\n\t}\r\n\telse if (FOGMODE_EXP == u_fogMode)\r\n\t{\r\n\t\tfogCoeff = 1.0 / pow(E, fogDistance * u_fogDensity);\r\n\t}\r\n\telse if (FOGMODE_EXP2 == u_fogMode)\r\n\t{\r\n\t\tfogCoeff = 1.0 / pow(E, fogDistance * fogDistance * u_fogDensity * u_fogDensity);\r\n\t}\r\n\r\n\treturn clamp(fogCoeff, 0.0, 1.0);\r\n}\r\n\r\nvec3 fogMethod(vec3 color)\r\n{\r\n    vec3 fogDistance = u_cameraMatrix[3].xyz - v_globalPosition.xyz;\r\n\tfloat fog = CalcFogFactor(length(fogDistance));\r\n\tcolor.rgb = fog * color.rgb + (1.0 - fog) * u_fogColor;\r\n    return color;\r\n}",
	"shaders/modules/pointLightShading.declare.glsl.bak": "//参考资料\r\n//http://blog.csdn.net/leonwei/article/details/44539217\r\n//https://github.com/mcleary/pbr/blob/master/shaders/phong_pbr_frag.glsl\r\n\r\n#if NUM_POINTLIGHT > 0\r\n    //点光源位置列表\r\n    uniform vec3 u_pointLightPositions[NUM_POINTLIGHT];\r\n    //点光源漫反射颜色\r\n    uniform vec3 u_pointLightColors[NUM_POINTLIGHT];\r\n    //点光源镜面反射颜色\r\n    uniform float u_pointLightIntensitys[NUM_POINTLIGHT];\r\n    //反射率\r\n    uniform float u_reflectance;\r\n    //粗糙度\r\n    uniform float u_roughness;\r\n    //金属度\r\n    uniform float u_metalic;\r\n\r\n    vec3 fresnelSchlick(float VdotH,vec3 reflectance){\r\n\r\n        return reflectance + (1.0 - reflectance) * pow(clamp(1.0 - VdotH, 0.0, 1.0), 5.0);\r\n        // return reflectance;\r\n    }\r\n\r\n    float normalDistributionGGX(float NdotH,float alphaG){\r\n\r\n        float alphaG2 = alphaG * alphaG;\r\n        float d = NdotH * NdotH * (alphaG2 - 1.0) + 1.0; \r\n        return alphaG2 / (3.1415926 * d * d);\r\n    }\r\n\r\n    float smithVisibility(float dot,float alphaG){\r\n\r\n        float tanSquared = (1.0 - dot * dot) / (dot * dot);\r\n        return 2.0 / (1.0 + sqrt(1.0 + alphaG * alphaG * tanSquared));\r\n    }\r\n\r\n    vec3 calculateLight(vec3 normal,vec3 viewDir,vec3 lightDir,vec3 lightColor,float lightIntensity,vec3 baseColor,vec3 reflectance,float roughness){\r\n\r\n        //BRDF = D(h) * F(1, h) * V(l, v, h) / (4 * dot(n, l) * dot(n, v));\r\n\r\n        vec3 halfVec = normalize(lightDir + viewDir);\r\n        float NdotL = clamp(dot(normal,lightDir),0.0,1.0);\r\n        float NdotH = clamp(dot(normal,halfVec),0.0,1.0);\r\n        float NdotV = max(abs(dot(normal,viewDir)),0.000001);\r\n        float VdotH = clamp(dot(viewDir, halfVec),0.0,1.0);\r\n        \r\n        float alphaG = max(roughness * roughness,0.0005);\r\n\r\n        //F(v,h)\r\n        vec3 F = fresnelSchlick(VdotH, reflectance);\r\n\r\n        //D(h)\r\n        float D = normalDistributionGGX(NdotH,alphaG);\r\n\r\n        //V(l,h)\r\n        float V = smithVisibility(NdotL,alphaG) * smithVisibility(NdotV,alphaG) / (4.0 * NdotL * NdotV);\r\n\r\n        vec3 specular = max(0.0, D * V) * 3.1415926 * F;\r\n        \r\n        return (baseColor + specular) * NdotL * lightColor * lightIntensity;\r\n    }\r\n\r\n    //渲染点光源\r\n    vec3 pointLightShading(vec3 normal,vec3 baseColor){\r\n\r\n        float reflectance = u_reflectance;\r\n        float roughness = u_roughness;\r\n        float metalic = u_metalic;\r\n\r\n        reflectance = mix(0.0,0.5,reflectance);\r\n        vec3 realBaseColor = (1.0 - metalic) * baseColor;\r\n        vec3 realReflectance = mix(vec3(reflectance),baseColor,metalic);\r\n\r\n        vec3 totalLightColor = vec3(0.0,0.0,0.0);\r\n        for(int i = 0;i<NUM_POINTLIGHT;i++){\r\n            //光照方向\r\n            vec3 lightDir = normalize(u_pointLightPositions[i] - v_globalPosition);\r\n            //视线方向\r\n            vec3 viewDir = normalize(u_cameraMatrix[3].xyz - v_globalPosition);\r\n            //灯光颜色\r\n            vec3 lightColor = u_pointLightColors[i];\r\n            //灯光强度\r\n            float lightIntensity = u_pointLightIntensitys[i];\r\n\r\n            totalLightColor = totalLightColor + calculateLight(normal,viewDir,lightDir,lightColor,lightIntensity,realBaseColor,realReflectance,roughness);\r\n        }\r\n        \r\n        return totalLightColor;\r\n    }\r\n#endif",
	"shaders/modules/pointLightShading.fragment.glsl": "#if NUM_POINTLIGHT > 0\r\n    //点光源位置数组\r\n    uniform vec3 u_pointLightPositions[NUM_POINTLIGHT];\r\n    //点光源颜色数组\r\n    uniform vec3 u_pointLightColors[NUM_POINTLIGHT];\r\n    //点光源光照强度数组\r\n    uniform float u_pointLightIntensitys[NUM_POINTLIGHT];\r\n    //点光源光照范围数组\r\n    uniform float u_pointLightRanges[NUM_POINTLIGHT];\r\n#endif\r\n#if NUM_DIRECTIONALLIGHT > 0\r\n    //方向光源方向数组\r\n    uniform vec3 u_directionalLightDirections[NUM_DIRECTIONALLIGHT];\r\n    //方向光源颜色数组\r\n    uniform vec3 u_directionalLightColors[NUM_DIRECTIONALLIGHT];\r\n    //方向光源光照强度数组\r\n    uniform float u_directionalLightIntensitys[NUM_DIRECTIONALLIGHT];\r\n#endif\r\n\r\n//计算光照漫反射系数\r\nvec3 calculateLightDiffuse(vec3 normal,vec3 lightDir,vec3 lightColor,float lightIntensity){\r\n\r\n    vec3 diffuse = lightColor * lightIntensity * clamp(dot(normal,lightDir),0.0,1.0);\r\n    return diffuse;\r\n}\r\n\r\n//计算光照镜面反射系数\r\nvec3 calculateLightSpecular(vec3 normal,vec3 lightDir,vec3 lightColor,float lightIntensity,vec3 viewDir,float glossiness){\r\n\r\n    vec3 halfVec = normalize(lightDir + viewDir);\r\n    float specComp = clamp(dot(normal,halfVec),0.0,1.0);\r\n    specComp = pow(specComp, max(1., glossiness));\r\n\r\n    vec3 diffuse = lightColor * lightIntensity * specComp;\r\n    return diffuse;\r\n}\r\n\r\n//根据距离计算衰减\r\nfloat computeDistanceLightFalloff(float lightDistance, float range)\r\n{\r\n    #ifdef USEPHYSICALLIGHTFALLOFF\r\n        float lightDistanceFalloff = 1.0 / ((lightDistance * lightDistance + 0.0001));\r\n    #else\r\n        float lightDistanceFalloff = max(0., 1.0 - lightDistance / range);\r\n    #endif\r\n    \r\n    return lightDistanceFalloff;\r\n}\r\n\r\n//渲染点光源\r\nvec3 pointLightShading(vec3 normal,vec3 diffuseColor,vec3 specularColor,vec3 ambientColor,float glossiness){\r\n\r\n    //视线方向\r\n    vec3 viewDir = normalize(u_cameraMatrix[3].xyz - v_globalPosition);\r\n\r\n    vec3 totalDiffuseLightColor = vec3(0.0,0.0,0.0);\r\n    vec3 totalSpecularLightColor = vec3(0.0,0.0,0.0);\r\n    #if NUM_POINTLIGHT > 0\r\n        for(int i = 0;i<NUM_POINTLIGHT;i++){\r\n            //\r\n            vec3 lightOffset = u_pointLightPositions[i] - v_globalPosition;\r\n            float lightDistance = length(lightOffset);\r\n            //光照方向\r\n            vec3 lightDir = normalize(lightOffset);\r\n            //灯光颜色\r\n            vec3 lightColor = u_pointLightColors[i];\r\n            //灯光强度\r\n            float lightIntensity = u_pointLightIntensitys[i];\r\n            //光照范围\r\n            float range = u_pointLightRanges[i];\r\n            float attenuation = computeDistanceLightFalloff(lightDistance,range);\r\n            lightIntensity = lightIntensity * attenuation;\r\n            //\r\n            totalDiffuseLightColor = totalDiffuseLightColor +  calculateLightDiffuse(normal,lightDir,lightColor,lightIntensity);\r\n            totalSpecularLightColor = totalSpecularLightColor +  calculateLightSpecular(normal,lightDir,lightColor,lightIntensity,viewDir,glossiness);\r\n        }\r\n    #endif\r\n    #if NUM_DIRECTIONALLIGHT > 0\r\n        for(int i = 0;i<NUM_DIRECTIONALLIGHT;i++){\r\n            //光照方向\r\n            vec3 lightDir = normalize(-u_directionalLightDirections[i]);\r\n            //灯光颜色\r\n            vec3 lightColor = u_directionalLightColors[i];\r\n            //灯光强度\r\n            float lightIntensity = u_directionalLightIntensitys[i];\r\n            //\r\n            totalDiffuseLightColor = totalDiffuseLightColor +  calculateLightDiffuse(normal,lightDir,lightColor,lightIntensity);\r\n            totalSpecularLightColor = totalSpecularLightColor +  calculateLightSpecular(normal,lightDir,lightColor,lightIntensity,viewDir,glossiness);\r\n        }\r\n    #endif\r\n\r\n    vec3 resultColor = vec3(0.0,0.0,0.0);\r\n    resultColor = resultColor + totalDiffuseLightColor * diffuseColor;\r\n    resultColor = resultColor + totalSpecularLightColor * specularColor;\r\n    resultColor = resultColor + ambientColor * diffuseColor;\r\n    return resultColor;\r\n}",
	"shaders/modules/pointLightShading.main.glsl.bak": "#if NUM_POINTLIGHT > 0\r\n    // finalColor = finalColor * 0.5 +  pointLightShading(v_normal,u_baseColor) * 0.5;\r\n    finalColor.xyz = pointLightShading(v_normal,finalColor.xyz);\r\n#endif",
	"shaders/modules/skeleton.vertex.glsl": "attribute vec4 a_jointindex0;\r\nattribute vec4 a_jointweight0;\r\n\r\nattribute vec4 a_jointindex1;\r\nattribute vec4 a_jointweight1;\r\nuniform mat4 u_skeletonGlobalMatriices[NUM_SKELETONJOINT];\r\n\r\nvec4 skeletonAnimation(vec4 position) {\r\n\r\n    vec4 totalPosition = vec4(0.0,0.0,0.0,1.0);\r\n    for(int i = 0; i < 4; i++){\r\n        totalPosition += u_skeletonGlobalMatriices[int(a_jointindex0[i])] * position * a_jointweight0[i];\r\n    }\r\n    for(int i = 0; i < 4; i++){\r\n        totalPosition += u_skeletonGlobalMatriices[int(a_jointindex1[i])] * position * a_jointweight1[i];\r\n    }\r\n    position.xyz = totalPosition.xyz;\r\n    return position;\r\n}",
	"shaders/mouse.fragment.glsl": "\r\n\r\nprecision highp float;\r\n\r\nuniform int u_objectID;\r\n\r\nvoid main(){\r\n\r\n    //支持 255*255*255*255 个索引\r\n    const float invColor = 1.0/255.0;\r\n    float temp = float(u_objectID);\r\n    temp = floor(temp) * invColor;\r\n    gl_FragColor.x = fract(temp);\r\n    temp = floor(temp) * invColor;\r\n    gl_FragColor.y = fract(temp);\r\n    temp = floor(temp) * invColor;\r\n    gl_FragColor.z = fract(temp);\r\n    temp = floor(temp) * invColor;\r\n    gl_FragColor.w = fract(temp);\r\n}",
	"shaders/mouse.vertex.glsl": "\r\n\r\nattribute vec3 a_position;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvoid main(){\r\n\r\n    vec4 globalPosition = u_modelMatrix * vec4(a_position, 1.0);\r\n    gl_Position = u_viewProjection * globalPosition;\r\n}",
	"shaders/particle.fragment.glsl": "\r\nprecision mediump float;\r\n\r\n//此处将填充宏定义\r\n#define macros\r\n\r\nvarying vec4 v_particle_color;\r\n\r\n\r\n\r\nvoid main(void) {\r\n\r\n    gl_FragColor = v_particle_color;\r\n}\r\n",
	"shaders/particle.vertex.glsl": "\r\nprecision mediump float;\r\n\r\n//根据是否提供(a_particle_position)数据自动定义 #define D_(a_particle_position)\r\n\r\n//此处将填充宏定义\r\n#define macros\r\n\r\nattribute vec3 a_position;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nattribute float a_particle_birthTime;\r\n\r\n#ifdef D_a_particle_position\r\n    attribute vec3 a_particle_position;\r\n#endif\r\n\r\n#ifdef D_a_particle_velocity\r\n    attribute vec3 a_particle_velocity;\r\n#endif\r\n\r\n#ifdef D_a_particle_color\r\n    attribute vec4 a_particle_color;\r\n    varying vec4 v_particle_color;\r\n#endif\r\n\r\nuniform float u_particleTime;\r\n\r\n#ifdef D_u_particle_acceleration\r\n    uniform vec3 u_particle_acceleration;\r\n#endif\r\n\r\nvoid main(void) {\r\n\r\n    vec3 position = a_position;\r\n\r\n    float pTime = u_particleTime - a_particle_birthTime;\r\n    if(pTime > 0.0){\r\n\r\n        vec3 pPosition = vec3(0.0,0.0,0.0);\r\n        vec3 pVelocity = vec3(0.0,0.0,0.0);\r\n\r\n        #ifdef D_a_particle_position\r\n            pPosition = pPosition + a_particle_position;\r\n        #endif\r\n\r\n        #ifdef D_a_particle_velocity\r\n            pVelocity = pVelocity + a_particle_velocity;\r\n        #endif\r\n\r\n        #ifdef D_u_particle_acceleration\r\n            pVelocity = pVelocity + u_particle_acceleration * pTime;\r\n        #endif\r\n        \r\n        #ifdef D_a_particle_color\r\n            v_particle_color = a_particle_color;\r\n        #endif\r\n\r\n        pPosition = pPosition + pVelocity * pTime;\r\n        position = position + pPosition;\r\n    }\r\n    \r\n    vec4 globalPosition = u_modelMatrix * vec4(position, 1.0);\r\n    gl_Position = u_viewProjection * globalPosition;\r\n    gl_PointSize = 1.0;\r\n}",
	"shaders/point.fragment.glsl": "\r\n\r\nprecision mediump float;\r\n\r\n\r\n\r\nvoid main(void) {\r\n   \r\n    gl_FragColor = vec4(1.0,1.0,1.0,1.0);\r\n}\r\n",
	"shaders/point.vertex.glsl": "\r\n\r\nattribute vec3 a_position;\r\n\r\nuniform float u_PointSize;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvoid main(void) {\r\n\r\n    vec4 globalPosition = u_modelMatrix * vec4(a_position, 1.0);\r\n    gl_Position = u_viewProjection * globalPosition;\r\n    gl_PointSize = u_PointSize;\r\n}",
	"shaders/postEffect/fxaa.fragment.glsl": "\r\n\r\n#define FXAA_REDUCE_Mvarying   (1.0/128.0)\r\n#define FXAA_REDUCE_MUL   (1.0/8.0)\r\n#define FXAA_SPAN_MAX     8.0\r\n\r\nvarying vec2 vUV;\r\nuniform sampler2D textureSampler;\r\nuniform vec2 texelSize;\r\n\r\n\r\n\r\nvoid main(){\r\n\tvec2 localTexelSize = texelSize;\r\n\tvec4 rgbNW = texture2D(textureSampler, (vUV + vec2(-1.0, -1.0) * localTexelSize));\r\n\tvec4 rgbNE = texture2D(textureSampler, (vUV + vec2(1.0, -1.0) * localTexelSize));\r\n\tvec4 rgbSW = texture2D(textureSampler, (vUV + vec2(-1.0, 1.0) * localTexelSize));\r\n\tvec4 rgbSE = texture2D(textureSampler, (vUV + vec2(1.0, 1.0) * localTexelSize));\r\n\tvec4 rgbM = texture2D(textureSampler, vUV);\r\n\tvec4 luma = vec4(0.299, 0.587, 0.114, 1.0);\r\n\tfloat lumaNW = dot(rgbNW, luma);\r\n\tfloat lumaNE = dot(rgbNE, luma);\r\n\tfloat lumaSW = dot(rgbSW, luma);\r\n\tfloat lumaSE = dot(rgbSE, luma);\r\n\tfloat lumaM = dot(rgbM, luma);\r\n\tfloat lumaMvarying = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\r\n\tfloat lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\r\n\r\n\tvec2 dir = vec2(-((lumaNW + lumaNE) - (lumaSW + lumaSE)), ((lumaNW + lumaSW) - (lumaNE + lumaSE)));\r\n\r\n\tfloat dirReduce = max(\r\n\t\t(lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL),\r\n\t\tFXAA_REDUCE_MIN);\r\n\r\n\tfloat rcpDirMvarying = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\r\n\tdir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),\r\n\t\tmax(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),\r\n\t\tdir * rcpDirMin)) * localTexelSize;\r\n\r\n\tvec4 rgbA = 0.5 * (\r\n\t\ttexture2D(textureSampler, vUV + dir * (1.0 / 3.0 - 0.5)) +\r\n\t\ttexture2D(textureSampler, vUV + dir * (2.0 / 3.0 - 0.5)));\r\n\r\n\tvec4 rgbB = rgbA * 0.5 + 0.25 * (\r\n\t\ttexture2D(textureSampler, vUV + dir *  -0.5) +\r\n\t\ttexture2D(textureSampler, vUV + dir * 0.5));\r\n\tfloat lumaB = dot(rgbB, luma);\r\n\tif ((lumaB < lumaMin) || (lumaB > lumaMax)) {\r\n\t\tgl_FragColor = rgbA;\r\n\t}\r\n\telse {\r\n\t\tgl_FragColor = rgbB;\r\n\t}\r\n}",
	"shaders/segment.fragment.glsl": "\r\nprecision mediump float;\r\n\r\nvarying vec4 v_color;\r\n\r\n\r\n\r\nvoid main(void) {\r\n    gl_FragColor = v_color;\r\n}",
	"shaders/segment.vertex.glsl": "\r\n\r\nattribute vec3 a_position;\r\nattribute vec4 a_color;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvarying vec4 v_color;\r\n\r\nvoid main(void) {\r\n    gl_Position = u_viewProjection * u_modelMatrix * vec4(a_position, 1.0);\r\n    v_color = a_color;\r\n}",
	"shaders/shadow.fragment.glsl": "precision mediump float;\r\n\r\nvoid main() {\r\n    const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);\r\n    const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);\r\n    vec4 rgbaDepth = fract(gl_FragCoord.z * bitShift); // Calculate the value stored into each byte\r\n    rgbaDepth -= rgbaDepth.gbaa * bitMask; // Cut off the value which do not fit in 8 bits\r\n    gl_FragColor = rgbaDepth;\r\n}",
	"shaders/shadow.vertex.glsl": "attribute vec3 a_position;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvoid main(void) {\r\n\r\n    vec4 globalPosition = u_modelMatrix * vec4(a_position, 1.0);\r\n    gl_Position = u_viewProjection * globalPosition;\r\n}",
	"shaders/skybox.fragment.glsl": "\r\n\r\nprecision highp float;\r\n\r\nuniform samplerCube s_skyboxTexture;\r\nuniform mat4 u_cameraMatrix;\r\n\r\nvarying vec3 v_worldPos;\r\n\r\n\r\n\r\nvoid main(){\r\n    vec3 viewDir = normalize(v_worldPos - u_cameraMatrix[3].xyz);\r\n    gl_FragColor = textureCube(s_skyboxTexture, viewDir);\r\n}",
	"shaders/skybox.vertex.glsl": "\r\n\r\nattribute vec3 a_position;\r\n\r\nuniform mat4 u_cameraMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nuniform float u_skyBoxSize;\r\n\r\nvarying vec3 v_worldPos;\r\n\r\nvoid main(){\r\n    vec3 worldPos = a_position.xyz * u_skyBoxSize + u_cameraMatrix[3].xyz;\r\n    gl_Position = u_viewProjection * vec4(worldPos.xyz,1.0);\r\n    v_worldPos = worldPos;\r\n}",
	"shaders/standard.fragment.glsl": "\r\nprecision mediump float;\r\n\r\n//此处将填充宏定义\r\n#define macros\r\n\r\nvarying vec2 v_uv;\r\nvarying vec3 v_globalPosition;\r\nvarying vec3 v_normal;\r\n\r\n#ifdef HAS_NORMAL_SAMPLER\r\n    varying vec3 v_tangent;\r\n    varying vec3 v_bitangent;\r\n#endif\r\n\r\nuniform mat4 u_cameraMatrix;\r\n\r\n\r\nuniform float u_alphaThreshold;\r\n//漫反射\r\nuniform vec4 u_diffuse;\r\n#ifdef HAS_DIFFUSE_SAMPLER\r\n    uniform sampler2D s_diffuse;\r\n#endif\r\n\r\n//法线贴图\r\n#ifdef HAS_NORMAL_SAMPLER\r\n    uniform sampler2D s_normal;\r\n#endif\r\n\r\n//镜面反射\r\nuniform vec3 u_specular;\r\nuniform float u_glossiness;\r\n#ifdef HAS_SPECULAR_SAMPLER\r\n    uniform sampler2D s_specular;\r\n#endif\r\n\r\n//环境\r\nuniform vec4 u_ambient;\r\n#ifdef HAS_AMBIENT_SAMPLER\r\n    uniform sampler2D s_ambient;\r\n#endif\r\n\r\n#ifdef IS_POINTS_MODE\r\n    uniform float u_PointSize;\r\n#endif\r\n\r\n#ifdef HAS_TERRAIN_METHOD\r\n    #include<terrain.fragment>\r\n#endif\r\n\r\n#include<modules/pointLightShading.fragment>\r\n\r\n#ifdef HAS_FOG_METHOD\r\n    #include<modules/fog.fragment>\r\n#endif\r\n\r\n#ifdef HAS_ENV_METHOD\r\n    #include<modules/envmap.fragment>\r\n#endif\r\n\r\nvoid main(void) {\r\n\r\n    vec4 finalColor = vec4(1.0,1.0,1.0,1.0);\r\n\r\n    //获取法线\r\n    vec3 normal;\r\n    #ifdef HAS_NORMAL_SAMPLER\r\n        normal = texture2D(s_normal,v_uv).xyz * 2.0 - 1.0;\r\n        normal = normalize(normal.x * v_tangent + normal.y * v_bitangent + normal.z * v_normal);\r\n    #else\r\n        normal = normalize(v_normal);\r\n    #endif\r\n\r\n    //获取漫反射基本颜色\r\n    vec4 diffuseColor = u_diffuse;\r\n    #ifdef HAS_DIFFUSE_SAMPLER\r\n        diffuseColor = diffuseColor * texture2D(s_diffuse, v_uv);\r\n    #endif\r\n\r\n    if(diffuseColor.w < u_alphaThreshold)\r\n    {\r\n        discard;\r\n    }\r\n\r\n    #ifdef HAS_TERRAIN_METHOD\r\n        diffuseColor = terrainMethod(diffuseColor, v_uv);\r\n    #endif\r\n\r\n    //环境光\r\n    vec3 ambientColor = u_ambient.w * u_ambient.xyz;\r\n    #ifdef HAS_AMBIENT_SAMPLER\r\n        ambientColor = ambientColor * texture2D(s_ambient, v_uv).xyz;\r\n    #endif\r\n\r\n    finalColor = diffuseColor;\r\n\r\n    //渲染灯光\r\n    // #if NUM_LIGHT > 0\r\n\r\n        //获取高光值\r\n        float glossiness = u_glossiness;\r\n        //获取镜面反射基本颜色\r\n        vec3 specularColor = u_specular;\r\n        #ifdef HAS_SPECULAR_SAMPLER\r\n            vec4 specularMapColor = texture2D(s_specular, v_uv);\r\n            specularColor.xyz = specularMapColor.xyz;\r\n            glossiness = glossiness * specularMapColor.w;\r\n        #endif\r\n        \r\n        finalColor.xyz = pointLightShading(normal, diffuseColor.xyz, specularColor, ambientColor, glossiness);\r\n    // #endif\r\n\r\n    #ifdef HAS_ENV_METHOD\r\n        finalColor = envmapMethod(finalColor);\r\n    #endif\r\n\r\n    #ifdef HAS_FOG_METHOD\r\n        finalColor.xyz = fogMethod(finalColor.xyz);\r\n    #endif\r\n\r\n    gl_FragColor = finalColor;\r\n\r\n    #ifdef IS_POINTS_MODE\r\n        gl_PointSize = u_PointSize;\r\n    #endif\r\n}",
	"shaders/standard.vertex.glsl": "//此处将填充宏定义\r\n#define macros\r\n\r\n//坐标属性\r\nattribute vec3 a_position;\r\nattribute vec2 a_uv;\r\nattribute vec3 a_normal;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvarying vec2 v_uv;\r\nvarying vec3 v_globalPosition;\r\nvarying vec3 v_normal;\r\n\r\n#ifdef HAS_NORMAL_SAMPLER\r\n    attribute vec3 a_tangent;\r\n\r\n    varying vec3 v_tangent;\r\n    varying vec3 v_bitangent;\r\n#endif\r\n\r\n#ifdef HAS_SKELETON_ANIMATION\r\n    #include<modules/skeleton.vertex>\r\n#endif\r\n\r\nvoid main(void) {\r\n\r\n    vec4 position = vec4(a_position,1.0);\r\n\r\n    #ifdef HAS_SKELETON_ANIMATION\r\n        position = skeletonAnimation(position);\r\n    #endif\r\n\r\n    //获取全局坐标\r\n    vec4 globalPosition = u_modelMatrix * position;\r\n    //计算投影坐标\r\n    gl_Position = u_viewProjection * globalPosition;\r\n    //输出全局坐标\r\n    v_globalPosition = globalPosition.xyz;\r\n    //输出uv\r\n    v_uv = a_uv;\r\n\r\n    //计算法线\r\n    v_normal = normalize((u_modelMatrix * vec4(a_normal,0.0)).xyz);\r\n    #ifdef HAS_NORMAL_SAMPLER\r\n        v_tangent = normalize((u_modelMatrix * vec4(a_tangent,0.0)).xyz);\r\n        v_bitangent = cross(v_normal,v_tangent);\r\n    #endif\r\n}",
	"shaders/terrain.fragment.1.glsl": "\r\n\r\nprecision mediump float;\r\n\r\nuniform sampler2D s_texture;\r\nuniform sampler2D s_blendTexture;\r\nuniform sampler2D s_splatTexture1;\r\nuniform sampler2D s_splatTexture2;\r\nuniform sampler2D s_splatTexture3;\r\n\r\nuniform vec4 u_splatRepeats;\r\n\r\nvarying vec2 v_uv;\r\n\r\n\r\n\r\nvoid main(void) {\r\n\r\n    vec2 t_uv = v_uv.xy * u_splatRepeats.x;\r\n    // vec4 finalColor = texture2D(s_texture,t_uv);\r\n    vec4 finalColor = vec4(0.0, 0.0, 0.0, 0.0);\r\n    \r\n    vec4 blend = texture2D(s_blendTexture,v_uv);\r\n\r\n    // float offset = 1.0/512.0;\r\n    // float offset = 0.000000001;\r\n    float offset = 1.0 / 1024.0;\r\n   float width = 0.5 - offset * 2.0;\r\n\r\n    // float offset = 0.0;\r\n    //  float width = 0.5;\r\n     \r\n\r\n    t_uv = v_uv.xy * u_splatRepeats.y;\r\n    t_uv.x = fract(t_uv.x);\r\n    t_uv.y = fract(t_uv.y);\r\n    t_uv.x = t_uv.x * width + offset;\r\n    t_uv.y = t_uv.y * width + offset;\r\n    vec4 tColor = texture2D(s_splatTexture1,t_uv);\r\n    finalColor = (tColor - finalColor) * blend.x + finalColor;\r\n\r\n    t_uv = v_uv.xy * u_splatRepeats.z;\r\n    t_uv.x = fract(t_uv.x);\r\n    t_uv.y = fract(t_uv.y);\r\n    t_uv.x = t_uv.x * width + offset + 0.5;\r\n    t_uv.y = t_uv.y * width + offset;\r\n    tColor = texture2D(s_splatTexture1,t_uv);\r\n    finalColor = (tColor - finalColor) * blend.y + finalColor;\r\n\r\n    t_uv = v_uv.xy * u_splatRepeats.w;\r\n    t_uv.x = fract(t_uv.x);\r\n    t_uv.y = fract(t_uv.y);\r\n    t_uv.x = t_uv.x * width + offset;\r\n    t_uv.y = t_uv.y * width + offset + 0.5;\r\n    tColor = texture2D(s_splatTexture1,t_uv);\r\n    finalColor = (tColor - finalColor) * blend.z + finalColor;\r\n\r\n    gl_FragColor = finalColor;\r\n}",
	"shaders/terrain.fragment.glsl": "#ifdef USE_TERRAIN_MERGE\r\n    uniform sampler2D s_splatMergeTexture;\r\n#else\r\n    uniform sampler2D s_splatTexture1;\r\n    uniform sampler2D s_splatTexture2;\r\n    uniform sampler2D s_splatTexture3;\r\n#endif\r\n\r\nuniform sampler2D s_blendTexture;\r\nuniform vec4 u_splatRepeats;\r\n\r\n#ifdef USE_TERRAIN_MERGE\r\nvec4 terrainBlendMerge(vec4 diffuseColor,vec2 v_uv) {\r\n    \r\n    vec4 blend = texture2D(s_blendTexture,v_uv);\r\n\r\n    // float offset = 1.0/512.0;\r\n    // float offset = 0.000000001;\r\n    // float offset = 1.0 / 1024.0;\r\n    // float width = 0.5 - offset * 2.0;\r\n\r\n    float offset = 0.0;\r\n    float width = 0.5;\r\n     \r\n\r\n    vec2 t_uv = v_uv.xy * u_splatRepeats.y;\r\n    t_uv.x = fract(t_uv.x);\r\n    t_uv.y = fract(t_uv.y);\r\n    t_uv.x = t_uv.x * width + offset;\r\n    t_uv.y = t_uv.y * width + offset;\r\n    vec4 tColor = texture2D(s_splatMergeTexture,t_uv);\r\n    diffuseColor = (tColor - diffuseColor) * blend.x + diffuseColor;\r\n\r\n    t_uv = v_uv.xy * u_splatRepeats.z;\r\n    t_uv.x = fract(t_uv.x);\r\n    t_uv.y = fract(t_uv.y);\r\n    t_uv.x = t_uv.x * width + offset + 0.5;\r\n    t_uv.y = t_uv.y * width + offset;\r\n    tColor = texture2D(s_splatMergeTexture,t_uv);\r\n    diffuseColor = (tColor - diffuseColor) * blend.y + diffuseColor;\r\n\r\n    t_uv = v_uv.xy * u_splatRepeats.w;\r\n    t_uv.x = fract(t_uv.x);\r\n    t_uv.y = fract(t_uv.y);\r\n    t_uv.x = t_uv.x * width + offset;\r\n    t_uv.y = t_uv.y * width + offset + 0.5;\r\n    tColor = texture2D(s_splatMergeTexture,t_uv);\r\n    diffuseColor = (tColor - diffuseColor) * blend.z + diffuseColor;\r\n\r\n    return diffuseColor;\r\n}\r\n#else\r\nvec4 terrainBlend(vec4 diffuseColor,vec2 v_uv) {\r\n\r\n    vec4 blend = texture2D(s_blendTexture,v_uv);\r\n\r\n    vec2 t_uv = v_uv.xy * u_splatRepeats.y;\r\n    vec4 tColor = texture2D(s_splatTexture1,t_uv);\r\n    diffuseColor = (tColor - diffuseColor) * blend.x + diffuseColor;\r\n\r\n    t_uv = v_uv.xy * u_splatRepeats.z;\r\n    tColor = texture2D(s_splatTexture2,t_uv);\r\n    diffuseColor = (tColor - diffuseColor) * blend.y + diffuseColor;\r\n\r\n    t_uv = v_uv.xy * u_splatRepeats.w;\r\n    tColor = texture2D(s_splatTexture3,t_uv);\r\n    diffuseColor = (tColor - diffuseColor) * blend.z + diffuseColor;\r\n    return diffuseColor;\r\n}\r\n#endif\r\n\r\nvec4 terrainMethod(vec4 diffuseColor,vec2 v_uv) {\r\n    #ifdef USE_TERRAIN_MERGE\r\n        diffuseColor = terrainBlendMerge(diffuseColor,v_uv);\r\n    #else\r\n        diffuseColor = terrainBlend(diffuseColor,v_uv);\r\n    #endif\r\n\r\n    return diffuseColor;\r\n}",
	"shaders/terrain.vertex.glsl": "\r\n\r\nattribute vec3 a_position;\r\nattribute vec2 a_uv;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvarying vec2 v_uv;\r\n\r\nvoid main(void) {\r\n\r\n    gl_Position = u_viewProjection * u_modelMatrix * vec4(a_position, 1.0);\r\n\r\n    v_uv = a_uv;\r\n}",
	"shaders/texture.fragment.glsl": "\r\n\r\nprecision mediump float;\r\n\r\nuniform sampler2D s_texture;\r\nvarying vec2 v_uv;\r\n\r\n\r\n\r\nvoid main(void) {\r\n\r\n    gl_FragColor = texture2D(s_texture, v_uv);\r\n}\r\n",
	"shaders/texture.vertex.glsl": "\r\n\r\nattribute vec3 a_position;\r\nattribute vec2 a_uv;\r\n\r\nvarying vec2 v_uv;\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvoid main(void) {\r\n\r\n    gl_Position = u_viewProjection * u_modelMatrix * vec4(a_position, 1.0);\r\n    v_uv = a_uv;\r\n}"
}
}