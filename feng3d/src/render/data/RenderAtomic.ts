namespace feng3d
{
    export class RenderData
    {
        // public static createIndexBuffer(indices: Uint16Array)
        // {
        //     return new IndexRenderData(indices);
        // }

        // public static createUniformData<K extends keyof UniformRenderData>(name: K, data: UniformRenderData[K])
        // {
        //     return new UniformData(name, data);
        // }

        // public static createAttributeRenderData<K extends keyof AttributeRenderDataStuct>(name: K, data: Float32Array = null, stride: number = 3, divisor: number = 0)
        // {
        //     return new AttributeRenderData(name, data, stride);
        // }

        // public static createShaderCode(vertexCode: string, fragmentCode: string)
        // {
        //     return new ShaderCode(vertexCode, fragmentCode);
        // }

        // public static createValueMacro<K extends keyof ValueMacros>(name: K, value: number): ValueMacro
        // {
        //     return { type: MacroType.value, name: name, value: value };
        // }

        // public static createBoolMacro<K extends keyof BoolMacros>(name: K, value: boolean): BoolMacro
        // {
        //     return { type: MacroType.bool, name: name, value: value };
        // }

        // public static createAddMacro<K extends keyof IAddMacros>(name: K, value: number): AddMacro
        // {
        //     return { type: MacroType.add, name: name, value: value };
        // }
    }

    /**
     * 渲染原子（该对象会收集一切渲染所需数据以及参数）
     * @author feng 2016-06-20
     */
    export class RenderAtomic
    {
        public addUniform(uniformData: UniformData)
        {
            this.uniforms[uniformData.name] = uniformData;
        }

        public removeUniform(uniformData: UniformData)
        {
            delete this.uniforms[uniformData.name];
        }

        public addAttribute(attributeData: AttributeRenderData)
        {
            this.attributes[attributeData.name] = attributeData;
        }

        public removeAttribute(attributeData: AttributeRenderData)
        {
            delete this.attributes[attributeData.name];
        }

        public setIndexBuffer(indexBuffer: IndexRenderData)
        {
            this.indexBuffer = indexBuffer;
        }

        /**
         * 顶点索引缓冲
         */
        private indexBuffer: IndexRenderData;

        /**
         * 渲染程序
         */
        public shader = new ShaderRenderData();

        /**
         * 属性数据列表
         */
        private attributes: AttributeRenderDataStuct = <any>{};

        /**
         * Uniform渲染数据
         */
        private uniforms: UniformRenderData = <any>{};

        /**
         * 渲染实例数量
         */
        public instanceCount: number;

        constructor() { }

        public invalidateShader()
        {
            this.shader.invalidate();
        }

        /**
         * 激活属性
         */
        public activeAttributes(gl: GL, attributeInfos: WebGLActiveInfo[])
        {
            for (var i = 0; i < attributeInfos.length; i++)
            {
                var activeInfo = attributeInfos[i];
                var buffer: AttributeRenderData = this.attributes[activeInfo.name];
                buffer.active(gl, activeInfo.location);
            }
        }

        /**
         * 激活常量
         */
        public activeUniforms(gl: GL, uniformInfos: WebGLActiveInfo[])
        {
            for (var o = 0; o < uniformInfos.length; o++)
            {
                var activeInfo = uniformInfos[o];
                if (activeInfo.uniformBaseName)
                {
                    var baseName = activeInfo.uniformBaseName;
                    var uniformData = this.uniforms[baseName];
                    if (uniformData instanceof UniformData)
                    {
                        uniformData = uniformData.data;
                    }
                    if (uniformData instanceof Function)
                    {
                        uniformData = uniformData();
                    }
                    //处理数组
                    for (var j = 0; j < activeInfo.size; j++)
                    {
                        this.setContext3DUniform(gl, { name: baseName + `[${j}]`, type: activeInfo.type, uniformLocation: activeInfo.uniformLocation[j], textureID: activeInfo.textureID }, uniformData[j]);
                    }
                } else
                {
                    var uniformData = this.uniforms[activeInfo.name];
                    if (uniformData instanceof UniformData)
                    {
                        uniformData = uniformData.data;
                    }
                    if (uniformData instanceof Function)
                    {
                        uniformData = uniformData();
                    }
                    this.setContext3DUniform(gl, activeInfo, uniformData);
                }
            }
        }

        /**
         * 设置环境Uniform数据
         */
        private setContext3DUniform(gl: GL, activeInfo: { name: string; uniformLocation: WebGLUniformLocation, type: number; textureID: number }, data)
        {
            var location = activeInfo.uniformLocation;
            switch (activeInfo.type)
            {
                case GL.INT:
                    gl.uniform1i(location, data);
                    break;
                case GL.FLOAT_MAT4:
                    gl.uniformMatrix4fv(location, false, data.rawData);
                    break;
                case GL.FLOAT:
                    gl.uniform1f(location, data);
                    break;
                case GL.FLOAT_VEC2:
                    gl.uniform2f(location, data.x, data.y);
                    break;
                case GL.FLOAT_VEC3:
                    gl.uniform3f(location, data.x, data.y, data.z);
                    break;
                case GL.FLOAT_VEC4:
                    gl.uniform4f(location, data.x, data.y, data.z, data.w);
                    break;
                case GL.SAMPLER_2D:
                case GL.SAMPLER_CUBE:
                    var textureInfo = <TextureInfo>data;
                    //激活纹理编号
                    gl.activeTexture(GL["TEXTURE" + activeInfo.textureID]);
                    textureInfo.active(gl);
                    //设置纹理所在采样编号
                    gl.uniform1i(location, activeInfo.textureID);
                    break;
                default:
                    throw `无法识别的uniform类型 ${activeInfo.name} ${data}`;
            }
        }

        /**
         */
        public dodraw(gl: GL)
        {
            var instanceCount = ~~this.instanceCount;
            var indexBuffer = this.indexBuffer;
            var shaderParams = this.shader.shaderParams;

            indexBuffer.active(gl);

            var renderMode = shaderParams.renderMode;
            if (instanceCount > 1)
            {
                gl.drawElementsInstanced(renderMode, indexBuffer.count, indexBuffer.type, indexBuffer.offset, instanceCount);
            }
            else
            {
                gl.drawElements(renderMode, indexBuffer.count, indexBuffer.type, indexBuffer.offset);
            }
        }
    }

    export class Object3DRenderAtomic extends RenderAtomic
    {
        /**
         * 数据是否失效，需要重新收集数据
         */
        public static INVALIDATE = "invalidate";
        /**
         * 渲染拥有者失效，需要重新收集渲染数据拥有者
         */
        public static INVALIDATE_RENDERHOLDER = "invalidateRenderHolder";
        /**
         * shader失效，需要重新收集shader数据
         */
        public static INVALIDATE_SHADER = "invalidateShader";

        private _invalidateRenderDataHolderList: RenderDataHolder[] = [];
        private _invalidateShaderList: RenderDataHolder[] = [];
        public renderHolderInvalid = true;

        private onInvalidate(event: Event)
        {
            var renderDataHolder = <RenderDataHolder>event.target;
            this.addInvalidateHolders(renderDataHolder);
        }

        private onInvalidateShader(event: Event)
        {
            var renderDataHolder = <RenderDataHolder>event.target;
            this.addInvalidateShader(renderDataHolder);
        }

        private onInvalidateRenderHolder()
        {
            this.renderHolderInvalid = true;
        }

        private addInvalidateHolders(renderDataHolder: RenderDataHolder)
        {
            if (this._invalidateRenderDataHolderList.indexOf(renderDataHolder) == -1)
            {
                this._invalidateRenderDataHolderList.push(renderDataHolder)
            }
        }

        private addInvalidateShader(renderDataHolder: RenderDataHolder)
        {
            if (this._invalidateShaderList.indexOf(renderDataHolder) == -1)
            {
                this._invalidateShaderList.push(renderDataHolder)
            }
        }

        private renderDataHolders: RenderDataHolder[] = [];
        private updateEverytimeList: RenderDataHolder[] = [];

        public addRenderDataHolder(renderDataHolder: RenderDataHolder)
        {
            this.renderDataHolders.push(renderDataHolder);
            if (renderDataHolder.updateEverytime)
            {
                this.updateEverytimeList.push(renderDataHolder);
            }
            this.addInvalidateHolders(renderDataHolder);
            this.addInvalidateShader(renderDataHolder);
            renderDataHolder.addEventListener(Object3DRenderAtomic.INVALIDATE, this.onInvalidate, this)
            renderDataHolder.addEventListener(Object3DRenderAtomic.INVALIDATE_SHADER, this.onInvalidateShader, this)
            renderDataHolder.addEventListener(Object3DRenderAtomic.INVALIDATE_RENDERHOLDER, this.onInvalidateRenderHolder, this)
        }

        public update(renderContext: RenderContext)
        {
            renderContext.updateRenderData1(this);
            if (this.updateEverytimeList.length > 0)
            {
                this.updateEverytimeList.forEach(element =>
                {
                    element.updateRenderData(renderContext, this);
                });
            }
            if (this._invalidateRenderDataHolderList.length > 0)
            {
                this._invalidateRenderDataHolderList.forEach(element =>
                {
                    element.updateRenderData(renderContext, this);
                });
                this._invalidateRenderDataHolderList.length = 0;
            }
            //
            if (this._invalidateShaderList.length > 0)
            {
                this._invalidateShaderList.forEach(element =>
                {
                    element.updateRenderShader(renderContext, this);
                });
                this.invalidateShader();
                this._invalidateShaderList.length = 0;
            }
        }

        public clear()
        {
            this.renderDataHolders.forEach(element =>
            {
                element.removeEventListener(Object3DRenderAtomic.INVALIDATE, this.onInvalidate, this)
                element.removeEventListener(Object3DRenderAtomic.INVALIDATE_SHADER, this.onInvalidateShader, this)
                element.removeEventListener(Object3DRenderAtomic.INVALIDATE_RENDERHOLDER, this.onInvalidateRenderHolder, this)
            });

            this.renderDataHolders.length = 0;
            this.updateEverytimeList.length = 0;
        }
    }
}