namespace feng3d
{
	/**
	 * 漫反射函数
	 * @author feng 2017-03-22
	 */
    export class AmbientMethod extends RenderDataHolder
    {
        /**
         * 环境纹理
         */
        public get ambientTexture()
        {
            return this._ambientTexture;
        }
        public set ambientTexture(value)
        {
            if (this.ambientTexture)
                this.ambientTexture.removeEventListener(Event.LOADED, this.invalidateRenderData, this);
            this._ambientTexture = value;
            if (this.ambientTexture)
                this.ambientTexture.addEventListener(Event.LOADED, this.invalidateRenderData, this);
            this.invalidateRenderData();
            this.invalidateShader();
        }
        private _ambientTexture: Texture2D;

        /**
         * 颜色
         */
        public get color()
        {
            return this._color;
        }
        public set color(value)
        {
            this._color = value;
            this.invalidateRenderData();
        }
        private _color: Color;

        /**
         * 构建
         */
        constructor(ambientUrl = "", color: Color = null)
        {
            super();
            this.ambientTexture = new Texture2D(ambientUrl);
            this.color = color || new Color();
        }

        /**
		 * 更新渲染数据
		 */
        public updateRenderData(renderContext: RenderContext, renderData: RenderAtomic)
        {
            this.createUniformData("u_ambient",this._color);
            this.createUniformData("s_ambient",this._ambientTexture);
            //
            super.updateRenderData(renderContext, renderData);
        }

		/**
		 * 更新渲染数据
		 */
        public updateRenderShader(renderContext: RenderContext, renderData: RenderAtomic)
        {
            renderData.shader.addMacro(this.createBoolMacro("HAS_AMBIENT_SAMPLER", this.ambientTexture.checkRenderData()));
        }
    }
}