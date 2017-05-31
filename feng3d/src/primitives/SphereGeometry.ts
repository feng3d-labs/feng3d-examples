module feng3d
{
    /**
     * 球体几何体
     * @author DawnKing 2016-09-12
     */
    export class SphereGeometry extends Geometry
    {
        public get radius()
        {
            return this._radius;
        }
        public set radius(value)
        {
            if(this._radius == value)
                return;
            this._radius = value;
            this.invalidateGeometry();
        }
        private _radius = 50;

        public get segmentsW()
        {
            return this._segmentsW;
        }
        public set segmentsW(value)
        {
            if(this._segmentsW == value)
                return;
            this._segmentsW = value;
            this.invalidateGeometry();
        }
        private _segmentsW = 16;

        public get segmentsH()
        {
            return this._segmentsH;
        }
        public set segmentsH(value)
        {
            if(this._segmentsH == value)
                return;
            this._segmentsH = value;
            this.invalidateGeometry();
        }
        private _segmentsH = 12;

        public get yUp()
        {
            return this.yUp;
        }
        public set yUp(value)
        {
            if(this.yUp == value)
                return;
            this.yUp = value;
            this.invalidateGeometry();
        }
        private _yUp = true;

        /**
         * 创建球形几何体
         * @param radius 球体半径
         * @param segmentsW 横向分割数
         * @param segmentsH 纵向分割数
         * @param yUp 正面朝向 true:Y+ false:Z+
         */
        constructor(radius = 50, segmentsW = 16, segmentsH = 12, yUp = true)
        {
            super();

            this.radius = radius;
            this.segmentsW = this.segmentsW;
            this.segmentsH = this.segmentsH;
            this.yUp = yUp;
        }

        /**
         * 构建几何体数据
         * @param this.radius 球体半径
         * @param this.segmentsW 横向分割数
         * @param this.segmentsH 纵向分割数
         * @param this.yUp 正面朝向 true:Y+ false:Z+
         */
        protected buildGeometry()
        {
            var vertexPositionData = new Float32Array((this.segmentsH + 1) * (this.segmentsW + 1) * 3);
            var vertexNormalData = new Float32Array((this.segmentsH + 1) * (this.segmentsW + 1) * 3);
            var vertexTangentData = new Float32Array((this.segmentsH + 1) * (this.segmentsW + 1) * 3);

            var startIndex: number;
            var index: number = 0;
            var comp1: number, comp2: number, t1: number, t2: number;
            for (var yi: number = 0; yi <= this.segmentsH; ++yi)
            {
                startIndex = index;

                var horangle: number = Math.PI * yi / this.segmentsH;
                var z: number = -this.radius * Math.cos(horangle);
                var ringradius: number = this.radius * Math.sin(horangle);

                for (var xi: number = 0; xi <= this.segmentsW; ++xi)
                {
                    var verangle: number = 2 * Math.PI * xi / this.segmentsW;
                    var x: number = ringradius * Math.cos(verangle);
                    var y: number = ringradius * Math.sin(verangle);
                    var normLen: number = 1 / Math.sqrt(x * x + y * y + z * z);
                    var tanLen: number = Math.sqrt(y * y + x * x);

                    if (this.yUp)
                    {
                        t1 = 0;
                        t2 = tanLen > .007 ? x / tanLen : 0;
                        comp1 = -z;
                        comp2 = y;
                    }
                    else
                    {
                        t1 = tanLen > .007 ? x / tanLen : 0;
                        t2 = 0;
                        comp1 = y;
                        comp2 = z;
                    }

                    if (xi == this.segmentsW)
                    {
                        vertexPositionData[index] = vertexPositionData[startIndex];
                        vertexPositionData[index + 1] = vertexPositionData[startIndex + 1];
                        vertexPositionData[index + 2] = vertexPositionData[startIndex + 2];

                        vertexNormalData[index] = vertexNormalData[startIndex] + x * normLen * 0.5;
                        vertexNormalData[index + 1] = vertexNormalData[startIndex + 1] + comp1 * normLen * 0.5;
                        vertexNormalData[index + 2] = vertexNormalData[startIndex + 2] + comp2 * normLen * 0.5;

                        vertexTangentData[index] = tanLen > .007 ? -y / tanLen : 1;
                        vertexTangentData[index + 1] = t1;
                        vertexTangentData[index + 2] = t2;
                    }
                    else
                    {
                        vertexPositionData[index] = x;
                        vertexPositionData[index + 1] = comp1;
                        vertexPositionData[index + 2] = comp2;

                        vertexNormalData[index] = x * normLen;
                        vertexNormalData[index + 1] = comp1 * normLen;
                        vertexNormalData[index + 2] = comp2 * normLen;

                        vertexTangentData[index] = tanLen > .007 ? -y / tanLen : 1;
                        vertexTangentData[index + 1] = t1;
                        vertexTangentData[index + 2] = t2;
                    }

                    if (xi > 0 && yi > 0)
                    {

                        if (yi == this.segmentsH)
                        {
                            vertexPositionData[index] = vertexPositionData[startIndex];
                            vertexPositionData[index + 1] = vertexPositionData[startIndex + 1];
                            vertexPositionData[index + 2] = vertexPositionData[startIndex + 2];
                        }
                    }

                    index += 3;
                }
            }

            this.setVAData(GLAttribute.a_position, vertexPositionData, 3);
            this.setVAData(GLAttribute.a_normal, vertexNormalData, 3);
            this.setVAData(GLAttribute.a_tangent, vertexTangentData, 3);

            var uvData = this.buildUVs();
            this.setVAData(GLAttribute.a_uv, uvData, 2);

            var indices = this.buildIndices();
            this.setIndices(indices);
        }

        /**
         * 构建顶点索引
         * @param this.segmentsW 横向分割数
         * @param this.segmentsH 纵向分割数
         * @param this.yUp 正面朝向 true:Y+ false:Z+
         */
        private buildIndices()
        {
            var indices = new Uint16Array(this.segmentsH * this.segmentsW * 6);

            var numIndices = 0;
            for (var yi: number = 0; yi <= this.segmentsH; ++yi)
            {
                for (var xi: number = 0; xi <= this.segmentsW; ++xi)
                {
                    if (xi > 0 && yi > 0)
                    {
                        var a: number = (this.segmentsW + 1) * yi + xi;
                        var b: number = (this.segmentsW + 1) * yi + xi - 1;
                        var c: number = (this.segmentsW + 1) * (yi - 1) + xi - 1;
                        var d: number = (this.segmentsW + 1) * (yi - 1) + xi;

                        if (yi == this.segmentsH)
                        {
                            indices[numIndices++] = a;
                            indices[numIndices++] = c;
                            indices[numIndices++] = d;
                        }
                        else if (yi == 1)
                        {
                            indices[numIndices++] = a;
                            indices[numIndices++] = b;
                            indices[numIndices++] = c;
                        }
                        else
                        {
                            indices[numIndices++] = a;
                            indices[numIndices++] = b;
                            indices[numIndices++] = c;
                            indices[numIndices++] = a;
                            indices[numIndices++] = c;
                            indices[numIndices++] = d;
                        }
                    }
                }
            }

            return indices;
        }

        /**
         * 构建uv
         * @param this.segmentsW 横向分割数
         * @param this.segmentsH 纵向分割数
         */
        private buildUVs()
        {
            var data = new Float32Array((this.segmentsH + 1) * (this.segmentsW + 1) * 2);
            var index: number = 0;

            for (var yi: number = 0; yi <= this.segmentsH; ++yi)
            {
                for (var xi: number = 0; xi <= this.segmentsW; ++xi)
                {
                    data[index++] = xi / this.segmentsW;
                    data[index++] = yi / this.segmentsH;
                }
            }

            return data;
        }
    }
}