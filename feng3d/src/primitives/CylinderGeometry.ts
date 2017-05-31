module feng3d
{

    /**
     * 圆柱体几何体
     * @author DawnKing 2016-09-12
     */
    export class CylinderGeometry extends Geometry
    {
        public get topRadius()
        {
            return this._topRadius;
        }
        public set topRadius(value)
        {
            if(this._topRadius == value)
                return;
            this._topRadius = value;
            this.invalidateGeometry();
        }
        private _topRadius = 50;
        
        public get bottomRadius()
        {
            return this._bottomRadius;
        }
        public set bottomRadius(value)
        {
            if(this._bottomRadius == value)
                return;
            this._bottomRadius = value;
            this.invalidateGeometry();
        }
        private _bottomRadius = 50;

        public get height()
        {
            return this._height;
        }
        public set height(value)
        {
            if(this._height == value)
                return;
            this._height = value;
            this.invalidateGeometry();
        }
        private _height = 100;

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
        private _segmentsH = 1;

        public get topClosed()
        {
            return this._topClosed;
        }
        public set topClosed(value)
        {
            if(this._topClosed == value)
                return;
            this._topClosed = value;
            this.invalidateGeometry();
        }
        private _topClosed = true;

        public get bottomClosed()
        {
            return this._bottomClosed;
        }
        public set bottomClosed(value)
        {
            if(this._bottomClosed == value)
                return;
            this._bottomClosed = value;
            this.invalidateGeometry();
        }
        private _bottomClosed = true;

        public get surfaceClosed()
        {
            return this._surfaceClosed;
        }
        public set surfaceClosed(value)
        {
            if(this._surfaceClosed == value)
                return;
            this._surfaceClosed = value;
            this.invalidateGeometry();
        }
        private _surfaceClosed = true;

        public get yUp()
        {
            return this._yUp;
        }
        public set yUp(value)
        {
            if(this._yUp == value)
                return;
            this._yUp = value;
            this.invalidateGeometry();
        }
        private _yUp = true;

        /**
         * 创建圆柱体
         */
        constructor(topRadius = 50, bottomRadius = 50, height = 100, segmentsW = 16, segmentsH = 1, topClosed = true, bottomClosed = true, surfaceClosed = true, yUp = true)
        {
            super();

            this.topRadius = topRadius;
            this.bottomRadius = bottomRadius;
            this.height = height;
            this.segmentsW = segmentsW;
            this.segmentsH = segmentsH;
            this.topClosed = topClosed;
            this.bottomClosed = bottomClosed;
            this.surfaceClosed = surfaceClosed;
            this.yUp = yUp;
        }

        /**
         * 计算几何体顶点数
         */
        private getNumVertices()
        {
            var numVertices: number = 0;
            if (this.surfaceClosed)
                numVertices += (this.segmentsH + 1) * (this.segmentsW + 1);
            if (this.topClosed)
                numVertices += 2 * (this.segmentsW + 1);
            if (this.bottomClosed)
                numVertices += 2 * (this.segmentsW + 1);
            return numVertices
        }

        /**
         * 计算几何体三角形数量
         */
        private getNumTriangles()
        {
            var numTriangles: number = 0;
            if (this.surfaceClosed)
                numTriangles += this.segmentsH * this.segmentsW * 2;
            if (this.topClosed)
                numTriangles += this.segmentsW;
            if (this.bottomClosed)
                numTriangles += this.segmentsW;
            return numTriangles;
        }

        /**
         * 构建几何体数据
         */
        protected buildGeometry()
        {
            var i: number, j: number, index: number = 0;
            var x: number, y: number, z: number, radius: number, revolutionAngle: number;
            var dr: number, latNormElev: number, latNormBase: number;

            var comp1: number, comp2: number;
            var startIndex: number = 0;
            var t1: number, t2: number;

            var numVertices: number = this.getNumVertices();

            var vertexPositionData = new Float32Array(numVertices * 3);
            var vertexNormalData = new Float32Array(numVertices * 3);
            var vertexTangentData = new Float32Array(numVertices * 3);

            var revolutionAngleDelta: number = 2 * Math.PI / this.segmentsW;

            // 顶部
            if (this.topClosed && this.topRadius > 0)
            {
                z = -0.5 * this.height;

                for (i = 0; i <= this.segmentsW; ++i)
                {
                    // 中心顶点
                    if (this.yUp)
                    {
                        t1 = 1;
                        t2 = 0;
                        comp1 = -z;
                        comp2 = 0;
                    }
                    else
                    {
                        t1 = 0;
                        t2 = -1;
                        comp1 = 0;
                        comp2 = z;
                    }

                    addVertex(0, comp1, comp2, 0, t1, t2, 1, 0, 0);

                    // 旋转顶点
                    revolutionAngle = i * revolutionAngleDelta;
                    x = this.topRadius * Math.cos(revolutionAngle);
                    y = this.topRadius * Math.sin(revolutionAngle);

                    if (this.yUp)
                    {
                        comp1 = -z;
                        comp2 = y;
                    }
                    else
                    {
                        comp1 = y;
                        comp2 = z;
                    }

                    if (i == this.segmentsW)
                    {
                        addVertex(vertexPositionData[startIndex + 3], vertexPositionData[startIndex + 4], vertexPositionData[startIndex + 5],
                            0, t1, t2, 1, 0, 0);
                    }
                    else
                    {
                        addVertex(x, comp1, comp2,
                            0, t1, t2, 1, 0, 0);
                    }
                }
            }

            // 底部
            if (this.bottomClosed && this.bottomRadius > 0)
            {
                z = 0.5 * this.height;
                startIndex = index;
                for (i = 0; i <= this.segmentsW; ++i)
                {
                    // 中心顶点
                    if (this.yUp)
                    {
                        t1 = -1;
                        t2 = 0;
                        comp1 = -z;
                        comp2 = 0;
                    }
                    else
                    {
                        t1 = 0;
                        t2 = 1;
                        comp1 = 0;
                        comp2 = z;
                    }

                    addVertex(0, comp1, comp2, 0, t1, t2, 1, 0, 0);

                    // 旋转顶点
                    revolutionAngle = i * revolutionAngle;
                    x = this.bottomRadius * Math.cos(revolutionAngle);
                    y = this.bottomRadius * Math.sin(revolutionAngle);

                    if (this.yUp)
                    {
                        comp1 = -z;
                        comp2 = y;
                    }
                    else
                    {
                        comp1 = y;
                        comp2 = z;
                    }

                    if (i == this.segmentsW)
                    {
                        addVertex(x, vertexPositionData[startIndex + 1], vertexPositionData[startIndex + 2],
                            0, t1, t2, 1, 0, 0);
                    }
                    else
                    {
                        addVertex(x, comp1, comp2,
                            0, t1, t2, 1, 0, 0);
                    }
                }
            }

            // 侧面
            dr = this.bottomRadius - this.topRadius;
            latNormElev = dr / this.height;
            latNormBase = (latNormElev == 0) ? 1 : this.height / dr;

            if (this.surfaceClosed)
            {
                var a: number, b: number, c: number, d: number;
                var na0: number, na1: number, naComp1: number, naComp2: number;

                for (j = 0; j <= this.segmentsH; ++j)
                {
                    radius = this.topRadius - ((j / this.segmentsH) * (this.topRadius - this.bottomRadius));
                    z = -(this.height / 2) + (j / this.segmentsH * this.height);

                    startIndex = index;
                    for (i = 0; i <= this.segmentsW; ++i)
                    {
                        revolutionAngle = i * revolutionAngleDelta;
                        x = radius * Math.cos(revolutionAngle);
                        y = radius * Math.sin(revolutionAngle);
                        na0 = latNormBase * Math.cos(revolutionAngle);
                        na1 = latNormBase * Math.sin(revolutionAngle);

                        if (this.yUp)
                        {
                            t1 = 0;
                            t2 = -na0;
                            comp1 = -z;
                            comp2 = y;
                            naComp1 = latNormElev;
                            naComp2 = na1;
                        }
                        else
                        {
                            t1 = -na0;
                            t2 = 0;
                            comp1 = y;
                            comp2 = z;
                            naComp1 = na1;
                            naComp2 = latNormElev;
                        }

                        if (i == this.segmentsW)
                        {
                            addVertex(vertexPositionData[startIndex], vertexPositionData[startIndex + 1], vertexPositionData[startIndex + 2],
                                na0, latNormElev, na1,
                                na1, t1, t2);
                        }
                        else
                        {
                            addVertex(x, comp1, comp2,
                                na0, naComp1, naComp2,
                                -na1, t1, t2);
                        }
                    }
                }
            }

            this.setVAData(GLAttribute.a_position, vertexPositionData, 3);
            this.setVAData(GLAttribute.a_normal, vertexNormalData, 3);
            this.setVAData(GLAttribute.a_tangent, vertexTangentData, 3);

            function addVertex(px: number, py: number, pz: number, nx: number, ny: number, nz: number, tx: number, ty: number, tz: number)
            {
                vertexPositionData[index] = px;
                vertexPositionData[index + 1] = py;
                vertexPositionData[index + 2] = pz;

                vertexNormalData[index] = nx;
                vertexNormalData[index + 1] = ny;
                vertexNormalData[index + 2] = nz;

                vertexTangentData[index] = tx;
                vertexTangentData[index + 1] = ty;
                vertexTangentData[index + 2] = tz;

                index += 3;
            }

            //
            var uvData = this.buildUVs();
            this.setVAData(GLAttribute.a_uv, uvData, 2);

            var indices = this.buildIndices();
            this.setIndices(indices);
        }

        /**
         * 构建顶点索引
         * @param segmentsW 横向分割数
         * @param segmentsH 纵向分割数
         * @param yUp 正面朝向 true:Y+ false:Z+
         */
        private buildIndices()
        {

            var i: number, j: number, index: number = 0;
            var numTriangles: number = this.getNumTriangles();

            var indices = new Uint16Array(numTriangles * 3);
            var numIndices = 0;
            // 顶部
            if (this.topClosed && this.topRadius > 0)
            {
                for (i = 0; i <= this.segmentsW; ++i)
                {
                    index += 2;
                    if (i > 0)
                        addTriangleClockWise(index - 1, index - 3, index - 2);
                }
            }

            // 底部
            if (this.bottomClosed && this.bottomRadius > 0)
            {
                for (i = 0; i <= this.segmentsW; ++i)
                {
                    index += 2;
                    if (i > 0)
                        addTriangleClockWise(index - 2, index - 3, index - 1);
                }
            }

            // 侧面
            if (this.surfaceClosed)
            {
                var a: number, b: number, c: number, d: number;
                for (j = 0; j <= this.segmentsH; ++j)
                {
                    for (i = 0; i <= this.segmentsW; ++i)
                    {
                        index++;
                        if (i > 0 && j > 0)
                        {
                            a = index - 1;
                            b = index - 2;
                            c = b - this.segmentsW - 1;
                            d = a - this.segmentsW - 1;

                            addTriangleClockWise(a, b, c);
                            addTriangleClockWise(a, c, d);
                        }
                    }
                }
            }

            return indices;

            function addTriangleClockWise(cwVertexIndex0: number, cwVertexIndex1: number, cwVertexIndex2: number)
            {
                indices[numIndices++] = cwVertexIndex0;
                indices[numIndices++] = cwVertexIndex1;
                indices[numIndices++] = cwVertexIndex2;
            }
        }

        /**
         * 构建uv
         * @param segmentsW 横向分割数
         * @param segmentsH 纵向分割数
         */
        private buildUVs()
        {
            var i: number, j: number;
            var x: number, y: number, revolutionAngle: number;
            var numVertices: number = this.getNumVertices()

            var data = new Float32Array(numVertices * 2);
            var revolutionAngleDelta: number = 2 * Math.PI / this.segmentsW;
            var index: number = 0;

            // 顶部
            if (this.topClosed)
            {
                for (i = 0; i <= this.segmentsW; ++i)
                {
                    revolutionAngle = i * revolutionAngleDelta;
                    x = 0.5 + 0.5 * -Math.cos(revolutionAngle);
                    y = 0.5 + 0.5 * Math.sin(revolutionAngle);

                    // 中心顶点
                    data[index++] = 0.5;
                    data[index++] = 0.5;
                    // 旋转顶点
                    data[index++] = x;
                    data[index++] = y;
                }
            }
            // 底部
            if (this.bottomClosed)
            {
                for (i = 0; i <= this.segmentsW; ++i)
                {
                    revolutionAngle = i * revolutionAngleDelta;
                    x = 0.5 + 0.5 * Math.cos(revolutionAngle);
                    y = 0.5 + 0.5 * Math.sin(revolutionAngle);

                    // 中心顶点
                    data[index++] = 0.5;
                    data[index++] = 0.5;
                    // 旋转顶点
                    data[index++] = x;
                    data[index++] = y;
                }
            }
            // 侧面
            if (this.surfaceClosed)
            {
                for (j = 0; j <= this.segmentsH; ++j)
                {
                    for (i = 0; i <= this.segmentsW; ++i)
                    {
                        // 旋转顶点
                        data[index++] = (i / this.segmentsW);
                        data[index++] = (j / this.segmentsH);
                    }
                }
            }

            return data;
        }
    }
}