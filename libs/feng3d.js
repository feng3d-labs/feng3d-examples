"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var feng3d;
(function (feng3d) {
    /**
     * 标记objectview对象界面类
     */
    function OVComponent(component) {
        return function (constructor) {
            component = component || constructor["name"];
            feng3d.objectview.OVComponent[component] = constructor;
        };
    }
    feng3d.OVComponent = OVComponent;
    /**
     * 标记objectview块界面类
     */
    function OBVComponent(component) {
        return function (constructor) {
            component = component || constructor["name"];
            feng3d.objectview.OBVComponent[component] = constructor;
        };
    }
    feng3d.OBVComponent = OBVComponent;
    /**
     * 标记objectview属性界面类
     */
    function OAVComponent(component) {
        return function (constructor) {
            component = component || constructor["name"];
            feng3d.objectview.OAVComponent[component] = constructor;
        };
    }
    feng3d.OAVComponent = OAVComponent;
    /**
     * objectview类装饰器
     */
    function ov(param) {
        return function (constructor) {
            if (!Object.getOwnPropertyDescriptor(constructor["prototype"], OBJECTVIEW_KEY))
                constructor["prototype"][OBJECTVIEW_KEY] = {};
            var objectview = constructor["prototype"][OBJECTVIEW_KEY];
            objectview.component = param.component;
            objectview.componentParam = param.componentParam;
        };
    }
    feng3d.ov = ov;
    // /**
    //  * objectview类装饰器
    //  */
    // export function obv<K extends keyof OBVComponentParam>(param: { name: string; component?: K; componentParam?: OBVComponentParam[K]; })
    // {
    // 	return (constructor: Function) =>
    // 	{
    // 		if (!Object.getOwnPropertyDescriptor(constructor["prototype"], OBJECTVIEW_KEY))
    // 			constructor["prototype"][OBJECTVIEW_KEY] = {};
    // 		var objectview: ClassDefinition = constructor["prototype"][OBJECTVIEW_KEY];
    // 		var blockDefinitionVec: BlockDefinition[] = objectview.blockDefinitionVec = objectview.blockDefinitionVec || [];
    // 		blockDefinitionVec.push({
    // 			name: param.name,
    // 			component: param.component,
    // 			componentParam: param.componentParam,
    // 		});
    // 	}
    // }
    /**
     * objectview属性装饰器
     * @param param 参数
     */
    function oav(param) {
        return function (target, propertyKey) {
            addOAV(target, propertyKey, param);
        };
    }
    feng3d.oav = oav;
    /**
     * 对象界面
     * @author feng 2016-3-10
     */
    feng3d.objectview = {
        getObjectView: getObjectView,
        getAttributeView: getAttributeView,
        getBlockView: getBlockView,
        defaultBaseObjectViewClass: "",
        defaultObjectViewClass: "",
        defaultObjectAttributeViewClass: "",
        defaultObjectAttributeBlockView: "",
        defaultTypeAttributeView: {},
        OAVComponent: {},
        OBVComponent: {},
        OVComponent: {},
        addOAV: addOAV,
        getObjectInfo: getObjectInfo,
    };
    var OBJECTVIEW_KEY = "__objectview__";
    function addOAV(target, propertyKey, param) {
        if (!Object.getOwnPropertyDescriptor(target, OBJECTVIEW_KEY))
            target[OBJECTVIEW_KEY] = {};
        var objectview = target[OBJECTVIEW_KEY] || {};
        var attributeDefinitionVec = objectview.attributeDefinitionVec = objectview.attributeDefinitionVec || [];
        attributeDefinitionVec.push({
            name: propertyKey, block: param && param.block, component: param && param.component, componentParam: param && param.componentParam
        });
    }
    function mergeClassDefinition(oldClassDefinition, newClassDefinition) {
        if (newClassDefinition.component && newClassDefinition.component.length > 0) {
            oldClassDefinition.component = newClassDefinition.component;
            oldClassDefinition.componentParam = newClassDefinition.componentParam;
        }
        //合并属性
        oldClassDefinition.attributeDefinitionVec = oldClassDefinition.attributeDefinitionVec || [];
        if (newClassDefinition.attributeDefinitionVec && newClassDefinition.attributeDefinitionVec.length > 0) {
            newClassDefinition.attributeDefinitionVec.forEach(function (newAttributeDefinition) {
                var isfound = false;
                oldClassDefinition.attributeDefinitionVec.forEach(function (oldAttributeDefinition) {
                    if (newAttributeDefinition && oldAttributeDefinition.name == newAttributeDefinition.name) {
                        oldAttributeDefinition.block = newAttributeDefinition.block;
                        oldAttributeDefinition.component = newAttributeDefinition.component;
                        oldAttributeDefinition.componentParam = newAttributeDefinition.componentParam;
                        isfound = true;
                    }
                });
                if (!isfound) {
                    oldClassDefinition.attributeDefinitionVec.push(newAttributeDefinition);
                }
            });
        }
        //合并块
        oldClassDefinition.blockDefinitionVec = oldClassDefinition.blockDefinitionVec || [];
        if (newClassDefinition.blockDefinitionVec && newClassDefinition.blockDefinitionVec.length > 0) {
            newClassDefinition.blockDefinitionVec.forEach(function (newBlockDefinition) {
                var isfound = false;
                oldClassDefinition.blockDefinitionVec.forEach(function (oldBlockDefinition) {
                    if (newBlockDefinition && newBlockDefinition.name == oldBlockDefinition.name) {
                        oldBlockDefinition.component = newBlockDefinition.component;
                        oldBlockDefinition.componentParam = newBlockDefinition.componentParam;
                        isfound = true;
                    }
                });
                if (!isfound) {
                    oldClassDefinition.blockDefinitionVec.push(newBlockDefinition);
                }
            });
        }
    }
    /**
     * 获取对象界面
     *
     * @static
     * @param {Object} object				用于生成界面的对象
     * @returns 							对象界面
     *
     * @memberOf ObjectView
     */
    function getObjectView(object) {
        var classConfig = getObjectInfo(object);
        if (classConfig.component == null || classConfig.component == "") {
            //返回基础类型界面类定义
            if (!(classConfig.owner instanceof Object)) {
                classConfig.component = feng3d.objectview.defaultBaseObjectViewClass;
            }
            else {
                //使用默认类型界面类定义
                classConfig.component = feng3d.objectview.defaultObjectViewClass;
            }
        }
        var cls = feng3d.objectview.OVComponent[classConfig.component];
        feng3d.assert(cls != null, "\u6CA1\u6709\u5B9A\u4E49 " + classConfig.component + " \u5BF9\u5E94\u7684\u5BF9\u8C61\u754C\u9762\u7C7B\uFF0C\u9700\u8981\u5728 " + classConfig.component + " \u4E2D\u4F7F\u7528@OVComponent()\u6807\u8BB0");
        var view = new cls(classConfig);
        return view;
    }
    /**
     * 获取属性界面
     *
     * @static
     * @param {AttributeViewInfo} attributeViewInfo			属性界面信息
     * @returns {egret.DisplayObject}						属性界面
     *
     * @memberOf ObjectView
     */
    function getAttributeView(attributeViewInfo) {
        if (attributeViewInfo.component == null || attributeViewInfo.component == "") {
            var defaultViewClass = feng3d.objectview.defaultTypeAttributeView[attributeViewInfo.type];
            var tempComponent = defaultViewClass ? defaultViewClass.component : "";
            if (tempComponent != null && tempComponent != "") {
                attributeViewInfo.component = defaultViewClass.component;
                attributeViewInfo.componentParam = defaultViewClass.componentParam || attributeViewInfo.componentParam;
            }
        }
        if (attributeViewInfo.component == null || attributeViewInfo.component == "") {
            //使用默认对象属性界面类定义
            attributeViewInfo.component = feng3d.objectview.defaultObjectAttributeViewClass;
        }
        var cls = feng3d.objectview.OAVComponent[attributeViewInfo.component];
        feng3d.assert(cls != null, "\u6CA1\u6709\u5B9A\u4E49 " + attributeViewInfo.component + " \u5BF9\u5E94\u7684\u5C5E\u6027\u754C\u9762\u7C7B\uFF0C\u9700\u8981\u5728 " + attributeViewInfo.component + " \u4E2D\u4F7F\u7528@OVAComponent()\u6807\u8BB0");
        var view = new cls(attributeViewInfo);
        return view;
    }
    /**
     * 获取块界面
     *
     * @static
     * @param {BlockViewInfo} blockViewInfo			块界面信息
     * @returns {egret.DisplayObject}				块界面
     *
     * @memberOf ObjectView
     */
    function getBlockView(blockViewInfo) {
        if (blockViewInfo.component == null || blockViewInfo.component == "") {
            //返回默认对象属性界面类定义
            blockViewInfo.component = feng3d.objectview.defaultObjectAttributeBlockView;
        }
        var cls = feng3d.objectview.OBVComponent[blockViewInfo.component];
        feng3d.assert(cls != null, "\u6CA1\u6709\u5B9A\u4E49 " + blockViewInfo.component + " \u5BF9\u5E94\u7684\u5757\u754C\u9762\u7C7B\uFF0C\u9700\u8981\u5728 " + blockViewInfo.component + " \u4E2D\u4F7F\u7528@OVBComponent()\u6807\u8BB0");
        var view = new cls(blockViewInfo);
        return view;
    }
    /**
     * 获取对象信息
     * @param object
     * @return
     */
    function getObjectInfo(object) {
        if (typeof object == "string" || typeof object == "number" || typeof object == "boolean") {
            return {
                objectAttributeInfos: [],
                objectBlockInfos: [],
                owner: object,
                component: "",
                componentParam: undefined
            };
        }
        var classConfig = getInheritClassDefinition(object);
        var objectAttributeInfos = [];
        classConfig.attributeDefinitionVec.forEach(function (attributeDefinition) {
            objectAttributeInfos.push({
                name: attributeDefinition.name,
                block: attributeDefinition.block,
                component: attributeDefinition.component,
                componentParam: attributeDefinition.componentParam,
                owner: object,
                writable: true,
                type: getAttributeType(object[attributeDefinition.name])
            });
        });
        function getAttributeType(attribute) {
            if (attribute == null)
                return "null";
            if (typeof attribute == "number")
                return "number";
            return attribute.constructor.name;
        }
        var objectInfo = {
            objectAttributeInfos: objectAttributeInfos,
            objectBlockInfos: getObjectBlockInfos(object, objectAttributeInfos, classConfig.blockDefinitionVec),
            owner: object,
            component: classConfig.component,
            componentParam: classConfig.componentParam
        };
        return objectInfo;
    }
    function getInheritClassDefinition(object) {
        var classConfigVec = [];
        var prototype = object;
        while (prototype) {
            var classConfig = prototype[OBJECTVIEW_KEY];
            if (classConfig)
                classConfigVec.push(classConfig);
            prototype = prototype["__proto__"];
        }
        var resultclassConfig;
        if (classConfigVec.length > 0) {
            resultclassConfig = {};
            for (var i = 0; i < classConfigVec.length; i++) {
                mergeClassDefinition(resultclassConfig, classConfigVec[i]);
            }
        }
        else {
            resultclassConfig = getDefaultClassConfig(object);
        }
        return resultclassConfig;
    }
    function getDefaultClassConfig(object, filterReg) {
        if (filterReg === void 0) { filterReg = /(([a-zA-Z0-9])+|(\d+))/; }
        //
        var attributeNames = [];
        for (var key in object) {
            var result = filterReg.exec(key);
            if (result && result[0] == key) {
                var value = object[key];
                if (value === undefined || value instanceof Function)
                    continue;
                attributeNames.push(key);
            }
        }
        attributeNames = attributeNames.sort();
        var attributeDefinitionVec = [];
        attributeNames.forEach(function (element) {
            attributeDefinitionVec.push({
                name: element,
                block: "",
            });
        });
        var defaultClassConfig = {
            component: "",
            attributeDefinitionVec: attributeDefinitionVec,
            blockDefinitionVec: []
        };
        return defaultClassConfig;
    }
    /**
     * 获取对象块信息列表
     * @param {Object} object			对象
     * @returns {BlockViewInfo[]}		对象块信息列表
     */
    function getObjectBlockInfos(object, objectAttributeInfos, blockDefinitionVec) {
        var objectBlockInfos = [];
        var dic = {};
        var objectBlockInfo;
        //收集块信息
        var i = 0;
        var tempVec = [];
        for (i = 0; i < objectAttributeInfos.length; i++) {
            var blockName = objectAttributeInfos[i].block || "";
            objectBlockInfo = dic[blockName];
            if (objectBlockInfo == null) {
                objectBlockInfo = dic[blockName] = { name: blockName, owner: object, itemList: [] };
                tempVec.push(objectBlockInfo);
            }
            objectBlockInfo.itemList.push(objectAttributeInfos[i]);
        }
        //按快的默认顺序生成 块信息列表
        var blockDefinition;
        var pushDic = {};
        if (blockDefinitionVec) {
            for (i = 0; i < blockDefinitionVec.length; i++) {
                blockDefinition = blockDefinitionVec[i];
                objectBlockInfo = dic[blockDefinition.name];
                if (objectBlockInfo == null) {
                    objectBlockInfo = {
                        name: blockDefinition.name,
                        owner: object,
                        itemList: []
                    };
                }
                objectBlockInfo.component = blockDefinition.component;
                objectBlockInfo.componentParam = blockDefinition.componentParam;
                objectBlockInfos.push(objectBlockInfo);
                pushDic[objectBlockInfo.name] = true;
            }
        }
        //添加剩余的块信息
        for (i = 0; i < tempVec.length; i++) {
            if (Boolean(pushDic[tempVec[i].name]) == false) {
                objectBlockInfos.push(tempVec[i]);
            }
        }
        return objectBlockInfos;
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 测试代码运行时间
     * @param fn 被测试的方法
     * @param labal 标签
     */
    function time(fn, labal) {
        labal = labal || fn["name"] || "Anonymous function " + Math.random();
        console.time(labal);
        fn();
        console.timeEnd(labal);
    }
    feng3d.time = time;
    /**
     * 断言，测试不通过时报错
     * @param test 测试项
     * @param message 测试失败时提示信息
     * @param optionalParams
     */
    function assert(test, message) {
        var optionalParams = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            optionalParams[_i - 2] = arguments[_i];
        }
        if (!test)
            debugger;
        console.assert.apply(null, arguments);
    }
    feng3d.assert = assert;
    /**
     * 输出错误
     * @param message 错误信息
     * @param optionalParams
     */
    function error(message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        debugger;
        console.error.apply(null, arguments);
    }
    feng3d.error = error;
    /**
     * 记录日志信息
     * @param message 日志信息
     * @param optionalParams
     */
    function log(message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        console.log.apply(null, arguments);
    }
    feng3d.log = log;
    /**
     * 警告
     * @param message 警告信息
     * @param optionalParams
     */
    function warn(message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        console.warn.apply(null, arguments);
    }
    feng3d.warn = warn;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    feng3d.EVENT_KEY = "__event__";
    function getBubbleTargets(target) {
        return [target["parent"]];
    }
    /**
     * 事件适配器
     */
    var EventDispatcher = /** @class */ (function () {
        function EventDispatcher() {
        }
        /**
         * 监听一次事件后将会被移除
         * @param type						事件的类型。
         * @param listener					处理事件的侦听器函数。
         * @param thisObject                listener函数作用域
         * @param priority					事件侦听器的优先级。数字越大，优先级越高。默认优先级为 0。
         */
        EventDispatcher.prototype.once = function (type, listener, thisObject, priority) {
            if (thisObject === void 0) { thisObject = null; }
            if (priority === void 0) { priority = 0; }
            this.on(type, listener, thisObject, priority, true);
        };
        /**
         * 派发事件
         * @param event   事件对象
         */
        EventDispatcher.prototype.dispatchEvent = function (event) {
            //设置目标
            event.target || (event.target = this);
            try {
                //使用 try 处理 MouseEvent 等无法更改currentTarget的对象
                event.currentTarget = this;
            }
            catch (error) { }
            var listeners = this[feng3d.EVENT_KEY] && this[feng3d.EVENT_KEY][event.type];
            if (listeners) {
                //遍历调用事件回调函数
                for (var i = 0; i < listeners.length && !event.isStop; i++) {
                    listeners[i].listener.call(listeners[i].thisObject, event);
                }
                for (var i = listeners.length - 1; i >= 0; i--) {
                    if (listeners[i].once)
                        listeners.splice(i, 1);
                }
                if (listeners.length == 0)
                    delete this[feng3d.EVENT_KEY][event.type];
            }
            //事件冒泡(冒泡阶段)
            if (event.bubbles && !event.isStopBubbles) {
                var bubbleTargets = getBubbleTargets(this);
                for (var i = 0, n = bubbleTargets.length; i < n; i++) {
                    var bubbleTarget = bubbleTargets[i];
                    if (!event.isStop && bubbleTarget instanceof EventDispatcher)
                        bubbleTarget.dispatchEvent(event);
                }
            }
        };
        /**
         * 将事件调度到事件流中. 事件目标是对其调用 dispatchEvent() 方法的 IEvent 对象。
         * @param type                      事件的类型。类型区分大小写。
         * @param data                      事件携带的自定义数据。
         * @param bubbles                   表示事件是否为冒泡事件。如果事件可以冒泡，则此值为 true；否则为 false。
         */
        EventDispatcher.prototype.dispatch = function (type, data, bubbles) {
            if (bubbles === void 0) { bubbles = false; }
            var event = { type: type, data: data, bubbles: bubbles };
            this.dispatchEvent(event);
        };
        /**
         * 检查 Event 对象是否为特定事件类型注册了任何侦听器.
         *
         * @param type		事件的类型。
         * @return 			如果指定类型的侦听器已注册，则值为 true；否则，值为 false。
         */
        EventDispatcher.prototype.has = function (type) {
            return !!(this[feng3d.EVENT_KEY] && this[feng3d.EVENT_KEY][type] && this[feng3d.EVENT_KEY][type].length);
        };
        /**
         * 添加监听
         * @param type						事件的类型。
         * @param listener					处理事件的侦听器函数。
         * @param priority					事件侦听器的优先级。数字越大，优先级越高。默认优先级为 0。
         */
        EventDispatcher.prototype.on = function (type, listener, thisObject, priority, once) {
            if (priority === void 0) { priority = 0; }
            if (once === void 0) { once = false; }
            var objectListener = this[feng3d.EVENT_KEY] || (this[feng3d.EVENT_KEY] = {});
            var listeners = objectListener[type] = objectListener[type] || [];
            for (var i = 0; i < listeners.length; i++) {
                var element = listeners[i];
                if (element.listener == listener && element.thisObject == thisObject) {
                    listeners.splice(i, 1);
                    break;
                }
            }
            for (var i = 0; i < listeners.length; i++) {
                var element = listeners[i];
                if (priority > element.priority) {
                    break;
                }
            }
            listeners.splice(i, 0, { listener: listener, thisObject: thisObject, priority: priority, once: once });
        };
        /**
         * 移除监听
         * @param dispatcher 派发器
         * @param type						事件的类型。
         * @param listener					要删除的侦听器对象。
         */
        EventDispatcher.prototype.off = function (type, listener, thisObject) {
            if (!type) {
                delete this[feng3d.EVENT_KEY];
                return;
            }
            if (!listener) {
                if (this[feng3d.EVENT_KEY])
                    delete this[feng3d.EVENT_KEY][type];
                return;
            }
            var listeners = this[feng3d.EVENT_KEY] && this[feng3d.EVENT_KEY][type];
            if (listeners) {
                for (var i = listeners.length - 1; i >= 0; i--) {
                    var element = listeners[i];
                    if (element.listener == listener && element.thisObject == thisObject) {
                        listeners.splice(i, 1);
                    }
                }
                if (listeners.length == 0) {
                    delete this[feng3d.EVENT_KEY][type];
                }
            }
        };
        return EventDispatcher;
    }());
    feng3d.EventDispatcher = EventDispatcher;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 代理 EventTarget, 处理js事件中this关键字问题
     * @author feng 2016-12-19
     */
    var EventProxy = /** @class */ (function (_super) {
        __extends(EventProxy, _super);
        function EventProxy(target) {
            var _this = _super.call(this) || this;
            _this.clientX = 0;
            _this.clientY = 0;
            /**
             * 是否右击
             */
            _this.rightmouse = false;
            _this.listentypes = [];
            /**
             * 键盘按下事件
             */
            _this.onMouseKey = function (event) {
                if (event["clientX"] != undefined) {
                    event = event;
                    _this.clientX = event.clientX;
                    _this.clientY = event.clientY;
                }
                if (event instanceof MouseEvent) {
                    _this.rightmouse = event.button == 2;
                }
                if (event instanceof KeyboardEvent) {
                    _this.keyCode = event.keyCode;
                }
                if (event instanceof WheelEvent) {
                    _this.wheelDelta = event.wheelDelta;
                }
                _this.dispatchEvent(event);
            };
            _this.target = target;
            return _this;
        }
        /**
         * 监听一次事件后将会被移除
         * @param type						事件的类型。
         * @param listener					处理事件的侦听器函数。
         * @param thisObject                listener函数作用域
         * @param priority					事件侦听器的优先级。数字越大，优先级越高。默认优先级为 0。
         */
        EventProxy.prototype.once = function (type, listener, thisObject, priority) {
            _super.prototype.once.call(this, type, listener, thisObject, priority);
        };
        /**
         * 添加监听
         * @param type						事件的类型。
         * @param listener					处理事件的侦听器函数。
         * @param priority					事件侦听器的优先级。数字越大，优先级越高。默认优先级为 0。
         */
        EventProxy.prototype.on = function (type, listener, thisObject, priority, once) {
            if (priority === void 0) { priority = 0; }
            if (once === void 0) { once = false; }
            _super.prototype.on.call(this, type, listener, thisObject, priority, once);
            if (this.listentypes.indexOf(type) == -1) {
                this.listentypes.push(type);
                this.target.addEventListener(type, this.onMouseKey);
            }
        };
        /**
         * 移除监听
         * @param dispatcher 派发器
         * @param type						事件的类型。
         * @param listener					要删除的侦听器对象。
         */
        EventProxy.prototype.off = function (type, listener, thisObject) {
            var _this = this;
            _super.prototype.off.call(this, type, listener, thisObject);
            if (!type) {
                this.listentypes.forEach(function (element) {
                    _this.target.removeEventListener(element, _this.onMouseKey);
                });
                this.listentypes.length = 0;
            }
            else if (!this.has(type)) {
                this.target.removeEventListener(type, this.onMouseKey);
                this.listentypes.splice(this.listentypes.indexOf(type), 1);
            }
        };
        return EventProxy;
    }(feng3d.EventDispatcher));
    feng3d.EventProxy = EventProxy;
    /**
     * 键盘鼠标输入
     */
    feng3d.windowEventProxy = new EventProxy(window);
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    feng3d.loadjs = {
        load: load,
        ready: ready,
    };
    /**
     * 加载文件
     * @param params.paths          加载路径
     * @param params.bundleId       加载包编号
     * @param params.success        成功回调
     * @param params.error          错误回调
     * @param params.async          是否异步加载
     * @param params.numRetries     加载失败尝试次数
     * @param params.before         加载前回调
     * @param params.onitemload     单条文件加载完成回调
     */
    function load(params) {
        // throw error if bundle is already defined
        if (params.bundleId) {
            if (params.bundleId in bundleIdCache) {
                throw "LoadJS";
            }
            else {
                bundleIdCache[params.bundleId] = true;
            }
        }
        var paths = getPaths(params.paths);
        // load scripts
        loadFiles(paths, function (pathsNotFound) {
            // success and error callbacks
            if (pathsNotFound.length)
                (params.error || devnull)(pathsNotFound);
            else
                (params.success || devnull)();
            // publish bundle load event
            publish(params.bundleId, pathsNotFound);
        }, params);
    }
    /**
     * 准备依赖包
     * @param params.depends        依赖包编号
     * @param params.success        成功回调
     * @param params.error          错误回调
     */
    function ready(params) {
        // subscribe to bundle load event
        subscribe(params.depends, function (depsNotFound) {
            // execute callbacks
            if (depsNotFound.length)
                (params.error || devnull)(depsNotFound);
            else
                (params.success || devnull)();
        });
    }
    /**
     * 完成下载包
     * @param bundleId 下载包编号
     */
    function done(bundleId) {
        publish(bundleId, []);
    }
    /**
     * 重置下载包依赖状态
     */
    function reset() {
        bundleIdCache = {};
        bundleResultCache = {};
        bundleCallbackQueue = {};
    }
    /**
     * 是否定义下载包
     * @param {string} bundleId 包编号
     */
    function isDefined(bundleId) {
        return bundleId in bundleIdCache;
    }
    var devnull = function () { }, bundleIdCache = {}, bundleResultCache = {}, bundleCallbackQueue = {};
    /**
     * 订阅包加载事件
     * @param bundleIds              包编号
     * @param callbackFn             完成回调
     */
    function subscribe(bundleIds, callbackFn) {
        var depsNotFound = [];
        // listify
        if (bundleIds instanceof String) {
            bundleIds = [bundleIds];
        }
        // define callback function
        var numWaiting = bundleIds.length;
        var fn = function (bundleId, pathsNotFound) {
            if (pathsNotFound.length)
                depsNotFound.push(bundleId);
            numWaiting--;
            if (!numWaiting)
                callbackFn(depsNotFound);
        };
        // register callback
        var i = bundleIds.length;
        while (i--) {
            var bundleId = bundleIds[i];
            // execute callback if in result cache
            var r = bundleResultCache[bundleId];
            if (r) {
                fn(bundleId, r);
                continue;
            }
            // add to callback queue
            var q = bundleCallbackQueue[bundleId] = bundleCallbackQueue[bundleId] || [];
            q.push(fn);
        }
    }
    /**
     * 派发加载包完成事件
     * @param bundleId                  加载包编号
     * @param pathsNotFound             加载失败包
     */
    function publish(bundleId, pathsNotFound) {
        // exit if id isn't defined
        if (!bundleId)
            return;
        var q = bundleCallbackQueue[bundleId];
        // cache result
        bundleResultCache[bundleId] = pathsNotFound;
        // exit if queue is empty
        if (!q)
            return;
        // empty callback queue
        while (q.length) {
            q[0](bundleId, pathsNotFound);
            q.splice(0, 1);
        }
    }
    /**
     * 加载单个文件
     * @param path                          文件路径
     * @param callbackFn                    加载完成回调
     * @param args                          加载参数
     * @param args.async                    是否异步加载
     * @param args.numRetries               尝试加载次数
     * @param args.before                   加载前回调
     * @param numTries                      当前尝试次数
     */
    function loadFile(path, callbackFn, args, numTries) {
        var loaderFun = loaders[path.type] || loadTxt;
        loaderFun(path, callbackFn, args, numTries);
    }
    /**
     * 加载单个Image文件
     * @param path                          文件路径
     * @param callbackFn                    加载完成回调
     * @param args                          加载参数
     * @param args.async                    是否异步加载
     * @param args.numRetries               尝试加载次数
     * @param args.before                   加载前回调
     * @param numTries                      当前尝试次数
     */
    function loadImage(path, callbackFn, args, numTries) {
        if (numTries === void 0) { numTries = 0; }
        var image = new Image();
        image.crossOrigin = "Anonymous";
        image.onerror = image.onload = function (ev) {
            var result = ev.type;
            // handle retries in case of load failure
            if (result == 'error') {
                // increment counter
                numTries = ~~numTries + 1;
                // exit function and try again
                args.numRetries = args.numRetries || 0;
                if (numTries < ~~args.numRetries + 1) {
                    return loadImage(path, callbackFn, args, numTries);
                }
                image.src = "data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBmRXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAAExAAIAAAAQAAAATgAAAAAAAABgAAAAAQAAAGAAAAABcGFpbnQubmV0IDQuMC41AP/bAEMABAIDAwMCBAMDAwQEBAQFCQYFBQUFCwgIBgkNCw0NDQsMDA4QFBEODxMPDAwSGBITFRYXFxcOERkbGRYaFBYXFv/bAEMBBAQEBQUFCgYGChYPDA8WFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFv/AABEIAQABAAMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/APH6KKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FCiiigD6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++gooooA+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gUKKKKAPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76CiiigD5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BQooooA+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/voKKKKAPl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FCiiigD6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++gooooA+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gUKKKKAPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76CiiigD5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BQooooA+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/voKKKKAPl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FCiiigD6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++gooooA+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gUKKKKAPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76P//Z";
            }
            // execute callback
            callbackFn(path, result, ev.defaultPrevented, image);
        };
        //
        var beforeCallbackFn = args.before || (function () { return true; });
        if (beforeCallbackFn(path, image) !== false)
            image.src = path.url;
    }
    /**
     * 加载单个txt文件
     * @param path                          文件路径
     * @param callbackFn                    加载完成回调
     * @param args                          加载参数
     * @param args.async                    是否异步加载
     * @param args.numRetries               尝试加载次数
     * @param args.before                   加载前回调
     * @param numTries                      当前尝试次数
     */
    function loadTxt(path, callbackFn, args, numTries) {
        if (numTries === void 0) { numTries = 0; }
        var request = new XMLHttpRequest();
        request.onreadystatechange = function (ev) {
            var result = ev.type;
            if (request.readyState == 4) {
                request.onreadystatechange = null;
                // handle retries in case of load failure
                if (request.status < 200 || request.status > 300) {
                    // increment counter
                    numTries = ~~numTries + 1;
                    // exit function and try again
                    args.numRetries = args.numRetries || 0;
                    if (numTries < ~~args.numRetries + 1) {
                        return loadTxt(path, callbackFn, args, numTries);
                    }
                }
                // execute callback
                callbackFn(path, result, ev.defaultPrevented, request.responseText);
            }
        };
        request.open('Get', path.url, true);
        //
        var beforeCallbackFn = args.before || (function () { return true; });
        if (beforeCallbackFn(path, request) !== false)
            request.send();
    }
    /**
     * 加载单个js或者css文件
     * @param path                          文件路径
     * @param callbackFn                    加载完成回调
     * @param args                          加载参数
     * @param args.async                    是否异步加载
     * @param args.numRetries               尝试加载次数
     * @param args.before                   加载前回调
     * @param numTries                      当前尝试次数
     */
    function loadJsCss(path, callbackFn, args, numTries) {
        if (numTries === void 0) { numTries = 0; }
        var doc = document, isCss, e;
        if (/(^css!|\.css$)/.test(path.url)) {
            isCss = true;
            // css
            e = doc.createElement('link');
            e.rel = 'stylesheet';
            e.href = path.url.replace(/^css!/, ''); // remove "css!" prefix
        }
        else {
            // javascript
            e = doc.createElement('script');
            e.src = path.url;
            e.async = !!args.async;
        }
        e.onload = e.onerror = e.onbeforeload = function (ev) {
            var result = ev.type;
            // Note: The following code isolates IE using `hideFocus` and treats empty
            // stylesheets as failures to get around lack of onerror support
            if (isCss && 'hideFocus' in e) {
                try {
                    if (!e.sheet.cssText.length)
                        result = 'error';
                }
                catch (x) {
                    // sheets objects created from load errors don't allow access to
                    // `cssText`
                    result = 'error';
                }
            }
            // handle retries in case of load failure
            if (result == 'error') {
                // increment counter
                numTries = ~~numTries + 1;
                // exit function and try again
                args.numRetries = args.numRetries || 0;
                if (numTries < ~~args.numRetries + 1) {
                    return loadJsCss(path, callbackFn, args, numTries);
                }
            }
            // execute callback
            callbackFn(path, result, ev.defaultPrevented, e);
        };
        // add to document (unless callback returns `false`)
        var beforeCallbackFn = args.before || (function () { return true; });
        if (beforeCallbackFn(path, e) !== false)
            doc.head.appendChild(e);
    }
    /**
     * 加载多文件
     * @param paths         文件路径
     * @param callbackFn    加载完成回调
     */
    function loadFiles(paths, callbackFn, args) {
        var notLoadFiles = paths.concat();
        var loadingFiles = [];
        var pathsNotFound = [];
        // define callback function
        var fn = function (path, result, defaultPrevented, content) {
            // handle error
            if (result == 'error')
                pathsNotFound.push(path.url);
            // handle beforeload event. If defaultPrevented then that means the load
            // will be blocked (ex. Ghostery/ABP on Safari)
            if (result[0] == 'b') {
                if (defaultPrevented)
                    pathsNotFound.push(path.url);
                else
                    return;
            }
            var index = loadingFiles.indexOf(path);
            loadingFiles.splice(index, 1);
            args.onitemload && args.onitemload(path.url, content);
            if (loadingFiles.length == 0 && notLoadFiles.length == 0)
                callbackFn(pathsNotFound);
            if (notLoadFiles.length) {
                var file = notLoadFiles[0];
                notLoadFiles.shift();
                loadingFiles.push(file);
                loadFile(file, fn, args);
            }
        };
        // load scripts
        var file;
        if (!!args.async) {
            for (var i = 0, x = notLoadFiles.length; i < x; i++) {
                file = notLoadFiles[i];
                loadingFiles.push(file);
                loadFile(file, fn, args);
            }
            notLoadFiles.length = 0;
        }
        else {
            file = notLoadFiles[0];
            notLoadFiles.shift();
            loadingFiles.push(file);
            loadFile(file, fn, args);
        }
    }
    /**
     * 获取路径以及类型
     * @param pathUrls 路径
     */
    function getPaths(pathUrls) {
        var paths = [];
        if (typeof pathUrls == "string") {
            pathUrls = [pathUrls];
        }
        if (!(pathUrls instanceof Array)) {
            pathUrls = [pathUrls];
        }
        for (var i = 0; i < pathUrls.length; i++) {
            var pathurl = pathUrls[i];
            if (typeof pathurl == "string") {
                paths[i] = { url: pathurl, type: getPathType(pathurl) };
            }
            else {
                paths[i] = pathurl;
            }
        }
        return paths;
    }
    /**
     * 获取路径类型
     * @param path 路径
     */
    function getPathType(path) {
        var type = "txt";
        for (var i = 0; i < typeRegExps.length; i++) {
            var element = typeRegExps[i];
            if (element.reg.test(path))
                type = element.type;
        }
        return type;
    }
    /**
     * 资源类型
     */
    var types = { js: "js", css: "css", txt: "txt", image: "image" };
    /**
     * 加载函数
     */
    var loaders = {
        txt: loadTxt,
        js: loadJsCss,
        css: loadJsCss,
        image: loadImage,
    };
    var typeRegExps = [
        { reg: /(^css!|\.css$)/i, type: types.css },
        { reg: /(\.js\b)/i, type: types.js },
        { reg: /(\.png\b)/i, type: types.image },
        { reg: /(\.jpg\b)/i, type: types.image },
    ];
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    feng3d.watcher = {
        watch: watch,
        unwatch: unwatch,
    };
    var bindables = "__watchs__";
    function unwatch(host, property, handler, thisObject) {
        var watchs = host[bindables] = host[bindables] || {};
        if (watchs[property]) {
            var handlers = watchs[property].handlers;
            if (handler === undefined)
                handlers.length = 0;
            for (var i = handlers.length - 1; i >= 0; i--) {
                if (handlers[i].handler == handler && (handlers[i].thisObject == thisObject || thisObject === undefined))
                    handlers.splice(i, 1);
            }
            if (handlers.length == 0) {
                var value = host[property];
                delete host[property];
                if (watchs[property].oldPropertyDescriptor)
                    Object.defineProperty(host, property, watchs[property].oldPropertyDescriptor);
                host[property] = value;
                delete watchs[property];
            }
            if (Object.keys(watchs).length == 0) {
                delete host[bindables];
            }
        }
    }
    /**
     * 注意：使用watch后获取该属性值的性能将会是原来的1/60，禁止在feng3d引擎内部使用watch
     * @param host
     * @param property
     * @param handler
     * @param thisObject
     */
    function watch(host, property, handler, thisObject) {
        var watchs = host[bindables] = host[bindables] || {};
        if (!watchs[property]) {
            var oldPropertyDescriptor = Object.getOwnPropertyDescriptor(host, property);
            watchs[property] = { value: host[property], oldPropertyDescriptor: oldPropertyDescriptor, handlers: [] };
            //
            var data = getPropertyDescriptor(host, property);
            if (data && data.set && data.get) {
                data = { enumerable: true, configurable: true, get: data.get, set: data.set };
                var orgSet = data.set;
                data.set = function (value) {
                    var oldvalue = this[property];
                    if (oldvalue != value) {
                        orgSet && orgSet.call(this, value);
                        notifyListener(this, property, oldvalue);
                    }
                };
            }
            else if (!data || (!data.get && !data.set)) {
                data = { enumerable: true, configurable: true };
                data.get = function () {
                    return this[bindables][property].value;
                };
                data.set = function (value) {
                    var oldvalue = this[bindables][property].value;
                    if (oldvalue != value) {
                        this[bindables][property].value = value;
                        notifyListener(this, property, oldvalue);
                    }
                };
            }
            else {
                throw "watch 失败！";
            }
            Object.defineProperty(host, property, data);
        }
        var propertywatchs = watchs[property];
        var has = propertywatchs.handlers.reduce(function (v, item) { return v || (item.handler == handler && item.thisObject == thisObject); }, false);
        if (!has)
            propertywatchs.handlers.push({ handler: handler, thisObject: thisObject });
    }
    function getPropertyDescriptor(host, property) {
        var data = Object.getOwnPropertyDescriptor(host, property);
        if (data) {
            return data;
        }
        var prototype = Object.getPrototypeOf(host);
        if (prototype) {
            return getPropertyDescriptor(prototype, property);
        }
        return null;
    }
    function notifyListener(host, property, oldview) {
        var watchs = host[bindables];
        var handlers = watchs[property].handlers;
        handlers.forEach(function (element) {
            element.handler.call(element.thisObject, host, property, oldview);
        });
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 数据类型转换
     * TypeArray、ArrayBuffer、Blob、File、DataURL、canvas的相互转换
     * @see http://blog.csdn.net/yinwhm12/article/details/73482904
     */
    feng3d.dataTransform = {
        /**
         * Blob to ArrayBuffer
         */
        blobToArrayBuffer: function (blob, callback) {
            var reader = new FileReader();
            reader.onload = function (e) {
                callback(e.target["result"]);
            };
            reader.readAsArrayBuffer(blob);
        },
        /**
         * ArrayBuffer to Blob
         */
        arrayBufferToBlob: function (arrayBuffer, callback) {
            var blob = new Blob([arrayBuffer]); // 注意必须包裹[]
            callback(blob);
        },
        /**
         * ArrayBuffer to Uint8
         * Uint8数组可以直观的看到ArrayBuffer中每个字节（1字节 == 8位）的值。一般我们要将ArrayBuffer转成Uint类型数组后才能对其中的字节进行存取操作。
         */
        arrayBufferToUint8: function (arrayBuffer, callback) {
            var buffer = new ArrayBuffer(32);
            var u8 = new Uint8Array(arrayBuffer);
            callback(u8);
        },
        /**
         * Uint8 to ArrayBuffer
         * 我们Uint8数组可以直观的看到ArrayBuffer中每个字节（1字节 == 8位）的值。一般我们要将ArrayBuffer转成Uint类型数组后才能对其中的字节进行存取操作。
         */
        uint8ToArrayBuffer: function (uint8Array, callback) {
            var buffer = uint8Array.buffer;
            callback(buffer);
        },
        /**
         * Array to ArrayBuffer
         * @param array 例如：[0x15, 0xFF, 0x01, 0x00, 0x34, 0xAB, 0x11];
         */
        arrayToArrayBuffer: function (array, callback) {
            var uint8 = new Uint8Array(array);
            var buffer = uint8.buffer;
            callback(buffer);
        },
        /**
         * TypeArray to Array
         */
        uint8ArrayToArray: function (u8a) {
            var arr = [];
            for (var i = 0; i < u8a.length; i++) {
                arr.push(u8a[i]);
            }
            return arr;
        },
        /**
         * canvas转换为dataURL
         */
        canvasToDataURL: function (canvas, type, callback) {
            if (type == "png") {
                var png = canvas.toDataURL("image/png");
                callback(png);
            }
            else {
                var jpg = canvas.toDataURL("image/jpeg", 0.8);
                callback(jpg);
            }
        },
        /**
         * File、Blob对象转换为dataURL
         * File对象也是一个Blob对象，二者的处理相同。
         */
        blobToDataURL: function (blob, callback) {
            var a = new FileReader();
            a.onload = function (e) { callback(e.target["result"]); };
            a.readAsDataURL(blob);
        },
        /**
         * dataURL转换为Blob对象
         */
        dataURLtoBlob: function (dataurl, callback) {
            var arr = dataurl.split(","), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            var blob = new Blob([u8arr], { type: mime });
            callback(blob);
        },
        /**
         * dataURL图片数据转换为HTMLImageElement
         * dataURL图片数据绘制到canvas
         * 先构造Image对象，src为dataURL，图片onload之后绘制到canvas
         */
        dataURLDrawCanvas: function (dataurl, canvas, callback) {
            var img = new Image();
            img.onload = function () {
                // canvas.drawImage(img);
                callback(img);
            };
            img.src = dataurl;
        },
        arrayBufferToDataURL: function (arrayBuffer, callback) {
            feng3d.dataTransform.arrayBufferToBlob(arrayBuffer, function (blob) {
                feng3d.dataTransform.blobToDataURL(blob, function (dataurl) {
                    callback(dataurl);
                });
            });
        },
        blobToText: function (blob, callback) {
            var a = new FileReader();
            a.onload = function (e) { callback(e.target["result"]); };
            a.readAsText(blob);
        },
        arrayBufferToText: function (arrayBuffer, callback) {
            feng3d.dataTransform.arrayBufferToBlob(arrayBuffer, function (blob) {
                feng3d.dataTransform.blobToText(blob, callback);
            });
        },
        stringToUint8Array: function (str, callback) {
            var utf8 = unescape(encodeURIComponent(str));
            var uint8Array = new Uint8Array(utf8.split('').map(function (item) {
                return item.charCodeAt(0);
            }));
            callback(uint8Array);
        },
        uint8ArrayToString: function (arr, callback) {
            // or [].slice.apply(arr)
            // var utf8 = Array.from(arr).map(function (item)
            var utf8 = [].slice.apply(arr).map(function (item) {
                return String.fromCharCode(item);
            }).join('');
            var str = decodeURIComponent(escape(utf8));
            callback(str);
        }
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var CLASS_KEY = "__class__";
    /**
     * 类工具
     * @author feng 2017-02-15
     */
    feng3d.ClassUtils = {
        getQualifiedClassName: getQualifiedClassName,
        getDefinitionByName: getDefinitionByName,
        addClassNameSpace: addClassNameSpace,
    };
    var _definitionCache = {};
    var _global = window;
    var _classNameSpaces = ["feng3d"];
    /**
     * 返回对象的完全限定类名。
     * @param value 需要完全限定类名称的对象，可以将任何 JavaScript 值传递给此方法，包括所有可用的 JavaScript 类型、对象实例、原始类型
     * （如number)和类对象
     * @returns 包含完全限定类名称的字符串。
     */
    function getQualifiedClassName(value) {
        if (value == null)
            return "null";
        if (typeof value == "function")
            return "Function";
        var prototype = value.prototype ? value.prototype : Object.getPrototypeOf(value);
        if (prototype.hasOwnProperty(CLASS_KEY))
            return prototype[CLASS_KEY];
        var className = prototype.constructor.name;
        if (_global[className] == prototype.constructor)
            return className;
        //在可能的命名空间内查找
        for (var i = 0; i < _classNameSpaces.length; i++) {
            var tryClassName = _classNameSpaces[i] + "." + className;
            if (feng3d.ClassUtils.getDefinitionByName(tryClassName) == prototype.constructor) {
                className = tryClassName;
                registerClass(prototype.constructor, className);
                return className;
            }
        }
        feng3d.error("\u672A\u5728\u7ED9\u51FA\u7684\u547D\u540D\u7A7A\u95F4 " + _classNameSpaces + " \u5185\u627E\u5230 " + value + " \u7684\u5B9A\u4E49");
        return "undefined";
    }
    /**
     * 返回 name 参数指定的类的类对象引用。
     * @param name 类的名称。
     */
    function getDefinitionByName(name) {
        if (name == "null")
            return null;
        if (!name)
            return null;
        if (_global[name])
            return _global[name];
        if (_definitionCache[name])
            return _definitionCache[name];
        var paths = name.split(".");
        var length = paths.length;
        var definition = _global;
        for (var i = 0; i < length; i++) {
            var path = paths[i];
            definition = definition[path];
            if (!definition) {
                return null;
            }
        }
        _definitionCache[name] = definition;
        return definition;
    }
    /**
     * 为一个类定义注册完全限定类名
     * @param classDefinition 类定义
     * @param className 完全限定类名
     */
    function registerClass(classDefinition, className) {
        var prototype = classDefinition.prototype;
        Object.defineProperty(prototype, CLASS_KEY, {
            value: className,
            enumerable: false,
            writable: true
        });
    }
    /**
     * 新增反射对象所在的命名空间，使得getQualifiedClassName能够得到正确的结果
     */
    function addClassNameSpace(namespace) {
        if (_classNameSpaces.indexOf(namespace) == -1) {
            _classNameSpaces.push(namespace);
        }
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 对象工具
     * @author feng 2017-02-15
     */
    var ObjectUtils = /** @class */ (function () {
        function ObjectUtils() {
        }
        /**
         * 深克隆
         * @param source        源数据
         * @returns             克隆数据
         */
        ObjectUtils.deepClone = function (source) {
            if (!(source instanceof Object))
                return source;
            var target = ObjectUtils.getInstance(source);
            for (var attribute in source) {
                target[attribute] = ObjectUtils.deepClone(source[attribute]);
            }
            return target;
        };
        /**
         * 获取实例
         * @param source 实例对象
         */
        ObjectUtils.getInstance = function (source) {
            var cls = source.constructor;
            var className = feng3d.ClassUtils.getQualifiedClassName(source);
            var target = new cls();
            switch (className) {
                case "Uint16Array":
                case "Int16Array":
                case "Float32Array":
                    target = new cls(source["length"]);
                    break;
            }
            return target;
        };
        /**
         * （浅）克隆
         * @param source        源数据
         * @returns             克隆数据
         */
        ObjectUtils.clone = function (source) {
            if (!(source instanceof Object))
                return source;
            var prototype = source["prototype"] ? source["prototype"] : Object.getPrototypeOf(source);
            var target = new prototype.constructor();
            for (var attribute in source) {
                target[attribute] = source[attribute];
            }
            return target;
        };
        /**
         * （浅）拷贝数据
         */
        ObjectUtils.copy = function (target, source) {
            var keys = Object.keys(source);
            keys.forEach(function (element) {
                target[element] = source[element];
            });
        };
        /**
         * 深拷贝数据
         */
        ObjectUtils.deepCopy = function (target, source) {
            var keys = Object.keys(source);
            keys.forEach(function (element) {
                if (!source[element] || !(source[element] instanceof Object)) {
                    target[element] = source[element];
                }
                else if (!target[element]) {
                    target[element] = ObjectUtils.deepClone(source[element]);
                }
                else {
                    ObjectUtils.copy(target[element], source[element]);
                }
            });
        };
        /**
         * 合并数据
         * @param source        源数据
         * @param mergeData     合并数据
         * @param createNew     是否合并为新对象，默认为false
         * @returns             如果createNew为true时返回新对象，否则返回源数据
         */
        ObjectUtils.merge = function (source, mergeData, createNew) {
            if (createNew === void 0) { createNew = false; }
            if (!(mergeData instanceof Object))
                return mergeData;
            var target = createNew ? ObjectUtils.clone(source) : source;
            for (var mergeAttribute in mergeData) {
                target[mergeAttribute] = ObjectUtils.merge(source[mergeAttribute], mergeData[mergeAttribute], createNew);
            }
            return target;
        };
        return ObjectUtils;
    }());
    feng3d.ObjectUtils = ObjectUtils;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var StringUtils = /** @class */ (function () {
        function StringUtils() {
        }
        /**
         * 获取字符串
         * @param obj 转换为字符串的对象
         * @param showLen       显示长度
         * @param fill          长度不够是填充的字符串
         * @param tail          true（默认）:在尾部添加；false：在首部添加
         */
        StringUtils.getString = function (obj, showLen, fill, tail) {
            if (showLen === void 0) { showLen = -1; }
            if (fill === void 0) { fill = " "; }
            if (tail === void 0) { tail = true; }
            var str = "";
            if (obj.toString != null) {
                str = obj.toString();
            }
            else {
                str = obj;
            }
            if (showLen != -1) {
                while (str.length < showLen) {
                    if (tail) {
                        str = str + fill;
                    }
                    else {
                        str = fill + str;
                    }
                }
                if (str.length > showLen) {
                    str = str.substr(0, showLen);
                }
            }
            return str;
        };
        return StringUtils;
    }());
    feng3d.StringUtils = StringUtils;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    feng3d.numberutils = {
        fixed: fixed,
        toArray: toArray,
    };
    function fixed(source, fractionDigits, target) {
        if (fractionDigits === void 0) { fractionDigits = 6; }
        if (typeof source == "number")
            return Number(source.toFixed(fractionDigits));
        target = target || source;
        for (var i = 0; i < source.length; i++) {
            target[i] = Number(source[i].toFixed(fractionDigits));
        }
        return target;
    }
    function toArray(source, target) {
        target = target || [];
        target.length = source.length;
        for (var i = 0; i < source.length; i++) {
            target[i] = source[i];
        }
        return target;
    }
})(feng3d || (feng3d = {}));
//参考 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
Map.prototype.getKeys = function () {
    var keys = [];
    this.forEach(function (v, k) {
        keys.push(k);
    });
    return keys;
};
Map.prototype.getValues = function () {
    var values = [];
    this.forEach(function (v, k) {
        values.push(v);
    });
    return values;
};
var feng3d;
(function (feng3d) {
    /**
     * @description Basically a very large random number (128-bit) which means the probability of creating two that clash is vanishingly small.
     * GUIDs are used as the unique identifiers for Entities.
     * @see https://github.com/playcanvas/engine/blob/master/src/core/guid.js
     */
    feng3d.guid = {
        /**
         * @function
         * @name pc.guid.create
         * @description Create an RFC4122 version 4 compliant GUID
         * @return {String} A new GUID
         */
        create: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = (c == 'x') ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 观察装饰器，观察被装饰属性的变化
     *
     * 使用@watch后会自动生成一个带"_"的属性，例如 属性"a"会生成"_a"
     *
     * 通过使用 eval 函数 生成出 与自己手动写的set get 一样的函数，性能已经接近 手动写的get set函数。
     *
     * 性能：
     * chrome：
     * 测试 get ：
Test.ts:100 watch与getset最大耗时比 1.2222222222222223
Test.ts:101 watch与getset最小耗时比 0.7674418604651163
Test.ts:102 watch与getset平均耗时比 0.9558823529411765
Test.ts:103 watch平均耗时比 13
Test.ts:104 getset平均耗时比 13.6
Test.ts:98 测试 set ：
Test.ts:100 watch与getset最大耗时比 4.5
Test.ts:101 watch与getset最小耗时比 2.409090909090909
Test.ts:102 watch与getset平均耗时比 3.037037037037037
Test.ts:103 watch平均耗时比 57.4
Test.ts:104 getset平均耗时比 18.9

     *
     * nodejs:
     * 测试 get ：
watch与getset最大耗时比 1.3333333333333333
watch与getset最小耗时比 0.55
watch与getset平均耗时比 1.0075757575757576
watch平均耗时比 13.3
getset平均耗时比 13.2
测试 set ：
watch与getset最大耗时比 4.9
watch与getset最小耗时比 3
watch与getset平均耗时比 4.143497757847534
watch平均耗时比 92.4
getset平均耗时比 22.3
     *
     *
     * firefox:
     * 测试 get ：  Test.js:122:5
watch与getset最大耗时比 4.142857142857143  Test.js:124:5
watch与getset最小耗时比 0.4090909090909091  Test.js:125:5
watch与getset平均耗时比 1.0725806451612903  Test.js:126:5
watch平均耗时比 13.3  Test.js:127:5
getset平均耗时比 12.4  Test.js:128:5
测试 set ：  Test.js:122:5
watch与getset最大耗时比 1.5333333333333334  Test.js:124:5
watch与getset最小耗时比 0.6842105263157895  Test.js:125:5
watch与getset平均耗时比 0.9595375722543352  Test.js:126:5
watch平均耗时比 16.6  Test.js:127:5
getset平均耗时比 17.3
     *
     * 结果分析：
     * chrome、nodejs、firefox运行结果出现差异,firefox运行结果最完美
     *
     * 使用watch后的get测试的消耗与手动写get消耗一致
     * chrome与nodejs上set消耗是手动写set的消耗(3-4)倍
     *
     * 注：不适用eval的情况下，chrome表现最好的，与此次测试结果差不多；在nodejs与firfox上将会出现比使用eval情况下消耗的（40-400）倍，其中详细原因不明，求高人解释！
     *
     * @param onChange 属性变化回调
     * @see https://gitee.com/feng3d/feng3d/issues/IGIK0
     */
    function watch(onChange) {
        return function (target, propertyKey) {
            var key = "_" + propertyKey;
            var get;
            // get = function () { return this[key]; };
            eval("get = function (){return this." + key + "}");
            var set;
            // set = function (value)
            // {
            //     if (this[key] === value)
            //         return;
            //     var oldValue = this[key];
            //     this[key] = value;
            //     this[onChange](propertyKey, oldValue, this[key]);
            // };
            eval("set = function (value){\n                if (this." + key + " == value)\n                    return;\n                var oldValue = this." + key + ";\n                this." + key + " = value;\n                this." + onChange + "(\"" + propertyKey + "\", oldValue, this." + key + ");\n            }");
            Object.defineProperty(target, propertyKey, {
                get: get,
                set: set,
                enumerable: true,
                configurable: true
            });
        };
    }
    feng3d.watch = watch;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var RawData = /** @class */ (function () {
        function RawData() {
        }
        RawData.prototype.createGameObject = function (raw) {
            return this.create(raw);
        };
        // create(raw: TransformRaw): Transform
        // create(raw: MeshRendererRaw): MeshRenderer
        // create(raw: CubeGeometryRaw): CubeGeometry
        RawData.prototype.create = function (raw) {
            var result = feng3d.serialization.deserialize(raw);
            return result;
        };
        return RawData;
    }());
    feng3d.RawData = RawData;
    feng3d.rawData = new RawData();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 序列化装饰器，被装饰属性将被序列化
     * @param {*} target                序列化原型
     * @param {string} propertyKey      序列化属性
     */
    function serialize(defaultvalue) {
        return function (target, propertyKey) {
            if (!Object.getOwnPropertyDescriptor(target, SERIALIZE_KEY))
                target[SERIALIZE_KEY] = {};
            target[SERIALIZE_KEY][propertyKey] = defaultvalue;
        };
    }
    feng3d.serialize = serialize;
})(feng3d || (feng3d = {}));
var SERIALIZE_KEY = "__serialize__";
[Float32Array, Float64Array, Int8Array, Int16Array, Int32Array, Uint8Array, Uint16Array, Uint32Array, Uint8ClampedArray].forEach(function (element) {
    element.prototype["serialize"] = function (object) {
        object.value = feng3d.numberutils.toArray(this);
        return object;
    };
    element.prototype["deserialize"] = function (object) {
        return new (this.constructor)(object.value);
    };
});
(function (feng3d) {
    feng3d.serialization = {
        /**
         * 默认数据不保存
         */
        defaultvaluedontsave: true,
        /**
         * 是否压缩
         */
        compress: false,
        serialize: serialize,
        deserialize: deserialize,
        getSerializableMembers: getSerializableMembers,
        clone: clone,
    };
    var CLASS_KEY = "__class__";
    function getSerializableMembers(object, serializableMembers) {
        serializableMembers = serializableMembers || {};
        if (object["__proto__"]) {
            getSerializableMembers(object["__proto__"], serializableMembers);
        }
        var superserializableMembers = object[SERIALIZE_KEY];
        if (superserializableMembers) {
            for (var key in superserializableMembers) {
                serializableMembers[key] = superserializableMembers[key];
            }
        }
        return serializableMembers;
    }
    function getSortSerializableMembers(object) {
        var membersobj = getSerializableMembers(object);
        var memberslist = [];
        for (var key in membersobj) {
            if (membersobj.hasOwnProperty(key)) {
                memberslist.push([key, membersobj[key]]);
            }
        }
        memberslist = memberslist.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
        return memberslist;
    }
    var defaultSerializeVO = {
        defaultvaluedontsave: true,
        compress: false,
        strings: [],
        value: null
    };
    function serialize(target) {
        var result = {
            defaultvaluedontsave: feng3d.serialization.defaultvaluedontsave,
            compress: feng3d.serialization.compress,
            strings: [],
            value: null
        };
        result.value = _serialize(target, result);
        return result;
    }
    function deserialize(result) {
        if (result.value)
            var object = _deserialize(result.value, result);
        else
            var object = _deserialize(result);
        return object;
    }
    function _serialize(target, serializeVO) {
        serializeVO = serializeVO || defaultSerializeVO;
        //基础类型
        if (target == undefined
            || target == null
            || target.constructor == Boolean
            || target.constructor == String
            || target.constructor == Number)
            return target;
        //处理对象
        if (target.hasOwnProperty("serializable") && !target["serializable"])
            return undefined;
        //处理方法
        if (target.constructor === Function) {
            return { __t: "function", data: target.toString() };
        }
        //处理数组
        if (target.constructor === Array) {
            var arr = [];
            for (var i = 0; i < target.length; i++) {
                arr[i] = _serialize(target[i], serializeVO);
            }
            return arr;
        }
        if (target.constructor === Object) {
            var object = {};
            for (var key in target) {
                if (target.hasOwnProperty(key)) {
                    if (target[key] !== undefined) {
                        object[key] = _serialize(target[key], serializeVO);
                    }
                }
            }
            return object;
        }
        var className = feng3d.ClassUtils.getQualifiedClassName(target);
        var object = {};
        if (serializeVO.compress) {
            var typeIndex = serializeVO.strings.indexOf(className);
            if (typeIndex == -1) {
                typeIndex = serializeVO.strings.length;
                serializeVO.strings.push(className);
            }
            object["-1"] = typeIndex;
        }
        else
            object[CLASS_KEY] = className;
        if (target["serialize"])
            return target["serialize"](object);
        //使用默认序列化
        var serializableMembers = getSortSerializableMembers(target);
        for (var i = 0; i < serializableMembers.length; i++) {
            var property = serializableMembers[i][0];
            var objectproperty = serializeVO.compress ? i : property;
            if (serializeVO.defaultvaluedontsave && target[property] === serializableMembers[i][1])
                continue;
            if (target[property] !== undefined) {
                object[objectproperty] = _serialize(target[property], serializeVO);
            }
        }
        return object;
    }
    function _deserialize(object, serializeVO) {
        serializeVO = serializeVO || defaultSerializeVO;
        //基础类型
        if (object == undefined
            || object == null
            || typeof object == "boolean"
            || typeof object == "string"
            || typeof object == "number")
            return object;
        //处理数组
        if (object.constructor == Array) {
            var arr = [];
            object.forEach(function (element) {
                arr.push(_deserialize(element, serializeVO));
            });
            return arr;
        }
        //处理方法
        if (object.__t == "function") {
            var f;
            eval("f=" + object.data);
            return f;
        }
        //处理普通Object
        var className;
        if (serializeVO.compress)
            className = serializeVO.strings[object["-1"]];
        else
            className = object[CLASS_KEY];
        if (className == undefined) {
            var target = {};
            for (var key in object) {
                target[key] = _deserialize(object[key], serializeVO);
            }
            return target;
        }
        var cls = feng3d.ClassUtils.getDefinitionByName(className);
        if (!cls) {
            feng3d.warn("\u65E0\u6CD5\u5E8F\u5217\u53F7\u5BF9\u8C61 " + className);
            return undefined;
        }
        target = new cls();
        //处理自定义反序列化对象
        if (target["deserialize"])
            return target["deserialize"](object);
        //默认反序列
        var serializableMembers = getSortSerializableMembers(target);
        for (var i = 0; i < serializableMembers.length; i++) {
            var property = serializableMembers[i][0];
            var objectproperty = serializeVO.compress ? i : property;
            if (object[objectproperty] !== undefined)
                target[property] = _deserialize(object[objectproperty], serializeVO);
        }
        return target;
    }
    function clone(target) {
        return _deserialize(_serialize(target));
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var Stats = /** @class */ (function () {
        function Stats() {
            var _this = this;
            var mode = 0;
            var container = document.createElement('div');
            container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
            container.addEventListener('click', function (event) {
                event.preventDefault();
                showPanel(++mode % container.children.length);
            }, false);
            //
            function addPanel(panel) {
                container.appendChild(panel.dom);
                return panel;
            }
            function showPanel(id) {
                for (var i = 0; i < container.children.length; i++) {
                    container.children[i].style.display = i === id ? 'block' : 'none';
                }
                mode = id;
            }
            //
            var beginTime = (performance || Date).now(), prevTime = beginTime, frames = 0;
            var fpsPanel = addPanel(new StatsPanel('FPS', '#0ff', '#002'));
            var msPanel = addPanel(new StatsPanel('MS', '#0f0', '#020'));
            if (self.performance && self.performance.memory) {
                var memPanel = addPanel(new StatsPanel('MB', '#f08', '#201'));
            }
            showPanel(0);
            this.REVISION = 16;
            this.dom = container;
            this.addPanel = addPanel;
            this.showPanel = showPanel;
            this.begin = function () {
                beginTime = (performance || Date).now();
            };
            this.end = function () {
                frames++;
                var time = (performance || Date).now();
                msPanel.update(time - beginTime, 200);
                if (time > prevTime + 1000) {
                    fpsPanel.update((frames * 1000) / (time - prevTime), 100);
                    prevTime = time;
                    frames = 0;
                    if (memPanel) {
                        var memory = performance.memory;
                        memPanel.update(memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576);
                    }
                }
                return time;
            };
            this.update = function () {
                beginTime = _this.end();
            };
            // Backwards Compatibility
            this.domElement = container;
            this.setMode = showPanel;
        }
        Stats.init = function (parent) {
            if (!this.instance) {
                this.instance = new Stats();
                parent = parent || document.body;
                parent.appendChild(this.instance.dom);
            }
            feng3d.ticker.onframe(this.instance.update, this.instance);
        };
        ;
        return Stats;
    }());
    feng3d.Stats = Stats;
    var StatsPanel = /** @class */ (function () {
        function StatsPanel(name, fg, bg) {
            var min = Infinity, max = 0, round = Math.round;
            var PR = round(window.devicePixelRatio || 1);
            var WIDTH = 80 * PR, HEIGHT = 48 * PR, TEXT_X = 3 * PR, TEXT_Y = 2 * PR, GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR, GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;
            var canvas = document.createElement('canvas');
            canvas.width = WIDTH;
            canvas.height = HEIGHT;
            canvas.style.cssText = 'width:80px;height:48px';
            var context0 = canvas.getContext('2d');
            if (context0 == null) {
                feng3d.log("\u65E0\u6CD5\u521B\u5EFA CanvasRenderingContext2D ");
                return;
            }
            var context = context0;
            context.font = 'bold ' + (9 * PR) + 'px Helvetica,Arial,sans-serif';
            context.textBaseline = 'top';
            context.fillStyle = bg;
            context.fillRect(0, 0, WIDTH, HEIGHT);
            context.fillStyle = fg;
            context.fillText(name, TEXT_X, TEXT_Y);
            context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
            context.fillStyle = bg;
            context.globalAlpha = 0.9;
            context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
            this.dom = canvas;
            this.update = function (value, maxValue) {
                min = Math.min(min, value);
                max = Math.max(max, value);
                context.fillStyle = bg;
                context.globalAlpha = 1;
                context.fillRect(0, 0, WIDTH, GRAPH_Y);
                context.fillStyle = fg;
                context.fillText(round(value) + ' ' + name + ' (' + round(min) + '-' + round(max) + ')', TEXT_X, TEXT_Y);
                context.drawImage(canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT);
                context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);
                context.fillStyle = bg;
                context.globalAlpha = 0.9;
                context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round((1 - (value / maxValue)) * GRAPH_HEIGHT));
            };
        }
        return StatsPanel;
    }());
    feng3d.StatsPanel = StatsPanel;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var ArrayList = /** @class */ (function () {
        function ArrayList(source) {
            this._source = source || [];
            this._eventDispatcher = new feng3d.EventDispatcher();
        }
        Object.defineProperty(ArrayList.prototype, "length", {
            /**
             * 此集合中的项目数。
             */
            get: function () {
                return this._source.length;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 向列表末尾添加指定项目。
         */
        ArrayList.prototype.addItem = function (item) {
            this.addItemAt(item, this._source.length);
        };
        /**
         * 在指定的索引处添加项目。
         */
        ArrayList.prototype.addItemAt = function (item, index) {
            if (item instanceof Array) {
                for (var i = item.length - 1; i >= 0; i--) {
                    this.addItemAt(item[i], index);
                }
            }
            else {
                this._source.splice(index, 0, item);
                if (item instanceof feng3d.EventDispatcher) {
                    var _listenermap = this._eventDispatcher[feng3d.EVENT_KEY];
                    for (var type in _listenermap) {
                        var listenerVOs = _listenermap[type];
                        for (var i = 0; i < listenerVOs.length; i++) {
                            var element = listenerVOs[i];
                            item.on(type, element.listener, element.thisObject, element.priority);
                        }
                    }
                }
            }
        };
        /**
         * 获取指定索引处的项目。
         */
        ArrayList.prototype.getItemAt = function (index) {
            return this._source[index];
        };
        /**
         * 如果项目位于列表中（这样的话 getItemAt(index) == item），则返回该项目的索引。
         */
        ArrayList.prototype.getItemIndex = function (item) {
            return this._source.indexOf(item);
        };
        /**
         * 删除列表中的所有项目。
         */
        ArrayList.prototype.removeAll = function () {
            while (this._source.length > 0) {
                this.removeItemAt(this._source.length - 1);
            }
        };
        /**
         * 删除指定项目。
         */
        ArrayList.prototype.removeItem = function (item) {
            if (item instanceof Array) {
                for (var i = item.length - 1; i >= 0; i--) {
                    this.removeItem(item[i]);
                }
            }
            else {
                var index = this.getItemIndex(item);
                if (index > -1)
                    this.removeItemAt(index);
            }
        };
        /**
         * 删除指定索引处的项目并返回该项目。
         */
        ArrayList.prototype.removeItemAt = function (index) {
            var item = this._source.splice(index, 1)[0];
            if (item instanceof feng3d.EventDispatcher) {
                var _listenermap = this._eventDispatcher[feng3d.EVENT_KEY];
                for (var type in _listenermap) {
                    var listenerVOs = _listenermap[type];
                    for (var i = 0; i < listenerVOs.length; i++) {
                        var element = listenerVOs[i];
                        item.off(type, element.listener, element.thisObject);
                    }
                }
            }
            return item;
        };
        /**
         * 在指定的索引处放置项目。
         */
        ArrayList.prototype.setItemAt = function (item, index) {
            var deleteItem = this.removeItemAt(index);
            this.addItemAt(item, index);
            return deleteItem;
        };
        /**
         * 返回与 IList 实现的填充顺序相同的 Array。
         */
        ArrayList.prototype.toArray = function () {
            return this._source.concat();
        };
        /**
         * 添加项事件
         * @param type						事件的类型。
         * @param listener					处理事件的侦听器函数。
         * @param thisObject                listener函数作用域
         * @param priority					事件侦听器的优先级。数字越大，优先级越高。默认优先级为 0。
         */
        ArrayList.prototype.addItemEventListener = function (type, listener, thisObject, priority) {
            if (priority === void 0) { priority = 0; }
            this._eventDispatcher.on(type, listener, thisObject, priority);
            for (var i = 0; i < this._source.length; i++) {
                var item = this._source[i];
                if (item instanceof feng3d.EventDispatcher) {
                    item.on(type, listener, thisObject, priority);
                }
            }
        };
        /**
         * 移除项事件
         * @param type						事件的类型。
         * @param listener					要删除的侦听器对象。
         * @param thisObject                listener函数作用域
         */
        ArrayList.prototype.removeItemEventListener = function (type, listener, thisObject) {
            this._eventDispatcher.off(type, listener, thisObject);
            for (var i = 0; i < this._source.length; i++) {
                var item = this._source[i];
                if (item instanceof feng3d.EventDispatcher) {
                    item.off(type, listener, thisObject);
                }
            }
        };
        return ArrayList;
    }());
    feng3d.ArrayList = ArrayList;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 数学常量类
     */
    var MathConsts = /** @class */ (function () {
        function MathConsts() {
        }
        /**
         * 弧度转角度因子
         */
        MathConsts.RADIANS_TO_DEGREES = 180 / Math.PI;
        /**
         * 角度转弧度因子
         */
        MathConsts.DEGREES_TO_RADIANS = Math.PI / 180;
        return MathConsts;
    }());
    feng3d.MathConsts = MathConsts;
})(feng3d || (feng3d = {}));
Math.DEG2RAD = Math.PI / 180;
Math.RAD2DEG = 180 / Math.PI;
Math.generateUUID = function () {
    // http://www.broofa.com/Tools/Math.uuid.htm
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = new Array(36);
    var rnd = 0, r;
    return function generateUUID() {
        for (var i = 0; i < 36; i++) {
            if (i === 8 || i === 13 || i === 18 || i === 23) {
                uuid[i] = '-';
            }
            else if (i === 14) {
                uuid[i] = '4';
            }
            else {
                if (rnd <= 0x02)
                    rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
                r = rnd & 0xf;
                rnd = rnd >> 4;
                uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
            }
        }
        return uuid.join('');
    };
}();
Math.clamp = function (value, min, max) {
    return Math.max(min, Math.min(max, value));
};
Math.euclideanModulo = function (n, m) {
    return ((n % m) + m) % m;
};
Math.mapLinear = function (x, a1, a2, b1, b2) {
    return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
};
Math.lerp = function (x, y, t) {
    return (1 - t) * x + t * y;
};
Math.smoothstep = function (x, min, max) {
    if (x <= min)
        return 0;
    if (x >= max)
        return 1;
    x = (x - min) / (max - min);
    return x * x * (3 - 2 * x);
};
Math.smootherstep = function (x, min, max) {
    if (x <= min)
        return 0;
    if (x >= max)
        return 1;
    x = (x - min) / (max - min);
    return x * x * x * (x * (x * 6 - 15) + 10);
};
Math.randInt = function (low, high) {
    return low + Math.floor(Math.random() * (high - low + 1));
};
Math.randFloat = function (low, high) {
    return low + Math.random() * (high - low);
};
Math.randFloatSpread = function (range) {
    return range * (0.5 - Math.random());
};
Math.degToRad = function (degrees) {
    return degrees * Math.DEG2RAD;
};
Math.radToDeg = function (radians) {
    return radians * Math.RAD2DEG;
};
Math.isPowerOfTwo = function (value) {
    return (value & (value - 1)) === 0 && value !== 0;
};
Math.nearestPowerOfTwo = function (value) {
    return Math.pow(2, Math.round(Math.log(value) / Math.LN2));
};
Math.nextPowerOfTwo = function (value) {
    value--;
    value |= value >> 1;
    value |= value >> 2;
    value |= value >> 4;
    value |= value >> 8;
    value |= value >> 16;
    value++;
    return value;
};
Math.toRound = function (source, target, precision) {
    if (precision === void 0) { precision = 360; }
    return source + Math.round((target - source) / precision) * precision;
};
var feng3d;
(function (feng3d) {
    /**
     * Orientation3D 类是用于表示 Matrix3D 对象的方向样式的常量值枚举。方向的三个类型分别为欧拉角、轴角和四元数。Matrix3D 对象的 decompose 和 recompose 方法采用其中的某一个枚举类型来标识矩阵的旋转组件。
     * @author feng 2016-3-21
     */
    var Orientation3D = /** @class */ (function () {
        function Orientation3D() {
        }
        /**
        * 轴角方向结合使用轴和角度来确定方向。
        */
        Orientation3D.AXIS_ANGLE = "axisAngle";
        /**
        * 欧拉角（decompose() 和 recompose() 方法的默认方向）通过三个不同的对应于每个轴的旋转角来定义方向。
        */
        Orientation3D.EULER_ANGLES = "eulerAngles";
        /**
        * 四元数方向使用复数。
        */
        Orientation3D.QUATERNION = "quaternion";
        return Orientation3D;
    }());
    feng3d.Orientation3D = Orientation3D;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var DEG_TO_RAD = Math.PI / 180;
    /**
     * Point 对象表示二维坐标系统中的某个位置，其中 x 表示水平轴，y 表示垂直轴。
     */
    var Point = /** @class */ (function () {
        /**
         * 创建一个 egret.Point 对象.若不传入任何参数，将会创建一个位于（0，0）位置的点。
         * @param x 该对象的x属性值，默认为0
         * @param y 该对象的y属性值，默认为0
         */
        function Point(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        Object.defineProperty(Point.prototype, "length", {
            /**
             * 从 (0,0) 到此点的线段长度。
             */
            get: function () {
                return Math.sqrt(this.x * this.x + this.y * this.y);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 将 Point 的成员设置为指定值
         * @param x 该对象的x属性值
         * @param y 该对象的y属性值
         */
        Point.prototype.setTo = function (x, y) {
            this.x = x;
            this.y = y;
            return this;
        };
        /**
         * 克隆点对象
         */
        Point.prototype.clone = function () {
            return new Point(this.x, this.y);
        };
        /**
         * 确定两个点是否相同。如果两个点具有相同的 x 和 y 值，则它们是相同的点。
         * @param toCompare 要比较的点。
         * @returns 如果该对象与此 Point 对象相同，则为 true 值，如果不相同，则为 false。
         */
        Point.prototype.equals = function (toCompare) {
            return this.x == toCompare.x && this.y == toCompare.y;
        };
        /**
         * 返回 pt1 和 pt2 之间的距离。
         * @param p1 第一个点
         * @param p2 第二个点
         * @returns 第一个点和第二个点之间的距离。
         */
        Point.distance = function (p1, p2) {
            return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
        };
        /**
         * 将源 Point 对象中的所有点数据复制到调用方 Point 对象中。
         * @param sourcePoint 要从中复制数据的 Point 对象。
         */
        Point.prototype.copyFrom = function (sourcePoint) {
            this.x = sourcePoint.x;
            this.y = sourcePoint.y;
        };
        /**
         * 将另一个点的坐标添加到此点的坐标以创建一个新点。
         * @param v 要添加的点。
         * @returns 新点。
         */
        Point.prototype.add = function (v) {
            return new Point(this.x + v.x, this.y + v.y);
        };
        /**
         * 确定两个指定点之间的点。
         * 参数 f 确定新的内插点相对于参数 pt1 和 pt2 指定的两个端点所处的位置。参数 f 的值越接近 1.0，则内插点就越接近第一个点（参数 pt1）。参数 f 的值越接近 0，则内插点就越接近第二个点（参数 pt2）。
         * @param pt1 第一个点。
         * @param pt2 第二个点。
         * @param f 两个点之间的内插级别。表示新点将位于 pt1 和 pt2 连成的直线上的什么位置。如果 f=1，则返回 pt1；如果 f=0，则返回 pt2。
         * @returns 新的内插点。
         */
        Point.interpolate = function (pt1, pt2, f) {
            var f1 = 1 - f;
            return new Point(pt1.x * f + pt2.x * f1, pt1.y * f + pt2.y * f1);
        };
        /**
         * 将 (0,0) 和当前点之间的线段缩放为设定的长度。
         * @param thickness 缩放值。例如，如果当前点为 (0,5) 并且您将它规范化为 1，则返回的点位于 (0,1) 处。
         */
        Point.prototype.normalize = function (thickness) {
            if (this.x != 0 || this.y != 0) {
                var relativeThickness = thickness / this.length;
                this.x *= relativeThickness;
                this.y *= relativeThickness;
            }
        };
        /**
         * 按指定量偏移 Point 对象。dx 的值将添加到 x 的原始值中以创建新的 x 值。dy 的值将添加到 y 的原始值中以创建新的 y 值。
         * @param dx 水平坐标 x 的偏移量。
         * @param dy 水平坐标 y 的偏移量。
         */
        Point.prototype.offset = function (dx, dy) {
            this.x += dx;
            this.y += dy;
        };
        /**
         * 将一对极坐标转换为笛卡尔点坐标。
         * @param len 极坐标对的长度。
         * @param angle 极坐标对的角度（以弧度表示）。
         */
        Point.polar = function (len, angle) {
            return new Point(len * Math.cos(angle / DEG_TO_RAD), len * Math.sin(angle / DEG_TO_RAD));
        };
        /**
         * 从此点的坐标中减去另一个点的坐标以创建一个新点。
         * @param v 要减去的点。
         * @returns 新点。
         */
        Point.prototype.subtract = function (v) {
            return new Point(this.x - v.x, this.y - v.y);
        };
        /**
         * 返回包含 x 和 y 坐标的值的字符串。该字符串的格式为 "(x=x, y=y)"，因此为点 23,17 调用 toString() 方法将返回 "(x=23, y=17)"。
         * @returns 坐标的字符串表示形式。
         */
        Point.prototype.toString = function () {
            return "(x=" + this.x + ", y=" + this.y + ")";
        };
        /**
         * 返回包含 x 和 y 坐标值的数组
         */
        Point.prototype.toArray = function () {
            return [this.x, this.y];
        };
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], Point.prototype, "x", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], Point.prototype, "y", void 0);
        return Point;
    }());
    feng3d.Point = Point;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var rectanglePool = [];
    /**
     * 矩形
     *
     * Rectangle 对象是按其位置（由它左上角的点 (x, y) 确定）以及宽度和高度定义的区域。<br/>
     * Rectangle 类的 x、y、width 和 height 属性相互独立；更改一个属性的值不会影响其他属性。
     * 但是，right 和 bottom 属性与这四个属性是整体相关的。例如，如果更改 right 属性的值，则 width
     * 属性的值将发生变化；如果更改 bottom 属性，则 height 属性的值将发生变化。
     * @author feng 2016-04-27
     */
    var Rectangle = /** @class */ (function () {
        /**
         * 创建一个新 Rectangle 对象，其左上角由 x 和 y 参数指定，并具有指定的 width 和 height 参数。
         * @param x 矩形左上角的 x 坐标。
         * @param y 矩形左上角的 y 坐标。
         * @param width 矩形的宽度（以像素为单位）。
         * @param height 矩形的高度（以像素为单位）。
         */
        function Rectangle(x, y, width, height) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (width === void 0) { width = 0; }
            if (height === void 0) { height = 0; }
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        Object.defineProperty(Rectangle.prototype, "right", {
            /**
             * x 和 width 属性的和。
             */
            get: function () {
                return this.x + this.width;
            },
            set: function (value) {
                this.width = value - this.x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "bottom", {
            /**
             * y 和 height 属性的和。
             */
            get: function () {
                return this.y + this.height;
            },
            set: function (value) {
                this.height = value - this.y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "left", {
            /**
             * 矩形左上角的 x 坐标。更改 Rectangle 对象的 left 属性对 y 和 height 属性没有影响。但是，它会影响 width 属性，而更改 x 值不会影响 width 属性。
             * left 属性的值等于 x 属性的值。
             */
            get: function () {
                return this.x;
            },
            set: function (value) {
                this.width += this.x - value;
                this.x = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "top", {
            /**
             * 矩形左上角的 y 坐标。更改 Rectangle 对象的 top 属性对 x 和 width 属性没有影响。但是，它会影响 height 属性，而更改 y 值不会影响 height 属性。<br/>
             * top 属性的值等于 y 属性的值。
             */
            get: function () {
                return this.y;
            },
            set: function (value) {
                this.height += this.y - value;
                this.y = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "topLeft", {
            /**
             * 由该点的 x 和 y 坐标确定的 Rectangle 对象左上角的位置。
             */
            get: function () {
                return new feng3d.Point(this.left, this.top);
            },
            set: function (value) {
                this.top = value.y;
                this.left = value.x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "bottomRight", {
            /**
             * 由 right 和 bottom 属性的值确定的 Rectangle 对象的右下角的位置。
             */
            get: function () {
                return new feng3d.Point(this.right, this.bottom);
            },
            set: function (value) {
                this.bottom = value.y;
                this.right = value.x;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 将源 Rectangle 对象中的所有矩形数据复制到调用方 Rectangle 对象中。
         * @param sourceRect 要从中复制数据的 Rectangle 对象。
         */
        Rectangle.prototype.copyFrom = function (sourceRect) {
            this.x = sourceRect.x;
            this.y = sourceRect.y;
            this.width = sourceRect.width;
            this.height = sourceRect.height;
            return this;
        };
        /**
         * 将 Rectangle 的成员设置为指定值
         * @param x 矩形左上角的 x 坐标。
         * @param y 矩形左上角的 y 坐标。
         * @param width 矩形的宽度（以像素为单位）。
         * @param height 矩形的高度（以像素为单位）。
         */
        Rectangle.prototype.setTo = function (x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            return this;
        };
        /**
         * 确定由此 Rectangle 对象定义的矩形区域内是否包含指定的点。
         * @param x 检测点的x轴
         * @param y 检测点的y轴
         * @returns 如果检测点位于矩形内，返回true，否则，返回false
         */
        Rectangle.prototype.contains = function (x, y) {
            return this.x <= x &&
                this.x + this.width >= x &&
                this.y <= y &&
                this.y + this.height >= y;
        };
        /**
         * 如果在 toIntersect 参数中指定的 Rectangle 对象与此 Rectangle 对象相交，则返回交集区域作为 Rectangle 对象。如果矩形不相交，
         * 则此方法返回一个空的 Rectangle 对象，其属性设置为 0。
         * @param toIntersect 要对照比较以查看其是否与此 Rectangle 对象相交的 Rectangle 对象。
         * @returns 等于交集区域的 Rectangle 对象。如果该矩形不相交，则此方法返回一个空的 Rectangle 对象；即，其 x、y、width 和
         * height 属性均设置为 0 的矩形。
         */
        Rectangle.prototype.intersection = function (toIntersect) {
            return this.clone().$intersectInPlace(toIntersect);
        };
        /**
         * 按指定量增加 Rectangle 对象的大小（以像素为单位）
         * 保持 Rectangle 对象的中心点不变，使用 dx 值横向增加它的大小，使用 dy 值纵向增加它的大小。
         * @param dx Rectangle 对象横向增加的值。
         * @param dy Rectangle 对象纵向增加的值。
         */
        Rectangle.prototype.inflate = function (dx, dy) {
            this.x -= dx;
            this.width += 2 * dx;
            this.y -= dy;
            this.height += 2 * dy;
        };
        /**
         * @private
         */
        Rectangle.prototype.$intersectInPlace = function (clipRect) {
            var x0 = this.x;
            var y0 = this.y;
            var x1 = clipRect.x;
            var y1 = clipRect.y;
            var l = Math.max(x0, x1);
            var r = Math.min(x0 + this.width, x1 + clipRect.width);
            if (l <= r) {
                var t = Math.max(y0, y1);
                var b = Math.min(y0 + this.height, y1 + clipRect.height);
                if (t <= b) {
                    this.setTo(l, t, r - l, b - t);
                    return this;
                }
            }
            this.setEmpty();
            return this;
        };
        /**
         * 确定在 toIntersect 参数中指定的对象是否与此 Rectangle 对象相交。此方法检查指定的 Rectangle
         * 对象的 x、y、width 和 height 属性，以查看它是否与此 Rectangle 对象相交。
         * @param toIntersect 要与此 Rectangle 对象比较的 Rectangle 对象。
         * @returns 如果两个矩形相交，返回true，否则返回false
         */
        Rectangle.prototype.intersects = function (toIntersect) {
            return Math.max(this.x, toIntersect.x) <= Math.min(this.right, toIntersect.right)
                && Math.max(this.y, toIntersect.y) <= Math.min(this.bottom, toIntersect.bottom);
        };
        /**
         * 确定此 Rectangle 对象是否为空。
         * @returns 如果 Rectangle 对象的宽度或高度小于等于 0，则返回 true 值，否则返回 false。
         */
        Rectangle.prototype.isEmpty = function () {
            return this.width <= 0 || this.height <= 0;
        };
        /**
         * 将 Rectangle 对象的所有属性设置为 0。
         */
        Rectangle.prototype.setEmpty = function () {
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
        };
        /**
         * 返回一个新的 Rectangle 对象，其 x、y、width 和 height 属性的值与原始 Rectangle 对象的对应值相同。
         * @returns 新的 Rectangle 对象，其 x、y、width 和 height 属性的值与原始 Rectangle 对象的对应值相同。
         */
        Rectangle.prototype.clone = function () {
            return new Rectangle(this.x, this.y, this.width, this.height);
        };
        /**
         * 确定由此 Rectangle 对象定义的矩形区域内是否包含指定的点。
         * 此方法与 Rectangle.contains() 方法类似，只不过它采用 Point 对象作为参数。
         * @param point 包含点对象
         * @returns 如果包含，返回true，否则返回false
         */
        Rectangle.prototype.containsPoint = function (point) {
            if (this.x < point.x
                && this.x + this.width > point.x
                && this.y < point.y
                && this.y + this.height > point.y) {
                return true;
            }
            return false;
        };
        /**
         * 确定此 Rectangle 对象内是否包含由 rect 参数指定的 Rectangle 对象。
         * 如果一个 Rectangle 对象完全在另一个 Rectangle 的边界内，我们说第二个 Rectangle 包含第一个 Rectangle。
         * @param rect 所检查的 Rectangle 对象
         * @returns 如果此 Rectangle 对象包含您指定的 Rectangle 对象，则返回 true 值，否则返回 false。
         */
        Rectangle.prototype.containsRect = function (rect) {
            var r1 = rect.x + rect.width;
            var b1 = rect.y + rect.height;
            var r2 = this.x + this.width;
            var b2 = this.y + this.height;
            return (rect.x >= this.x) && (rect.x < r2) && (rect.y >= this.y) && (rect.y < b2) && (r1 > this.x) && (r1 <= r2) && (b1 > this.y) && (b1 <= b2);
        };
        /**
         * 确定在 toCompare 参数中指定的对象是否等于此 Rectangle 对象。
         * 此方法将某个对象的 x、y、width 和 height 属性与此 Rectangle 对象所对应的相同属性进行比较。
         * @param toCompare 要与此 Rectangle 对象进行比较的矩形。
         * @returns 如果对象具有与此 Rectangle 对象完全相同的 x、y、width 和 height 属性值，则返回 true 值，否则返回 false。
         */
        Rectangle.prototype.equals = function (toCompare) {
            if (this === toCompare) {
                return true;
            }
            return this.x === toCompare.x && this.y === toCompare.y
                && this.width === toCompare.width && this.height === toCompare.height;
        };
        /**
         * 增加 Rectangle 对象的大小。此方法与 Rectangle.inflate() 方法类似，只不过它采用 Point 对象作为参数。
         */
        Rectangle.prototype.inflatePoint = function (point) {
            this.inflate(point.x, point.y);
        };
        /**
         * 按指定量调整 Rectangle 对象的位置（由其左上角确定）。
         * @param dx 将 Rectangle 对象的 x 值移动此数量。
         * @param dy 将 Rectangle 对象的 t 值移动此数量。
         */
        Rectangle.prototype.offset = function (dx, dy) {
            this.x += dx;
            this.y += dy;
        };
        /**
         * 将 Point 对象用作参数来调整 Rectangle 对象的位置。此方法与 Rectangle.offset() 方法类似，只不过它采用 Point 对象作为参数。
         * @param point 要用于偏移此 Rectangle 对象的 Point 对象。
         */
        Rectangle.prototype.offsetPoint = function (point) {
            this.offset(point.x, point.y);
        };
        /**
         * 生成并返回一个字符串，该字符串列出 Rectangle 对象的水平位置和垂直位置以及高度和宽度。
         * @returns 一个字符串，它列出了 Rectangle 对象的下列各个属性的值：x、y、width 和 height。
         */
        Rectangle.prototype.toString = function () {
            return "(x=" + this.x + ", y=" + this.y + ", width=" + this.width + ", height=" + this.height + ")";
        };
        /**
         * 通过填充两个矩形之间的水平和垂直空间，将这两个矩形组合在一起以创建一个新的 Rectangle 对象。
         * @param toUnion 要添加到此 Rectangle 对象的 Rectangle 对象。
         * @returns 充当两个矩形的联合的新 Rectangle 对象。
         */
        Rectangle.prototype.union = function (toUnion) {
            var result = this.clone();
            if (toUnion.isEmpty()) {
                return result;
            }
            if (result.isEmpty()) {
                result.copyFrom(toUnion);
                return result;
            }
            var l = Math.min(result.x, toUnion.x);
            var t = Math.min(result.y, toUnion.y);
            result.setTo(l, t, Math.max(result.right, toUnion.right) - l, Math.max(result.bottom, toUnion.bottom) - t);
            return result;
        };
        return Rectangle;
    }());
    feng3d.Rectangle = Rectangle;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Vector3D 类使用笛卡尔坐标 x、y 和 z 表示三维空间中的点或位置
     * @author feng 2016-3-21
     */
    var Vector3D = /** @class */ (function () {
        /**
         * 创建 Vector3D 对象的实例。如果未指定构造函数的参数，则将使用元素 (0,0,0,0) 创建 Vector3D 对象。
         * @param x 第一个元素，例如 x 坐标。
         * @param y 第二个元素，例如 y 坐标。
         * @param z 第三个元素，例如 z 坐标。
         * @param w 表示额外数据的可选元素，例如旋转角度
         */
        function Vector3D(x, y, z, w) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (z === void 0) { z = 0; }
            if (w === void 0) { w = 0; }
            /**
            * Vector3D 对象中的第一个元素，例如，三维空间中某个点的 x 坐标。默认值为 0
            */
            this.x = 0;
            /**
             * Vector3D 对象中的第二个元素，例如，三维空间中某个点的 y 坐标。默认值为 0
             */
            this.y = 0;
            /**
             * Vector3D 对象中的第三个元素，例如，三维空间中某个点的 z 坐标。默认值为 0
             */
            this.z = 0;
            /**
             * Vector3D 对象的第四个元素（除了 x、y 和 z 属性之外）可以容纳数据，例如旋转角度。默认值为 0
             */
            this.w = 0;
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        Vector3D.fromArray = function (array, offset) {
            if (offset === void 0) { offset = 0; }
            return new Vector3D().fromArray(array, offset);
        };
        Object.defineProperty(Vector3D.prototype, "length", {
            /**
            * 当前 Vector3D 对象的长度（大小），即从原点 (0,0,0) 到该对象的 x、y 和 z 坐标的距离。w 属性将被忽略。单位矢量具有的长度或大小为一。
            */
            get: function () {
                return Math.sqrt(this.lengthSquared);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector3D.prototype, "lengthSquared", {
            /**
            * 当前 Vector3D 对象长度的平方，它是使用 x、y 和 z 属性计算出来的。w 属性将被忽略。尽可能使用 lengthSquared() 方法，而不要使用 Vector3D.length() 方法的 Math.sqrt() 方法调用，后者速度较慢。
            */
            get: function () {
                return this.x * this.x + this.y * this.y + this.z * this.z;
            },
            enumerable: true,
            configurable: true
        });
        Vector3D.prototype.fromArray = function (array, offset) {
            if (offset === void 0) { offset = 0; }
            this.x = array[offset];
            this.y = array[offset + 1];
            this.z = array[offset + 2];
            return this;
        };
        /**
         * 将当前 Vector3D 对象的 x、y 和 z 元素的值与另一个 Vector3D 对象的 x、y 和 z 元素的值相加。
         * @param a 要与当前 Vector3D 对象相加的 Vector3D 对象。
         * @return 一个 Vector3D 对象，它是将当前 Vector3D 对象与另一个 Vector3D 对象相加所产生的结果。
         */
        Vector3D.prototype.add = function (a) {
            return new Vector3D(this.x + a.x, this.y + a.y, this.z + a.z, this.w + a.w);
        };
        /**
         * 返回一个新 Vector3D 对象，它是与当前 Vector3D 对象完全相同的副本。
         * @return 一个新 Vector3D 对象，它是当前 Vector3D 对象的副本。
         */
        Vector3D.prototype.clone = function () {
            return new Vector3D(this.x, this.y, this.z, this.w);
        };
        /**
         * 将源 Vector3D 对象中的所有矢量数据复制到调用方 Vector3D 对象中。
         * @return 要从中复制数据的 Vector3D 对象。
         */
        Vector3D.prototype.copyFrom = function (sourceVector3D) {
            this.x = sourceVector3D.x;
            this.y = sourceVector3D.y;
            this.z = sourceVector3D.z;
            this.w = sourceVector3D.w;
        };
        /**
         * 返回一个新的 Vector3D 对象，它与当前 Vector3D 对象和另一个 Vector3D 对象垂直（成直角）。
         */
        Vector3D.prototype.crossProduct = function (a) {
            return new Vector3D(this.y * a.z - this.z * a.y, this.z * a.x - this.x * a.z, this.x * a.y - this.y * a.x, 1);
        };
        /**
         * 按照指定的 Vector3D 对象的 x、y 和 z 元素的值递减当前 Vector3D 对象的 x、y 和 z 元素的值。
         */
        Vector3D.prototype.decrementBy = function (a) {
            this.x -= a.x;
            this.y -= a.y;
            this.z -= a.z;
        };
        /**
         * 通过将当前 Vector3D 对象的 x、y 和 z 元素乘以指定的 Vector3D 对象的 x、y 和 z 元素得到新对象。
         */
        Vector3D.prototype.multiply = function (a) {
            return new Vector3D(this.x * a.x, this.y * a.y, this.z * a.z);
        };
        /**
         * 通过将当前 Vector3D 对象的 x、y 和 z 元素除以指定的 Vector3D 对象的 x、y 和 z 元素得到新对象。
         */
        Vector3D.prototype.divide = function (a) {
            return new Vector3D(this.x / a.x, this.y / a.y, this.z / a.z);
        };
        /**
         * 如果当前 Vector3D 对象和作为参数指定的 Vector3D 对象均为单位顶点，此方法将返回这两个顶点之间所成角的余弦值。
         */
        Vector3D.prototype.dotProduct = function (a) {
            return this.x * a.x + this.y * a.y + this.z * a.z;
        };
        /**
         * 通过将当前 Vector3D 对象的 x、y 和 z 元素与指定的 Vector3D 对象的 x、y 和 z 元素进行比较，确定这两个对象是否相等。
         */
        Vector3D.prototype.equals = function (object, allFour, precision) {
            if (allFour === void 0) { allFour = false; }
            if (precision === void 0) { precision = 0.0001; }
            if (Math.abs(this.x - object.x) > precision)
                return false;
            if (Math.abs(this.y - object.y) > precision)
                return false;
            if (Math.abs(this.z - object.z) > precision)
                return false;
            if (allFour && Math.abs(this.w - object.w) > precision)
                return false;
            return true;
        };
        /**
         * 按照指定的 Vector3D 对象的 x、y 和 z 元素的值递增当前 Vector3D 对象的 x、y 和 z 元素的值。
         */
        Vector3D.prototype.incrementBy = function (a) {
            this.x += a.x;
            this.y += a.y;
            this.z += a.z;
            return this;
        };
        /**
         * 将当前 Vector3D 对象设置为其逆对象。
         */
        Vector3D.prototype.negate = function () {
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
            return this;
        };
        /**
         * 通过将最前面的三个元素（x、y、z）除以矢量的长度可将 Vector3D 对象转换为单位矢量。
         */
        Vector3D.prototype.normalize = function (thickness) {
            if (thickness === void 0) { thickness = 1; }
            if (this.length != 0) {
                var invLength = thickness / this.length;
                this.x *= invLength;
                this.y *= invLength;
                this.z *= invLength;
            }
            return this;
        };
        /**
         * 按标量（大小）缩放当前的 Vector3D 对象。
         */
        Vector3D.prototype.scaleBy = function (s) {
            this.x *= s;
            this.y *= s;
            this.z *= s;
            return this;
        };
        /**
         * 将 Vector3D 的成员设置为指定值
         */
        Vector3D.prototype.setTo = function (x, y, z, w) {
            this.x = x;
            this.y = y;
            this.z = z;
            if (w !== undefined)
                this.w = w;
            return this;
        };
        /**
         * 从另一个 Vector3D 对象的 x、y 和 z 元素的值中减去当前 Vector3D 对象的 x、y 和 z 元素的值。
         */
        Vector3D.prototype.subtract = function (a) {
            return new Vector3D(this.x - a.x, this.y - a.y, this.z - a.z);
        };
        /**
         * 返回当前 Vector3D 对象的字符串表示形式。
         */
        Vector3D.prototype.toString = function () {
            return "<" + this.x + ", " + this.y + ", " + this.z + ">";
        };
        /**
         * 返回当前 Vector3D 对象4个元素的数组
         */
        Vector3D.prototype.toArray = function (num) {
            if (num === void 0) { num = 4; }
            if (num == 3) {
                return [this.x, this.y, this.z];
            }
            else {
                return [this.x, this.y, this.z, this.w];
            }
        };
        /**
        * 定义为 Vector3D 对象的 x 轴，坐标为 (1,0,0)。
        */
        Vector3D.X_AXIS = new Vector3D(1, 0, 0);
        /**
        * 定义为 Vector3D 对象的 y 轴，坐标为 (0,1,0)
        */
        Vector3D.Y_AXIS = new Vector3D(0, 1, 0);
        /**
        * 定义为 Vector3D 对象的 z 轴，坐标为 (0,0,1)
        */
        Vector3D.Z_AXIS = new Vector3D(0, 0, 1);
        __decorate([
            feng3d.serialize(0),
            feng3d.oav()
        ], Vector3D.prototype, "x", void 0);
        __decorate([
            feng3d.serialize(0),
            feng3d.oav()
        ], Vector3D.prototype, "y", void 0);
        __decorate([
            feng3d.serialize(0),
            feng3d.oav()
        ], Vector3D.prototype, "z", void 0);
        __decorate([
            feng3d.serialize(0),
            feng3d.oav()
        ], Vector3D.prototype, "w", void 0);
        return Vector3D;
    }());
    feng3d.Vector3D = Vector3D;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Matrix3D 类表示一个转换矩阵，该矩阵确定三维 (3D) 显示对象的位置和方向。
     * 该矩阵可以执行转换功能，包括平移（沿 x、y 和 z 轴重新定位）、旋转和缩放（调整大小）。
     * Matrix3D 类还可以执行透视投影，这会将 3D 坐标空间中的点映射到二维 (2D) 视图。
     * ```
     *  ---            方向              平移 ---
     *  |   scaleX      0         0       tx    |
     *  |     0       scaleY      0       ty    |
     *  |     0         0       scaleZ    tz    |
     *  |     0         0         0       tw    |
     *  ---  x轴        y轴      z轴          ---
     *
     *  ---            方向              平移 ---
     *  |     0         4         8       12    |
     *  |     1         5         9       13    |
     *  |     2         6        10       14    |
     *  |     3         7        11       15    |
     *  ---  x轴        y轴      z轴          ---
     * ```
     */
    var Matrix3D = /** @class */ (function () {
        /**
         * 创建 Matrix3D 对象。
         * @param   datas    一个由 16 个数字组成的矢量，其中，每四个元素可以是 4x4 矩阵的一列。
         */
        function Matrix3D(datas) {
            this.rawData = datas || [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1 //
            ];
        }
        Object.defineProperty(Matrix3D.prototype, "position", {
            /**
             * 一个保存显示对象在转换参照帧中的 3D 坐标 (x,y,z) 位置的 Vector3D 对象。
             */
            get: function () {
                return new feng3d.Vector3D(this.rawData[12], this.rawData[13], this.rawData[14]);
            },
            set: function (value) {
                this.rawData[12] = value.x;
                this.rawData[13] = value.y;
                this.rawData[14] = value.z;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix3D.prototype, "determinant", {
            /**
             * 一个用于确定矩阵是否可逆的数字。
             */
            get: function () {
                return ((this.rawData[0] * this.rawData[5] - this.rawData[4] * this.rawData[1]) * (this.rawData[10] * this.rawData[15] - this.rawData[14] * this.rawData[11]) //
                    - (this.rawData[0] * this.rawData[9] - this.rawData[8] * this.rawData[1]) * (this.rawData[6] * this.rawData[15] - this.rawData[14] * this.rawData[7]) //
                    + (this.rawData[0] * this.rawData[13] - this.rawData[12] * this.rawData[1]) * (this.rawData[6] * this.rawData[11] - this.rawData[10] * this.rawData[7]) //
                    + (this.rawData[4] * this.rawData[9] - this.rawData[8] * this.rawData[5]) * (this.rawData[2] * this.rawData[15] - this.rawData[14] * this.rawData[3]) //
                    - (this.rawData[4] * this.rawData[13] - this.rawData[12] * this.rawData[5]) * (this.rawData[2] * this.rawData[11] - this.rawData[10] * this.rawData[3]) //
                    + (this.rawData[8] * this.rawData[13] - this.rawData[12] * this.rawData[9]) * (this.rawData[2] * this.rawData[7] - this.rawData[6] * this.rawData[3]) //
                );
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix3D.prototype, "forward", {
            /**
             * 前方（+Z轴方向）
             */
            get: function () {
                var v = new feng3d.Vector3D(0.0, 0.0, 0.0);
                this.copyColumnTo(2, v);
                v.normalize();
                return v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix3D.prototype, "up", {
            /**
             * 上方（+y轴方向）
             */
            get: function () {
                var v = new feng3d.Vector3D();
                this.copyColumnTo(1, v);
                v.normalize();
                return v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix3D.prototype, "right", {
            /**
             * 右方（+x轴方向）
             */
            get: function () {
                var v = new feng3d.Vector3D();
                this.copyColumnTo(0, v);
                v.normalize();
                return v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix3D.prototype, "back", {
            /**
             * 后方（-z轴方向）
             */
            get: function () {
                var v = new feng3d.Vector3D(0.0, 0.0, 0.0);
                this.copyColumnTo(2, v);
                v.normalize();
                v.negate();
                return v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix3D.prototype, "down", {
            /**
             * 下方（-y轴方向）
             */
            get: function () {
                var v = new feng3d.Vector3D();
                this.copyColumnTo(1, v);
                v.normalize();
                v.negate();
                return v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix3D.prototype, "left", {
            /**
             * 左方（-x轴方向）
             */
            get: function () {
                var v = new feng3d.Vector3D();
                this.copyColumnTo(0, v);
                v.normalize();
                v.negate();
                return v;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 创建旋转矩阵
         * @param   axis            旋转轴
         * @param   degrees         角度
         */
        Matrix3D.fromAxisRotate = function (axis, degrees) {
            var n = axis.clone();
            n.normalize();
            var q = degrees * Math.PI / 180;
            var sinq = Math.sin(q);
            var cosq = Math.cos(q);
            var lcosq = 1 - cosq;
            var rotationMat = new Matrix3D([
                n.x * n.x * lcosq + cosq, n.x * n.y * lcosq + n.z * sinq, n.x * n.z * lcosq - n.y * sinq, 0,
                n.x * n.y * lcosq - n.z * sinq, n.y * n.y * lcosq + cosq, n.y * n.z * lcosq + n.x * sinq, 0,
                n.x * n.z * lcosq + n.y * sinq, n.y * n.z * lcosq - n.x * sinq, n.z * n.z * lcosq + cosq, 0,
                0, 0, 0, 1 //
            ]);
            return rotationMat;
        };
        Matrix3D.fromRotation = function () {
            var rx = 0, ry = 0, rz = 0;
            if (arguments[0] instanceof Object) {
                rx = arguments[0].x;
                ry = arguments[0].y;
                rz = arguments[0].z;
            }
            else {
                rx = arguments[0];
                ry = arguments[1];
                rz = arguments[2];
            }
            var rotationMat = new Matrix3D();
            rotationMat.appendRotation(feng3d.Vector3D.X_AXIS, rx);
            rotationMat.appendRotation(feng3d.Vector3D.Y_AXIS, ry);
            rotationMat.appendRotation(feng3d.Vector3D.Z_AXIS, rz);
            return rotationMat;
        };
        Matrix3D.fromScale = function () {
            var xScale = 1, yScale = 1, zScale = 1;
            if (arguments[0] instanceof Object) {
                xScale = arguments[0].x;
                yScale = arguments[0].y;
                zScale = arguments[0].z;
            }
            else {
                xScale = arguments[0];
                yScale = arguments[1];
                zScale = arguments[2];
            }
            var rotationMat = new Matrix3D([
                xScale, 0.0000, 0.0000, 0,
                0.0000, yScale, 0.0000, 0,
                0.0000, 0.0000, zScale, 0,
                0.0000, 0.0000, 0.0000, 1 //
            ]);
            return rotationMat;
        };
        Matrix3D.fromPosition = function () {
            var x = 0, y = 0, z = 0;
            if (arguments[0] instanceof Object) {
                x = arguments[0].x;
                y = arguments[0].y;
                z = arguments[0].z;
            }
            else {
                x = arguments[0];
                y = arguments[1];
                z = arguments[2];
            }
            var rotationMat = new Matrix3D([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                x, y, z, 1 //
            ]);
            return rotationMat;
        };
        /**
         * 通过将另一个 Matrix3D 对象与当前 Matrix3D 对象相乘来后置一个矩阵。
         */
        Matrix3D.prototype.append = function (lhs) {
            var //
            m111 = this.rawData[0], m121 = this.rawData[4], m131 = this.rawData[8], m141 = this.rawData[12], //
            m112 = this.rawData[1], m122 = this.rawData[5], m132 = this.rawData[9], m142 = this.rawData[13], //
            m113 = this.rawData[2], m123 = this.rawData[6], m133 = this.rawData[10], m143 = this.rawData[14], //
            m114 = this.rawData[3], m124 = this.rawData[7], m134 = this.rawData[11], m144 = this.rawData[15], //
            m211 = lhs.rawData[0], m221 = lhs.rawData[4], m231 = lhs.rawData[8], m241 = lhs.rawData[12], //
            m212 = lhs.rawData[1], m222 = lhs.rawData[5], m232 = lhs.rawData[9], m242 = lhs.rawData[13], //
            m213 = lhs.rawData[2], m223 = lhs.rawData[6], m233 = lhs.rawData[10], m243 = lhs.rawData[14], //
            m214 = lhs.rawData[3], m224 = lhs.rawData[7], m234 = lhs.rawData[11], m244 = lhs.rawData[15];
            this.rawData[0] = m111 * m211 + m112 * m221 + m113 * m231 + m114 * m241;
            this.rawData[1] = m111 * m212 + m112 * m222 + m113 * m232 + m114 * m242;
            this.rawData[2] = m111 * m213 + m112 * m223 + m113 * m233 + m114 * m243;
            this.rawData[3] = m111 * m214 + m112 * m224 + m113 * m234 + m114 * m244;
            this.rawData[4] = m121 * m211 + m122 * m221 + m123 * m231 + m124 * m241;
            this.rawData[5] = m121 * m212 + m122 * m222 + m123 * m232 + m124 * m242;
            this.rawData[6] = m121 * m213 + m122 * m223 + m123 * m233 + m124 * m243;
            this.rawData[7] = m121 * m214 + m122 * m224 + m123 * m234 + m124 * m244;
            this.rawData[8] = m131 * m211 + m132 * m221 + m133 * m231 + m134 * m241;
            this.rawData[9] = m131 * m212 + m132 * m222 + m133 * m232 + m134 * m242;
            this.rawData[10] = m131 * m213 + m132 * m223 + m133 * m233 + m134 * m243;
            this.rawData[11] = m131 * m214 + m132 * m224 + m133 * m234 + m134 * m244;
            this.rawData[12] = m141 * m211 + m142 * m221 + m143 * m231 + m144 * m241;
            this.rawData[13] = m141 * m212 + m142 * m222 + m143 * m232 + m144 * m242;
            this.rawData[14] = m141 * m213 + m142 * m223 + m143 * m233 + m144 * m243;
            this.rawData[15] = m141 * m214 + m142 * m224 + m143 * m234 + m144 * m244;
            feng3d.debuger && feng3d.assert(this.rawData[0] !== NaN && this.rawData[4] !== NaN && this.rawData[8] !== NaN && this.rawData[12] !== NaN);
            return this;
        };
        /**
         * 在 Matrix3D 对象上后置一个增量旋转。
         * @param   axis            旋转轴
         * @param   degrees         角度
         * @param   pivotPoint      旋转中心点
         */
        Matrix3D.prototype.appendRotation = function (axis, degrees, pivotPoint) {
            var rotationMat = Matrix3D.fromAxisRotate(axis, degrees);
            if (pivotPoint != null) {
                this.appendTranslation(-pivotPoint.x, -pivotPoint.y, -pivotPoint.z);
            }
            this.append(rotationMat);
            if (pivotPoint != null) {
                this.appendTranslation(pivotPoint.x, pivotPoint.y, pivotPoint.z);
            }
            return this;
        };
        /**
         * 在 Matrix3D 对象上后置一个增量缩放，沿 x、y 和 z 轴改变位置。
         * @param   xScale      用于沿 x 轴缩放对象的乘数。
         * @param   yScale      用于沿 y 轴缩放对象的乘数。
         * @param   zScale      用于沿 z 轴缩放对象的乘数。
         */
        Matrix3D.prototype.appendScale = function (xScale, yScale, zScale) {
            var scaleMat = Matrix3D.fromScale(xScale, yScale, zScale);
            this.append(scaleMat);
            return this;
        };
        /**
         * 在 Matrix3D 对象上后置一个增量平移，沿 x、y 和 z 轴重新定位。
         * @param   x   沿 x 轴的增量平移。
         * @param   y   沿 y 轴的增量平移。
         * @param   z   沿 z 轴的增量平移。
         */
        Matrix3D.prototype.appendTranslation = function (x, y, z) {
            this.rawData[12] += x;
            this.rawData[13] += y;
            this.rawData[14] += z;
            return this;
        };
        /**
         * 返回一个新 Matrix3D 对象，它是与当前 Matrix3D 对象完全相同的副本。
         */
        Matrix3D.prototype.clone = function () {
            var ret = new Matrix3D();
            ret.copyFrom(this);
            return ret;
        };
        /**
         * 将 Vector3D 对象复制到调用方 Matrix3D 对象的特定列中。
         * @param   column      副本的目标列。
         * @param   vector3D    要从中复制数据的 Vector3D 对象。
         */
        Matrix3D.prototype.copyColumnFrom = function (column, vector3D) {
            this.rawData[column * 4 + 0] = vector3D.x;
            this.rawData[column * 4 + 1] = vector3D.y;
            this.rawData[column * 4 + 2] = vector3D.z;
            this.rawData[column * 4 + 3] = vector3D.w;
            return this;
        };
        /**
         * 将调用方 Matrix3D 对象的特定列复制到 Vector3D 对象中。
         * @param   column       要从中复制数据的列。
         * @param   vector3D     副本的目标 Vector3D 对象。
         */
        Matrix3D.prototype.copyColumnTo = function (column, vector3D) {
            vector3D.x = this.rawData[column * 4 + 0];
            vector3D.y = this.rawData[column * 4 + 1];
            vector3D.z = this.rawData[column * 4 + 2];
            vector3D.w = this.rawData[column * 4 + 3];
            return this;
        };
        /**
         * 将源 Matrix3D 对象中的所有矩阵数据复制到调用方 Matrix3D 对象中。
         * @param   sourceMatrix3D      要从中复制数据的 Matrix3D 对象。
         */
        Matrix3D.prototype.copyFrom = function (sourceMatrix3D) {
            for (var i = 0; i < 16; i++) {
                this.rawData[i] = sourceMatrix3D.rawData[i];
            }
            return this;
        };
        /**
         * 将源 Vector 对象中的所有矢量数据复制到调用方 Matrix3D 对象中。利用可选索引参数，您可以选择矢量中的任何起始文字插槽。
         * @param   vector      要从中复制数据的 Vector 对象。
         * @param   index       vector中的起始位置
         * @param   transpose   是否转置当前矩阵
         */
        Matrix3D.prototype.copyRawDataFrom = function (vector, index, transpose) {
            if (index === void 0) { index = 0; }
            if (transpose === void 0) { transpose = false; }
            if (vector.length - index < 16) {
                throw new Error("vector参数数据长度不够！");
            }
            if (transpose) {
                this.transpose();
            }
            for (var i = 0; i < 16; i++) {
                this.rawData[i] = vector[index + i];
            }
            if (transpose) {
                this.transpose();
            }
            return this;
        };
        /**
         * 将调用方 Matrix3D 对象中的所有矩阵数据复制到提供的矢量中。
         * @param   vector      要将数据复制到的 Vector 对象。
         * @param   index       vector中的起始位置
         * @param   transpose   是否转置当前矩阵
         */
        Matrix3D.prototype.copyRawDataTo = function (vector, index, transpose) {
            if (index === void 0) { index = 0; }
            if (transpose === void 0) { transpose = false; }
            if (transpose) {
                this.transpose();
            }
            for (var i = 0; i < 16; i++) {
                vector[i + index] = this.rawData[i];
            }
            if (transpose) {
                this.transpose();
            }
            return this;
        };
        /**
         * 将 Vector3D 对象复制到调用方 Matrix3D 对象的特定行中。
         * @param   row         要将数据复制到的行。
         * @param   vector3D    要从中复制数据的 Vector3D 对象。
         */
        Matrix3D.prototype.copyRowFrom = function (row, vector3D) {
            this.rawData[row + 4 * 0] = vector3D.x;
            this.rawData[row + 4 * 1] = vector3D.y;
            this.rawData[row + 4 * 2] = vector3D.z;
            this.rawData[row + 4 * 3] = vector3D.w;
            return this;
        };
        /**
         * 将调用方 Matrix3D 对象的特定行复制到 Vector3D 对象中。
         * @param   row         要从中复制数据的行。
         * @param   vector3D    将作为数据复制目的地的 Vector3D 对象。
         */
        Matrix3D.prototype.copyRowTo = function (row, vector3D) {
            vector3D.x = this.rawData[row + 4 * 0];
            vector3D.y = this.rawData[row + 4 * 1];
            vector3D.z = this.rawData[row + 4 * 2];
            vector3D.w = this.rawData[row + 4 * 3];
            return this;
        };
        /**
         * 拷贝当前矩阵
         * @param   dest    目标矩阵
         */
        Matrix3D.prototype.copyToMatrix3D = function (dest) {
            dest.rawData = this.rawData.concat();
            return this;
        };
        /**
         * 将转换矩阵的平移、旋转和缩放设置作为由三个 Vector3D 对象组成的矢量返回。
         * @return      一个由三个 Vector3D 对象组成的矢量，其中，每个对象分别容纳平移、旋转和缩放设置。
         */
        Matrix3D.prototype.decompose = function (orientationStyle, result) {
            if (orientationStyle === void 0) { orientationStyle = "eulerAngles"; }
            var raw = this.rawData;
            var a = raw[0];
            var e = raw[1];
            var i = raw[2];
            var b = raw[4];
            var f = raw[5];
            var j = raw[6];
            var c = raw[8];
            var g = raw[9];
            var k = raw[10];
            var x = raw[12];
            var y = raw[13];
            var z = raw[14];
            var tx = Math.sqrt(a * a + e * e + i * i);
            var ty = Math.sqrt(b * b + f * f + j * j);
            var tz = Math.sqrt(c * c + g * g + k * k);
            var tw = 0;
            var scaleX = tx;
            var scaleY = ty;
            var scaleZ = tz;
            if (a * (f * k - j * g) - e * (b * k - j * c) + i * (b * g - f * c) < 0) {
                scaleZ = -scaleZ;
            }
            a = a / scaleX;
            e = e / scaleX;
            i = i / scaleX;
            b = b / scaleY;
            f = f / scaleY;
            j = j / scaleY;
            c = c / scaleZ;
            g = g / scaleZ;
            k = k / scaleZ;
            if (orientationStyle == feng3d.Orientation3D.EULER_ANGLES) {
                tx = Math.atan2(j, k);
                ty = Math.atan2(-i, Math.sqrt(a * a + e * e));
                var s1 = Math.sin(tx);
                var c1 = Math.cos(tx);
                tz = Math.atan2(s1 * c - c1 * b, c1 * f - s1 * g);
            }
            else if (orientationStyle == feng3d.Orientation3D.AXIS_ANGLE) {
                tw = Math.acos((a + f + k - 1) / 2);
                var len = Math.sqrt((j - g) * (j - g) + (c - i) * (c - i) + (e - b) * (e - b));
                tx = (j - g) / len;
                ty = (c - i) / len;
                tz = (e - b) / len;
            }
            else {
                var tr = a + f + k;
                if (tr > 0) {
                    tw = Math.sqrt(1 + tr) / 2;
                    tx = (j - g) / (4 * tw);
                    ty = (c - i) / (4 * tw);
                    tz = (e - b) / (4 * tw);
                }
                else if ((a > f) && (a > k)) {
                    tx = Math.sqrt(1 + a - f - k) / 2;
                    tw = (j - g) / (4 * tx);
                    ty = (e + b) / (4 * tx);
                    tz = (c + i) / (4 * tx);
                }
                else if (f > k) {
                    ty = Math.sqrt(1 + f - a - k) / 2;
                    tx = (e + b) / (4 * ty);
                    tw = (c - i) / (4 * ty);
                    tz = (j + g) / (4 * ty);
                }
                else {
                    tz = Math.sqrt(1 + k - a - f) / 2;
                    tx = (c + i) / (4 * tz);
                    ty = (j + g) / (4 * tz);
                    tw = (e - b) / (4 * tz);
                }
            }
            result = result || [new feng3d.Vector3D(), new feng3d.Vector3D(), new feng3d.Vector3D()];
            result[0].x = x;
            result[0].y = y;
            result[0].z = z;
            result[1].x = tx;
            result[1].y = ty;
            result[1].z = tz;
            result[1].w = tw;
            result[2].x = scaleX;
            result[2].y = scaleY;
            result[2].z = scaleZ;
            return result;
        };
        /**
         * 使用不含平移元素的转换矩阵将 Vector3D 对象从一个空间坐标转换到另一个空间坐标。
         * @param   v   一个容纳要转换的坐标的 Vector3D 对象。
         * @return  一个包含转换后的坐标的 Vector3D 对象。
         */
        Matrix3D.prototype.deltaTransformVector = function (v, vout) {
            var x = v.x;
            var y = v.y;
            var z = v.z;
            vout = vout || new feng3d.Vector3D();
            vout.x = x * this.rawData[0] + y * this.rawData[4] + z * this.rawData[8];
            vout.y = x * this.rawData[1] + y * this.rawData[5] + z * this.rawData[9];
            vout.z = x * this.rawData[2] + y * this.rawData[6] + z * this.rawData[10];
            vout.w = x * this.rawData[3] + y * this.rawData[7] + z * this.rawData[11];
            return vout;
        };
        /**
         * 将当前矩阵转换为恒等或单位矩阵。
         */
        Matrix3D.prototype.identity = function () {
            this.rawData[1] = 0;
            this.rawData[2] = 0;
            this.rawData[3] = 0;
            this.rawData[4] = 0;
            this.rawData[6] = 0;
            this.rawData[7] = 0;
            this.rawData[8] = 0;
            this.rawData[9] = 0;
            this.rawData[11] = 0;
            this.rawData[12] = 0;
            this.rawData[13] = 0;
            this.rawData[14] = 0;
            this.rawData[0] = 1;
            this.rawData[5] = 1;
            this.rawData[10] = 1;
            this.rawData[15] = 1;
            return this;
        };
        /**
         * 反转当前矩阵。逆矩阵
         * @return      如果成功反转矩阵，则返回 该矩阵。
         */
        Matrix3D.prototype.invert = function () {
            var d = this.determinant;
            var invertable = Math.abs(d) > 0.00000000001;
            if (!invertable) {
                feng3d.error("无法获取逆矩阵");
                return this;
            }
            d = 1 / d;
            var m11 = this.rawData[0];
            var m21 = this.rawData[4];
            var m31 = this.rawData[8];
            var m41 = this.rawData[12];
            var m12 = this.rawData[1];
            var m22 = this.rawData[5];
            var m32 = this.rawData[9];
            var m42 = this.rawData[13];
            var m13 = this.rawData[2];
            var m23 = this.rawData[6];
            var m33 = this.rawData[10];
            var m43 = this.rawData[14];
            var m14 = this.rawData[3];
            var m24 = this.rawData[7];
            var m34 = this.rawData[11];
            var m44 = this.rawData[15];
            this.rawData[0] = d * (m22 * (m33 * m44 - m43 * m34) - m32 * (m23 * m44 - m43 * m24) + m42 * (m23 * m34 - m33 * m24));
            this.rawData[1] = -d * (m12 * (m33 * m44 - m43 * m34) - m32 * (m13 * m44 - m43 * m14) + m42 * (m13 * m34 - m33 * m14));
            this.rawData[2] = d * (m12 * (m23 * m44 - m43 * m24) - m22 * (m13 * m44 - m43 * m14) + m42 * (m13 * m24 - m23 * m14));
            this.rawData[3] = -d * (m12 * (m23 * m34 - m33 * m24) - m22 * (m13 * m34 - m33 * m14) + m32 * (m13 * m24 - m23 * m14));
            this.rawData[4] = -d * (m21 * (m33 * m44 - m43 * m34) - m31 * (m23 * m44 - m43 * m24) + m41 * (m23 * m34 - m33 * m24));
            this.rawData[5] = d * (m11 * (m33 * m44 - m43 * m34) - m31 * (m13 * m44 - m43 * m14) + m41 * (m13 * m34 - m33 * m14));
            this.rawData[6] = -d * (m11 * (m23 * m44 - m43 * m24) - m21 * (m13 * m44 - m43 * m14) + m41 * (m13 * m24 - m23 * m14));
            this.rawData[7] = d * (m11 * (m23 * m34 - m33 * m24) - m21 * (m13 * m34 - m33 * m14) + m31 * (m13 * m24 - m23 * m14));
            this.rawData[8] = d * (m21 * (m32 * m44 - m42 * m34) - m31 * (m22 * m44 - m42 * m24) + m41 * (m22 * m34 - m32 * m24));
            this.rawData[9] = -d * (m11 * (m32 * m44 - m42 * m34) - m31 * (m12 * m44 - m42 * m14) + m41 * (m12 * m34 - m32 * m14));
            this.rawData[10] = d * (m11 * (m22 * m44 - m42 * m24) - m21 * (m12 * m44 - m42 * m14) + m41 * (m12 * m24 - m22 * m14));
            this.rawData[11] = -d * (m11 * (m22 * m34 - m32 * m24) - m21 * (m12 * m34 - m32 * m14) + m31 * (m12 * m24 - m22 * m14));
            this.rawData[12] = -d * (m21 * (m32 * m43 - m42 * m33) - m31 * (m22 * m43 - m42 * m23) + m41 * (m22 * m33 - m32 * m23));
            this.rawData[13] = d * (m11 * (m32 * m43 - m42 * m33) - m31 * (m12 * m43 - m42 * m13) + m41 * (m12 * m33 - m32 * m13));
            this.rawData[14] = -d * (m11 * (m22 * m43 - m42 * m23) - m21 * (m12 * m43 - m42 * m13) + m41 * (m12 * m23 - m22 * m13));
            this.rawData[15] = d * (m11 * (m22 * m33 - m32 * m23) - m21 * (m12 * m33 - m32 * m13) + m31 * (m12 * m23 - m22 * m13));
            return this;
        };
        /**
         * 通过将当前 Matrix3D 对象与另一个 Matrix3D 对象相乘来前置一个矩阵。得到的结果将合并两个矩阵转换。
         * @param   rhs     个右侧矩阵，它与当前 Matrix3D 对象相乘。
         */
        Matrix3D.prototype.prepend = function (rhs) {
            var mat = this.clone();
            this.copyFrom(rhs);
            this.append(mat);
            return this;
        };
        /**
         * 在 Matrix3D 对象上前置一个增量旋转。在将 Matrix3D 对象应用于显示对象时，矩阵会在 Matrix3D 对象中先执行旋转，然后再执行其他转换。
         * @param   axis        旋转的轴或方向。常见的轴为 X_AXIS (Vector3D(1,0,0))、Y_AXIS (Vector3D(0,1,0)) 和 Z_AXIS (Vector3D(0,0,1))。此矢量的长度应为 1。
         * @param   degrees     旋转的角度。
         * @param   pivotPoint  一个用于确定旋转中心的点。对象的默认轴点为该对象的注册点。
         */
        Matrix3D.prototype.prependRotation = function (axis, degrees, pivotPoint) {
            if (pivotPoint === void 0) { pivotPoint = new feng3d.Vector3D(); }
            var rotationMat = Matrix3D.fromAxisRotate(axis, degrees);
            this.prepend(rotationMat);
            return this;
        };
        /**
         * 在 Matrix3D 对象上前置一个增量缩放，沿 x、y 和 z 轴改变位置。在将 Matrix3D 对象应用于显示对象时，矩阵会在 Matrix3D 对象中先执行缩放更改，然后再执行其他转换。
         * @param   xScale      用于沿 x 轴缩放对象的乘数。
         * @param   yScale      用于沿 y 轴缩放对象的乘数。
         * @param   zScale      用于沿 z 轴缩放对象的乘数。
         */
        Matrix3D.prototype.prependScale = function (xScale, yScale, zScale) {
            var scaleMat = Matrix3D.fromScale(xScale, yScale, zScale);
            this.prepend(scaleMat);
            return this;
        };
        /**
         * 在 Matrix3D 对象上前置一个增量平移，沿 x、y 和 z 轴重新定位。在将 Matrix3D 对象应用于显示对象时，矩阵会在 Matrix3D 对象中先执行平移更改，然后再执行其他转换。
         * @param   x   沿 x 轴的增量平移。
         * @param   y   沿 y 轴的增量平移。
         * @param   z   沿 z 轴的增量平移。
         */
        Matrix3D.prototype.prependTranslation = function (x, y, z) {
            var translationMat = Matrix3D.fromPosition(x, y, z);
            this.prepend(translationMat);
            return this;
        };
        /**
         * X轴方向移动
         * @param distance  移动距离
         */
        Matrix3D.prototype.moveRight = function (distance) {
            var direction = this.right;
            direction.scaleBy(distance);
            this.position = this.position.add(direction);
            return this;
        };
        /**
         * Y轴方向移动
         * @param distance  移动距离
         */
        Matrix3D.prototype.moveUp = function (distance) {
            var direction = this.up;
            direction.scaleBy(distance);
            this.position = this.position.add(direction);
            return this;
        };
        /**
         * Z轴方向移动
         * @param distance  移动距离
         */
        Matrix3D.prototype.moveForward = function (distance) {
            var direction = this.forward;
            direction.scaleBy(distance);
            this.position = this.position.add(direction);
            return this;
        };
        /**
         * 设置转换矩阵的平移、旋转和缩放设置。
         * @param   components      一个由三个 Vector3D 对象组成的矢量，这些对象将替代 Matrix3D 对象的平移、旋转和缩放元素。
         */
        Matrix3D.prototype.recompose = function (components) {
            this.identity();
            this.appendScale(components[2].x, components[2].y, components[2].z);
            this.appendRotation(feng3d.Vector3D.X_AXIS, components[1].x * Math.RAD2DEG);
            this.appendRotation(feng3d.Vector3D.Y_AXIS, components[1].y * Math.RAD2DEG);
            this.appendRotation(feng3d.Vector3D.Z_AXIS, components[1].z * Math.RAD2DEG);
            this.appendTranslation(components[0].x, components[0].y, components[0].z);
            return this;
        };
        /**
         * 使用转换矩阵将 Vector3D 对象从一个空间坐标转换到另一个空间坐标。
         * @param   vin   一个容纳要转换的坐标的 Vector3D 对象。
         * @return  一个包含转换后的坐标的 Vector3D 对象。
         */
        Matrix3D.prototype.transformVector = function (vin, vout) {
            var x = vin.x;
            var y = vin.y;
            var z = vin.z;
            vout = vout || new feng3d.Vector3D();
            vout.x = x * this.rawData[0] + y * this.rawData[4] + z * this.rawData[8] + this.rawData[12];
            vout.y = x * this.rawData[1] + y * this.rawData[5] + z * this.rawData[9] + this.rawData[13];
            vout.z = x * this.rawData[2] + y * this.rawData[6] + z * this.rawData[10] + this.rawData[14];
            vout.w = x * this.rawData[3] + y * this.rawData[7] + z * this.rawData[11] + this.rawData[15];
            return vout;
        };
        /**
         * 使用转换矩阵将由数字构成的矢量从一个空间坐标转换到另一个空间坐标。
         * @param   vin     一个由多个数字组成的矢量，其中每三个数字构成一个要转换的 3D 坐标 (x,y,z)。
         * @param   vout    一个由多个数字组成的矢量，其中每三个数字构成一个已转换的 3D 坐标 (x,y,z)。
         */
        Matrix3D.prototype.transformVectors = function (vin, vout) {
            var vec = new feng3d.Vector3D();
            for (var i = 0; i < vin.length; i += 3) {
                vec.setTo(vin[i], vin[i + 1], vin[i + 2]);
                vec = this.transformVector(vec);
                vout[i] = vec.x;
                vout[i + 1] = vec.y;
                vout[i + 2] = vec.z;
            }
        };
        Matrix3D.prototype.transformRotation = function (vin, vout) {
            //转换旋转
            var rotationMatrix3d = Matrix3D.fromRotation(vin);
            rotationMatrix3d.append(this);
            var newrotation = rotationMatrix3d.decompose()[1];
            newrotation.scaleBy(180 / Math.PI);
            var v = Math.round((newrotation.x - vin.x) / 180);
            if (v % 2 != 0) {
                newrotation.x += 180;
                newrotation.y = 180 - newrotation.y;
                newrotation.z += 180;
            }
            //
            var toRound = function (a, b, c) {
                if (c === void 0) { c = 360; }
                return Math.round((b - a) / c) * c + a;
            };
            newrotation.x = toRound(newrotation.x, vin.x);
            newrotation.y = toRound(newrotation.y, vin.y);
            newrotation.z = toRound(newrotation.z, vin.z);
            //
            vout = vout || new feng3d.Vector3D();
            vout.x = newrotation.x;
            vout.y = newrotation.y;
            vout.z = newrotation.z;
            return vout;
        };
        /**
         * 将当前 Matrix3D 对象转换为一个矩阵，并将互换其中的行和列。
         */
        Matrix3D.prototype.transpose = function () {
            var swap;
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    if (i > j) {
                        swap = this.rawData[i * 4 + j];
                        this.rawData[i * 4 + j] = this.rawData[j * 4 + i];
                        this.rawData[j * 4 + i] = swap;
                    }
                }
            }
            return this;
        };
        /**
         * 比较矩阵是否相等
         */
        Matrix3D.prototype.equals = function (matrix3D, precision) {
            if (precision === void 0) { precision = 0.0001; }
            var r2 = matrix3D.rawData;
            for (var i = 0; i < 16; ++i) {
                if (Math.abs(this.rawData[i] - r2[i]) > precision)
                    return false;
            }
            return true;
        };
        /**
         * 看向目标位置
         * @param target    目标位置
         * @param upAxis    向上朝向
         */
        Matrix3D.prototype.lookAt = function (target, upAxis) {
            //获取位移，缩放，在变换过程位移与缩放不变
            var vec = this.decompose();
            var position = vec[0];
            var scale = vec[2];
            //
            var xAxis = new feng3d.Vector3D();
            var yAxis = new feng3d.Vector3D();
            var zAxis = new feng3d.Vector3D();
            upAxis = upAxis || feng3d.Vector3D.Y_AXIS;
            zAxis.x = target.x - this.position.x;
            zAxis.y = target.y - this.position.y;
            zAxis.z = target.z - this.position.z;
            zAxis.normalize();
            xAxis.x = upAxis.y * zAxis.z - upAxis.z * zAxis.y;
            xAxis.y = upAxis.z * zAxis.x - upAxis.x * zAxis.z;
            xAxis.z = upAxis.x * zAxis.y - upAxis.y * zAxis.x;
            xAxis.normalize();
            if (xAxis.length < .05) {
                xAxis.x = upAxis.y;
                xAxis.y = upAxis.x;
                xAxis.z = 0;
                xAxis.normalize();
            }
            yAxis.x = zAxis.y * xAxis.z - zAxis.z * xAxis.y;
            yAxis.y = zAxis.z * xAxis.x - zAxis.x * xAxis.z;
            yAxis.z = zAxis.x * xAxis.y - zAxis.y * xAxis.x;
            this.rawData[0] = scale.x * xAxis.x;
            this.rawData[1] = scale.x * xAxis.y;
            this.rawData[2] = scale.x * xAxis.z;
            this.rawData[3] = 0;
            this.rawData[4] = scale.y * yAxis.x;
            this.rawData[5] = scale.y * yAxis.y;
            this.rawData[6] = scale.y * yAxis.z;
            this.rawData[7] = 0;
            this.rawData[8] = scale.z * zAxis.x;
            this.rawData[9] = scale.z * zAxis.y;
            this.rawData[10] = scale.z * zAxis.z;
            this.rawData[11] = 0;
            this.rawData[12] = position.x;
            this.rawData[13] = position.y;
            this.rawData[14] = position.z;
            this.rawData[15] = 1;
        };
        /**
         * 以字符串返回矩阵的值
         */
        Matrix3D.prototype.toString = function () {
            var str = "";
            var showLen = 5;
            var precision = Math.pow(10, showLen - 1);
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    str += feng3d.StringUtils.getString(Math.round(this.rawData[i * 4 + j] * precision) / precision, showLen, " ");
                }
                if (i != 3)
                    str += "\n";
            }
            return str;
        };
        /**
         * 用于运算临时变量
         */
        Matrix3D.RAW_DATA_CONTAINER = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1 //
        ];
        __decorate([
            feng3d.serialize()
        ], Matrix3D.prototype, "rawData", void 0);
        return Matrix3D;
    }());
    feng3d.Matrix3D = Matrix3D;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * A Quaternion object which can be used to represent rotations.
     */
    var Quaternion = /** @class */ (function () {
        /**
         * Creates a new Quaternion object.
         * @param x The x value of the quaternion.
         * @param y The y value of the quaternion.
         * @param z The z value of the quaternion.
         * @param w The w value of the quaternion.
         */
        function Quaternion(x, y, z, w) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (z === void 0) { z = 0; }
            if (w === void 0) { w = 1; }
            /**
             * The x value of the quaternion.
             */
            this.x = 0;
            /**
             * The y value of the quaternion.
             */
            this.y = 0;
            /**
             * The z value of the quaternion.
             */
            this.z = 0;
            /**
             * The w value of the quaternion.
             */
            this.w = 1;
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        Quaternion.fromArray = function (array, offset) {
            if (offset === void 0) { offset = 0; }
            return new Quaternion().fromArray(array, offset);
        };
        Object.defineProperty(Quaternion.prototype, "magnitude", {
            /**
             * Returns the magnitude of the quaternion object.
             */
            get: function () {
                return Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
            },
            enumerable: true,
            configurable: true
        });
        Quaternion.prototype.setTo = function (x, y, z, w) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (z === void 0) { z = 0; }
            if (w === void 0) { w = 1; }
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        };
        Quaternion.prototype.fromArray = function (array, offset) {
            if (offset === void 0) { offset = 0; }
            this.x = array[offset];
            this.y = array[offset + 1];
            this.z = array[offset + 2];
            this.w = array[offset + 3];
            return this;
        };
        Quaternion.prototype.toArray = function (array, offset) {
            if (offset === void 0) { offset = 0; }
            array = array || [];
            array[offset] = this.x;
            array[offset + 1] = this.y;
            array[offset + 2] = this.z;
            array[offset + 3] = this.w;
            return array;
        };
        /**
         * Fills the quaternion object with the result from a multiplication of two quaternion objects.
         *
         * @param    qa    The first quaternion in the multiplication.
         * @param    qb    The second quaternion in the multiplication.
         */
        Quaternion.prototype.multiply = function (qa, qb) {
            var w1 = qa.w, x1 = qa.x, y1 = qa.y, z1 = qa.z;
            var w2 = qb.w, x2 = qb.x, y2 = qb.y, z2 = qb.z;
            this.w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
            this.x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2;
            this.y = w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2;
            this.z = w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2;
        };
        Quaternion.prototype.multiplyVector = function (vector, target) {
            target = target || new Quaternion();
            var x2 = vector.x;
            var y2 = vector.y;
            var z2 = vector.z;
            target.w = -this.x * x2 - this.y * y2 - this.z * z2;
            target.x = this.w * x2 + this.y * z2 - this.z * y2;
            target.y = this.w * y2 - this.x * z2 + this.z * x2;
            target.z = this.w * z2 + this.x * y2 - this.y * x2;
            return target;
        };
        /**
         * Fills the quaternion object with values representing the given rotation around a vector.
         *
         * @param    axis    The axis around which to rotate
         * @param    angle    The angle in radians of the rotation.
         */
        Quaternion.prototype.fromAxisAngle = function (axis, angle) {
            var sin_a = Math.sin(angle / 2);
            var cos_a = Math.cos(angle / 2);
            this.x = axis.x * sin_a;
            this.y = axis.y * sin_a;
            this.z = axis.z * sin_a;
            this.w = cos_a;
            this.normalize();
        };
        /**
         * Spherically interpolates between two quaternions, providing an interpolation between rotations with constant angle change rate.
         * @param qa The first quaternion to interpolate.
         * @param qb The second quaternion to interpolate.
         * @param t The interpolation weight, a value between 0 and 1.
         */
        Quaternion.prototype.slerp = function (qa, qb, t) {
            var w1 = qa.w, x1 = qa.x, y1 = qa.y, z1 = qa.z;
            var w2 = qb.w, x2 = qb.x, y2 = qb.y, z2 = qb.z;
            var dot = w1 * w2 + x1 * x2 + y1 * y2 + z1 * z2;
            // shortest direction
            if (dot < 0) {
                dot = -dot;
                w2 = -w2;
                x2 = -x2;
                y2 = -y2;
                z2 = -z2;
            }
            if (dot < 0.95) {
                // interpolate angle linearly
                var angle = Math.acos(dot);
                var s = 1 / Math.sin(angle);
                var s1 = Math.sin(angle * (1 - t)) * s;
                var s2 = Math.sin(angle * t) * s;
                this.w = w1 * s1 + w2 * s2;
                this.x = x1 * s1 + x2 * s2;
                this.y = y1 * s1 + y2 * s2;
                this.z = z1 * s1 + z2 * s2;
            }
            else {
                // nearly identical angle, interpolate linearly
                this.w = w1 + t * (w2 - w1);
                this.x = x1 + t * (x2 - x1);
                this.y = y1 + t * (y2 - y1);
                this.z = z1 + t * (z2 - z1);
                var len = 1.0 / Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
                this.w *= len;
                this.x *= len;
                this.y *= len;
                this.z *= len;
            }
        };
        /**
         * 线性求插值
         * @param qa 第一个四元素
         * @param qb 第二个四元素
         * @param t 权重
         */
        Quaternion.prototype.lerp = function (qa, qb, t) {
            var w1 = qa.w, x1 = qa.x, y1 = qa.y, z1 = qa.z;
            var w2 = qb.w, x2 = qb.x, y2 = qb.y, z2 = qb.z;
            var len;
            // shortest direction
            if (w1 * w2 + x1 * x2 + y1 * y2 + z1 * z2 < 0) {
                w2 = -w2;
                x2 = -x2;
                y2 = -y2;
                z2 = -z2;
            }
            this.w = w1 + t * (w2 - w1);
            this.x = x1 + t * (x2 - x1);
            this.y = y1 + t * (y2 - y1);
            this.z = z1 + t * (z2 - z1);
            len = 1.0 / Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
            this.w *= len;
            this.x *= len;
            this.y *= len;
            this.z *= len;
        };
        /**
         * Fills the quaternion object with values representing the given euler rotation.
         *
         * @param    ax        The angle in radians of the rotation around the ax axis.
         * @param    ay        The angle in radians of the rotation around the ay axis.
         * @param    az        The angle in radians of the rotation around the az axis.
         */
        Quaternion.prototype.fromEulerAngles = function (ax, ay, az) {
            var halfX = ax * .5, halfY = ay * .5, halfZ = az * .5;
            var cosX = Math.cos(halfX), sinX = Math.sin(halfX);
            var cosY = Math.cos(halfY), sinY = Math.sin(halfY);
            var cosZ = Math.cos(halfZ), sinZ = Math.sin(halfZ);
            this.w = cosX * cosY * cosZ + sinX * sinY * sinZ;
            this.x = sinX * cosY * cosZ - cosX * sinY * sinZ;
            this.y = cosX * sinY * cosZ + sinX * cosY * sinZ;
            this.z = cosX * cosY * sinZ - sinX * sinY * cosZ;
        };
        /**
         * Fills a target Vector3D object with the Euler angles that form the rotation represented by this quaternion.
         * @param target An optional Vector3D object to contain the Euler angles. If not provided, a new object is created.
         * @return The Vector3D containing the Euler angles.
         */
        Quaternion.prototype.toEulerAngles = function (target) {
            target = target || new feng3d.Vector3D();
            target.x = Math.atan2(2 * (this.w * this.x + this.y * this.z), 1 - 2 * (this.x * this.x + this.y * this.y));
            var asinvalue = 2 * (this.w * this.y - this.z * this.x);
            //防止超出范围，获取NaN值
            asinvalue = Math.max(-1, Math.min(asinvalue, 1));
            target.y = Math.asin(asinvalue);
            target.z = Math.atan2(2 * (this.w * this.z + this.x * this.y), 1 - 2 * (this.y * this.y + this.z * this.z));
            return target;
        };
        /**
         * Normalises the quaternion object.
         */
        Quaternion.prototype.normalize = function (val) {
            if (val === void 0) { val = 1; }
            var mag = val / Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
            this.x *= mag;
            this.y *= mag;
            this.z *= mag;
            this.w *= mag;
        };
        /**
         * Used to trace the values of a quaternion.
         *
         * @return A string representation of the quaternion object.
         */
        Quaternion.prototype.toString = function () {
            return "{this.x:" + this.x + " this.y:" + this.y + " this.z:" + this.z + " this.w:" + this.w + "}";
        };
        /**
         * Converts the quaternion to a Matrix3D object representing an equivalent rotation.
         * @param target An optional Matrix3D container to store the transformation in. If not provided, a new object is created.
         * @return A Matrix3D object representing an equivalent rotation.
         */
        Quaternion.prototype.toMatrix3D = function (target) {
            if (!target)
                target = new feng3d.Matrix3D();
            var rawData = target.rawData;
            var xy2 = 2.0 * this.x * this.y, xz2 = 2.0 * this.x * this.z, xw2 = 2.0 * this.x * this.w;
            var yz2 = 2.0 * this.y * this.z, yw2 = 2.0 * this.y * this.w, zw2 = 2.0 * this.z * this.w;
            var xx = this.x * this.x, yy = this.y * this.y, zz = this.z * this.z, ww = this.w * this.w;
            rawData[0] = xx - yy - zz + ww;
            rawData[4] = xy2 - zw2;
            rawData[8] = xz2 + yw2;
            rawData[12] = 0;
            rawData[1] = xy2 + zw2;
            rawData[5] = -xx + yy - zz + ww;
            rawData[9] = yz2 - xw2;
            rawData[13] = 0;
            rawData[2] = xz2 - yw2;
            rawData[6] = yz2 + xw2;
            rawData[10] = -xx - yy + zz + ww;
            rawData[14] = 0;
            rawData[3] = 0.0;
            rawData[7] = 0.0;
            rawData[11] = 0;
            rawData[15] = 1;
            target.copyRawDataFrom(rawData);
            return target;
        };
        /**
         * Extracts a quaternion rotation matrix out of a given Matrix3D object.
         * @param matrix The Matrix3D out of which the rotation will be extracted.
         */
        Quaternion.prototype.fromMatrix = function (matrix) {
            var v = matrix.decompose()[1];
            this.fromEulerAngles(v.x, v.y, v.z);
            return this;
        };
        /**
         * Converts the quaternion to a Vector.&lt;number&gt; matrix representation of a rotation equivalent to this quaternion.
         * @param target The Vector.&lt;number&gt; to contain the raw matrix data.
         * @param exclude4thRow If true, the last row will be omitted, and a 4x3 matrix will be generated instead of a 4x4.
         */
        Quaternion.prototype.toRawData = function (target, exclude4thRow) {
            if (exclude4thRow === void 0) { exclude4thRow = false; }
            var xy2 = 2.0 * this.x * this.y, xz2 = 2.0 * this.x * this.z, xw2 = 2.0 * this.x * this.w;
            var yz2 = 2.0 * this.y * this.z, yw2 = 2.0 * this.y * this.w, zw2 = 2.0 * this.z * this.w;
            var xx = this.x * this.x, yy = this.y * this.y, zz = this.z * this.z, ww = this.w * this.w;
            target[0] = xx - yy - zz + ww;
            target[1] = xy2 - zw2;
            target[2] = xz2 + yw2;
            target[4] = xy2 + zw2;
            target[5] = -xx + yy - zz + ww;
            target[6] = yz2 - xw2;
            target[8] = xz2 - yw2;
            target[9] = yz2 + xw2;
            target[10] = -xx - yy + zz + ww;
            target[3] = target[7] = target[11] = 0;
            if (!exclude4thRow) {
                target[12] = target[13] = target[14] = 0;
                target[15] = 1;
            }
        };
        /**
         * Clones the quaternion.
         * @return An exact duplicate of the current Quaternion.
         */
        Quaternion.prototype.clone = function () {
            return new Quaternion(this.x, this.y, this.z, this.w);
        };
        /**
         * Rotates a point.
         * @param vector The Vector3D object to be rotated.
         * @param target An optional Vector3D object that will contain the rotated coordinates. If not provided, a new object will be created.
         * @return A Vector3D object containing the rotated point.
         */
        Quaternion.prototype.rotatePoint = function (vector, target) {
            var x1, y1, z1, w1;
            var x2 = vector.x, y2 = vector.y, z2 = vector.z;
            target = target || new feng3d.Vector3D();
            // p*q'
            w1 = -this.x * x2 - this.y * y2 - this.z * z2;
            x1 = this.w * x2 + this.y * z2 - this.z * y2;
            y1 = this.w * y2 - this.x * z2 + this.z * x2;
            z1 = this.w * z2 + this.x * y2 - this.y * x2;
            target.x = -w1 * this.x + x1 * this.w - y1 * this.z + z1 * this.y;
            target.y = -w1 * this.y + x1 * this.z + y1 * this.w - z1 * this.x;
            target.z = -w1 * this.z - x1 * this.y + y1 * this.x + z1 * this.w;
            return target;
        };
        /**
         * Copies the data from a quaternion into this instance.
         * @param q The quaternion to copy from.
         */
        Quaternion.prototype.copyFrom = function (q) {
            this.x = q.x;
            this.y = q.y;
            this.z = q.z;
            this.w = q.w;
        };
        __decorate([
            feng3d.serialize(0)
        ], Quaternion.prototype, "x", void 0);
        __decorate([
            feng3d.serialize(0)
        ], Quaternion.prototype, "y", void 0);
        __decorate([
            feng3d.serialize(0)
        ], Quaternion.prototype, "z", void 0);
        __decorate([
            feng3d.serialize(0)
        ], Quaternion.prototype, "w", void 0);
        return Quaternion;
    }());
    feng3d.Quaternion = Quaternion;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 3d直线
     * @author feng 2013-6-13
     */
    var Line3D = /** @class */ (function () {
        /**
         * 根据直线某点与方向创建直线
         * @param position 直线上某点
         * @param direction 直线的方向
         */
        function Line3D(position, direction) {
            this.position = position ? position : new feng3d.Vector3D();
            this.direction = direction ? direction : new feng3d.Vector3D(0, 0, 1);
        }
        /**
         * 根据直线上两点初始化直线
         * @param p0 Vector3D
         * @param p1 Vector3D
         */
        Line3D.prototype.fromPoints = function (p0, p1) {
            this.position = p0;
            this.direction = p1.subtract(p0);
        };
        /**
         * 根据直线某点与方向初始化直线
         * @param position 直线上某点
         * @param direction 直线的方向
         */
        Line3D.prototype.fromPosAndDir = function (position, direction) {
            this.position = position;
            this.direction = direction;
        };
        /**
         * 获取直线上的一个点
         * @param length 与原点距离
         */
        Line3D.prototype.getPoint = function (length) {
            if (length === void 0) { length = 0; }
            var lengthDir = this.direction.clone();
            lengthDir.scaleBy(length);
            var newPoint = this.position.add(lengthDir);
            return newPoint;
        };
        return Line3D;
    }());
    feng3d.Line3D = Line3D;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 3D射线
     * @author feng 2013-6-13
     */
    var Ray3D = /** @class */ (function (_super) {
        __extends(Ray3D, _super);
        function Ray3D(position, direction) {
            return _super.call(this, position, direction) || this;
        }
        return Ray3D;
    }(feng3d.Line3D));
    feng3d.Ray3D = Ray3D;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 3d面
     */
    var Plane3D = /** @class */ (function () {
        /**
         * 创建一个平面
         * @param a		A系数
         * @param b		B系数
         * @param c		C系数
         * @param d		D系数
         */
        function Plane3D(a, b, c, d) {
            if (a === void 0) { a = 0; }
            if (b === void 0) { b = 0; }
            if (c === void 0) { c = 0; }
            if (d === void 0) { d = 0; }
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            if (a == 0 && b == 0)
                this._alignment = Plane3D.ALIGN_XY_AXIS;
            else if (b == 0 && c == 0)
                this._alignment = Plane3D.ALIGN_YZ_AXIS;
            else if (a == 0 && c == 0)
                this._alignment = Plane3D.ALIGN_XZ_AXIS;
            else
                this._alignment = Plane3D.ALIGN_ANY;
        }
        Object.defineProperty(Plane3D.prototype, "normal", {
            /**
             * 法线
             */
            get: function () {
                return new feng3d.Vector3D(this.a, this.b, this.c);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 通过3顶点定义一个平面
         * @param p0		点0
         * @param p1		点1
         * @param p2		点2
         */
        Plane3D.prototype.fromPoints = function (p0, p1, p2) {
            //计算向量1
            var d1x = p1.x - p0.x;
            var d1y = p1.y - p0.y;
            var d1z = p1.z - p0.z;
            //计算向量2
            var d2x = p2.x - p0.x;
            var d2y = p2.y - p0.y;
            var d2z = p2.z - p0.z;
            //叉乘计算法线
            this.a = d1y * d2z - d1z * d2y;
            this.b = d1z * d2x - d1x * d2z;
            this.c = d1x * d2y - d1y * d2x;
            //平面上点与法线点乘计算D值
            this.d = this.a * p0.x + this.b * p0.y + this.c * p0.z;
            //法线平行z轴
            if (this.a == 0 && this.b == 0)
                this._alignment = Plane3D.ALIGN_XY_AXIS;
            else if (this.b == 0 && this.c == 0)
                this._alignment = Plane3D.ALIGN_YZ_AXIS;
            else if (this.a == 0 && this.c == 0)
                this._alignment = Plane3D.ALIGN_XZ_AXIS;
            else
                this._alignment = Plane3D.ALIGN_ANY;
        };
        /**
         * 根据法线与点定义平面
         * @param normal		平面法线
         * @param point			平面上任意一点
         */
        Plane3D.prototype.fromNormalAndPoint = function (normal, point) {
            this.a = normal.x;
            this.b = normal.y;
            this.c = normal.z;
            this.d = this.a * point.x + this.b * point.y + this.c * point.z;
            if (this.a == 0 && this.b == 0)
                this._alignment = Plane3D.ALIGN_XY_AXIS;
            else if (this.b == 0 && this.c == 0)
                this._alignment = Plane3D.ALIGN_YZ_AXIS;
            else if (this.a == 0 && this.c == 0)
                this._alignment = Plane3D.ALIGN_XZ_AXIS;
            else
                this._alignment = Plane3D.ALIGN_ANY;
        };
        /**
         * 标准化平面
         * @return		标准化后的平面
         */
        Plane3D.prototype.normalize = function () {
            var len = 1 / Math.sqrt(this.a * this.a + this.b * this.b + this.c * this.c);
            this.a *= len;
            this.b *= len;
            this.c *= len;
            this.d *= len;
            return this;
        };
        /**
         * 计算点与平面的距离
         * @param p		点
         * @returns		距离
         */
        Plane3D.prototype.distance = function (p) {
            if (this._alignment == Plane3D.ALIGN_YZ_AXIS)
                return this.a * p.x - this.d;
            else if (this._alignment == Plane3D.ALIGN_XZ_AXIS)
                return this.b * p.y - this.d;
            else if (this._alignment == Plane3D.ALIGN_XY_AXIS)
                return this.c * p.z - this.d;
            else
                return this.a * p.x + this.b * p.y + this.c * p.z - this.d;
        };
        /**
         * 顶点分类
         * <p>把顶点分为后面、前面、相交三类</p>
         * @param p			顶点
         * @return			顶点类型 PlaneClassification.BACK,PlaneClassification.FRONT,PlaneClassification.INTERSECT
         * @see				feng3d.core.math.PlaneClassification
         */
        Plane3D.prototype.classifyPoint = function (p, epsilon) {
            if (epsilon === void 0) { epsilon = 0.01; }
            // check NaN
            if (this.d != this.d)
                return feng3d.PlaneClassification.FRONT;
            var len;
            if (this._alignment == Plane3D.ALIGN_YZ_AXIS)
                len = this.a * p.x - this.d;
            else if (this._alignment == Plane3D.ALIGN_XZ_AXIS)
                len = this.b * p.y - this.d;
            else if (this._alignment == Plane3D.ALIGN_XY_AXIS)
                len = this.c * p.z - this.d;
            else
                len = this.a * p.x + this.b * p.y + this.c * p.z - this.d;
            if (len < -epsilon)
                return feng3d.PlaneClassification.BACK;
            else if (len > epsilon)
                return feng3d.PlaneClassification.FRONT;
            else
                return feng3d.PlaneClassification.INTERSECT;
        };
        /**
         * 获取与直线交点
         */
        Plane3D.prototype.lineCross = function (line3D) {
            var lineDir = line3D.direction.clone();
            lineDir.normalize();
            var cosAngle = lineDir.dotProduct(this.normal);
            var distance = this.distance(line3D.position);
            var addVec = lineDir.clone();
            addVec.scaleBy(-distance / cosAngle);
            var crossPos = line3D.position.add(addVec);
            return crossPos;
        };
        /**
         * 输出字符串
         */
        Plane3D.prototype.toString = function () {
            return "Plane3D [this.a:" + this.a + ", this.b:" + this.b + ", this.c:" + this.c + ", this.d:" + this.d + "]";
        };
        /**
         * 普通平面
         * <p>不与对称轴平行或垂直</p>
         */
        Plane3D.ALIGN_ANY = 0;
        /**
         * XY方向平面
         * <p>法线与Z轴平行</p>
         */
        Plane3D.ALIGN_XY_AXIS = 1;
        /**
         * YZ方向平面
         * <p>法线与X轴平行</p>
         */
        Plane3D.ALIGN_YZ_AXIS = 2;
        /**
         * XZ方向平面
         * <p>法线与Y轴平行</p>
         */
        Plane3D.ALIGN_XZ_AXIS = 3;
        return Plane3D;
    }());
    feng3d.Plane3D = Plane3D;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 点与面的相对位置
     * @author feng
     */
    var PlaneClassification = /** @class */ (function () {
        function PlaneClassification() {
        }
        /**
         * 在平面后面
         * <p>等价于平面内</p>
         * @see #IN
         */
        PlaneClassification.BACK = 0;
        /**
         * 在平面前面
         * <p>等价于平面外</p>
         * @see #OUT
         */
        PlaneClassification.FRONT = 1;
        /**
         * 在平面内
         * <p>等价于在平面后</p>
         * @see #BACK
         */
        PlaneClassification.IN = 0;
        /**
         * 在平面外
         * <p>等价于平面前面</p>
         * @see #FRONT
         */
        PlaneClassification.OUT = 1;
        /**
         * 与平面相交
         */
        PlaneClassification.INTERSECT = 2;
        return PlaneClassification;
    }());
    feng3d.PlaneClassification = PlaneClassification;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 颜色
     * @author feng 2016-09-24
     */
    var Color = /** @class */ (function () {
        /**
         * 构建颜色
         * @param r     红[0,1]
         * @param g     绿[0,1]
         * @param b     蓝[0,1]
         * @param a     透明度[0,1]
         */
        function Color(r, g, b, a) {
            if (r === void 0) { r = 1; }
            if (g === void 0) { g = 1; }
            if (b === void 0) { b = 1; }
            if (a === void 0) { a = 1; }
            /**
             * 红[0,1]
             */
            this.r = 1;
            /**
             * 绿[0,1]
             */
            this.g = 1;
            /**
             * 蓝[0,1]
             */
            this.b = 1;
            /**
             * 透明度[0,1]
             */
            this.a = 1;
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        Color.prototype.setTo = function (r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            if (a !== undefined)
                this.a = a;
            return this;
        };
        /**
         * 通过
         * @param color
         * @param hasAlpha
         */
        Color.prototype.fromUnit = function (color, hasAlpha) {
            if (hasAlpha === void 0) { hasAlpha = false; }
            if (hasAlpha)
                this.a = ((color >> 24) & 0xff) / 0xff;
            this.r = ((color >> 16) & 0xff) / 0xff;
            this.g = ((color >> 8) & 0xff) / 0xff;
            this.b = (color & 0xff) / 0xff;
            return this;
        };
        Color.prototype.toInt = function () {
            var value = (this.a * 0xff) << 24 + (this.r * 0xff) << 16 + (this.g * 0xff) << 8 + (this.b * 0xff);
            return value;
        };
        /**
         * 输出16进制字符串
         */
        Color.prototype.toHexString = function () {
            var intR = (this.r * 0xff) | 0;
            var intG = (this.g * 0xff) | 0;
            var intB = (this.b * 0xff) | 0;
            var intA = (this.a * 0xff) | 0;
            return "#" + Color.ToHex(intA) + Color.ToHex(intR) + Color.ToHex(intG) + Color.ToHex(intB);
        };
        /**
         * 混合颜色
         * @param color 混入的颜色
         * @param rate  混入比例
         */
        Color.prototype.mix = function (color, rate) {
            if (rate === void 0) { rate = 0.5; }
            this.r = this.r * (1 - rate) + color.r * rate;
            this.g = this.g * (1 - rate) + color.g * rate;
            this.b = this.b * (1 - rate) + color.b * rate;
            this.a = this.a * (1 - rate) + color.a * rate;
            return this;
        };
        /**
         * 输出字符串
         */
        Color.prototype.toString = function () {
            return "{R: " + this.r + " G:" + this.g + " B:" + this.b + " A:" + this.a + "}";
        };
        /**
         * [0,15]数值转为16进制字符串
         * param i  [0,15]数值
         */
        Color.ToHex = function (i) {
            var str = i.toString(16);
            if (i <= 0xf) {
                return ("0" + str).toUpperCase();
            }
            return str.toUpperCase();
        };
        __decorate([
            feng3d.oav(),
            feng3d.serialize(1)
        ], Color.prototype, "r", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize(1)
        ], Color.prototype, "g", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize(1)
        ], Color.prototype, "b", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize(1)
        ], Color.prototype, "a", void 0);
        return Color;
    }());
    feng3d.Color = Color;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 心跳计时器
     */
    feng3d.ticker = {
        /**
         * 帧率
         */
        frameRate: 60,
        /**
         * 注册帧函数
         * @param func  执行方法
         * @param thisObject    方法this指针
         * @param priority      执行优先级
         */
        onframe: function (func, thisObject, priority) {
            var _this = this;
            if (priority === void 0) { priority = 0; }
            this.on(function () { return 1000 / _this.frameRate; }, func, thisObject, priority);
            return this;
        },
        /**
         * 注册帧函数（只执行一次）
         * @param func  执行方法
         * @param thisObject    方法this指针
         * @param priority      执行优先级
         */
        onceframe: function (func, thisObject, priority) {
            var _this = this;
            if (priority === void 0) { priority = 0; }
            this.once(function () { return 1000 / _this.frameRate; }, func, thisObject, priority);
            return this;
        },
        /**
         * 注销帧函数（只执行一次）
         * @param func  执行方法
         * @param thisObject    方法this指针
         * @param priority      执行优先级
         */
        offframe: function (func, thisObject) {
            var _this = this;
            this.off(function () { return 1000 / _this.frameRate; }, func, thisObject);
            return this;
        },
        /**
         * 注册周期函数
         * @param interval  执行周期，以ms为单位
         * @param func  执行方法
         * @param thisObject    方法this指针
         * @param priority      执行优先级
         */
        on: function (interval, func, thisObject, priority) {
            if (priority === void 0) { priority = 0; }
            addTickerFunc({ interval: interval, func: func, thisObject: thisObject, priority: priority, once: false });
            return this;
        },
        /**
         * 注册周期函数（只执行一次）
         * @param interval  执行周期，以ms为单位
         * @param func  执行方法
         * @param thisObject    方法this指针
         * @param priority      执行优先级
         */
        once: function (interval, func, thisObject, priority) {
            if (priority === void 0) { priority = 0; }
            addTickerFunc({ interval: interval, func: func, thisObject: thisObject, priority: priority, once: true });
            return this;
        },
        /**
         * 注销周期函数
         * @param interval  执行周期，以ms为单位
         * @param func  执行方法
         * @param thisObject    方法this指针
         */
        off: function (interval, func, thisObject) {
            removeTickerFunc({ interval: interval, func: func, thisObject: thisObject });
            return this;
        },
        /**
         * 重复指定次数 执行函数
         * @param interval  执行周期，以ms为单位
         * @param 	repeatCount     执行次数
         * @param func  执行方法
         * @param thisObject    方法this指针
         * @param priority      执行优先级
         */
        repeat: function (interval, repeatCount, func, thisObject, priority) {
            if (priority === void 0) { priority = 0; }
            repeatCount = ~~repeatCount;
            if (repeatCount < 1)
                return;
            var runfunc = function () {
                func.call(thisObject);
                timer.currentCount++;
                repeatCount--;
                if (repeatCount < 1)
                    timer.stop();
            };
            var __this = this;
            var timer = {
                /**
                 * 计时器从 0 开始后触发的总次数。
                 */
                currentCount: 0,
                /**
                 * 计时器事件间的延迟（以毫秒为单位）。
                 */
                delay: interval,
                /**
                 * 设置的计时器运行总次数。
                 */
                repeatCount: repeatCount,
                /**
                 * 如果计时器尚未运行，则启动计时器。
                 */
                start: function () {
                    __this.on(interval, runfunc, undefined, priority);
                    return this;
                },
                /**
                 * 停止计时器。
                 */
                stop: function () {
                    __this.off(interval, runfunc);
                    return this;
                },
                /**
                 * 如果计时器正在运行，则停止计时器，并将 currentCount 属性设回为 0，这类似于秒表的重置按钮。
                 */
                reset: function () {
                    this.stop();
                    this.currentCount = 0;
                    return this;
                },
            };
            return timer;
        },
    };
    var tickerFuncs = [];
    function addTickerFunc(item) {
        if (running) {
            affers.push([addTickerFunc, [item]]);
            return;
        }
        removeTickerFunc(item);
        if (item.priority == undefined)
            item.priority = 0;
        item.runtime = Date.now() + feng3d.lazy.getvalue(item.interval);
        tickerFuncs.push(item);
    }
    function removeTickerFunc(item) {
        if (running) {
            affers.push([removeTickerFunc, [item]]);
            return;
        }
        for (var i = tickerFuncs.length - 1; i >= 0; i--) {
            var element = tickerFuncs[i];
            if (feng3d.lazy.getvalue(element.interval) == feng3d.lazy.getvalue(item.interval)
                && element.func == item.func
                && element.thisObject == item.thisObject) {
                tickerFuncs.splice(i, 1);
            }
        }
    }
    var running = false;
    var affers = [];
    function runTickerFuncs() {
        running = true;
        //倒序，优先级高的排在后面
        tickerFuncs.sort(function (a, b) {
            return a.priority - b.priority;
        });
        var currenttime = Date.now();
        for (var i = tickerFuncs.length - 1; i >= 0; i--) {
            var element = tickerFuncs[i];
            if (element.runtime < currenttime) {
                try {
                    element.func.call(element.thisObject);
                }
                catch (error) {
                    feng3d.warn(element.func + " \u65B9\u6CD5\u6267\u884C\u9519\u8BEF\uFF0C\u4ECE ticker \u4E2D\u79FB\u9664", error);
                    tickerFuncs.splice(i, 1);
                    continue;
                }
                if (element.once) {
                    tickerFuncs.splice(i, 1);
                    continue;
                }
                element.runtime = nextRuntime(element.runtime, feng3d.lazy.getvalue(element.interval));
            }
        }
        running = false;
        for (var i = 0; i < affers.length; i++) {
            var affer = affers[i];
            affer[0].apply(null, affer[1]);
        }
        affers.length = 0;
        localrequestAnimationFrame(runTickerFuncs);
        function nextRuntime(runtime, interval) {
            return runtime + Math.ceil((currenttime - runtime) / interval) * interval;
        }
    }
    var localrequestAnimationFrame;
    if (typeof requestAnimationFrame == "undefined") {
        if (typeof window != "undefined") {
            localrequestAnimationFrame =
                window["requestAnimationFrame"] ||
                    window["webkitRequestAnimationFrame"] ||
                    window["mozRequestAnimationFrame"] ||
                    window["oRequestAnimationFrame"] ||
                    window["msRequestAnimationFrame"];
        }
        else {
            localrequestAnimationFrame = function (callback) {
                return window.setTimeout(callback, 1000 / feng3d.ticker.frameRate);
            };
        }
    }
    else {
        localrequestAnimationFrame = requestAnimationFrame;
    }
    runTickerFuncs();
})(feng3d || (feng3d = {}));
//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var feng3d;
(function (feng3d) {
    /**
     * The Timer class is the interface to timers, which let you run code on a specified time sequence. Use the start()
     * method to start a timer. Add an event listener for the timer event to set up code to be run on the timer interval.<br/>
     * You can create Timer objects to run once or repeat at specified intervals to execute code on a schedule. Depending
     * on the framerate or the runtime environment (available memory and other factors), the runtime may dispatchEvent events at
     * slightly offset intervals.
     * @see egret.TimerEvent
     * @version Egret 2.4
     * @platform Web,Native
     * @includeExample egret/utils/Timer.ts
     * @language en_US
     */
    /**
     * Timer 类是计时器的接口，它使您能按指定的时间序列运行代码。
     * 使用 start() 方法来启动计时器。为 timer 事件添加事件侦听器，以便将代码设置为按计时器间隔运行。
     * 可以创建 Timer 对象以运行一次或按指定间隔重复运行，从而按计划执行代码。
     * 根据 Egret 的帧速率或运行时环境（可用内存和其他因素），运行时调度事件的间隔可能稍有不同。
     * @see egret.TimerEvent
     * @version Egret 2.4
     * @platform Web,Native
     * @includeExample egret/utils/Timer.ts
     * @language zh_CN
     */
    var Timer = /** @class */ (function (_super) {
        __extends(Timer, _super);
        /**
         * Constructs a new Timer object with the specified delay and repeatCount states.
         * @param delay The delay between timer events, in milliseconds. A delay lower than 20 milliseconds is not recommended.
         * Timer frequency is limited to 60 frames per second, meaning a delay lower than 16.6 milliseconds causes runtime problems.
         * @param repeatCount Specifies the number of repetitions. If zero, the timer repeats indefinitely.If nonzero,
         * the timer runs the specified number of times and then stops.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 使用指定的 delay 和 repeatCount 状态构造新的 Timer 对象。
         * @param delay 计时器事件间的延迟（以毫秒为单位）。建议 delay 不要低于 20 毫秒。计时器频率不得超过 60 帧/秒，这意味着低于 16.6 毫秒的延迟可导致出现运行时问题。
         * @param repeatCount 指定重复次数。如果为零，则计时器将持续不断重复运行。如果不为 0，则将运行计时器，运行次数为指定的次数，然后停止。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        function Timer(delay, repeatCount) {
            if (repeatCount === void 0) { repeatCount = 0; }
            var _this = _super.call(this) || this;
            /**
             * @private
             */
            _this._delay = 0;
            /**
             * @private
             */
            _this._currentCount = 0;
            /**
             * @private
             */
            _this._running = false;
            /**
             * @private
             */
            _this.updateInterval = 1000;
            /**
             * @private
             */
            _this.lastCount = 1000;
            /**
             * @private
             */
            _this.lastTimeStamp = 0;
            _this.delay = delay;
            _this.repeatCount = +repeatCount | 0;
            return _this;
        }
        Object.defineProperty(Timer.prototype, "delay", {
            /**
             * The delay between timer events, in milliseconds. A delay lower than 20 milliseconds is not recommended.<br/>
             * Note: Timer frequency is limited to 60 frames per second, meaning a delay lower than 16.6 milliseconds causes runtime problems.
             * @version Egret 2.4
             * @platform Web,Native
             * @language en_US
             */
            /**
             * 计时器事件间的延迟（以毫秒为单位）。如果在计时器正在运行时设置延迟间隔，则计时器将按相同的 repeatCount 迭代重新启动。<br/>
             * 注意：建议 delay 不要低于 20 毫秒。计时器频率不得超过 60 帧/秒，这意味着低于 16.6 毫秒的延迟可导致出现运行时问题。
             * @version Egret 2.4
             * @platform Web,Native
             * @language zh_CN
             */
            get: function () {
                return this._delay;
            },
            set: function (value) {
                //value = +value||0;
                if (value < 1) {
                    value = 1;
                }
                if (this._delay == value) {
                    return;
                }
                this._delay = value;
                this.lastCount = this.updateInterval = Math.round(60 * value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Timer.prototype, "currentCount", {
            /**
             * The total number of times the timer has fired since it started at zero. If the timer has been reset, only the fires since the reset are counted.
             * @version Egret 2.4
             * @platform Web,Native
             * @language en_US
             */
            /**
             * 计时器从 0 开始后触发的总次数。如果已重置了计时器，则只会计入重置后的触发次数。
             * @version Egret 2.4
             * @platform Web,Native
             * @language zh_CN
             */
            get: function () {
                return this._currentCount;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Timer.prototype, "running", {
            /**
             * The timer's current state; true if the timer is running, otherwise false.
             * @version Egret 2.4
             * @platform Web,Native
             * @language en_US
             */
            /**
             * 计时器的当前状态；如果计时器正在运行，则为 true，否则为 false。
             * @version Egret 2.4
             * @platform Web,Native
             * @language zh_CN
             */
            get: function () {
                return this._running;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Stops the timer, if it is running, and sets the currentCount property back to 0, like the reset button of a stopwatch.
         * Then, when start() is called, the timer instance runs for the specified number of repetitions, as set by the repeatCount value.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 如果计时器正在运行，则停止计时器，并将 currentCount 属性设回为 0，这类似于秒表的重置按钮。然后，在调用 start() 后，将运行计时器实例，运行次数为指定的重复次数（由 repeatCount 值设置）。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        Timer.prototype.reset = function () {
            this.stop();
            this._currentCount = 0;
        };
        /**
         * Starts the timer, if it is not already running.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 如果计时器尚未运行，则启动计时器。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        Timer.prototype.start = function () {
            if (this._running)
                return;
            this.lastCount = this.updateInterval;
            this.lastTimeStamp = Date.now();
            feng3d.ticker.onframe(this.$update, this);
            this._running = true;
        };
        /**
         * Stops the timer. When start() is called after stop(), the timer instance runs for the remaining number of
         * repetitions, as set by the repeatCount property.
         * @version Egret 2.4
         * @platform Web,Native
         * @language en_US
         */
        /**
         * 停止计时器。如果在调用 stop() 后调用 start()，则将继续运行计时器实例，运行次数为剩余的 重复次数（由 repeatCount 属性设置）。
         * @version Egret 2.4
         * @platform Web,Native
         * @language zh_CN
         */
        Timer.prototype.stop = function () {
            if (!this._running)
                return;
            feng3d.ticker.onframe(this.$update, this);
            this._running = false;
        };
        /**
         * @private
         * Ticker以60FPS频率刷新此方法
         */
        Timer.prototype.$update = function () {
            var timeStamp = Date.now();
            var deltaTime = timeStamp - this.lastTimeStamp;
            if (deltaTime >= this._delay) {
                this.lastCount = this.updateInterval;
            }
            else {
                this.lastCount -= 1000;
                if (this.lastCount > 0) {
                    return false;
                }
                this.lastCount += this.updateInterval;
            }
            this.lastTimeStamp = timeStamp;
            this._currentCount++;
            var complete = (this.repeatCount > 0 && this._currentCount >= this.repeatCount);
            this.dispatch("timer");
            if (complete) {
                this.stop();
                this.dispatch("timerComplete");
            }
            return false;
        };
        return Timer;
    }(feng3d.EventDispatcher));
    feng3d.Timer = Timer;
    ;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 键盘按键字典 （补充常量，a-z以及鼠标按键不必再次列出）
     * 例如 boardKeyDic[17] = "ctrl";
     */
    var boardKeyDic = {
        17: "ctrl",
        16: "shift",
        32: "escape",
        18: "alt",
        46: "del",
    };
    var KeyBoard = /** @class */ (function () {
        function KeyBoard() {
        }
        /**
         * 获取键盘按键名称
         * @param code   按键值
         */
        KeyBoard.getKey = function (code) {
            var key = boardKeyDic[code];
            if (key == null && 65 <= code && code <= 90) {
                key = String.fromCharCode(code).toLocaleLowerCase();
            }
            return key;
        };
        /**
         * 获取按键值
         * @param key 按键
         */
        KeyBoard.getCode = function (key) {
            key = key.toLocaleLowerCase();
            var code = key.charCodeAt(0);
            if (key.length == 1 && 65 <= code && code <= 90) {
                return code;
            }
            for (var code_1 in boardKeyDic) {
                if (boardKeyDic.hasOwnProperty(code_1)) {
                    if (boardKeyDic[code_1] == key)
                        return Number(code_1);
                }
            }
            feng3d.error("\u65E0\u6CD5\u83B7\u53D6\u6309\u952E " + key + " \u7684\u503C\uFF01");
            return code;
        };
        return KeyBoard;
    }());
    feng3d.KeyBoard = KeyBoard;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 按键捕获
     * @author feng 2016-4-26
     */
    var KeyCapture = /** @class */ (function () {
        /**
         * 构建
         * @param stage		舞台
         */
        function KeyCapture(shortCut) {
            /**
             * 捕获的按键字典
             */
            this._mouseKeyDic = {};
            this._keyState = shortCut.keyState;
            //
            feng3d.windowEventProxy.on("keydown", this.onKeydown, this);
            feng3d.windowEventProxy.on("keyup", this.onKeyup, this);
            //监听鼠标事件
            var mouseEvents = [
                "dblclick",
                "click",
                "mousedown",
                "mouseup",
                "mousemove",
                "mouseover",
                "mouseout",
            ];
            for (var i = 0; i < mouseEvents.length; i++) {
                feng3d.windowEventProxy.on(mouseEvents[i], this.onMouseOnce, this);
            }
            feng3d.windowEventProxy.on("mousewheel", this.onMousewheel, this);
        }
        /**
         * 鼠标事件
         */
        KeyCapture.prototype.onMouseOnce = function (event) {
            if (!feng3d.shortcut.enable)
                return;
            var mouseKey = event.type;
            this._keyState.pressKey(mouseKey, event);
            this._keyState.releaseKey(mouseKey, event);
        };
        /**
         * 鼠标事件
         */
        KeyCapture.prototype.onMousewheel = function (event) {
            if (!feng3d.shortcut.enable)
                return;
            var mouseKey = event.type;
            this._keyState.pressKey(mouseKey, event);
            this._keyState.releaseKey(mouseKey, event);
        };
        /**
         * 键盘按下事件
         */
        KeyCapture.prototype.onKeydown = function (event) {
            if (!feng3d.shortcut.enable)
                return;
            var boardKey = feng3d.KeyBoard.getKey(event.keyCode);
            if (boardKey != null)
                this._keyState.pressKey(boardKey, event);
        };
        /**
         * 键盘弹起事件
         */
        KeyCapture.prototype.onKeyup = function (event) {
            if (!feng3d.shortcut.enable)
                return;
            var boardKey = feng3d.KeyBoard.getKey(event.keyCode);
            if (boardKey)
                this._keyState.releaseKey(boardKey, event);
        };
        return KeyCapture;
    }());
    feng3d.KeyCapture = KeyCapture;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 按键状态
     * @author feng 2016-4-26
     */
    var KeyState = /** @class */ (function (_super) {
        __extends(KeyState, _super);
        /**
         * 构建
         */
        function KeyState() {
            var _this = _super.call(this) || this;
            _this._keyStateDic = {};
            return _this;
        }
        /**
         * 按下键
         * @param key 	键名称
         * @param data	携带数据
         */
        KeyState.prototype.pressKey = function (key, data) {
            // 处理鼠标中键与右键
            if (data instanceof MouseEvent) {
                if (["click", "mousedown", "mouseup"].indexOf(data.type) != -1) {
                    key = ["", "middle", "right"][data.button] + data.type;
                }
            }
            this._keyStateDic[key] = true;
            this.dispatch(key, data);
        };
        /**
         * 释放键
         * @param key	键名称
         * @param data	携带数据
         */
        KeyState.prototype.releaseKey = function (key, data) {
            // 处理鼠标中键与右键
            if (data instanceof MouseEvent) {
                if (["click", "mousedown", "mouseup"].indexOf(data.type) != -1) {
                    key = ["", "middle", "right"][data.button] + data.type;
                }
            }
            this._keyStateDic[key] = false;
            this.dispatch(key, data);
        };
        /**
         * 获取按键状态
         * @param key 按键名称
         */
        KeyState.prototype.getKeyState = function (key) {
            return !!this._keyStateDic[key];
        };
        return KeyState;
    }(feng3d.EventDispatcher));
    feng3d.KeyState = KeyState;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 快捷键捕获
     * @author feng 2016-4-26
     */
    var ShortCutCapture = /** @class */ (function () {
        /**
         * 构建快捷键捕获
         * @param shortCut				快捷键环境
         * @param key					快捷键；用“+”连接多个按键，“!”表示没按下某键；例如 “a+!b”表示按下“a”与没按下“b”时触发。
         * @param command				要执行的command的id；使用“,”连接触发多个命令；例如 “commandA,commandB”表示满足触发条件后依次执行commandA与commandB命令。
         * @param stateCommand			要执行的状态命令id；使用“,”连接触发多个状态命令，没带“!”表示激活该状态，否则表示使其处于非激活状态；例如 “stateA,!stateB”表示满足触发条件后激活状态“stateA，使“stateB处于非激活状态。
         * @param when					快捷键激活的条件；使用“+”连接多个状态，没带“!”表示需要处于激活状态，否则需要处于非激活状态； 例如 “stateA+!stateB”表示stateA处于激活状态且stateB处于非激活状态时会判断按键是否满足条件。
         */
        function ShortCutCapture(shortCut, key, command, stateCommand, when) {
            this._shortCut = shortCut;
            this._keyState = shortCut.keyState;
            this._key = key;
            this._command = command;
            this._stateCommand = stateCommand;
            this._when = when;
            this._keys = this.getKeys(key);
            this._states = this.getStates(when);
            this._commands = this.getCommands(command);
            this._stateCommands = this.getStateCommand(stateCommand);
            this.init();
        }
        /**
         * 初始化
         */
        ShortCutCapture.prototype.init = function () {
            for (var i = 0; i < this._keys.length; i++) {
                this._keyState.on(this._keys[i].key, this.onCapture, this);
            }
        };
        /**
         * 处理捕获事件
         */
        ShortCutCapture.prototype.onCapture = function (event) {
            var inWhen = this.checkActivityStates(this._states);
            var pressKeys = this.checkActivityKeys(this._keys);
            if (pressKeys && inWhen) {
                this.dispatchCommands(this._commands, event);
                this.executeStateCommands(this._stateCommands);
            }
        };
        /**
         * 派发命令
         */
        ShortCutCapture.prototype.dispatchCommands = function (commands, data) {
            for (var i = 0; i < commands.length; i++) {
                this._shortCut.dispatch(commands[i], data);
            }
        };
        /**
         * 执行状态命令
         */
        ShortCutCapture.prototype.executeStateCommands = function (stateCommands) {
            for (var i = 0; i < stateCommands.length; i++) {
                var stateCommand = stateCommands[i];
                if (stateCommand.not)
                    this._shortCut.deactivityState(stateCommand.state);
                else
                    this._shortCut.activityState(stateCommand.state);
            }
        };
        /**
         * 检测快捷键是否处于活跃状态
         */
        ShortCutCapture.prototype.checkActivityStates = function (states) {
            for (var i = 0; i < states.length; i++) {
                if (!this.getState(states[i]))
                    return false;
            }
            return true;
        };
        /**
         * 获取是否处于指定状态中（支持一个！取反）
         * @param state 状态名称
         */
        ShortCutCapture.prototype.getState = function (state) {
            var result = this._shortCut.getState(state.state);
            if (state.not) {
                result = !result;
            }
            return result;
        };
        /**
         * 检测是否按下给出的键
         * @param keys 按键数组
         */
        ShortCutCapture.prototype.checkActivityKeys = function (keys) {
            for (var i = 0; i < keys.length; i++) {
                if (!this.getKeyValue(keys[i]))
                    return false;
            }
            return true;
        };
        /**
         * 获取按键状态（true：按下状态，false：弹起状态）
         */
        ShortCutCapture.prototype.getKeyValue = function (key) {
            var value = this._keyState.getKeyState(key.key);
            if (key.not) {
                value = !value;
            }
            return value;
        };
        /**
         * 获取状态列表
         * @param when		状态字符串
         */
        ShortCutCapture.prototype.getStates = function (when) {
            var states = [];
            if (!when)
                return states;
            var state = when.trim();
            if (state.length == 0) {
                return states;
            }
            var stateStrs = state.split("+");
            for (var i = 0; i < stateStrs.length; i++) {
                states.push(new State(stateStrs[i]));
            }
            return states;
        };
        /**
         * 获取键列表
         * @param key		快捷键
         */
        ShortCutCapture.prototype.getKeys = function (key) {
            var keyStrs = key.split("+");
            var keys = [];
            for (var i = 0; i < keyStrs.length; i++) {
                keys.push(new Key(keyStrs[i]));
            }
            return keys;
        };
        /**
         * 获取命令列表
         * @param command	命令
         */
        ShortCutCapture.prototype.getCommands = function (command) {
            var commands = [];
            if (!command)
                return commands;
            command = command.trim();
            var commandStrs = command.split(",");
            for (var i = 0; i < commandStrs.length; i++) {
                var commandStr = commandStrs[i].trim();
                if (commandStr.length > 0) {
                    commands.push(commandStr);
                }
            }
            return commands;
        };
        /**
         * 获取状态命令列表
         * @param stateCommand	状态命令
         */
        ShortCutCapture.prototype.getStateCommand = function (stateCommand) {
            var stateCommands = [];
            if (!stateCommand)
                return stateCommands;
            stateCommand = stateCommand.trim();
            var stateCommandStrs = stateCommand.split(",");
            for (var i = 0; i < stateCommandStrs.length; i++) {
                var commandStr = stateCommandStrs[i].trim();
                if (commandStr.length > 0) {
                    stateCommands.push(new StateCommand(commandStr));
                }
            }
            return stateCommands;
        };
        /**
         * 销毁
         */
        ShortCutCapture.prototype.destroy = function () {
            for (var i = 0; i < this._keys.length; i++) {
                this._keyState.off(this._keys[i].key, this.onCapture, this);
            }
            this._shortCut = null;
            this._keys = null;
            this._states = null;
        };
        return ShortCutCapture;
    }());
    feng3d.ShortCutCapture = ShortCutCapture;
})(feng3d || (feng3d = {}));
/**
 * 按键
 * @author feng 2016-6-6
 */
var Key = /** @class */ (function () {
    function Key(key) {
        key = key.trim();
        if (key.charAt(0) == "!") {
            this.not = true;
            key = key.substr(1).trim();
        }
        this.key = key;
    }
    return Key;
}());
/**
 * 状态
 * @author feng 2016-6-6
 */
var State = /** @class */ (function () {
    function State(state) {
        state = state.trim();
        if (state.charAt(0) == "!") {
            this.not = true;
            state = state.substr(1).trim();
        }
        this.state = state;
    }
    return State;
}());
/**
 * 状态命令
 * @author feng 2016-6-6
 */
var StateCommand = /** @class */ (function () {
    function StateCommand(state) {
        state = state.trim();
        if (state.charAt(0) == "!") {
            this.not = true;
            state = state.substr(1).trim();
        }
        this.state = state;
    }
    return StateCommand;
}());
var feng3d;
(function (feng3d) {
    /**
     * 初始化快捷键模块
     * @author feng 2016-4-26
     *
     * <pre>
var shortcuts:Array = [ //
//在按下key1时触发命令command1
    {key: "key1", command: "command1", when: ""}, //
     //在按下key1时触发状态命令改变stateCommand1为激活状态
    {key: "key1", stateCommand: "stateCommand1", when: "state1"}, //
     //处于state1状态时按下key1触发命令command1
    {key: "key1", command: "command1", when: "state1"}, //
    //处于state1状态不处于state2时按下key1与没按下key2触发command1与command2，改变stateCommand1为激活状态，stateCommand2为非激活状态
    {key: "key1+ ! key2", command: "command1,command2", stateCommand: "stateCommand1,!stateCommand2", when: "state1+!state2"}, //
    ];
//添加快捷键
shortCut.addShortCuts(shortcuts);
//监听命令
Event.on(shortCut,<any>"run", function(e:Event):void
{
    trace("接受到命令：" + e.type);
});
     * </pre>
     */
    var ShortCut = /** @class */ (function (_super) {
        __extends(ShortCut, _super);
        /**
         * 初始化快捷键模块
         */
        function ShortCut() {
            var _this = _super.call(this) || this;
            /**
             * 启动
             */
            _this.enable = true;
            _this.keyState = new feng3d.KeyState();
            _this.keyCapture = new feng3d.KeyCapture(_this);
            _this.captureDic = {};
            _this.stateDic = {};
            return _this;
        }
        /**
         * 添加快捷键
         * @param shortcuts		快捷键列表
         */
        ShortCut.prototype.addShortCuts = function (shortcuts) {
            for (var i = 0; i < shortcuts.length; i++) {
                var shortcut = shortcuts[i];
                var shortcutUniqueKey = this.getShortcutUniqueKey(shortcut);
                this.captureDic[shortcutUniqueKey] = this.captureDic[shortcutUniqueKey] || new feng3d.ShortCutCapture(this, shortcut.key, shortcut.command, shortcut.stateCommand, shortcut.when);
            }
        };
        /**
         * 删除快捷键
         * @param shortcuts		快捷键列表
         */
        ShortCut.prototype.removeShortCuts = function (shortcuts) {
            for (var i = 0; i < shortcuts.length; i++) {
                var shortcutUniqueKey = this.getShortcutUniqueKey(shortcuts[i]);
                var shortCutCapture = this.captureDic[shortcutUniqueKey];
                if (feng3d.ShortCutCapture != null) {
                    shortCutCapture.destroy();
                }
                delete this.captureDic[shortcutUniqueKey];
            }
        };
        /**
         * 移除所有快捷键
         */
        ShortCut.prototype.removeAllShortCuts = function () {
            var _this = this;
            var keys = [];
            var key;
            for (key in this.captureDic) {
                keys.push(key);
            }
            keys.forEach(function (key) {
                var shortCutCapture = _this.captureDic[key];
                shortCutCapture.destroy();
                delete _this.captureDic[key];
            });
        };
        /**
         * 激活状态
         * @param state 状态名称
         */
        ShortCut.prototype.activityState = function (state) {
            this.stateDic[state] = true;
        };
        /**
         * 取消激活状态
         * @param state 状态名称
         */
        ShortCut.prototype.deactivityState = function (state) {
            delete this.stateDic[state];
        };
        /**
         * 获取状态
         * @param state 状态名称
         */
        ShortCut.prototype.getState = function (state) {
            return !!this.stateDic[state];
        };
        /**
         * 获取快捷键唯一字符串
         */
        ShortCut.prototype.getShortcutUniqueKey = function (shortcut) {
            return shortcut.key + "," + shortcut.command + "," + shortcut.stateCommand + "," + shortcut.when;
        };
        return ShortCut;
    }(feng3d.EventDispatcher));
    feng3d.ShortCut = ShortCut;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 加载类
     * @author feng 2016-12-14
     */
    feng3d.Loader = {
        /**
         * 加载文本
         */
        loadText: loadText,
        /**
         * 加载二进制
         */
        loadBinary: loadBinary,
        /**
         * 加载图片
         */
        loadImage: loadImage,
    };
    /**
     * 加载文本
     * @param url   路径
     */
    function loadText(url, onCompleted, onRequestProgress, onError) {
        xmlHttpRequestLoad({ url: url, dataFormat: feng3d.LoaderDataFormat.TEXT, onCompleted: onCompleted, onProgress: onRequestProgress, onError: onError });
    }
    /**
     * 加载二进制
     * @param url   路径
     */
    function loadBinary(url, onCompleted, onRequestProgress, onError) {
        xmlHttpRequestLoad({ url: url, dataFormat: feng3d.LoaderDataFormat.BINARY, onCompleted: onCompleted, onProgress: onRequestProgress, onError: onError });
    }
    /**
     * 加载图片
     * @param url   路径
     */
    function loadImage(url, onCompleted, onRequestProgress, onError) {
        var image = new Image();
        image.crossOrigin = "Anonymous";
        image.onload = function (event) {
            onCompleted && onCompleted(image);
        };
        image.onerror = function (event) {
            feng3d.debuger && feng3d.error("Error while trying to load texture: " + url);
            //
            image.src = "data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBmRXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAAExAAIAAAAQAAAATgAAAAAAAABgAAAAAQAAAGAAAAABcGFpbnQubmV0IDQuMC41AP/bAEMABAIDAwMCBAMDAwQEBAQFCQYFBQUFCwgIBgkNCw0NDQsMDA4QFBEODxMPDAwSGBITFRYXFxcOERkbGRYaFBYXFv/bAEMBBAQEBQUFCgYGChYPDA8WFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFv/AABEIAQABAAMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/APH6KKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FCiiigD6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++gooooA+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gUKKKKAPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76CiiigD5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BQooooA+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/voKKKKAPl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FCiiigD6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++gooooA+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gUKKKKAPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76CiiigD5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BQooooA+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/voKKKKAPl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FCiiigD6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++gooooA+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gUKKKKAPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76Pl+iiivuj+BT6gooor4U/vo+X6KKK+6P4FPqCiiivhT++j5fooor7o/gU+oKKKK+FP76P//Z";
            //
            var err = new Error(url + " 加载失败！");
            onError && onError(err);
        };
        image.src = url;
    }
    /**
     * 使用XMLHttpRequest加载
     * @param url           加载路径
     * @param dataFormat    数据类型
     */
    function xmlHttpRequestLoad(loadItem) {
        var request = new XMLHttpRequest();
        request.open('Get', loadItem.url, true);
        request.responseType = loadItem.dataFormat == feng3d.LoaderDataFormat.BINARY ? "arraybuffer" : "";
        request.onreadystatechange = onRequestReadystatechange(request, loadItem);
        request.onprogress = onRequestProgress(request, loadItem);
        request.send();
    }
    /**
     * 请求进度回调
     */
    function onRequestProgress(request, loadItem) {
        return function (event) {
            loadItem.onProgress && loadItem.onProgress(event.loaded, event.total);
        };
    }
    /**
     * 请求状态变化回调
     */
    function onRequestReadystatechange(request, loadItem) {
        return function (ev) {
            if (request.readyState == 4) {
                request.onreadystatechange = null;
                if (request.status >= 200 && request.status < 300) {
                    var content = loadItem.dataFormat == feng3d.LoaderDataFormat.TEXT ? request.responseText : request.response;
                    loadItem.onCompleted && loadItem.onCompleted(content);
                }
                else {
                    var err = new Error(loadItem.url + " 加载失败！");
                    loadItem.onError && loadItem.onError(err);
                }
            }
        };
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 加载数据类型
     * @author feng 2016-12-14
     */
    var LoaderDataFormat = /** @class */ (function () {
        function LoaderDataFormat() {
        }
        /**
         * 以原始二进制数据形式接收下载的数据。
         */
        LoaderDataFormat.BINARY = "binary";
        /**
         * 以文本形式接收已下载的数据。
         */
        LoaderDataFormat.TEXT = "text";
        /**
         * 图片数据
         */
        LoaderDataFormat.IMAGE = "image";
        return LoaderDataFormat;
    }());
    feng3d.LoaderDataFormat = LoaderDataFormat;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 渲染模式
     * A GLenum specifying the type primitive to render. Possible values are:
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
     * @author feng 2016-09-28
     */
    var RenderMode;
    (function (RenderMode) {
        /**
         * 点渲染
         * gl.POINTS: Draws a single dot.
         */
        RenderMode[RenderMode["POINTS"] = 0] = "POINTS";
        /**
         * gl.LINE_LOOP: Draws a straight line to the next vertex, and connects the last vertex back to the first.
         */
        RenderMode[RenderMode["LINE_LOOP"] = 1] = "LINE_LOOP";
        /**
         * gl.LINE_STRIP: Draws a straight line to the next vertex.
         */
        RenderMode[RenderMode["LINE_STRIP"] = 2] = "LINE_STRIP";
        /**
         * gl.LINES: Draws a line between a pair of vertices.
         */
        RenderMode[RenderMode["LINES"] = 3] = "LINES";
        /**
         * gl.TRIANGLES: Draws a triangle for a group of three vertices.
         */
        RenderMode[RenderMode["TRIANGLES"] = 4] = "TRIANGLES";
        /**
         * gl.TRIANGLE_STRIP
         * @see https://en.wikipedia.org/wiki/Triangle_strip
         */
        RenderMode[RenderMode["TRIANGLE_STRIP"] = 5] = "TRIANGLE_STRIP";
        /**
         * gl.TRIANGLE_FAN
         * @see https://en.wikipedia.org/wiki/Triangle_fan
         */
        RenderMode[RenderMode["TRIANGLE_FAN"] = 6] = "TRIANGLE_FAN";
    })(RenderMode = feng3d.RenderMode || (feng3d.RenderMode = {}));
    (feng3d.enums = feng3d.enums || {}).getRenderModeValue = function (gl) {
        return function (renderMode) {
            var value = gl.TRIANGLES;
            switch (renderMode) {
                case RenderMode.POINTS:
                    value = gl.POINTS;
                    break;
                case RenderMode.LINE_LOOP:
                    value = gl.LINE_LOOP;
                    break;
                case RenderMode.LINE_STRIP:
                    value = gl.LINE_STRIP;
                    break;
                case RenderMode.LINES:
                    value = gl.LINES;
                    break;
                case RenderMode.TRIANGLES:
                    value = gl.TRIANGLES;
                    break;
                case RenderMode.TRIANGLE_STRIP:
                    value = gl.TRIANGLE_STRIP;
                    break;
                case RenderMode.TRIANGLE_FAN:
                    value = gl.TRIANGLE_FAN;
                    break;
                default:
                    throw "\u6CA1\u6CD5\u5904\u7406\u679A\u4E3E\u503C " + RenderMode + " " + renderMode;
            }
            return value;
        };
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 纹理类型
     * A GLenum specifying the binding point (target). Possible values:
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindTexture
     */
    var TextureType;
    (function (TextureType) {
        /**
         * gl.TEXTURE_2D: A two-dimensional texture.
         */
        TextureType[TextureType["TEXTURE_2D"] = 0] = "TEXTURE_2D";
        /**
         * gl.TEXTURE_CUBE_MAP: A cube-mapped texture.
         */
        TextureType[TextureType["TEXTURE_CUBE_MAP"] = 1] = "TEXTURE_CUBE_MAP";
        /**
         * using a WebGL 2 context
         * gl.TEXTURE_3D: A three-dimensional texture.
         */
        TextureType[TextureType["TEXTURE_3D"] = 2] = "TEXTURE_3D";
        /**
         * using a WebGL 2 context
         * gl.TEXTURE_2D_ARRAY: A two-dimensional array texture.
         */
        TextureType[TextureType["TEXTURE_2D_ARRAY"] = 3] = "TEXTURE_2D_ARRAY";
    })(TextureType = feng3d.TextureType || (feng3d.TextureType = {}));
    (feng3d.enums = feng3d.enums || {}).getTextureTypeValue = function (gl) {
        return function (textureType) {
            var gl2 = gl;
            var value = gl.TEXTURE_2D;
            switch (textureType) {
                case TextureType.TEXTURE_2D:
                    value = gl.TEXTURE_2D;
                    break;
                case TextureType.TEXTURE_CUBE_MAP:
                    value = gl.TEXTURE_CUBE_MAP;
                    break;
                case TextureType.TEXTURE_3D:
                    value = gl2.TEXTURE_3D;
                    break;
                case TextureType.TEXTURE_2D_ARRAY:
                    value = gl2.TEXTURE_2D_ARRAY;
                    break;
                default:
                    feng3d.error("\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureType + " " + textureType);
            }
            return value;
        };
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 混合方法
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquation
     */
    var BlendEquation;
    (function (BlendEquation) {
        /**
         *  source + destination
         */
        BlendEquation[BlendEquation["FUNC_ADD"] = 0] = "FUNC_ADD";
        /**
         * source - destination
         */
        BlendEquation[BlendEquation["FUNC_SUBTRACT"] = 1] = "FUNC_SUBTRACT";
        /**
         * destination - source
         */
        BlendEquation[BlendEquation["FUNC_REVERSE_SUBTRACT"] = 2] = "FUNC_REVERSE_SUBTRACT";
        /**
         * When using the EXT_blend_minmax extension:
         * Minimum of source and destination
         */
        BlendEquation[BlendEquation["MIN_EXT"] = 3] = "MIN_EXT";
        /**
         * When using the EXT_blend_minmax extension:
         * Maximum of source and destination.
         */
        BlendEquation[BlendEquation["MAX_EXT"] = 4] = "MAX_EXT";
        /**
         * using a WebGL 2 context
         * Minimum of source and destination
         */
        BlendEquation[BlendEquation["MIN"] = 5] = "MIN";
        /**
         * using a WebGL 2 context
         * Maximum of source and destination.
         */
        BlendEquation[BlendEquation["MAX"] = 6] = "MAX";
    })(BlendEquation = feng3d.BlendEquation || (feng3d.BlendEquation = {}));
    (feng3d.enums = feng3d.enums || {}).getBlendEquationValue = function (gl) {
        return function (blendEquation) {
            var value = gl.FUNC_ADD;
            switch (blendEquation) {
                case BlendEquation.FUNC_ADD:
                    value = gl.FUNC_ADD;
                    break;
                case BlendEquation.FUNC_SUBTRACT:
                    value = gl.FUNC_SUBTRACT;
                    break;
                case BlendEquation.FUNC_REVERSE_SUBTRACT:
                    value = gl.FUNC_REVERSE_SUBTRACT;
                    break;
                default:
                    feng3d.error("\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + BlendEquation + " " + blendEquation);
            }
            return value;
        };
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 混合因子（R分量系数，G分量系数，B分量系数）
     */
    var BlendFactor;
    (function (BlendFactor) {
        /**
         * 0.0  0.0 0.0
         */
        BlendFactor[BlendFactor["ZERO"] = 0] = "ZERO";
        /**
         * 1.0  1.0 1.0
         */
        BlendFactor[BlendFactor["ONE"] = 1] = "ONE";
        /**
         * Rs   Gs  Bs
         */
        BlendFactor[BlendFactor["SRC_COLOR"] = 2] = "SRC_COLOR";
        /**
         * 1-Rs   1-Gs  1-Bs
         */
        BlendFactor[BlendFactor["ONE_MINUS_SRC_COLOR"] = 3] = "ONE_MINUS_SRC_COLOR";
        /**
         * Rd   Gd  Bd
         */
        BlendFactor[BlendFactor["DST_COLOR"] = 4] = "DST_COLOR";
        /**
         * 1-Rd   1-Gd  1-Bd
         */
        BlendFactor[BlendFactor["ONE_MINUS_DST_COLOR"] = 5] = "ONE_MINUS_DST_COLOR";
        /**
         * As   As  As
         */
        BlendFactor[BlendFactor["SRC_ALPHA"] = 6] = "SRC_ALPHA";
        /**
         * 1-As   1-As  1-As
         */
        BlendFactor[BlendFactor["ONE_MINUS_SRC_ALPHA"] = 7] = "ONE_MINUS_SRC_ALPHA";
        /**
         * Ad   Ad  Ad
         */
        BlendFactor[BlendFactor["DST_ALPHA"] = 8] = "DST_ALPHA";
        /**
         * 1-Ad   1-Ad  1-Ad
         */
        BlendFactor[BlendFactor["ONE_MINUS_DST_ALPHA"] = 9] = "ONE_MINUS_DST_ALPHA";
        /**
         * min(As-Ad)   min(As-Ad)  min(As-Ad)
         */
        BlendFactor[BlendFactor["SRC_ALPHA_SATURATE"] = 10] = "SRC_ALPHA_SATURATE";
    })(BlendFactor = feng3d.BlendFactor || (feng3d.BlendFactor = {}));
    (feng3d.enums = feng3d.enums || {}).getBlendFactorValue = function (gl) {
        return function (blendFactor) {
            var value = gl.ZERO;
            switch (blendFactor) {
                case BlendFactor.ZERO:
                    value = gl.ZERO;
                    break;
                case BlendFactor.ONE:
                    value = gl.ONE;
                    break;
                case BlendFactor.SRC_COLOR:
                    value = gl.SRC_COLOR;
                    break;
                case BlendFactor.ONE_MINUS_SRC_COLOR:
                    value = gl.ONE_MINUS_SRC_COLOR;
                    break;
                case BlendFactor.DST_COLOR:
                    value = gl.DST_COLOR;
                    break;
                case BlendFactor.ONE_MINUS_DST_COLOR:
                    value = gl.ONE_MINUS_DST_COLOR;
                    break;
                case BlendFactor.SRC_ALPHA:
                    value = gl.SRC_ALPHA;
                    break;
                case BlendFactor.ONE_MINUS_SRC_ALPHA:
                    value = gl.ONE_MINUS_SRC_ALPHA;
                    break;
                case BlendFactor.DST_ALPHA:
                    value = gl.DST_ALPHA;
                    break;
                case BlendFactor.ONE_MINUS_DST_ALPHA:
                    value = gl.ONE_MINUS_DST_ALPHA;
                    break;
                case BlendFactor.SRC_ALPHA_SATURATE:
                    value = gl.SRC_ALPHA_SATURATE;
                    break;
                default:
                    feng3d.error("\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + BlendFactor + " " + blendFactor);
                    break;
            }
            return value;
        };
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 裁剪面枚举
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
     */
    var CullFace;
    (function (CullFace) {
        /**
         * 关闭裁剪面
         */
        CullFace[CullFace["NONE"] = 0] = "NONE";
        /**
         * 正面
         */
        CullFace[CullFace["FRONT"] = 1] = "FRONT";
        /**
         * 背面
         */
        CullFace[CullFace["BACK"] = 2] = "BACK";
        /**
         * 正面与背面
         */
        CullFace[CullFace["FRONT_AND_BACK"] = 3] = "FRONT_AND_BACK";
    })(CullFace = feng3d.CullFace || (feng3d.CullFace = {}));
    (feng3d.enums = feng3d.enums || {}).getCullFaceValue = function (gl) {
        return function (cullFace) {
            var value = gl.BACK;
            switch (cullFace) {
                case CullFace.NONE:
                    value = gl.NONE;
                    break;
                case CullFace.FRONT:
                    value = gl.FRONT;
                    break;
                case CullFace.BACK:
                    value = gl.BACK;
                    break;
                case CullFace.FRONT_AND_BACK:
                    value = gl.FRONT_AND_BACK;
                    break;
                default:
                    feng3d.error("\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + CullFace + " " + cullFace);
                    break;
            }
            return value;
        };
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 正面方向枚举
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
     */
    var FrontFace;
    (function (FrontFace) {
        /**
         * Clock-wise winding.
         */
        FrontFace[FrontFace["CW"] = 0] = "CW";
        /**
         *  Counter-clock-wise winding.
         */
        FrontFace[FrontFace["CCW"] = 1] = "CCW";
    })(FrontFace = feng3d.FrontFace || (feng3d.FrontFace = {}));
    (feng3d.enums = feng3d.enums || {}).getFrontFaceValue = function (gl) {
        return function (frontFace) {
            var value = gl.CCW;
            switch (frontFace) {
                case FrontFace.CW:
                    value = gl.CW;
                    break;
                case FrontFace.CCW:
                    value = gl.CCW;
                    break;
                default:
                    feng3d.error("\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + FrontFace + " " + frontFace);
                    break;
            }
            return value;
        };
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 纹理颜色格式
     * A GLint specifying the color components in the texture
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
     */
    var TextureFormat;
    (function (TextureFormat) {
        /**
         * Discards the red, green and blue components and reads the alpha component.
         */
        TextureFormat[TextureFormat["ALPHA"] = 0] = "ALPHA";
        /**
         *  Discards the alpha components and reads the red, green and blue components.
         */
        TextureFormat[TextureFormat["RGB"] = 1] = "RGB";
        /**
         * Red, green, blue and alpha components are read from the color buffer.
         */
        TextureFormat[TextureFormat["RGBA"] = 2] = "RGBA";
        /**
         * Each color component is a luminance component, alpha is 1.0.
         */
        TextureFormat[TextureFormat["LUMINANCE"] = 3] = "LUMINANCE";
        /**
         * Each component is a luminance/alpha component.
         */
        TextureFormat[TextureFormat["LUMINANCE_ALPHA"] = 4] = "LUMINANCE_ALPHA";
        /**
         * When using the WEBGL_depth_texture extension:
         */
        TextureFormat[TextureFormat["DEPTH_COMPONENT"] = 5] = "DEPTH_COMPONENT";
        /**
         * When using the WEBGL_depth_texture extension:
         */
        TextureFormat[TextureFormat["DEPTH_STENCIL"] = 6] = "DEPTH_STENCIL";
        /**
         * When using the EXT_sRGB extension:
         */
        TextureFormat[TextureFormat["SRGB_EXT"] = 7] = "SRGB_EXT";
        /**
         * When using the EXT_sRGB extension:
         */
        TextureFormat[TextureFormat["SRGB_ALPHA_EXT"] = 8] = "SRGB_ALPHA_EXT";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["R8"] = 9] = "R8";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["R16F"] = 10] = "R16F";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["R32F"] = 11] = "R32F";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["R8UI"] = 12] = "R8UI";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RG8"] = 13] = "RG8";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RG16F"] = 14] = "RG16F";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RG32F"] = 15] = "RG32F";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RG8UI"] = 16] = "RG8UI";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RG16UI"] = 17] = "RG16UI";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RG32UI"] = 18] = "RG32UI";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RGB8"] = 19] = "RGB8";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["SRGB8"] = 20] = "SRGB8";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RGB565"] = 21] = "RGB565";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["R11F_G11F_B10F"] = 22] = "R11F_G11F_B10F";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RGB9_E5"] = 23] = "RGB9_E5";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RGB16F"] = 24] = "RGB16F";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RGB32F"] = 25] = "RGB32F";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RGB8UI"] = 26] = "RGB8UI";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RGBA8"] = 27] = "RGBA8";
        /**
         * using a WebGL 2 context
         */
        // SRGB8_APLHA8,
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RGB5_A1"] = 28] = "RGB5_A1";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RGB10_A2"] = 29] = "RGB10_A2";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RGBA4"] = 30] = "RGBA4";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RGBA16F"] = 31] = "RGBA16F";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RGBA32F"] = 32] = "RGBA32F";
        /**
         * using a WebGL 2 context
         */
        TextureFormat[TextureFormat["RGBA8UI"] = 33] = "RGBA8UI";
    })(TextureFormat = feng3d.TextureFormat || (feng3d.TextureFormat = {}));
    (feng3d.enums = feng3d.enums || {}).getTextureFormatValue = function (gl) {
        return function (textureFormat) {
            var gl2 = gl;
            var value = gl.RGB;
            switch (textureFormat) {
                case TextureFormat.ALPHA:
                    value = gl.ALPHA;
                    break;
                case TextureFormat.RGB:
                    value = gl.RGB;
                    break;
                case TextureFormat.RGBA:
                    value = gl.RGBA;
                    break;
                case TextureFormat.LUMINANCE:
                    value = gl.LUMINANCE;
                    break;
                case TextureFormat.LUMINANCE_ALPHA:
                    value = gl.LUMINANCE_ALPHA;
                    break;
                case TextureFormat.DEPTH_COMPONENT:
                    feng3d.assert(!!gl.extensions.webGLDepthTexture, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl.DEPTH_COMPONENT;
                    break;
                case TextureFormat.DEPTH_STENCIL:
                    feng3d.assert(!!gl.extensions.webGLDepthTexture, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl.DEPTH_STENCIL;
                    break;
                case TextureFormat.SRGB_EXT:
                    feng3d.assert(!!gl.extensions.eXTsRGB, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl.extensions.eXTsRGB.SRGB_EXT;
                    break;
                case TextureFormat.SRGB_ALPHA_EXT:
                    feng3d.assert(!!gl.extensions.eXTsRGB, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl.extensions.eXTsRGB.SRGB_ALPHA_EXT;
                    break;
                case TextureFormat.R8:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.R8;
                    break;
                case TextureFormat.R16F:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.R16F;
                    break;
                case TextureFormat.R32F:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.R32F;
                    break;
                case TextureFormat.R8UI:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.R8UI;
                    break;
                case TextureFormat.RG8:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RG8;
                    break;
                case TextureFormat.RG16F:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RG16F;
                    break;
                case TextureFormat.RG32F:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RG32F;
                    break;
                case TextureFormat.RG8UI:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RG8UI;
                    break;
                case TextureFormat.RG16UI:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RG16UI;
                    break;
                case TextureFormat.RG32UI:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RG32UI;
                    break;
                case TextureFormat.RGB8:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RGB8;
                    break;
                case TextureFormat.SRGB8:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.SRGB8;
                    break;
                case TextureFormat.RGB565:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RGB565;
                    break;
                case TextureFormat.R11F_G11F_B10F:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.R11F_G11F_B10F;
                    break;
                case TextureFormat.RGB9_E5:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RGB9_E5;
                    break;
                case TextureFormat.RGB16F:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RGB16F;
                    break;
                case TextureFormat.RGB32F:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RGB32F;
                    break;
                case TextureFormat.RGB8UI:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RGB8UI;
                    break;
                case TextureFormat.RGBA8:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RGBA8;
                    break;
                // case TextureFormat.SRGB8_APLHA8:
                //     assert(gl.webgl2, `不支持 ${TextureFormat} ${textureFormat} `);
                //     value = gl2.SRGB8_APLHA8;
                //     break;
                case TextureFormat.RGB5_A1:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RGB5_A1;
                    break;
                case TextureFormat.RGB10_A2:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RGB10_A2;
                    break;
                case TextureFormat.RGBA4:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RGBA4;
                    break;
                case TextureFormat.RGBA16F:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RGBA16F;
                    break;
                case TextureFormat.RGBA32F:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RGBA32F;
                    break;
                case TextureFormat.RGBA8UI:
                    feng3d.assert(gl.webgl2, "\u4E0D\u652F\u6301 " + TextureFormat + " " + textureFormat + " ");
                    value = gl2.RGBA8UI;
                    break;
                default:
                    feng3d.error("\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureFormat + " " + textureFormat);
                    break;
            }
            return value;
        };
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 纹理数据类型
     * A GLenum specifying the data type of the texel data
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
     */
    var TextureDataType;
    (function (TextureDataType) {
        /**
         * 8 bits per channel for gl.RGBA
         */
        TextureDataType[TextureDataType["UNSIGNED_BYTE"] = 0] = "UNSIGNED_BYTE";
        /**
         * 5 red bits, 6 green bits, 5 blue bits.
         */
        TextureDataType[TextureDataType["UNSIGNED_SHORT_5_6_5"] = 1] = "UNSIGNED_SHORT_5_6_5";
        /**
         * 4 red bits, 4 green bits, 4 blue bits, 4 alpha bits.
         */
        TextureDataType[TextureDataType["UNSIGNED_SHORT_4_4_4_4"] = 2] = "UNSIGNED_SHORT_4_4_4_4";
        /**
         * 5 red bits, 5 green bits, 5 blue bits, 1 alpha bit.
         */
        TextureDataType[TextureDataType["UNSIGNED_SHORT_5_5_5_1"] = 3] = "UNSIGNED_SHORT_5_5_5_1";
        /**
         * When using the WEBGL_depth_texture extension:
         */
        TextureDataType[TextureDataType["UNSIGNED_SHORT"] = 4] = "UNSIGNED_SHORT";
        /**
         * When using the WEBGL_depth_texture extension:
         */
        TextureDataType[TextureDataType["UNSIGNED_INT"] = 5] = "UNSIGNED_INT";
        /**
         * When using the WEBGL_depth_texture extension:
         *  (constant provided by the extension)
         */
        TextureDataType[TextureDataType["UNSIGNED_INT_24_8_WEBGL"] = 6] = "UNSIGNED_INT_24_8_WEBGL";
        //When using the OES_texture_half_float extension:
        /**
         * When using the OES_texture_float extension:
         */
        TextureDataType[TextureDataType["FLOAT"] = 7] = "FLOAT";
        /**
         * When using the OES_texture_half_float extension:
         *  (constant provided by the extension)
         */
        TextureDataType[TextureDataType["HALF_FLOAT_OES"] = 8] = "HALF_FLOAT_OES";
        // When using a WebGL 2 context, the following values are available additionally:
        /**
         * using a WebGL 2 context
         */
        TextureDataType[TextureDataType["BYTE"] = 9] = "BYTE";
        // UNSIGNED_SHORT   // 与上面合并处理
        /**
         * using a WebGL 2 context
         */
        TextureDataType[TextureDataType["SHORT"] = 10] = "SHORT";
        // UNSIGNED_INT     // 与上面合并处理
        /**
         * using a WebGL 2 context
         */
        TextureDataType[TextureDataType["INT"] = 11] = "INT";
        /**
         * using a WebGL 2 context
         */
        TextureDataType[TextureDataType["HALF_FLOAT"] = 12] = "HALF_FLOAT";
        // FLOAT               // 与上面合并处理
        /**
         * using a WebGL 2 context
         */
        TextureDataType[TextureDataType["UNSIGNED_INT_2_10_10_10_REV"] = 13] = "UNSIGNED_INT_2_10_10_10_REV";
        /**
         * using a WebGL 2 context
         */
        TextureDataType[TextureDataType["UNSIGNED_INT_10F_11F_11F_REV"] = 14] = "UNSIGNED_INT_10F_11F_11F_REV";
        /**
         * using a WebGL 2 context
         */
        TextureDataType[TextureDataType["UNSIGNED_INT_5_9_9_9_REV"] = 15] = "UNSIGNED_INT_5_9_9_9_REV";
        /**
         * using a WebGL 2 context
         */
        TextureDataType[TextureDataType["UNSIGNED_INT_24_8"] = 16] = "UNSIGNED_INT_24_8";
        /**
         * using a WebGL 2 context
         *  (pixels must be null)
         */
        TextureDataType[TextureDataType["FLOAT_32_UNSIGNED_INT_24_8_REV"] = 17] = "FLOAT_32_UNSIGNED_INT_24_8_REV";
    })(TextureDataType = feng3d.TextureDataType || (feng3d.TextureDataType = {}));
    (feng3d.enums = feng3d.enums || {}).getTextureDataTypeValue = function (gl) {
        var gl2 = gl;
        return function (textureDataType) {
            var value = gl.UNSIGNED_BYTE;
            switch (textureDataType) {
                case TextureDataType.UNSIGNED_BYTE:
                    value = gl.UNSIGNED_BYTE;
                    break;
                case TextureDataType.UNSIGNED_SHORT_5_6_5:
                    value = gl.UNSIGNED_SHORT_5_6_5;
                    break;
                case TextureDataType.UNSIGNED_SHORT_4_4_4_4:
                    value = gl.UNSIGNED_SHORT_4_4_4_4;
                    break;
                case TextureDataType.UNSIGNED_SHORT_5_5_5_1:
                    value = gl.UNSIGNED_SHORT_5_5_5_1;
                    break;
                case TextureDataType.UNSIGNED_SHORT:
                    feng3d.assert(!!gl.extensions.webGLDepthTexture || gl.webgl2, "\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureDataType + " " + textureDataType);
                    value = gl.UNSIGNED_SHORT;
                    break;
                case TextureDataType.UNSIGNED_INT:
                    feng3d.assert(!!gl.extensions.webGLDepthTexture || gl.webgl2, "\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureDataType + " " + textureDataType);
                    value = gl.UNSIGNED_INT;
                    break;
                case TextureDataType.UNSIGNED_INT_24_8_WEBGL:
                    feng3d.assert(!!gl.extensions.webGLDepthTexture, "\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureDataType + " " + textureDataType);
                    value = gl.extensions.webGLDepthTexture.UNSIGNED_INT_24_8_WEBGL;
                    break;
                case TextureDataType.FLOAT:
                    feng3d.assert(!!gl.extensions.oESTextureFloat || gl.webgl2, "\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureDataType + " " + textureDataType);
                    value = gl.FLOAT;
                    break;
                case TextureDataType.HALF_FLOAT_OES:
                    feng3d.assert(!!gl.extensions.oESTextureHalfFloat, "\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureDataType + " " + textureDataType);
                    value = gl.extensions.oESTextureHalfFloat.HALF_FLOAT_OES;
                    break;
                case TextureDataType.BYTE:
                    feng3d.assert(gl.webgl2, "\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureDataType + " " + textureDataType);
                    value = gl.BYTE;
                    break;
                case TextureDataType.SHORT:
                    feng3d.assert(gl.webgl2, "\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureDataType + " " + textureDataType);
                    value = gl.SHORT;
                    break;
                case TextureDataType.INT:
                    feng3d.assert(gl.webgl2, "\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureDataType + " " + textureDataType);
                    value = gl.INT;
                    break;
                case TextureDataType.HALF_FLOAT:
                    feng3d.assert(gl.webgl2, "\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureDataType + " " + textureDataType);
                    value = gl2.HALF_FLOAT;
                    break;
                case TextureDataType.UNSIGNED_INT_2_10_10_10_REV:
                    feng3d.assert(gl.webgl2, "\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureDataType + " " + textureDataType);
                    value = gl2.UNSIGNED_INT_2_10_10_10_REV;
                    break;
                case TextureDataType.UNSIGNED_INT_10F_11F_11F_REV:
                    feng3d.assert(gl.webgl2, "\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureDataType + " " + textureDataType);
                    value = gl2.UNSIGNED_INT_10F_11F_11F_REV;
                    break;
                case TextureDataType.UNSIGNED_INT_5_9_9_9_REV:
                    feng3d.assert(gl.webgl2, "\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureDataType + " " + textureDataType);
                    value = gl2.UNSIGNED_INT_5_9_9_9_REV;
                    break;
                case TextureDataType.UNSIGNED_INT_24_8:
                    feng3d.assert(gl.webgl2, "\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureDataType + " " + textureDataType);
                    value = gl2.UNSIGNED_INT_24_8;
                    break;
                case TextureDataType.FLOAT_32_UNSIGNED_INT_24_8_REV:
                    feng3d.assert(gl.webgl2, "\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureDataType + " " + textureDataType);
                    value = gl2.FLOAT_32_UNSIGNED_INT_24_8_REV;
                    break;
                default:
                    feng3d.error("\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureDataType + " " + textureDataType);
                    break;
            }
            return value;
        };
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 纹理缩小过滤器
     * Texture minification filter
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
     */
    var TextureMinFilter;
    (function (TextureMinFilter) {
        TextureMinFilter[TextureMinFilter["LINEAR"] = 0] = "LINEAR";
        TextureMinFilter[TextureMinFilter["NEAREST"] = 1] = "NEAREST";
        TextureMinFilter[TextureMinFilter["NEAREST_MIPMAP_NEAREST"] = 2] = "NEAREST_MIPMAP_NEAREST";
        TextureMinFilter[TextureMinFilter["LINEAR_MIPMAP_NEAREST"] = 3] = "LINEAR_MIPMAP_NEAREST";
        /**
         *  (default value)
         */
        TextureMinFilter[TextureMinFilter["NEAREST_MIPMAP_LINEAR"] = 4] = "NEAREST_MIPMAP_LINEAR";
        TextureMinFilter[TextureMinFilter["LINEAR_MIPMAP_LINEAR"] = 5] = "LINEAR_MIPMAP_LINEAR";
    })(TextureMinFilter = feng3d.TextureMinFilter || (feng3d.TextureMinFilter = {}));
    (feng3d.enums = feng3d.enums || {}).getTextureMinFilterValue = function (gl) {
        return function (textureMinFilter) {
            var value = gl.NEAREST_MIPMAP_LINEAR;
            switch (textureMinFilter) {
                case TextureMinFilter.LINEAR:
                    value = gl.LINEAR;
                    break;
                case TextureMinFilter.NEAREST:
                    value = gl.NEAREST;
                    break;
                case TextureMinFilter.NEAREST_MIPMAP_NEAREST:
                    value = gl.NEAREST_MIPMAP_NEAREST;
                    break;
                case TextureMinFilter.LINEAR_MIPMAP_NEAREST:
                    value = gl.LINEAR_MIPMAP_NEAREST;
                    break;
                case TextureMinFilter.NEAREST_MIPMAP_LINEAR:
                    value = gl.NEAREST_MIPMAP_LINEAR;
                    break;
                case TextureMinFilter.LINEAR_MIPMAP_LINEAR:
                    value = gl.LINEAR_MIPMAP_LINEAR;
                    break;
                default:
                    feng3d.error("\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureMinFilter + " " + textureMinFilter);
                    break;
            }
            return value;
        };
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 纹理放大滤波器
     * Texture magnification filter
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
     */
    var TextureMagFilter;
    (function (TextureMagFilter) {
        /**
         *  (default value)
         */
        TextureMagFilter[TextureMagFilter["LINEAR"] = 0] = "LINEAR";
        TextureMagFilter[TextureMagFilter["NEAREST"] = 1] = "NEAREST";
    })(TextureMagFilter = feng3d.TextureMagFilter || (feng3d.TextureMagFilter = {}));
    (feng3d.enums = feng3d.enums || {}).getTextureMagFilterValue = function (gl) {
        return function (textureMagFilter) {
            var value = gl.LINEAR;
            switch (textureMagFilter) {
                case TextureMagFilter.LINEAR:
                    value = gl.LINEAR;
                    break;
                case TextureMagFilter.NEAREST:
                    value = gl.NEAREST;
                    break;
                default:
                    feng3d.error("\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureMagFilter + " " + textureMagFilter);
                    break;
            }
            return value;
        };
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 纹理坐标s包装函数枚举
     * Wrapping function for texture coordinate s
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
     */
    var TextureWrap;
    (function (TextureWrap) {
        /**
         * (default value)
         */
        TextureWrap[TextureWrap["REPEAT"] = 0] = "REPEAT";
        TextureWrap[TextureWrap["CLAMP_TO_EDGE"] = 1] = "CLAMP_TO_EDGE";
        TextureWrap[TextureWrap["MIRRORED_REPEAT"] = 2] = "MIRRORED_REPEAT";
    })(TextureWrap = feng3d.TextureWrap || (feng3d.TextureWrap = {}));
    (feng3d.enums = feng3d.enums || {}).getTextureWrapValue = function (gl) {
        return function (textureWrap) {
            var value = gl.REPEAT;
            switch (textureWrap) {
                case TextureWrap.REPEAT:
                    value = gl.REPEAT;
                    break;
                case TextureWrap.CLAMP_TO_EDGE:
                    value = gl.CLAMP_TO_EDGE;
                    break;
                case TextureWrap.MIRRORED_REPEAT:
                    value = gl.MIRRORED_REPEAT;
                    break;
                default:
                    feng3d.error("\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + TextureWrap + " " + textureWrap);
                    break;
            }
            return value;
        };
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * GL 数组数据类型
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
     */
    var GLArrayType;
    (function (GLArrayType) {
        /**
         * signed 8-bit integer, with values in [-128, 127]
         */
        GLArrayType[GLArrayType["BYTE"] = 0] = "BYTE";
        /**
         *  signed 16-bit integer, with values in [-32768, 32767]
         */
        GLArrayType[GLArrayType["SHORT"] = 1] = "SHORT";
        /**
         * unsigned 8-bit integer, with values in [0, 255]
         */
        GLArrayType[GLArrayType["UNSIGNED_BYTE"] = 2] = "UNSIGNED_BYTE";
        /**
         * unsigned 16-bit integer, with values in [0, 65535]
         */
        GLArrayType[GLArrayType["UNSIGNED_SHORT"] = 3] = "UNSIGNED_SHORT";
        /**
         * 32-bit floating point number
         */
        GLArrayType[GLArrayType["FLOAT"] = 4] = "FLOAT";
        /**
         * using a WebGL 2 context
         * 16-bit floating point number
         */
        GLArrayType[GLArrayType["HALF_FLOAT"] = 5] = "HALF_FLOAT";
    })(GLArrayType = feng3d.GLArrayType || (feng3d.GLArrayType = {}));
    (feng3d.enums = feng3d.enums || {}).getGLArrayTypeValue = function (gl) {
        var gl2 = gl;
        return function (glArrayType) {
            var value = gl.FUNC_ADD;
            switch (glArrayType) {
                case GLArrayType.BYTE:
                    value = gl.BYTE;
                    break;
                case GLArrayType.SHORT:
                    value = gl.SHORT;
                    break;
                case GLArrayType.UNSIGNED_BYTE:
                    value = gl.UNSIGNED_BYTE;
                    break;
                case GLArrayType.UNSIGNED_SHORT:
                    value = gl.UNSIGNED_SHORT;
                    break;
                case GLArrayType.FLOAT:
                    value = gl.FLOAT;
                    break;
                case GLArrayType.HALF_FLOAT:
                    feng3d.assert(gl.webgl2, "\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + GLArrayType + " " + glArrayType);
                    value = gl2.HALF_FLOAT;
                    break;
                default:
                    feng3d.error("\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + GLArrayType + " " + glArrayType);
            }
            return value;
        };
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 深度检测方法枚举
     * A GLenum specifying the depth comparison function, which sets the conditions under which the pixel will be drawn. The default value is gl.LESS.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc
     */
    var DepthFunc;
    (function (DepthFunc) {
        /**
         * (never pass)
         */
        DepthFunc[DepthFunc["NEVER"] = 0] = "NEVER";
        /**
         *  (pass if the incoming value is less than the depth buffer value)
         */
        DepthFunc[DepthFunc["LESS"] = 1] = "LESS";
        /**
         *  (pass if the incoming value equals the the depth buffer value)
         */
        DepthFunc[DepthFunc["EQUAL"] = 2] = "EQUAL";
        /**
         *  (pass if the incoming value is less than or equal to the depth buffer value)
         */
        DepthFunc[DepthFunc["LEQUAL"] = 3] = "LEQUAL";
        /**
         * (pass if the incoming value is greater than the depth buffer value)
         */
        DepthFunc[DepthFunc["GREATER"] = 4] = "GREATER";
        /**
         * (pass if the incoming value is not equal to the depth buffer value)
         */
        DepthFunc[DepthFunc["NOTEQUAL"] = 5] = "NOTEQUAL";
        /**
         * (pass if the incoming value is greater than or equal to the depth buffer value)
         */
        DepthFunc[DepthFunc["GEQUAL"] = 6] = "GEQUAL";
        /**
         *  (always pass)
         */
        DepthFunc[DepthFunc["ALWAYS"] = 7] = "ALWAYS";
    })(DepthFunc = feng3d.DepthFunc || (feng3d.DepthFunc = {}));
    (feng3d.enums = feng3d.enums || {}).getdDepthFuncValue = function (gl) {
        return function (depthFunc) {
            var value = gl.LESS;
            switch (depthFunc) {
                case DepthFunc.NEVER:
                    value = gl.NEVER;
                    break;
                case DepthFunc.LESS:
                    value = gl.LESS;
                    break;
                case DepthFunc.EQUAL:
                    value = gl.EQUAL;
                    break;
                case DepthFunc.LEQUAL:
                    value = gl.LEQUAL;
                    break;
                case DepthFunc.GREATER:
                    value = gl.GREATER;
                    break;
                case DepthFunc.NOTEQUAL:
                    value = gl.NOTEQUAL;
                    break;
                case DepthFunc.GEQUAL:
                    value = gl.GEQUAL;
                    break;
                case DepthFunc.ALWAYS:
                    value = gl.ALWAYS;
                    break;
                default:
                    feng3d.error("\u65E0\u6CD5\u5904\u7406\u679A\u4E3E " + DepthFunc + " " + depthFunc);
                    break;
            }
            return value;
        };
    };
})(feng3d || (feng3d = {}));
// Type definitions for WebGL Extensions
// Project: http://webgl.org/
// Definitions by: Arthur Langereis <https://github.com/zenmumbler/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped/webgl-ext
//参考 
//https://www.khronos.org/registry/webgl/specs/latest/2.0/
//https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/webgl-ext/index.d.ts
//使用工具  
//http://regexr.com/
var feng3d;
(function (feng3d) {
    var GL = /** @class */ (function () {
        function GL() {
        }
        /**
         * 获取 GL 实例
         * @param canvas 画布
         * @param contextAttributes
         */
        GL.getGL = function (canvas, contextAttributes) {
            // var names = ["webgl2", "webgl"];
            var names = ["webgl"];
            var gl = null;
            for (var i = 0; i < names.length; ++i) {
                try {
                    gl = canvas.getContext(names[i], contextAttributes);
                    gl.contextId = names[i];
                    gl.contextAttributes = contextAttributes;
                    break;
                }
                catch (e) { }
            }
            if (!gl)
                throw "无法初始化WEBGL";
            //
            if (typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext)
                gl.webgl2 = true;
            //
            new feng3d.GLExtension(gl);
            new feng3d.GLEnum(gl);
            new feng3d.GLAdvanced(gl);
            new feng3d.Renderer(gl);
            gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
            gl.clearDepth(1.0); // Clear everything
            gl.enable(gl.DEPTH_TEST); // Enable depth testing
            gl.depthFunc(gl.LEQUAL); // Near things obscure far things
            return gl;
        };
        return GL;
    }());
    feng3d.GL = GL;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * WebWG2.0 或者 扩展功能
     */
    var GLAdvanced = /** @class */ (function () {
        function GLAdvanced(gl) {
            feng3d.assert(!gl.advanced, gl + " " + gl.advanced + " \u5B58\u5728\uFF01");
            gl.advanced = this;
            var gl2 = gl;
            this.drawElementsInstanced = function (mode, count, type, offset, instanceCount) {
                if (gl.webgl2) {
                    gl2.drawElementsInstanced(mode, count, type, offset, instanceCount);
                }
                else if (!!gl.extensions.aNGLEInstancedArrays) {
                    gl.extensions.aNGLEInstancedArrays.drawElementsInstancedANGLE(mode, count, type, offset, instanceCount);
                }
                else {
                    feng3d.warn("\u6D4F\u89C8\u5668 \u4E0D\u652F\u6301 drawElementsInstanced \uFF01");
                }
            };
            this.vertexAttribDivisor = function (index, divisor) {
                if (gl.webgl2) {
                    gl2.vertexAttribDivisor(index, divisor);
                }
                else if (!!gl.extensions.aNGLEInstancedArrays) {
                    gl.extensions.aNGLEInstancedArrays.vertexAttribDivisorANGLE(index, divisor);
                }
                else {
                    feng3d.warn("\u6D4F\u89C8\u5668 \u4E0D\u652F\u6301 vertexAttribDivisor \uFF01");
                }
            };
            this.drawArraysInstanced = function (mode, first, count, instanceCount) {
                if (gl.webgl2) {
                    gl2.drawArraysInstanced(mode, first, count, instanceCount);
                }
                else if (!!gl.extensions.aNGLEInstancedArrays) {
                    gl.extensions.aNGLEInstancedArrays.drawArraysInstancedANGLE(mode, first, count, instanceCount);
                }
                else {
                    feng3d.warn("\u6D4F\u89C8\u5668 \u4E0D\u652F\u6301 drawArraysInstanced \uFF01");
                }
            };
        }
        return GLAdvanced;
    }());
    feng3d.GLAdvanced = GLAdvanced;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * GL扩展
     */
    var GLExtension = /** @class */ (function () {
        function GLExtension(gl) {
            feng3d.assert(!gl.extensions, gl + " " + gl.extensions + " \u5B58\u5728\uFF01");
            gl.extensions = this;
            this.initExtensions(gl);
            this.cacheGLQuery(gl);
            new feng3d.GLProgramExtension(gl);
        }
        GLExtension.prototype.initExtensions = function (gl) {
            this.aNGLEInstancedArrays = gl.getExtension("ANGLE_instanced_arrays");
            this.eXTBlendMinMax = gl.getExtension("EXT_blend_minmax");
            this.eXTColorBufferHalfFloat = gl.getExtension("EXT_color_buffer_half_float");
            this.eXTFragDepth = gl.getExtension("EXT_frag_depth");
            this.eXTsRGB = gl.getExtension("EXT_sRGB");
            this.eXTShaderTextureLOD = gl.getExtension("EXT_shader_texture_lod");
            this.eXTTextureFilterAnisotropic = gl.getExtension("EXT_texture_filter_anisotropic");
            this.oESElementIndexUint = gl.getExtension("OES_element_index_uint");
            this.oESStandardDerivatives = gl.getExtension("OES_standard_derivatives");
            this.oESTextureFloat = gl.getExtension("OES_texture_float");
            this.oESTextureFloatLinear = gl.getExtension("OES_texture_float_linear");
            this.oESTextureHalfFloat = gl.getExtension("OES_texture_half_float");
            this.oESTextureHalfFloatLinear = gl.getExtension("OES_texture_half_float_linear");
            this.oESVertexArrayObject = gl.getExtension("OES_vertex_array_object");
            this.webGLColorBufferFloat = gl.getExtension("WEBGL_color_buffer_float");
            this.webGLCompressedTextureATC = gl.getExtension("WEBGL_compressed_texture_atc");
            this.webGLCompressedTextureETC1 = gl.getExtension("WEBGL_compressed_texture_etc1");
            this.webGLCompressedTexturePVRTC = gl.getExtension("WEBGL_compressed_texture_pvrtc");
            this.webGLCompressedTextureS3TC = gl.getExtension("WEBGL_compressed_texture_s3tc");
            this.webGLDebugRendererInfo = gl.getExtension("WEBGL_debug_renderer_info");
            this.webGLDebugShaders = gl.getExtension("WEBGL_debug_shaders");
            this.webGLDepthTexture = gl.getExtension("WEBGL_depth_texture");
            this.webGLDrawBuffers = gl.getExtension("WEBGL_draw_buffers");
            this.webGLLoseContext = gl.getExtension("WEBGL_lose_context");
            // Prefixed versions appearing in the wild as per September 2015
            this.eXTTextureFilterAnisotropic = this.eXTTextureFilterAnisotropic || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
            this.webGLCompressedTextureATC = this.webGLCompressedTextureATC || gl.getExtension("WEBKIT_WEBGL_compressed_texture_atc");
            this.webGLCompressedTexturePVRTC = this.webGLCompressedTexturePVRTC || gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
            this.webGLCompressedTextureS3TC = this.webGLCompressedTextureS3TC || gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
            this.webGLDepthTexture = this.webGLDepthTexture || gl.getExtension("WEBKIT_WEBGL_depth_texture");
            this.webGLLoseContext = this.webGLLoseContext || gl.getExtension("WEBKIT_WEBGL_lose_context");
            this.webGLCompressedTextureS3TC = this.webGLCompressedTextureS3TC || gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc");
            this.webGLDepthTexture = this.webGLDepthTexture || gl.getExtension("MOZ_WEBGL_depth_texture");
            this.webGLLoseContext = this.webGLLoseContext || gl.getExtension("MOZ_WEBGL_lose_context");
            //
            var eXTTextureFilterAnisotropic = this.eXTTextureFilterAnisotropic;
            if (eXTTextureFilterAnisotropic) {
                var maxAnisotropy = eXTTextureFilterAnisotropic.maxAnisotropy = gl.getParameter(eXTTextureFilterAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
                eXTTextureFilterAnisotropic.texParameterf = function (textureType, anisotropy) {
                    if (anisotropy > maxAnisotropy) {
                        anisotropy = maxAnisotropy;
                        feng3d.warn(anisotropy + " \u8D85\u51FA maxAnisotropy \u7684\u6700\u5927\u503C " + maxAnisotropy + " \uFF01,\u4F7F\u7528\u6700\u5927\u503C\u66FF\u6362\u3002");
                    }
                    gl.texParameterf(textureType, eXTTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, anisotropy);
                };
            }
        };
        /**
         * 缓存GL查询
         * @param gl GL实例
         */
        GLExtension.prototype.cacheGLQuery = function (gl) {
            var extensions = {};
            var oldGetExtension = gl.getExtension;
            gl.getExtension = function (name) {
                extensions[name] = extensions[name] || oldGetExtension.apply(gl, arguments);
                return extensions[name];
            };
            //
            var oldGetParameter = gl.getParameter;
            var parameters = {};
            gl.getParameter = function (pname) {
                parameters[pname] = parameters[pname] || oldGetParameter.apply(gl, arguments);
                return parameters[pname];
            };
        };
        return GLExtension;
    }());
    feng3d.GLExtension = GLExtension;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var GLProgramExtension = /** @class */ (function () {
        function GLProgramExtension(gl) {
            var oldCreateProgram = gl.createProgram;
            gl.createProgram = function () {
                if (arguments.length == 2) {
                    return createProgram(gl, arguments[0], arguments[1]);
                }
                var webGLProgram = oldCreateProgram.apply(gl, arguments);
                webGLProgram.destroy = function () {
                    gl.deleteProgram(webGLProgram);
                    gl.deleteShader(webGLProgram.fragmentShader);
                    gl.deleteShader(webGLProgram.vertexShader);
                };
                return webGLProgram;
            };
        }
        return GLProgramExtension;
    }());
    feng3d.GLProgramExtension = GLProgramExtension;
    /**
     * Create the linked program object
     * @param gl GL context
     * @param vshader a vertex shader program (string)
     * @param fshader a fragment shader program (string)
     * @return created program object, or null if the creation has failed
     */
    function createProgram(gl, vshader, fshader) {
        // Create shader object
        var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
        var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
        if (!vertexShader || !fragmentShader) {
            return null;
        }
        // Create a program object
        var program = gl.createProgram();
        if (!program) {
            return null;
        }
        // Attach the shader objects
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        // Link the program object
        gl.linkProgram(program);
        // Check the result of linking
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            var error = gl.getProgramInfoLog(program);
            feng3d.debuger && alert('Failed to link program: ' + error);
            gl.deleteProgram(program);
            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            return null;
        }
        program.gl = gl;
        program.vertexShader = vertexShader;
        program.fragmentShader = fragmentShader;
        initProgram(program);
        return program;
    }
    /**
     * 初始化渲染程序
     * @param shaderProgram WebGL渲染程序
     */
    function initProgram(shaderProgram) {
        var gl = shaderProgram.gl;
        //获取属性信息
        var numAttributes = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
        shaderProgram.attributes = {};
        var i = 0;
        while (i < numAttributes) {
            var activeInfo = gl.getActiveAttrib(shaderProgram, i++);
            if (activeInfo) {
                activeInfo.location = gl.getAttribLocation(shaderProgram, activeInfo.name);
                shaderProgram.attributes[activeInfo.name] = activeInfo;
            }
        }
        //获取uniform信息
        var numUniforms = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);
        shaderProgram.uniforms = {};
        var i = 0;
        var textureID = 0;
        while (i < numUniforms) {
            var activeInfo = gl.getActiveUniform(shaderProgram, i++);
            if (activeInfo) {
                if (activeInfo.name.indexOf("[") != -1) {
                    //处理数组
                    var baseName = activeInfo.name.substring(0, activeInfo.name.indexOf("["));
                    activeInfo.uniformBaseName = baseName;
                    var uniformLocationlist = activeInfo.uniformLocation = [];
                    for (var j = 0; j < activeInfo.size; j++) {
                        var location = gl.getUniformLocation(shaderProgram, baseName + ("[" + j + "]"));
                        location && uniformLocationlist.push(location);
                    }
                }
                else {
                    var uniformLocation = gl.getUniformLocation(shaderProgram, activeInfo.name);
                    if (uniformLocation) {
                        activeInfo.uniformLocation = uniformLocation;
                    }
                }
                if (activeInfo.type == gl.SAMPLER_2D || activeInfo.type == gl.SAMPLER_CUBE) {
                    activeInfo.textureID = textureID;
                    textureID++;
                }
                shaderProgram.uniforms[activeInfo.name] = activeInfo;
            }
        }
    }
    /**
     * Create a shader object
     * @param gl GL context
     * @param type the type of the shader object to be created
     * @param source shader program (string)
     * @return created shader object, or null if the creation has failed.
     */
    function loadShader(gl, type, source) {
        // Create shader object
        var shader = gl.createShader(type);
        if (shader == null) {
            feng3d.debuger && alert('unable to create shader');
            return null;
        }
        // Set the shader program
        gl.shaderSource(shader, source);
        // Compile the shader
        gl.compileShader(shader);
        // Check the result of compilation
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            var error = gl.getShaderInfoLog(shader);
            feng3d.debuger && alert('Failed to compile shader: ' + error);
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
})(feng3d || (feng3d = {}));
/**
 * @author mrdoob / http://mrdoob.com/
 */
var feng3d;
(function (feng3d) {
    /**
     * WEBGL 功能
     */
    var WebGLCapabilities = /** @class */ (function () {
        function WebGLCapabilities(gl, extensions, parameters) {
            var maxAnisotropy;
            function getMaxAnisotropy() {
                if (maxAnisotropy !== undefined)
                    return maxAnisotropy;
                var extension = extensions.get('EXT_texture_filter_anisotropic');
                if (extension !== null) {
                    maxAnisotropy = gl.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
                }
                else {
                    maxAnisotropy = 0;
                }
                return maxAnisotropy;
            }
            function getMaxPrecision(precision) {
                if (precision === 'highp') {
                    if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision > 0 &&
                        gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0) {
                        return 'highp';
                    }
                    precision = 'mediump';
                }
                if (precision === 'mediump') {
                    if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision > 0 &&
                        gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0) {
                        return 'mediump';
                    }
                }
                return 'lowp';
            }
            var precision = parameters.precision !== undefined ? parameters.precision : 'highp';
            var maxPrecision = getMaxPrecision(precision);
            if (maxPrecision !== precision) {
                feng3d.warn('THREE.WebGLRenderer:', precision, 'not supported, using', maxPrecision, 'instead.');
                precision = maxPrecision;
            }
            var logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === true;
            var maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
            var maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
            var maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            var maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
            var maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
            var maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
            var maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
            var maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
            var vertexTextures = maxVertexTextures > 0;
            var floatFragmentTextures = !!extensions.get('OES_texture_float');
            var floatVertexTextures = vertexTextures && floatFragmentTextures;
            this.getMaxAnisotropy = getMaxAnisotropy;
            this.getMaxPrecision = getMaxPrecision;
            this.precision = precision;
            this.logarithmicDepthBuffer = logarithmicDepthBuffer;
            this.maxTextures = maxTextures;
            this.maxVertexTextures = maxVertexTextures;
            this.maxTextureSize = maxTextureSize;
            this.maxCubemapSize = maxCubemapSize;
            this.maxAttributes = maxAttributes;
            this.maxVertexUniforms = maxVertexUniforms;
            this.maxVaryings = maxVaryings;
            this.maxFragmentUniforms = maxFragmentUniforms;
            this.vertexTextures = vertexTextures;
            this.floatFragmentTextures = floatFragmentTextures;
            this.floatVertexTextures = floatVertexTextures;
        }
        return WebGLCapabilities;
    }());
    feng3d.WebGLCapabilities = WebGLCapabilities;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * GL枚举
     */
    var GLEnum = /** @class */ (function () {
        function GLEnum(gl) {
            feng3d.assert(!gl.enums, gl + " " + gl.enums + " \u5B58\u5728\uFF01");
            gl.enums = this;
            this.getRenderModeValue = feng3d.enums.getRenderModeValue(gl);
            this.getTextureTypeValue = feng3d.enums.getTextureTypeValue(gl);
            this.getBlendEquationValue = feng3d.enums.getBlendEquationValue(gl);
            this.getBlendFactorValue = feng3d.enums.getBlendFactorValue(gl);
            this.getCullFaceValue = feng3d.enums.getCullFaceValue(gl);
            this.getFrontFaceValue = feng3d.enums.getFrontFaceValue(gl);
            this.getTextureFormatValue = feng3d.enums.getTextureFormatValue(gl);
            this.getTextureDataTypeValue = feng3d.enums.getTextureDataTypeValue(gl);
            this.getTextureMinFilterValue = feng3d.enums.getTextureMinFilterValue(gl);
            this.getTextureMagFilterValue = feng3d.enums.getTextureMagFilterValue(gl);
            this.getTextureWrapValue = feng3d.enums.getTextureWrapValue(gl);
            this.getGLArrayTypeValue = feng3d.enums.getGLArrayTypeValue(gl);
            this.getdDepthFuncValue = feng3d.enums.getdDepthFuncValue(gl);
        }
        return GLEnum;
    }());
    feng3d.GLEnum = GLEnum;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    feng3d.lazy = { getvalue: getvalue };
    // export class Lazyy<T>
    // {
    //     lazy: T | (() => T);
    //     get value()
    //     {
    //         if (typeof this.lazy == "function")
    //             return this.lazy();
    //         return this.lazy;
    //     }
    //     constructor(lazy: T | (() => T))
    //     {
    //         this.lazy = lazy;
    //     }
    // }
    function getvalue(lazyItem) {
        if (typeof lazyItem == "function")
            return lazyItem();
        return lazyItem;
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var Shader = /** @class */ (function () {
        function Shader() {
            //
            this._invalid = true;
            this._macro = { boolMacros: {}, valueMacros: {}, addMacros: {} };
            /**
             * 纹理缓冲
             */
            this._webGLProgramMap = new Map();
        }
        Object.defineProperty(Shader.prototype, "macro", {
            get: function () {
                return this._macro;
            },
            set: function (value) {
                this._macro = value;
                this.invalidate();
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 激活渲染程序
         */
        Shader.prototype.activeShaderProgram = function (gl) {
            if (!this.vertexCode || !this.fragmentCode)
                return null;
            if (this._invalid) {
                this._invalid = false;
                this._webGLProgramMap.forEach(function (value, key) {
                    value.destroy();
                });
                this._webGLProgramMap.clear();
                //应用宏
                var shaderMacroStr = this.getMacroCode(this.macro);
                this._resultVertexCode = this.vertexCode.replace(/#define\s+macros/, shaderMacroStr);
                this._resultFragmentCode = this.fragmentCode.replace(/#define\s+macros/, shaderMacroStr);
            }
            //渲染程序
            var shaderProgram = this._webGLProgramMap.get(gl);
            if (!shaderProgram) {
                shaderProgram = gl.createProgram(this._resultVertexCode, this._resultFragmentCode);
                if (!shaderProgram)
                    return null;
                this._webGLProgramMap.set(gl, shaderProgram);
                shaderProgram.vertexCode = this._resultVertexCode;
                shaderProgram.fragmentCode = this._resultFragmentCode;
            }
            gl.useProgram(shaderProgram);
            return shaderProgram;
        };
        Shader.prototype.invalidate = function () {
            this._invalid = true;
        };
        Shader.prototype.getMacroCode = function (macro) {
            var macroHeader = "";
            var macroNames = Object.keys(macro.valueMacros);
            macroNames = macroNames.sort();
            macroNames.forEach(function (macroName) {
                var value = macro.valueMacros[macroName];
                macroHeader += "#define " + macroName + " " + value + "\n";
            });
            macroNames = Object.keys(macro.boolMacros);
            macroNames = macroNames.sort();
            macroNames.forEach(function (macroName) {
                var value = macro.boolMacros[macroName];
                value && (macroHeader += "#define " + macroName + "\n");
            });
            macroNames = Object.keys(macro.addMacros);
            macroNames = macroNames.sort();
            macroNames.forEach(function (macroName) {
                var value = macro.addMacros[macroName];
                macroHeader += "#define " + macroName + " " + value + "\n";
            });
            return macroHeader;
        };
        return Shader;
    }());
    feng3d.Shader = Shader;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 渲染参数
     * @author feng 2016-12-14
     */
    var RenderParams = /** @class */ (function () {
        function RenderParams() {
            /**
             * 渲染模式
             */
            this.renderMode = feng3d.RenderMode.TRIANGLES;
            this.cullFace = feng3d.CullFace.BACK;
            this.frontFace = feng3d.FrontFace.CCW;
            this.enableBlend = false;
            this.blendEquation = feng3d.BlendEquation.FUNC_ADD;
            this.sfactor = feng3d.BlendFactor.SRC_ALPHA;
            this.dfactor = feng3d.BlendFactor.ONE_MINUS_SRC_ALPHA;
            this.depthtest = true;
            this.depthMask = true;
            this.depthFunc = feng3d.DepthFunc.LESS;
            this.viewRect = new feng3d.Rectangle(0, 0, 100, 100);
            this.useViewRect = false;
        }
        return RenderParams;
    }());
    feng3d.RenderParams = RenderParams;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 渲染原子（该对象会收集一切渲染所需数据以及参数）
     * @author feng 2016-06-20
     */
    var RenderAtomic = /** @class */ (function () {
        function RenderAtomic() {
            /**
             * 渲染参数
             */
            this.renderParams = new feng3d.RenderParams();
            /**
             * 渲染程序
             */
            this.shader = new feng3d.Shader();
            /**
             * 属性数据列表
             */
            this.attributes = {};
            /**
             * Uniform渲染数据
             */
            this.uniforms = {};
            /**
             * 可渲染条件，当所有条件值均为true是可以渲染
             */
            this.renderableCondition = {};
            this.uniforms.s_ambient;
        }
        return RenderAtomic;
    }());
    feng3d.RenderAtomic = RenderAtomic;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 索引渲染数据
     * @author feng 2017-01-04
     */
    var Index = /** @class */ (function () {
        function Index() {
            /**
             * 数据类型，gl.UNSIGNED_BYTE、gl.UNSIGNED_SHORT
             */
            this.type = feng3d.GLArrayType.UNSIGNED_SHORT;
            /**
             * 索引偏移
             */
            this.offset = 0;
            /**
             * 缓冲
             */
            this._indexBufferMap = new Map();
            /**
             * 是否失效
             */
            this.invalid = true;
        }
        Object.defineProperty(Index.prototype, "indices", {
            /**
             * 索引数据
             */
            get: function () {
                return this._indices;
            },
            set: function (value) {
                if (this._indices == value)
                    return;
                this._indices = value;
                this.invalid = true;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 激活缓冲
         * @param gl
         */
        Index.prototype.active = function (gl) {
            if (this.invalid) {
                this.clear();
                this.invalid = false;
                this._value = new Uint16Array(feng3d.lazy.getvalue(this._indices));
                this.count = this._value.length;
            }
            var buffer = this.getBuffer(gl);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        };
        /**
         * 获取缓冲
         */
        Index.prototype.getBuffer = function (gl) {
            var buffer = this._indexBufferMap.get(gl);
            if (!buffer) {
                buffer = gl.createBuffer();
                if (!buffer) {
                    feng3d.error("createBuffer 失败！");
                    throw "";
                }
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._value, gl.STATIC_DRAW);
                this._indexBufferMap.set(gl, buffer);
            }
            return buffer;
        };
        /**
         * 清理缓冲
         */
        Index.prototype.clear = function () {
            this._indexBufferMap.forEach(function (value, key) {
                key.deleteBuffer(value);
            });
            this._indexBufferMap.clear();
        };
        return Index;
    }());
    feng3d.Index = Index;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 属性渲染数据
     * @author feng 2014-8-14
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer}
     */
    var Attribute = /** @class */ (function () {
        function Attribute(name, data, size, divisor) {
            if (size === void 0) { size = 3; }
            if (divisor === void 0) { divisor = 0; }
            /**
             * 数据尺寸
             *
             * A GLint specifying the number of components per vertex attribute. Must be 1, 2, 3, or 4.
             */
            this.size = 3;
            /**
             *  A GLenum specifying the data type of each component in the array. Possible values:
                    - gl.BYTE: signed 8-bit integer, with values in [-128, 127]
                    - gl.SHORT: signed 16-bit integer, with values in [-32768, 32767]
                    - gl.UNSIGNED_BYTE: unsigned 8-bit integer, with values in [0, 255]
                    - gl.UNSIGNED_SHORT: unsigned 16-bit integer, with values in [0, 65535]
                    - gl.FLOAT: 32-bit floating point number
                When using a WebGL 2 context, the following values are available additionally:
                   - gl.HALF_FLOAT: 16-bit floating point number
             */
            this.type = feng3d.GLArrayType.FLOAT;
            /**
             * A GLboolean specifying whether integer data values should be normalized when being casted to a float.
                  -  If true, signed integers are normalized to [-1, 1].
                  -  If true, unsigned integers are normalized to [0, 1].
                  -  For types gl.FLOAT and gl.HALF_FLOAT, this parameter has no effect.
             */
            this.normalized = false;
            /**
             * A GLsizei specifying the offset in bytes between the beginning of consecutive vertex attributes. Cannot be larger than 255.
             */
            this.stride = 0;
            /**
             * A GLintptr specifying an offset in bytes of the first component in the vertex attribute array. Must be a multiple of type.
             */
            this.offset = 0;
            /**
             * drawElementsInstanced时将会用到的因子，表示divisor个geometry共用一个数据
             *
             * A GLuint specifying the number of instances that will pass between updates of the generic attribute.
             * @see https://developer.mozilla.org/en-US/docs/Web/API/ANGLE_instanced_arrays/vertexAttribDivisorANGLE
             */
            this.divisor = 0;
            /**
             * 是否失效
             */
            this.invalid = true;
            /**
             * 顶点数据缓冲
             */
            this._indexBufferMap = new Map();
            this.name = name;
            this._data = data;
            this.size = size;
            this.divisor = divisor;
        }
        Object.defineProperty(Attribute.prototype, "data", {
            /**
             * 属性数据
             */
            get: function () { return this._data; },
            set: function (value) { this.invalid = true; this._data = value; },
            enumerable: true,
            configurable: true
        });
        /**
         *
         * @param gl
         * @param location A GLuint specifying the index of the vertex attribute that is to be modified.
         */
        Attribute.prototype.active = function (gl, location) {
            if (this.invalid) {
                this.clear();
                this.invalid = false;
                this._value = new Float32Array(feng3d.lazy.getvalue(this._data));
            }
            var type = gl.enums.getGLArrayTypeValue(this.type);
            gl.enableVertexAttribArray(location);
            var buffer = this.getBuffer(gl);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.vertexAttribPointer(location, this.size, type, this.normalized, this.stride, this.offset);
            //渲染时必须重置
            gl.advanced.vertexAttribDivisor(location, this.divisor);
        };
        /**
         * 获取缓冲
         */
        Attribute.prototype.getBuffer = function (gl) {
            var buffer = this._indexBufferMap.get(gl);
            if (!buffer) {
                var newbuffer = gl.createBuffer();
                if (!newbuffer) {
                    feng3d.error("createBuffer 失败！");
                    throw "";
                }
                buffer = newbuffer;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, this._value, gl.STATIC_DRAW);
                this._indexBufferMap.set(gl, buffer);
            }
            return buffer;
        };
        /**
         * 清理缓冲
         */
        Attribute.prototype.clear = function () {
            this._indexBufferMap.forEach(function (value, key, map) {
                key.deleteBuffer(value);
            });
            this._indexBufferMap.clear();
        };
        return Attribute;
    }());
    feng3d.Attribute = Attribute;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 纹理信息
     * @author feng 2016-12-20
     */
    var TextureInfo = /** @class */ (function (_super) {
        __extends(TextureInfo, _super);
        function TextureInfo() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._format = feng3d.TextureFormat.RGB;
            _this._type = feng3d.TextureDataType.UNSIGNED_BYTE;
            _this._generateMipmap = false;
            _this._flipY = false;
            _this._premulAlpha = false;
            _this.minFilter = feng3d.TextureMinFilter.LINEAR;
            _this.magFilter = feng3d.TextureMagFilter.LINEAR;
            /**
             * 表示x轴的纹理的回环方式，就是当纹理的宽度小于需要贴图的平面的宽度的时候，平面剩下的部分应该p以何种方式贴图的问题。
             */
            _this.wrapS = feng3d.TextureWrap.REPEAT;
            /**
             * 表示y轴的纹理回环方式。 magFilter和minFilter表示过滤的方式，这是OpenGL的基本概念，我将在下面讲一下，目前你不用担心它的使用。当您不设置的时候，它会取默认值，所以，我们这里暂时不理睬他。
             */
            _this.wrapT = feng3d.TextureWrap.REPEAT;
            /**
             * 各向异性过滤。使用各向异性过滤能够使纹理的效果更好，但是会消耗更多的内存、CPU、GPU时间。默认为0。
             */
            _this.anisotropy = 0;
            /**
             * 纹理缓冲
             */
            _this._textureMap = new Map();
            /**
             * 是否失效
             */
            _this._invalid = true;
            return _this;
        }
        Object.defineProperty(TextureInfo.prototype, "format", {
            /**
             * 格式
             */
            get: function () { return this._format; },
            set: function (value) { this._format = value; this.invalidate(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextureInfo.prototype, "type", {
            /**
             * 数据类型
             */
            get: function () { return this._type; },
            set: function (value) { this._type = value; this.invalidate(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextureInfo.prototype, "generateMipmap", {
            /**
             * 是否生成mipmap
             */
            get: function () { return this._generateMipmap; },
            set: function (value) { this._generateMipmap = value; this.invalidate(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextureInfo.prototype, "flipY", {
            /**
             * 对图像进行Y轴反转。默认值为false
             */
            get: function () { return this._flipY; },
            set: function (value) { this._flipY = value; this.invalidate(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextureInfo.prototype, "premulAlpha", {
            /**
             * 将图像RGB颜色值得每一个分量乘以A。默认为false
             */
            get: function () { return this._premulAlpha; },
            set: function (value) { this._premulAlpha = value; this.invalidate(); },
            enumerable: true,
            configurable: true
        });
        /**
         * 判断数据是否满足渲染需求
         */
        TextureInfo.prototype.checkRenderData = function () {
            feng3d.debuger && feng3d.assert(false);
            return false;
        };
        /**
         * 使纹理失效
         */
        TextureInfo.prototype.invalidate = function () {
            this._invalid = true;
        };
        /**
         * 激活纹理
         * @param gl
         */
        TextureInfo.prototype.active = function (gl) {
            if (!this.checkRenderData())
                return;
            if (this._invalid) {
                this.clear();
                this._invalid = false;
            }
            var texture = this.getTexture(gl);
            var textureType = gl.enums.getTextureTypeValue(this._textureType);
            var minFilter = gl.enums.getTextureMinFilterValue(this.minFilter);
            var magFilter = gl.enums.getTextureMagFilterValue(this.magFilter);
            var wrapS = gl.enums.getTextureWrapValue(this.wrapS);
            var wrapT = gl.enums.getTextureWrapValue(this.wrapT);
            //绑定纹理
            gl.bindTexture(textureType, texture);
            //设置纹理参数
            gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, minFilter);
            gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, magFilter);
            gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, wrapS);
            gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, wrapT);
            //
            if (this.anisotropy) {
                var eXTTextureFilterAnisotropic = gl.extensions.eXTTextureFilterAnisotropic;
                if (gl.extensions.eXTTextureFilterAnisotropic) {
                    gl.extensions.eXTTextureFilterAnisotropic.texParameterf(textureType, this.anisotropy);
                }
                else {
                    feng3d.debuger && alert("浏览器不支持各向异性过滤（anisotropy）特性！");
                }
            }
        };
        /**
         * 获取顶点属性缓冲
         * @param data  数据
         */
        TextureInfo.prototype.getTexture = function (gl) {
            var texture = this._textureMap.get(gl);
            if (!texture) {
                var newtexture = gl.createTexture(); // Create a texture object
                if (!newtexture) {
                    feng3d.error("createTexture 失败！");
                    throw "";
                }
                texture = newtexture;
                var textureType = gl.enums.getTextureTypeValue(this._textureType);
                //设置图片y轴方向
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, this.flipY ? 1 : 0);
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premulAlpha ? 1 : 0);
                //绑定纹理
                gl.bindTexture(textureType, texture);
                //设置纹理图片
                this.initTexture(gl);
                if (this._generateMipmap) {
                    gl.generateMipmap(textureType);
                }
                this._textureMap.set(gl, texture);
            }
            return texture;
        };
        /**
         * 初始化纹理
         */
        TextureInfo.prototype.initTexture = function (gl) {
            var format = gl.enums.getTextureFormatValue(this._format);
            var type = gl.enums.getTextureDataTypeValue(this._type);
            switch (this._textureType) {
                case feng3d.TextureType.TEXTURE_CUBE_MAP:
                    var pixels = this._pixels;
                    var faces = [
                        gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                        gl.TEXTURE_CUBE_MAP_NEGATIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
                    ];
                    for (var i = 0; i < faces.length; i++) {
                        gl.texImage2D(faces[i], 0, format, format, type, this._pixels[i]);
                    }
                    break;
                case feng3d.TextureType.TEXTURE_2D:
                    var _pixel = this._pixels;
                    var textureType = gl.enums.getTextureTypeValue(this._textureType);
                    gl.texImage2D(textureType, 0, format, format, type, _pixel);
                    break;
                default:
                    break;
            }
        };
        /**
         * 清理纹理
         */
        TextureInfo.prototype.clear = function () {
            this._textureMap.forEach(function (v, k) {
                k.deleteTexture(v);
            });
            this._textureMap.clear();
        };
        __decorate([
            feng3d.serialize(feng3d.TextureFormat.RGB),
            feng3d.oav()
        ], TextureInfo.prototype, "format", null);
        __decorate([
            feng3d.serialize(feng3d.TextureDataType.UNSIGNED_BYTE),
            feng3d.oav()
        ], TextureInfo.prototype, "type", null);
        __decorate([
            feng3d.serialize(false),
            feng3d.oav()
        ], TextureInfo.prototype, "generateMipmap", null);
        __decorate([
            feng3d.serialize(false),
            feng3d.oav()
        ], TextureInfo.prototype, "flipY", null);
        __decorate([
            feng3d.serialize(false),
            feng3d.oav()
        ], TextureInfo.prototype, "premulAlpha", null);
        __decorate([
            feng3d.serialize(feng3d.TextureMinFilter.LINEAR),
            feng3d.oav()
        ], TextureInfo.prototype, "minFilter", void 0);
        __decorate([
            feng3d.serialize(feng3d.TextureMagFilter.LINEAR),
            feng3d.oav()
        ], TextureInfo.prototype, "magFilter", void 0);
        __decorate([
            feng3d.serialize(feng3d.TextureWrap.REPEAT),
            feng3d.oav()
        ], TextureInfo.prototype, "wrapS", void 0);
        __decorate([
            feng3d.serialize(feng3d.TextureWrap.REPEAT),
            feng3d.oav()
        ], TextureInfo.prototype, "wrapT", void 0);
        __decorate([
            feng3d.serialize(0),
            feng3d.oav()
        ], TextureInfo.prototype, "anisotropy", void 0);
        return TextureInfo;
    }(feng3d.EventDispatcher));
    feng3d.TextureInfo = TextureInfo;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    feng3d.renderdatacollector = {
        collectRenderDataHolder: collectRenderDataHolder,
        clearRenderDataHolder: clearRenderDataHolder,
        getsetRenderDataFuncs: getsetRenderDataFuncs,
        getclearRenderDataFuncs: getclearRenderDataFuncs,
        collectRenderDataHolderFuncs: collectRenderDataHolderFuncs,
        clearRenderDataHolderFuncs: clearRenderDataHolderFuncs,
    };
    function getsetRenderDataFuncs(renderDataHolder) {
        var updaterenderDataFuncs = [];
        var renderDatamap = renderDataHolder.renderDatamap;
        for (var key in renderDatamap) {
            if (renderDatamap.hasOwnProperty(key)) {
                updaterenderDataFuncs.push(renderDatamap[key].setfunc);
            }
        }
        return updaterenderDataFuncs;
    }
    function getclearRenderDataFuncs(renderDataHolder) {
        var updaterenderDataFuncs = [];
        var renderDatamap = renderDataHolder.renderDatamap;
        for (var key in renderDatamap) {
            if (renderDatamap.hasOwnProperty(key)) {
                updaterenderDataFuncs.push(renderDatamap[key].clearfunc);
            }
        }
        return updaterenderDataFuncs;
    }
    /**
     * 收集渲染数据拥有者
     * @param renderAtomic 渲染原子
     */
    function collectRenderDataHolderFuncs(renderDataHolder) {
        var funcs = [];
        funcs = funcs.concat(getsetRenderDataFuncs(renderDataHolder));
        renderDataHolder.childrenRenderDataHolder.forEach(function (element) {
            funcs = funcs.concat(collectRenderDataHolderFuncs(element));
        });
        return funcs;
    }
    /**
     * 收集渲染数据拥有者
     * @param renderAtomic 渲染原子
     */
    function clearRenderDataHolderFuncs(renderDataHolder) {
        var funcs = [];
        funcs = funcs.concat(getclearRenderDataFuncs(renderDataHolder));
        renderDataHolder.childrenRenderDataHolder.forEach(function (element) {
            funcs = funcs.concat(clearRenderDataHolderFuncs(element));
        });
        return funcs;
    }
    /**
     * 收集渲染数据拥有者
     * @param renderAtomic 渲染原子
     */
    function collectRenderDataHolder(renderDataHolder, renderAtomic) {
        var funcs = collectRenderDataHolderFuncs(renderDataHolder);
        funcs.forEach(function (element) {
            element(renderAtomic);
        });
    }
    /**
     * 收集渲染数据拥有者
     * @param renderAtomic 渲染原子
     */
    function clearRenderDataHolder(renderDataHolder, renderAtomic) {
        var funcs = clearRenderDataHolderFuncs(renderDataHolder);
        funcs.forEach(function (element) {
            element(renderAtomic);
        });
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 渲染数据拥有者
     * @author feng 2016-6-7
     */
    var RenderDataHolder = /** @class */ (function (_super) {
        __extends(RenderDataHolder, _super);
        /**
         * 创建GL数据缓冲
         */
        function RenderDataHolder() {
            var _this = _super.call(this) || this;
            _this._childrenRenderDataHolder = [];
            _this.renderDatamap = {};
            return _this;
        }
        Object.defineProperty(RenderDataHolder.prototype, "childrenRenderDataHolder", {
            get: function () {
                return this._childrenRenderDataHolder;
            },
            enumerable: true,
            configurable: true
        });
        RenderDataHolder.prototype.addRenderDataHolder = function (renderDataHolder) {
            if (!renderDataHolder)
                return;
            if (this._childrenRenderDataHolder.indexOf(renderDataHolder) != -1)
                return;
            this._childrenRenderDataHolder.push(renderDataHolder);
            renderDataHolder.on("renderdataChange", this.dispatchrenderdataChange, this);
            this.dispatch("renderdataChange", feng3d.renderdatacollector.collectRenderDataHolderFuncs(renderDataHolder));
        };
        RenderDataHolder.prototype.removeRenderDataHolder = function (renderDataHolder) {
            var index = this._childrenRenderDataHolder.indexOf(renderDataHolder);
            if (index == -1)
                return;
            this._childrenRenderDataHolder.splice(index, 1);
            renderDataHolder.off("renderdataChange", this.dispatchrenderdataChange, this);
            this.dispatch("renderdataChange", feng3d.renderdatacollector.clearRenderDataHolderFuncs(renderDataHolder));
        };
        RenderDataHolder.prototype.dispatchrenderdataChange = function (event) {
            this.dispatch(event.type, event.data);
        };
        /**
         *
         * @param name          数据名称
         * @param setfunc       设置数据回调
         * @param clearfunc     清理数据回调
         */
        RenderDataHolder.prototype.renderdataChange = function (name, setfunc, clearfunc) {
            this.renderDatamap[name] = { setfunc: setfunc, clearfunc: clearfunc };
            this.dispatch("renderdataChange", setfunc);
        };
        RenderDataHolder.prototype.createIndexBuffer = function (indices) {
            this.renderdataChange("indices", function (renderData) {
                renderData.indexBuffer = renderData.indexBuffer || new feng3d.Index();
                renderData.indexBuffer.indices = indices;
            }, function (renderData) {
                delete renderData.indexBuffer;
            });
        };
        RenderDataHolder.prototype.createUniformData = function (name, data) {
            this.renderdataChange(name, function (renderData) { renderData.uniforms[name] = data; }, function (renderData) { delete renderData.uniforms[name]; });
        };
        RenderDataHolder.prototype.createAttributeRenderData = function (name, data, size, divisor) {
            if (size === void 0) { size = 3; }
            if (divisor === void 0) { divisor = 0; }
            //
            this.renderdataChange(name, function (renderData) {
                var attributeRenderData = renderData.attributes[name] = renderData.attributes[name] || new feng3d.Attribute(name, data);
                attributeRenderData.data = data;
                attributeRenderData.size = size;
                attributeRenderData.divisor = divisor;
            }, function (renderData) {
                delete renderData.attributes[name];
            });
        };
        RenderDataHolder.prototype.createvertexCode = function (vertexCode) {
            this.renderdataChange("vertexCode", function (renderData) {
                if (renderData.shader.vertexCode == vertexCode)
                    return;
                renderData.shader.vertexCode = vertexCode;
                renderData.shader.invalidate();
            }, function (renderData) {
                renderData.shader.vertexCode = null;
                renderData.shader.invalidate();
            });
        };
        RenderDataHolder.prototype.createfragmentCode = function (fragmentCode) {
            this.renderdataChange("fragmentCode", function (renderData) {
                if (renderData.shader.fragmentCode == fragmentCode)
                    return;
                renderData.shader.fragmentCode = fragmentCode;
                renderData.shader.invalidate();
            }, function (renderData) {
                renderData.shader.fragmentCode = null;
                renderData.shader.invalidate();
            });
        };
        RenderDataHolder.prototype.createValueMacro = function (name, value) {
            this.renderdataChange(name, function (renderData) {
                if (renderData.shader.macro.valueMacros[name] == value)
                    return;
                renderData.shader.macro.valueMacros[name] = value;
                renderData.shader.invalidate();
            }, function (renderData) {
                delete renderData.shader.macro.valueMacros[name];
                renderData.shader.invalidate();
            });
        };
        RenderDataHolder.prototype.createBoolMacro = function (name, value) {
            this.renderdataChange(name, function (renderData) {
                if (renderData.shader.macro.boolMacros[name] == value)
                    return;
                renderData.shader.macro.boolMacros[name] = value;
                renderData.shader.invalidate();
            }, function (renderData) {
                delete renderData.shader.macro.boolMacros[name];
                renderData.shader.invalidate();
            });
        };
        RenderDataHolder.prototype.createAddMacro = function (name, value) {
            this.renderdataChange(name, function (renderData) {
                if (renderData.shader.macro.addMacros[name] == value)
                    return;
                renderData.shader.macro.addMacros[name] = value;
                renderData.shader.invalidate();
            }, function (renderData) {
                delete renderData.shader.macro.addMacros[name];
                renderData.shader.invalidate();
            });
        };
        RenderDataHolder.prototype.createInstanceCount = function (value) {
            this.renderdataChange(name, function (renderData) { renderData.instanceCount = value; }, function (renderData) { delete renderData.instanceCount; });
        };
        RenderDataHolder.prototype.createShaderParam = function (name, value) {
            this.renderdataChange(name, function (renderData) {
                renderData.renderParams[name] = value;
            }, function (renderData) {
                delete renderData.renderParams[name];
            });
        };
        return RenderDataHolder;
    }(feng3d.EventDispatcher));
    feng3d.RenderDataHolder = RenderDataHolder;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 渲染环境
     * @author feng 2017-01-04
     */
    var RenderContext = /** @class */ (function (_super) {
        __extends(RenderContext, _super);
        function RenderContext() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(RenderContext.prototype, "camera", {
            /**
             * 摄像机
             */
            get: function () {
                return this._camera;
            },
            set: function (value) {
                if (this._camera == value)
                    return;
                if (this._camera)
                    this.removeRenderDataHolder(this._camera);
                this._camera = value;
                if (this._camera)
                    this.addRenderDataHolder(this._camera);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 更新渲染数据
         */
        RenderContext.prototype.updateRenderData1 = function () {
            var pointLights = this.scene3d.collectComponents.pointLights.list;
            var directionalLights = this.scene3d.collectComponents.directionalLights.list;
            this.createValueMacro("NUM_LIGHT", pointLights.length + directionalLights.length);
            //收集点光源数据
            var pointLightPositions = [];
            var pointLightColors = [];
            var pointLightIntensitys = [];
            var pointLightRanges = [];
            for (var i = 0; i < pointLights.length; i++) {
                var pointLight = pointLights[i];
                pointLightPositions.push(pointLight.transform.scenePosition);
                pointLightColors.push(pointLight.color);
                pointLightIntensitys.push(pointLight.intensity);
                pointLightRanges.push(pointLight.range);
            }
            //设置点光源数据
            this.createValueMacro("NUM_POINTLIGHT", pointLights.length);
            if (pointLights.length > 0) {
                this.createAddMacro("A_NORMAL_NEED", 1);
                this.createAddMacro("V_NORMAL_NEED", 1);
                this.createAddMacro("V_GLOBAL_POSITION_NEED", 1);
                this.createAddMacro("U_CAMERAMATRIX_NEED", 1);
                //
                this.createUniformData("u_pointLightPositions", pointLightPositions);
                this.createUniformData("u_pointLightColors", pointLightColors);
                this.createUniformData("u_pointLightIntensitys", pointLightIntensitys);
                this.createUniformData("u_pointLightRanges", pointLightRanges);
            }
            var directionalLightDirections = [];
            var directionalLightColors = [];
            var directionalLightIntensitys = [];
            for (var i = 0; i < directionalLights.length; i++) {
                var directionalLight = directionalLights[i];
                directionalLightDirections.push(directionalLight.transform.localToWorldMatrix.forward);
                directionalLightColors.push(directionalLight.color);
                directionalLightIntensitys.push(directionalLight.intensity);
            }
            this.createValueMacro("NUM_DIRECTIONALLIGHT", directionalLights.length);
            if (directionalLights.length > 0) {
                this.createAddMacro("A_NORMAL_NEED", 1);
                this.createAddMacro("V_NORMAL_NEED", 1);
                this.createAddMacro("U_CAMERAMATRIX_NEED", 1);
                //
                this.createUniformData("u_directionalLightDirections", directionalLightDirections);
                this.createUniformData("u_directionalLightColors", directionalLightColors);
                this.createUniformData("u_directionalLightIntensitys", directionalLightIntensitys);
            }
            this.createUniformData("u_sceneAmbientColor", this.scene3d.ambientColor);
            this.createUniformData("u_scaleByDepth", this.camera.getScaleByDepth(1));
        };
        return RenderContext;
    }(feng3d.RenderDataHolder));
    feng3d.RenderContext = RenderContext;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 渲染代码库
     * @author feng 2016-12-16
     */
    var ShaderLib = /** @class */ (function () {
        function ShaderLib() {
        }
        ShaderLib.getShaderContentByName = function (shaderName) {
            var shaderPath = "shaders/" + shaderName + ".glsl";
            return feng3d.shaderFileMap[shaderPath];
        };
        /**
         * 获取shaderCode
         */
        ShaderLib.getShaderCode = function (shaderName) {
            if (!_shaderMap[shaderName])
                _shaderMap[shaderName] = ShaderLoader.loadText(shaderName);
            return _shaderMap[shaderName];
        };
        return ShaderLib;
    }());
    feng3d.ShaderLib = ShaderLib;
    /**
     * 渲染代码字典
     */
    var _shaderMap = {};
    /**
     * 渲染代码加载器字典
     */
    var _shaderLoaderMap = {};
    /**
     * 着色器加载器
     * @author feng 2016-12-15
     */
    var ShaderLoader = /** @class */ (function () {
        function ShaderLoader() {
        }
        /**
         * 加载shader
         * @param url   路径
         */
        ShaderLoader.loadText = function (shaderName) {
            var shaderCode = ShaderLib.getShaderContentByName(shaderName);
            //#include 正则表达式
            var includeRegExp = /#include<(.+)>/g;
            //
            var match = includeRegExp.exec(shaderCode);
            while (match != null) {
                var subShaderName = match[1];
                var subShaderCode = ShaderLib.getShaderCode(subShaderName);
                if (subShaderCode) {
                    shaderCode = shaderCode.replace(match[0], subShaderCode);
                }
                else {
                    var subShaderCode = ShaderLoader.loadText(subShaderName);
                    shaderCode = shaderCode.replace(match[0], subShaderCode);
                }
                match = includeRegExp.exec(shaderCode);
            }
            return shaderCode;
        };
        return ShaderLoader;
    }());
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Bit mask that controls object destruction, saving and visibility in inspectors.
     */
    var HideFlags;
    (function (HideFlags) {
        /**
         * A normal, visible object. This is the default.
         */
        HideFlags[HideFlags["None"] = 0] = "None";
        /**
         * The object will not appear in the hierarchy.
         */
        HideFlags[HideFlags["HideInHierarchy"] = 1] = "HideInHierarchy";
        /**
         * It is not possible to view it in the inspector.
         */
        HideFlags[HideFlags["HideInInspector"] = 2] = "HideInInspector";
        /**
         * The object will not be saved to the scene in the editor.
         */
        HideFlags[HideFlags["DontSaveInEditor"] = 4] = "DontSaveInEditor";
        /**
         * The object is not be editable in the inspector.
         */
        HideFlags[HideFlags["NotEditable"] = 8] = "NotEditable";
        /**
         * The object will not be saved when building a player.
         */
        HideFlags[HideFlags["DontSaveInBuild"] = 16] = "DontSaveInBuild";
        /**
         * The object will not be unloaded by Resources.UnloadUnusedAssets.
         */
        HideFlags[HideFlags["DontUnloadUnusedAsset"] = 32] = "DontUnloadUnusedAsset";
        /**
         * The object will not be saved to the scene. It will not be destroyed when a new scene is loaded. It is a shortcut for HideFlags.DontSaveInBuild | HideFlags.DontSaveInEditor | HideFlags.DontUnloadUnusedAsset.
         */
        HideFlags[HideFlags["DontSave"] = 52] = "DontSave";
        /**
         * A combination of not shown in the hierarchy, not saved to to scenes and not unloaded by The object will not be unloaded by Resources.UnloadUnusedAssets.
         */
        HideFlags[HideFlags["HideAndDontSave"] = 61] = "HideAndDontSave";
    })(HideFlags = feng3d.HideFlags || (feng3d.HideFlags = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Base class for all objects feng3d can reference.
     *
     * Any variable you make that derives from Feng3dObject gets shown in the inspector as a drop target, allowing you to set the value from the GUI.
     */
    var Feng3dObject = /** @class */ (function (_super) {
        __extends(Feng3dObject, _super);
        //------------------------------------------
        // Functions
        //------------------------------------------
        function Feng3dObject() {
            return _super.call(this) || this;
        }
        /**
         * Removes a gameobject, component or asset.
         * @param obj	The Feng3dObject to destroy.
         * @param t	    The optional amount of time to delay before destroying the Feng3dObject.
         */
        Feng3dObject.destroy = function (obj, t) {
            if (t === void 0) { t = 0; }
        };
        /**
         * Destroys the Feng3dObject obj immediately.
         * @param obj	                    Feng3dObject to be destroyed.
         * @param allowDestroyingAssets	    Set to true to allow assets to be destoyed.
         */
        Feng3dObject.destroyImmediate = function (obj, allowDestroyingAssets) {
            if (allowDestroyingAssets === void 0) { allowDestroyingAssets = false; }
        };
        /**
         * Makes the Feng3dObject target not be destroyed automatically when loading a new scene.
         */
        Feng3dObject.dontDestroyOnLoad = function (target) {
        };
        /**
         * Returns the first active loaded Feng3dObject of Type type.
         */
        Feng3dObject.findObjectOfType = function (type) {
            return null;
        };
        /**
         * Returns a list of all active loaded objects of Type type.
         */
        Feng3dObject.findObjectsOfType = function (type) {
            return null;
        };
        /**
         * Returns a copy of the Feng3dObject original.
         * @param original	An existing Feng3dObject that you want to make a copy of.
         * @param position	Position for the new Feng3dObject(default Vector3.zero).
         * @param rotation	Orientation of the new Feng3dObject(default Quaternion.identity).
         * @param parent	The transform the Feng3dObject will be parented to.
         * @param worldPositionStays	If when assigning the parent the original world position should be maintained.
         */
        Feng3dObject.instantiate = function (original, position, rotation, parent, worldPositionStays) {
            if (worldPositionStays === void 0) { worldPositionStays = false; }
            return null;
        };
        return Feng3dObject;
    }(feng3d.RenderDataHolder));
    feng3d.Feng3dObject = Feng3dObject;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Base class for everything attached to GameObjects.
     *
     * Note that your code will never directly create a Component. Instead, you write script code, and attach the script to a GameObject. See Also: ScriptableObject as a way to create scripts that do not attach to any GameObject.
     */
    var Component = /** @class */ (function (_super) {
        __extends(Component, _super);
        //------------------------------------------
        // Functions
        //------------------------------------------
        /**
         * 创建一个组件容器
         */
        function Component() {
            var _this = _super.call(this) || this;
            /**
             * 是否序列化
             */
            _this.serializable = true;
            /**
             * 是否显示在检查器中
             */
            _this.showInInspector = true;
            return _this;
        }
        Object.defineProperty(Component.prototype, "gameObject", {
            //------------------------------------------
            // Variables
            //------------------------------------------
            /**
             * The game object this component is attached to. A component is always attached to a game object.
             */
            get: function () {
                return this._gameObject;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "tag", {
            /**
             * The tag of this game object.
             */
            get: function () {
                return this._tag;
            },
            set: function (value) {
                this._tag = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "transform", {
            /**
             * The Transform attached to this GameObject (null if there is none attached).
             */
            get: function () {
                return this._gameObject.transform;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "single", {
            /**
             * 是否唯一，同类型3D对象组件只允许一个
             */
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Component.prototype.set = function (setfun) {
            setfun(this);
            return this;
        };
        Component.prototype.init = function (gameObject) {
            this._gameObject = gameObject;
        };
        /**
         * Returns the component of Type type if the game object has one attached, null if it doesn't.
         * @param type				The type of Component to retrieve.
         * @return                  返回指定类型组件
         */
        Component.prototype.getComponent = function (type) {
            return this.gameObject.getComponent(type);
        };
        /**
         * Returns all components of Type type in the GameObject.
         * @param type		类定义
         * @return			返回与给出类定义一致的组件
         */
        Component.prototype.getComponents = function (type) {
            return this.gameObject.getComponents(type);
        };
        /**
         * Returns all components of Type type in the GameObject.
         * @param type		类定义
         * @return			返回与给出类定义一致的组件
         */
        Component.prototype.getComponentsInChildren = function (type, filter, result) {
            return this.gameObject.getComponentsInChildren(type, filter, result);
        };
        /**
         * 销毁
         */
        Component.prototype.dispose = function () {
            this._gameObject = null;
        };
        __decorate([
            feng3d.serialize()
        ], Component.prototype, "tag", null);
        return Component;
    }(feng3d.Feng3dObject));
    feng3d.Component = Component;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 渲染器
     * 所有渲染都由该渲染器执行
     */
    var Renderer = /** @class */ (function () {
        function Renderer(gl) {
            feng3d.assert(!gl.renderer, gl + " " + gl.renderer + " \u5B58\u5728\uFF01");
            gl.renderer = this;
            this.draw = function (renderAtomic) {
                var shaderProgram = renderAtomic.shader.activeShaderProgram(gl);
                if (!shaderProgram)
                    return;
                //
                activeShaderParams(renderAtomic.renderParams);
                activeAttributes(renderAtomic, shaderProgram.attributes);
                activeUniforms(renderAtomic, shaderProgram.uniforms);
                dodraw(renderAtomic);
                disableAttributes(shaderProgram.attributes);
            };
            function activeShaderParams(shaderParams) {
                var cullfaceEnum = feng3d.lazy.getvalue(shaderParams.cullFace);
                var blendEquation = gl.enums.getBlendEquationValue(feng3d.lazy.getvalue(shaderParams.blendEquation));
                var sfactor = gl.enums.getBlendFactorValue(feng3d.lazy.getvalue(shaderParams.sfactor));
                var dfactor = gl.enums.getBlendFactorValue(feng3d.lazy.getvalue(shaderParams.dfactor));
                var cullFace = gl.enums.getCullFaceValue(feng3d.lazy.getvalue(shaderParams.cullFace));
                var frontFace = gl.enums.getFrontFaceValue(feng3d.lazy.getvalue(shaderParams.frontFace));
                var enableBlend = feng3d.lazy.getvalue(shaderParams.enableBlend);
                var depthtest = feng3d.lazy.getvalue(shaderParams.depthtest);
                var depthMask = feng3d.lazy.getvalue(shaderParams.depthMask);
                var depthFunc = gl.enums.getdDepthFuncValue(feng3d.lazy.getvalue(shaderParams.depthFunc));
                var viewRect = feng3d.lazy.getvalue(shaderParams.viewRect);
                var useViewRect = feng3d.lazy.getvalue(shaderParams.useViewRect);
                if (!useViewRect) {
                    var clientRect = gl.canvas.getBoundingClientRect();
                    viewRect = new feng3d.Rectangle(0, 0, clientRect.width, clientRect.height);
                }
                if (cullfaceEnum != feng3d.CullFace.NONE) {
                    gl.enable(gl.CULL_FACE);
                    gl.cullFace(cullFace);
                    gl.frontFace(frontFace);
                }
                else {
                    gl.disable(gl.CULL_FACE);
                }
                if (enableBlend) {
                    //
                    gl.enable(gl.BLEND);
                    gl.blendEquation(blendEquation);
                    gl.blendFunc(sfactor, dfactor);
                }
                else {
                    gl.disable(gl.BLEND);
                }
                if (depthtest) {
                    gl.enable(gl.DEPTH_TEST);
                    gl.depthFunc(depthFunc);
                }
                else
                    gl.disable(gl.DEPTH_TEST);
                gl.depthMask(depthMask);
                gl.viewport(viewRect.x, viewRect.y, viewRect.width, viewRect.height);
            }
            /**
             * 激活属性
             */
            function activeAttributes(renderAtomic, attributeInfos) {
                for (var name in attributeInfos) {
                    if (attributeInfos.hasOwnProperty(name)) {
                        var activeInfo = attributeInfos[name];
                        var buffer = renderAtomic.attributes[name];
                        buffer.active(gl, activeInfo.location);
                    }
                }
            }
            /**
             * 激活属性
             */
            function disableAttributes(attributeInfos) {
                for (var name in attributeInfos) {
                    if (attributeInfos.hasOwnProperty(name)) {
                        var activeInfo = attributeInfos[name];
                        gl.disableVertexAttribArray(activeInfo.location);
                    }
                }
            }
            /**
             * 激活常量
             */
            function activeUniforms(renderAtomic, uniformInfos) {
                for (var name in uniformInfos) {
                    if (uniformInfos.hasOwnProperty(name)) {
                        var activeInfo = uniformInfos[name];
                        if (activeInfo.uniformBaseName) {
                            var baseName = activeInfo.uniformBaseName;
                            var uniformData = feng3d.lazy.getvalue(renderAtomic.uniforms[baseName]);
                            //处理数组
                            for (var j = 0; j < activeInfo.size; j++) {
                                setContext3DUniform({ name: baseName + ("[" + j + "]"), type: activeInfo.type, uniformLocation: activeInfo.uniformLocation[j], textureID: activeInfo.textureID }, uniformData[j]);
                            }
                        }
                        else {
                            var uniformData = feng3d.lazy.getvalue(renderAtomic.uniforms[activeInfo.name]);
                            setContext3DUniform(activeInfo, uniformData);
                        }
                    }
                }
            }
            /**
             * 设置环境Uniform数据
             */
            function setContext3DUniform(activeInfo, data) {
                var location = activeInfo.uniformLocation;
                switch (activeInfo.type) {
                    case gl.INT:
                        gl.uniform1i(location, data);
                        break;
                    case gl.FLOAT_MAT4:
                        gl.uniformMatrix4fv(location, false, data.rawData);
                        break;
                    case gl.FLOAT:
                        gl.uniform1f(location, data);
                        break;
                    case gl.FLOAT_VEC2:
                        gl.uniform2f(location, data.x, data.y);
                        break;
                    case gl.FLOAT_VEC3:
                        if (data instanceof feng3d.Color) {
                            gl.uniform3f(location, data.r, data.g, data.b);
                        }
                        else if (data instanceof feng3d.Vector3D) {
                            gl.uniform3f(location, data.x, data.y, data.z);
                        }
                        else {
                            throw "\u65E0\u6CD5\u5904\u7406 uniform\u6570\u636E " + activeInfo.name + " " + data;
                        }
                        break;
                    case gl.FLOAT_VEC4:
                        if (data instanceof feng3d.Color) {
                            gl.uniform4f(location, data.r, data.g, data.b, data.a);
                        }
                        else if (data instanceof feng3d.Vector3D) {
                            gl.uniform4f(location, data.x, data.y, data.z, data.w);
                        }
                        else {
                            throw "\u65E0\u6CD5\u5904\u7406 uniform\u6570\u636E " + activeInfo.name + " " + data;
                        }
                        break;
                    case gl.SAMPLER_2D:
                    case gl.SAMPLER_CUBE:
                        var textureInfo = data;
                        //激活纹理编号
                        gl.activeTexture(gl["TEXTURE" + activeInfo.textureID]);
                        textureInfo.active(gl);
                        //设置纹理所在采样编号
                        gl.uniform1i(location, activeInfo.textureID);
                        break;
                    default:
                        throw "\u65E0\u6CD5\u8BC6\u522B\u7684uniform\u7C7B\u578B " + activeInfo.name + " " + data;
                }
            }
            /**
             */
            function dodraw(renderAtomic) {
                var instanceCount = ~~feng3d.lazy.getvalue(renderAtomic.instanceCount);
                var renderParams = renderAtomic.renderParams;
                var renderMode = gl.enums.getRenderModeValue(feng3d.lazy.getvalue(renderParams.renderMode));
                var indexBuffer = renderAtomic.indexBuffer;
                var vertexNum = 0;
                if (indexBuffer) {
                    indexBuffer.active(gl);
                    var arrayType = gl.enums.getGLArrayTypeValue(indexBuffer.type);
                    if (indexBuffer.count == 0) {
                        feng3d.warn("\u9876\u70B9\u7D22\u5F15\u4E3A0\uFF0C\u4E0D\u8FDB\u884C\u6E32\u67D3\uFF01");
                        return;
                    }
                    if (instanceCount > 1) {
                        gl.advanced.drawElementsInstanced(renderMode, indexBuffer.count, arrayType, indexBuffer.offset, instanceCount);
                    }
                    else {
                        gl.drawElements(renderMode, indexBuffer.count, arrayType, indexBuffer.offset);
                    }
                }
                else {
                    var vertexNum = (function (attributes) {
                        for (var attr in attributes) {
                            if (attributes.hasOwnProperty(attr)) {
                                var attribute = attributes[attr];
                                return attribute.data.length / attribute.size;
                            }
                        }
                        return 0;
                    })(renderAtomic.attributes);
                    if (vertexNum == 0) {
                        feng3d.warn("\u9876\u70B9\u6570\u91CF\u4E3A0\uFF0C\u4E0D\u8FDB\u884C\u6E32\u67D3\uFF01");
                        return;
                    }
                    if (instanceCount > 1) {
                        gl.advanced.drawArraysInstanced(renderMode, 0, vertexNum, instanceCount);
                    }
                    else {
                        gl.drawArrays(renderMode, 0, vertexNum);
                    }
                }
            }
        }
        return Renderer;
    }());
    feng3d.Renderer = Renderer;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 前向渲染器
     * @author feng 2017-02-20
     */
    feng3d.forwardRenderer = {
        draw: draw,
    };
    /**
     * 渲染
     */
    function draw(renderContext, renderObjectflag) {
        renderContext.updateRenderData1();
        var frustumPlanes = renderContext.camera.frustumPlanes;
        var meshRenderers = collectForwardRender(renderContext.scene3d.gameObject, frustumPlanes, renderObjectflag);
        var camerapos = renderContext.camera.transform.scenePosition;
        var maps = meshRenderers.map(function (item) {
            return {
                depth: item.transform.scenePosition.subtract(camerapos).length,
                item: item,
                enableBlend: item.material.enableBlend,
            };
        });
        var blenditems = maps.filter(function (item) { return item.enableBlend; });
        var unblenditems = maps.filter(function (item) { return !item.enableBlend; });
        blenditems = blenditems.sort(function (a, b) {
            return b.depth - a.depth;
        });
        unblenditems = unblenditems.sort(function (a, b) {
            return a.depth - b.depth;
        });
        var gl = renderContext.gl;
        for (var i = 0; i < unblenditems.length; i++) {
            drawRenderables(unblenditems[i].item, renderContext);
        }
        for (var i = 0; i < blenditems.length; i++) {
            drawRenderables(blenditems[i].item, renderContext);
        }
        return { blenditems: blenditems, unblenditems: unblenditems };
    }
    function drawRenderables(meshRenderer, renderContext) {
        //更新数据
        var gl = renderContext.gl;
        // try
        // {
        //绘制
        var renderAtomic = meshRenderer.getComponent(feng3d.RenderAtomicComponent);
        feng3d.renderdatacollector.collectRenderDataHolder(renderContext, renderAtomic.renderAtomic);
        renderAtomic.update();
        gl.renderer.draw(renderAtomic.renderAtomic);
        // renderdatacollector.clearRenderDataHolder(renderContext, renderAtomic);
        // } catch (error)
        // {
        //     log(error);
        // }
    }
    function collectForwardRender(gameObject, frustumPlanes, renderObjectflag) {
        if (!gameObject.visible)
            return [];
        if (!(renderObjectflag & gameObject.flag))
            return [];
        var meshRenderers = [];
        var meshRenderer = gameObject.getComponent(feng3d.MeshRenderer);
        if (meshRenderer) {
            var boundingComponent = gameObject.getComponent(feng3d.BoundingComponent);
            if (boundingComponent.worldBounds) {
                if (feng3d.bounding.isInFrustum(boundingComponent.worldBounds, frustumPlanes, 6))
                    meshRenderers.push(meshRenderer);
            }
        }
        gameObject.children.forEach(function (element) {
            meshRenderers = meshRenderers.concat(collectForwardRender(element, frustumPlanes, renderObjectflag));
        });
        return meshRenderers;
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 深度渲染器
     * @author  feng    2017-03-25
     */
    var DepthRenderer = /** @class */ (function () {
        function DepthRenderer() {
        }
        return DepthRenderer;
    }());
    feng3d.DepthRenderer = DepthRenderer;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 鼠标拾取渲染器
     * @author feng 2017-02-06
     */
    var MouseRenderer = /** @class */ (function (_super) {
        __extends(MouseRenderer, _super);
        function MouseRenderer() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.objects = [];
            return _this;
        }
        /**
         * 渲染
         */
        MouseRenderer.prototype.draw = function (renderContext, viewRect) {
            var gl = renderContext.gl;
            var mouseX = feng3d.windowEventProxy.clientX;
            var mouseY = feng3d.windowEventProxy.clientY;
            var offsetX = -(mouseX - viewRect.x);
            var offsetY = -(viewRect.height - (mouseY - viewRect.y)); //y轴与window中坐标反向，所以需要 h = (maxHeight - h)
            gl.clearColor(0, 0, 0, 0);
            gl.clearDepth(1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.viewport(offsetX, offsetY, viewRect.width, viewRect.height);
            this.objects.length = 1;
            var gl = renderContext.gl;
            //启动裁剪，只绘制一个像素
            gl.enable(gl.SCISSOR_TEST);
            gl.scissor(0, 0, 1, 1);
            // super.draw(renderContext);
            gl.disable(gl.SCISSOR_TEST);
            //读取鼠标拾取索引
            // this.frameBufferObject.readBuffer(gl, "objectID");
            var data = new Uint8Array(4);
            gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
            var id = data[0] + data[1] * 255 + data[2] * 255 * 255 + data[3] * 255 * 255 * 255 - data[3]; //最后（- data[3]）表示很奇怪，不过data[3]一般情况下为0
            // log(`选中索引3D对象${id}`, data.toString());
            return this.objects[id];
        };
        MouseRenderer.prototype.drawRenderables = function (renderContext, meshRenderer) {
            if (meshRenderer.gameObject.mouseEnabled) {
                var object = meshRenderer.gameObject;
                var u_objectID = this.objects.length;
                this.objects[u_objectID] = object;
                var renderAtomic = object.getComponent(feng3d.RenderAtomicComponent);
                renderAtomic.renderAtomic.uniforms.u_objectID = u_objectID;
                // super.drawRenderables(renderContext, meshRenderer);
            }
        };
        /**
         * 绘制3D对象
         */
        MouseRenderer.prototype.drawGameObject = function (gl, renderAtomic) {
            var vertexCode = feng3d.ShaderLib.getShaderCode("mouse.vertex");
            var fragmentCode = feng3d.ShaderLib.getShaderCode("mouse.fragment");
            var shader = new feng3d.Shader();
            shader.vertexCode = vertexCode;
            shader.fragmentCode = fragmentCode;
            // super.drawGameObject(gl, renderAtomic, shader);
        };
        return MouseRenderer;
    }(feng3d.RenderDataHolder));
    feng3d.MouseRenderer = MouseRenderer;
    feng3d.glMousePicker = new MouseRenderer();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 后处理渲染器
     * @author feng 2017-02-20
     */
    var PostProcessRenderer = /** @class */ (function () {
        function PostProcessRenderer() {
        }
        return PostProcessRenderer;
    }());
    feng3d.PostProcessRenderer = PostProcessRenderer;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 阴影图渲染器
     * @author  feng    2017-03-25
     */
    feng3d.shadowRenderer = {
        draw: draw
    };
    // private frameBufferObject: FrameBufferObject;
    /**
     * 渲染
     */
    function draw(renderContext) {
        var gl = renderContext.gl;
        var lights = renderContext.scene3d.collectComponents.pointLights.list;
        for (var i = 0; i < lights.length; i++) {
            var light = lights[i];
            // var frameBufferObject = new FrameBufferObject();
            // frameBufferObject.init(gl);
            // frameBufferObject.active(gl);
            // MeshRenderer.meshRenderers.forEach(element =>
            // {
            // this.drawRenderables(renderContext, element);
            // });
            // frameBufferObject.deactive(gl);
        }
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 轮廓渲染器
     */
    feng3d.outlineRenderer = {
        draw: draw,
    };
    var shader;
    var renderParams;
    function init() {
        if (!shader) {
            var vertexCode = feng3d.ShaderLib.getShaderCode("outline.vertex");
            var fragmentCode = feng3d.ShaderLib.getShaderCode("outline.fragment");
            shader = new feng3d.Shader();
            shader.vertexCode = vertexCode;
            shader.fragmentCode = fragmentCode;
        }
        if (!renderParams) {
            renderParams = new feng3d.RenderParams();
            renderParams.renderMode = feng3d.RenderMode.TRIANGLES;
            renderParams.enableBlend = false;
            renderParams.depthMask = true;
            renderParams.depthtest = true;
            renderParams.cullFace = feng3d.CullFace.FRONT;
            renderParams.frontFace = feng3d.FrontFace.CW;
        }
    }
    function draw(renderContext, unblenditems) {
        var gl = renderContext.gl;
        for (var i = 0; i < unblenditems.length; i++) {
            var item = unblenditems[i].item;
            if (item.getComponent(OutLineComponent) || item.getComponent(feng3d.CartoonComponent)) {
                var renderAtomic = item.getComponent(feng3d.RenderAtomicComponent);
                drawGameObject(gl, renderAtomic.renderAtomic); //
            }
        }
    }
    /**
     * 绘制3D对象
     */
    function drawGameObject(gl, renderAtomic) {
        init();
        var oldshader = renderAtomic.shader;
        shader.macro = renderAtomic.shader.macro;
        renderAtomic.shader = shader;
        var oldRenderParams = renderAtomic.renderParams;
        renderAtomic.renderParams = renderParams;
        gl.renderer.draw(renderAtomic);
        //
        renderAtomic.shader = oldshader;
        renderAtomic.renderParams = oldRenderParams;
    }
    var OutLineComponent = /** @class */ (function (_super) {
        __extends(OutLineComponent, _super);
        function OutLineComponent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.size = 1;
            _this.color = new feng3d.Color(0.2, 0.2, 0.2, 1.0);
            _this.outlineMorphFactor = 0.0;
            return _this;
        }
        OutLineComponent.prototype.init = function (gameobject) {
            var _this = this;
            _super.prototype.init.call(this, gameobject);
            //
            this.createUniformData("u_outlineSize", function () { return _this.size; });
            this.createUniformData("u_outlineColor", function () { return _this.color; });
            this.createUniformData("u_outlineMorphFactor", function () { return _this.outlineMorphFactor; });
        };
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], OutLineComponent.prototype, "size", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], OutLineComponent.prototype, "color", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], OutLineComponent.prototype, "outlineMorphFactor", void 0);
        return OutLineComponent;
    }(feng3d.Component));
    feng3d.OutLineComponent = OutLineComponent;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 线框渲染器
     */
    feng3d.wireframeRenderer = {
        draw: draw,
    };
    var shader;
    var renderParams;
    function init() {
        if (!shader) {
            var vertexCode = feng3d.ShaderLib.getShaderCode("wireframe.vertex");
            var fragmentCode = feng3d.ShaderLib.getShaderCode("wireframe.fragment");
            shader = new feng3d.Shader();
            shader.vertexCode = vertexCode;
            shader.fragmentCode = fragmentCode;
        }
        if (!renderParams) {
            renderParams = new feng3d.RenderParams();
            renderParams.renderMode = feng3d.RenderMode.LINES;
            renderParams.enableBlend = false;
            renderParams.depthMask = false;
            renderParams.depthtest = true;
            renderParams.depthFunc = feng3d.DepthFunc.LEQUAL;
        }
    }
    /**
     * 渲染
     */
    function draw(renderContext, unblenditems) {
        if (unblenditems.length == 0)
            return;
        var gl = renderContext.gl;
        for (var i = 0; i < unblenditems.length; i++) {
            var item = unblenditems[i].item;
            if (item.getComponent(WireframeComponent)) {
                var renderAtomic = item.getComponent(feng3d.RenderAtomicComponent);
                drawGameObject(gl, renderAtomic.renderAtomic); //
            }
        }
    }
    /**
     * 绘制3D对象
     */
    function drawGameObject(gl, renderAtomic) {
        if (feng3d.lazy.getvalue(renderAtomic.renderParams.renderMode) == feng3d.RenderMode.POINTS)
            return;
        init();
        var oldshader = renderAtomic.shader;
        shader.macro = renderAtomic.shader.macro;
        renderAtomic.shader = shader;
        var oldrenderParams = renderAtomic.renderParams;
        renderAtomic.renderParams = renderParams;
        //
        var oldIndexBuffer = renderAtomic.indexBuffer;
        if (!renderAtomic.wireframeindexBuffer || renderAtomic.wireframeindexBuffer.count != 2 * oldIndexBuffer.count) {
            var wireframeindices = [];
            var indices = feng3d.lazy.getvalue(oldIndexBuffer.indices);
            for (var i = 0; i < indices.length; i += 3) {
                wireframeindices.push(indices[i], indices[i + 1], indices[i], indices[i + 2], indices[i + 1], indices[i + 2]);
            }
            renderAtomic.wireframeindexBuffer = new feng3d.Index();
            renderAtomic.wireframeindexBuffer.indices = wireframeindices;
        }
        renderAtomic.indexBuffer = renderAtomic.wireframeindexBuffer;
        gl.renderer.draw(renderAtomic);
        renderAtomic.indexBuffer = oldIndexBuffer;
        //
        renderAtomic.shader = oldshader;
        renderAtomic.renderParams = oldrenderParams;
    }
    /**
     * 线框组件，将会对拥有该组件的对象绘制线框
     */
    var WireframeComponent = /** @class */ (function (_super) {
        __extends(WireframeComponent, _super);
        function WireframeComponent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.serializable = false;
            _this.showInInspector = false;
            _this.color = new feng3d.Color(125 / 255, 176 / 255, 250 / 255);
            return _this;
        }
        WireframeComponent.prototype.init = function (gameobject) {
            var _this = this;
            _super.prototype.init.call(this, gameobject);
            this.createUniformData("u_wireframeColor", function () { return _this.color; });
        };
        __decorate([
            feng3d.oav()
        ], WireframeComponent.prototype, "color", void 0);
        return WireframeComponent;
    }(feng3d.Component));
    feng3d.WireframeComponent = WireframeComponent;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 卡通渲染
     */
    feng3d.cartoonRenderer = {};
    /**
     * 参考
     */
    var CartoonComponent = /** @class */ (function (_super) {
        __extends(CartoonComponent, _super);
        function CartoonComponent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.outlineSize = 1;
            _this.outlineColor = new feng3d.Color(0.2, 0.2, 0.2, 1.0);
            _this.outlineMorphFactor = 0.0;
            /**
             * 半兰伯特值diff，分段值 4个(0.0,1.0)
             */
            _this.diffuseSegment = new feng3d.Vector3D(0.1, 0.3, 0.6, 1.0);
            /**
             * 半兰伯特值diff，替换分段值 4个(0.0,1.0)
             */
            _this.diffuseSegmentValue = new feng3d.Vector3D(0.1, 0.3, 0.6, 1.0);
            _this.specularSegment = 0.5;
            _this._cartoon_Anti_aliasing = false;
            return _this;
        }
        Object.defineProperty(CartoonComponent.prototype, "cartoon_Anti_aliasing", {
            get: function () {
                return this._cartoon_Anti_aliasing;
            },
            set: function (value) {
                this._cartoon_Anti_aliasing = value;
                this.createBoolMacro("cartoon_Anti_aliasing", value);
            },
            enumerable: true,
            configurable: true
        });
        CartoonComponent.prototype.init = function (gameObject) {
            var _this = this;
            _super.prototype.init.call(this, gameObject);
            this.createBoolMacro("IS_CARTOON", true);
            this.createUniformData("u_diffuseSegment", function () { return _this.diffuseSegment; });
            this.createUniformData("u_diffuseSegmentValue", function () { return _this.diffuseSegmentValue; });
            this.createUniformData("u_specularSegment", function () { return _this.specularSegment; });
            //
            this.createUniformData("u_outlineSize", function () { return _this.outlineSize; });
            this.createUniformData("u_outlineColor", function () { return _this.outlineColor; });
            this.createUniformData("u_outlineMorphFactor", function () { return _this.outlineMorphFactor; });
        };
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], CartoonComponent.prototype, "outlineSize", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], CartoonComponent.prototype, "outlineColor", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], CartoonComponent.prototype, "outlineMorphFactor", void 0);
        __decorate([
            feng3d.oav({ componentParam: { showw: true } }),
            feng3d.serialize()
        ], CartoonComponent.prototype, "diffuseSegment", void 0);
        __decorate([
            feng3d.oav({ componentParam: { showw: true } }),
            feng3d.serialize()
        ], CartoonComponent.prototype, "diffuseSegmentValue", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], CartoonComponent.prototype, "specularSegment", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], CartoonComponent.prototype, "cartoon_Anti_aliasing", null);
        return CartoonComponent;
    }(feng3d.Component));
    feng3d.CartoonComponent = CartoonComponent;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    feng3d.skyboxRenderer = {
        draw: draw
    };
    var renderAtomic;
    function init() {
        if (!renderAtomic) {
            renderAtomic = new feng3d.RenderAtomic();
            //八个顶点，32个number
            var vertexPositionData = [
                -1, 1, -1,
                1, 1, -1,
                1, 1, 1,
                -1, 1, 1,
                -1, -1, -1,
                1, -1, -1,
                1, -1, 1,
                -1, -1, 1 //
            ];
            renderAtomic.attributes.a_position = new feng3d.Attribute("a_position", vertexPositionData, 3);
            //6个面，12个三角形，36个顶点索引
            var indices = [
                0, 1, 2, 2, 3, 0,
                6, 5, 4, 4, 7, 6,
                2, 6, 7, 7, 3, 2,
                4, 5, 1, 1, 0, 4,
                4, 0, 3, 3, 7, 4,
                2, 1, 5, 5, 6, 2 //
            ];
            renderAtomic.indexBuffer = new feng3d.Index();
            renderAtomic.indexBuffer.indices = indices;
            //
            renderAtomic.shader.vertexCode = feng3d.ShaderLib.getShaderCode("skybox.vertex");
            renderAtomic.shader.fragmentCode = feng3d.ShaderLib.getShaderCode("skybox.fragment");
            //
            renderAtomic.renderParams.renderMode = feng3d.RenderMode.TRIANGLES;
            renderAtomic.renderParams.enableBlend = false;
            renderAtomic.renderParams.depthMask = true;
            renderAtomic.renderParams.depthtest = true;
            renderAtomic.renderParams.cullFace = feng3d.CullFace.NONE;
        }
    }
    /**
     * 渲染
     */
    function draw(gl, scene3d, camera, renderObjectflag) {
        init();
        var skyboxs = scene3d.collectComponents.skyboxs.list.filter(function (skybox) {
            return skybox.gameObject.visible && (renderObjectflag & skybox.gameObject.flag);
        });
        if (skyboxs.length == 0)
            return;
        var skybox = skyboxs[0];
        //
        renderAtomic.uniforms.u_viewProjection = camera.viewProjection;
        renderAtomic.uniforms.u_viewMatrix = camera.transform.worldToLocalMatrix;
        renderAtomic.uniforms.u_cameraMatrix = camera.transform.localToWorldMatrix;
        renderAtomic.uniforms.u_skyBoxSize = camera.lens.far / Math.sqrt(3);
        //
        var skyboxRenderAtomic = skybox.getComponent(feng3d.RenderAtomicComponent);
        skyboxRenderAtomic.update();
        renderAtomic.uniforms.s_skyboxTexture = skyboxRenderAtomic.renderAtomic.uniforms.s_skyboxTexture;
        gl.renderer.draw(renderAtomic);
    }
    var SkyBox = /** @class */ (function (_super) {
        __extends(SkyBox, _super);
        function SkyBox() {
            var _this = _super.call(this) || this;
            //
            _this.createUniformData("s_skyboxTexture", function () { return _this.texture; });
            return _this;
        }
        Object.defineProperty(SkyBox.prototype, "texture", {
            get: function () {
                return this._texture;
            },
            set: function (value) {
                if (this._texture == value)
                    return;
                this._texture = value;
            },
            enumerable: true,
            configurable: true
        });
        SkyBox.prototype.init = function (gameObject) {
            _super.prototype.init.call(this, gameObject);
        };
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], SkyBox.prototype, "texture", null);
        return SkyBox;
    }(feng3d.Component));
    feng3d.SkyBox = SkyBox;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 后处理效果
     * @author feng 2017-02-20
     */
    var PostEffect = /** @class */ (function () {
        function PostEffect() {
        }
        return PostEffect;
    }());
    feng3d.PostEffect = PostEffect;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 快速近似抗锯齿（Fast Approximate Anti-Aliasing）后处理效果
     * @author feng 2017-02-20
     *
     * @see
     * https://github.com/BabylonJS/Babylon.js/blob/master/src/Shaders/fxaa.fragment.fx
     * https://github.com/playcanvas/engine/blob/master/extras/posteffects/posteffect-fxaa.js
     */
    var FXAAEffect = /** @class */ (function () {
        function FXAAEffect() {
        }
        return FXAAEffect;
    }());
    feng3d.FXAAEffect = FXAAEffect;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var fixedNum = 6;
    /**
     * Position, rotation and scale of an object.
     *
     * Every object in a scene has a Transform. It's used to store and manipulate the position, rotation and scale of the object. Every Transform can have a parent, which allows you to apply position, rotation and scale hierarchically. This is the hierarchy seen in the Hierarchy pane.
     */
    var Transform = /** @class */ (function (_super) {
        __extends(Transform, _super);
        /**
         * 创建一个实体，该类为虚类
         */
        function Transform() {
            var _this = _super.call(this) || this;
            //------------------------------------------
            // Private Properties
            //------------------------------------------
            _this._position = new feng3d.Vector3D();
            _this._rotation = new feng3d.Vector3D();
            _this._orientation = new feng3d.Quaternion();
            _this._scale = new feng3d.Vector3D(1, 1, 1);
            _this._smallestNumber = 0.0000000000000000000001;
            _this._x = 0;
            _this._y = 0;
            _this._z = 0;
            _this._rx = 0;
            _this._ry = 0;
            _this._rz = 0;
            _this._sx = 1;
            _this._sy = 1;
            _this._sz = 1;
            return _this;
        }
        Transform.prototype.init = function (gameObject) {
            _super.prototype.init.call(this, gameObject);
        };
        Object.defineProperty(Transform.prototype, "scenePosition", {
            get: function () {
                return this.localToWorldMatrix.position;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "parent", {
            get: function () {
                return this.gameObject.parent && this.gameObject.parent.transform;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "localToWorldMatrix", {
            /**
             * Matrix that transforms a point from local space into world space.
             */
            get: function () {
                if (!this._localToWorldMatrix)
                    this._localToWorldMatrix = this.updateLocalToWorldMatrix();
                return this._localToWorldMatrix;
            },
            set: function (value) {
                value = value.clone();
                this.parent && value.append(this.parent.worldToLocalMatrix);
                this.matrix3d = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "ITlocalToWorldMatrix", {
            /**
             * 本地转世界逆转置矩阵
             */
            get: function () {
                if (!this._ITlocalToWorldMatrix) {
                    this._ITlocalToWorldMatrix = this.localToWorldMatrix.clone();
                    this._ITlocalToWorldMatrix.invert().transpose();
                }
                return this._ITlocalToWorldMatrix;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "worldToLocalMatrix", {
            /**
             * Matrix that transforms a point from world space into local space (Read Only).
             */
            get: function () {
                if (!this._worldToLocalMatrix)
                    this._worldToLocalMatrix = this.localToWorldMatrix.clone().invert();
                return this._worldToLocalMatrix;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "localToWorldRotationMatrix", {
            get: function () {
                if (!this._localToWorldRotationMatrix) {
                    this._localToWorldRotationMatrix = this.rotationMatrix.clone();
                    if (this.parent)
                        this._localToWorldRotationMatrix.append(this.parent.localToWorldRotationMatrix);
                }
                return this._localToWorldRotationMatrix;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Transforms direction from local space to world space.
         */
        Transform.prototype.transformDirection = function (direction) {
            if (!this.parent)
                return direction.clone();
            var matrix3d = this.parent.localToWorldRotationMatrix;
            direction = matrix3d.transformVector(direction);
            return direction;
        };
        /**
         * Transforms position from local space to world space.
         */
        Transform.prototype.transformPoint = function (position) {
            if (!this.parent)
                return position.clone();
            var matrix3d = this.parent.localToWorldMatrix;
            position = matrix3d.transformVector(position);
            return position;
        };
        /**
         * Transforms vector from local space to world space.
         */
        Transform.prototype.transformVector = function (vector) {
            if (!this.parent)
                return vector.clone();
            var matrix3d = this.parent.localToWorldMatrix;
            vector = matrix3d.deltaTransformVector(vector);
            return vector;
        };
        /**
         * Transforms a direction from world space to local space. The opposite of Transform.TransformDirection.
         */
        Transform.prototype.inverseTransformDirection = function (direction) {
            if (!this.parent)
                return direction.clone();
            var matrix3d = this.parent.localToWorldRotationMatrix.clone().invert();
            direction = matrix3d.transformVector(direction);
            return direction;
        };
        /**
         * Transforms position from world space to local space.
         */
        Transform.prototype.inverseTransformPoint = function (position) {
            if (!this.parent)
                return position.clone();
            var matrix3d = this.parent.localToWorldMatrix.clone().invert();
            position = matrix3d.transformVector(position);
            return position;
        };
        /**
         * Transforms a vector from world space to local space. The opposite of Transform.TransformVector.
         */
        Transform.prototype.inverseTransformVector = function (vector) {
            if (!this.parent)
                return vector.clone();
            var matrix3d = this.parent.localToWorldMatrix.clone().invert();
            vector = matrix3d.deltaTransformVector(vector);
            return vector;
        };
        Transform.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        //------------------------------------------
        // Protected Properties
        //------------------------------------------
        //------------------------------------------
        // Protected Functions
        //------------------------------------------
        Transform.prototype.updateLocalToWorldMatrix = function () {
            this._localToWorldMatrix = this.matrix3d.clone();
            if (this.parent)
                this._localToWorldMatrix.append(this.parent.localToWorldMatrix);
            this.dispatch("updateLocalToWorldMatrix");
            return this._localToWorldMatrix;
        };
        //------------------------------------------
        // Private Properties
        //------------------------------------------
        //------------------------------------------
        // Private Methods
        //------------------------------------------
        Transform.prototype.invalidateSceneTransform = function () {
            if (!this._localToWorldMatrix)
                return;
            this._localToWorldMatrix = null;
            this._ITlocalToWorldMatrix = null;
            this._worldToLocalMatrix = null;
            this.gameObject.dispatch("scenetransformChanged", this);
            //
            for (var i = 0, n = this.gameObject.numChildren; i < n; i++) {
                this.gameObject.getChildAt(i).transform.invalidateSceneTransform();
            }
        };
        Object.defineProperty(Transform.prototype, "x", {
            //------------------------------------------
            // Variables
            //------------------------------------------
            get: function () {
                return this._x;
            },
            set: function (val) {
                val = Number(val.toFixed(fixedNum));
                feng3d.debuger && feng3d.assert(!isNaN(val));
                if (this._x == val)
                    return;
                this._x = val;
                this.invalidatePosition();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (val) {
                val = Number(val.toFixed(fixedNum));
                feng3d.debuger && feng3d.assert(!isNaN(val));
                if (this._y == val)
                    return;
                this._y = val;
                this.invalidatePosition();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "z", {
            get: function () {
                return this._z;
            },
            set: function (val) {
                val = Number(val.toFixed(fixedNum));
                feng3d.debuger && feng3d.assert(!isNaN(val));
                if (this._z == val)
                    return;
                this._z = val;
                this.invalidatePosition();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "rx", {
            get: function () {
                return this._rx;
            },
            set: function (val) {
                val = Number(val.toFixed(fixedNum));
                feng3d.debuger && feng3d.assert(!isNaN(val));
                if (this.rx == val)
                    return;
                this._rx = val;
                this.invalidateRotation();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "ry", {
            get: function () {
                return this._ry;
            },
            set: function (val) {
                val = Number(val.toFixed(fixedNum));
                feng3d.debuger && feng3d.assert(!isNaN(val));
                if (this.ry == val)
                    return;
                this._ry = val;
                this.invalidateRotation();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "rz", {
            get: function () {
                return this._rz;
            },
            set: function (val) {
                val = Number(val.toFixed(fixedNum));
                feng3d.debuger && feng3d.assert(!isNaN(val));
                if (this.rz == val)
                    return;
                this._rz = val;
                this.invalidateRotation();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "sx", {
            get: function () {
                return this._sx;
            },
            set: function (val) {
                val = Number(val.toFixed(fixedNum));
                feng3d.debuger && feng3d.assert(!isNaN(val) && val != 0);
                if (this._sx == val)
                    return;
                this._sx = val;
                this.invalidateScale();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "sy", {
            get: function () {
                return this._sy;
            },
            set: function (val) {
                val = Number(val.toFixed(fixedNum));
                feng3d.debuger && feng3d.assert(!isNaN(val) && val != 0);
                if (this._sy == val)
                    return;
                this._sy = val;
                this.invalidateScale();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "sz", {
            get: function () {
                return this._sz;
            },
            set: function (val) {
                val = Number(val.toFixed(fixedNum));
                feng3d.debuger && feng3d.assert(!isNaN(val) && val != 0);
                if (this._sz == val)
                    return;
                this._sz = val;
                this.invalidateScale();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "matrix3d", {
            /**
             * @private
             */
            get: function () {
                if (!this._matrix3d)
                    this.updateMatrix3D();
                return this._matrix3d;
            },
            set: function (val) {
                var raw = feng3d.Matrix3D.RAW_DATA_CONTAINER;
                val.copyRawDataTo(raw);
                if (!raw[0]) {
                    raw[0] = this._smallestNumber;
                    val.copyRawDataFrom(raw);
                }
                val.decompose(feng3d.Orientation3D.EULER_ANGLES, elements);
                this.position = elements[0];
                this.rotation = elements[1].scaleBy(Math.RAD2DEG);
                this.scale = elements[2];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "rotationMatrix", {
            /**
             * 旋转矩阵
             */
            get: function () {
                if (!this._rotationMatrix3d)
                    this._rotationMatrix3d = feng3d.Matrix3D.fromRotation(this._rx, this._ry, this._rz);
                return this._rotationMatrix3d;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "position", {
            /**
             * 返回保存位置数据的Vector3D对象
             */
            get: function () {
                this._position.setTo(this._x, this._y, this._z);
                return this._position;
            },
            set: function (_a) {
                var _b = _a.x, x = _b === void 0 ? 1 : _b, _c = _a.y, y = _c === void 0 ? 1 : _c, _d = _a.z, z = _d === void 0 ? 1 : _d;
                x = Number(x.toFixed(fixedNum));
                y = Number(y.toFixed(fixedNum));
                z = Number(z.toFixed(fixedNum));
                feng3d.debuger && feng3d.assert(!isNaN(x));
                feng3d.debuger && feng3d.assert(!isNaN(y));
                feng3d.debuger && feng3d.assert(!isNaN(z));
                if (this._x != x || this._y != y || this._z != z) {
                    this._x = x;
                    this._y = y;
                    this._z = z;
                    this.invalidatePosition();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "rotation", {
            get: function () {
                this._rotation.setTo(this._rx, this._ry, this._rz);
                return this._rotation;
            },
            set: function (_a) {
                var _b = _a.x, x = _b === void 0 ? 0 : _b, _c = _a.y, y = _c === void 0 ? 0 : _c, _d = _a.z, z = _d === void 0 ? 0 : _d;
                x = Number(x.toFixed(fixedNum));
                y = Number(y.toFixed(fixedNum));
                z = Number(z.toFixed(fixedNum));
                feng3d.debuger && feng3d.assert(!isNaN(x));
                feng3d.debuger && feng3d.assert(!isNaN(y));
                feng3d.debuger && feng3d.assert(!isNaN(z));
                if (this._rx != x || this._ry != y || this._rz != z) {
                    this._rx = x;
                    this._ry = y;
                    this._rz = z;
                    this.invalidateRotation();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "orientation", {
            /**
             * 四元素旋转
             */
            get: function () {
                this._orientation.fromMatrix(this.matrix3d);
                return this._orientation;
            },
            set: function (value) {
                var angles = value.toEulerAngles();
                angles.scaleBy(Math.RAD2DEG);
                this.rotation = angles;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "scale", {
            get: function () {
                this._scale.setTo(this._sx, this._sy, this._sz);
                return this._scale;
            },
            set: function (_a) {
                var _b = _a.x, x = _b === void 0 ? 1 : _b, _c = _a.y, y = _c === void 0 ? 1 : _c, _d = _a.z, z = _d === void 0 ? 1 : _d;
                x = Number(x.toFixed(fixedNum));
                y = Number(y.toFixed(fixedNum));
                z = Number(z.toFixed(fixedNum));
                feng3d.debuger && feng3d.assert(!isNaN(x) && x != 0);
                feng3d.debuger && feng3d.assert(!isNaN(y) && y != 0);
                feng3d.debuger && feng3d.assert(!isNaN(z) && z != 0);
                if (this._sx != x || this._sy != y || this._sz != z) {
                    this._sx = x;
                    this._sy = y;
                    this._sz = z;
                    this.invalidateScale();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "forwardVector", {
            get: function () {
                return this.matrix3d.forward;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "rightVector", {
            get: function () {
                return this.matrix3d.right;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "upVector", {
            get: function () {
                return this.matrix3d.up;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "backVector", {
            get: function () {
                var director = this.matrix3d.forward;
                director.negate();
                return director;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "leftVector", {
            get: function () {
                var director = this.matrix3d.left;
                director.negate();
                return director;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "downVector", {
            get: function () {
                var director = this.matrix3d.up;
                director.negate();
                return director;
            },
            enumerable: true,
            configurable: true
        });
        Transform.prototype.moveForward = function (distance) {
            this.translateLocal(feng3d.Vector3D.Z_AXIS, distance);
        };
        Transform.prototype.moveBackward = function (distance) {
            this.translateLocal(feng3d.Vector3D.Z_AXIS, -distance);
        };
        Transform.prototype.moveLeft = function (distance) {
            this.translateLocal(feng3d.Vector3D.X_AXIS, -distance);
        };
        Transform.prototype.moveRight = function (distance) {
            this.translateLocal(feng3d.Vector3D.X_AXIS, distance);
        };
        Transform.prototype.moveUp = function (distance) {
            this.translateLocal(feng3d.Vector3D.Y_AXIS, distance);
        };
        Transform.prototype.moveDown = function (distance) {
            this.translateLocal(feng3d.Vector3D.Y_AXIS, -distance);
        };
        Transform.prototype.translate = function (axis, distance) {
            var x = axis.x, y = axis.y, z = axis.z;
            var len = distance / Math.sqrt(x * x + y * y + z * z);
            this._x += x * len;
            this._y += y * len;
            this._z += z * len;
            this.invalidatePosition();
        };
        Transform.prototype.translateLocal = function (axis, distance) {
            var x = axis.x, y = axis.y, z = axis.z;
            var len = distance / Math.sqrt(x * x + y * y + z * z);
            var matrix3d = this.matrix3d.clone();
            matrix3d.prependTranslation(x * len, y * len, z * len);
            this._x = matrix3d.position.x;
            this._y = matrix3d.position.y;
            this._z = matrix3d.position.z;
            this.invalidatePosition();
            this.invalidateSceneTransform();
        };
        Transform.prototype.pitch = function (angle) {
            this.rotate(feng3d.Vector3D.X_AXIS, angle);
        };
        Transform.prototype.yaw = function (angle) {
            this.rotate(feng3d.Vector3D.Y_AXIS, angle);
        };
        Transform.prototype.roll = function (angle) {
            this.rotate(feng3d.Vector3D.Z_AXIS, angle);
        };
        Transform.prototype.rotateTo = function (ax, ay, az) {
            this._rx = ax;
            this._ry = ay;
            this._rz = az;
            this.invalidateRotation();
        };
        /**
         * 绕指定轴旋转，不受位移与缩放影响
         * @param    axis               旋转轴
         * @param    angle              旋转角度
         * @param    pivotPoint         旋转中心点
         *
         */
        Transform.prototype.rotate = function (axis, angle, pivotPoint) {
            //转换位移
            var positionMatrix3d = feng3d.Matrix3D.fromPosition(this.position);
            positionMatrix3d.appendRotation(axis, angle, pivotPoint);
            this.position = positionMatrix3d.position;
            //转换旋转
            var rotationMatrix3d = feng3d.Matrix3D.fromRotation(this.rx, this.ry, this.rz);
            rotationMatrix3d.appendRotation(axis, angle, pivotPoint);
            var newrotation = rotationMatrix3d.decompose()[1];
            newrotation.scaleBy(180 / Math.PI);
            var v = Math.round((newrotation.x - this.rx) / 180);
            if (v % 2 != 0) {
                newrotation.x += 180;
                newrotation.y = 180 - newrotation.y;
                newrotation.z += 180;
            }
            //
            var toRound = function (a, b, c) {
                if (c === void 0) { c = 360; }
                return Math.round((b - a) / c) * c + a;
            };
            newrotation.x = toRound(newrotation.x, this.rx);
            newrotation.y = toRound(newrotation.y, this.ry);
            newrotation.z = toRound(newrotation.z, this.rz);
            this.rotation = newrotation;
            this.invalidateSceneTransform();
        };
        Transform.prototype.lookAt = function (target, upAxis) {
            var xAxis = new feng3d.Vector3D();
            var yAxis = new feng3d.Vector3D();
            var zAxis = new feng3d.Vector3D();
            var raw;
            upAxis = upAxis || feng3d.Vector3D.Y_AXIS;
            if (!this._matrix3d) {
                this.updateMatrix3D();
            }
            zAxis.x = target.x - this._x;
            zAxis.y = target.y - this._y;
            zAxis.z = target.z - this._z;
            zAxis.normalize();
            xAxis.x = upAxis.y * zAxis.z - upAxis.z * zAxis.y;
            xAxis.y = upAxis.z * zAxis.x - upAxis.x * zAxis.z;
            xAxis.z = upAxis.x * zAxis.y - upAxis.y * zAxis.x;
            xAxis.normalize();
            if (xAxis.length < .05) {
                xAxis.x = upAxis.y;
                xAxis.y = upAxis.x;
                xAxis.z = 0;
                xAxis.normalize();
            }
            yAxis.x = zAxis.y * xAxis.z - zAxis.z * xAxis.y;
            yAxis.y = zAxis.z * xAxis.x - zAxis.x * xAxis.z;
            yAxis.z = zAxis.x * xAxis.y - zAxis.y * xAxis.x;
            raw = feng3d.Matrix3D.RAW_DATA_CONTAINER;
            raw[0] = this._sx * xAxis.x;
            raw[1] = this._sx * xAxis.y;
            raw[2] = this._sx * xAxis.z;
            raw[3] = 0;
            raw[4] = this._sy * yAxis.x;
            raw[5] = this._sy * yAxis.y;
            raw[6] = this._sy * yAxis.z;
            raw[7] = 0;
            raw[8] = this._sz * zAxis.x;
            raw[9] = this._sz * zAxis.y;
            raw[10] = this._sz * zAxis.z;
            raw[11] = 0;
            raw[12] = this._x;
            raw[13] = this._y;
            raw[14] = this._z;
            raw[15] = 1;
            this._matrix3d.copyRawDataFrom(raw);
            this.matrix3d = this.matrix3d;
            if (zAxis.z < 0) {
                this.ry = (180 - this.ry);
                this.rx -= 180;
                this.rz -= 180;
            }
            this.invalidateSceneTransform();
        };
        Transform.prototype.disposeAsset = function () {
            this.dispose();
        };
        Transform.prototype.invalidateTransform = function () {
            if (!this._matrix3d)
                return;
            this._matrix3d = null;
            this.dispatch("transformChanged", this);
            this.invalidateSceneTransform();
        };
        //------------------------------------------
        // Protected Properties
        //------------------------------------------
        //------------------------------------------
        // Protected Functions
        //------------------------------------------
        Transform.prototype.updateMatrix3D = function () {
            tempComponents[0].setTo(this._x, this._y, this._z);
            tempComponents[1].setTo(this._rx * Math.DEG2RAD, this._ry * Math.DEG2RAD, this._rz * Math.DEG2RAD);
            tempComponents[2].setTo(this._sx, this._sy, this._sz);
            this._matrix3d = new feng3d.Matrix3D().recompose(tempComponents);
        };
        //------------------------------------------
        // Private Methods
        //------------------------------------------
        Transform.prototype.invalidateRotation = function () {
            if (!this._rotation)
                return;
            this._rotationMatrix3d = null;
            this._localToWorldRotationMatrix = null;
            this.invalidateTransform();
        };
        Transform.prototype.invalidateScale = function () {
            if (!this._scale)
                return;
            this.invalidateTransform();
        };
        Transform.prototype.invalidatePosition = function () {
            if (!this._position)
                return;
            this.invalidateTransform();
        };
        __decorate([
            feng3d.serialize(0),
            feng3d.oav()
        ], Transform.prototype, "x", null);
        __decorate([
            feng3d.serialize(0),
            feng3d.oav()
        ], Transform.prototype, "y", null);
        __decorate([
            feng3d.serialize(0),
            feng3d.oav()
        ], Transform.prototype, "z", null);
        __decorate([
            feng3d.serialize(0),
            feng3d.oav()
        ], Transform.prototype, "rx", null);
        __decorate([
            feng3d.serialize(0),
            feng3d.oav()
        ], Transform.prototype, "ry", null);
        __decorate([
            feng3d.serialize(0),
            feng3d.oav()
        ], Transform.prototype, "rz", null);
        __decorate([
            feng3d.serialize(1),
            feng3d.oav()
        ], Transform.prototype, "sx", null);
        __decorate([
            feng3d.serialize(1),
            feng3d.oav()
        ], Transform.prototype, "sy", null);
        __decorate([
            feng3d.serialize(1),
            feng3d.oav()
        ], Transform.prototype, "sz", null);
        Transform = __decorate([
            feng3d.ov({ component: "OVTransform" })
        ], Transform);
        return Transform;
    }(feng3d.Component));
    feng3d.Transform = Transform;
    var tempComponents = [new feng3d.Vector3D(), new feng3d.Vector3D(), new feng3d.Vector3D()];
    var elements = [new feng3d.Vector3D(), new feng3d.Vector3D(), new feng3d.Vector3D()];
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 鼠标拾取层级
     */
    feng3d.mouselayer = {
        editor: 100
    };
    var GameObjectFlag;
    (function (GameObjectFlag) {
        GameObjectFlag[GameObjectFlag["feng3d"] = 1] = "feng3d";
        GameObjectFlag[GameObjectFlag["editor"] = 2] = "editor";
    })(GameObjectFlag = feng3d.GameObjectFlag || (feng3d.GameObjectFlag = {}));
    /**
     * Base class for all entities in feng3d scenes.
     */
    var GameObject = /** @class */ (function (_super) {
        __extends(GameObject, _super);
        //------------------------------------------
        // Functions
        //------------------------------------------
        /**
         * 构建3D对象
         */
        function GameObject(name) {
            if (name === void 0) { name = "GameObject"; }
            var _this = _super.call(this) || this;
            _this._children = [];
            /**
             * 是否可序列化
             */
            _this.serializable = true;
            /**
             * 是否显示在层级界面
             */
            _this.showinHierarchy = true;
            /**
             * 是否显示
             */
            _this.visible = true;
            /**
             * 自身以及子对象是否支持鼠标拾取
             */
            _this.mouseEnabled = true;
            /**
             * 模型生成的导航网格类型
             */
            _this.navigationArea = -1;
            /**
             * 标记
             */
            _this.flag = GameObjectFlag.feng3d;
            //------------------------------------------
            // Protected Properties
            //------------------------------------------
            /**
             * 组件列表
             */
            _this._components = [];
            _this.name = name;
            _this.addComponent(feng3d.Transform);
            _this.addComponent(feng3d.RenderAtomicComponent);
            _this.addComponent(feng3d.BoundingComponent);
            _this.guid = feng3d.guid.create();
            //
            GameObject.pool.set(_this.guid, _this);
            return _this;
        }
        Object.defineProperty(GameObject.prototype, "transform", {
            //------------------------------------------
            // Variables
            //------------------------------------------
            /**
             * The Transform attached to this GameObject. (null if there is none attached).
             */
            get: function () {
                if (!this._transform)
                    this._transform = this.getComponent(feng3d.Transform);
                return this._transform;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "children", {
            /**
             * 子对象
             */
            get: function () {
                return this._children.concat();
            },
            set: function (value) {
                if (!value)
                    return;
                for (var i = 0, n = this._children.length; i < n; i++) {
                    this.removeChildAt(i);
                }
                for (var i = 0; i < value.length; i++) {
                    this.addChild(value[i]);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "numChildren", {
            get: function () {
                return this._children.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GameObject.prototype, "numComponents", {
            /**
             * 子组件个数
             */
            get: function () {
                return this._components.length;
            },
            enumerable: true,
            configurable: true
        });
        GameObject.prototype.find = function (name) {
            if (this.name == name)
                return this;
            for (var i = 0; i < this._children.length; i++) {
                var target = this._children[i].find(name);
                if (target)
                    return target;
            }
            return null;
        };
        GameObject.prototype.contains = function (child) {
            var checkitem = child;
            do {
                if (checkitem == this)
                    return true;
                checkitem = checkitem.parent;
            } while (checkitem);
            return false;
        };
        GameObject.prototype.addChild = function (child) {
            if (child == null)
                return;
            if (child.contains(this))
                throw "无法添加到自身中!";
            if (child._parent)
                child._parent.removeChild(child);
            child._setParent(this);
            this._children.push(child);
            this.dispatch("added", child, true);
            return child;
        };
        GameObject.prototype.addChildren = function () {
            var childarray = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                childarray[_i] = arguments[_i];
            }
            for (var child_key_a in childarray) {
                var child = childarray[child_key_a];
                this.addChild(child);
            }
        };
        /**
         * 移除自身
         */
        GameObject.prototype.remove = function () {
            if (this.parent)
                this.parent.removeChild(this);
        };
        GameObject.prototype.removeChild = function (child) {
            if (child == null)
                throw new Error("Parameter child cannot be null").message;
            var childIndex = this._children.indexOf(child);
            if (childIndex == -1)
                throw new Error("Parameter is not a child of the caller").message;
            this.removeChildInternal(childIndex, child);
        };
        GameObject.prototype.removeChildAt = function (index) {
            var child = this._children[index];
            this.removeChildInternal(index, child);
        };
        GameObject.prototype._setParent = function (value) {
            this._parent = value;
            this.updateScene();
            this.transform["invalidateSceneTransform"]();
        };
        GameObject.prototype.getChildAt = function (index) {
            index = index;
            return this._children[index];
        };
        Object.defineProperty(GameObject.prototype, "scene", {
            get: function () {
                return this._scene;
            },
            enumerable: true,
            configurable: true
        });
        GameObject.prototype.updateScene = function () {
            var newScene = this._parent ? this._parent._scene : null;
            if (this._scene == newScene)
                return;
            if (this._scene) {
                this.dispatch("removedFromScene", this);
                this._scene._removeGameObject(this);
            }
            this._scene = newScene;
            if (this._scene) {
                this.dispatch("addedToScene", this);
                this._scene._addGameObject(this);
            }
            for (var i = 0, n = this._children.length; i < n; i++) {
                this._children[i].updateScene();
            }
            this.dispatch("sceneChanged", this);
        };
        /**
         * 获取子对象列表（备份）
         */
        GameObject.prototype.getChildren = function () {
            return this._children.concat();
        };
        GameObject.prototype.removeChildInternal = function (childIndex, child) {
            childIndex = childIndex;
            this._children.splice(childIndex, 1);
            child._setParent(null);
            this.dispatch("removed", child, true);
        };
        /**
         * 获取指定位置索引的子组件
         * @param index			位置索引
         * @return				子组件
         */
        GameObject.prototype.getComponentAt = function (index) {
            feng3d.debuger && feng3d.assert(index < this.numComponents, "给出索引超出范围");
            return this._components[index];
        };
        /**
         * 添加组件
         * Adds a component class named className to the game object.
         * @param param 被添加组件
         */
        GameObject.prototype.addComponent = function (param) {
            var component = this.getComponent(param);
            if (component && component.single) {
                // alert(`The compnent ${param["name"]} can't be added because ${this.name} already contains the same component.`);
                return component;
            }
            component = new param();
            this.addComponentAt(component, this._components.length);
            return component;
        };
        /**
         * 判断是否拥有组件
         * @param com	被检测的组件
         * @return		true：拥有该组件；false：不拥有该组件。
         */
        GameObject.prototype.hasComponent = function (com) {
            return this._components.indexOf(com) != -1;
        };
        /**
         * Returns the component of Type type if the game object has one attached, null if it doesn't.
         * @param type				类定义
         * @return                  返回指定类型组件
         */
        GameObject.prototype.getComponent = function (type) {
            var component = this.getComponents(type)[0];
            return component;
        };
        /**
         * Returns all components of Type type in the GameObject.
         * @param type		类定义
         * @return			返回与给出类定义一致的组件
         */
        GameObject.prototype.getComponents = function (type) {
            var filterResult;
            if (!type) {
                filterResult = this._components.concat();
            }
            else {
                filterResult = this._components.filter(function (value, index, array) {
                    return value instanceof type;
                });
            }
            return filterResult;
        };
        /**
         * Returns the component of Type type in the GameObject or any of its children using depth first search.
         * @param type		类定义
         * @return			返回与给出类定义一致的组件
         */
        GameObject.prototype.getComponentsInChildren = function (type, filter, result) {
            result = result || [];
            var findchildren = true;
            for (var i = 0, n = this._components.length; i < n; i++) {
                var item = this._components[i];
                if (!type) {
                    result.push(item);
                }
                else if (item instanceof type) {
                    if (filter) {
                        var filterresult = filter(item);
                        filterresult && filterresult.value && result.push(item);
                        findchildren = filterresult ? (filterresult && filterresult.findchildren) : false;
                    }
                    else {
                        result.push(item);
                    }
                }
            }
            if (findchildren) {
                for (var i = 0, n = this.numChildren; i < n; i++) {
                    this.getChildAt(i).getComponentsInChildren(type, filter, result);
                }
            }
            return result;
        };
        /**
         * 设置子组件的位置
         * @param component				子组件
         * @param index				位置索引
         */
        GameObject.prototype.setComponentIndex = function (component, index) {
            feng3d.debuger && feng3d.assert(index >= 0 && index < this.numComponents, "给出索引超出范围");
            var oldIndex = this._components.indexOf(component);
            feng3d.debuger && feng3d.assert(oldIndex >= 0 && oldIndex < this.numComponents, "子组件不在容器内");
            this._components.splice(oldIndex, 1);
            this._components.splice(index, 0, component);
        };
        /**
         * 设置组件到指定位置
         * @param component		被设置的组件
         * @param index			索引
         */
        GameObject.prototype.setComponentAt = function (component, index) {
            if (this._components[index]) {
                this.removeComponentAt(index);
            }
            this.addComponentAt(component, index);
        };
        /**
         * 移除组件
         * @param component 被移除组件
         */
        GameObject.prototype.removeComponent = function (component) {
            feng3d.debuger && feng3d.assert(this.hasComponent(component), "只能移除在容器中的组件");
            var index = this.getComponentIndex(component);
            this.removeComponentAt(index);
        };
        /**
         * 获取组件在容器的索引位置
         * @param component			查询的组件
         * @return				    组件在容器的索引位置
         */
        GameObject.prototype.getComponentIndex = function (component) {
            feng3d.debuger && feng3d.assert(this._components.indexOf(component) != -1, "组件不在容器中");
            var index = this._components.indexOf(component);
            return index;
        };
        /**
         * 移除组件
         * @param index		要删除的 Component 的子索引。
         */
        GameObject.prototype.removeComponentAt = function (index) {
            feng3d.debuger && feng3d.assert(index >= 0 && index < this.numComponents, "给出索引超出范围");
            var component = this._components.splice(index, 1)[0];
            //派发移除组件事件
            this.dispatch("removedComponent", component);
            this._scene && this._scene._removeComponent(component);
            this.removeRenderDataHolder(component);
            component.dispose();
            return component;
        };
        /**
         * 交换子组件位置
         * @param index1		第一个子组件的索引位置
         * @param index2		第二个子组件的索引位置
         */
        GameObject.prototype.swapComponentsAt = function (index1, index2) {
            feng3d.debuger && feng3d.assert(index1 >= 0 && index1 < this.numComponents, "第一个子组件的索引位置超出范围");
            feng3d.debuger && feng3d.assert(index2 >= 0 && index2 < this.numComponents, "第二个子组件的索引位置超出范围");
            var temp = this._components[index1];
            this._components[index1] = this._components[index2];
            this._components[index2] = temp;
        };
        /**
         * 交换子组件位置
         * @param a		第一个子组件
         * @param b		第二个子组件
         */
        GameObject.prototype.swapComponents = function (a, b) {
            feng3d.debuger && feng3d.assert(this.hasComponent(a), "第一个子组件不在容器中");
            feng3d.debuger && feng3d.assert(this.hasComponent(b), "第二个子组件不在容器中");
            this.swapComponentsAt(this.getComponentIndex(a), this.getComponentIndex(b));
        };
        /**
         * 移除指定类型组件
         * @param type 组件类型
         */
        GameObject.prototype.removeComponentsByType = function (type) {
            var removeComponents = [];
            for (var i = this._components.length - 1; i >= 0; i--) {
                if (this._components[i].constructor == type)
                    removeComponents.push(this.removeComponentAt(i));
            }
            return removeComponents;
        };
        //------------------------------------------
        // Static Functions
        //------------------------------------------
        /**
         * Finds a game object by name and returns it.
         * @param name
         */
        GameObject.find = function (name) {
            var target = null;
            this.pool.forEach(function (element) {
                if (target == null && element.name == name)
                    target = element;
            });
            return target;
        };
        GameObject.create = function (name) {
            if (name === void 0) { name = "GameObject"; }
            return new GameObject(name);
        };
        Object.defineProperty(GameObject.prototype, "components", {
            get: function () {
                return this._components.concat();
            },
            set: function (value) {
                if (!value)
                    return;
                for (var i = 0, n = value.length; i < n; i++) {
                    var compnent = value[i];
                    if (!compnent)
                        continue;
                    this.removeComponentsByType(compnent.constructor);
                    this.addComponentAt(value[i], this.numComponents);
                }
                this._transform = null;
            },
            enumerable: true,
            configurable: true
        });
        //------------------------------------------
        // Protected Functions
        //------------------------------------------
        //------------------------------------------
        // Private Properties
        //------------------------------------------
        //------------------------------------------
        // Private Methods
        //------------------------------------------
        /**
         * 添加组件到指定位置
         * @param component		被添加的组件
         * @param index			插入的位置
         */
        GameObject.prototype.addComponentAt = function (component, index) {
            if (component == null)
                return;
            feng3d.debuger && feng3d.assert(index >= 0 && index <= this.numComponents, "给出索引超出范围");
            if (this.hasComponent(component)) {
                index = Math.min(index, this._components.length - 1);
                this.setComponentIndex(component, index);
                return;
            }
            //组件唯一时移除同类型的组件
            if (component.single)
                this.removeComponentsByType(component.constructor);
            this._components.splice(index, 0, component);
            component.init(this);
            //派发添加组件事件
            this.dispatch("addedComponent", component);
            this._scene && this._scene._addComponent(component);
            this.addRenderDataHolder(component);
        };
        /**
         * 销毁
         */
        GameObject.prototype.dispose = function () {
            if (this.parent)
                this.parent.removeChild(this);
            for (var i = this._children.length - 1; i >= 0; i--) {
                this.removeChildAt(i);
            }
            for (var i = this._components.length - 1; i >= 0; i--) {
                this.removeComponentAt(i);
            }
            GameObject.pool.delete(this.guid);
        };
        GameObject.prototype.disposeWithChildren = function () {
            this.dispose();
            while (this.numChildren > 0)
                this.getChildAt(0).dispose();
        };
        /**
         * 游戏对象池
         */
        GameObject.pool = new Map();
        __decorate([
            feng3d.serialize(true)
        ], GameObject.prototype, "serializable", void 0);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], GameObject.prototype, "name", void 0);
        __decorate([
            feng3d.serialize(true),
            feng3d.oav()
        ], GameObject.prototype, "visible", void 0);
        __decorate([
            feng3d.serialize(true),
            feng3d.oav()
        ], GameObject.prototype, "mouseEnabled", void 0);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], GameObject.prototype, "navigationArea", void 0);
        __decorate([
            feng3d.serialize()
        ], GameObject.prototype, "children", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav({ component: "OAVComponentList" })
        ], GameObject.prototype, "components", null);
        return GameObject;
    }(feng3d.Feng3dObject));
    feng3d.GameObject = GameObject;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var BoundingComponent = /** @class */ (function (_super) {
        __extends(BoundingComponent, _super);
        function BoundingComponent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.showInInspector = false;
            _this.serializable = false;
            return _this;
        }
        BoundingComponent.prototype.init = function (gameObject) {
            _super.prototype.init.call(this, gameObject);
            gameObject.on("boundsInvalid", this.onBoundsChange, this);
            gameObject.on("scenetransformChanged", this.invalidateSceneTransform, this);
        };
        Object.defineProperty(BoundingComponent.prototype, "bounds", {
            /**
             * 边界
             */
            get: function () {
                if (!this._bounds)
                    this.updateBounds();
                return this._bounds;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @inheritDoc
         */
        BoundingComponent.prototype.invalidateSceneTransform = function () {
            this._worldBounds = null;
        };
        /**
          * 判断射线是否穿过对象
          * @param ray3D
          * @return
          */
        BoundingComponent.prototype.isIntersectingRay = function (ray3D) {
            if (!this.bounds)
                return null;
            var localNormal = new feng3d.Vector3D();
            //转换到当前实体坐标系空间
            var localRay = new feng3d.Ray3D();
            this.transform.worldToLocalMatrix.transformVector(ray3D.position, localRay.position);
            this.transform.worldToLocalMatrix.deltaTransformVector(ray3D.direction, localRay.direction);
            //检测射线与边界的碰撞
            var rayEntryDistance = feng3d.bounding.rayIntersection(this.bounds, localRay, localNormal);
            if (rayEntryDistance < 0)
                return null;
            //保存碰撞数据
            var pickingCollisionVO = {
                gameObject: this.gameObject,
                localNormal: localNormal,
                localRay: localRay,
                rayEntryDistance: rayEntryDistance,
                ray3D: ray3D,
                rayOriginIsInsideBounds: rayEntryDistance == 0,
                geometry: this.gameObject.getComponent(feng3d.MeshRenderer).geometry,
            };
            return pickingCollisionVO;
        };
        Object.defineProperty(BoundingComponent.prototype, "worldBounds", {
            /**
             * 世界边界
             */
            get: function () {
                if (!this._worldBounds)
                    this.updateWorldBounds();
                return this._worldBounds;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 更新世界边界
         */
        BoundingComponent.prototype.updateWorldBounds = function () {
            if (this.bounds && this.transform.localToWorldMatrix) {
                this._worldBounds = feng3d.bounding.transform(this.bounds, this.transform.localToWorldMatrix);
            }
        };
        /**
         * 处理包围盒变换事件
         */
        BoundingComponent.prototype.onBoundsChange = function () {
            this._bounds = null;
            this._worldBounds = null;
        };
        /**
         * @inheritDoc
         */
        BoundingComponent.prototype.updateBounds = function () {
            var meshRenderer = this.gameObject.getComponent(feng3d.MeshRenderer);
            if (meshRenderer && meshRenderer.geometry)
                this._bounds = meshRenderer.geometry.bounding;
        };
        return BoundingComponent;
    }(feng3d.Component));
    feng3d.BoundingComponent = BoundingComponent;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    // export interface RenderAtomicComponent extends RenderAtomic { }
    var RenderAtomicComponent = /** @class */ (function (_super) {
        __extends(RenderAtomicComponent, _super);
        function RenderAtomicComponent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.showInInspector = false;
            _this.serializable = false;
            _this.renderAtomic = new feng3d.RenderAtomic();
            _this.changefuncs = [];
            return _this;
        }
        RenderAtomicComponent.prototype.init = function (gameObject) {
            _super.prototype.init.call(this, gameObject);
            feng3d.renderdatacollector.collectRenderDataHolder(this.gameObject, this.renderAtomic);
            var uniforms = this.renderAtomic.uniforms;
            uniforms.u_mvMatrix = function () { return feng3d.lazy.getvalue(uniforms.u_modelMatrix).clone().append(feng3d.lazy.getvalue(uniforms.u_viewMatrix)); };
            uniforms.u_ITMVMatrix = function () { return feng3d.lazy.getvalue(uniforms.u_mvMatrix).clone().invert().transpose(); };
            this.gameObject.on("renderdataChange", this.onrenderdataChange, this);
        };
        RenderAtomicComponent.prototype.update = function () {
            var _this = this;
            this.changefuncs.forEach(function (element) {
                element(_this.renderAtomic);
            });
            this.changefuncs.length = 0;
        };
        RenderAtomicComponent.prototype.onrenderdataChange = function (event) {
            this.changefuncs = this.changefuncs.concat(event.data);
        };
        return RenderAtomicComponent;
    }(feng3d.Component));
    feng3d.RenderAtomicComponent = RenderAtomicComponent;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 3D视图
     * @author feng 2016-05-01
     */
    var Engine = /** @class */ (function () {
        /**
         * 构建3D视图
         * @param canvas    画布
         * @param scene     3D场景
         * @param camera    摄像机
         */
        function Engine(canvas, scene, camera) {
            /**
             * 渲染对象标记，用于过滤渲染对象
             */
            this.renderObjectflag = feng3d.GameObjectFlag.feng3d;
            if (!canvas) {
                canvas = document.createElement("canvas");
                canvas.id = "glcanvas";
                canvas.style.position = "fixed";
                canvas.style.left = "0px";
                canvas.style.top = "0px";
                canvas.style.width = "100%";
                canvas.style.height = "100%";
                document.body.appendChild(canvas);
            }
            feng3d.debuger && feng3d.assert(canvas instanceof HTMLCanvasElement, "canvas\u53C2\u6570\u5FC5\u987B\u4E3A HTMLCanvasElement \u7C7B\u578B\uFF01");
            this.canvas = canvas;
            this.scene = scene || feng3d.GameObject.create("scene").addComponent(feng3d.Scene3D);
            this.camera = camera || feng3d.GameObject.create("camera").addComponent(feng3d.Camera);
            this.start();
            this.renderContext = new feng3d.RenderContext();
            this.mouse3DManager = new feng3d.Mouse3DManager(canvas);
        }
        Object.defineProperty(Engine.prototype, "root", {
            /**
             * 根节点
             */
            get: function () {
                return this.scene.gameObject;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Engine.prototype, "gl", {
            get: function () {
                if (!this.canvas.gl)
                    this.canvas.gl = feng3d.GL.getGL(this.canvas);
                return this.canvas.gl;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Engine.prototype, "mousePos", {
            /**
             * 鼠标在3D视图中的位置
             */
            get: function () {
                return new feng3d.Point(feng3d.windowEventProxy.clientX - this.canvas.clientLeft, feng3d.windowEventProxy.clientY - this.canvas.clientTop);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Engine.prototype, "mouseinview", {
            get: function () {
                return this.viewRect.contains(feng3d.windowEventProxy.clientX, feng3d.windowEventProxy.clientY);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Engine.prototype, "viewRect", {
            get: function () {
                var clientRect = this.canvas.getBoundingClientRect();
                var viewRect = new feng3d.Rectangle(clientRect.left, clientRect.top, clientRect.width, clientRect.height);
                return viewRect;
            },
            enumerable: true,
            configurable: true
        });
        Engine.prototype.start = function () {
            feng3d.ticker.onframe(this.update, this);
        };
        Engine.prototype.stop = function () {
            feng3d.ticker.offframe(this.update, this);
        };
        Engine.prototype.update = function () {
            this.render();
        };
        /**
         * 绘制场景
         */
        Engine.prototype.render = function () {
            if (!this.scene)
                return;
            this.scene.update();
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.renderContext.camera = this.camera;
            this.renderContext.scene3d = this.scene;
            this.renderContext.gl = this.gl;
            var viewRect = this.viewRect;
            this.camera.viewRect = viewRect;
            this.camera.lens.aspectRatio = viewRect.width / viewRect.height;
            //鼠标拾取渲染
            this.mouse3DManager.draw(this.scene, this.camera, viewRect);
            //绘制阴影图
            // this.shadowRenderer.draw(this._gl, this._scene, this._camera.camera);
            init(this.gl, this.scene);
            feng3d.skyboxRenderer.draw(this.gl, this.scene, this.camera, this.renderObjectflag);
            // 默认渲染
            var forwardresult = feng3d.forwardRenderer.draw(this.renderContext, this.renderObjectflag);
            feng3d.outlineRenderer.draw(this.renderContext, forwardresult.unblenditems);
            feng3d.wireframeRenderer.draw(this.renderContext, forwardresult.unblenditems);
        };
        return Engine;
    }());
    feng3d.Engine = Engine;
    function init(gl, scene3D) {
        // 默认渲染
        gl.clearColor(scene3D.background.r, scene3D.background.g, scene3D.background.b, scene3D.background.a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
    }
})(feng3d || (feng3d = {}));
// var viewRect0 = { x: 0, y: 0, w: 400, h: 300 }; 
var feng3d;
(function (feng3d) {
    var HoldSizeComponent = /** @class */ (function (_super) {
        __extends(HoldSizeComponent, _super);
        function HoldSizeComponent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._holdSize = 1;
            return _this;
        }
        Object.defineProperty(HoldSizeComponent.prototype, "holdSize", {
            /**
             * 保持缩放尺寸
             */
            get: function () {
                return this._holdSize;
            },
            set: function (value) {
                if (this._holdSize == value)
                    return;
                this._holdSize = value;
                this.invalidateSceneTransform();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HoldSizeComponent.prototype, "camera", {
            /**
             * 相对
             */
            get: function () {
                return this._camera;
            },
            set: function (value) {
                if (this._camera == value)
                    return;
                if (this._camera)
                    this._camera.gameObject.off("scenetransformChanged", this.invalidateSceneTransform, this);
                this._camera = value;
                if (this._camera)
                    this._camera.gameObject.on("scenetransformChanged", this.invalidateSceneTransform, this);
                this.invalidateSceneTransform();
            },
            enumerable: true,
            configurable: true
        });
        HoldSizeComponent.prototype.init = function (gameobject) {
            _super.prototype.init.call(this, gameobject);
            this.transform.on("updateLocalToWorldMatrix", this.updateLocalToWorldMatrix, this);
        };
        HoldSizeComponent.prototype.invalidateSceneTransform = function () {
            this.transform["invalidateSceneTransform"]();
        };
        HoldSizeComponent.prototype.updateLocalToWorldMatrix = function () {
            var _localToWorldMatrix = this.transform["_localToWorldMatrix"];
            if (this.holdSize && this._camera && _localToWorldMatrix) {
                var depthScale = this.getDepthScale(this._camera);
                var vec = _localToWorldMatrix.decompose();
                vec[2].scaleBy(depthScale);
                _localToWorldMatrix.recompose(vec);
            }
        };
        HoldSizeComponent.prototype.getDepthScale = function (camera) {
            var cameraTranform = camera.transform.localToWorldMatrix;
            var distance = this.transform.scenePosition.subtract(cameraTranform.position);
            if (distance.length == 0)
                distance.x = 1;
            var depth = distance.dotProduct(cameraTranform.forward);
            var scale = camera.getScaleByDepth(depth);
            //限制在放大缩小100倍之间，否则容易出现矩阵不可逆问题
            scale = Math.max(Math.min(100, scale), 0.01);
            return scale;
        };
        HoldSizeComponent.prototype.dispose = function () {
            this.camera = null;
            this.transform.off("updateLocalToWorldMatrix", this.updateLocalToWorldMatrix, this);
            _super.prototype.dispose.call(this);
        };
        __decorate([
            feng3d.oav()
        ], HoldSizeComponent.prototype, "holdSize", null);
        __decorate([
            feng3d.oav()
        ], HoldSizeComponent.prototype, "camera", null);
        return HoldSizeComponent;
    }(feng3d.Component));
    feng3d.HoldSizeComponent = HoldSizeComponent;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var BillboardComponent = /** @class */ (function (_super) {
        __extends(BillboardComponent, _super);
        function BillboardComponent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._holdSize = 1;
            return _this;
        }
        Object.defineProperty(BillboardComponent.prototype, "camera", {
            /**
             * 相对
             */
            get: function () {
                return this._camera;
            },
            set: function (value) {
                if (this._camera == value)
                    return;
                if (this._camera)
                    this._camera.gameObject.off("scenetransformChanged", this.invalidHoldSizeMatrix, this);
                this._camera = value;
                if (this._camera)
                    this._camera.gameObject.on("scenetransformChanged", this.invalidHoldSizeMatrix, this);
                this.invalidHoldSizeMatrix();
            },
            enumerable: true,
            configurable: true
        });
        BillboardComponent.prototype.init = function (gameobject) {
            _super.prototype.init.call(this, gameobject);
            this.transform.on("updateLocalToWorldMatrix", this.updateLocalToWorldMatrix, this);
        };
        BillboardComponent.prototype.invalidHoldSizeMatrix = function () {
            this.transform["invalidateSceneTransform"]();
        };
        BillboardComponent.prototype.updateLocalToWorldMatrix = function () {
            var _localToWorldMatrix = this.transform["_localToWorldMatrix"];
            if (_localToWorldMatrix && this._camera) {
                var camera = this._camera;
                var cameraPos = camera.transform.scenePosition;
                var yAxis = camera.transform.localToWorldMatrix.up;
                _localToWorldMatrix.lookAt(cameraPos, yAxis);
            }
        };
        BillboardComponent.prototype.dispose = function () {
            this.camera = null;
            this.transform.off("updateLocalToWorldMatrix", this.updateLocalToWorldMatrix, this);
            _super.prototype.dispose.call(this);
        };
        __decorate([
            feng3d.oav()
        ], BillboardComponent.prototype, "camera", null);
        return BillboardComponent;
    }(feng3d.Component));
    feng3d.BillboardComponent = BillboardComponent;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var MeshRenderer = /** @class */ (function (_super) {
        __extends(MeshRenderer, _super);
        function MeshRenderer() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._geometry = new feng3d.CubeGeometry();
            _this._material = new feng3d.StandardMaterial();
            return _this;
        }
        Object.defineProperty(MeshRenderer.prototype, "single", {
            get: function () { return true; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MeshRenderer.prototype, "geometry", {
            /**
             * Returns the instantiated Mesh assigned to the mesh filter.
             */
            get: function () {
                return this._geometry;
            },
            set: function (value) {
                if (this._geometry == value)
                    return;
                if (this._geometry) {
                    this.removeRenderDataHolder(this._geometry);
                    this._geometry.off("boundsInvalid", this.onBoundsInvalid, this);
                }
                this._geometry = value;
                if (this._geometry) {
                    this.addRenderDataHolder(this._geometry);
                    this._geometry.on("boundsInvalid", this.onBoundsInvalid, this);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MeshRenderer.prototype, "material", {
            /**
             * 材质
             * Returns the first instantiated Material assigned to the renderer.
             */
            get: function () { return this._material; },
            set: function (value) {
                if (this._material == value)
                    return;
                if (this._material)
                    this.removeRenderDataHolder(this._material);
                this._material = value;
                if (this._material)
                    this.addRenderDataHolder(this.material);
            },
            enumerable: true,
            configurable: true
        });
        MeshRenderer.prototype.init = function (gameObject) {
            var _this = this;
            _super.prototype.init.call(this, gameObject);
            //
            this.createUniformData("u_modelMatrix", function () { return _this.transform.localToWorldMatrix; });
            this.createUniformData("u_ITModelMatrix", function () { return _this.transform.ITlocalToWorldMatrix; });
        };
        /**
         * 销毁
         */
        MeshRenderer.prototype.dispose = function () {
            this.geometry = null;
            this.material = null;
            _super.prototype.dispose.call(this);
        };
        MeshRenderer.prototype.onBoundsInvalid = function (event) {
            this.gameObject.dispatch(event.type, event.data);
        };
        __decorate([
            feng3d.oav({ componentParam: { dragparam: { accepttype: "geometry", datatype: "geometry" } } }),
            feng3d.serialize()
        ], MeshRenderer.prototype, "geometry", null);
        __decorate([
            feng3d.oav({ componentParam: { dragparam: { accepttype: "material", datatype: "material" } } }),
            feng3d.serialize()
        ], MeshRenderer.prototype, "material", null);
        return MeshRenderer;
    }(feng3d.Component));
    feng3d.MeshRenderer = MeshRenderer;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var SkeletonComponent = /** @class */ (function (_super) {
        __extends(SkeletonComponent, _super);
        function SkeletonComponent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /** 骨骼关节数据列表 */
            _this.joints = [];
            _this.isInitJoints = false;
            return _this;
        }
        Object.defineProperty(SkeletonComponent.prototype, "globalMatrices", {
            /**
             * 当前骨骼姿势的全局矩阵
             * @see #globalPose
             */
            get: function () {
                if (!this.isInitJoints) {
                    this.initSkeleton();
                    this.isInitJoints = true;
                }
                if (this._globalPropertiesInvalid) {
                    this.updateGlobalProperties();
                    this._globalPropertiesInvalid = false;
                }
                return this._globalMatrices;
            },
            enumerable: true,
            configurable: true
        });
        SkeletonComponent.prototype.initSkeleton = function () {
            this.jointGameobjects = [];
            this.jointGameObjectMap = {};
            //
            this.createSkeletonGameObject();
            //
            this._globalPropertiesInvalid = true;
            this._jointsInvalid = [];
            this._globalMatrix3DsInvalid = [];
            this.globalMatrix3Ds = [];
            this._globalMatrices = [];
            //
            var jointNum = this.joints.length;
            for (var i = 0; i < jointNum; i++) {
                this._jointsInvalid[i] = true;
                this._globalMatrix3DsInvalid[i] = true;
                this.globalMatrix3Ds[i] = new feng3d.Matrix3D();
                this._globalMatrices[i] = new feng3d.Matrix3D();
            }
        };
        /**
         * 更新骨骼全局变换矩阵
         */
        SkeletonComponent.prototype.updateGlobalProperties = function () {
            //姿势变换矩阵
            var joints = this.joints;
            var jointGameobjects = this.jointGameobjects;
            var globalMatrix3Ds = this.globalMatrix3Ds;
            var _globalMatrix3DsInvalid = this._globalMatrix3DsInvalid;
            //遍历每个关节
            for (var i = 0; i < joints.length; ++i) {
                if (!this._jointsInvalid[i])
                    continue;
                this._globalMatrices[i]
                    .copyFrom(globalMatrix3d(i))
                    .prepend(joints[i].invertMatrix3D);
                this._jointsInvalid[i] = false;
            }
            function globalMatrix3d(index) {
                if (!_globalMatrix3DsInvalid[index])
                    return globalMatrix3Ds[index];
                var jointPose = joints[index];
                var jointGameobject = jointGameobjects[index];
                globalMatrix3Ds[index] = jointGameobject.transform.matrix3d.clone();
                if (jointPose.parentIndex >= 0) {
                    var parentGlobalMatrix3d = globalMatrix3d(jointPose.parentIndex);
                    globalMatrix3Ds[index].append(parentGlobalMatrix3d);
                }
                _globalMatrix3DsInvalid[index] = false;
                return globalMatrix3Ds[index];
            }
        };
        SkeletonComponent.prototype.invalidjoint = function (jointIndex) {
            var _this = this;
            this._globalPropertiesInvalid = true;
            this._jointsInvalid[jointIndex] = true;
            this._globalMatrix3DsInvalid[jointIndex] = true;
            this.joints[jointIndex].children.forEach(function (element) {
                _this.invalidjoint(element);
            });
        };
        SkeletonComponent.prototype.createSkeletonGameObject = function () {
            var skeleton = this;
            var joints = skeleton.joints;
            var jointGameobjects = this.jointGameobjects;
            var jointGameObjectMap = this.jointGameObjectMap;
            for (var i = 0; i < joints.length; i++) {
                createJoint(i);
            }
            function createJoint(i) {
                if (jointGameobjects[i])
                    return jointGameobjects[i].gameObject;
                var skeletonJoint = joints[i];
                var parentGameobject;
                if (skeletonJoint.parentIndex != -1) {
                    parentGameobject = createJoint(skeletonJoint.parentIndex);
                    joints[skeletonJoint.parentIndex].children.push(i);
                }
                else {
                    parentGameobject = skeleton.gameObject;
                }
                var jointGameobject = parentGameobject.find(skeletonJoint.name);
                if (!jointGameobject) {
                    jointGameobject = feng3d.GameObject.create(skeletonJoint.name);
                    jointGameobject.serializable = false;
                    parentGameobject.addChild(jointGameobject);
                }
                var transform = jointGameobject.transform;
                var matrix3D = skeletonJoint.matrix3D;
                if (skeletonJoint.parentIndex != -1) {
                    matrix3D = matrix3D.clone().append(joints[skeletonJoint.parentIndex].invertMatrix3D);
                }
                transform.matrix3d = matrix3D;
                transform.on("transformChanged", function () {
                    skeleton.invalidjoint(i);
                });
                jointGameobjects[i] = transform;
                jointGameObjectMap[skeletonJoint.name] = transform;
                return jointGameobject;
            }
        };
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], SkeletonComponent.prototype, "joints", void 0);
        return SkeletonComponent;
    }(feng3d.Component));
    feng3d.SkeletonComponent = SkeletonComponent;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var SkinnedMeshRenderer = /** @class */ (function (_super) {
        __extends(SkinnedMeshRenderer, _super);
        function SkinnedMeshRenderer() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.skeletonGlobalMatriices = [];
            return _this;
        }
        Object.defineProperty(SkinnedMeshRenderer.prototype, "single", {
            get: function () { return true; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SkinnedMeshRenderer.prototype, "skinSkeleton", {
            get: function () {
                return this._skinSkeleton;
            },
            set: function (value) {
                if (this._skinSkeleton == value)
                    return;
                this._skinSkeleton = value;
                this.createValueMacro("NUM_SKELETONJOINT", this._skinSkeleton.joints.length);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 创建一个骨骼动画类
         */
        SkinnedMeshRenderer.prototype.init = function (gameObject) {
            var _this = this;
            _super.prototype.init.call(this, gameObject);
            this.createUniformData("u_modelMatrix", function () {
                if (_this.cacheSkeletonComponent)
                    return _this.cacheSkeletonComponent.transform.localToWorldMatrix;
                return _this.transform.localToWorldMatrix;
            });
            this.createUniformData("u_ITModelMatrix", function () {
                if (_this.cacheSkeletonComponent)
                    return _this.cacheSkeletonComponent.transform.ITlocalToWorldMatrix;
                return _this.transform.ITlocalToWorldMatrix;
            });
            //
            this.createUniformData("u_skeletonGlobalMatriices", function () {
                if (!_this.cacheSkeletonComponent) {
                    var gameObject = _this.gameObject;
                    var skeletonComponent = null;
                    while (gameObject && !skeletonComponent) {
                        skeletonComponent = gameObject.getComponent(feng3d.SkeletonComponent);
                        gameObject = gameObject.parent;
                    }
                    _this.cacheSkeletonComponent = skeletonComponent;
                }
                if (_this._skinSkeleton && _this.cacheSkeletonComponent) {
                    var joints = _this._skinSkeleton.joints;
                    var globalMatrices = _this.cacheSkeletonComponent.globalMatrices;
                    for (var i = joints.length - 1; i >= 0; i--) {
                        _this.skeletonGlobalMatriices[i] = globalMatrices[joints[i][0]];
                        if (_this.initMatrix3d) {
                            _this.skeletonGlobalMatriices[i] = _this.skeletonGlobalMatriices[i].clone()
                                .prepend(_this.initMatrix3d);
                        }
                    }
                    return _this.skeletonGlobalMatriices;
                }
                return defaultglobalMatrices();
            });
            this.createBoolMacro("HAS_SKELETON_ANIMATION", true);
        };
        /**
         * 销毁
         */
        SkinnedMeshRenderer.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
        };
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], SkinnedMeshRenderer.prototype, "skinSkeleton", null);
        __decorate([
            feng3d.serialize()
        ], SkinnedMeshRenderer.prototype, "initMatrix3d", void 0);
        return SkinnedMeshRenderer;
    }(feng3d.MeshRenderer));
    feng3d.SkinnedMeshRenderer = SkinnedMeshRenderer;
    /**
     * 默认单位矩阵
     */
    function defaultglobalMatrices() {
        if (!_defaultglobalMatrices) {
            _defaultglobalMatrices = [];
            _defaultglobalMatrices.length = 150;
            var matrix3d = new feng3d.Matrix3D();
            for (var i = 0; i < 150; i++) {
                _defaultglobalMatrices[i] = matrix3d;
            }
        }
        return _defaultglobalMatrices;
    }
    var _defaultglobalMatrices;
    var SkinSkeleton = /** @class */ (function () {
        function SkinSkeleton() {
            /**
             * [在整个骨架中的编号，骨骼名称]
             */
            this.joints = [];
            /**
             * 当前模型包含骨骼数量
             */
            this.numJoint = 0;
        }
        __decorate([
            feng3d.serialize()
        ], SkinSkeleton.prototype, "joints", void 0);
        __decorate([
            feng3d.serialize()
        ], SkinSkeleton.prototype, "numJoint", void 0);
        return SkinSkeleton;
    }());
    feng3d.SkinSkeleton = SkinSkeleton;
    var SkinSkeletonTemp = /** @class */ (function (_super) {
        __extends(SkinSkeletonTemp, _super);
        function SkinSkeletonTemp() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * temp 解析时临时数据
             */
            _this.cache_map = {};
            return _this;
        }
        SkinSkeletonTemp.prototype.resetJointIndices = function (jointIndices, skeleton) {
            var len = jointIndices.length;
            for (var i = 0; i < len; i++) {
                if (this.cache_map[jointIndices[i]] === undefined)
                    this.cache_map[jointIndices[i]] = this.numJoint++;
                jointIndices[i] = this.cache_map[jointIndices[i]];
            }
            this.joints.length = 0;
            for (var key in this.cache_map) {
                if (this.cache_map.hasOwnProperty(key)) {
                    this.joints[this.cache_map[key]] = [parseInt(key), skeleton.joints[key].name];
                }
            }
        };
        return SkinSkeletonTemp;
    }(SkinSkeleton));
    feng3d.SkinSkeletonTemp = SkinSkeletonTemp;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var ScriptFlag;
    (function (ScriptFlag) {
        ScriptFlag[ScriptFlag["feng3d"] = 1] = "feng3d";
        ScriptFlag[ScriptFlag["editor"] = 2] = "editor";
    })(ScriptFlag = feng3d.ScriptFlag || (feng3d.ScriptFlag = {}));
    /**
     * 3d对象脚本
     * @author feng 2017-03-11
     */
    var Script = /** @class */ (function (_super) {
        __extends(Script, _super);
        function Script() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.flag = ScriptFlag.feng3d;
            _this._url = "";
            _this._enabled = false;
            /**
             * Enabled Behaviours are Updated, disabled Behaviours are not.
             */
            _this.enabled = false;
            return _this;
        }
        Object.defineProperty(Script.prototype, "url", {
            /**
             * 脚本路径
             */
            get: function () {
                return this._url;
            },
            set: function (value) {
                var _this = this;
                if (this._url == value)
                    return;
                this._url = value;
                if (value) {
                    feng3d.GameObjectUtil.addScript(this.gameObject, value.replace(/\.ts\b/, ".js"), function () {
                        _this.gameObject.removeComponent(_this);
                    });
                }
            },
            enumerable: true,
            configurable: true
        });
        Script.prototype.init = function (gameObject) {
            _super.prototype.init.call(this, gameObject);
            this.start();
        };
        /**
         * 初始化时调用
         */
        Script.prototype.start = function () {
        };
        /**
         * 更新
         */
        Script.prototype.update = function () {
        };
        /**
         * 销毁时调用
         */
        Script.prototype.end = function () {
        };
        /**
         * 销毁
         */
        Script.prototype.dispose = function () {
            this.end();
            this.enabled = false;
            _super.prototype.dispose.call(this);
        };
        __decorate([
            feng3d.oav({ componentParam: { dragparam: { accepttype: "file_script" } } })
        ], Script.prototype, "url", null);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], Script.prototype, "enabled", void 0);
        return Script;
    }(feng3d.Component));
    feng3d.Script = Script;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 3D场景
     * @author feng 2016-05-01
     */
    var Scene3D = /** @class */ (function (_super) {
        __extends(Scene3D, _super);
        function Scene3D() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * 是否编辑器模式
             */
            _this.iseditor = false;
            /**
             * 背景颜色
             */
            _this.background = new feng3d.Color(0, 0, 0, 1);
            /**
             * 环境光强度
             */
            _this.ambientColor = new feng3d.Color(0.2, 0.2, 0.2);
            /**
             * 指定更新脚本标记，用于过滤需要调用update的脚本
             */
            _this.updateScriptFlag = feng3d.ScriptFlag.feng3d;
            return _this;
        }
        /**
         * 构造3D场景
         */
        Scene3D.prototype.init = function (gameObject) {
            _super.prototype.init.call(this, gameObject);
            gameObject["_scene"] = this;
            this.transform.showInInspector = false;
            feng3d.ticker.onframe(this.onEnterFrame, this);
            this.initCollectComponents();
        };
        Scene3D.prototype.dispose = function () {
            feng3d.ticker.offframe(this.onEnterFrame, this);
            _super.prototype.dispose.call(this);
        };
        Scene3D.prototype.initCollectComponents = function () {
            this.collectComponents = {
                cameras: { cls: feng3d.Camera, list: new Array() },
                pointLights: { cls: feng3d.PointLight, list: new Array() },
                directionalLights: { cls: feng3d.DirectionalLight, list: new Array() },
                skyboxs: { cls: feng3d.SkyBox, list: new Array() },
                animations: { cls: feng3d.Animation, list: new Array() },
                scripts: { cls: feng3d.Script, list: new Array() },
            };
            var _this = this;
            collect(this.gameObject);
            function collect(gameobject) {
                gameobject["_scene"] = _this;
                _this._addGameObject(gameobject);
                gameobject.children.forEach(function (element) {
                    collect(element);
                });
            }
        };
        Scene3D.prototype.onEnterFrame = function () {
            var _this = this;
            this.collectComponents.animations.list.forEach(function (element) {
                if (element.isplaying)
                    element.update();
            });
            this.collectComponents.scripts.list.forEach(function (element) {
                if (element.enabled && (_this.updateScriptFlag & element.flag))
                    element.update();
            });
        };
        Scene3D.prototype.update = function () {
            this._mouseCheckObjects = null;
        };
        Object.defineProperty(Scene3D.prototype, "mouseCheckObjects", {
            get: function () {
                if (this._mouseCheckObjects)
                    return this._mouseCheckObjects;
                var checkList = this.gameObject.getChildren();
                var layers = {};
                var i = 0;
                //获取所有需要拾取的对象并分层存储
                while (i < checkList.length) {
                    var checkObject = checkList[i++];
                    if (checkObject.mouseEnabled) {
                        if (checkObject.getComponents(feng3d.MeshRenderer)) {
                            var mouselayer = ~~checkObject.mouselayer;
                            layers[mouselayer] = layers[mouselayer] || [];
                            layers[mouselayer].push(checkObject);
                        }
                        checkList = checkList.concat(checkObject.getChildren());
                    }
                }
                //获取分层数组
                this._mouseCheckObjects = [];
                var results = this._mouseCheckObjects;
                for (var layer in layers) {
                    if (layers.hasOwnProperty(layer)) {
                        results.push({ layer: ~~layer, objects: layers[layer] });
                    }
                }
                //按层级排序
                results = results.sort(function (a, b) { return b.layer - a.layer; });
                return results;
            },
            enumerable: true,
            configurable: true
        });
        Scene3D.prototype._addGameObject = function (gameobject) {
            var _this = this;
            gameobject.components.forEach(function (element) {
                _this._addComponent(element);
            });
            this.dispatch("addToScene", gameobject);
        };
        Scene3D.prototype._removeGameObject = function (gameobject) {
            var _this = this;
            gameobject.components.forEach(function (element) {
                _this._removeComponent(element);
            });
            this.dispatch("removeFromScene", gameobject);
        };
        Scene3D.prototype._addComponent = function (component) {
            var collectComponents = this.collectComponents;
            for (var key in collectComponents) {
                if (collectComponents.hasOwnProperty(key)) {
                    var element = collectComponents[key];
                    if (component instanceof element.cls) {
                        element.list.push(component);
                    }
                }
            }
            this.dispatch("addComponentToScene", component);
        };
        Scene3D.prototype._removeComponent = function (component) {
            var collectComponents = this.collectComponents;
            for (var key in collectComponents) {
                if (collectComponents.hasOwnProperty(key)) {
                    var element = collectComponents[key];
                    if (component instanceof element.cls) {
                        var index = element.list.indexOf(component);
                        if (index != -1)
                            element.list.splice(index, 1);
                    }
                }
            }
            this.dispatch("removeComponentFromScene", component);
        };
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], Scene3D.prototype, "background", void 0);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], Scene3D.prototype, "ambientColor", void 0);
        return Scene3D;
    }(feng3d.Component));
    feng3d.Scene3D = Scene3D;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 几何体
     * @author feng 2016-04-28
     */
    var Geometry = /** @class */ (function (_super) {
        __extends(Geometry, _super);
        /**
         * 创建一个几何体
         */
        function Geometry() {
            var _this = _super.call(this) || this;
            /**
             * 属性数据列表
             */
            _this._attributes = {};
            _this._geometryInvalid = true;
            _this._useFaceWeights = false;
            _this._scaleU = 1;
            _this._scaleV = 1;
            _this._autoAttributeDatas = {};
            _this._invalids = { index: true, a_uv: true, a_normal: true, a_tangent: true };
            _this.createIndexBuffer(function () { return _this.indices; });
            _this.createAttribute("a_position", 3);
            _this.createAttribute("a_position", 3);
            _this.createAttribute("a_uv", 2);
            _this.createAttribute("a_normal", 2);
            _this.createAttribute("a_tangent", 2);
            return _this;
        }
        Object.defineProperty(Geometry.prototype, "indices", {
            /**
             * 索引数据
             */
            get: function () {
                this.updateGrometry();
                if (!this._indices && this._invalids.index) {
                    this._invalids.index = false;
                    this._autoIndices = feng3d.GeometryUtils.createIndices(this.positions);
                }
                return this._indices || this._autoIndices;
            },
            /**
             * 更新顶点索引数据
             */
            set: function (value) {
                var _this = this;
                this._indices = value;
                if (!this._attributes.a_normal)
                    this._invalids.a_normal = true;
                if (!this._attributes.a_tangent)
                    this._invalids.a_tangent = true;
                this.createIndexBuffer(function () { return _this.indices; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Geometry.prototype, "positions", {
            /**
             * 坐标数据
             */
            get: function () {
                return this.getVAData1("a_position");
            },
            set: function (value) {
                if (!this._indices)
                    this._invalids.index = true;
                this.setVAData("a_position", value, 3);
                if (!this._attributes.a_uv)
                    this._invalids.a_uv = true;
                if (!this._attributes.a_normal)
                    this._invalids.a_normal = true;
                if (!this._attributes.a_tangent)
                    this._invalids.a_tangent = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Geometry.prototype, "uvs", {
            /**
             * uv数据
             */
            get: function () {
                return this.getVAData1("a_uv");
            },
            set: function (value) {
                this.setVAData("a_uv", value, 2);
                if (!this._attributes.a_tangent)
                    this._invalids.a_tangent = true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Geometry.prototype, "normals", {
            /**
             * 法线数据
             */
            get: function () {
                return this.getVAData1("a_normal");
            },
            set: function (value) {
                this.setVAData("a_normal", value, 3);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Geometry.prototype, "tangents", {
            /**
             * 切线数据
             */
            get: function () {
                return this.getVAData1("a_tangent");
            },
            set: function (value) {
                this.setVAData("a_tangent", value, 3);
            },
            enumerable: true,
            configurable: true
        });
        Geometry.prototype.createAttribute = function (vaId, size) {
            var _this = this;
            this.createAttributeRenderData(vaId, function () {
                return _this.getVAData1(vaId);
            }, size);
            this.createBoolMacro(("HSA_" + vaId), true);
        };
        /**
         * 几何体变脏
         */
        Geometry.prototype.invalidateGeometry = function () {
            this._geometryInvalid = true;
            this.invalidateBounds();
        };
        /**
         * 更新几何体
         */
        Geometry.prototype.updateGrometry = function () {
            if (this._geometryInvalid) {
                this._geometryInvalid = false;
                this.buildGeometry();
            }
        };
        /**
         * 构建几何体
         */
        Geometry.prototype.buildGeometry = function () {
        };
        /**
         * 设置顶点属性数据
         * @param vaId                  顶点属性编号
         * @param data                  顶点属性数据
         * @param size                  顶点数据尺寸
         * @param autogenerate          是否自动生成数据
         */
        Geometry.prototype.setVAData = function (vaId, data, size) {
            if (data) {
                this._attributes[vaId] = this._attributes[vaId] || { data: data, size: size };
                this._attributes[vaId].data = data;
                this.createAttribute(vaId, size);
            }
            else {
                delete this._attributes[vaId];
            }
        };
        /**
         * 获取顶点属性数据
         * @param vaId 数据类型编号
         * @return 顶点属性数据
         */
        Geometry.prototype.getVAData1 = function (vaId) {
            this.updateGrometry();
            if (vaId == "a_uv") {
                if (!this._attributes.a_uv && this._invalids.a_uv) {
                    this._invalids.a_uv = false;
                    var uvs = feng3d.GeometryUtils.createUVs(this.positions);
                    this._autoAttributeDatas[vaId] = { data: uvs, size: 2 };
                }
            }
            if (vaId == "a_normal") {
                if (!this._attributes.a_normal && this._invalids.a_normal) {
                    this._invalids.a_normal = false;
                    var normals = feng3d.GeometryUtils.createVertexNormals(this.indices, this.positions, this._useFaceWeights);
                    this._autoAttributeDatas[vaId] = { data: normals, size: 3 };
                }
            }
            if (vaId == "a_tangent") {
                if (!this._attributes.a_tangent && this._invalids.a_tangent) {
                    this._invalids.a_tangent = false;
                    var tangents = feng3d.GeometryUtils.createVertexTangents(this.indices, this.positions, this.uvs, this._useFaceWeights);
                    this._autoAttributeDatas[vaId] = { data: tangents, size: 3 };
                }
            }
            var attributeRenderData = this._attributes[vaId] || this._autoAttributeDatas[vaId];
            return attributeRenderData && attributeRenderData.data;
        };
        Object.defineProperty(Geometry.prototype, "numVertex", {
            /**
             * 顶点数量
             */
            get: function () {
                var numVertex = 0;
                for (var attributeName in this._attributes) {
                    var attributeRenderData = this._attributes[attributeName];
                    numVertex = attributeRenderData.data.length / attributeRenderData.size;
                    break;
                }
                return numVertex;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 添加几何体
         * @param geometry          被添加的几何体
         * @param transform         变换矩阵，把克隆被添加几何体的数据变换后再添加到该几何体中
         */
        Geometry.prototype.addGeometry = function (geometry, transform) {
            //更新几何体
            this.updateGrometry();
            geometry.updateGrometry();
            //变换被添加的几何体
            if (transform != null) {
                geometry = geometry.clone();
                geometry.applyTransformation(transform);
            }
            //如果自身为空几何体
            if (!this._indices) {
                this.cloneFrom(geometry);
                return;
            }
            //
            var attributes = this._attributes;
            var addAttributes = geometry._attributes;
            //当前顶点数量
            var oldNumVertex = this.numVertex;
            //合并索引
            var indices = this._indices;
            var targetIndices = geometry._indices;
            var totalIndices = indices.concat();
            for (var i = 0; i < targetIndices.length; i++) {
                totalIndices[indices.length + i] = targetIndices[i] + oldNumVertex;
            }
            this.indices = totalIndices;
            //合并后顶点数量
            var totalVertex = oldNumVertex + geometry.numVertex;
            //合并属性数据
            for (var attributeName in attributes) {
                var stride = attributes[attributeName].size;
                var attributeData = attributes[attributeName].data;
                var addAttributeData = addAttributes[attributeName].data;
                var data;
                // if (attributeData instanceof Array)
                // {
                //     data = attributeData.concat(<Array<any>>addAttributeData);
                // }
                // else
                // {
                data = new Float32Array(attributeData.length + addAttributeData.length);
                data.set(attributeData, 0);
                data.set(addAttributeData, attributeData.length);
                // }
                this.setVAData(attributeName, data, stride);
            }
        };
        /**
         * 应用变换矩阵
         * @param transform 变换矩阵
         */
        Geometry.prototype.applyTransformation = function (transform) {
            this.updateGrometry();
            var vertices = this.positions;
            var normals = this.normals;
            var tangents = this.tangents;
            var posStride = 3;
            var normalStride = 3;
            var tangentStride = 3;
            var len = vertices.length / posStride;
            var i, i1, i2;
            var vector = new feng3d.Vector3D();
            var bakeNormals = normals != null;
            var bakeTangents = tangents != null;
            var invTranspose = new feng3d.Matrix3D();
            if (bakeNormals || bakeTangents) {
                invTranspose.copyFrom(transform);
                invTranspose.invert();
                invTranspose.transpose();
            }
            var vi0 = 0;
            var ni0 = 0;
            var ti0 = 0;
            for (i = 0; i < len; ++i) {
                i1 = vi0 + 1;
                i2 = vi0 + 2;
                // bake position
                vector.x = vertices[vi0];
                vector.y = vertices[i1];
                vector.z = vertices[i2];
                vector = transform.transformVector(vector);
                vertices[vi0] = vector.x;
                vertices[i1] = vector.y;
                vertices[i2] = vector.z;
                vi0 += posStride;
                // bake normal
                if (bakeNormals) {
                    i1 = ni0 + 1;
                    i2 = ni0 + 2;
                    vector.x = normals[ni0];
                    vector.y = normals[i1];
                    vector.z = normals[i2];
                    vector = invTranspose.deltaTransformVector(vector);
                    vector.normalize();
                    normals[ni0] = vector.x;
                    normals[i1] = vector.y;
                    normals[i2] = vector.z;
                    ni0 += normalStride;
                }
                // bake tangent
                if (bakeTangents) {
                    i1 = ti0 + 1;
                    i2 = ti0 + 2;
                    vector.x = tangents[ti0];
                    vector.y = tangents[i1];
                    vector.z = tangents[i2];
                    vector = invTranspose.deltaTransformVector(vector);
                    vector.normalize();
                    tangents[ti0] = vector.x;
                    tangents[i1] = vector.y;
                    tangents[i2] = vector.z;
                    ti0 += tangentStride;
                }
            }
            this.positions = vertices;
            this.normals = normals;
            this.tangents = tangents;
        };
        Object.defineProperty(Geometry.prototype, "scaleU", {
            /**
             * 纹理U缩放，默认为1。
             */
            get: function () {
                return this._scaleU;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Geometry.prototype, "scaleV", {
            /**
             * 纹理V缩放，默认为1。
             */
            get: function () {
                return this._scaleV;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 缩放UV
         * @param scaleU 纹理U缩放，默认1。
         * @param scaleV 纹理V缩放，默认1。
         */
        Geometry.prototype.scaleUV = function (scaleU, scaleV) {
            if (scaleU === void 0) { scaleU = 1; }
            if (scaleV === void 0) { scaleV = 1; }
            this.updateGrometry();
            var uvs = this.uvs;
            var len = uvs.length;
            var ratioU = scaleU / this._scaleU;
            var ratioV = scaleV / this._scaleV;
            for (var i = 0; i < len; i += 2) {
                uvs[i] *= ratioU;
                uvs[i + 1] *= ratioV;
            }
            this._scaleU = scaleU;
            this._scaleV = scaleV;
            this.uvs = uvs;
        };
        /**
         * 包围盒失效
         */
        Geometry.prototype.invalidateBounds = function () {
            this._bounding = null;
            this.dispatch("boundsInvalid", this);
        };
        Object.defineProperty(Geometry.prototype, "bounding", {
            get: function () {
                this.updateGrometry();
                if (!this._bounding) {
                    var positions = this.positions;
                    if (!positions || positions.length == 0)
                        return null;
                    var min = new feng3d.Vector3D(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
                    var max = new feng3d.Vector3D(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
                    for (var i = 0; i < positions.length; i += 3) {
                        min.x = Math.min(min.x, positions[i]);
                        min.y = Math.min(min.y, positions[i + 1]);
                        min.z = Math.min(min.z, positions[i + 2]);
                        //
                        max.x = Math.max(max.x, positions[i]);
                        max.y = Math.max(max.y, positions[i + 1]);
                        max.z = Math.max(max.z, positions[i + 2]);
                    }
                    this._bounding = { min: min, max: max };
                }
                return this._bounding;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 克隆一个几何体
         */
        Geometry.prototype.clone = function () {
            var geometry = new feng3d.CustomGeometry();
            geometry.cloneFrom(this);
            return geometry;
        };
        /**
         * 从一个几何体中克隆数据
         */
        Geometry.prototype.cloneFrom = function (geometry) {
            geometry.updateGrometry();
            this.indices = geometry.indices;
            this._attributes = {};
            for (var key in geometry._attributes) {
                var attributeRenderData = geometry._attributes[key];
                this.setVAData(key, attributeRenderData.data, attributeRenderData.size);
            }
        };
        return Geometry;
    }(feng3d.Feng3dObject));
    feng3d.Geometry = Geometry;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var CustomGeometry = /** @class */ (function (_super) {
        __extends(CustomGeometry, _super);
        function CustomGeometry() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(CustomGeometry.prototype, "indicesBase", {
            /**
             * 顶点索引缓冲
             */
            get: function () {
                return this._indices;
            },
            set: function (value) {
                this.indices = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomGeometry.prototype, "attributes", {
            /**
             * 属性数据列表
             */
            get: function () {
                return this._attributes;
            },
            set: function (value) {
                this._attributes = {};
                for (var key in value) {
                    this.setVAData(key, value[key].data, value[key].size);
                }
            },
            enumerable: true,
            configurable: true
        });
        __decorate([
            feng3d.serialize()
        ], CustomGeometry.prototype, "indicesBase", null);
        __decorate([
            feng3d.serialize()
        ], CustomGeometry.prototype, "attributes", null);
        return CustomGeometry;
    }(feng3d.Geometry));
    feng3d.CustomGeometry = CustomGeometry;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    feng3d.GeometryUtils = {
        createIndices: createIndices,
        createUVs: createUVs,
        createVertexNormals: createVertexNormals,
        createVertexTangents: createVertexTangents,
    };
    function createIndices(positions) {
        var vertexNum = positions.length / 3;
        var indices = [];
        for (var i = 0; i < vertexNum; i++) {
            indices[i] = i;
        }
        return indices;
    }
    function createUVs(positions) {
        var idx = 0, uvIdx = 0;
        var stride = 2;
        var target = new Array();
        var len = positions.length / 3 * 2;
        while (idx < len) {
            target[idx++] = uvIdx * .5;
            target[idx++] = 1.0 - (uvIdx & 1);
            if (++uvIdx == 3)
                uvIdx = 0;
        }
        return target;
    }
    function createVertexNormals(indices, positions, useFaceWeights) {
        if (useFaceWeights === void 0) { useFaceWeights = false; }
        var faceNormalsResult = createFaceNormals(indices, positions, useFaceWeights);
        var faceWeights = faceNormalsResult.faceWeights;
        var faceNormals = faceNormalsResult.faceNormals;
        var v1 = 0;
        var f1 = 0, f2 = 1, f3 = 2;
        var lenV = positions.length;
        var normalStride = 3;
        var normalOffset = 0;
        var normals = new Array(lenV);
        v1 = 0;
        while (v1 < lenV) {
            normals[v1] = 0.0;
            normals[v1 + 1] = 0.0;
            normals[v1 + 2] = 0.0;
            v1 += normalStride;
        }
        var i = 0, k = 0;
        var lenI = indices.length;
        var index = 0;
        var weight = 0;
        while (i < lenI) {
            weight = useFaceWeights ? faceWeights[k++] : 1;
            index = normalOffset + indices[i++] * normalStride;
            normals[index++] += faceNormals[f1] * weight;
            normals[index++] += faceNormals[f2] * weight;
            normals[index] += faceNormals[f3] * weight;
            index = normalOffset + indices[i++] * normalStride;
            normals[index++] += faceNormals[f1] * weight;
            normals[index++] += faceNormals[f2] * weight;
            normals[index] += faceNormals[f3] * weight;
            index = normalOffset + indices[i++] * normalStride;
            normals[index++] += faceNormals[f1] * weight;
            normals[index++] += faceNormals[f2] * weight;
            normals[index] += faceNormals[f3] * weight;
            f1 += 3;
            f2 += 3;
            f3 += 3;
        }
        v1 = normalOffset;
        while (v1 < lenV) {
            var vx = normals[v1];
            var vy = normals[v1 + 1];
            var vz = normals[v1 + 2];
            var d = 1.0 / Math.sqrt(vx * vx + vy * vy + vz * vz);
            normals[v1] = vx * d;
            normals[v1 + 1] = vy * d;
            normals[v1 + 2] = vz * d;
            v1 += normalStride;
        }
        return normals;
    }
    function createVertexTangents(indices, positions, uvs, useFaceWeights) {
        if (useFaceWeights === void 0) { useFaceWeights = false; }
        var faceTangentsResult = createFaceTangents(indices, positions, uvs, useFaceWeights);
        var faceWeights = faceTangentsResult.faceWeights;
        var faceTangents = faceTangentsResult.faceTangents;
        var i = 0;
        var lenV = positions.length;
        var tangentStride = 3;
        var tangentOffset = 0;
        var target = new Array(lenV);
        i = tangentOffset;
        while (i < lenV) {
            target[i] = 0.0;
            target[i + 1] = 0.0;
            target[i + 2] = 0.0;
            i += tangentStride;
        }
        var k = 0;
        var lenI = indices.length;
        var index = 0;
        var weight = 0;
        var f1 = 0, f2 = 1, f3 = 2;
        i = 0;
        while (i < lenI) {
            weight = useFaceWeights ? faceWeights[k++] : 1;
            index = tangentOffset + indices[i++] * tangentStride;
            target[index++] += faceTangents[f1] * weight;
            target[index++] += faceTangents[f2] * weight;
            target[index] += faceTangents[f3] * weight;
            index = tangentOffset + indices[i++] * tangentStride;
            target[index++] += faceTangents[f1] * weight;
            target[index++] += faceTangents[f2] * weight;
            target[index] += faceTangents[f3] * weight;
            index = tangentOffset + indices[i++] * tangentStride;
            target[index++] += faceTangents[f1] * weight;
            target[index++] += faceTangents[f2] * weight;
            target[index] += faceTangents[f3] * weight;
            f1 += 3;
            f2 += 3;
            f3 += 3;
        }
        i = tangentOffset;
        while (i < lenV) {
            var vx = target[i];
            var vy = target[i + 1];
            var vz = target[i + 2];
            var d = 1.0 / Math.sqrt(vx * vx + vy * vy + vz * vz);
            target[i] = vx * d;
            target[i + 1] = vy * d;
            target[i + 2] = vz * d;
            i += tangentStride;
        }
        return target;
    }
    function createFaceTangents(indices, positions, uvs, useFaceWeights) {
        if (useFaceWeights === void 0) { useFaceWeights = false; }
        var i = 0, k = 0;
        var index1 = 0, index2 = 0, index3 = 0;
        var len = indices.length;
        var ui = 0, vi = 0;
        var v0 = 0;
        var dv1 = 0, dv2 = 0;
        var denom = 0;
        var x0 = 0, y0 = 0, z0 = 0;
        var dx1 = 0, dy1 = 0, dz1 = 0;
        var dx2 = 0, dy2 = 0, dz2 = 0;
        var cx = 0, cy = 0, cz = 0;
        var posStride = 3;
        var posOffset = 0;
        var texStride = 2;
        var texOffset = 0;
        var faceTangents = new Array(indices.length);
        var faceWeights = [];
        while (i < len) {
            index1 = indices[i];
            index2 = indices[i + 1];
            index3 = indices[i + 2];
            ui = texOffset + index1 * texStride + 1;
            v0 = uvs[ui];
            ui = texOffset + index2 * texStride + 1;
            dv1 = uvs[ui] - v0;
            ui = texOffset + index3 * texStride + 1;
            dv2 = uvs[ui] - v0;
            vi = posOffset + index1 * posStride;
            x0 = positions[vi];
            y0 = positions[vi + 1];
            z0 = positions[vi + 2];
            vi = posOffset + index2 * posStride;
            dx1 = positions[vi] - x0;
            dy1 = positions[vi + 1] - y0;
            dz1 = positions[vi + 2] - z0;
            vi = posOffset + index3 * posStride;
            dx2 = positions[vi] - x0;
            dy2 = positions[vi + 1] - y0;
            dz2 = positions[vi + 2] - z0;
            cx = dv2 * dx1 - dv1 * dx2;
            cy = dv2 * dy1 - dv1 * dy2;
            cz = dv2 * dz1 - dv1 * dz2;
            denom = Math.sqrt(cx * cx + cy * cy + cz * cz);
            if (useFaceWeights) {
                var w = denom * 10000;
                if (w < 1)
                    w = 1;
                faceWeights[k++] = w;
            }
            denom = 1 / denom;
            faceTangents[i++] = denom * cx;
            faceTangents[i++] = denom * cy;
            faceTangents[i++] = denom * cz;
        }
        return { faceTangents: faceTangents, faceWeights: faceWeights };
    }
    function createFaceNormals(indices, positions, useFaceWeights) {
        if (useFaceWeights === void 0) { useFaceWeights = false; }
        var i = 0, j = 0, k = 0;
        var index = 0;
        var len = indices.length;
        var x1 = 0, x2 = 0, x3 = 0;
        var y1 = 0, y2 = 0, y3 = 0;
        var z1 = 0, z2 = 0, z3 = 0;
        var dx1 = 0, dy1 = 0, dz1 = 0;
        var dx2 = 0, dy2 = 0, dz2 = 0;
        var cx = 0, cy = 0, cz = 0;
        var d = 0;
        var posStride = 3;
        var faceNormals = new Array(len);
        var faceWeights = [];
        while (i < len) {
            index = indices[i++] * posStride;
            x1 = positions[index];
            y1 = positions[index + 1];
            z1 = positions[index + 2];
            index = indices[i++] * posStride;
            x2 = positions[index];
            y2 = positions[index + 1];
            z2 = positions[index + 2];
            index = indices[i++] * posStride;
            x3 = positions[index];
            y3 = positions[index + 1];
            z3 = positions[index + 2];
            dx1 = x3 - x1;
            dy1 = y3 - y1;
            dz1 = z3 - z1;
            dx2 = x2 - x1;
            dy2 = y2 - y1;
            dz2 = z2 - z1;
            cx = dz1 * dy2 - dy1 * dz2;
            cy = dx1 * dz2 - dz1 * dx2;
            cz = dy1 * dx2 - dx1 * dy2;
            d = Math.sqrt(cx * cx + cy * cy + cz * cz);
            if (useFaceWeights) {
                var w = d * 10000;
                if (w < 1)
                    w = 1;
                faceWeights[k++] = w;
            }
            d = 1 / d;
            faceNormals[j++] = cx * d;
            faceNormals[j++] = cy * d;
            faceNormals[j++] = cz * d;
        }
        return { faceNormals: faceNormals, faceWeights: faceWeights };
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 点几何体
     * @author feng 2017-01-11
     */
    var PointGeometry = /** @class */ (function (_super) {
        __extends(PointGeometry, _super);
        function PointGeometry() {
            var _this = _super.call(this) || this;
            _this._points = [];
            _this.addPoint(new PointInfo(new feng3d.Vector3D(0, 0, 0)));
            return _this;
        }
        /**
         * 添加点
         * @param point		点数据
         */
        PointGeometry.prototype.addPoint = function (point, needUpdateGeometry) {
            if (needUpdateGeometry === void 0) { needUpdateGeometry = true; }
            this._points.push(point);
            this.invalidateGeometry();
        };
        /**
         * 构建几何体
         */
        PointGeometry.prototype.buildGeometry = function () {
            var numPoints = this._points.length;
            var indices = [];
            var positionData = [];
            var normalData = [];
            var uvData = [];
            var colors = [];
            for (var i = 0; i < numPoints; i++) {
                var element = this._points[i];
                indices[i] = i;
                positionData.push(element.position.x, element.position.y, element.position.z);
                normalData.push(element.normal.x, element.normal.y, element.normal.z);
                uvData.push(element.uv.x, element.uv.y);
                colors.push(element.color.r, element.color.g, element.color.b, element.color.a);
            }
            this.positions = positionData;
            this.uvs = uvData;
            this.normals = normalData;
            this.indices = indices;
            this.setVAData("a_color", colors, 4);
        };
        /**
         * 获取线段数据
         * @param index 		线段索引
         * @return				线段数据
         */
        PointGeometry.prototype.getPoint = function (index) {
            if (index < this._points.length)
                return this._points[index];
            return null;
        };
        /**
         * 移除所有线段
         */
        PointGeometry.prototype.removeAllPoints = function () {
            this.points.length = 0;
            this.invalidateGeometry();
        };
        Object.defineProperty(PointGeometry.prototype, "points", {
            /**
             * 线段列表
             */
            get: function () {
                return this._points;
            },
            enumerable: true,
            configurable: true
        });
        return PointGeometry;
    }(feng3d.Geometry));
    feng3d.PointGeometry = PointGeometry;
    /**
     * 点信息
     * @author feng 2016-10-16
     */
    var PointInfo = /** @class */ (function () {
        /**
         * 创建点
         * @param position 坐标
         */
        function PointInfo(position, color, uv, normal) {
            if (position === void 0) { position = new feng3d.Vector3D(); }
            if (color === void 0) { color = new feng3d.Color(); }
            if (uv === void 0) { uv = new feng3d.Point(); }
            if (normal === void 0) { normal = new feng3d.Vector3D(0, 1, 0); }
            this.position = position;
            this.color = color;
            this.normal = normal;
            this.uv = uv;
        }
        return PointInfo;
    }());
    feng3d.PointInfo = PointInfo;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 线段组件
     * @author feng 2016-10-16
     */
    var SegmentGeometry = /** @class */ (function (_super) {
        __extends(SegmentGeometry, _super);
        function SegmentGeometry() {
            var _this = _super.call(this) || this;
            _this.segments_ = [];
            return _this;
        }
        /**
         * 添加线段
         * @param segment		            线段数据
         */
        SegmentGeometry.prototype.addSegment = function (segment) {
            this.segments_.push(segment);
            this.invalidateGeometry();
        };
        /**
         * 设置线段
         * @param segment		            线段数据
         * @param index		                线段索引
         */
        SegmentGeometry.prototype.setSegmentAt = function (segment, index) {
            this.segments_[index] = segment;
            this.invalidateGeometry();
        };
        /**
         * 更新几何体
         */
        SegmentGeometry.prototype.buildGeometry = function () {
            var segmentPositionStep = 6;
            var segmentColorStep = 8;
            var numSegments = this.segments_.length;
            var indices = [];
            var positionData = [];
            var colorData = [];
            for (var i = 0; i < numSegments; i++) {
                var element = this.segments_[i];
                indices.push(i * 2, i * 2 + 1);
                positionData.push(element.start.x, element.start.y, element.start.z, element.end.x, element.end.y, element.end.z);
                colorData.push(element.startColor.r, element.startColor.g, element.startColor.b, element.startColor.a, element.endColor.r, element.endColor.g, element.endColor.b, element.endColor.a);
            }
            this.setVAData("a_position", positionData, 3);
            this.setVAData("a_color", colorData, 4);
            this.indices = indices;
        };
        /**
         * 获取线段数据
         * @param index 		线段索引
         * @return				线段数据
         */
        SegmentGeometry.prototype.getSegment = function (index) {
            if (index < this.segments_.length)
                return this.segments_[index];
            return null;
        };
        /**
         * 移除所有线段
         */
        SegmentGeometry.prototype.removeAllSegments = function () {
            this.segments.length = 0;
            this.invalidateGeometry();
        };
        Object.defineProperty(SegmentGeometry.prototype, "segments", {
            /**
             * 线段列表
             */
            get: function () {
                return this.segments_;
            },
            enumerable: true,
            configurable: true
        });
        return SegmentGeometry;
    }(feng3d.Geometry));
    feng3d.SegmentGeometry = SegmentGeometry;
    /**
     * 线段
     * @author feng 2016-10-16
     */
    var Segment = /** @class */ (function () {
        /**
         * 创建线段
         * @param start 起点坐标
         * @param end 终点坐标
         * @param colorStart 起点颜色
         * @param colorEnd 终点颜色
         * @param thickness 线段厚度
         */
        function Segment(start, end, colorStart, colorEnd) {
            if (colorStart === void 0) { colorStart = new feng3d.Color(); }
            if (colorEnd === void 0) { colorEnd = new feng3d.Color(); }
            this.start = start;
            this.end = end;
            this.startColor = colorStart;
            this.endColor = colorEnd;
        }
        return Segment;
    }());
    feng3d.Segment = Segment;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 坐标系统类型
     * @author feng 2014-10-14
     */
    var CoordinateSystem = /** @class */ (function () {
        function CoordinateSystem() {
        }
        /**
         * 默认坐标系统，左手坐标系统
         */
        CoordinateSystem.LEFT_HANDED = 0;
        /**
         * 右手坐标系统
         */
        CoordinateSystem.RIGHT_HANDED = 1;
        return CoordinateSystem;
    }());
    feng3d.CoordinateSystem = CoordinateSystem;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 摄像机镜头
     * @author feng 2014-10-14
     */
    var LensBase = /** @class */ (function (_super) {
        __extends(LensBase, _super);
        /**
         * 创建一个摄像机镜头
         */
        function LensBase() {
            var _this = _super.call(this) || this;
            /**
             * 最近距离
             */
            _this._near = 0.3;
            /**
             * 最远距离
             */
            _this._far = 1000;
            /**
             * 视窗缩放比例(width/height)，在渲染器中设置
             */
            _this._aspectRatio = 1;
            _this._scissorRect = new feng3d.Rectangle();
            _this._viewPort = new feng3d.Rectangle();
            _this._frustumCorners = [];
            return _this;
        }
        Object.defineProperty(LensBase.prototype, "near", {
            get: function () {
                return this._near;
            },
            set: function (value) {
                if (this._near == value)
                    return;
                this._near = value;
                this.invalidateMatrix();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LensBase.prototype, "far", {
            get: function () {
                return this._far;
            },
            set: function (value) {
                if (this._far == value)
                    return;
                this._far = value;
                this.invalidateMatrix();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LensBase.prototype, "aspectRatio", {
            get: function () {
                return this._aspectRatio;
            },
            set: function (value) {
                if (this._aspectRatio == value)
                    return;
                this._aspectRatio = value;
                this.invalidateMatrix();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LensBase.prototype, "frustumCorners", {
            /**
             * Retrieves the corner points of the lens frustum.
             */
            get: function () {
                return this._frustumCorners;
            },
            set: function (frustumCorners) {
                this._frustumCorners = frustumCorners;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LensBase.prototype, "matrix", {
            /**
             * 投影矩阵
             */
            get: function () {
                if (!this._matrix) {
                    this._matrix = this.updateMatrix();
                }
                return this._matrix;
            },
            set: function (value) {
                this._matrix = value;
                this.dispatch("matrixChanged", this);
                this.invalidateMatrix();
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 场景坐标投影到屏幕坐标
         * @param point3d 场景坐标
         * @param v 屏幕坐标（输出）
         * @return 屏幕坐标
         */
        LensBase.prototype.project = function (point3d, v) {
            if (!v)
                v = new feng3d.Vector3D();
            this.matrix.transformVector(point3d, v);
            v.x = v.x / v.w;
            v.y = -v.y / v.w;
            //z is unaffected by transform
            v.z = point3d.z;
            return v;
        };
        Object.defineProperty(LensBase.prototype, "unprojectionMatrix", {
            /**
             * 投影逆矩阵
             */
            get: function () {
                if (!this._unprojection) {
                    this._unprojection = new feng3d.Matrix3D();
                    this._unprojection.copyFrom(this.matrix);
                    this._unprojection.invert();
                }
                return this._unprojection;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 投影矩阵失效
         */
        LensBase.prototype.invalidateMatrix = function () {
            this._matrix = null;
            this._unprojection = null;
            this.dispatch("matrixChanged", this);
        };
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], LensBase.prototype, "near", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], LensBase.prototype, "far", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], LensBase.prototype, "aspectRatio", null);
        return LensBase;
    }(feng3d.EventDispatcher));
    feng3d.LensBase = LensBase;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     *
     * @author feng 2015-5-28
     */
    var FreeMatrixLens = /** @class */ (function (_super) {
        __extends(FreeMatrixLens, _super);
        function FreeMatrixLens() {
            return _super.call(this) || this;
        }
        FreeMatrixLens.prototype.updateMatrix = function () {
            return new feng3d.Matrix3D();
        };
        /**
         * 屏幕坐标投影到摄像机空间坐标
         * @param nX 屏幕坐标X -1（左） -> 1（右）
         * @param nY 屏幕坐标Y -1（上） -> 1（下）
         * @param sZ 到屏幕的距离
         * @param v 场景坐标（输出）
         * @return 场景坐标
         */
        FreeMatrixLens.prototype.unproject = function (nX, nY, sZ, v) {
            return new feng3d.Vector3D();
        };
        return FreeMatrixLens;
    }(feng3d.LensBase));
    feng3d.FreeMatrixLens = FreeMatrixLens;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 透视摄像机镜头
     * @author feng 2014-10-14
     */
    var PerspectiveLens = /** @class */ (function (_super) {
        __extends(PerspectiveLens, _super);
        /**
         * 创建一个透视摄像机镜头
         * @param fieldOfView 视野
         * @param coordinateSystem 坐标系统类型
         */
        function PerspectiveLens(fieldOfView, coordinateSystem) {
            if (fieldOfView === void 0) { fieldOfView = 60; }
            if (coordinateSystem === void 0) { coordinateSystem = feng3d.CoordinateSystem.LEFT_HANDED; }
            var _this = _super.call(this) || this;
            _this.fieldOfView = fieldOfView;
            _this.coordinateSystem = coordinateSystem;
            return _this;
        }
        PerspectiveLens.prototype.fieldOfViewChange = function () {
            delete this._focalLength;
            this.invalidateMatrix();
        };
        PerspectiveLens.prototype.coordinateSystemChange = function () {
            this.invalidateMatrix();
        };
        Object.defineProperty(PerspectiveLens.prototype, "focalLength", {
            /**
             * 焦距
             */
            get: function () {
                if (!this._focalLength)
                    this._focalLength = 1 / Math.tan(this.fieldOfView * Math.PI / 360);
                return this._focalLength;
            },
            set: function (value) {
                if (value == this._focalLength)
                    return;
                this._focalLength = value;
                this.fieldOfView = Math.atan(1 / this._focalLength) * 360 / Math.PI;
            },
            enumerable: true,
            configurable: true
        });
        PerspectiveLens.prototype.unproject = function (nX, nY, sZ, v) {
            if (!v)
                v = new feng3d.Vector3D();
            v.x = nX;
            v.y = -nY;
            v.z = sZ;
            v.w = 1;
            v.x *= sZ;
            v.y *= sZ;
            this.unprojectionMatrix.transformVector(v, v);
            //z is unaffected by transform
            v.z = sZ;
            return v;
        };
        PerspectiveLens.prototype.updateMatrix = function () {
            var matrix = new feng3d.Matrix3D();
            var raw = matrix.rawData;
            this._focalLength = 1 / Math.tan(this.fieldOfView * Math.PI / 360);
            var _focalLengthInv = 1 / this._focalLength;
            this._yMax = this.near * _focalLengthInv;
            this._xMax = this._yMax * this.aspectRatio;
            var left, right, top, bottom;
            if (this._scissorRect.x == 0 && this._scissorRect.y == 0 && this._scissorRect.width == this._viewPort.width && this._scissorRect.height == this._viewPort.height) {
                // assume unscissored frustum
                left = -this._xMax;
                right = this._xMax;
                top = -this._yMax;
                bottom = this._yMax;
                // assume unscissored frustum
                raw[0] = this.near / this._xMax;
                raw[5] = this.near / this._yMax;
                raw[10] = this.far / (this.far - this.near);
                raw[11] = 1;
                raw[1] = raw[2] = raw[3] = raw[4] = raw[6] = raw[7] = raw[8] = raw[9] = raw[12] = raw[13] = raw[15] = 0;
                raw[14] = -this.near * raw[10];
            }
            else {
                // assume scissored frustum
                var xWidth = this._xMax * (this._viewPort.width / this._scissorRect.width);
                var yHgt = this._yMax * (this._viewPort.height / this._scissorRect.height);
                var center = this._xMax * (this._scissorRect.x * 2 - this._viewPort.width) / this._scissorRect.width + this._xMax;
                var middle = -this._yMax * (this._scissorRect.y * 2 - this._viewPort.height) / this._scissorRect.height - this._yMax;
                left = center - xWidth;
                right = center + xWidth;
                top = middle - yHgt;
                bottom = middle + yHgt;
                raw[0] = 2 * this.near / (right - left);
                raw[5] = 2 * this.near / (bottom - top);
                raw[8] = (right + left) / (right - left);
                raw[9] = (bottom + top) / (bottom - top);
                raw[10] = (this.far + this.near) / (this.far - this.near);
                raw[11] = 1;
                raw[1] = raw[2] = raw[3] = raw[4] = raw[6] = raw[7] = raw[12] = raw[13] = raw[15] = 0;
                raw[14] = -2 * this.far * this.near / (this.far - this.near);
            }
            // Switch projection transform from left to right handed.
            if (this.coordinateSystem == feng3d.CoordinateSystem.RIGHT_HANDED)
                raw[5] = -raw[5];
            var yMaxFar = this.far * _focalLengthInv;
            var xMaxFar = yMaxFar * this.aspectRatio;
            this._frustumCorners[0] = this._frustumCorners[9] = left;
            this._frustumCorners[3] = this._frustumCorners[6] = right;
            this._frustumCorners[1] = this._frustumCorners[4] = top;
            this._frustumCorners[7] = this._frustumCorners[10] = bottom;
            this._frustumCorners[12] = this._frustumCorners[21] = -xMaxFar;
            this._frustumCorners[15] = this._frustumCorners[18] = xMaxFar;
            this._frustumCorners[13] = this._frustumCorners[16] = -yMaxFar;
            this._frustumCorners[19] = this._frustumCorners[22] = yMaxFar;
            this._frustumCorners[2] = this._frustumCorners[5] = this._frustumCorners[8] = this._frustumCorners[11] = this.near;
            this._frustumCorners[14] = this._frustumCorners[17] = this._frustumCorners[20] = this._frustumCorners[23] = this.far;
            return matrix;
        };
        __decorate([
            feng3d.watch("fieldOfViewChange"),
            feng3d.serialize(),
            feng3d.oav()
        ], PerspectiveLens.prototype, "fieldOfView", void 0);
        __decorate([
            feng3d.watch("coordinateSystemChange"),
            feng3d.serialize(),
            feng3d.oav()
        ], PerspectiveLens.prototype, "coordinateSystem", void 0);
        return PerspectiveLens;
    }(feng3d.LensBase));
    feng3d.PerspectiveLens = PerspectiveLens;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 摄像机
     * @author feng 2016-08-16
     */
    var Camera = /** @class */ (function (_super) {
        __extends(Camera, _super);
        function Camera() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._viewProjection = new feng3d.Matrix3D();
            _this._viewProjectionDirty = true;
            _this._frustumPlanesDirty = true;
            _this._viewRect = new feng3d.Rectangle(0, 0, 1, 1);
            return _this;
        }
        Object.defineProperty(Camera.prototype, "viewRect", {
            /**
             * 视窗矩形
             */
            get: function () {
                return this._viewRect;
            },
            set: function (value) {
                this._viewRect = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "single", {
            get: function () { return true; },
            enumerable: true,
            configurable: true
        });
        /**
         * 创建一个摄像机
         */
        Camera.prototype.init = function (gameObject) {
            var _this = this;
            _super.prototype.init.call(this, gameObject);
            this.lens = this.lens || new feng3d.PerspectiveLens();
            this.gameObject.on("scenetransformChanged", this.onScenetransformChanged, this);
            this._viewProjectionDirty = true;
            this._frustumPlanesDirty = true;
            this._frustumPlanes = [];
            for (var i = 0; i < 6; ++i)
                this._frustumPlanes[i] = new feng3d.Plane3D();
            //
            this.createUniformData("u_projectionMatrix", function () { return _this._lens.matrix; });
            this.createUniformData("u_viewProjection", function () { return _this.viewProjection; });
            this.createUniformData("u_viewMatrix", function () { return _this.transform.worldToLocalMatrix; });
            this.createUniformData("u_cameraMatrix", function () { return _this.transform.localToWorldMatrix; });
            this.createUniformData("u_skyBoxSize", function () { return _this._lens.far / Math.sqrt(3); });
        };
        /**
         * 处理镜头变化事件
         */
        Camera.prototype.onLensMatrixChanged = function (event) {
            this._viewProjectionDirty = true;
            this._frustumPlanesDirty = true;
            this.dispatch(event.type, event.data);
        };
        Object.defineProperty(Camera.prototype, "lens", {
            /**
             * 镜头
             */
            get: function () {
                return this._lens;
            },
            set: function (value) {
                if (this._lens == value)
                    return;
                if (!value)
                    throw new Error("Lens cannot be null!");
                if (this._lens)
                    this._lens.off("matrixChanged", this.onLensMatrixChanged, this);
                this._lens = value;
                if (this._lens)
                    this._lens.on("matrixChanged", this.onLensMatrixChanged, this);
                this.dispatch("lensChanged", this);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "viewProjection", {
            /**
             * 场景投影矩阵，世界空间转投影空间
             */
            get: function () {
                if (this._viewProjectionDirty) {
                    //场景空间转摄像机空间
                    this._viewProjection.copyFrom(this.transform.worldToLocalMatrix);
                    //+摄像机空间转投影空间 = 场景空间转投影空间
                    this._viewProjection.append(this._lens.matrix);
                    this._viewProjectionDirty = false;
                }
                return this._viewProjection;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 处理场景变换改变事件
         */
        Camera.prototype.onScenetransformChanged = function () {
            this._viewProjectionDirty = true;
            this._frustumPlanesDirty = true;
        };
        /**
         * 获取鼠标射线（与鼠标重叠的摄像机射线）
         */
        Camera.prototype.getMouseRay3D = function () {
            return this.getRay3D(feng3d.windowEventProxy.clientX - this._viewRect.x, feng3d.windowEventProxy.clientY - this._viewRect.y);
        };
        /**
         * 获取与坐标重叠的射线
         * @param x view3D上的X坐标
         * @param y view3D上的X坐标
         * @return
         */
        Camera.prototype.getRay3D = function (x, y, ray3D) {
            //摄像机坐标
            var rayPosition = this.unproject(x, y, 0);
            //摄像机前方1处坐标
            var rayDirection = this.unproject(x, y, 1);
            //射线方向
            rayDirection.x = rayDirection.x - rayPosition.x;
            rayDirection.y = rayDirection.y - rayPosition.y;
            rayDirection.z = rayDirection.z - rayPosition.z;
            rayDirection.normalize();
            //定义射线
            ray3D = ray3D || new feng3d.Ray3D(rayPosition, rayDirection);
            return ray3D;
        };
        /**
         * 投影坐标（世界坐标转换为3D视图坐标）
         * @param point3d 世界坐标
         * @return 屏幕的绝对坐标
         */
        Camera.prototype.project = function (point3d) {
            var v = this.lens.project(this.transform.worldToLocalMatrix.transformVector(point3d));
            v.x = (v.x + 1.0) * this._viewRect.width / 2.0;
            v.y = (v.y + 1.0) * this._viewRect.height / 2.0;
            return v;
        };
        /**
         * 屏幕坐标投影到场景坐标
         * @param nX 屏幕坐标X ([0-width])
         * @param nY 屏幕坐标Y ([0-height])
         * @param sZ 到屏幕的距离
         * @param v 场景坐标（输出）
         * @return 场景坐标
         */
        Camera.prototype.unproject = function (sX, sY, sZ, v) {
            var gpuPos = this.screenToGpuPosition(new feng3d.Point(sX, sY));
            return this.transform.localToWorldMatrix.transformVector(this.lens.unproject(gpuPos.x, gpuPos.y, sZ, v), v);
        };
        /**
         * 屏幕坐标转GPU坐标
         * @param screenPos 屏幕坐标 (x:[0-width],y:[0-height])
         * @return GPU坐标 (x:[-1,1],y:[-1-1])
         */
        Camera.prototype.screenToGpuPosition = function (screenPos) {
            var gpuPos = new feng3d.Point();
            gpuPos.x = (screenPos.x * 2 - this._viewRect.width) / this._viewRect.width;
            gpuPos.y = (screenPos.y * 2 - this._viewRect.height) / this._viewRect.height;
            return gpuPos;
        };
        /**
         * 获取单位像素在指定深度映射的大小
         * @param   depth   深度
         */
        Camera.prototype.getScaleByDepth = function (depth) {
            var centerX = this._viewRect.width / 2;
            var centerY = this._viewRect.height / 2;
            var lt = this.unproject(centerX - 0.5, centerY - 0.5, depth);
            var rb = this.unproject(centerX + 0.5, centerY + 0.5, depth);
            var scale = lt.subtract(rb).length;
            return scale;
        };
        Object.defineProperty(Camera.prototype, "frustumPlanes", {
            /**
             * 视锥体面
             */
            get: function () {
                if (this._frustumPlanesDirty)
                    this.updateFrustum();
                return this._frustumPlanes;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 更新视锥体6个面，平面均朝向视锥体内部
         * @see http://www.linuxgraphics.cn/graphics/opengl_view_frustum_culling.html
         */
        Camera.prototype.updateFrustum = function () {
            var a, b, c;
            //var d :number;
            var c11, c12, c13, c14;
            var c21, c22, c23, c24;
            var c31, c32, c33, c34;
            var c41, c42, c43, c44;
            var p;
            var raw = feng3d.Matrix3D.RAW_DATA_CONTAINER;
            //长度倒数
            var invLen;
            this.viewProjection.copyRawDataTo(raw);
            c11 = raw[0];
            c12 = raw[4];
            c13 = raw[8];
            c14 = raw[12];
            c21 = raw[1];
            c22 = raw[5];
            c23 = raw[9];
            c24 = raw[13];
            c31 = raw[2];
            c32 = raw[6];
            c33 = raw[10];
            c34 = raw[14];
            c41 = raw[3];
            c42 = raw[7];
            c43 = raw[11];
            c44 = raw[15];
            // left plane
            p = this._frustumPlanes[0];
            a = c41 + c11;
            b = c42 + c12;
            c = c43 + c13;
            invLen = 1 / Math.sqrt(a * a + b * b + c * c);
            p.a = a * invLen;
            p.b = b * invLen;
            p.c = c * invLen;
            p.d = -(c44 + c14) * invLen;
            // right plane
            p = this._frustumPlanes[1];
            a = c41 - c11;
            b = c42 - c12;
            c = c43 - c13;
            invLen = 1 / Math.sqrt(a * a + b * b + c * c);
            p.a = a * invLen;
            p.b = b * invLen;
            p.c = c * invLen;
            p.d = (c14 - c44) * invLen;
            // bottom
            p = this._frustumPlanes[2];
            a = c41 + c21;
            b = c42 + c22;
            c = c43 + c23;
            invLen = 1 / Math.sqrt(a * a + b * b + c * c);
            p.a = a * invLen;
            p.b = b * invLen;
            p.c = c * invLen;
            p.d = -(c44 + c24) * invLen;
            // top
            p = this._frustumPlanes[3];
            a = c41 - c21;
            b = c42 - c22;
            c = c43 - c23;
            invLen = 1 / Math.sqrt(a * a + b * b + c * c);
            p.a = a * invLen;
            p.b = b * invLen;
            p.c = c * invLen;
            p.d = (c24 - c44) * invLen;
            // near
            p = this._frustumPlanes[4];
            a = c31;
            b = c32;
            c = c33;
            invLen = 1 / Math.sqrt(a * a + b * b + c * c);
            p.a = a * invLen;
            p.b = b * invLen;
            p.c = c * invLen;
            p.d = -c34 * invLen;
            // far
            p = this._frustumPlanes[5];
            a = c41 - c31;
            b = c42 - c32;
            c = c43 - c33;
            invLen = 1 / Math.sqrt(a * a + b * b + c * c);
            p.a = a * invLen;
            p.b = b * invLen;
            p.c = c * invLen;
            p.d = (c34 - c44) * invLen;
            this._frustumPlanesDirty = false;
        };
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], Camera.prototype, "lens", null);
        return Camera;
    }(feng3d.Component));
    feng3d.Camera = Camera;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    feng3d.bounding = {
        getboundingpoints: getboundingpoints,
        transform: transform,
        containsPoint: containsPoint,
        isInFrustum: isInFrustum,
        rayIntersection: rayIntersection,
    };
    function getboundingpoints(bounding) {
        var min = bounding.min;
        var max = bounding.max;
        return [
            new feng3d.Vector3D(min.x, min.y, min.z),
            new feng3d.Vector3D(max.x, min.y, min.z),
            new feng3d.Vector3D(min.x, max.y, min.z),
            new feng3d.Vector3D(min.x, min.y, max.z),
            new feng3d.Vector3D(min.x, max.y, max.z),
            new feng3d.Vector3D(max.x, min.y, max.z),
            new feng3d.Vector3D(max.x, max.y, min.z),
            new feng3d.Vector3D(max.x, max.y, max.z),
        ];
    }
    function transform(bounding, matrix, outbounding) {
        var points = getboundingpoints(bounding);
        for (var i = 0; i < points.length; i++) {
            matrix.transformVector(points[i], points[i]);
        }
        var newbounding = getboundingfrompoints(points, outbounding);
        return newbounding;
    }
    function getboundingfrompoints(points, outbounding) {
        var min = new feng3d.Vector3D(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        var max = new feng3d.Vector3D(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
        for (var i = 0; i < points.length; i++) {
            min.x = Math.min(min.x, points[i].x);
            min.y = Math.min(min.y, points[i].y);
            min.z = Math.min(min.z, points[i].z);
            //
            max.x = Math.max(max.x, points[i].x);
            max.y = Math.max(max.y, points[i].y);
            max.z = Math.max(max.z, points[i].z);
        }
        if (outbounding) {
            outbounding.min.x = min.x;
            outbounding.min.y = min.y;
            outbounding.min.z = min.z;
            outbounding.max.x = max.x;
            outbounding.max.y = max.y;
            outbounding.max.z = max.z;
            return outbounding;
        }
        return { min: min, max: max };
    }
    function containsPoint(bounding, position) {
        var center = bounding.min.add(bounding.max).scaleBy(0.5);
        var halfExtents = bounding.max.subtract(bounding.min).scaleBy(0.5);
        var px = position.x - center.x, py = position.y - center.y, pz = position.z - center.z;
        return px <= halfExtents.x && px >= -halfExtents.x && py <= halfExtents.y && py >= -halfExtents.y && pz <= halfExtents.z && pz >= -halfExtents.z;
    }
    /**
     * 测试轴对其包围盒是否出现在摄像机视锥体内
     * @param planes 		视锥体面向量
     * @return 				true：出现在视锥体内
     * @see me.feng3d.cameras.Camera3D.updateFrustum()
     */
    function isInFrustum(bounding, planes, numPlanes) {
        if (!bounding)
            return false;
        var center = bounding.min.add(bounding.max).scaleBy(0.5);
        var halfExtents = bounding.max.subtract(bounding.min).scaleBy(0.5);
        for (var i = 0; i < numPlanes; ++i) {
            var plane = planes[i];
            var a = plane.a;
            var b = plane.b;
            var c = plane.c;
            //最可能出现在平面内的点，即距离最可能大于0的点 (如果这个点都不在平面内的话，其他的点肯定会不在平面内)
            var flippedExtentX = a < 0 ? -halfExtents.x : halfExtents.x;
            var flippedExtentY = b < 0 ? -halfExtents.y : halfExtents.y;
            var flippedExtentZ = c < 0 ? -halfExtents.z : halfExtents.z;
            var projDist = a * (center.x + flippedExtentX) + b * (center.y + flippedExtentY) + c * (center.z + flippedExtentZ) - plane.d;
            //小于0表示包围盒8个点都在平面内，同时就表面不存在点在视锥体内。注：视锥体6个平面朝内
            if (projDist < 0)
                return false;
        }
        return true;
    }
    function rayIntersection(bounding, ray3D, targetNormal) {
        var position = ray3D.position;
        var direction = ray3D.direction;
        if (containsPoint(bounding, position))
            return 0;
        var center = bounding.min.add(bounding.max).scaleBy(0.5);
        var halfExtents = bounding.max.subtract(bounding.min).scaleBy(0.5);
        var px = position.x - center.x, py = position.y - center.y, pz = position.z - center.z;
        var vx = direction.x, vy = direction.y, vz = direction.z;
        var ix, iy, iz;
        var rayEntryDistance = -1;
        // ray-plane tests
        var intersects = false;
        if (vx < 0) {
            rayEntryDistance = (halfExtents.x - px) / vx;
            if (rayEntryDistance > 0) {
                iy = py + rayEntryDistance * vy;
                iz = pz + rayEntryDistance * vz;
                if (iy > -halfExtents.y && iy < halfExtents.y && iz > -halfExtents.z && iz < halfExtents.z) {
                    targetNormal.x = 1;
                    targetNormal.y = 0;
                    targetNormal.z = 0;
                    intersects = true;
                }
            }
        }
        if (!intersects && vx > 0) {
            rayEntryDistance = (-halfExtents.x - px) / vx;
            if (rayEntryDistance > 0) {
                iy = py + rayEntryDistance * vy;
                iz = pz + rayEntryDistance * vz;
                if (iy > -halfExtents.y && iy < halfExtents.y && iz > -halfExtents.z && iz < halfExtents.z) {
                    targetNormal.x = -1;
                    targetNormal.y = 0;
                    targetNormal.z = 0;
                    intersects = true;
                }
            }
        }
        if (!intersects && vy < 0) {
            rayEntryDistance = (halfExtents.y - py) / vy;
            if (rayEntryDistance > 0) {
                ix = px + rayEntryDistance * vx;
                iz = pz + rayEntryDistance * vz;
                if (ix > -halfExtents.x && ix < halfExtents.x && iz > -halfExtents.z && iz < halfExtents.z) {
                    targetNormal.x = 0;
                    targetNormal.y = 1;
                    targetNormal.z = 0;
                    intersects = true;
                }
            }
        }
        if (!intersects && vy > 0) {
            rayEntryDistance = (-halfExtents.y - py) / vy;
            if (rayEntryDistance > 0) {
                ix = px + rayEntryDistance * vx;
                iz = pz + rayEntryDistance * vz;
                if (ix > -halfExtents.x && ix < halfExtents.x && iz > -halfExtents.z && iz < halfExtents.z) {
                    targetNormal.x = 0;
                    targetNormal.y = -1;
                    targetNormal.z = 0;
                    intersects = true;
                }
            }
        }
        if (!intersects && vz < 0) {
            rayEntryDistance = (halfExtents.z - pz) / vz;
            if (rayEntryDistance > 0) {
                ix = px + rayEntryDistance * vx;
                iy = py + rayEntryDistance * vy;
                if (iy > -halfExtents.y && iy < halfExtents.y && ix > -halfExtents.x && ix < halfExtents.x) {
                    targetNormal.x = 0;
                    targetNormal.y = 0;
                    targetNormal.z = 1;
                    intersects = true;
                }
            }
        }
        if (!intersects && vz > 0) {
            rayEntryDistance = (-halfExtents.z - pz) / vz;
            if (rayEntryDistance > 0) {
                ix = px + rayEntryDistance * vx;
                iy = py + rayEntryDistance * vy;
                if (iy > -halfExtents.y && iy < halfExtents.y && ix > -halfExtents.x && ix < halfExtents.x) {
                    targetNormal.x = 0;
                    targetNormal.y = 0;
                    targetNormal.z = -1;
                    intersects = true;
                }
            }
        }
        return intersects ? rayEntryDistance : -1;
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 立方体几何体
     * @author feng 2016-09-12
     */
    var PlaneGeometry = /** @class */ (function (_super) {
        __extends(PlaneGeometry, _super);
        /**
         * 创建平面几何体
         * @param width 宽度
         * @param height 高度
         * @param segmentsW 横向分割数
         * @param segmentsH 纵向分割数
         * @param yUp 正面朝向 true:Y+ false:Z+
         */
        function PlaneGeometry(width, height, segmentsW, segmentsH, yUp) {
            if (width === void 0) { width = 1; }
            if (height === void 0) { height = 1; }
            if (segmentsW === void 0) { segmentsW = 1; }
            if (segmentsH === void 0) { segmentsH = 1; }
            if (yUp === void 0) { yUp = true; }
            var _this = _super.call(this) || this;
            _this._width = 1;
            _this._height = 1;
            _this._segmentsW = 1;
            _this._segmentsH = 1;
            _this._yUp = true;
            _this.name = "Plane";
            _this.width = width;
            _this.height = height;
            _this.segmentsW = segmentsW;
            _this.segmentsH = segmentsH;
            _this.yUp = yUp;
            return _this;
        }
        Object.defineProperty(PlaneGeometry.prototype, "width", {
            get: function () {
                return this._width;
            },
            set: function (value) {
                if (this._width == value)
                    return;
                this._width = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PlaneGeometry.prototype, "height", {
            get: function () {
                return this._height;
            },
            set: function (value) {
                if (this._height == value)
                    return;
                this._height = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PlaneGeometry.prototype, "segmentsW", {
            get: function () {
                return this._segmentsW;
            },
            set: function (value) {
                if (this._segmentsW == value)
                    return;
                this._segmentsW = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PlaneGeometry.prototype, "segmentsH", {
            get: function () {
                return this._segmentsH;
            },
            set: function (value) {
                if (this._segmentsH == value)
                    return;
                this._segmentsH = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PlaneGeometry.prototype, "yUp", {
            get: function () {
                return this._yUp;
            },
            set: function (value) {
                if (this._yUp == value)
                    return;
                this._yUp = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 构建几何体数据
         */
        PlaneGeometry.prototype.buildGeometry = function () {
            var vertexPositionData = this.buildPosition();
            this.setVAData("a_position", vertexPositionData, 3);
            var vertexNormalData = this.buildNormal();
            this.setVAData("a_normal", vertexNormalData, 3);
            var vertexTangentData = this.buildTangent();
            this.setVAData("a_tangent", vertexTangentData, 3);
            var uvData = this.buildUVs();
            this.setVAData("a_uv", uvData, 2);
            var indices = this.buildIndices();
            this.indices = indices;
        };
        /**
         * 构建顶点坐标
         * @param this.width 宽度
         * @param this.height 高度
         * @param this.segmentsW 横向分割数
         * @param this.segmentsH 纵向分割数
         * @param this.yUp 正面朝向 true:Y+ false:Z+
         */
        PlaneGeometry.prototype.buildPosition = function () {
            var vertexPositionData = [];
            var x, y;
            var positionIndex = 0;
            for (var yi = 0; yi <= this.segmentsH; ++yi) {
                for (var xi = 0; xi <= this.segmentsW; ++xi) {
                    x = (xi / this.segmentsW - .5) * this.width;
                    y = (yi / this.segmentsH - .5) * this.height;
                    //设置坐标数据
                    vertexPositionData[positionIndex++] = x;
                    if (this.yUp) {
                        vertexPositionData[positionIndex++] = 0;
                        vertexPositionData[positionIndex++] = y;
                    }
                    else {
                        vertexPositionData[positionIndex++] = y;
                        vertexPositionData[positionIndex++] = 0;
                    }
                }
            }
            return vertexPositionData;
        };
        /**
         * 构建顶点法线
         * @param this.segmentsW 横向分割数
         * @param this.segmentsH 纵向分割数
         * @param this.yUp 正面朝向 true:Y+ false:Z+
         */
        PlaneGeometry.prototype.buildNormal = function () {
            var vertexNormalData = [];
            var normalIndex = 0;
            for (var yi = 0; yi <= this.segmentsH; ++yi) {
                for (var xi = 0; xi <= this.segmentsW; ++xi) {
                    //设置法线数据
                    vertexNormalData[normalIndex++] = 0;
                    if (this.yUp) {
                        vertexNormalData[normalIndex++] = 1;
                        vertexNormalData[normalIndex++] = 0;
                    }
                    else {
                        vertexNormalData[normalIndex++] = 0;
                        vertexNormalData[normalIndex++] = 1;
                    }
                }
            }
            return vertexNormalData;
        };
        /**
         * 构建顶点切线
         * @param this.segmentsW 横向分割数
         * @param this.segmentsH 纵向分割数
         * @param this.yUp 正面朝向 true:Y+ false:Z+
         */
        PlaneGeometry.prototype.buildTangent = function () {
            var vertexTangentData = [];
            var tangentIndex = 0;
            for (var yi = 0; yi <= this.segmentsH; ++yi) {
                for (var xi = 0; xi <= this.segmentsW; ++xi) {
                    if (this.yUp) {
                        vertexTangentData[tangentIndex++] = 1;
                        vertexTangentData[tangentIndex++] = 0;
                        vertexTangentData[tangentIndex++] = 0;
                    }
                    else {
                        vertexTangentData[tangentIndex++] = -1;
                        vertexTangentData[tangentIndex++] = 0;
                        vertexTangentData[tangentIndex++] = 0;
                    }
                }
            }
            return vertexTangentData;
        };
        /**
         * 构建顶点索引
         * @param this.segmentsW 横向分割数
         * @param this.segmentsH 纵向分割数
         * @param this.yUp 正面朝向 true:Y+ false:Z+
         */
        PlaneGeometry.prototype.buildIndices = function () {
            var indices = [];
            var tw = this.segmentsW + 1;
            var numIndices = 0;
            var base;
            for (var yi = 0; yi <= this.segmentsH; ++yi) {
                for (var xi = 0; xi <= this.segmentsW; ++xi) {
                    //生成索引数据
                    if (xi != this.segmentsW && yi != this.segmentsH) {
                        base = xi + yi * tw;
                        if (this.yUp) {
                            indices[numIndices++] = base;
                            indices[numIndices++] = base + tw;
                            indices[numIndices++] = base + tw + 1;
                            indices[numIndices++] = base;
                            indices[numIndices++] = base + tw + 1;
                            indices[numIndices++] = base + 1;
                        }
                        else {
                            indices[numIndices++] = base;
                            indices[numIndices++] = base + tw + 1;
                            indices[numIndices++] = base + tw;
                            indices[numIndices++] = base;
                            indices[numIndices++] = base + 1;
                            indices[numIndices++] = base + tw + 1;
                        }
                    }
                }
            }
            return indices;
        };
        /**
         * 构建uv
         * @param this.segmentsW 横向分割数
         * @param this.segmentsH 纵向分割数
         */
        PlaneGeometry.prototype.buildUVs = function () {
            var data = [];
            var index = 0;
            for (var yi = 0; yi <= this.segmentsH; ++yi) {
                for (var xi = 0; xi <= this.segmentsW; ++xi) {
                    if (this.yUp) {
                        data[index++] = xi / this.segmentsW;
                        data[index++] = 1 - yi / this.segmentsH;
                    }
                    else {
                        data[index++] = 1 - xi / this.segmentsW;
                        data[index++] = 1 - yi / this.segmentsH;
                    }
                }
            }
            return data;
        };
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], PlaneGeometry.prototype, "width", null);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], PlaneGeometry.prototype, "height", null);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], PlaneGeometry.prototype, "segmentsW", null);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], PlaneGeometry.prototype, "segmentsH", null);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], PlaneGeometry.prototype, "yUp", null);
        return PlaneGeometry;
    }(feng3d.Geometry));
    feng3d.PlaneGeometry = PlaneGeometry;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 立方体几何体
     * @author feng 2016-09-12
     */
    var CubeGeometry = /** @class */ (function (_super) {
        __extends(CubeGeometry, _super);
        /**
         * 创建立方几何体
         * @param   width           宽度，默认为1。
         * @param   height          高度，默认为1。
         * @param   depth           深度，默认为1。
         * @param   segmentsW       宽度方向分割，默认为1。
         * @param   segmentsH       高度方向分割，默认为1。
         * @param   segmentsD       深度方向分割，默认为1。
         * @param   tile6           是否为6块贴图，默认true。
         */
        function CubeGeometry(width, height, depth, segmentsW, segmentsH, segmentsD, tile6) {
            if (width === void 0) { width = 1; }
            if (height === void 0) { height = 1; }
            if (depth === void 0) { depth = 1; }
            if (segmentsW === void 0) { segmentsW = 1; }
            if (segmentsH === void 0) { segmentsH = 1; }
            if (segmentsD === void 0) { segmentsD = 1; }
            if (tile6 === void 0) { tile6 = true; }
            var _this = _super.call(this) || this;
            _this._width = 1;
            _this._height = 1;
            _this._depth = 1;
            _this._segmentsW = 1;
            _this._segmentsH = 1;
            _this._segmentsD = 1;
            _this._tile6 = true;
            _this.name = "Cube";
            _this.width = width;
            _this.height = height;
            _this.depth = depth;
            _this.segmentsW = segmentsW;
            _this.segmentsH = segmentsH;
            _this.segmentsD = segmentsD;
            _this.tile6 = tile6;
            return _this;
        }
        Object.defineProperty(CubeGeometry.prototype, "width", {
            get: function () {
                return this._width;
            },
            set: function (value) {
                if (this._width == value)
                    return;
                this._width = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CubeGeometry.prototype, "height", {
            get: function () {
                return this._height;
            },
            set: function (value) {
                if (this._height == value)
                    return;
                this._height = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CubeGeometry.prototype, "depth", {
            get: function () {
                return this._depth;
            },
            set: function (value) {
                if (this._depth == value)
                    return;
                this._depth = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CubeGeometry.prototype, "segmentsW", {
            get: function () {
                return this._segmentsW;
            },
            set: function (value) {
                if (this._segmentsW == value)
                    return;
                this._segmentsW = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CubeGeometry.prototype, "segmentsH", {
            get: function () {
                return this._segmentsH;
            },
            set: function (value) {
                if (this._segmentsH == value)
                    return;
                this._segmentsH = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CubeGeometry.prototype, "segmentsD", {
            get: function () {
                return this._segmentsD;
            },
            set: function (value) {
                if (this._segmentsD == value)
                    return;
                this._segmentsD = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CubeGeometry.prototype, "tile6", {
            get: function () {
                return this._tile6;
            },
            set: function (value) {
                if (this._tile6 == value)
                    return;
                this._tile6 = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        CubeGeometry.prototype.buildGeometry = function () {
            var vertexPositionData = this.buildPosition();
            this.setVAData("a_position", vertexPositionData, 3);
            var vertexNormalData = this.buildNormal();
            this.setVAData("a_normal", vertexNormalData, 3);
            var vertexTangentData = this.buildTangent();
            this.setVAData("a_tangent", vertexTangentData, 3);
            var uvData = this.buildUVs();
            this.setVAData("a_uv", uvData, 2);
            var indices = this.buildIndices();
            this.indices = indices;
        };
        /**
         * 构建坐标
         * @param   width           宽度
         * @param   height          高度
         * @param   depth           深度
         * @param   segmentsW       宽度方向分割
         * @param   segmentsH       高度方向分割
         * @param   segmentsD       深度方向分割
         */
        CubeGeometry.prototype.buildPosition = function () {
            var vertexPositionData = [];
            var i, j;
            var hw, hh, hd; // halves
            var dw, dh, dd; // deltas
            var outer_pos;
            // Indices
            var positionIndex = 0;
            // half cube dimensions
            hw = this.width / 2;
            hh = this.height / 2;
            hd = this.depth / 2;
            // Segment dimensions
            dw = this.width / this.segmentsW;
            dh = this.height / this.segmentsH;
            dd = this.depth / this.segmentsD;
            for (i = 0; i <= this.segmentsW; i++) {
                outer_pos = -hw + i * dw;
                for (j = 0; j <= this.segmentsH; j++) {
                    // front
                    vertexPositionData[positionIndex++] = outer_pos;
                    vertexPositionData[positionIndex++] = -hh + j * dh;
                    vertexPositionData[positionIndex++] = -hd;
                    // back
                    vertexPositionData[positionIndex++] = outer_pos;
                    vertexPositionData[positionIndex++] = -hh + j * dh;
                    vertexPositionData[positionIndex++] = hd;
                }
            }
            for (i = 0; i <= this.segmentsW; i++) {
                outer_pos = -hw + i * dw;
                for (j = 0; j <= this.segmentsD; j++) {
                    // top
                    vertexPositionData[positionIndex++] = outer_pos;
                    vertexPositionData[positionIndex++] = hh;
                    vertexPositionData[positionIndex++] = -hd + j * dd;
                    // bottom
                    vertexPositionData[positionIndex++] = outer_pos;
                    vertexPositionData[positionIndex++] = -hh;
                    vertexPositionData[positionIndex++] = -hd + j * dd;
                }
            }
            for (i = 0; i <= this.segmentsD; i++) {
                outer_pos = hd - i * dd;
                for (j = 0; j <= this.segmentsH; j++) {
                    // left
                    vertexPositionData[positionIndex++] = -hw;
                    vertexPositionData[positionIndex++] = -hh + j * dh;
                    vertexPositionData[positionIndex++] = outer_pos;
                    // right
                    vertexPositionData[positionIndex++] = hw;
                    vertexPositionData[positionIndex++] = -hh + j * dh;
                    vertexPositionData[positionIndex++] = outer_pos;
                }
            }
            return vertexPositionData;
        };
        /**
         * 构建法线
         * @param   segmentsW       宽度方向分割
         * @param   segmentsH       高度方向分割
         * @param   segmentsD       深度方向分割
         */
        CubeGeometry.prototype.buildNormal = function () {
            var vertexNormalData = [];
            var i, j;
            // Indices
            var normalIndex = 0;
            for (i = 0; i <= this.segmentsW; i++) {
                for (j = 0; j <= this.segmentsH; j++) {
                    // front
                    vertexNormalData[normalIndex++] = 0;
                    vertexNormalData[normalIndex++] = 0;
                    vertexNormalData[normalIndex++] = -1;
                    // back
                    vertexNormalData[normalIndex++] = 0;
                    vertexNormalData[normalIndex++] = 0;
                    vertexNormalData[normalIndex++] = 1;
                }
            }
            for (i = 0; i <= this.segmentsW; i++) {
                for (j = 0; j <= this.segmentsD; j++) {
                    // top
                    vertexNormalData[normalIndex++] = 0;
                    vertexNormalData[normalIndex++] = 1;
                    vertexNormalData[normalIndex++] = 0;
                    // bottom
                    vertexNormalData[normalIndex++] = 0;
                    vertexNormalData[normalIndex++] = -1;
                    vertexNormalData[normalIndex++] = 0;
                }
            }
            for (i = 0; i <= this.segmentsD; i++) {
                for (j = 0; j <= this.segmentsH; j++) {
                    // left
                    vertexNormalData[normalIndex++] = -1;
                    vertexNormalData[normalIndex++] = 0;
                    vertexNormalData[normalIndex++] = 0;
                    // right
                    vertexNormalData[normalIndex++] = 1;
                    vertexNormalData[normalIndex++] = 0;
                    vertexNormalData[normalIndex++] = 0;
                }
            }
            return vertexNormalData;
        };
        /**
         * 构建切线
         * @param   segmentsW       宽度方向分割
         * @param   segmentsH       高度方向分割
         * @param   segmentsD       深度方向分割
         */
        CubeGeometry.prototype.buildTangent = function () {
            var vertexTangentData = [];
            var i, j;
            // Indices
            var tangentIndex = 0;
            for (i = 0; i <= this.segmentsW; i++) {
                for (j = 0; j <= this.segmentsH; j++) {
                    // front
                    vertexTangentData[tangentIndex++] = 1;
                    vertexTangentData[tangentIndex++] = 0;
                    vertexTangentData[tangentIndex++] = 0;
                    // back
                    vertexTangentData[tangentIndex++] = -1;
                    vertexTangentData[tangentIndex++] = 0;
                    vertexTangentData[tangentIndex++] = 0;
                }
            }
            for (i = 0; i <= this.segmentsW; i++) {
                for (j = 0; j <= this.segmentsD; j++) {
                    // top
                    vertexTangentData[tangentIndex++] = 1;
                    vertexTangentData[tangentIndex++] = 0;
                    vertexTangentData[tangentIndex++] = 0;
                    // bottom
                    vertexTangentData[tangentIndex++] = 1;
                    vertexTangentData[tangentIndex++] = 0;
                    vertexTangentData[tangentIndex++] = 0;
                }
            }
            for (i = 0; i <= this.segmentsD; i++) {
                for (j = 0; j <= this.segmentsH; j++) {
                    // left
                    vertexTangentData[tangentIndex++] = 0;
                    vertexTangentData[tangentIndex++] = 0;
                    vertexTangentData[tangentIndex++] = -1;
                    // right
                    vertexTangentData[tangentIndex++] = 0;
                    vertexTangentData[tangentIndex++] = 0;
                    vertexTangentData[tangentIndex++] = 1;
                }
            }
            return vertexTangentData;
        };
        /**
         * 构建索引
         * @param   segmentsW       宽度方向分割
         * @param   segmentsH       高度方向分割
         * @param   segmentsD       深度方向分割
         */
        CubeGeometry.prototype.buildIndices = function () {
            var indices = [];
            var tl, tr, bl, br;
            var i, j, inc = 0;
            var fidx = 0;
            for (i = 0; i <= this.segmentsW; i++) {
                for (j = 0; j <= this.segmentsH; j++) {
                    // front
                    // back
                    if (i && j) {
                        tl = 2 * ((i - 1) * (this.segmentsH + 1) + (j - 1));
                        tr = 2 * (i * (this.segmentsH + 1) + (j - 1));
                        bl = tl + 2;
                        br = tr + 2;
                        indices[fidx++] = tl;
                        indices[fidx++] = bl;
                        indices[fidx++] = br;
                        indices[fidx++] = tl;
                        indices[fidx++] = br;
                        indices[fidx++] = tr;
                        indices[fidx++] = tr + 1;
                        indices[fidx++] = br + 1;
                        indices[fidx++] = bl + 1;
                        indices[fidx++] = tr + 1;
                        indices[fidx++] = bl + 1;
                        indices[fidx++] = tl + 1;
                    }
                }
            }
            inc += 2 * (this.segmentsW + 1) * (this.segmentsH + 1);
            for (i = 0; i <= this.segmentsW; i++) {
                for (j = 0; j <= this.segmentsD; j++) {
                    // top
                    // bottom
                    if (i && j) {
                        tl = inc + 2 * ((i - 1) * (this.segmentsD + 1) + (j - 1));
                        tr = inc + 2 * (i * (this.segmentsD + 1) + (j - 1));
                        bl = tl + 2;
                        br = tr + 2;
                        indices[fidx++] = tl;
                        indices[fidx++] = bl;
                        indices[fidx++] = br;
                        indices[fidx++] = tl;
                        indices[fidx++] = br;
                        indices[fidx++] = tr;
                        indices[fidx++] = tr + 1;
                        indices[fidx++] = br + 1;
                        indices[fidx++] = bl + 1;
                        indices[fidx++] = tr + 1;
                        indices[fidx++] = bl + 1;
                        indices[fidx++] = tl + 1;
                    }
                }
            }
            inc += 2 * (this.segmentsW + 1) * (this.segmentsD + 1);
            for (i = 0; i <= this.segmentsD; i++) {
                for (j = 0; j <= this.segmentsH; j++) {
                    // left
                    // right
                    if (i && j) {
                        tl = inc + 2 * ((i - 1) * (this.segmentsH + 1) + (j - 1));
                        tr = inc + 2 * (i * (this.segmentsH + 1) + (j - 1));
                        bl = tl + 2;
                        br = tr + 2;
                        indices[fidx++] = tl;
                        indices[fidx++] = bl;
                        indices[fidx++] = br;
                        indices[fidx++] = tl;
                        indices[fidx++] = br;
                        indices[fidx++] = tr;
                        indices[fidx++] = tr + 1;
                        indices[fidx++] = br + 1;
                        indices[fidx++] = bl + 1;
                        indices[fidx++] = tr + 1;
                        indices[fidx++] = bl + 1;
                        indices[fidx++] = tl + 1;
                    }
                }
            }
            return indices;
        };
        /**
         * 构建uv
         * @param   segmentsW       宽度方向分割
         * @param   segmentsH       高度方向分割
         * @param   segmentsD       深度方向分割
         * @param   tile6           是否为6块贴图
         */
        CubeGeometry.prototype.buildUVs = function () {
            var i, j, uidx;
            var data = [];
            var u_tile_dim, v_tile_dim;
            var u_tile_step, v_tile_step;
            var tl0u, tl0v;
            var tl1u, tl1v;
            var du, dv;
            if (this.tile6) {
                u_tile_dim = u_tile_step = 1 / 3;
                v_tile_dim = v_tile_step = 1 / 2;
            }
            else {
                u_tile_dim = v_tile_dim = 1;
                u_tile_step = v_tile_step = 0;
            }
            // Create planes two and two, the same way that they were
            // constructed in the this.buildGeometry() function. First calculate
            // the top-left UV coordinate for both planes, and then loop
            // over the points, calculating the UVs from these numbers.
            // When this.tile6 is true, the layout is as follows:
            //       .-----.-----.-----. (1,1)
            //       | Bot |  T  | Bak |
            //       |-----+-----+-----|
            //       |  L  |  F  |  R  |
            // (0,0)'-----'-----'-----'
            uidx = 0;
            // FRONT / BACK
            tl0u = 1 * u_tile_step;
            tl0v = 1 * v_tile_step;
            tl1u = 2 * u_tile_step;
            tl1v = 0 * v_tile_step;
            du = u_tile_dim / this.segmentsW;
            dv = v_tile_dim / this.segmentsH;
            for (i = 0; i <= this.segmentsW; i++) {
                for (j = 0; j <= this.segmentsH; j++) {
                    data[uidx++] = tl0u + i * du;
                    data[uidx++] = tl0v + (v_tile_dim - j * dv);
                    data[uidx++] = tl1u + (u_tile_dim - i * du);
                    data[uidx++] = tl1v + (v_tile_dim - j * dv);
                }
            }
            // TOP / BOTTOM
            tl0u = 1 * u_tile_step;
            tl0v = 0 * v_tile_step;
            tl1u = 0 * u_tile_step;
            tl1v = 0 * v_tile_step;
            du = u_tile_dim / this.segmentsW;
            dv = v_tile_dim / this.segmentsD;
            for (i = 0; i <= this.segmentsW; i++) {
                for (j = 0; j <= this.segmentsD; j++) {
                    data[uidx++] = tl0u + i * du;
                    data[uidx++] = tl0v + (v_tile_dim - j * dv);
                    data[uidx++] = tl1u + i * du;
                    data[uidx++] = tl1v + j * dv;
                }
            }
            // LEFT / RIGHT
            tl0u = 0 * u_tile_step;
            tl0v = 1 * v_tile_step;
            tl1u = 2 * u_tile_step;
            tl1v = 1 * v_tile_step;
            du = u_tile_dim / this.segmentsD;
            dv = v_tile_dim / this.segmentsH;
            for (i = 0; i <= this.segmentsD; i++) {
                for (j = 0; j <= this.segmentsH; j++) {
                    data[uidx++] = tl0u + i * du;
                    data[uidx++] = tl0v + (v_tile_dim - j * dv);
                    data[uidx++] = tl1u + (u_tile_dim - i * du);
                    data[uidx++] = tl1v + (v_tile_dim - j * dv);
                }
            }
            return data;
        };
        __decorate([
            feng3d.serialize(1),
            feng3d.oav()
        ], CubeGeometry.prototype, "width", null);
        __decorate([
            feng3d.serialize(1),
            feng3d.oav()
        ], CubeGeometry.prototype, "height", null);
        __decorate([
            feng3d.serialize(1),
            feng3d.oav()
        ], CubeGeometry.prototype, "depth", null);
        __decorate([
            feng3d.serialize(1),
            feng3d.oav()
        ], CubeGeometry.prototype, "segmentsW", null);
        __decorate([
            feng3d.serialize(1),
            feng3d.oav()
        ], CubeGeometry.prototype, "segmentsH", null);
        __decorate([
            feng3d.serialize(1),
            feng3d.oav()
        ], CubeGeometry.prototype, "segmentsD", null);
        __decorate([
            feng3d.serialize(true),
            feng3d.oav()
        ], CubeGeometry.prototype, "tile6", null);
        return CubeGeometry;
    }(feng3d.Geometry));
    feng3d.CubeGeometry = CubeGeometry;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 球体几何体
     * @author DawnKing 2016-09-12
     */
    var SphereGeometry = /** @class */ (function (_super) {
        __extends(SphereGeometry, _super);
        /**
         * 创建球形几何体
         * @param radius 球体半径
         * @param segmentsW 横向分割数
         * @param segmentsH 纵向分割数
         * @param yUp 正面朝向 true:Y+ false:Z+
         */
        function SphereGeometry(radius, segmentsW, segmentsH, yUp) {
            if (radius === void 0) { radius = 0.5; }
            if (segmentsW === void 0) { segmentsW = 16; }
            if (segmentsH === void 0) { segmentsH = 12; }
            if (yUp === void 0) { yUp = true; }
            var _this = _super.call(this) || this;
            _this._radius = 50;
            _this._segmentsW = 16;
            _this._segmentsH = 12;
            _this._yUp = true;
            _this.name = "Sphere";
            _this.radius = radius;
            _this.segmentsW = _this.segmentsW;
            _this.segmentsH = _this.segmentsH;
            _this.yUp = yUp;
            return _this;
        }
        Object.defineProperty(SphereGeometry.prototype, "radius", {
            get: function () {
                return this._radius;
            },
            set: function (value) {
                if (this._radius == value)
                    return;
                this._radius = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SphereGeometry.prototype, "segmentsW", {
            get: function () {
                return this._segmentsW;
            },
            set: function (value) {
                if (this._segmentsW == value)
                    return;
                this._segmentsW = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SphereGeometry.prototype, "segmentsH", {
            get: function () {
                return this._segmentsH;
            },
            set: function (value) {
                if (this._segmentsH == value)
                    return;
                this._segmentsH = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SphereGeometry.prototype, "yUp", {
            get: function () {
                return this._yUp;
            },
            set: function (value) {
                if (this._yUp == value)
                    return;
                this._yUp = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 构建几何体数据
         * @param this.radius 球体半径
         * @param this.segmentsW 横向分割数
         * @param this.segmentsH 纵向分割数
         * @param this.yUp 正面朝向 true:Y+ false:Z+
         */
        SphereGeometry.prototype.buildGeometry = function () {
            var vertexPositionData = [];
            var vertexNormalData = [];
            var vertexTangentData = [];
            var startIndex;
            var index = 0;
            var comp1, comp2, t1, t2;
            for (var yi = 0; yi <= this.segmentsH; ++yi) {
                startIndex = index;
                var horangle = Math.PI * yi / this.segmentsH;
                var z = -this.radius * Math.cos(horangle);
                var ringradius = this.radius * Math.sin(horangle);
                for (var xi = 0; xi <= this.segmentsW; ++xi) {
                    var verangle = 2 * Math.PI * xi / this.segmentsW;
                    var x = ringradius * Math.cos(verangle);
                    var y = ringradius * Math.sin(verangle);
                    var normLen = 1 / Math.sqrt(x * x + y * y + z * z);
                    var tanLen = Math.sqrt(y * y + x * x);
                    if (this.yUp) {
                        t1 = 0;
                        t2 = tanLen > .007 ? x / tanLen : 0;
                        comp1 = -z;
                        comp2 = y;
                    }
                    else {
                        t1 = tanLen > .007 ? x / tanLen : 0;
                        t2 = 0;
                        comp1 = y;
                        comp2 = z;
                    }
                    if (xi == this.segmentsW) {
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
                    else {
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
                    if (xi > 0 && yi > 0) {
                        if (yi == this.segmentsH) {
                            vertexPositionData[index] = vertexPositionData[startIndex];
                            vertexPositionData[index + 1] = vertexPositionData[startIndex + 1];
                            vertexPositionData[index + 2] = vertexPositionData[startIndex + 2];
                        }
                    }
                    index += 3;
                }
            }
            this.setVAData("a_position", vertexPositionData, 3);
            this.setVAData("a_normal", vertexNormalData, 3);
            this.setVAData("a_tangent", vertexTangentData, 3);
            var uvData = this.buildUVs();
            this.setVAData("a_uv", uvData, 2);
            var indices = this.buildIndices();
            this.indices = indices;
        };
        /**
         * 构建顶点索引
         * @param this.segmentsW 横向分割数
         * @param this.segmentsH 纵向分割数
         * @param this.yUp 正面朝向 true:Y+ false:Z+
         */
        SphereGeometry.prototype.buildIndices = function () {
            var indices = [];
            var numIndices = 0;
            for (var yi = 0; yi <= this.segmentsH; ++yi) {
                for (var xi = 0; xi <= this.segmentsW; ++xi) {
                    if (xi > 0 && yi > 0) {
                        var a = (this.segmentsW + 1) * yi + xi;
                        var b = (this.segmentsW + 1) * yi + xi - 1;
                        var c = (this.segmentsW + 1) * (yi - 1) + xi - 1;
                        var d = (this.segmentsW + 1) * (yi - 1) + xi;
                        if (yi == this.segmentsH) {
                            indices[numIndices++] = a;
                            indices[numIndices++] = c;
                            indices[numIndices++] = d;
                        }
                        else if (yi == 1) {
                            indices[numIndices++] = a;
                            indices[numIndices++] = b;
                            indices[numIndices++] = c;
                        }
                        else {
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
        };
        /**
         * 构建uv
         * @param this.segmentsW 横向分割数
         * @param this.segmentsH 纵向分割数
         */
        SphereGeometry.prototype.buildUVs = function () {
            var data = [];
            var index = 0;
            for (var yi = 0; yi <= this.segmentsH; ++yi) {
                for (var xi = 0; xi <= this.segmentsW; ++xi) {
                    data[index++] = xi / this.segmentsW;
                    data[index++] = yi / this.segmentsH;
                }
            }
            return data;
        };
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], SphereGeometry.prototype, "radius", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], SphereGeometry.prototype, "segmentsW", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], SphereGeometry.prototype, "segmentsH", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], SphereGeometry.prototype, "yUp", null);
        return SphereGeometry;
    }(feng3d.Geometry));
    feng3d.SphereGeometry = SphereGeometry;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 胶囊体几何体
     * @author DawnKing 2016-09-12
     */
    var CapsuleGeometry = /** @class */ (function (_super) {
        __extends(CapsuleGeometry, _super);
        /**
         * 创建胶囊几何体
         * @param radius 胶囊体半径
         * @param height 胶囊体高度
         * @param segmentsW 横向分割数
         * @param segmentsH 纵向分割数
         * @param yUp 正面朝向 true:Y+ false:Z+
         */
        function CapsuleGeometry(radius, height, segmentsW, segmentsH, yUp) {
            if (radius === void 0) { radius = 0.5; }
            if (height === void 0) { height = 1; }
            if (segmentsW === void 0) { segmentsW = 16; }
            if (segmentsH === void 0) { segmentsH = 15; }
            if (yUp === void 0) { yUp = true; }
            var _this = _super.call(this) || this;
            _this._radius = 0.5;
            _this._height = 1;
            _this._segmentsW = 16;
            _this._segmentsH = 15;
            _this._yUp = true;
            _this.name = "Capsule";
            _this.radius = radius;
            _this.height = height;
            _this.segmentsW = segmentsW;
            _this.segmentsH = segmentsH;
            _this.yUp = yUp;
            return _this;
        }
        Object.defineProperty(CapsuleGeometry.prototype, "radius", {
            get: function () {
                return this._radius;
            },
            set: function (value) {
                if (this._radius == value)
                    return;
                this._radius = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CapsuleGeometry.prototype, "height", {
            get: function () {
                return this._height;
            },
            set: function (value) {
                if (this._height == value)
                    return;
                this._height = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CapsuleGeometry.prototype, "segmentsW", {
            get: function () {
                return this._segmentsW;
            },
            set: function (value) {
                if (this._segmentsW == value)
                    return;
                this._segmentsW = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CapsuleGeometry.prototype, "segmentsH", {
            get: function () {
                return this._segmentsH;
            },
            set: function (value) {
                if (this._segmentsH == value)
                    return;
                this._segmentsH = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CapsuleGeometry.prototype, "yUp", {
            get: function () {
                return this._yUp;
            },
            set: function (value) {
                if (this._yUp == value)
                    return;
                this._yUp = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 构建几何体数据
         * @param radius 胶囊体半径
         * @param height 胶囊体高度
         * @param segmentsW 横向分割数
         * @param segmentsH 纵向分割数
         * @param yUp 正面朝向 true:Y+ false:Z+
         */
        CapsuleGeometry.prototype.buildGeometry = function () {
            var vertexPositionData = [];
            var vertexNormalData = [];
            var vertexTangentData = [];
            var startIndex;
            var index = 0;
            var comp1, comp2, t1, t2;
            for (var yi = 0; yi <= this.segmentsH; ++yi) {
                startIndex = index;
                var horangle = Math.PI * yi / this.segmentsH;
                var z = -this.radius * Math.cos(horangle);
                var ringradius = this.radius * Math.sin(horangle);
                for (var xi = 0; xi <= this.segmentsW; ++xi) {
                    var verangle = 2 * Math.PI * xi / this.segmentsW;
                    var x = ringradius * Math.cos(verangle);
                    var y = ringradius * Math.sin(verangle);
                    var normLen = 1 / Math.sqrt(x * x + y * y + z * z);
                    var tanLen = Math.sqrt(y * y + x * x);
                    var offset = yi > this.segmentsH / 2 ? this.height / 2 : -this.height / 2;
                    if (this.yUp) {
                        t1 = 0;
                        t2 = tanLen > .007 ? x / tanLen : 0;
                        comp1 = -z;
                        comp2 = y;
                    }
                    else {
                        t1 = tanLen > .007 ? x / tanLen : 0;
                        t2 = 0;
                        comp1 = y;
                        comp2 = z;
                    }
                    if (xi == this.segmentsW) {
                        vertexPositionData[index] = vertexPositionData[startIndex];
                        vertexPositionData[index + 1] = vertexPositionData[startIndex + 1];
                        vertexPositionData[index + 2] = vertexPositionData[startIndex + 2];
                        vertexNormalData[index] = (vertexNormalData[startIndex] + x * normLen) * 0.5;
                        vertexNormalData[index + 1] = (vertexNormalData[startIndex + 1] + comp1 * normLen) * 0.5;
                        vertexNormalData[index + 2] = (vertexNormalData[startIndex + 2] + comp2 * normLen) * 0.5;
                        vertexTangentData[index] = (vertexTangentData[startIndex] + tanLen > .007 ? -y / tanLen : 1) * 0.5;
                        vertexTangentData[index + 1] = (vertexTangentData[startIndex + 1] + t1) * 0.5;
                        vertexTangentData[index + 2] = (vertexTangentData[startIndex + 2] + t2) * 0.5;
                    }
                    else {
                        vertexPositionData[index] = x;
                        vertexPositionData[index + 1] = this.yUp ? comp1 - offset : comp1;
                        vertexPositionData[index + 2] = this.yUp ? comp2 : comp2 + offset;
                        vertexNormalData[index] = x * normLen;
                        vertexNormalData[index + 1] = comp1 * normLen;
                        vertexNormalData[index + 2] = comp2 * normLen;
                        vertexTangentData[index] = tanLen > .007 ? -y / tanLen : 1;
                        vertexTangentData[index + 1] = t1;
                        vertexTangentData[index + 2] = t2;
                    }
                    if (xi > 0 && yi > 0) {
                        if (yi == this.segmentsH) {
                            vertexPositionData[index] = vertexPositionData[startIndex];
                            vertexPositionData[index + 1] = vertexPositionData[startIndex + 1];
                            vertexPositionData[index + 2] = vertexPositionData[startIndex + 2];
                        }
                    }
                    index += 3;
                }
            }
            this.setVAData("a_position", vertexPositionData, 3);
            this.setVAData("a_normal", vertexNormalData, 3);
            this.setVAData("a_tangent", vertexTangentData, 3);
            var uvData = this.buildUVs();
            this.setVAData("a_uv", uvData, 2);
            this.buildIndices();
        };
        /**
         * 构建顶点索引
         * @param segmentsW 横向分割数
         * @param segmentsH 纵向分割数
         * @param yUp 正面朝向 true:Y+ false:Z+
         */
        CapsuleGeometry.prototype.buildIndices = function () {
            var indices = [];
            var numIndices = 0;
            for (var yi = 0; yi <= this.segmentsH; ++yi) {
                for (var xi = 0; xi <= this.segmentsW; ++xi) {
                    if (xi > 0 && yi > 0) {
                        var a = (this.segmentsW + 1) * yi + xi;
                        var b = (this.segmentsW + 1) * yi + xi - 1;
                        var c = (this.segmentsW + 1) * (yi - 1) + xi - 1;
                        var d = (this.segmentsW + 1) * (yi - 1) + xi;
                        if (yi == this.segmentsH) {
                            indices[numIndices++] = a;
                            indices[numIndices++] = c;
                            indices[numIndices++] = d;
                        }
                        else if (yi == 1) {
                            indices[numIndices++] = a;
                            indices[numIndices++] = b;
                            indices[numIndices++] = c;
                        }
                        else {
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
            this.indices = indices;
        };
        /**
         * 构建uv
         * @param segmentsW 横向分割数
         * @param segmentsH 纵向分割数
         */
        CapsuleGeometry.prototype.buildUVs = function () {
            var data = [];
            var index = 0;
            for (var yi = 0; yi <= this.segmentsH; ++yi) {
                for (var xi = 0; xi <= this.segmentsW; ++xi) {
                    data[index++] = xi / this.segmentsW;
                    data[index++] = yi / this.segmentsH;
                }
            }
            return data;
        };
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], CapsuleGeometry.prototype, "radius", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], CapsuleGeometry.prototype, "height", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], CapsuleGeometry.prototype, "segmentsW", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], CapsuleGeometry.prototype, "segmentsH", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], CapsuleGeometry.prototype, "yUp", null);
        return CapsuleGeometry;
    }(feng3d.Geometry));
    feng3d.CapsuleGeometry = CapsuleGeometry;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 圆柱体几何体
     * @author DawnKing 2016-09-12
     */
    var CylinderGeometry = /** @class */ (function (_super) {
        __extends(CylinderGeometry, _super);
        /**
         * 创建圆柱体
         */
        function CylinderGeometry(topRadius, bottomRadius, height, segmentsW, segmentsH, topClosed, bottomClosed, surfaceClosed, yUp) {
            if (topRadius === void 0) { topRadius = 0.5; }
            if (bottomRadius === void 0) { bottomRadius = 0.5; }
            if (height === void 0) { height = 2; }
            if (segmentsW === void 0) { segmentsW = 16; }
            if (segmentsH === void 0) { segmentsH = 1; }
            if (topClosed === void 0) { topClosed = true; }
            if (bottomClosed === void 0) { bottomClosed = true; }
            if (surfaceClosed === void 0) { surfaceClosed = true; }
            if (yUp === void 0) { yUp = true; }
            var _this = _super.call(this) || this;
            _this.topRadius = 0.5;
            _this.bottomRadius = 0.5;
            _this.height = 2;
            _this.segmentsW = 16;
            _this.segmentsH = 1;
            _this.topClosed = true;
            _this.bottomClosed = true;
            _this.surfaceClosed = true;
            _this.yUp = true;
            _this.name = "Cylinder";
            _this.topRadius = topRadius;
            _this.bottomRadius = bottomRadius;
            _this.height = height;
            _this.segmentsW = segmentsW;
            _this.segmentsH = segmentsH;
            _this.topClosed = topClosed;
            _this.bottomClosed = bottomClosed;
            _this.surfaceClosed = surfaceClosed;
            _this.yUp = yUp;
            return _this;
        }
        /**
         * 构建几何体数据
         */
        CylinderGeometry.prototype.buildGeometry = function () {
            var i, j, index = 0;
            var x, y, z, radius, revolutionAngle = 0;
            var dr, latNormElev, latNormBase;
            var comp1, comp2;
            var startIndex = 0;
            var t1, t2;
            var vertexPositionData = [];
            var vertexNormalData = [];
            var vertexTangentData = [];
            var revolutionAngleDelta = 2 * Math.PI / this.segmentsW;
            // 顶部
            if (this.topClosed && this.topRadius > 0) {
                z = -0.5 * this.height;
                for (i = 0; i <= this.segmentsW; ++i) {
                    // 中心顶点
                    if (this.yUp) {
                        t1 = 1;
                        t2 = 0;
                        comp1 = -z;
                        comp2 = 0;
                    }
                    else {
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
                    if (this.yUp) {
                        comp1 = -z;
                        comp2 = y;
                    }
                    else {
                        comp1 = y;
                        comp2 = z;
                    }
                    if (i == this.segmentsW) {
                        addVertex(vertexPositionData[startIndex + 3], vertexPositionData[startIndex + 4], vertexPositionData[startIndex + 5], 0, t1, t2, 1, 0, 0);
                    }
                    else {
                        addVertex(x, comp1, comp2, 0, t1, t2, 1, 0, 0);
                    }
                }
            }
            // 底部
            if (this.bottomClosed && this.bottomRadius > 0) {
                z = 0.5 * this.height;
                startIndex = index;
                for (i = 0; i <= this.segmentsW; ++i) {
                    // 中心顶点
                    if (this.yUp) {
                        t1 = -1;
                        t2 = 0;
                        comp1 = -z;
                        comp2 = 0;
                    }
                    else {
                        t1 = 0;
                        t2 = 1;
                        comp1 = 0;
                        comp2 = z;
                    }
                    addVertex(0, comp1, comp2, 0, t1, t2, 1, 0, 0);
                    // 旋转顶点
                    revolutionAngle = i * revolutionAngleDelta;
                    x = this.bottomRadius * Math.cos(revolutionAngle);
                    y = this.bottomRadius * Math.sin(revolutionAngle);
                    if (this.yUp) {
                        comp1 = -z;
                        comp2 = y;
                    }
                    else {
                        comp1 = y;
                        comp2 = z;
                    }
                    if (i == this.segmentsW) {
                        addVertex(x, vertexPositionData[startIndex + 1], vertexPositionData[startIndex + 2], 0, t1, t2, 1, 0, 0);
                    }
                    else {
                        addVertex(x, comp1, comp2, 0, t1, t2, 1, 0, 0);
                    }
                }
            }
            // 侧面
            dr = this.bottomRadius - this.topRadius;
            latNormElev = dr / this.height;
            latNormBase = (latNormElev == 0) ? 1 : this.height / dr;
            if (this.surfaceClosed) {
                var a, b, c, d;
                var na0, na1, naComp1, naComp2;
                for (j = 0; j <= this.segmentsH; ++j) {
                    radius = this.topRadius - ((j / this.segmentsH) * (this.topRadius - this.bottomRadius));
                    z = -(this.height / 2) + (j / this.segmentsH * this.height);
                    startIndex = index;
                    for (i = 0; i <= this.segmentsW; ++i) {
                        revolutionAngle = i * revolutionAngleDelta;
                        x = radius * Math.cos(revolutionAngle);
                        y = radius * Math.sin(revolutionAngle);
                        na0 = latNormBase * Math.cos(revolutionAngle);
                        na1 = latNormBase * Math.sin(revolutionAngle);
                        if (this.yUp) {
                            t1 = 0;
                            t2 = -na0;
                            comp1 = -z;
                            comp2 = y;
                            naComp1 = latNormElev;
                            naComp2 = na1;
                        }
                        else {
                            t1 = -na0;
                            t2 = 0;
                            comp1 = y;
                            comp2 = z;
                            naComp1 = na1;
                            naComp2 = latNormElev;
                        }
                        if (i == this.segmentsW) {
                            addVertex(vertexPositionData[startIndex], vertexPositionData[startIndex + 1], vertexPositionData[startIndex + 2], na0, latNormElev, na1, na1, t1, t2);
                        }
                        else {
                            addVertex(x, comp1, comp2, na0, naComp1, naComp2, -na1, t1, t2);
                        }
                    }
                }
            }
            this.setVAData("a_position", vertexPositionData, 3);
            this.setVAData("a_normal", vertexNormalData, 3);
            this.setVAData("a_tangent", vertexTangentData, 3);
            function addVertex(px, py, pz, nx, ny, nz, tx, ty, tz) {
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
            this.setVAData("a_uv", uvData, 2);
            var indices = this.buildIndices();
            this.indices = indices;
        };
        /**
         * 构建顶点索引
         * @param segmentsW 横向分割数
         * @param segmentsH 纵向分割数
         * @param yUp 正面朝向 true:Y+ false:Z+
         */
        CylinderGeometry.prototype.buildIndices = function () {
            var i, j, index = 0;
            var indices = [];
            var numIndices = 0;
            // 顶部
            if (this.topClosed && this.topRadius > 0) {
                for (i = 0; i <= this.segmentsW; ++i) {
                    index += 2;
                    if (i > 0)
                        addTriangleClockWise(index - 1, index - 3, index - 2);
                }
            }
            // 底部
            if (this.bottomClosed && this.bottomRadius > 0) {
                for (i = 0; i <= this.segmentsW; ++i) {
                    index += 2;
                    if (i > 0)
                        addTriangleClockWise(index - 2, index - 3, index - 1);
                }
            }
            // 侧面
            if (this.surfaceClosed) {
                var a, b, c, d;
                for (j = 0; j <= this.segmentsH; ++j) {
                    for (i = 0; i <= this.segmentsW; ++i) {
                        index++;
                        if (i > 0 && j > 0) {
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
            function addTriangleClockWise(cwVertexIndex0, cwVertexIndex1, cwVertexIndex2) {
                indices[numIndices++] = cwVertexIndex0;
                indices[numIndices++] = cwVertexIndex1;
                indices[numIndices++] = cwVertexIndex2;
            }
        };
        /**
         * 构建uv
         * @param segmentsW 横向分割数
         * @param segmentsH 纵向分割数
         */
        CylinderGeometry.prototype.buildUVs = function () {
            var i, j;
            var x, y, revolutionAngle;
            var data = [];
            var revolutionAngleDelta = 2 * Math.PI / this.segmentsW;
            var index = 0;
            // 顶部
            if (this.topClosed) {
                for (i = 0; i <= this.segmentsW; ++i) {
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
            if (this.bottomClosed) {
                for (i = 0; i <= this.segmentsW; ++i) {
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
            if (this.surfaceClosed) {
                for (j = 0; j <= this.segmentsH; ++j) {
                    for (i = 0; i <= this.segmentsW; ++i) {
                        // 旋转顶点
                        data[index++] = (i / this.segmentsW);
                        data[index++] = (j / this.segmentsH);
                    }
                }
            }
            return data;
        };
        __decorate([
            feng3d.watch("invalidateGeometry"),
            feng3d.serialize(),
            feng3d.oav()
        ], CylinderGeometry.prototype, "topRadius", void 0);
        __decorate([
            feng3d.watch("invalidateGeometry"),
            feng3d.serialize(),
            feng3d.oav()
        ], CylinderGeometry.prototype, "bottomRadius", void 0);
        __decorate([
            feng3d.watch("invalidateGeometry"),
            feng3d.serialize(),
            feng3d.oav()
        ], CylinderGeometry.prototype, "height", void 0);
        __decorate([
            feng3d.watch("invalidateGeometry"),
            feng3d.serialize(),
            feng3d.oav()
        ], CylinderGeometry.prototype, "segmentsW", void 0);
        __decorate([
            feng3d.watch("invalidateGeometry"),
            feng3d.serialize(),
            feng3d.oav()
        ], CylinderGeometry.prototype, "segmentsH", void 0);
        __decorate([
            feng3d.watch("invalidateGeometry"),
            feng3d.serialize(),
            feng3d.oav()
        ], CylinderGeometry.prototype, "topClosed", void 0);
        __decorate([
            feng3d.watch("invalidateGeometry"),
            feng3d.serialize(),
            feng3d.oav()
        ], CylinderGeometry.prototype, "bottomClosed", void 0);
        __decorate([
            feng3d.watch("invalidateGeometry"),
            feng3d.serialize(),
            feng3d.oav()
        ], CylinderGeometry.prototype, "surfaceClosed", void 0);
        __decorate([
            feng3d.watch("invalidateGeometry"),
            feng3d.serialize(),
            feng3d.oav()
        ], CylinderGeometry.prototype, "yUp", void 0);
        return CylinderGeometry;
    }(feng3d.Geometry));
    feng3d.CylinderGeometry = CylinderGeometry;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 圆锥体
     * @author feng 2017-02-07
     */
    var ConeGeometry = /** @class */ (function (_super) {
        __extends(ConeGeometry, _super);
        /**
         * 创建圆锥体
         * @param radius 底部半径
         * @param height 高度
         * @param segmentsW
         * @param segmentsH
         * @param yUp
         */
        function ConeGeometry(radius, height, segmentsW, segmentsH, closed, yUp) {
            if (radius === void 0) { radius = 0.5; }
            if (height === void 0) { height = 1; }
            if (segmentsW === void 0) { segmentsW = 16; }
            if (segmentsH === void 0) { segmentsH = 1; }
            if (closed === void 0) { closed = true; }
            if (yUp === void 0) { yUp = true; }
            var _this = _super.call(this, 0, radius, height, segmentsW, segmentsH, false, closed, true, yUp) || this;
            _this.name = "Cone";
            return _this;
        }
        return ConeGeometry;
    }(feng3d.CylinderGeometry));
    feng3d.ConeGeometry = ConeGeometry;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 圆环几何体
     */
    var TorusGeometry = /** @class */ (function (_super) {
        __extends(TorusGeometry, _super);
        /**
         * 创建<code>Torus</code>实例
         * @param radius						圆环半径
         * @param tubeRadius					管道半径
         * @param segmentsR						横向段数
         * @param segmentsT						纵向段数
         * @param yUp							Y轴是否朝上
         */
        function TorusGeometry(radius, tubeRadius, segmentsR, segmentsT, yUp) {
            if (radius === void 0) { radius = 0.5; }
            if (tubeRadius === void 0) { tubeRadius = 0.1; }
            if (segmentsR === void 0) { segmentsR = 16; }
            if (segmentsT === void 0) { segmentsT = 8; }
            if (yUp === void 0) { yUp = true; }
            var _this = _super.call(this) || this;
            _this._radius = 0.5;
            _this._tubeRadius = 0.1;
            _this._segmentsR = 16;
            _this._segmentsT = 8;
            _this._yUp = true;
            _this._vertexPositionStride = 3;
            _this._vertexNormalStride = 3;
            _this._vertexTangentStride = 3;
            _this.name = "Torus";
            _this.radius = radius;
            _this.tubeRadius = tubeRadius;
            _this.segmentR = segmentsR;
            _this.segmentsT = segmentsT;
            _this.yUp = yUp;
            return _this;
        }
        Object.defineProperty(TorusGeometry.prototype, "radius", {
            get: function () {
                return this._radius;
            },
            set: function (value) {
                if (this._radius == value)
                    return;
                this._radius = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TorusGeometry.prototype, "tubeRadius", {
            get: function () {
                return this._tubeRadius;
            },
            set: function (value) {
                if (this._tubeRadius == value)
                    return;
                this._tubeRadius = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TorusGeometry.prototype, "segmentsR", {
            get: function () {
                return this._segmentsR;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TorusGeometry.prototype, "segmentR", {
            set: function (value) {
                if (this._segmentsR == value)
                    return;
                this._segmentsR = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TorusGeometry.prototype, "segmentsT", {
            get: function () {
                return this._segmentsT;
            },
            set: function (value) {
                if (this._segmentsT == value)
                    return;
                this._segmentsT = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TorusGeometry.prototype, "yUp", {
            get: function () {
                return this._yUp;
            },
            set: function (value) {
                if (this._yUp == value)
                    return;
                this._yUp = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 添加顶点数据
         */
        TorusGeometry.prototype.addVertex = function (vertexIndex, px, py, pz, nx, ny, nz, tx, ty, tz) {
            this._vertexPositionData[vertexIndex * this._vertexPositionStride] = px;
            this._vertexPositionData[vertexIndex * this._vertexPositionStride + 1] = py;
            this._vertexPositionData[vertexIndex * this._vertexPositionStride + 2] = pz;
            this._vertexNormalData[vertexIndex * this._vertexNormalStride] = nx;
            this._vertexNormalData[vertexIndex * this._vertexNormalStride + 1] = ny;
            this._vertexNormalData[vertexIndex * this._vertexNormalStride + 2] = nz;
            this._vertexTangentData[vertexIndex * this._vertexTangentStride] = tx;
            this._vertexTangentData[vertexIndex * this._vertexTangentStride + 1] = ty;
            this._vertexTangentData[vertexIndex * this._vertexTangentStride + 2] = tz;
        };
        /**
         * 添加三角形索引数据
         * @param currentTriangleIndex		当前三角形索引
         * @param cwVertexIndex0			索引0
         * @param cwVertexIndex1			索引1
         * @param cwVertexIndex2			索引2
         */
        TorusGeometry.prototype.addTriangleClockWise = function (currentTriangleIndex, cwVertexIndex0, cwVertexIndex1, cwVertexIndex2) {
            this._rawIndices[currentTriangleIndex * 3] = cwVertexIndex0;
            this._rawIndices[currentTriangleIndex * 3 + 1] = cwVertexIndex1;
            this._rawIndices[currentTriangleIndex * 3 + 2] = cwVertexIndex2;
        };
        /**
         * @inheritDoc
         */
        TorusGeometry.prototype.buildGeometry = function () {
            var i, j;
            var x, y, z, nx, ny, nz, revolutionAngleR, revolutionAngleT;
            var numTriangles;
            // reset utility variables
            this._numVertices = 0;
            this._vertexIndex = 0;
            this._currentTriangleIndex = 0;
            // evaluate target number of vertices, triangles and indices
            this._numVertices = (this.segmentsT + 1) * (this.segmentsR + 1); // this.segmentsT + 1 because of closure, this.segmentsR + 1 because of closure
            numTriangles = this.segmentsT * this.segmentsR * 2; // each level has segmentR quads, each of 2 triangles
            this._vertexPositionData = [];
            this._vertexNormalData = [];
            this._vertexTangentData = [];
            this._rawIndices = [];
            this.buildUVs();
            // evaluate revolution steps
            var revolutionAngleDeltaR = 2 * Math.PI / this.segmentsR;
            var revolutionAngleDeltaT = 2 * Math.PI / this.segmentsT;
            var comp1, comp2;
            var t1, t2, n1, n2;
            var startPositionIndex;
            // surface
            var a, b, c, d, length;
            for (j = 0; j <= this.segmentsT; ++j) {
                startPositionIndex = j * (this.segmentsR + 1) * this._vertexPositionStride;
                for (i = 0; i <= this.segmentsR; ++i) {
                    this._vertexIndex = j * (this.segmentsR + 1) + i;
                    // revolution vertex
                    revolutionAngleR = i * revolutionAngleDeltaR;
                    revolutionAngleT = j * revolutionAngleDeltaT;
                    length = Math.cos(revolutionAngleT);
                    nx = length * Math.cos(revolutionAngleR);
                    ny = length * Math.sin(revolutionAngleR);
                    nz = Math.sin(revolutionAngleT);
                    x = this.radius * Math.cos(revolutionAngleR) + this.tubeRadius * nx;
                    y = this.radius * Math.sin(revolutionAngleR) + this.tubeRadius * ny;
                    z = (j == this.segmentsT) ? 0 : this.tubeRadius * nz;
                    if (this.yUp) {
                        n1 = -nz;
                        n2 = ny;
                        t1 = 0;
                        t2 = (length ? nx / length : x / this.radius);
                        comp1 = -z;
                        comp2 = y;
                    }
                    else {
                        n1 = ny;
                        n2 = nz;
                        t1 = (length ? nx / length : x / this.radius);
                        t2 = 0;
                        comp1 = y;
                        comp2 = z;
                    }
                    if (i == this.segmentsR) {
                        this.addVertex(this._vertexIndex, x, this._vertexPositionData[startPositionIndex + 1], this._vertexPositionData[startPositionIndex + 2], nx, n1, n2, -(length ? ny / length : y / this.radius), t1, t2);
                    }
                    else {
                        this.addVertex(this._vertexIndex, x, comp1, comp2, nx, n1, n2, -(length ? ny / length : y / this.radius), t1, t2);
                    }
                    // close triangle
                    if (i > 0 && j > 0) {
                        a = this._vertexIndex; // current
                        b = this._vertexIndex - 1; // previous
                        c = b - this.segmentsR - 1; // previous of last level
                        d = a - this.segmentsR - 1; // current of last level
                        this.addTriangleClockWise(this._currentTriangleIndex++, a, b, c);
                        this.addTriangleClockWise(this._currentTriangleIndex++, a, c, d);
                    }
                }
            }
            this.setVAData("a_position", this._vertexPositionData, 3);
            this.setVAData("a_normal", this._vertexNormalData, 3);
            this.setVAData("a_tangent", this._vertexTangentData, 3);
            this.indices = this._rawIndices;
        };
        /**
         * @inheritDoc
         */
        TorusGeometry.prototype.buildUVs = function () {
            var i, j;
            var stride = 2;
            var data = [];
            // evaluate num uvs
            var numUvs = this._numVertices * stride;
            // current uv component index
            var currentUvCompIndex = 0;
            var index = 0;
            // surface
            for (j = 0; j <= this.segmentsT; ++j) {
                for (i = 0; i <= this.segmentsR; ++i) {
                    index = j * (this.segmentsR + 1) + i;
                    // revolution vertex
                    data[index * stride] = i / this.segmentsR;
                    data[index * stride + 1] = j / this.segmentsT;
                }
            }
            // build real data from raw data
            this.setVAData("a_uv", data, 2);
        };
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], TorusGeometry.prototype, "radius", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], TorusGeometry.prototype, "tubeRadius", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], TorusGeometry.prototype, "segmentsR", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], TorusGeometry.prototype, "segmentsT", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], TorusGeometry.prototype, "yUp", null);
        return TorusGeometry;
    }(feng3d.Geometry));
    feng3d.TorusGeometry = TorusGeometry;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 2D纹理
     * @author feng 2016-12-20
     */
    var Texture2D = /** @class */ (function (_super) {
        __extends(Texture2D, _super);
        function Texture2D(url) {
            if (url === void 0) { url = ""; }
            var _this = _super.call(this) || this;
            _this._url = "";
            _this._textureType = feng3d.TextureType.TEXTURE_2D;
            _this._pixels = new Image();
            _this._pixels.crossOrigin = "Anonymous";
            _this._pixels.addEventListener("load", _this.onLoad.bind(_this));
            _this._pixels.addEventListener("error", _this.onLoad.bind(_this));
            _this.url = url;
            return _this;
        }
        Object.defineProperty(Texture2D.prototype, "url", {
            get: function () {
                return this._url;
            },
            set: function (value) {
                if (this._url == value)
                    return;
                this._url = value;
                this._pixels.src = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Texture2D.prototype, "size", {
            /**
             * 纹理尺寸
             */
            get: function () {
                return new feng3d.Point(this._pixels.width, this._pixels.height);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 处理加载完成
         */
        Texture2D.prototype.onLoad = function () {
            this.invalidate();
            this.dispatch("loaded");
        };
        /**
         * 判断数据是否满足渲染需求
         */
        Texture2D.prototype.checkRenderData = function () {
            if (!this._pixels)
                return false;
            if (!this._pixels.width || !this._pixels.height)
                return false;
            return true;
        };
        __decorate([
            feng3d.serialize(""),
            feng3d.oav()
        ], Texture2D.prototype, "url", null);
        return Texture2D;
    }(feng3d.TextureInfo));
    feng3d.Texture2D = Texture2D;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 立方体纹理
     * @author feng 2016-12-28
     */
    var TextureCube = /** @class */ (function (_super) {
        __extends(TextureCube, _super);
        function TextureCube(images) {
            var _this = _super.call(this) || this;
            _this._textureType = feng3d.TextureType.TEXTURE_CUBE_MAP;
            _this._pixels = [];
            for (var i = 0; i < 6; i++) {
                _this._pixels[i] = new Image();
                _this._pixels[i].crossOrigin = "Anonymous";
                _this._pixels[i].addEventListener("load", _this.invalidate.bind(_this));
            }
            if (images) {
                _this.positive_x_url = images[0];
                _this.positive_y_url = images[1];
                _this.positive_z_url = images[2];
                _this.negative_x_url = images[3];
                _this.negative_y_url = images[4];
                _this.negative_z_url = images[5];
            }
            return _this;
        }
        Object.defineProperty(TextureCube.prototype, "positive_x_url", {
            get: function () {
                return this._positive_x_url;
            },
            set: function (value) {
                if (this._positive_x_url == value)
                    return;
                this._positive_x_url = value;
                this._pixels[0].src = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextureCube.prototype, "positive_y_url", {
            get: function () {
                return this._positive_y_url;
            },
            set: function (value) {
                if (this._positive_y_url == value)
                    return;
                this._positive_y_url = value;
                this._pixels[1].src = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextureCube.prototype, "positive_z_url", {
            get: function () {
                return this._positive_z_url;
            },
            set: function (value) {
                if (this._positive_z_url == value)
                    return;
                this._positive_z_url = value;
                this._pixels[2].src = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextureCube.prototype, "negative_x_url", {
            get: function () {
                return this._negative_x_url;
            },
            set: function (value) {
                if (this._negative_x_url == value)
                    return;
                this._negative_x_url = value;
                this._pixels[3].src = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextureCube.prototype, "negative_y_url", {
            get: function () {
                return this._negative_y_url;
            },
            set: function (value) {
                if (this._negative_y_url == value)
                    return;
                this._negative_y_url = value;
                this._pixels[4].src = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextureCube.prototype, "negative_z_url", {
            get: function () {
                return this._negative_z_url;
            },
            set: function (value) {
                if (this._negative_z_url == value)
                    return;
                this._negative_z_url = value;
                this._pixels[5].src = value;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 判断数据是否满足渲染需求
         */
        TextureCube.prototype.checkRenderData = function () {
            if (!this._pixels)
                return false;
            for (var i = 0; i < this._pixels.length; i++) {
                var element = this._pixels[i];
                if (!element.width || !element.height)
                    return false;
            }
            return true;
        };
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], TextureCube.prototype, "positive_x_url", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], TextureCube.prototype, "positive_y_url", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], TextureCube.prototype, "positive_z_url", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], TextureCube.prototype, "negative_x_url", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], TextureCube.prototype, "negative_y_url", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], TextureCube.prototype, "negative_z_url", null);
        return TextureCube;
    }(feng3d.TextureInfo));
    feng3d.TextureCube = TextureCube;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var ImageDataTexture = /** @class */ (function (_super) {
        __extends(ImageDataTexture, _super);
        function ImageDataTexture() {
            var _this = _super.call(this) || this;
            _this._textureType = feng3d.TextureType.TEXTURE_2D;
            return _this;
        }
        Object.defineProperty(ImageDataTexture.prototype, "pixels", {
            get: function () {
                return this._pixels;
            },
            set: function (value) {
                this._pixels = value;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 判断数据是否满足渲染需求
         */
        ImageDataTexture.prototype.checkRenderData = function () {
            if (!this._pixels)
                return false;
            if (!this._pixels.width || !this._pixels.height)
                return false;
            return true;
        };
        return ImageDataTexture;
    }(feng3d.TextureInfo));
    feng3d.ImageDataTexture = ImageDataTexture;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 材质
     * @author feng 2016-05-02
     */
    var Material = /** @class */ (function (_super) {
        __extends(Material, _super);
        function Material() {
            var _this = _super.call(this) || this;
            /**
             * 剔除面
             * 参考：http://www.jianshu.com/p/ee04165f2a02
             * 默认情况下，逆时针的顶点连接顺序被定义为三角形的正面。
             * 使用gl.frontFace(gl.CW);调整顺时针为正面
             */
            _this.cullFace = feng3d.CullFace.BACK;
            _this.frontFace = feng3d.FrontFace.CW;
            _this._enableBlend = false;
            _this._pointSize = 1;
            /**
             * 混合方程，默认BlendEquation.FUNC_ADD
             */
            _this.blendEquation = feng3d.BlendEquation.FUNC_ADD;
            /**
             * 源混合因子，默认BlendFactor.SRC_ALPHA
             */
            _this.sfactor = feng3d.BlendFactor.SRC_ALPHA;
            /**
             * 目标混合因子，默认BlendFactor.ONE_MINUS_SRC_ALPHA
             */
            _this.dfactor = feng3d.BlendFactor.ONE_MINUS_SRC_ALPHA;
            /**
             * 是否开启深度检查
             */
            _this.depthtest = true;
            /**
             * 是否开启深度标记
             */
            _this.depthMask = true;
            /**
             * 绘制在画布上的区域
             */
            _this.viewRect = new feng3d.Rectangle(0, 0, 100, 100);
            /**
             * 是否使用 viewRect
             */
            _this.useViewRect = false;
            _this.renderMode = feng3d.RenderMode.TRIANGLES;
            _this.createShaderParam("cullFace", function () { return _this.cullFace; });
            _this.createShaderParam("frontFace", function () { return _this.frontFace; });
            _this.createShaderParam("enableBlend", function () { return _this.enableBlend; });
            _this.createShaderParam("blendEquation", function () { return _this.blendEquation; });
            _this.createShaderParam("sfactor", function () { return _this.sfactor; });
            _this.createShaderParam("dfactor", function () { return _this.dfactor; });
            _this.createShaderParam("depthtest", function () { return _this.depthtest; });
            _this.createShaderParam("depthMask", function () { return _this.depthMask; });
            _this.createShaderParam("viewRect", function () { return _this.viewRect; });
            _this.createShaderParam("useViewRect", function () { return _this.useViewRect; });
            return _this;
        }
        Object.defineProperty(Material.prototype, "renderMode", {
            /**
            * 渲染模式，默认RenderMode.TRIANGLES
            */
            get: function () {
                return this._renderMode;
            },
            set: function (value) {
                this._renderMode = value;
                this.createBoolMacro("IS_POINTS_MODE", this.renderMode == feng3d.RenderMode.POINTS);
                this.createShaderParam("renderMode", this.renderMode);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Material.prototype, "shaderName", {
            get: function () {
                return this._shaderName;
            },
            set: function (value) {
                if (this._shaderName == value)
                    return;
                this._shaderName = value;
                this.vertexCode = feng3d.ShaderLib.getShaderCode(this._shaderName + ".vertex");
                this.fragmentCode = feng3d.ShaderLib.getShaderCode(this._shaderName + ".fragment");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Material.prototype, "vertexCode", {
            /**
             * 顶点渲染程序代码
             */
            get: function () {
                return this._vertexCode;
            },
            set: function (value) {
                if (this._vertexCode == value)
                    return;
                this._vertexCode = value;
                this.createvertexCode(this._vertexCode);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Material.prototype, "fragmentCode", {
            /**
             * 片段渲染程序代码
             */
            get: function () {
                return this._fragmentCode;
            },
            set: function (value) {
                if (this._fragmentCode == value)
                    return;
                this._fragmentCode = value;
                this.createfragmentCode(this._fragmentCode);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Material.prototype, "enableBlend", {
            /**
             * 是否开启混合
             * <混合后的颜色> = <源颜色>*sfactor + <目标颜色>*dfactor
             */
            get: function () {
                return this._enableBlend;
            },
            set: function (value) {
                this._enableBlend = value;
                this.depthMask = !value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Material.prototype, "pointSize", {
            /**
             * 点绘制时点的尺寸
             */
            get: function () {
                return this._pointSize;
            },
            set: function (value) {
                this._pointSize = value;
                this.createUniformData("u_PointSize", this.pointSize);
            },
            enumerable: true,
            configurable: true
        });
        __decorate([
            feng3d.serialize(feng3d.RenderMode.TRIANGLES),
            feng3d.oav()
        ], Material.prototype, "renderMode", null);
        __decorate([
            feng3d.serialize(feng3d.CullFace.BACK),
            feng3d.oav()
        ], Material.prototype, "cullFace", void 0);
        __decorate([
            feng3d.serialize(feng3d.FrontFace.CW),
            feng3d.oav()
        ], Material.prototype, "frontFace", void 0);
        __decorate([
            feng3d.serialize(false),
            feng3d.oav()
        ], Material.prototype, "enableBlend", null);
        __decorate([
            feng3d.serialize(1),
            feng3d.oav()
        ], Material.prototype, "pointSize", null);
        __decorate([
            feng3d.serialize(feng3d.BlendEquation.FUNC_ADD),
            feng3d.oav()
        ], Material.prototype, "blendEquation", void 0);
        __decorate([
            feng3d.serialize(feng3d.BlendFactor.SRC_ALPHA),
            feng3d.oav()
        ], Material.prototype, "sfactor", void 0);
        __decorate([
            feng3d.serialize(feng3d.BlendFactor.ONE_MINUS_SRC_ALPHA),
            feng3d.oav()
        ], Material.prototype, "dfactor", void 0);
        __decorate([
            feng3d.serialize(true),
            feng3d.oav()
        ], Material.prototype, "depthtest", void 0);
        __decorate([
            feng3d.serialize(true),
            feng3d.oav()
        ], Material.prototype, "depthMask", void 0);
        __decorate([
            feng3d.oav()
        ], Material.prototype, "viewRect", void 0);
        __decorate([
            feng3d.oav()
        ], Material.prototype, "useViewRect", void 0);
        return Material;
    }(feng3d.RenderDataHolder));
    feng3d.Material = Material;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 颜色材质
     * @author feng 2017-01-11
     */
    var PointMaterial = /** @class */ (function (_super) {
        __extends(PointMaterial, _super);
        /**
         * 构建颜色材质
         */
        function PointMaterial() {
            var _this = _super.call(this) || this;
            _this.color = new feng3d.Color();
            _this.shaderName = "point";
            _this.renderMode = feng3d.RenderMode.POINTS;
            //
            _this.createUniformData("u_color", function () { return _this.color; });
            return _this;
        }
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], PointMaterial.prototype, "color", void 0);
        return PointMaterial;
    }(feng3d.Material));
    feng3d.PointMaterial = PointMaterial;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 颜色材质
     * @author feng 2016-05-02
     */
    var ColorMaterial = /** @class */ (function (_super) {
        __extends(ColorMaterial, _super);
        /**
         * 构建颜色材质
         * @param color 颜色
         * @param alpha 透明的
         */
        function ColorMaterial(color) {
            var _this = _super.call(this) || this;
            _this.shaderName = "color";
            _this.color = color || new feng3d.Color();
            //
            _this.createUniformData("u_diffuseInput", function () { return _this.color; });
            return _this;
        }
        Object.defineProperty(ColorMaterial.prototype, "color", {
            /**
             * 颜色
             */
            get: function () {
                return this._color;
            },
            set: function (value) {
                if (this._color == value)
                    return;
                this._color = value;
                if (this._color)
                    this.enableBlend = this._color.a != 1;
            },
            enumerable: true,
            configurable: true
        });
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], ColorMaterial.prototype, "color", null);
        return ColorMaterial;
    }(feng3d.Material));
    feng3d.ColorMaterial = ColorMaterial;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 线段材质
     * 目前webgl不支持修改线条宽度，参考：https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/lineWidth
     * @author feng 2016-10-15
     */
    var SegmentMaterial = /** @class */ (function (_super) {
        __extends(SegmentMaterial, _super);
        /**
         * 构建线段材质
         */
        function SegmentMaterial() {
            var _this = _super.call(this) || this;
            _this._color = new feng3d.Color();
            _this.shaderName = "segment";
            _this.renderMode = feng3d.RenderMode.LINES;
            _this.createUniformData("u_segmentColor", function () { return _this.color; });
            return _this;
        }
        Object.defineProperty(SegmentMaterial.prototype, "color", {
            /**
             * 线段颜色
             */
            get: function () {
                return this._color;
            },
            set: function (value) {
                if (this._color == value)
                    return;
                this._color = value;
                if (this._color)
                    this.enableBlend = this._color.a != 1;
            },
            enumerable: true,
            configurable: true
        });
        return SegmentMaterial;
    }(feng3d.Material));
    feng3d.SegmentMaterial = SegmentMaterial;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 纹理材质
     * @author feng 2016-12-23
     */
    var TextureMaterial = /** @class */ (function (_super) {
        __extends(TextureMaterial, _super);
        function TextureMaterial() {
            var _this = _super.call(this) || this;
            _this.color = new feng3d.Color();
            _this.shaderName = "texture";
            //
            _this.createUniformData("u_color", function () { return _this.color; });
            _this.createUniformData("s_texture", function () { return _this.texture; });
            return _this;
        }
        Object.defineProperty(TextureMaterial.prototype, "texture", {
            /**
             * 纹理数据
             */
            get: function () {
                return this._texture;
            },
            set: function (value) {
                if (this._texture == value)
                    return;
                this._texture = value;
            },
            enumerable: true,
            configurable: true
        });
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], TextureMaterial.prototype, "texture", null);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], TextureMaterial.prototype, "color", void 0);
        return TextureMaterial;
    }(feng3d.Material));
    feng3d.TextureMaterial = TextureMaterial;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 标准材质
     * @author feng 2016-05-02
     */
    var StandardMaterial = /** @class */ (function (_super) {
        __extends(StandardMaterial, _super);
        /**
         * 构建
         */
        function StandardMaterial(diffuseUrl, normalUrl, specularUrl, ambientUrl) {
            if (diffuseUrl === void 0) { diffuseUrl = ""; }
            if (normalUrl === void 0) { normalUrl = ""; }
            if (specularUrl === void 0) { specularUrl = ""; }
            if (ambientUrl === void 0) { ambientUrl = ""; }
            var _this = _super.call(this) || this;
            /**
             * 漫反射函数
             */
            _this.diffuseMethod = new feng3d.DiffuseMethod();
            /**
             * 法线函数
             */
            _this.normalMethod = new feng3d.NormalMethod();
            /**
             * 镜面反射函数
             */
            _this.specularMethod = new feng3d.SpecularMethod();
            /**
             * 环境反射函数
             */
            _this.ambientMethod = new feng3d.AmbientMethod();
            _this.envMapMethod = new feng3d.EnvMapMethod();
            _this.fogMethod = new feng3d.FogMethod();
            _this.terrainMethod = new feng3d.TerrainMethod();
            _this.shaderName = "standard";
            //
            _this.diffuseMethod.difuseTexture.url = diffuseUrl;
            _this.normalMethod.normalTexture.url = normalUrl;
            _this.specularMethod.specularTexture.url = specularUrl;
            _this.ambientMethod.ambientTexture.url = ambientUrl;
            return _this;
        }
        Object.defineProperty(StandardMaterial.prototype, "enableBlend", {
            // terrainMethod: TerrainMethod | TerrainMergeMethod;
            /**
             * 是否开启混合
             */
            get: function () {
                return this._enableBlend || this.diffuseMethod.color.a != 1.0;
            },
            set: function (value) {
                this._enableBlend = value;
            },
            enumerable: true,
            configurable: true
        });
        StandardMaterial.prototype.onmethodchange = function (property, oldvalue, newvalue) {
            this.removeRenderDataHolder(oldvalue);
            this.addRenderDataHolder(newvalue);
        };
        __decorate([
            feng3d.watch("onmethodchange"),
            feng3d.serialize(),
            feng3d.oav()
        ], StandardMaterial.prototype, "diffuseMethod", void 0);
        __decorate([
            feng3d.watch("onmethodchange"),
            feng3d.serialize(),
            feng3d.oav()
        ], StandardMaterial.prototype, "normalMethod", void 0);
        __decorate([
            feng3d.watch("onmethodchange"),
            feng3d.serialize(),
            feng3d.oav()
        ], StandardMaterial.prototype, "specularMethod", void 0);
        __decorate([
            feng3d.watch("onmethodchange"),
            feng3d.serialize(),
            feng3d.oav()
        ], StandardMaterial.prototype, "ambientMethod", void 0);
        __decorate([
            feng3d.watch("onmethodchange"),
            feng3d.serialize(),
            feng3d.oav()
        ], StandardMaterial.prototype, "envMapMethod", void 0);
        __decorate([
            feng3d.watch("onmethodchange"),
            feng3d.serialize(),
            feng3d.oav()
        ], StandardMaterial.prototype, "fogMethod", void 0);
        __decorate([
            feng3d.watch("onmethodchange"),
            feng3d.serialize(),
            feng3d.oav()
        ], StandardMaterial.prototype, "terrainMethod", void 0);
        return StandardMaterial;
    }(feng3d.Material));
    feng3d.StandardMaterial = StandardMaterial;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 漫反射函数
     * @author feng 2017-03-22
     */
    var DiffuseMethod = /** @class */ (function (_super) {
        __extends(DiffuseMethod, _super);
        /**
         * 构建
         */
        function DiffuseMethod(diffuseUrl) {
            if (diffuseUrl === void 0) { diffuseUrl = ""; }
            var _this = _super.call(this) || this;
            /**
             * 基本颜色
             */
            _this.color = new feng3d.Color(1, 1, 1, 1);
            /**
             * 透明阈值，透明度小于该值的像素被片段着色器丢弃
             */
            _this.alphaThreshold = 0;
            _this.difuseTexture = new feng3d.Texture2D(diffuseUrl);
            _this.color = new feng3d.Color(1, 1, 1, 1);
            //
            _this.createUniformData("u_diffuse", function () { return _this.color; });
            _this.createUniformData("s_diffuse", function () { return _this.difuseTexture; });
            _this.createUniformData("u_alphaThreshold", function () { return _this.alphaThreshold; });
            return _this;
        }
        Object.defineProperty(DiffuseMethod.prototype, "difuseTexture", {
            /**
             * 漫反射纹理
             */
            get: function () {
                return this._difuseTexture;
            },
            set: function (value) {
                if (this._difuseTexture == value)
                    return;
                if (this._difuseTexture)
                    this._difuseTexture.off("loaded", this.ontextureChanged, this);
                this._difuseTexture = value;
                if (this._difuseTexture)
                    this._difuseTexture.on("loaded", this.ontextureChanged, this);
                this.ontextureChanged();
            },
            enumerable: true,
            configurable: true
        });
        DiffuseMethod.prototype.ontextureChanged = function () {
            this.createBoolMacro("HAS_DIFFUSE_SAMPLER", this.difuseTexture.checkRenderData());
        };
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], DiffuseMethod.prototype, "difuseTexture", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], DiffuseMethod.prototype, "color", void 0);
        __decorate([
            feng3d.serialize(0),
            feng3d.oav()
        ], DiffuseMethod.prototype, "alphaThreshold", void 0);
        return DiffuseMethod;
    }(feng3d.RenderDataHolder));
    feng3d.DiffuseMethod = DiffuseMethod;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 法线函数
     * @author feng 2017-03-22
     */
    var NormalMethod = /** @class */ (function (_super) {
        __extends(NormalMethod, _super);
        /**
         * 构建
         */
        function NormalMethod(normalUrl) {
            if (normalUrl === void 0) { normalUrl = ""; }
            var _this = _super.call(this) || this;
            _this.normalTexture = new feng3d.Texture2D(normalUrl);
            //
            _this.createUniformData("s_normal", function () { return _this.normalTexture; });
            return _this;
        }
        Object.defineProperty(NormalMethod.prototype, "normalTexture", {
            /**
             * 漫反射纹理
             */
            get: function () {
                return this._normalTexture;
            },
            set: function (value) {
                if (this._normalTexture == value)
                    return;
                if (this._normalTexture)
                    this._normalTexture.off("loaded", this.onTextureChanged, this);
                this._normalTexture = value;
                if (this._normalTexture)
                    this._normalTexture.on("loaded", this.onTextureChanged, this);
                this.onTextureChanged();
            },
            enumerable: true,
            configurable: true
        });
        NormalMethod.prototype.onTextureChanged = function () {
            this.createBoolMacro("HAS_NORMAL_SAMPLER", this.normalTexture.checkRenderData());
        };
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], NormalMethod.prototype, "normalTexture", null);
        return NormalMethod;
    }(feng3d.RenderDataHolder));
    feng3d.NormalMethod = NormalMethod;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 法线函数
     * @author feng 2017-03-22
     */
    var SpecularMethod = /** @class */ (function (_super) {
        __extends(SpecularMethod, _super);
        /**
         * 构建
         */
        function SpecularMethod(specularUrl) {
            if (specularUrl === void 0) { specularUrl = ""; }
            var _this = _super.call(this) || this;
            /**
             * 镜面反射颜色
             */
            _this.specularColor = new feng3d.Color();
            /**
             * 高光系数
             */
            _this.glossiness = 50;
            _this.specularTexture = new feng3d.Texture2D(specularUrl);
            //
            _this.createUniformData("s_specular", function () { return _this.specularTexture; });
            _this.createUniformData("u_specular", function () { return _this.specularColor; });
            _this.createUniformData("u_glossiness", function () { return _this.glossiness; });
            return _this;
        }
        Object.defineProperty(SpecularMethod.prototype, "specularTexture", {
            /**
             * 镜面反射光泽图
             */
            get: function () {
                return this._specularTexture;
            },
            set: function (value) {
                if (this._specularTexture == value)
                    return;
                if (this._specularTexture)
                    this._specularTexture.off("loaded", this.onTextureChanged, this);
                this._specularTexture = value;
                if (this._specularTexture)
                    this._specularTexture.on("loaded", this.onTextureChanged, this);
                this.onTextureChanged();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpecularMethod.prototype, "specular", {
            /**
             * 镜面反射光反射强度
             */
            get: function () {
                return this.specularColor.a;
            },
            set: function (value) {
                this.specularColor.a = value;
            },
            enumerable: true,
            configurable: true
        });
        SpecularMethod.prototype.onTextureChanged = function () {
            this.createBoolMacro("HAS_SPECULAR_SAMPLER", this.specularTexture.checkRenderData());
        };
        __decorate([
            feng3d.serialize()
        ], SpecularMethod.prototype, "specularTexture", null);
        __decorate([
            feng3d.serialize()
        ], SpecularMethod.prototype, "specularColor", void 0);
        __decorate([
            feng3d.serialize(50)
        ], SpecularMethod.prototype, "glossiness", void 0);
        return SpecularMethod;
    }(feng3d.RenderDataHolder));
    feng3d.SpecularMethod = SpecularMethod;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 漫反射函数
     * @author feng 2017-03-22
     */
    var AmbientMethod = /** @class */ (function (_super) {
        __extends(AmbientMethod, _super);
        /**
         * 构建
         */
        function AmbientMethod(ambientUrl, color) {
            if (ambientUrl === void 0) { ambientUrl = ""; }
            var _this = _super.call(this) || this;
            _this.ambientTexture = new feng3d.Texture2D(ambientUrl);
            _this.color = color || new feng3d.Color();
            //
            _this.createUniformData("u_ambient", function () { return _this._color; });
            _this.createUniformData("s_ambient", function () { return _this._ambientTexture; });
            return _this;
        }
        Object.defineProperty(AmbientMethod.prototype, "ambientTexture", {
            /**
             * 环境纹理
             */
            get: function () {
                return this._ambientTexture;
            },
            set: function (value) {
                if (this._ambientTexture == value)
                    return;
                if (this._ambientTexture)
                    this._ambientTexture.off("loaded", this.onTextureChanged, this);
                this._ambientTexture = value;
                if (this._ambientTexture)
                    this._ambientTexture.on("loaded", this.onTextureChanged, this);
                this.onTextureChanged();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AmbientMethod.prototype, "color", {
            /**
             * 颜色
             */
            get: function () {
                return this._color;
            },
            set: function (value) {
                this._color = value;
            },
            enumerable: true,
            configurable: true
        });
        AmbientMethod.prototype.onTextureChanged = function () {
            this.createBoolMacro("HAS_AMBIENT_SAMPLER", this._ambientTexture && this._ambientTexture.checkRenderData());
        };
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], AmbientMethod.prototype, "ambientTexture", null);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], AmbientMethod.prototype, "color", null);
        return AmbientMethod;
    }(feng3d.RenderDataHolder));
    feng3d.AmbientMethod = AmbientMethod;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var FogMethod = /** @class */ (function (_super) {
        __extends(FogMethod, _super);
        /**
         * @param fogColor      雾颜色
         * @param minDistance   雾近距离
         * @param maxDistance   雾远距离
         * @param density       雾浓度
         */
        function FogMethod(fogColor, minDistance, maxDistance, density, mode) {
            if (fogColor === void 0) { fogColor = new feng3d.Color(); }
            if (minDistance === void 0) { minDistance = 0; }
            if (maxDistance === void 0) { maxDistance = 100; }
            if (density === void 0) { density = 0.1; }
            if (mode === void 0) { mode = FogMode.LINEAR; }
            var _this = _super.call(this) || this;
            /**
             * 是否生效
             */
            _this.enable = false;
            /**
             * 出现雾效果的最近距离
             */
            _this.minDistance = 0;
            /**
             * 最远距离
             */
            _this.maxDistance = 100;
            _this.fogColor = fogColor;
            _this.minDistance = minDistance;
            _this.maxDistance = maxDistance;
            _this.density = density;
            _this.mode = mode;
            //
            _this.createUniformData("u_fogColor", function () { return _this.fogColor; });
            _this.createUniformData("u_fogMinDistance", function () { return _this.minDistance; });
            _this.createUniformData("u_fogMaxDistance", function () { return _this.maxDistance; });
            _this.createUniformData("u_fogDensity", function () { return _this.density; });
            _this.createUniformData("u_fogMode", function () { return _this.mode; });
            _this.createBoolMacro("HAS_FOG_METHOD", _this.enable);
            _this.createAddMacro("V_GLOBAL_POSITION_NEED", 1);
            return _this;
        }
        FogMethod.prototype.enableChanged = function () {
            this.createBoolMacro("HAS_FOG_METHOD", this.enable);
        };
        __decorate([
            feng3d.watch("enableChanged"),
            feng3d.serialize(),
            feng3d.oav()
        ], FogMethod.prototype, "enable", void 0);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], FogMethod.prototype, "minDistance", void 0);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], FogMethod.prototype, "maxDistance", void 0);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], FogMethod.prototype, "fogColor", void 0);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], FogMethod.prototype, "density", void 0);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], FogMethod.prototype, "mode", void 0);
        return FogMethod;
    }(feng3d.RenderDataHolder));
    feng3d.FogMethod = FogMethod;
    /**
     * 雾模式
     */
    var FogMode;
    (function (FogMode) {
        FogMode[FogMode["NONE"] = 0] = "NONE";
        FogMode[FogMode["EXP"] = 1] = "EXP";
        FogMode[FogMode["EXP2"] = 2] = "EXP2";
        FogMode[FogMode["LINEAR"] = 3] = "LINEAR";
    })(FogMode = feng3d.FogMode || (feng3d.FogMode = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 环境映射函数
     */
    var EnvMapMethod = /** @class */ (function (_super) {
        __extends(EnvMapMethod, _super);
        /**
         * 创建EnvMapMethod实例
         * @param envMap		        环境映射贴图
         * @param reflectivity			反射率
         */
        function EnvMapMethod() {
            var _this = _super.call(this) || this;
            /**
             * 反射率
             */
            _this.reflectivity = 1;
            //
            _this.createUniformData("s_envMap", function () { return _this.cubeTexture; });
            _this.createUniformData("u_reflectivity", function () { return _this.reflectivity; });
            return _this;
        }
        EnvMapMethod.prototype.enableChanged = function () {
            this.createBoolMacro("HAS_ENV_METHOD", !!this.cubeTexture);
        };
        __decorate([
            feng3d.watch("enableChanged"),
            feng3d.serialize(),
            feng3d.oav()
        ], EnvMapMethod.prototype, "cubeTexture", void 0);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], EnvMapMethod.prototype, "reflectivity", void 0);
        return EnvMapMethod;
    }(feng3d.RenderDataHolder));
    feng3d.EnvMapMethod = EnvMapMethod;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 灯光类型
     * @author feng 2016-12-12
     */
    var LightType;
    (function (LightType) {
        /**
         * 点光
         */
        LightType[LightType["Point"] = 0] = "Point";
        /**
         * 方向光
         */
        LightType[LightType["Directional"] = 1] = "Directional";
        /**
         * 聚光灯
         */
        LightType[LightType["Spot"] = 2] = "Spot";
    })(LightType = feng3d.LightType || (feng3d.LightType = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 灯光
     * @author feng 2016-12-12
     */
    var Light = /** @class */ (function (_super) {
        __extends(Light, _super);
        function Light() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * 颜色
             */
            _this.color = new feng3d.Color();
            /**
             * 光照强度
             */
            _this.intensity = 1;
            /**
             * 是否生成阴影（未实现）
             */
            _this.castsShadows = false;
            _this._shadowMap = new feng3d.Texture2D();
            return _this;
        }
        Object.defineProperty(Light.prototype, "shadowMap", {
            get: function () {
                return this._shadowMap;
            },
            enumerable: true,
            configurable: true
        });
        Light.prototype.init = function (gameObject) {
            _super.prototype.init.call(this, gameObject);
        };
        __decorate([
            feng3d.serialize()
        ], Light.prototype, "lightType", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], Light.prototype, "color", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], Light.prototype, "intensity", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], Light.prototype, "castsShadows", void 0);
        return Light;
    }(feng3d.Component));
    feng3d.Light = Light;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 方向光源
     * @author feng 2016-12-13
     */
    var DirectionalLight = /** @class */ (function (_super) {
        __extends(DirectionalLight, _super);
        function DirectionalLight() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * 构建
         */
        DirectionalLight.prototype.init = function (gameObject) {
            _super.prototype.init.call(this, gameObject);
            this.lightType = feng3d.LightType.Directional;
        };
        return DirectionalLight;
    }(feng3d.Light));
    feng3d.DirectionalLight = DirectionalLight;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 点光源
     * @author feng 2016-12-13
     */
    var PointLight = /** @class */ (function (_super) {
        __extends(PointLight, _super);
        function PointLight() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * 光照范围
             */
            _this.range = 10;
            return _this;
        }
        /**
         * 构建
         */
        PointLight.prototype.init = function (gameObject) {
            _super.prototype.init.call(this, gameObject);
            this.lightType = feng3d.LightType.Point;
        };
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], PointLight.prototype, "range", void 0);
        return PointLight;
    }(feng3d.Light));
    feng3d.PointLight = PointLight;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var ControllerBase = /** @class */ (function () {
        /**
         * 控制器基类，用于动态调整3D对象的属性
         */
        function ControllerBase(targetObject) {
            this.targetObject = targetObject;
        }
        /**
         * 手动应用更新到目标3D对象
         */
        ControllerBase.prototype.update = function (interpolate) {
            if (interpolate === void 0) { interpolate = true; }
            throw new Error("Abstract method");
        };
        Object.defineProperty(ControllerBase.prototype, "targetObject", {
            get: function () {
                return this._targetObject;
            },
            set: function (val) {
                this._targetObject = val;
            },
            enumerable: true,
            configurable: true
        });
        return ControllerBase;
    }());
    feng3d.ControllerBase = ControllerBase;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var LookAtController = /** @class */ (function (_super) {
        __extends(LookAtController, _super);
        function LookAtController(target, lookAtObject) {
            var _this = _super.call(this, target) || this;
            _this._origin = new feng3d.Vector3D(0.0, 0.0, 0.0);
            _this._upAxis = feng3d.Vector3D.Y_AXIS;
            _this._pos = new feng3d.Vector3D();
            if (lookAtObject)
                _this.lookAtObject = lookAtObject;
            else
                _this.lookAtPosition = new feng3d.Vector3D();
            return _this;
        }
        Object.defineProperty(LookAtController.prototype, "upAxis", {
            get: function () {
                return this._upAxis;
            },
            set: function (upAxis) {
                this._upAxis = upAxis;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LookAtController.prototype, "lookAtPosition", {
            get: function () {
                return this._lookAtPosition;
            },
            set: function (val) {
                this._lookAtPosition = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LookAtController.prototype, "lookAtObject", {
            get: function () {
                return this._lookAtObject;
            },
            set: function (value) {
                if (this._lookAtObject == value)
                    return;
                this._lookAtObject = value;
            },
            enumerable: true,
            configurable: true
        });
        LookAtController.prototype.update = function (interpolate) {
            if (interpolate === void 0) { interpolate = true; }
            if (this._targetObject) {
                if (this._lookAtPosition) {
                    this._targetObject.transform.lookAt(this.lookAtPosition, this._upAxis);
                }
                else if (this._lookAtObject) {
                    this._pos = this._lookAtObject.transform.position;
                    this._targetObject.transform.lookAt(this._pos, this._upAxis);
                }
            }
        };
        return LookAtController;
    }(feng3d.ControllerBase));
    feng3d.LookAtController = LookAtController;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var HoverController = /** @class */ (function (_super) {
        __extends(HoverController, _super);
        function HoverController(targetObject, lookAtObject, panAngle, tiltAngle, distance, minTiltAngle, maxTiltAngle, minPanAngle, maxPanAngle, steps, yFactor, wrapPanAngle) {
            if (panAngle === void 0) { panAngle = 0; }
            if (tiltAngle === void 0) { tiltAngle = 90; }
            if (distance === void 0) { distance = 1000; }
            if (minTiltAngle === void 0) { minTiltAngle = -90; }
            if (maxTiltAngle === void 0) { maxTiltAngle = 90; }
            if (minPanAngle === void 0) { minPanAngle = NaN; }
            if (maxPanAngle === void 0) { maxPanAngle = NaN; }
            if (steps === void 0) { steps = 8; }
            if (yFactor === void 0) { yFactor = 2; }
            if (wrapPanAngle === void 0) { wrapPanAngle = false; }
            var _this = _super.call(this, targetObject, lookAtObject) || this;
            _this._currentPanAngle = 0;
            _this._currentTiltAngle = 90;
            _this._panAngle = 0;
            _this._tiltAngle = 90;
            _this._distance = 1000;
            _this._minPanAngle = -Infinity;
            _this._maxPanAngle = Infinity;
            _this._minTiltAngle = -90;
            _this._maxTiltAngle = 90;
            _this._steps = 8;
            _this._yFactor = 2;
            _this._wrapPanAngle = false;
            _this.distance = distance;
            _this.panAngle = panAngle;
            _this.tiltAngle = tiltAngle;
            _this.minPanAngle = minPanAngle || -Infinity;
            _this.maxPanAngle = maxPanAngle || Infinity;
            _this.minTiltAngle = minTiltAngle;
            _this.maxTiltAngle = maxTiltAngle;
            _this.steps = steps;
            _this.yFactor = yFactor;
            _this.wrapPanAngle = wrapPanAngle;
            _this._currentPanAngle = _this._panAngle;
            _this._currentTiltAngle = _this._tiltAngle;
            return _this;
        }
        Object.defineProperty(HoverController.prototype, "steps", {
            get: function () {
                return this._steps;
            },
            set: function (val) {
                val = (val < 1) ? 1 : val;
                if (this._steps == val)
                    return;
                this._steps = val;
                this.update();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HoverController.prototype, "panAngle", {
            get: function () {
                return this._panAngle;
            },
            set: function (val) {
                val = Math.max(this._minPanAngle, Math.min(this._maxPanAngle, val));
                if (this._panAngle == val)
                    return;
                this._panAngle = val;
                this.update();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HoverController.prototype, "tiltAngle", {
            get: function () {
                return this._tiltAngle;
            },
            set: function (val) {
                val = Math.max(this._minTiltAngle, Math.min(this._maxTiltAngle, val));
                if (this._tiltAngle == val)
                    return;
                this._tiltAngle = val;
                this.update();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HoverController.prototype, "distance", {
            get: function () {
                return this._distance;
            },
            set: function (val) {
                if (this._distance == val)
                    return;
                this._distance = val;
                this.update();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HoverController.prototype, "minPanAngle", {
            get: function () {
                return this._minPanAngle;
            },
            set: function (val) {
                if (this._minPanAngle == val)
                    return;
                this._minPanAngle = val;
                this.panAngle = Math.max(this._minPanAngle, Math.min(this._maxPanAngle, this._panAngle));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HoverController.prototype, "maxPanAngle", {
            get: function () {
                return this._maxPanAngle;
            },
            set: function (val) {
                if (this._maxPanAngle == val)
                    return;
                this._maxPanAngle = val;
                this.panAngle = Math.max(this._minPanAngle, Math.min(this._maxPanAngle, this._panAngle));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HoverController.prototype, "minTiltAngle", {
            get: function () {
                return this._minTiltAngle;
            },
            set: function (val) {
                if (this._minTiltAngle == val)
                    return;
                this._minTiltAngle = val;
                this.tiltAngle = Math.max(this._minTiltAngle, Math.min(this._maxTiltAngle, this._tiltAngle));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HoverController.prototype, "maxTiltAngle", {
            get: function () {
                return this._maxTiltAngle;
            },
            set: function (val) {
                if (this._maxTiltAngle == val)
                    return;
                this._maxTiltAngle = val;
                this.tiltAngle = Math.max(this._minTiltAngle, Math.min(this._maxTiltAngle, this._tiltAngle));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HoverController.prototype, "yFactor", {
            get: function () {
                return this._yFactor;
            },
            set: function (val) {
                if (this._yFactor == val)
                    return;
                this._yFactor = val;
                this.update();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HoverController.prototype, "wrapPanAngle", {
            get: function () {
                return this._wrapPanAngle;
            },
            set: function (val) {
                if (this._wrapPanAngle == val)
                    return;
                this._wrapPanAngle = val;
                this.update();
            },
            enumerable: true,
            configurable: true
        });
        HoverController.prototype.update = function (interpolate) {
            if (interpolate === void 0) { interpolate = true; }
            if (this._tiltAngle != this._currentTiltAngle || this._panAngle != this._currentPanAngle) {
                if (this._wrapPanAngle) {
                    if (this._panAngle < 0) {
                        this._currentPanAngle += this._panAngle % 360 + 360 - this._panAngle;
                        this._panAngle = this._panAngle % 360 + 360;
                    }
                    else {
                        this._currentPanAngle += this._panAngle % 360 - this._panAngle;
                        this._panAngle = this._panAngle % 360;
                    }
                    while (this._panAngle - this._currentPanAngle < -180)
                        this._currentPanAngle -= 360;
                    while (this._panAngle - this._currentPanAngle > 180)
                        this._currentPanAngle += 360;
                }
                if (interpolate) {
                    this._currentTiltAngle += (this._tiltAngle - this._currentTiltAngle) / (this.steps + 1);
                    this._currentPanAngle += (this._panAngle - this._currentPanAngle) / (this.steps + 1);
                }
                else {
                    this._currentPanAngle = this._panAngle;
                    this._currentTiltAngle = this._tiltAngle;
                }
                if ((Math.abs(this.tiltAngle - this._currentTiltAngle) < 0.01) && (Math.abs(this._panAngle - this._currentPanAngle) < 0.01)) {
                    this._currentTiltAngle = this._tiltAngle;
                    this._currentPanAngle = this._panAngle;
                }
            }
            if (!this._targetObject)
                return;
            if (this._lookAtPosition) {
                this._pos.x = this._lookAtPosition.x;
                this._pos.y = this._lookAtPosition.y;
                this._pos.z = this._lookAtPosition.z;
            }
            else if (this._lookAtObject) {
                if (this._targetObject.transform.parent && this._lookAtObject.transform.parent) {
                    if (this._targetObject.transform.parent != this._lookAtObject.transform.parent) {
                        this._pos.x = this._lookAtObject.transform.scenePosition.x;
                        this._pos.y = this._lookAtObject.transform.scenePosition.y;
                        this._pos.z = this._lookAtObject.transform.scenePosition.z;
                        this._targetObject.transform.parent.worldToLocalMatrix.transformVector(this._pos, this._pos);
                    }
                    else {
                        this._pos.copyFrom(this._lookAtObject.transform.position);
                    }
                }
                else if (this._lookAtObject.scene) {
                    this._pos.x = this._lookAtObject.transform.scenePosition.x;
                    this._pos.y = this._lookAtObject.transform.scenePosition.y;
                    this._pos.z = this._lookAtObject.transform.scenePosition.z;
                }
                else {
                    this._pos.copyFrom(this._lookAtObject.transform.position);
                }
            }
            else {
                this._pos.x = this._origin.x;
                this._pos.y = this._origin.y;
                this._pos.z = this._origin.z;
            }
            this._targetObject.transform.x = this._pos.x + this._distance * Math.sin(this._currentPanAngle * Math.DEG2RAD) * Math.cos(this._currentTiltAngle * Math.DEG2RAD);
            this._targetObject.transform.z = this._pos.z + this._distance * Math.cos(this._currentPanAngle * Math.DEG2RAD) * Math.cos(this._currentTiltAngle * Math.DEG2RAD);
            this._targetObject.transform.y = this._pos.y + this._distance * Math.sin(this._currentTiltAngle * Math.DEG2RAD) * this._yFactor;
            _super.prototype.update.call(this);
        };
        return HoverController;
    }(feng3d.LookAtController));
    feng3d.HoverController = HoverController;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * FPS模式控制器
     * @author feng 2016-12-19
     */
    var FPSController = /** @class */ (function (_super) {
        __extends(FPSController, _super);
        function FPSController() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.ischange = false;
            return _this;
        }
        Object.defineProperty(FPSController.prototype, "auto", {
            get: function () {
                return this._auto;
            },
            set: function (value) {
                if (this._auto == value)
                    return;
                if (this._auto) {
                    feng3d.windowEventProxy.off("mousedown", this.onMousedown, this);
                    feng3d.windowEventProxy.off("mouseup", this.onMouseup, this);
                    feng3d.ticker.offframe(this.update, this);
                    this.onMouseup();
                }
                this._auto = value;
                if (this._auto) {
                    feng3d.ticker.onframe(this.update, this);
                    feng3d.windowEventProxy.on("mousedown", this.onMousedown, this);
                    feng3d.windowEventProxy.on("mouseup", this.onMouseup, this);
                }
            },
            enumerable: true,
            configurable: true
        });
        FPSController.prototype.init = function (gameobject) {
            _super.prototype.init.call(this, gameobject);
            this.keyDirectionDic = {};
            this.keyDirectionDic["a"] = new feng3d.Vector3D(-1, 0, 0); //左
            this.keyDirectionDic["d"] = new feng3d.Vector3D(1, 0, 0); //右
            this.keyDirectionDic["w"] = new feng3d.Vector3D(0, 0, 1); //前
            this.keyDirectionDic["s"] = new feng3d.Vector3D(0, 0, -1); //后
            this.keyDirectionDic["e"] = new feng3d.Vector3D(0, 1, 0); //上
            this.keyDirectionDic["q"] = new feng3d.Vector3D(0, -1, 0); //下
            this.keyDownDic = {};
            this.acceleration = 0.0005;
            this.auto = true;
        };
        FPSController.prototype.onMousedown = function () {
            this.ischange = true;
            this.preMousePoint = null;
            this.mousePoint = null;
            this.velocity = new feng3d.Vector3D();
            this.keyDownDic = {};
            feng3d.windowEventProxy.on("keydown", this.onKeydown, this);
            feng3d.windowEventProxy.on("keyup", this.onKeyup, this);
            feng3d.windowEventProxy.on("mousemove", this.onMouseMove, this);
        };
        FPSController.prototype.onMouseup = function () {
            this.ischange = false;
            this.preMousePoint = null;
            this.mousePoint = null;
            feng3d.windowEventProxy.off("keydown", this.onKeydown, this);
            feng3d.windowEventProxy.off("keyup", this.onKeyup, this);
            feng3d.windowEventProxy.off("mousemove", this.onMouseMove, this);
        };
        /**
         * 销毁
         */
        FPSController.prototype.dispose = function () {
            this.auto = false;
        };
        /**
         * 手动应用更新到目标3D对象
         */
        FPSController.prototype.update = function () {
            if (!this.ischange)
                return;
            if (this.mousePoint && this.preMousePoint) {
                //计算旋转
                var offsetPoint = this.mousePoint.subtract(this.preMousePoint);
                offsetPoint.x *= 0.15;
                offsetPoint.y *= 0.15;
                // this.targetObject.transform.rotate(Vector3D.X_AXIS, offsetPoint.y, this.targetObject.transform.position);
                // this.targetObject.transform.rotate(Vector3D.Y_AXIS, offsetPoint.x, this.targetObject.transform.position);
                var matrix3d = this.transform.localToWorldMatrix;
                matrix3d.appendRotation(matrix3d.right, offsetPoint.y, matrix3d.position);
                var up = feng3d.Vector3D.Y_AXIS;
                if (matrix3d.up.dotProduct(up) < 0) {
                    up = up.clone();
                    up.scaleBy(-1);
                }
                matrix3d.appendRotation(up, offsetPoint.x, matrix3d.position);
                this.transform.localToWorldMatrix = matrix3d;
                //
                this.preMousePoint = this.mousePoint;
                this.mousePoint = null;
            }
            //计算加速度
            var accelerationVec = new feng3d.Vector3D();
            for (var key in this.keyDirectionDic) {
                if (this.keyDownDic[key] == true) {
                    var element = this.keyDirectionDic[key];
                    accelerationVec.incrementBy(element);
                }
            }
            accelerationVec.scaleBy(this.acceleration);
            //计算速度
            this.velocity.incrementBy(accelerationVec);
            var right = this.transform.rightVector;
            var up = this.transform.upVector;
            var forward = this.transform.forwardVector;
            right.scaleBy(this.velocity.x);
            up.scaleBy(this.velocity.y);
            forward.scaleBy(this.velocity.z);
            //计算位移
            var displacement = right.clone();
            displacement.incrementBy(up);
            displacement.incrementBy(forward);
            this.transform.x += displacement.x;
            this.transform.y += displacement.y;
            this.transform.z += displacement.z;
        };
        /**
         * 处理鼠标移动事件
         */
        FPSController.prototype.onMouseMove = function (event) {
            this.mousePoint = new feng3d.Point(event.clientX, event.clientY);
            if (this.preMousePoint == null) {
                this.preMousePoint = this.mousePoint;
                this.mousePoint = null;
            }
        };
        /**
         * 键盘按下事件
         */
        FPSController.prototype.onKeydown = function (event) {
            var boardKey = String.fromCharCode(event.keyCode).toLocaleLowerCase();
            if (this.keyDirectionDic[boardKey] == null)
                return;
            if (!this.keyDownDic[boardKey])
                this.stopDirectionVelocity(this.keyDirectionDic[boardKey]);
            this.keyDownDic[boardKey] = true;
        };
        /**
         * 键盘弹起事件
         */
        FPSController.prototype.onKeyup = function (event) {
            var boardKey = String.fromCharCode(event.keyCode).toLocaleLowerCase();
            if (this.keyDirectionDic[boardKey] == null)
                return;
            this.keyDownDic[boardKey] = false;
            this.stopDirectionVelocity(this.keyDirectionDic[boardKey]);
        };
        /**
         * 停止xyz方向运动
         * @param direction     停止运动的方向
         */
        FPSController.prototype.stopDirectionVelocity = function (direction) {
            if (direction == null)
                return;
            if (direction.x != 0) {
                this.velocity.x = 0;
            }
            if (direction.y != 0) {
                this.velocity.y = 0;
            }
            if (direction.z != 0) {
                this.velocity.z = 0;
            }
        };
        __decorate([
            feng3d.oav()
        ], FPSController.prototype, "acceleration", void 0);
        return FPSController;
    }(feng3d.Component));
    feng3d.FPSController = FPSController;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 使用纯计算与实体相交
     */
    feng3d.as3PickingCollider = {
        testSubMeshCollision: testSubMeshCollision,
    };
    /** 是否查找最短距离碰撞 */
    function testSubMeshCollision(geometry, localRay, shortestCollisionDistance, bothSides, findClosest) {
        if (shortestCollisionDistance === void 0) { shortestCollisionDistance = 0; }
        if (bothSides === void 0) { bothSides = true; }
        if (findClosest === void 0) { findClosest = false; }
        var indexData = geometry.indices;
        var vertexData = geometry.positions;
        var uvData = geometry.uvs;
        var t = 0;
        var i0 = 0, i1 = 0, i2 = 0;
        var rx = 0, ry = 0, rz = 0;
        var nx = 0, ny = 0, nz = 0;
        var cx = 0, cy = 0, cz = 0;
        var coeff = 0, u = 0, v = 0, w = 0;
        var p0x = 0, p0y = 0, p0z = 0;
        var p1x = 0, p1y = 0, p1z = 0;
        var p2x = 0, p2y = 0, p2z = 0;
        var s0x = 0, s0y = 0, s0z = 0;
        var s1x = 0, s1y = 0, s1z = 0;
        var nl = 0, nDotV = 0, D = 0, disToPlane = 0;
        var Q1Q2 = 0, Q1Q1 = 0, Q2Q2 = 0, RQ1 = 0, RQ2 = 0;
        var collisionTriangleIndex = -1;
        var vertexStride = 3;
        var vertexOffset = 0;
        var uvStride = 2;
        var numIndices = indexData.length;
        var result = {};
        //遍历每个三角形 检测碰撞
        for (var index = 0; index < numIndices; index += 3) {
            //三角形三个顶点索引
            i0 = vertexOffset + indexData[index] * vertexStride;
            i1 = vertexOffset + indexData[index + 1] * vertexStride;
            i2 = vertexOffset + indexData[index + 2] * vertexStride;
            //三角形三个顶点数据
            p0x = vertexData[i0];
            p0y = vertexData[i0 + 1];
            p0z = vertexData[i0 + 2];
            p1x = vertexData[i1];
            p1y = vertexData[i1 + 1];
            p1z = vertexData[i1 + 2];
            p2x = vertexData[i2];
            p2y = vertexData[i2 + 1];
            p2z = vertexData[i2 + 2];
            //计算出三角面的法线
            s0x = p1x - p0x; // s0 = p1 - p0
            s0y = p1y - p0y;
            s0z = p1z - p0z;
            s1x = p2x - p0x; // s1 = p2 - p0
            s1y = p2y - p0y;
            s1z = p2z - p0z;
            nx = s0y * s1z - s0z * s1y; // n = s0 x s1
            ny = s0z * s1x - s0x * s1z;
            nz = s0x * s1y - s0y * s1x;
            nl = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz); // normalize n
            nx *= nl;
            ny *= nl;
            nz *= nl;
            //初始化射线数据
            var rayPosition = localRay.position;
            var rayDirection = localRay.direction;
            //计算射线与法线的点积，不等于零表示射线所在直线与三角面相交
            nDotV = nx * rayDirection.x + ny * +rayDirection.y + nz * rayDirection.z; // rayDirection . normal
            //判断射线是否与三角面相交
            if ((!bothSides && nDotV < 0.0) || (bothSides && nDotV != 0.0)) {
                //计算平面方程D值，参考Plane3D
                D = -(nx * p0x + ny * p0y + nz * p0z);
                //射线点到平面的距离
                disToPlane = -(nx * rayPosition.x + ny * rayPosition.y + nz * rayPosition.z + D);
                t = disToPlane / nDotV;
                //得到交点
                cx = rayPosition.x + t * rayDirection.x;
                cy = rayPosition.y + t * rayDirection.y;
                cz = rayPosition.z + t * rayDirection.z;
                //判断交点是否在三角形内( using barycentric coordinates )
                Q1Q2 = s0x * s1x + s0y * s1y + s0z * s1z;
                Q1Q1 = s0x * s0x + s0y * s0y + s0z * s0z;
                Q2Q2 = s1x * s1x + s1y * s1y + s1z * s1z;
                rx = cx - p0x;
                ry = cy - p0y;
                rz = cz - p0z;
                RQ1 = rx * s0x + ry * s0y + rz * s0z;
                RQ2 = rx * s1x + ry * s1y + rz * s1z;
                coeff = 1 / (Q1Q1 * Q2Q2 - Q1Q2 * Q1Q2);
                v = coeff * (Q2Q2 * RQ1 - Q1Q2 * RQ2);
                w = coeff * (-Q1Q2 * RQ1 + Q1Q1 * RQ2);
                if (v < 0)
                    continue;
                if (w < 0)
                    continue;
                u = 1 - v - w;
                //u v w都大于0表示点在三角形内 射线的坐标t大于0表示射线朝向三角面
                if (!(u < 0) && t > 0 && t < shortestCollisionDistance) {
                    shortestCollisionDistance = t;
                    collisionTriangleIndex = index / 3;
                    result.rayEntryDistance = t;
                    result.localPosition = new feng3d.Vector3D(cx, cy, cz);
                    result.localNormal = new feng3d.Vector3D(nx, ny, nz);
                    if (uvData) {
                        result.uv = getCollisionUV(indexData, uvData, index, v, w, u, 0, uvStride);
                    }
                    result.index = index;
                    //是否继续寻找最优解
                    if (!findClosest)
                        return result;
                }
            }
        }
        if (collisionTriangleIndex >= 0)
            return result;
        return null;
    }
    /**
     * 获取碰撞法线
     * @param indexData 顶点索引数据
     * @param vertexData 顶点数据
     * @param triangleIndex 三角形索引
     * @param normal 碰撞法线
     * @return 碰撞法线
     *
     */
    function getCollisionNormal(indexData, vertexData, triangleIndex, normal) {
        if (triangleIndex === void 0) { triangleIndex = 0; }
        var i0 = indexData[triangleIndex] * 3;
        var i1 = indexData[triangleIndex + 1] * 3;
        var i2 = indexData[triangleIndex + 2] * 3;
        var side0x = vertexData[i1] - vertexData[i0];
        var side0y = vertexData[i1 + 1] - vertexData[i0 + 1];
        var side0z = vertexData[i1 + 2] - vertexData[i0 + 2];
        var side1x = vertexData[i2] - vertexData[i0];
        var side1y = vertexData[i2 + 1] - vertexData[i0 + 1];
        var side1z = vertexData[i2 + 2] - vertexData[i0 + 2];
        if (!normal)
            normal = new feng3d.Vector3D();
        normal.x = side0y * side1z - side0z * side1y;
        normal.y = side0z * side1x - side0x * side1z;
        normal.z = side0x * side1y - side0y * side1x;
        normal.w = 1;
        normal.normalize();
        return normal;
    }
    /**
     * 获取碰撞uv
     * @param indexData 顶点数据
     * @param uvData uv数据
     * @param triangleIndex 三角形所有
     * @param v
     * @param w
     * @param u
     * @param uvOffset
     * @param uvStride
     * @param uv uv坐标
     * @return 碰撞uv
     */
    function getCollisionUV(indexData, uvData, triangleIndex, v, w, u, uvOffset, uvStride, uv) {
        var uIndex = indexData[triangleIndex] * uvStride + uvOffset;
        var uv0x = uvData[uIndex];
        var uv0y = uvData[uIndex + 1];
        uIndex = indexData[triangleIndex + 1] * uvStride + uvOffset;
        var uv1x = uvData[uIndex];
        var uv1y = uvData[uIndex + 1];
        uIndex = indexData[triangleIndex + 2] * uvStride + uvOffset;
        var uv2x = uvData[uIndex];
        var uv2y = uvData[uIndex + 1];
        if (!uv)
            uv = new feng3d.Point();
        uv.x = u * uv0x + v * uv1x + w * uv2x;
        uv.y = u * uv0y + v * uv1y + w * uv2y;
        return uv;
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 射线投射拾取器
     * @author feng 2014-4-29
     */
    feng3d.raycastPicker = {
        pick: pick
    };
    /**
     * 获取射线穿过的实体
     * @param ray3D 射线
     * @param entitys 实体列表
     * @return
     */
    function pick(ray3D, entitys, findClosest) {
        if (findClosest === void 0) { findClosest = false; }
        var entities = [];
        if (entitys.length == 0)
            return null;
        entitys.forEach(function (entity) {
            var boundingComponent = entity.getComponent(feng3d.BoundingComponent);
            var pickingCollisionVO = boundingComponent && boundingComponent.isIntersectingRay(ray3D);
            if (pickingCollisionVO)
                entities.push(pickingCollisionVO);
        });
        if (entities.length == 0)
            return null;
        return getPickingCollisionVO(entities, findClosest);
    }
    /**
     *获取射线穿过的实体
     */
    function getPickingCollisionVO(entities, findClosest) {
        // Sort entities from closest to furthest.
        entities = entities.sort(function (entity1, entity2) {
            return entity1.rayEntryDistance - entity2.rayEntryDistance;
        });
        // ---------------------------------------------------------------------
        // Evaluate triangle collisions when needed.
        // Replaces collision data provided by bounds collider with more precise data.
        // ---------------------------------------------------------------------
        var shortestCollisionDistance = Number.MAX_VALUE;
        var bestCollisionVO = null;
        var pickingCollisionVO;
        var i;
        for (i = 0; i < entities.length; ++i) {
            pickingCollisionVO = entities[i];
            if (feng3d.as3PickingCollider) {
                // If a collision exists, update the collision data and stop all checks.
                if ((bestCollisionVO == null || pickingCollisionVO.rayEntryDistance < bestCollisionVO.rayEntryDistance) && collidesBefore(pickingCollisionVO, shortestCollisionDistance, findClosest)) {
                    shortestCollisionDistance = pickingCollisionVO.rayEntryDistance;
                    bestCollisionVO = pickingCollisionVO;
                    if (!findClosest) {
                        updateLocalPosition(pickingCollisionVO);
                        return pickingCollisionVO;
                    }
                }
            }
            else if (bestCollisionVO == null || pickingCollisionVO.rayEntryDistance < bestCollisionVO.rayEntryDistance) {
                // Note: a bounds collision with a ray origin inside its bounds is ONLY ever used
                // to enable the detection of a corresponsding triangle collision.
                // Therefore, bounds collisions with a ray origin inside its bounds can be ignored
                // if it has been established that there is NO triangle collider to test
                if (!pickingCollisionVO.rayOriginIsInsideBounds) {
                    updateLocalPosition(pickingCollisionVO);
                    return pickingCollisionVO;
                }
            }
        }
        return bestCollisionVO;
    }
    /**
     * 更新碰撞本地坐标
     * @param pickingCollisionVO
     */
    function updateLocalPosition(pickingCollisionVO) {
        pickingCollisionVO.localPosition = pickingCollisionVO.localRay.getPoint(pickingCollisionVO.rayEntryDistance);
    }
    /**
     * 碰撞前设置碰撞状态
     * @param shortestCollisionDistance 最短碰撞距离
     * @param findClosest 是否寻找最优碰撞
     * @return
     */
    function collidesBefore(pickingCollisionVO, shortestCollisionDistance, findClosest) {
        var result = feng3d.as3PickingCollider.testSubMeshCollision(pickingCollisionVO.geometry, pickingCollisionVO.localRay, shortestCollisionDistance, true, findClosest);
        if (result) {
            pickingCollisionVO.rayEntryDistance = result.rayEntryDistance;
            pickingCollisionVO.index = result.index;
            pickingCollisionVO.localNormal = result.localNormal;
            pickingCollisionVO.localPosition = result.localPosition;
            pickingCollisionVO.uv = result.uv;
            //
            shortestCollisionDistance = pickingCollisionVO.rayEntryDistance;
            return true;
        }
        return false;
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 地形几何体
     * @author feng 2016-04-28
     */
    var TerrainGeometry = /** @class */ (function (_super) {
        __extends(TerrainGeometry, _super);
        /**
         * 创建高度地形 拥有segmentsW*segmentsH个顶点
         * @param    heightMap	高度图
         * @param    width	地形宽度
         * @param    height	地形高度
         * @param    depth	地形深度
         * @param    segmentsW	x轴上网格段数
         * @param    segmentsH	y轴上网格段数
         * @param    maxElevation	最大地形高度
         * @param    minElevation	最小地形高度
         */
        function TerrainGeometry(heightMapUrl, width, height, depth, segmentsW, segmentsH, maxElevation, minElevation) {
            if (width === void 0) { width = 10; }
            if (height === void 0) { height = 1; }
            if (depth === void 0) { depth = 10; }
            if (segmentsW === void 0) { segmentsW = 30; }
            if (segmentsH === void 0) { segmentsH = 30; }
            if (maxElevation === void 0) { maxElevation = 255; }
            if (minElevation === void 0) { minElevation = 0; }
            var _this = _super.call(this) || this;
            _this._width = 10;
            _this._height = 1;
            _this._depth = 10;
            _this._segmentsW = 30;
            _this._segmentsH = 30;
            _this._maxElevation = 255;
            _this._minElevation = 0;
            _this.width = width;
            _this.height = height;
            _this.depth = depth;
            _this.segmentsW = segmentsW;
            _this.segmentsH = segmentsH;
            _this.maxElevation = maxElevation;
            _this.minElevation = minElevation;
            _this._heightImage = new Image();
            _this._heightImage.crossOrigin = "Anonymous";
            _this._heightImage.addEventListener("load", _this.onHeightMapLoad.bind(_this));
            _this.heightMapUrl = heightMapUrl;
            return _this;
        }
        Object.defineProperty(TerrainGeometry.prototype, "heightMapUrl", {
            get: function () {
                return this._heightImage.src;
            },
            set: function (value) {
                if (this._heightImage.src == value)
                    return;
                this._heightImage.src = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerrainGeometry.prototype, "width", {
            get: function () {
                return this._width;
            },
            set: function (value) {
                if (this._width == value)
                    return;
                this._width = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerrainGeometry.prototype, "height", {
            get: function () {
                return this._height;
            },
            set: function (value) {
                if (this._height == value)
                    return;
                this._height = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerrainGeometry.prototype, "depth", {
            get: function () {
                return this._depth;
            },
            set: function (value) {
                if (this._depth == value)
                    return;
                this._depth = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerrainGeometry.prototype, "segmentsW", {
            get: function () {
                return this._segmentsW;
            },
            set: function (value) {
                if (this._segmentsW == value)
                    return;
                this._segmentsW = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerrainGeometry.prototype, "segmentsH", {
            get: function () {
                return this._segmentsH;
            },
            set: function (value) {
                if (this._segmentsH == value)
                    return;
                this._segmentsH = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerrainGeometry.prototype, "maxElevation", {
            get: function () {
                return this._maxElevation;
            },
            set: function (value) {
                if (this._maxElevation == value)
                    return;
                this._maxElevation = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerrainGeometry.prototype, "minElevation", {
            get: function () {
                return this._minElevation;
            },
            set: function (value) {
                if (this._minElevation == value)
                    return;
                this._minElevation = value;
                this.invalidateGeometry();
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 高度图加载完成
         */
        TerrainGeometry.prototype.onHeightMapLoad = function () {
            var canvasImg = document.createElement("canvas");
            canvasImg.width = this._heightImage.width;
            canvasImg.height = this._heightImage.height;
            var ctxt = canvasImg.getContext('2d');
            if (ctxt) {
                ctxt.drawImage(this._heightImage, 0, 0);
                var terrainHeightData = ctxt.getImageData(0, 0, this._heightImage.width, this._heightImage.height); //读取整张图片的像素。
                ctxt.putImageData(terrainHeightData, terrainHeightData.width, terrainHeightData.height);
                this._heightMap = terrainHeightData;
                this.invalidateGeometry();
            }
        };
        /**
         * 创建顶点坐标
         */
        TerrainGeometry.prototype.buildGeometry = function () {
            if (!this._heightMap)
                return;
            var x, z;
            var numInds = 0;
            var base = 0;
            //一排顶点数据
            var tw = this.segmentsW + 1;
            //总顶点数量
            var numVerts = (this.segmentsH + 1) * tw;
            //一个格子所占高度图X轴像素数
            var uDiv = (this._heightMap.width - 1) / this.segmentsW;
            //一个格子所占高度图Y轴像素数
            var vDiv = (this._heightMap.height - 1) / this.segmentsH;
            var u, v;
            var y;
            var vertices = [];
            var indices = [];
            numVerts = 0;
            var col;
            for (var zi = 0; zi <= this.segmentsH; ++zi) {
                for (var xi = 0; xi <= this.segmentsW; ++xi) {
                    //顶点坐标
                    x = (xi / this.segmentsW - .5) * this.width;
                    z = (zi / this.segmentsH - .5) * this.depth;
                    //格子对应高度图uv坐标
                    u = xi * uDiv;
                    v = (this.segmentsH - zi) * vDiv;
                    //获取颜色值
                    col = this.getPixel(this._heightMap, u, v) & 0xff;
                    //计算高度值
                    y = (col > this.maxElevation) ? (this.maxElevation / 0xff) * this.height : ((col < this.minElevation) ? (this.minElevation / 0xff) * this.height : (col / 0xff) * this.height);
                    //保存顶点坐标
                    vertices[numVerts++] = x;
                    vertices[numVerts++] = y;
                    vertices[numVerts++] = z;
                    if (xi != this.segmentsW && zi != this.segmentsH) {
                        //增加 一个顶点同时 生成一个格子或两个三角形
                        base = xi + zi * tw;
                        indices[numInds++] = base;
                        indices[numInds++] = base + tw;
                        indices[numInds++] = base + tw + 1;
                        indices[numInds++] = base;
                        indices[numInds++] = base + tw + 1;
                        indices[numInds++] = base + 1;
                    }
                }
            }
            var uvs = this.buildUVs();
            this.setVAData("a_position", vertices, 3);
            this.setVAData("a_uv", uvs, 2);
            this.indices = indices;
        };
        /**
         * 创建uv坐标
         */
        TerrainGeometry.prototype.buildUVs = function () {
            var numUvs = (this.segmentsH + 1) * (this.segmentsW + 1) * 2;
            var uvs = [];
            numUvs = 0;
            //计算每个顶点的uv坐标
            for (var yi = 0; yi <= this.segmentsH; ++yi) {
                for (var xi = 0; xi <= this.segmentsW; ++xi) {
                    uvs[numUvs++] = xi / this.segmentsW;
                    uvs[numUvs++] = 1 - yi / this.segmentsH;
                }
            }
            return uvs;
        };
        /**
         * 获取位置在（x，z）处的高度y值
         * @param x x坐标
         * @param z z坐标
         * @return 高度
         */
        TerrainGeometry.prototype.getHeightAt = function (x, z) {
            //得到高度图中的值
            var u = (x / this.width + .5) * (this._heightMap.width - 1);
            var v = (-z / this.depth + .5) * (this._heightMap.height - 1);
            var col = this.getPixel(this._heightMap, u, v) & 0xff;
            var h;
            if (col > this.maxElevation) {
                h = (this.maxElevation / 0xff) * this.height;
            }
            else if (col < this.minElevation) {
                h = (this.minElevation / 0xff) * this.height;
            }
            else {
                h = (col / 0xff) * this.height;
            }
            return h;
        };
        /**
         * 获取像素值
         */
        TerrainGeometry.prototype.getPixel = function (imageData, u, v) {
            //取整
            u = ~~u;
            v = ~~v;
            var index = (v * imageData.width + u) * 4;
            var data = imageData.data;
            var red = data[index]; //红色色深
            var green = data[index + 1]; //绿色色深
            var blue = data[index + 2]; //蓝色色深
            var alpha = data[index + 3]; //透明度
            return blue;
        };
        return TerrainGeometry;
    }(feng3d.Geometry));
    feng3d.TerrainGeometry = TerrainGeometry;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 地形材质
     * @author feng 2016-04-28
     */
    var TerrainMethod = /** @class */ (function (_super) {
        __extends(TerrainMethod, _super);
        /**
         * 构建材质
         */
        function TerrainMethod() {
            var _this = _super.call(this) || this;
            _this._splatRepeats = new feng3d.Vector3D(1, 1, 1, 1);
            _this.blendTexture = new feng3d.Texture2D();
            _this.splatTexture1 = new feng3d.Texture2D();
            _this.splatTexture2 = new feng3d.Texture2D();
            _this.splatTexture3 = new feng3d.Texture2D();
            _this.splatTexture1.generateMipmap = true;
            _this.splatTexture1.minFilter = feng3d.TextureMinFilter.LINEAR_MIPMAP_LINEAR;
            _this.splatTexture1.wrapS = feng3d.TextureWrap.REPEAT;
            _this.splatTexture1.wrapT = feng3d.TextureWrap.REPEAT;
            _this.splatTexture2.generateMipmap = true;
            _this.splatTexture2.minFilter = feng3d.TextureMinFilter.LINEAR_MIPMAP_LINEAR;
            _this.splatTexture2.wrapS = feng3d.TextureWrap.REPEAT;
            _this.splatTexture2.wrapT = feng3d.TextureWrap.REPEAT;
            _this.splatTexture3.generateMipmap = true;
            _this.splatTexture3.minFilter = feng3d.TextureMinFilter.LINEAR_MIPMAP_LINEAR;
            _this.splatTexture3.wrapS = feng3d.TextureWrap.REPEAT;
            _this.splatTexture3.wrapT = feng3d.TextureWrap.REPEAT;
            //
            _this.createUniformData("s_blendTexture", function () { return _this.blendTexture; });
            _this.createUniformData("s_splatTexture1", function () { return _this.splatTexture1; });
            _this.createUniformData("s_splatTexture2", function () { return _this.splatTexture2; });
            _this.createUniformData("s_splatTexture3", function () { return _this.splatTexture3; });
            _this.createUniformData("u_splatRepeats", function () { return _this.splatRepeats; });
            return _this;
        }
        Object.defineProperty(TerrainMethod.prototype, "splatTexture1", {
            get: function () {
                return this._splatTexture1;
            },
            set: function (value) {
                if (this._splatTexture1 == value)
                    return;
                if (this._splatTexture1)
                    this._splatTexture1.off("loaded", this.ontextureChanged, this);
                this._splatTexture1 = value;
                if (this._splatTexture1)
                    this._splatTexture1.on("loaded", this.ontextureChanged, this);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerrainMethod.prototype, "splatTexture2", {
            get: function () {
                return this._splatTexture2;
            },
            set: function (value) {
                if (this._splatTexture2 == value)
                    return;
                if (this._splatTexture2)
                    this._splatTexture2.off("loaded", this.ontextureChanged, this);
                this._splatTexture2 = value;
                if (this._splatTexture2)
                    this._splatTexture2.on("loaded", this.ontextureChanged, this);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerrainMethod.prototype, "splatTexture3", {
            get: function () {
                return this._splatTexture3;
            },
            set: function (value) {
                if (this._splatTexture3 == value)
                    return;
                if (this._splatTexture3)
                    this._splatTexture3.off("loaded", this.ontextureChanged, this);
                this._splatTexture3 = value;
                if (this._splatTexture3)
                    this._splatTexture3.on("loaded", this.ontextureChanged, this);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerrainMethod.prototype, "blendTexture", {
            get: function () {
                return this._blendTexture;
            },
            set: function (value) {
                if (this._blendTexture == value)
                    return;
                if (this._blendTexture)
                    this._blendTexture.off("loaded", this.ontextureChanged, this);
                this._blendTexture = value;
                if (this._blendTexture)
                    this._blendTexture.on("loaded", this.ontextureChanged, this);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerrainMethod.prototype, "splatRepeats", {
            get: function () {
                return this._splatRepeats;
            },
            set: function (value) {
                this._splatRepeats = value;
            },
            enumerable: true,
            configurable: true
        });
        TerrainMethod.prototype.ontextureChanged = function () {
            this.createBoolMacro("HAS_TERRAIN_METHOD", this.blendTexture.checkRenderData()
                && this.splatTexture1.checkRenderData()
                && this.splatTexture2.checkRenderData()
                && this.splatTexture3.checkRenderData());
        };
        return TerrainMethod;
    }(feng3d.RenderDataHolder));
    feng3d.TerrainMethod = TerrainMethod;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 地形材质
     * @author feng 2016-04-28
     */
    var TerrainMergeMethod = /** @class */ (function (_super) {
        __extends(TerrainMergeMethod, _super);
        /**
         * 构建材质
         */
        function TerrainMergeMethod(blendUrl, splatMergeUrl, splatRepeats) {
            if (blendUrl === void 0) { blendUrl = ""; }
            if (splatMergeUrl === void 0) { splatMergeUrl = ""; }
            if (splatRepeats === void 0) { splatRepeats = new feng3d.Vector3D(1, 1, 1, 1); }
            var _this = _super.call(this) || this;
            _this.blendTexture = new feng3d.Texture2D(blendUrl);
            _this.splatMergeTexture = new feng3d.Texture2D(splatMergeUrl || "");
            _this.splatMergeTexture.minFilter = feng3d.TextureMinFilter.NEAREST;
            _this.splatMergeTexture.magFilter = feng3d.TextureMagFilter.NEAREST;
            _this.splatMergeTexture.wrapS = feng3d.TextureWrap.REPEAT;
            _this.splatMergeTexture.wrapT = feng3d.TextureWrap.REPEAT;
            _this.splatRepeats = splatRepeats;
            //
            _this.createUniformData("s_blendTexture", _this.blendTexture);
            _this.createUniformData("s_splatMergeTexture", _this.splatMergeTexture);
            _this.createUniformData("u_splatMergeTextureSize", _this.splatMergeTexture.size);
            _this.createUniformData("u_splatRepeats", _this.splatRepeats);
            //
            _this.createUniformData("u_imageSize", new feng3d.Point(2048.0, 1024.0));
            _this.createUniformData("u_tileSize", new feng3d.Point(512.0, 512.0));
            _this.createUniformData("u_maxLod", 7);
            _this.createUniformData("u_uvPositionScale", 0.001);
            _this.createUniformData("u_tileOffset", [
                new feng3d.Vector3D(0.5, 0.5, 0.0, 0.0),
                new feng3d.Vector3D(0.5, 0.5, 0.5, 0.0),
                new feng3d.Vector3D(0.5, 0.5, 0.0, 0.5),
            ]);
            _this.createUniformData("u_lod0vec", new feng3d.Vector3D(0.5, 1, 0, 0));
            _this.createBoolMacro("HAS_TERRAIN_METHOD", true);
            _this.createBoolMacro("USE_TERRAIN_MERGE", true);
            return _this;
        }
        Object.defineProperty(TerrainMergeMethod.prototype, "splatMergeTexture", {
            get: function () {
                return this._splatMergeTexture;
            },
            set: function (value) {
                this._splatMergeTexture = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerrainMergeMethod.prototype, "blendTexture", {
            get: function () {
                return this._blendTexture;
            },
            set: function (value) {
                this._blendTexture = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TerrainMergeMethod.prototype, "splatRepeats", {
            get: function () {
                return this._splatRepeats;
            },
            set: function (value) {
                this._splatRepeats = value;
            },
            enumerable: true,
            configurable: true
        });
        return TerrainMergeMethod;
    }(feng3d.RenderDataHolder));
    feng3d.TerrainMergeMethod = TerrainMergeMethod;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 粒子
     * 粒子系统会自动在shader中匹配一个"a_particle_${attribute}"顶点属性,并且属性值不为空时会自动添加 "#define D_a_particle_${attribute}"
     * 例如：position 对应 a_particle_position 与 #define D_a_particle_position
     * @author feng 2017-01-12
     */
    var ParticleGlobal = /** @class */ (function () {
        function ParticleGlobal() {
            /**
             * 加速度
             */
            this.acceleration = new feng3d.Vector3D();
            /**
             * 公告牌矩阵
             */
            this.billboardMatrix = new feng3d.Matrix3D();
        }
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], ParticleGlobal.prototype, "acceleration", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], ParticleGlobal.prototype, "billboardMatrix", void 0);
        return ParticleGlobal;
    }());
    feng3d.ParticleGlobal = ParticleGlobal;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 粒子动画组件
     * @author feng 2017-01-09
     */
    var ParticleComponent = /** @class */ (function (_super) {
        __extends(ParticleComponent, _super);
        function ParticleComponent() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * 是否开启
             */
            _this.enable = false;
            /**
             * 优先级
             */
            _this.priority = 0;
            /**
             * 数据是否变脏
             */
            _this.isDirty = true;
            return _this;
        }
        ParticleComponent.prototype.invalidate = function () {
            this.isDirty = true;
        };
        /**
         * 创建粒子属性
         * @param particle                  粒子
         */
        ParticleComponent.prototype.generateParticle = function (particle) {
        };
        ParticleComponent.prototype.setRenderState = function (particleAnimator) {
            if (this.isDirty) {
                particleAnimator.invalidate();
                this.isDirty = false;
            }
        };
        __decorate([
            feng3d.oav(),
            feng3d.serialize(),
            feng3d.watch("invalidate")
        ], ParticleComponent.prototype, "enable", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], ParticleComponent.prototype, "priority", void 0);
        return ParticleComponent;
    }(feng3d.RenderDataHolder));
    feng3d.ParticleComponent = ParticleComponent;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 粒子发射器
     * @author feng 2017-01-09
     */
    var ParticleEmission = /** @class */ (function (_super) {
        __extends(ParticleEmission, _super);
        function ParticleEmission() {
            var _this = _super.call(this) || this;
            /**
             * 发射率，每秒发射粒子数量
             */
            _this.rate = 10;
            /**
             * 爆发，在time时刻额外喷射particles粒子
             */
            _this.bursts = [];
            _this.isDirty = true;
            _this.priority = Number.MAX_VALUE;
            return _this;
        }
        /**
         * 创建粒子属性
         * @param particle                  粒子
         */
        ParticleEmission.prototype.generateParticle = function (particle) {
            if (this._numParticles != particle.total)
                this.isDirty = true;
            this._numParticles = particle.total;
            particle.birthTime = this.getBirthTimeArray(particle.total)[particle.index];
        };
        /**
         * 获取出生时间数组
         */
        ParticleEmission.prototype.getBirthTimeArray = function (numParticles) {
            if (this.isDirty) {
                this.isDirty = false;
                var birthTimes = [];
                var bursts = this.bursts.concat();
                //按时间降序排列
                bursts.sort(function (a, b) { return b.time - a.time; });
                var index = 0;
                var time = 0; //以秒为单位
                var i = 0;
                var timeStep = 1 / this.rate;
                while (index < numParticles) {
                    while (bursts.length > 0 && bursts[bursts.length - 1].time <= time) {
                        var burst = bursts.pop();
                        if (burst) {
                            for (i = 0; i < burst.particles; i++) {
                                birthTimes[index++] = burst.time;
                            }
                        }
                    }
                    birthTimes[index++] = time;
                    time += timeStep;
                }
                this._birthTimes = birthTimes;
            }
            return this._birthTimes;
        };
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], ParticleEmission.prototype, "rate", void 0);
        __decorate([
            feng3d.oav({ componentParam: { defaultItem: function () { return { time: 0, particles: 30 }; } } }),
            feng3d.serialize()
        ], ParticleEmission.prototype, "bursts", void 0);
        return ParticleEmission;
    }(feng3d.ParticleComponent));
    feng3d.ParticleEmission = ParticleEmission;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 粒子速度组件
     * @author feng 2017-01-09
     */
    var ParticlePosition = /** @class */ (function (_super) {
        __extends(ParticlePosition, _super);
        function ParticlePosition() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * 创建粒子属性
         * @param particle                  粒子
         */
        ParticlePosition.prototype.generateParticle = function (particle) {
            var baseRange = 1;
            var x = (Math.random() - 0.5) * baseRange;
            var y = (Math.random() - 0.5) * baseRange;
            var z = (Math.random() - 0.5) * baseRange;
            particle.position = new feng3d.Vector3D(x, y, z);
            particle.position = new feng3d.Vector3D();
        };
        return ParticlePosition;
    }(feng3d.ParticleComponent));
    feng3d.ParticlePosition = ParticlePosition;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 粒子速度组件
     * @author feng 2017-01-09
     */
    var ParticleVelocity = /** @class */ (function (_super) {
        __extends(ParticleVelocity, _super);
        function ParticleVelocity() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * 创建粒子属性
         * @param particle                  粒子
         */
        ParticleVelocity.prototype.generateParticle = function (particle) {
            var baseVelocity = 1;
            var x = (Math.random() - 0.5) * baseVelocity;
            var y = baseVelocity;
            var z = (Math.random() - 0.5) * baseVelocity;
            particle.velocity = new feng3d.Vector3D(x, y, z);
        };
        return ParticleVelocity;
    }(feng3d.ParticleComponent));
    feng3d.ParticleVelocity = ParticleVelocity;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 粒子颜色组件
     * @author feng 2017-03-14
     */
    var ParticleColor = /** @class */ (function (_super) {
        __extends(ParticleColor, _super);
        function ParticleColor() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * 创建粒子属性
         * @param particle                  粒子
         */
        ParticleColor.prototype.generateParticle = function (particle) {
            particle.color = new feng3d.Color(1, 0, 0, 1).mix(new feng3d.Color(0, 1, 0, 1), particle.index / particle.total);
        };
        return ParticleColor;
    }(feng3d.ParticleComponent));
    feng3d.ParticleColor = ParticleColor;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var ParticleBillboard = /** @class */ (function (_super) {
        __extends(ParticleBillboard, _super);
        function ParticleBillboard() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ParticleBillboard.prototype.setRenderState = function (particleAnimator) {
            if (this.camera && this.enable) {
                if (this.billboardAxis)
                    this.billboardAxis.normalize();
                var _matrix = new feng3d.Matrix3D;
                var gameObject = particleAnimator.gameObject;
                _matrix.copyFrom(gameObject.transform.localToWorldMatrix);
                _matrix.lookAt(this.camera.transform.localToWorldMatrix.position, this.billboardAxis || feng3d.Vector3D.Y_AXIS);
                particleAnimator.particleGlobal.billboardMatrix = _matrix;
            }
            else {
                particleAnimator.particleGlobal.billboardMatrix = new feng3d.Matrix3D();
            }
        };
        return ParticleBillboard;
    }(feng3d.ParticleComponent));
    feng3d.ParticleBillboard = ParticleBillboard;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 粒子动画
     * @author feng 2017-01-09
     */
    var ParticleAnimator = /** @class */ (function (_super) {
        __extends(ParticleAnimator, _super);
        function ParticleAnimator() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._isPlaying = false;
            /**
             * 粒子时间
             */
            _this.time = 0;
            /**
             * 起始时间
             */
            _this.preTime = 0;
            /**
             * 播放速度
             */
            _this.playspeed = 1;
            /**
             * 周期
             */
            _this.cycle = 10000;
            /**
             * 生成粒子函数列表，优先级越高先执行
             */
            _this.generateFunctions = [];
            /**
             * 属性数据列表
             */
            _this._attributes = {};
            _this.animations = {
                emission: new feng3d.ParticleEmission(),
                position: new feng3d.ParticlePosition(),
                velocity: new feng3d.ParticleVelocity(),
                color: new feng3d.ParticleColor(),
                billboard: new feng3d.ParticleBillboard(),
            };
            /**
             * 粒子全局属性
             */
            _this.particleGlobal = new feng3d.ParticleGlobal();
            /**
             * 粒子数量
             */
            _this.numParticles = 1000;
            _this._isDirty = true;
            return _this;
        }
        Object.defineProperty(ParticleAnimator.prototype, "isPlaying", {
            /**
             * 是否正在播放
             */
            get: function () {
                return this._isPlaying;
            },
            set: function (value) {
                if (this._isPlaying == value)
                    return;
                if (this._isPlaying) {
                    feng3d.ticker.offframe(this.update, this);
                }
                this._isPlaying = value;
                if (this._isPlaying) {
                    this.preTime = Date.now();
                    feng3d.ticker.onframe(this.update, this);
                }
                //
                this.createBoolMacro("HAS_PARTICLE_ANIMATOR", this._isPlaying);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ParticleAnimator.prototype, "single", {
            get: function () { return true; },
            enumerable: true,
            configurable: true
        });
        ParticleAnimator.prototype.init = function (gameObject) {
            var _this = this;
            _super.prototype.init.call(this, gameObject);
            this.createInstanceCount(function () { return _this.numParticles; });
            //
            this.createUniformData("u_particleTime", function () { return _this.time; });
            this.isPlaying = true;
        };
        ParticleAnimator.prototype.update = function () {
            this.time = (this.time + ((Date.now() - this.preTime) * this.playspeed / 1000) + this.cycle) % this.cycle;
            this.preTime = Date.now();
            for (var key in this.animations) {
                if (this.animations.hasOwnProperty(key)) {
                    var element = this.animations[key];
                    element.setRenderState(this);
                }
            }
            if (this._isDirty) {
                this.generateParticles();
                this._isDirty = false;
            }
            for (var key in this.particleGlobal) {
                if (this.particleGlobal.hasOwnProperty(key)) {
                    var element = this.particleGlobal[key];
                    if (element) {
                        this.createUniformData(("u_particle_" + key), element);
                        this.createBoolMacro(("D_u_particle_" + key), true);
                    }
                    else {
                        this.createBoolMacro(("D_u_particle_" + key), false);
                    }
                }
            }
        };
        ParticleAnimator.prototype.invalidate = function () {
            this._isDirty = true;
        };
        /**
         * 生成粒子
         */
        ParticleAnimator.prototype.generateParticles = function () {
            var generateFunctions = this.generateFunctions.concat();
            //清理宏定义
            for (var attribute in this._attributes) {
                var vector3DData = this._attributes[attribute];
                this.createBoolMacro(("D_" + attribute), false);
            }
            this._attributes = {};
            for (var key in this.animations) {
                if (this.animations.hasOwnProperty(key)) {
                    var element = this.animations[key];
                    if (element.enable)
                        generateFunctions.push({ generate: element.generateParticle.bind(element), priority: element.priority });
                }
            }
            //按优先级排序，优先级越高先执行
            generateFunctions.sort(function (a, b) { return b.priority - a.priority; });
            //
            for (var i = 0; i < this.numParticles; i++) {
                var particle = {};
                particle.index = i;
                particle.total = this.numParticles;
                generateFunctions.forEach(function (element) {
                    element.generate(particle);
                });
                this.collectionParticle(particle);
            }
            //更新宏定义
            for (var attribute in this._attributes) {
                var vector3DData = this._attributes[attribute];
                this.createAttributeRenderData(attribute, vector3DData, vector3DData.length / this.numParticles, 1);
                this.createBoolMacro(("D_" + attribute), true);
            }
        };
        /**
         * 收集粒子数据
         * @param particle      粒子
         */
        ParticleAnimator.prototype.collectionParticle = function (particle) {
            for (var attribute in particle) {
                this.collectionParticleAttribute(attribute, particle);
            }
        };
        /**
         * 收集粒子属性数据
         * @param attributeID       属性编号
         * @param index             粒子编号
         * @param data              属性数据
         */
        ParticleAnimator.prototype.collectionParticleAttribute = function (attribute, particle) {
            var attributeID = "a_particle_" + attribute;
            var data = particle[attribute];
            var index = particle.index;
            var numParticles = particle.total;
            //
            var vector3DData;
            if (typeof data == "number") {
                vector3DData = this._attributes[attributeID] = this._attributes[attributeID] || [];
                vector3DData[index] = data;
            }
            else if (data instanceof feng3d.Vector3D) {
                vector3DData = this._attributes[attributeID] = this._attributes[attributeID] || [];
                vector3DData[index * 3] = data.x;
                vector3DData[index * 3 + 1] = data.y;
                vector3DData[index * 3 + 2] = data.z;
            }
            else if (data instanceof feng3d.Color) {
                vector3DData = this._attributes[attributeID] = this._attributes[attributeID] || [];
                vector3DData[index * 4] = data.r;
                vector3DData[index * 4 + 1] = data.g;
                vector3DData[index * 4 + 2] = data.b;
                vector3DData[index * 4 + 3] = data.a;
            }
            else {
                throw new Error("\u65E0\u6CD5\u5904\u7406" + feng3d.ClassUtils.getQualifiedClassName(data) + "\u7C92\u5B50\u5C5E\u6027");
            }
        };
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], ParticleAnimator.prototype, "isPlaying", null);
        __decorate([
            feng3d.oav()
        ], ParticleAnimator.prototype, "time", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], ParticleAnimator.prototype, "playspeed", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], ParticleAnimator.prototype, "cycle", void 0);
        __decorate([
            feng3d.serialize()
        ], ParticleAnimator.prototype, "generateFunctions", void 0);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], ParticleAnimator.prototype, "animations", void 0);
        __decorate([
            feng3d.serialize(),
            feng3d.oav()
        ], ParticleAnimator.prototype, "particleGlobal", void 0);
        __decorate([
            feng3d.watch("invalidate"),
            feng3d.oav(),
            feng3d.serialize()
        ], ParticleAnimator.prototype, "numParticles", void 0);
        return ParticleAnimator;
    }(feng3d.Component));
    feng3d.ParticleAnimator = ParticleAnimator;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    // /**
    //  * 骨骼数据
    //  * @author feng 2014-5-20
    //  */
    // export class Skeleton
    // {
    // }
    /**
     * 骨骼关节数据
     * @author feng 2014-5-20
     */
    var SkeletonJoint = /** @class */ (function () {
        function SkeletonJoint() {
            /** 父关节索引 （-1说明本身是总父节点，这个序号其实就是行号了，譬如上面”origin“节点的序号就是0，无父节点； "body"节点序号是1，父节点序号是0，也就是说父节点是”origin“）*/
            this.parentIndex = -1;
            this.children = [];
        }
        Object.defineProperty(SkeletonJoint.prototype, "invertMatrix3D", {
            get: function () {
                if (!this._invertMatrix3D)
                    this._invertMatrix3D = this.matrix3D.clone().invert();
                return this._invertMatrix3D;
            },
            enumerable: true,
            configurable: true
        });
        __decorate([
            feng3d.serialize()
        ], SkeletonJoint.prototype, "parentIndex", void 0);
        __decorate([
            feng3d.serialize()
        ], SkeletonJoint.prototype, "name", void 0);
        __decorate([
            feng3d.serialize()
        ], SkeletonJoint.prototype, "matrix3D", void 0);
        return SkeletonJoint;
    }());
    feng3d.SkeletonJoint = SkeletonJoint;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var Animation = /** @class */ (function (_super) {
        __extends(Animation, _super);
        function Animation() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.animations = [];
            _this._time = 0;
            _this._isplaying = false;
            /**
             * 播放速度
             */
            _this.playspeed = 1;
            _this._preTime = 0;
            _this.num = 0;
            _this._objectCache = new Map();
            return _this;
        }
        Object.defineProperty(Animation.prototype, "animation", {
            get: function () {
                return this._animation;
            },
            set: function (value) {
                if (this._animation == value)
                    return;
                this._animation = value;
                this.time = 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Animation.prototype, "time", {
            /**
             * 动画事件，单位为ms
             */
            get: function () {
                return this._time;
            },
            set: function (value) {
                if (this._time == value)
                    return;
                this._time = value;
                this.updateAni();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Animation.prototype, "isplaying", {
            get: function () {
                return this._isplaying;
            },
            set: function (value) {
                if (this._isplaying == value)
                    return;
                this._preTime = Date.now();
                this._isplaying = value;
            },
            enumerable: true,
            configurable: true
        });
        Animation.prototype.update = function () {
            var nowTime = Date.now();
            this.time += (nowTime - this._preTime) * this.playspeed;
            this._preTime = nowTime;
        };
        Animation.prototype.updateAni = function () {
            if (!this.animation)
                return;
            if ((this.num++) % 2 != 0)
                return;
            var cycle = this.animation.length;
            var cliptime = (this.time % (cycle) + cycle) % cycle;
            var propertyClips = this.animation.propertyClips;
            for (var i = 0; i < propertyClips.length; i++) {
                var propertyClip = propertyClips[i];
                var propertyValues = propertyClip.propertyValues;
                if (propertyValues.length == 0)
                    continue;
                var propertyHost = this.getPropertyHost(propertyClip);
                if (!propertyHost)
                    continue;
                var propertyValue = getValue(propertyClip.type, propertyValues[0][1]);
                if (cliptime <= propertyValues[0][0]) { }
                else if (cliptime >= propertyValues[propertyValues.length - 1][0])
                    propertyValue = getValue(propertyClip.type, propertyValues[propertyValues.length - 1][1]);
                else {
                    for (var j = 0; j < propertyValues.length - 1; j++) {
                        if (propertyValues[j][0] <= cliptime && cliptime < propertyValues[j + 1][0]) {
                            propertyValue = interpolation(getValue(propertyClip.type, propertyValues[j][1]), getValue(propertyClip.type, propertyValues[j + 1][1]), (cliptime - propertyValues[j][0]) / (propertyValues[j + 1][0] - propertyValues[j][0]));
                            break;
                        }
                    }
                }
                propertyHost[propertyClip.propertyName] = propertyValue;
            }
        };
        Animation.prototype.getPropertyHost = function (propertyClip) {
            if (propertyClip.cacheIndex && this._objectCache[propertyClip.cacheIndex])
                return this._objectCache[propertyClip.cacheIndex];
            if (!propertyClip.cacheIndex)
                propertyClip.cacheIndex = autoobjectCacheID++;
            var propertyHost = this.gameObject;
            var path = propertyClip.path;
            for (var i = 0; i < path.length; i++) {
                var element = path[i];
                switch (element[0]) {
                    case PropertyClipPathItemType.GameObject:
                        propertyHost = propertyHost.find(element[1]);
                        break;
                    case PropertyClipPathItemType.Component:
                        var componentType = feng3d.ClassUtils.getDefinitionByName(element[1]);
                        propertyHost = propertyHost.getComponent(componentType);
                        break;
                    default:
                        throw "\u65E0\u6CD5\u83B7\u53D6 PropertyHost " + element;
                }
                if (propertyHost == null)
                    return null;
            }
            this._objectCache[propertyClip.cacheIndex] = propertyHost;
            return propertyHost;
        };
        Animation.prototype.dispose = function () {
            this.animation = null;
            this.animations = null;
            _super.prototype.dispose.call(this);
        };
        __decorate([
            feng3d.oav({ componentParam: { dragparam: { accepttype: "animationclip", datatype: "animationclip" } } }),
            feng3d.serialize()
        ], Animation.prototype, "animation", null);
        __decorate([
            feng3d.oav({ componentParam: { dragparam: { accepttype: "animationclip", datatype: "animationclip" }, defaultItem: function () { return new AnimationClip(); } } }),
            feng3d.serialize()
        ], Animation.prototype, "animations", void 0);
        __decorate([
            feng3d.oav()
        ], Animation.prototype, "time", null);
        __decorate([
            feng3d.oav(),
            feng3d.serialize(false)
        ], Animation.prototype, "isplaying", null);
        __decorate([
            feng3d.oav(),
            feng3d.serialize()
        ], Animation.prototype, "playspeed", void 0);
        return Animation;
    }(feng3d.Component));
    feng3d.Animation = Animation;
    var autoobjectCacheID = 1;
    function getValue(type, value) {
        if (type == "Number")
            return value[0];
        if (type == "Vector3D")
            return feng3d.Vector3D.fromArray(value);
        if (type == "Quaternion")
            return feng3d.Quaternion.fromArray(value);
        feng3d.error("\u672A\u5904\u7406 \u52A8\u753B\u6570\u636E\u7C7B\u578B " + type);
        throw "";
    }
    function interpolation(prevalue, nextValue, factor) {
        var propertyValue;
        if (prevalue instanceof feng3d.Quaternion) {
            propertyValue = prevalue.clone();
            propertyValue.lerp(prevalue, nextValue, factor);
        }
        else if (prevalue instanceof feng3d.Vector3D) {
            propertyValue = new feng3d.Vector3D(prevalue.x * (1 - factor) + nextValue.x * factor, prevalue.y * (1 - factor) + nextValue.y * factor, prevalue.z * (1 - factor) + nextValue.z * factor);
        }
        else {
            propertyValue = prevalue * (1 - factor) + nextValue * factor;
        }
        return propertyValue;
    }
    var AnimationClip = /** @class */ (function () {
        function AnimationClip() {
            this.loop = true;
        }
        __decorate([
            feng3d.serialize()
        ], AnimationClip.prototype, "name", void 0);
        __decorate([
            feng3d.serialize()
        ], AnimationClip.prototype, "length", void 0);
        __decorate([
            feng3d.serialize()
        ], AnimationClip.prototype, "loop", void 0);
        __decorate([
            feng3d.serialize()
        ], AnimationClip.prototype, "propertyClips", void 0);
        return AnimationClip;
    }());
    feng3d.AnimationClip = AnimationClip;
    var PropertyClip = /** @class */ (function () {
        function PropertyClip() {
        }
        __decorate([
            feng3d.serialize()
        ], PropertyClip.prototype, "path", void 0);
        __decorate([
            feng3d.serialize()
        ], PropertyClip.prototype, "propertyName", void 0);
        __decorate([
            feng3d.serialize()
        ], PropertyClip.prototype, "type", void 0);
        __decorate([
            feng3d.serialize()
        ], PropertyClip.prototype, "propertyValues", void 0);
        return PropertyClip;
    }());
    feng3d.PropertyClip = PropertyClip;
    var PropertyClipPathItemType;
    (function (PropertyClipPathItemType) {
        PropertyClipPathItemType[PropertyClipPathItemType["GameObject"] = 0] = "GameObject";
        PropertyClipPathItemType[PropertyClipPathItemType["Component"] = 1] = "Component";
    })(PropertyClipPathItemType = feng3d.PropertyClipPathItemType || (feng3d.PropertyClipPathItemType = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    feng3d.assets = {};
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var databases = {};
    feng3d.storage = {
        /**
         * 是否支持 indexedDB
         */
        support: function () {
            if (typeof indexedDB == "undefined") {
                indexedDB = window.indexedDB || window["mozIndexedDB"] || window["webkitIndexedDB"] || window["msIndexedDB"];
                if (indexedDB == undefined) {
                    return false;
                }
            }
            return true;
        },
        getDatabase: function (dbname, callback) {
            if (databases[dbname]) {
                callback(null, databases[dbname]);
                return;
            }
            var request = indexedDB.open(dbname);
            request.onsuccess = function (event) {
                databases[dbname] = event.target["result"];
                callback(null, databases[dbname]);
            };
            request.onerror = function (event) {
                callback(event, null);
            };
        },
        deleteDatabase: function (dbname, callback) {
            var request = indexedDB.deleteDatabase(dbname);
            request.onsuccess = function (event) {
                delete databases[dbname];
                callback && callback(null);
            };
            request.onerror = function (event) {
                callback && callback(event);
            };
        },
        hasObjectStore: function (dbname, objectStroreName, callback) {
            feng3d.storage.getDatabase(dbname, function (err, database) {
                callback(database.objectStoreNames.contains(objectStroreName));
            });
        },
        getObjectStoreNames: function (dbname, callback) {
            feng3d.storage.getDatabase(dbname, function (err, database) {
                var objectStoreNames = [];
                for (var i = 0; i < database.objectStoreNames.length; i++) {
                    objectStoreNames.push(database.objectStoreNames.item(i));
                }
                callback(null, objectStoreNames);
            });
        },
        createObjectStore: function (dbname, objectStroreName, callback) {
            feng3d.storage.getDatabase(dbname, function (err, database) {
                if (database.objectStoreNames.contains(objectStroreName)) {
                    callback && callback(null);
                    return;
                }
                database.close();
                var request = indexedDB.open(database.name, database.version + 1);
                request.onupgradeneeded = function (event) {
                    var newdatabase = event.target["result"];
                    newdatabase.createObjectStore(objectStroreName);
                    callback && callback(null);
                };
                request.onsuccess = function (event) {
                    var newdatabase = event.target["result"];
                    databases[newdatabase.name] = newdatabase;
                };
                request.onerror = function (event) {
                    callback && callback(event);
                };
            });
        },
        deleteObjectStore: function (dbname, objectStroreName, callback) {
            feng3d.storage.getDatabase(dbname, function (err, database) {
                if (!database.objectStoreNames.contains(objectStroreName)) {
                    callback && callback(null);
                    return;
                }
                database.close();
                var request = indexedDB.open(database.name, database.version + 1);
                request.onupgradeneeded = function (event) {
                    var newdatabase = event.target["result"];
                    newdatabase.deleteObjectStore(objectStroreName);
                    callback && callback(null);
                };
                request.onsuccess = function (event) {
                    var newdatabase = event.target["result"];
                    databases[newdatabase.name] = newdatabase;
                };
                request.onerror = function (event) {
                    callback && callback(event);
                };
            });
        },
        getAllKeys: function (dbname, objectStroreName, callback) {
            feng3d.storage.getDatabase(dbname, function (err, database) {
                try {
                    var transaction = database.transaction([objectStroreName], 'readwrite');
                    var objectStore = transaction.objectStore(objectStroreName);
                    var request = objectStore.getAllKeys();
                    request.onsuccess = function (event) {
                        callback && callback(null, event.target["result"]);
                    };
                }
                catch (error) {
                    callback && callback(error, null);
                }
            });
        },
        get: function (dbname, objectStroreName, key, callback) {
            feng3d.storage.getDatabase(dbname, function (err, database) {
                try {
                    var transaction = database.transaction([objectStroreName], 'readwrite');
                    var objectStore = transaction.objectStore(objectStroreName);
                    var request = objectStore.get(key);
                    request.onsuccess = function (event) {
                        callback && callback(null, event.target["result"]);
                    };
                }
                catch (error) {
                    callback && callback(error, null);
                }
            });
        },
        set: function (dbname, objectStroreName, key, data, callback) {
            feng3d.storage.getDatabase(dbname, function (err, database) {
                try {
                    var transaction = database.transaction([objectStroreName], 'readwrite');
                    var objectStore = transaction.objectStore(objectStroreName);
                    var request = objectStore.put(data, key);
                    request.onsuccess = function (event) {
                        callback && callback(null);
                    };
                }
                catch (error) {
                    callback && callback(error);
                }
            });
        },
        delete: function (dbname, objectStroreName, key, callback) {
            feng3d.storage.getDatabase(dbname, function (err, database) {
                try {
                    var transaction = database.transaction([objectStroreName], 'readwrite');
                    var objectStore = transaction.objectStore(objectStroreName);
                    var request = objectStore.delete(key);
                    request.onsuccess = function (event) {
                        callback && callback();
                    };
                }
                catch (error) {
                    callback && callback(error);
                }
            });
        },
        clear: function (dbname, objectStroreName, callback) {
            feng3d.storage.getDatabase(dbname, function (err, database) {
                try {
                    var transaction = database.transaction([objectStroreName], 'readwrite');
                    var objectStore = transaction.objectStore(objectStroreName);
                    var request = objectStore.clear();
                    request.onsuccess = function (event) {
                        callback && callback();
                    };
                }
                catch (error) {
                    callback && callback(error);
                }
            });
        }
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var DBname = "feng3d-editor";
    var _projectname;
    function set(key, data, callback) {
        feng3d.storage.set(DBname, _projectname, key, data, callback);
    }
    function get(key, callback) {
        feng3d.storage.get(DBname, _projectname, key, callback);
    }
    function copy(sourcekey, targetkey, callback) {
        get(sourcekey, function (err, data) {
            if (err) {
                callback && callback(err);
                return;
            }
            set(targetkey, data, callback);
        });
    }
    function move(sourcekey, targetkey, callback) {
        copy(sourcekey, targetkey, function (err) {
            if (err) {
                callback && callback(err);
                return;
            }
            deletedata(sourcekey, callback);
        });
    }
    function deletedata(key, callback) {
        feng3d.storage.delete(DBname, _projectname, key, callback);
    }
    function getAllKeys(callback) {
        feng3d.storage.getAllKeys(DBname, _projectname, callback);
    }
    function movefiles(movelists, callback) {
        copyfiles(movelists.concat(), function (err) {
            if (err) {
                callback(err);
                return;
            }
            var deletelists = movelists.reduce(function (value, current) { value.push(current[0]); return value; }, []);
            deletefiles(deletelists, callback);
        });
    }
    function copyfiles(copylists, callback) {
        if (copylists.length > 0) {
            var copyitem = copylists.shift();
            copy(copyitem[0], copyitem[1], function (err) {
                if (err) {
                    callback(err);
                    return;
                }
                copyfiles(copylists, callback);
            });
            return;
        }
        callback(null);
    }
    function deletefiles(deletelists, callback) {
        if (deletelists.length > 0) {
            deletedata(deletelists.shift(), function (err) {
                if (err) {
                    callback(err);
                    return;
                }
                deletefiles(deletelists, callback);
            });
            return;
        }
        callback(null);
    }
    feng3d.indexedDBfs = {
        hasProject: function (projectname, callback) {
            feng3d.storage.hasObjectStore(DBname, projectname, callback);
        },
        getProjectList: function (callback) {
            feng3d.storage.getObjectStoreNames(DBname, callback);
        },
        initproject: function (projectname, callback) {
            feng3d.storage.createObjectStore(DBname, projectname, function (err) {
                if (err) {
                    feng3d.warn(err);
                    return;
                }
                _projectname = projectname;
                // todo 启动监听 ts代码变化自动编译
                callback();
            });
        },
        // selectFile?: (callback: (file: FileList) => void, param?: Object) => void;
        // //
        stat: function (path, callback) {
            get(path, function (err, data) {
                if (data) {
                    callback(err, {
                        path: path,
                        birthtime: data.birthtime.getTime(),
                        mtime: data.birthtime.getTime(),
                        isDirectory: data.isDirectory,
                        size: 0
                    });
                }
                else {
                    callback(new Error(path + " 不存在"), null);
                }
            });
        },
        readdir: function (path, callback) {
            getAllKeys(function (err, allfilepaths) {
                if (!allfilepaths) {
                    callback(err, null);
                    return;
                }
                var subfilemap = {};
                allfilepaths.forEach(function (element) {
                    var result = new RegExp(path + "\\/([\\w\\s\\(\\).\\u4e00-\\u9fa5]+)\\b").exec(element);
                    if (result != null) {
                        subfilemap[result[1]] = 1;
                    }
                });
                var files = Object.keys(subfilemap);
                callback(null, files);
            });
        },
        writeFile: function (path, data, callback) {
            set(path, { isDirectory: false, birthtime: new Date(), data: data }, callback);
        },
        /**
         * 读取文件为字符串
         */
        readFileAsString: function (path, callback) {
            get(path, function (err, data) {
                if (err) {
                    callback(err, null);
                    return;
                }
                var str = feng3d.dataTransform.arrayBufferToText(data.data, function (content) {
                    callback(null, content);
                });
            });
        },
        /**
         * 读取文件为Buffer
         */
        readFile: function (path, callback) {
            get(path, function (err, data) {
                callback(err, data.data);
            });
        },
        mkdir: function (path, callback) {
            set(path, { isDirectory: true, birthtime: new Date() }, callback);
        },
        rename: function (oldPath, newPath, callback) {
            getAllKeys(function (err, allfilepaths) {
                if (!allfilepaths) {
                    callback(err);
                    return;
                }
                var renamelists = [[oldPath, newPath]];
                allfilepaths.forEach(function (element) {
                    var result = new RegExp(oldPath + "\\b").exec(element);
                    if (result != null && result.index == 0) {
                        renamelists.push([element, element.replace(oldPath, newPath)]);
                    }
                });
                movefiles(renamelists, callback);
            });
        },
        move: function (src, dest, callback) {
            feng3d.indexedDBfs.rename(src, dest, callback || (function () { }));
        },
        remove: function (path, callback) {
            getAllKeys(function (err, allfilepaths) {
                if (!allfilepaths) {
                    callback && callback(err);
                    return;
                }
                var removelists = [path];
                allfilepaths.forEach(function (element) {
                    var result = new RegExp(path + "\\b").exec(element);
                    if (result != null && result.index == 0) {
                        removelists.push(element);
                    }
                });
                deletefiles(removelists, callback || (function () { }));
            });
        },
        /**
         * 获取文件绝对路径
         */
        getAbsolutePath: function (path, callback) {
            callback(null, null);
        },
        /**
         * 获取指定文件下所有文件路径列表
         */
        getAllfilepathInFolder: function (dirpath, callback) {
            getAllKeys(function (err, allfilepaths) {
                if (!allfilepaths) {
                    callback(err, null);
                    return;
                }
                var files = [];
                allfilepaths.forEach(function (element) {
                    var result = new RegExp(dirpath + "\\b").exec(element);
                    if (result != null && result.index == 0) {
                        files.push(element);
                    }
                });
                callback(null, files);
            });
        },
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Obj模型解析器
     * @author feng 2017-01-13
     */
    feng3d.OBJParser = {
        parser: parser
    };
    function parser(context) {
        var objData = { mtl: null, objs: [], vertex: [], vn: [], vt: [] };
        var lines = context.split("\n").reverse();
        do {
            var line = lines.pop();
            line && parserLine(line, objData);
        } while (lines.length > 0);
        return objData;
    }
    /** mtl正则 */
    var mtlReg = /mtllib\s+([\w\s]+\.mtl)/;
    /** 对象名称正则 */
    var objReg = /o\s+([\w\.]+)/;
    /** 顶点坐标正则 */
    var vertexReg = /v\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/;
    /** 顶点法线正则 */
    var vnReg = /vn\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/;
    /** 顶点uv正则 */
    var vtReg = /vt\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/;
    /** 使用材质正则 */
    var usemtlReg = /usemtl\s+([\w.]+)/;
    /** 面正则 vertex */
    var faceV3Reg = /f\s+(\d+)\s+(\d+)\s+(\d+)/;
    /** 面正则 vertex */
    var faceVReg = /f\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/;
    /** 面正则 vertex/uv/normal */
    var faceVUNReg = /f\s+((\d+)\/(\d+)\/(\d+))\s+((\d+)\/(\d+)\/(\d+))\s+((\d+)\/(\d+)\/(\d+))/;
    /** 面正则 vertex//normal */
    var faceVN3Reg = /f\s+(\d+)\/\/(\d+)\s+(\d+)\/\/(\d+)\s+(\d+)\/\/(\d+)/;
    // g
    var gReg = /g\s+([\(\)\w]+)?/;
    var sReg = /s\s+(\w+)/;
    //
    var currentObj;
    var currentSubObj;
    function parserLine(line, objData) {
        if (!line)
            return;
        line = line.trim();
        if (!line.length)
            return;
        if (line.charAt(0) == "#")
            return;
        var result;
        if ((result = mtlReg.exec(line)) && result[0] == line) {
            objData.mtl = result[1];
        }
        else if ((result = objReg.exec(line)) && result[0] == line) {
            currentObj = { name: result[1], subObjs: [] };
            objData.objs.push(currentObj);
        }
        else if ((result = vertexReg.exec(line)) && result[0] == line) {
            if (currentObj == null) {
                currentObj = { name: "", subObjs: [] };
                objData.objs.push(currentObj);
            }
            objData.vertex.push({ x: parseFloat(result[1]), y: parseFloat(result[2]), z: parseFloat(result[3]) });
        }
        else if ((result = vnReg.exec(line)) && result[0] == line) {
            objData.vn.push({ x: parseFloat(result[1]), y: parseFloat(result[2]), z: parseFloat(result[3]) });
        }
        else if ((result = vtReg.exec(line)) && result[0] == line) {
            objData.vt.push({ u: parseFloat(result[1]), v: 1 - parseFloat(result[2]), s: parseFloat(result[3]) });
        }
        else if ((result = gReg.exec(line)) && result[0] == line) {
            if (currentSubObj == null) {
                currentSubObj = { faces: [] };
                currentObj.subObjs.push(currentSubObj);
            }
            currentSubObj.g = result[1];
        }
        else if ((result = sReg.exec(line)) && result[0] == line) {
        }
        else if ((result = usemtlReg.exec(line)) && result[0] == line) {
            currentSubObj = { faces: [] };
            currentObj.subObjs.push(currentSubObj);
            currentSubObj.material = result[1];
        }
        else if ((result = faceV3Reg.exec(line)) && result[0] == line) {
            currentSubObj.faces.push({
                indexIds: [result[2], result[1], result[3]],
                vertexIndices: [parseInt(result[2]), parseInt(result[1]), parseInt(result[3])]
            });
        }
        else if ((result = faceVN3Reg.exec(line)) && result[0] == line) {
            currentSubObj.faces.push({
                indexIds: [result[3], result[1], result[5]],
                vertexIndices: [parseInt(result[3]), parseInt(result[1]), parseInt(result[5])],
                normalIndices: [parseInt(result[4]), parseInt(result[2]), parseInt(result[6])],
            });
        }
        else if ((result = faceVReg.exec(line)) && result[0] == line) {
            currentSubObj.faces.push({
                indexIds: [result[1], result[2], result[3], result[3]],
                vertexIndices: [parseInt(result[1]), parseInt(result[2]), parseInt(result[3]), parseInt(result[4])]
            });
        }
        else if ((result = faceVUNReg.exec(line)) && result[0] == line) {
            currentSubObj.faces.push({
                indexIds: [result[1], result[5], result[9]],
                vertexIndices: [parseInt(result[2]), parseInt(result[6]), parseInt(result[10])],
                uvIndices: [parseInt(result[3]), parseInt(result[7]), parseInt(result[11])],
                normalIndices: [parseInt(result[4]), parseInt(result[8]), parseInt(result[12])]
            });
        }
        else {
            throw new Error("\u65E0\u6CD5\u89E3\u6790" + line);
        }
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Obj模型Mtl解析器
     * @author feng 2017-01-13
     */
    feng3d.MtlParser = {
        parser: parser
    };
    function parser(context) {
        var mtl = {};
        var lines = context.split("\n");
        for (var i = 0; i < lines.length; i++) {
            var element = lines[i];
            parserLine(lines[i], mtl);
        }
        return mtl;
    }
    var newmtlReg = /newmtl\s+([\w.]+)/;
    var kaReg = /Ka\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/;
    var kdReg = /Kd\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/;
    var ksReg = /Ks\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/;
    var nsReg = /Ns\s+([\d.]+)/;
    var niReg = /Ni\s+([\d.]+)/;
    var dReg = /d\s+([\d.]+)/;
    var illumReg = /illum\s+([\d]+)/;
    var currentMaterial;
    function parserLine(line, mtl) {
        if (!line)
            return;
        line = line.trim();
        if (!line.length)
            return;
        if (line.charAt(0) == "#")
            return;
        var result;
        if ((result = newmtlReg.exec(line)) && result[0] == line) {
            currentMaterial = { name: result[1], ka: [], kd: [], ks: [], ns: 0, ni: 0, d: 0, illum: 0 };
            mtl[currentMaterial.name] = currentMaterial;
        }
        else if ((result = kaReg.exec(line)) && result[0] == line) {
            currentMaterial.ka = [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])];
        }
        else if ((result = kdReg.exec(line)) && result[0] == line) {
            currentMaterial.kd = [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])];
        }
        else if ((result = ksReg.exec(line)) && result[0] == line) {
            currentMaterial.ks = [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])];
        }
        else if ((result = nsReg.exec(line)) && result[0] == line) {
            currentMaterial.ns = parseFloat(result[1]);
        }
        else if ((result = niReg.exec(line)) && result[0] == line) {
            currentMaterial.ni = parseFloat(result[1]);
        }
        else if ((result = dReg.exec(line)) && result[0] == line) {
            currentMaterial.d = parseFloat(result[1]);
        }
        else if ((result = illumReg.exec(line)) && result[0] == line) {
            currentMaterial.illum = parseFloat(result[1]);
        }
        else {
            throw new Error("\u65E0\u6CD5\u89E3\u6790" + line);
        }
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * MD5模型解析
     */
    feng3d.MD5MeshParser = {
        parse: parse
    };
    function parse(context) {
        //
        var md5MeshData = {};
        var lines = context.split("\n");
        for (var i = 0; i < lines.length; i++) {
            parserLine(lines[i], md5MeshData);
        }
        return md5MeshData;
    }
    var MD5VersionReg = /MD5Version\s+(\d+)/;
    var commandlineReg = /commandline\s+"([\w\s/.-]+)"/;
    var numJointsReg = /numJoints\s+(\d+)/;
    var numMeshesReg = /numMeshes\s+(\d+)/;
    var jointsStartReg = /joints\s+{/;
    var jointsReg = /"(\w+)"\s+([-\d]+)\s+\(\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+\)\s+\(\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+\)(\s+\/\/(\s+\w+)?)?/;
    var endBlockReg = /}/;
    var meshStartReg = /mesh\s+{/;
    var annotationReg = /\/\/[\s\w:]+/;
    var shaderReg = /shader\s+"([\w\/]+)"/;
    var numvertsReg = /numverts\s+(\d+)/;
    var vertReg = /vert\s+(\d+)\s+\(\s+([\d.]+)\s+([\d.]+)\s+\)\s+(\d+)\s+(\d+)/;
    var numtrisReg = /numtris\s+(\d+)/;
    var triReg = /tri\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/;
    var numweightsReg = /numweights\s+(\d+)/;
    var weightReg = /weight\s+(\d+)\s+(\d+)\s+([\d.]+)\s+\(\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+\)/;
    /**
     * 状态
     */
    var State;
    (function (State) {
        /** 读取关节 */
        State[State["joints"] = 0] = "joints";
        State[State["mesh"] = 1] = "mesh";
    })(State || (State = {}));
    /** 当前处于状态 */
    var states = [];
    var currentMesh;
    function parserLine(line, md5MeshData) {
        if (!line)
            return;
        line = line.trim();
        if (!line.length)
            return;
        var result;
        if ((result = MD5VersionReg.exec(line)) && result[0] == line) {
            md5MeshData.MD5Version = parseInt(result[1]);
        }
        else if ((result = commandlineReg.exec(line)) && result[0] == line) {
            md5MeshData.commandline = result[1];
        }
        else if ((result = numJointsReg.exec(line)) && result[0] == line) {
            md5MeshData.numJoints = parseInt(result[1]);
        }
        else if ((result = numMeshesReg.exec(line)) && result[0] == line) {
            md5MeshData.numMeshes = parseInt(result[1]);
        }
        else if ((result = jointsStartReg.exec(line)) && result[0] == line) {
            states.push(State.joints);
            md5MeshData.joints = [];
        }
        else if ((result = jointsReg.exec(line)) && result[0] == line) {
            md5MeshData.joints.push({
                name: result[1], parentIndex: parseInt(result[2]),
                position: [parseFloat(result[3]), parseFloat(result[4]), parseFloat(result[5])],
                rotation: [parseFloat(result[6]), parseFloat(result[7]), parseFloat(result[8])]
            });
        }
        else if ((result = endBlockReg.exec(line)) && result[0] == line) {
            var exitState = states.pop();
            if (exitState == State.mesh) {
                currentMesh = null;
            }
        }
        else if ((result = meshStartReg.exec(line)) && result[0] == line) {
            states.push(State.mesh);
            if (!md5MeshData.meshs) {
                md5MeshData.meshs = [];
            }
            currentMesh = {};
            md5MeshData.meshs.push(currentMesh);
        }
        else if ((result = annotationReg.exec(line)) && result[0] == line) {
        }
        else if ((result = shaderReg.exec(line)) && result[0] == line) {
            currentMesh.shader = result[1];
        }
        else if ((result = numvertsReg.exec(line)) && result[0] == line) {
            currentMesh.numverts = parseInt(result[1]);
            currentMesh.verts = [];
        }
        else if ((result = vertReg.exec(line)) && result[0] == line) {
            currentMesh.verts.push({
                index: parseFloat(result[1]), u: parseFloat(result[2]), v: parseFloat(result[3]),
                startWeight: parseFloat(result[4]), countWeight: parseFloat(result[5])
            });
        }
        else if ((result = numtrisReg.exec(line)) && result[0] == line) {
            currentMesh.numtris = parseInt(result[1]);
            currentMesh.tris = [];
        }
        else if ((result = triReg.exec(line)) && result[0] == line) {
            var index = parseInt(result[1]) * 3;
            currentMesh.tris[index] = parseInt(result[2]);
            currentMesh.tris[index + 1] = parseInt(result[3]);
            currentMesh.tris[index + 2] = parseInt(result[4]);
        }
        else if ((result = numweightsReg.exec(line)) && result[0] == line) {
            currentMesh.numweights = parseInt(result[1]);
            currentMesh.weights = [];
        }
        else if ((result = weightReg.exec(line)) && result[0] == line) {
            currentMesh.weights.push({
                index: parseInt(result[1]), joint: parseInt(result[2]), bias: parseFloat(result[3]),
                pos: [parseFloat(result[4]), parseFloat(result[5]), parseFloat(result[6])]
            });
        }
        else {
            throw new Error("\u65E0\u6CD5\u89E3\u6790" + line);
        }
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    feng3d.MD5AnimParser = {
        parse: parse
    };
    function parse(context) {
        var md5AnimData = {};
        var lines = context.split("\n").reverse();
        do {
            var line = lines.pop();
            line && parserLine(line, md5AnimData);
        } while (line);
        return md5AnimData;
    }
    var MD5VersionReg = /MD5Version\s+(\d+)/;
    var commandlineReg = /commandline\s+"([\w\s/.-]+)"/;
    var numFramesReg = /numFrames\s+(\d+)/;
    var numJointsReg = /numJoints\s+(\d+)/;
    var frameRateReg = /frameRate\s+(\d+)/;
    var numAnimatedComponentsReg = /numAnimatedComponents\s+(\d+)/;
    var hierarchyStartReg = /hierarchy\s+{/;
    var hierarchyReg = /"(\w+)"\s+([\d-]+)\s+(\d+)\s+(\d+)(\s+\/\/(\s+\w+)?(\s+\([\s\w]+\))?)?/;
    var endBlockReg = /}/;
    var boundsStartReg = /bounds\s+{/;
    //2组3个number
    var number32Reg = /\(\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+\)\s+\(\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+\)/;
    var baseframeStartReg = /baseframe\s+{/;
    var frameStartReg = /frame\s+(\d+)\s+{/;
    var numbersReg = /(-?[\d.]+)(\s+-?[\d.]+){0,}/;
    /**
     * 状态
     */
    var State;
    (function (State) {
        State[State["hierarchy"] = 0] = "hierarchy";
        State[State["bounds"] = 1] = "bounds";
        State[State["baseframe"] = 2] = "baseframe";
        State[State["frame"] = 3] = "frame";
    })(State || (State = {}));
    /** 当前处于状态 */
    var states = [];
    var currentFrame;
    function parserLine(line, md5AnimData) {
        if (!line)
            return;
        line = line.trim();
        if (!line.length)
            return;
        var result;
        if ((result = MD5VersionReg.exec(line)) && result[0] == line) {
            md5AnimData.MD5Version = parseInt(result[1]);
        }
        else if ((result = commandlineReg.exec(line)) && result[0] == line) {
            md5AnimData.commandline = result[1];
        }
        else if ((result = numFramesReg.exec(line)) && result[0] == line) {
            md5AnimData.numFrames = parseInt(result[1]);
        }
        else if ((result = numJointsReg.exec(line)) && result[0] == line) {
            md5AnimData.numJoints = parseInt(result[1]);
        }
        else if ((result = frameRateReg.exec(line)) && result[0] == line) {
            md5AnimData.frameRate = parseInt(result[1]);
        }
        else if ((result = numAnimatedComponentsReg.exec(line)) && result[0] == line) {
            md5AnimData.numAnimatedComponents = parseInt(result[1]);
        }
        else if ((result = hierarchyStartReg.exec(line)) && result[0] == line) {
            md5AnimData.hierarchy = [];
            states.push(State.hierarchy);
        }
        else if ((result = hierarchyReg.exec(line)) && result[0] == line) {
            switch (states[states.length - 1]) {
                case State.hierarchy:
                    md5AnimData.hierarchy.push({
                        name: result[1], parentIndex: parseInt(result[2]),
                        flags: parseInt(result[3]), startIndex: parseInt(result[4])
                    });
                    break;
                default:
                    throw new Error("没有对应的数据处理");
            }
        }
        else if ((result = endBlockReg.exec(line)) && result[0] == line) {
            var state = states.pop();
            if (state == State.frame) {
                if (currentFrame && currentFrame.components.length != md5AnimData.numAnimatedComponents) {
                    throw new Error("frame中数据不对");
                }
                currentFrame = null;
            }
        }
        else if ((result = boundsStartReg.exec(line)) && result[0] == line) {
            md5AnimData.bounds = [];
            states.push(State.bounds);
        }
        else if ((result = baseframeStartReg.exec(line)) && result[0] == line) {
            md5AnimData.baseframe = [];
            states.push(State.baseframe);
        }
        else if ((result = number32Reg.exec(line)) && result[0] == line) {
            switch (states[states.length - 1]) {
                case State.bounds:
                    md5AnimData.bounds.push({ min: [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])], max: [parseFloat(result[4]), parseFloat(result[5]), parseFloat(result[6])] });
                    break;
                case State.baseframe:
                    md5AnimData.baseframe.push({ position: [parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])], orientation: [parseFloat(result[4]), parseFloat(result[5]), parseFloat(result[6])] });
                    break;
                default:
                    throw new Error("没有对应的数据处理");
            }
        }
        else if ((result = frameStartReg.exec(line)) && result[0] == line) {
            if (!md5AnimData.frame) {
                md5AnimData.frame = [];
            }
            currentFrame = { index: parseInt(result[1]), components: [] };
            md5AnimData.frame.push(currentFrame);
            states.push(State.frame);
        }
        else if ((result = numbersReg.exec(line)) && result[0] == line) {
            switch (states[states.length - 1]) {
                case State.frame:
                    if (currentFrame) {
                        var numbers = line.split(" ");
                        for (var i = 0; i < numbers.length; i++) {
                            currentFrame.components.push(parseFloat(numbers[i]));
                        }
                    }
                    break;
                default:
                    throw new Error("没有对应的数据处理");
            }
        }
        else {
            throw new Error("\u65E0\u6CD5\u89E3\u6790" + line);
        }
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var war3;
    (function (war3) {
        /**
         * 透明度动画
         * @author warden_feng 2014-6-26
         */
        var AnimAlpha = /** @class */ (function () {
            function AnimAlpha() {
            }
            return AnimAlpha;
        }());
        war3.AnimAlpha = AnimAlpha;
        /**
         * 全局动作信息
         * @author warden_feng 2014-6-26
         */
        var AnimInfo = /** @class */ (function () {
            function AnimInfo() {
                /** 是否循环 */
                this.loop = true;
            }
            return AnimInfo;
        }());
        war3.AnimInfo = AnimInfo;
        /**
         * 几何体动作信息
         * @author warden_feng 2014-6-26
         */
        var AnimInfo1 = /** @class */ (function () {
            function AnimInfo1() {
            }
            return AnimInfo1;
        }());
        war3.AnimInfo1 = AnimInfo1;
        /**
         * 骨骼的角度信息
         */
        var BoneRotation = /** @class */ (function () {
            function BoneRotation() {
                this.rotations = [];
            }
            BoneRotation.prototype.getRotationItem = function (rotation) {
                var quaternion = new feng3d.Quaternion();
                if (this.type == "DontInterp") {
                    quaternion.fromEulerAngles(rotation.value.x, rotation.value.y, rotation.value.z);
                }
                else {
                    quaternion.copyFrom(rotation.value);
                }
                return quaternion;
            };
            BoneRotation.prototype.getRotation = function (keyFrameTime) {
                var RotationQuaternion = new feng3d.Quaternion();
                if (this.rotations.length == 0 || keyFrameTime < this.rotations[0].time || keyFrameTime > this.rotations[this.rotations.length - 1].time)
                    return new feng3d.Quaternion();
                var key1 = this.rotations[0];
                var key2 = this.rotations[0];
                for (var i = 0; i < this.rotations.length; i++) {
                    key2 = this.rotations[i];
                    if (key2.time > keyFrameTime) {
                        break;
                    }
                    key1 = key2;
                }
                if (key1 == key2) {
                    RotationQuaternion.copyFrom(key1.value);
                    return RotationQuaternion;
                }
                var Factor = (keyFrameTime - key1.time) / (key2.time - key1.time);
                var InverseFactor = 1.0 - Factor;
                var tempVec;
                var Factor1;
                var Factor2;
                var Factor3;
                var Factor4;
                var FactorTimesTwo;
                var InverseFactorTimesTwo;
                var q;
                var q1;
                var q2;
                switch (this.type) {
                    case "DontInterp":
                        RotationQuaternion.fromEulerAngles(key1.value.x, key1.value.y, key1.value.z);
                        break;
                    case "Linear":
                        q1 = key1.value.clone();
                        q2 = key2.value.clone();
                        RotationQuaternion.slerp(q1, q2, Factor);
                        break;
                    case "Hermite":
                    case "Bezier":
                        q1 = key1.value.clone();
                        q2 = key2.value.clone();
                        RotationQuaternion.slerp(q1, q2, Factor);
                        break;
                }
                return RotationQuaternion;
            };
            return BoneRotation;
        }());
        war3.BoneRotation = BoneRotation;
        /**
         * 骨骼信息(包含骨骼，helper等其他对象)
         * @author warden_feng 2014-6-26
         */
        var BoneObject = /** @class */ (function () {
            function BoneObject() {
                /** 父对象 */
                this.Parent = -1;
                /** 骨骼位移动画 */
                this.Translation = new BoneTranslation();
                /** 骨骼缩放动画 */
                this.Scaling = new BoneScaling();
                /** 骨骼角度动画 */
                this.Rotation = new BoneRotation();
                /** 当前对象变换矩阵 */
                this.c_transformation = new feng3d.Matrix3D();
                /** 当前全局变换矩阵 */
                this.c_globalTransformation = new feng3d.Matrix3D();
            }
            BoneObject.prototype.calculateTransformation = function (keyFrameTime) {
                var pScalingCenter = this.pivotPoint;
                var pScaling = this.Scaling.getScaling(keyFrameTime);
                var pRotation = this.Rotation.getRotation(keyFrameTime);
                var pTranslation = this.Translation.getTranslation(keyFrameTime);
                var matrix3D = this.c_transformation;
                matrix3D.appendScale(pScaling.x, pScaling.y, pScaling.z).append(pRotation.toMatrix3D());
                //设置旋转缩放中心
                matrix3D.prependTranslation(-this.pivotPoint.x, -this.pivotPoint.y, -this.pivotPoint.z);
                matrix3D.appendTranslation(this.pivotPoint.x, this.pivotPoint.y, this.pivotPoint.z);
                //平移
                matrix3D.appendTranslation(pTranslation.x, pTranslation.y, pTranslation.z);
                //
            };
            BoneObject.prototype.buildAnimationclip = function (animationclip, __chache__, start, end) {
                var path = [
                    [feng3d.PropertyClipPathItemType.GameObject, this.name],
                    [feng3d.PropertyClipPathItemType.Component, "feng3d.Transform"],
                ];
                if (this.Scaling.scalings.length > 0) {
                    var scalings = this.Scaling.scalings;
                    for (var i = 0, n = scalings.length; i < n; i++) {
                        var scaling = scalings[i];
                        if (start <= scaling.time && scaling.time <= end) {
                            setPropertyClipFrame(path, "scale", scaling.time - start, scaling.value.toArray(), "Vector3D");
                        }
                    }
                }
                if (this.Translation.translations.length > 0) {
                    var translations = this.Translation.translations;
                    for (var i = 0, n = translations.length; i < n; i++) {
                        var translation = translations[i];
                        if (start <= translation.time && translation.time <= end) {
                            setPropertyClipFrame(path, "position", translation.time - start, translation.value.add(this.pivotPoint).toArray(), "Vector3D");
                        }
                    }
                }
                if (this.Rotation.rotations.length > 0) {
                    var rotations = this.Rotation.rotations;
                    for (var i = 0, n = rotations.length; i < n; i++) {
                        var rotation = rotations[i];
                        if (start <= rotation.time && rotation.time <= end) {
                            setPropertyClipFrame(path, "orientation", rotation.time - start, this.Rotation.getRotationItem(rotation).toArray(), "Quaternion");
                        }
                    }
                }
                function setPropertyClipFrame(path, propertyName, time, propertyValue, type) {
                    var propertyClip = getPropertyClip(path, propertyName);
                    propertyClip.type = type;
                    propertyClip.propertyValues.push([time, propertyValue]);
                }
                function getPropertyClip(path, propertyName) {
                    var key = path.join("-") + propertyName;
                    if (__chache__[key])
                        return __chache__[key];
                    if (!__chache__[key]) {
                        var propertyClip = __chache__[key] = new feng3d.PropertyClip();
                        propertyClip.path = path;
                        propertyClip.propertyName = propertyName;
                        propertyClip.propertyValues = [];
                        animationclip.propertyClips.push(propertyClip);
                    }
                    return __chache__[key];
                }
            };
            BoneObject.prototype.getMatrix3D = function (time) {
                var pScaling = this.Scaling.getScaling(time);
                var pRotation = this.Rotation.getRotation(time);
                var pTranslation = this.Translation.getTranslation(time);
                var matrix3D = new feng3d.Matrix3D().appendScale(pScaling.x, pScaling.y, pScaling.z).append(pRotation.toMatrix3D());
                //平移
                matrix3D.appendTranslation(pTranslation.x + this.pivotPoint.x, pTranslation.y + this.pivotPoint.y, pTranslation.z + this.pivotPoint.z);
                //
                return matrix3D;
            };
            return BoneObject;
        }());
        war3.BoneObject = BoneObject;
        /**
         * 骨骼的位移信息
         */
        var BoneScaling = /** @class */ (function () {
            function BoneScaling() {
                this.scalings = [];
            }
            BoneScaling.prototype.getScaling = function (keyFrameTime) {
                var scalingVector = new feng3d.Vector3D();
                if (this.scalings.length == 0 || keyFrameTime < this.scalings[0].time || keyFrameTime > this.scalings[this.scalings.length - 1].time)
                    return new feng3d.Vector3D(1, 1, 1);
                var key1 = this.scalings[0];
                var key2 = this.scalings[0];
                for (var i = 0; i < this.scalings.length; i++) {
                    key2 = this.scalings[i];
                    if (key2.time >= keyFrameTime) {
                        break;
                    }
                    key1 = key2;
                }
                if (key1.time == key2.time) {
                    scalingVector.copyFrom(key1.value);
                    return scalingVector;
                }
                var Factor = (keyFrameTime - key1.time) / (key2.time - key1.time);
                var InverseFactor = 1.0 - Factor;
                var tempVec;
                var Factor1;
                var Factor2;
                var Factor3;
                var Factor4;
                var FactorTimesTwo;
                var InverseFactorTimesTwo;
                switch (this.type) {
                    case "DontInterp":
                        scalingVector.copyFrom(key1.value);
                        break;
                    case "Linear":
                        tempVec = key1.value.clone();
                        tempVec.scaleBy(InverseFactor);
                        scalingVector.incrementBy(tempVec);
                        tempVec = key2.value.clone();
                        tempVec.scaleBy(Factor);
                        scalingVector.incrementBy(tempVec);
                        break;
                    case "Hermite":
                        FactorTimesTwo = Factor * Factor;
                        Factor1 = FactorTimesTwo * (2.0 * Factor - 3.0) + 1;
                        Factor2 = FactorTimesTwo * (Factor - 2.0) + Factor;
                        Factor3 = FactorTimesTwo * (Factor - 1.0);
                        Factor4 = FactorTimesTwo * (3.0 - 2.0 * Factor);
                        tempVec = key1.value.clone();
                        tempVec.scaleBy(Factor1);
                        scalingVector.incrementBy(tempVec);
                        tempVec = key1.OutTan.clone();
                        tempVec.scaleBy(Factor2);
                        scalingVector.incrementBy(tempVec);
                        tempVec = key2.InTan.clone();
                        tempVec.scaleBy(Factor3);
                        scalingVector.incrementBy(tempVec);
                        tempVec = key2.value.clone();
                        tempVec.scaleBy(Factor4);
                        scalingVector.incrementBy(tempVec);
                        break;
                    case "Bezier":
                        FactorTimesTwo = Factor * Factor;
                        InverseFactorTimesTwo = InverseFactor * InverseFactor;
                        Factor1 = InverseFactorTimesTwo * InverseFactor;
                        Factor2 = 3.0 * Factor * InverseFactorTimesTwo;
                        Factor3 = 3.0 * FactorTimesTwo * InverseFactor;
                        Factor4 = FactorTimesTwo * Factor;
                        tempVec = key1.value.clone();
                        tempVec.scaleBy(Factor1);
                        scalingVector.incrementBy(tempVec);
                        tempVec = key1.OutTan.clone();
                        tempVec.scaleBy(Factor2);
                        scalingVector.incrementBy(tempVec);
                        tempVec = key2.InTan.clone();
                        tempVec.scaleBy(Factor3);
                        scalingVector.incrementBy(tempVec);
                        tempVec = key2.value.clone();
                        tempVec.scaleBy(Factor4);
                        scalingVector.incrementBy(tempVec);
                        break;
                }
                return scalingVector;
            };
            return BoneScaling;
        }());
        war3.BoneScaling = BoneScaling;
        /**
         * 骨骼的位移信息
         * @author warden_feng 2014-6-26
         */
        var BoneTranslation = /** @class */ (function () {
            function BoneTranslation() {
                this.translations = [];
            }
            BoneTranslation.prototype.getTranslation = function (keyFrameTime) {
                var TranslationVector = new feng3d.Vector3D();
                if (this.translations.length == 0)
                    return new feng3d.Vector3D();
                var key1 = this.translations[0];
                var key2 = this.translations[0];
                for (var i = 0; i < this.translations.length; i++) {
                    key2 = this.translations[i];
                    if (key2.time > keyFrameTime) {
                        break;
                    }
                    key1 = key2;
                }
                if (key1 == key2) {
                    TranslationVector.copyFrom(key1.value);
                    return TranslationVector;
                }
                var Factor = (keyFrameTime - key1.time) / (key2.time - key1.time);
                var InverseFactor = 1.0 - Factor;
                var tempVec;
                var Factor1;
                var Factor2;
                var Factor3;
                var Factor4;
                var FactorTimesTwo;
                var InverseFactorTimesTwo;
                switch (this.type) {
                    case "DontInterp":
                        TranslationVector.copyFrom(key1.value);
                        break;
                    case "Linear":
                        tempVec = key1.value.clone();
                        tempVec.scaleBy(InverseFactor);
                        TranslationVector.incrementBy(tempVec);
                        tempVec = key2.value.clone();
                        tempVec.scaleBy(Factor);
                        TranslationVector.incrementBy(tempVec);
                        break;
                    case "Hermite":
                        FactorTimesTwo = Factor * Factor;
                        Factor1 = FactorTimesTwo * (2.0 * Factor - 3.0) + 1;
                        Factor2 = FactorTimesTwo * (Factor - 2.0) + Factor;
                        Factor3 = FactorTimesTwo * (Factor - 1.0);
                        Factor4 = FactorTimesTwo * (3.0 - 2.0 * Factor);
                        tempVec = key1.value.clone();
                        tempVec.scaleBy(Factor1);
                        TranslationVector.incrementBy(tempVec);
                        tempVec = key1.OutTan.clone();
                        tempVec.scaleBy(Factor2);
                        TranslationVector.incrementBy(tempVec);
                        tempVec = key2.InTan.clone();
                        tempVec.scaleBy(Factor3);
                        TranslationVector.incrementBy(tempVec);
                        tempVec = key2.value.clone();
                        tempVec.scaleBy(Factor4);
                        TranslationVector.incrementBy(tempVec);
                        break;
                    case "Bezier":
                        FactorTimesTwo = Factor * Factor;
                        InverseFactorTimesTwo = InverseFactor * InverseFactor;
                        Factor1 = InverseFactorTimesTwo * InverseFactor;
                        Factor2 = 3.0 * Factor * InverseFactorTimesTwo;
                        Factor3 = 3.0 * FactorTimesTwo * InverseFactor;
                        Factor4 = FactorTimesTwo * Factor;
                        tempVec = key1.value.clone();
                        tempVec.scaleBy(Factor1);
                        TranslationVector.incrementBy(tempVec);
                        tempVec = key1.OutTan.clone();
                        tempVec.scaleBy(Factor2);
                        TranslationVector.incrementBy(tempVec);
                        tempVec = key2.InTan.clone();
                        tempVec.scaleBy(Factor3);
                        TranslationVector.incrementBy(tempVec);
                        tempVec = key2.value.clone();
                        tempVec.scaleBy(Factor4);
                        TranslationVector.incrementBy(tempVec);
                        break;
                }
                return TranslationVector;
            };
            return BoneTranslation;
        }());
        war3.BoneTranslation = BoneTranslation;
        /**
         * 纹理
         * @author warden_feng 2014-6-26
         */
        var FBitmap = /** @class */ (function () {
            function FBitmap() {
            }
            return FBitmap;
        }());
        war3.FBitmap = FBitmap;
        /**
         * 几何设置
         * @author warden_feng 2014-6-26
         */
        var Geoset = /** @class */ (function () {
            function Geoset() {
                /** 动作信息 */
                this.Anims = [];
            }
            return Geoset;
        }());
        war3.Geoset = Geoset;
        /**
         * 几何体动画
         * @author warden_feng 2014-6-26
         */
        var GeosetAnim = /** @class */ (function () {
            function GeosetAnim() {
            }
            return GeosetAnim;
        }());
        war3.GeosetAnim = GeosetAnim;
        /**
         * 全局序列
         * @author warden_feng 2014-6-26
         */
        var Globalsequences = /** @class */ (function () {
            function Globalsequences() {
                /** 持续时间 */
                this.durations = [];
            }
            return Globalsequences;
        }());
        war3.Globalsequences = Globalsequences;
        /**
         * 动作间隔
         * @author warden_feng 2014-6-26
         */
        var Interval = /** @class */ (function () {
            function Interval() {
            }
            return Interval;
        }());
        war3.Interval = Interval;
        /**
         * 材质层
         * @author warden_feng 2014-6-26
         */
        var Layer = /** @class */ (function () {
            function Layer() {
            }
            return Layer;
        }());
        war3.Layer = Layer;
        /**
         * 材质
         * @author warden_feng 2014-6-26
         */
        var Material = /** @class */ (function () {
            function Material() {
                /** 材质层列表 */
                this.layers = [];
            }
            return Material;
        }());
        war3.Material = Material;
        /**
         * 模型信息
         * @author warden_feng 2014-6-26
         */
        var Model = /** @class */ (function () {
            function Model() {
            }
            return Model;
        }());
        war3.Model = Model;
        /**
         *
         * @author warden_feng 2014-6-26
         */
        var Rotation = /** @class */ (function () {
            function Rotation() {
            }
            return Rotation;
        }());
        war3.Rotation = Rotation;
        /**
     *
     * @author warden_feng 2014-6-26
     */
        var Scaling = /** @class */ (function () {
            function Scaling() {
            }
            return Scaling;
        }());
        war3.Scaling = Scaling;
        /**
         *
         * @author warden_feng 2014-6-26
         */
        var Translation = /** @class */ (function () {
            function Translation() {
            }
            return Translation;
        }());
        war3.Translation = Translation;
    })(war3 = feng3d.war3 || (feng3d.war3 = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var war3;
    (function (war3) {
        /**
         * war3模型数据
         * @author warden_feng 2014-6-28
         */
        var War3Model = /** @class */ (function () {
            function War3Model() {
                /** 几何设置列表 */
                this.geosets = [];
                /** 骨骼动画列表 */
                this.bones = [];
                this.root = "";
            }
            War3Model.prototype.getMesh = function () {
                this.meshs = [];
                this.meshs.length = this.geosets.length;
                var container = feng3d.GameObject.create(this.model.name);
                var skeletonjoints = createSkeleton(this);
                this.skeletonComponent = container.addComponent(feng3d.SkeletonComponent);
                this.skeletonComponent.joints = skeletonjoints;
                for (var i = 0; i < this.geosets.length; i++) {
                    var geoset = this.geosets[i];
                    var geometry = new feng3d.CustomGeometry();
                    geometry.positions = geoset.Vertices;
                    geometry.uvs = geoset.TVertices;
                    geometry.indices = geoset.Faces;
                    var normals = feng3d.GeometryUtils.createVertexNormals(geometry.indices, geometry.positions, true);
                    geometry.normals = normals;
                    var skins = BuildAnimatedMeshSkin(geoset);
                    var skinSkeleton = new feng3d.SkinSkeletonTemp();
                    skinSkeleton.resetJointIndices(skins.jointIndices0, this.skeletonComponent);
                    //更新关节索引与权重索引
                    geometry.setVAData("a_jointindex0", skins.jointIndices0, 4);
                    geometry.setVAData("a_jointweight0", skins.jointWeights0, 4);
                    var material = this.materials[geoset.MaterialID];
                    var fBitmap = this.getFBitmap(material);
                    var material1 = new feng3d.StandardMaterial();
                    var image = fBitmap.image;
                    if (image && image.length > 0) {
                        image = image.substring(0, image.indexOf("."));
                        image += ".JPG";
                        image = this.root + image;
                        material1.diffuseMethod.difuseTexture.url = image;
                        material1.cullFace = feng3d.CullFace.FRONT;
                    }
                    var mesh = this.meshs[i] = feng3d.GameObject.create();
                    // var meshRenderer = mesh.addComponent(MeshRenderer);
                    var meshRenderer = mesh.addComponent(feng3d.SkinnedMeshRenderer);
                    meshRenderer.geometry = geometry;
                    meshRenderer.material = material1;
                    meshRenderer.skinSkeleton = skinSkeleton;
                    container.addChild(mesh);
                }
                var animationclips = createAnimationClips(this);
                var animation = container.addComponent(feng3d.Animation);
                animation.animation = animationclips[0];
                animation.animations = animationclips;
                //
                container.transform.rx = 90;
                container.transform.sz = -1;
                return container;
            };
            War3Model.prototype.getFBitmap = function (material) {
                var TextureID = 0;
                for (var i = 0; i < material.layers.length; i++) {
                    var layer = material.layers[i];
                    TextureID = layer.TextureID;
                    break;
                }
                var fBitmap = this.textures[TextureID];
                return fBitmap;
            };
            return War3Model;
        }());
        war3.War3Model = War3Model;
        function createSkeleton(war3Model) {
            var bones = war3Model.bones;
            var skeletonjoints = [];
            for (var i = 0; i < bones.length; i++) {
                createSkeletonJoint(i);
            }
            return skeletonjoints;
            function createSkeletonJoint(index) {
                if (skeletonjoints[index])
                    return skeletonjoints[index];
                var joint = bones[index];
                var skeletonJoint = new feng3d.SkeletonJoint();
                skeletonJoint.name = joint.name;
                skeletonJoint.parentIndex = joint.Parent;
                var position = war3Model.pivotPoints[joint.ObjectId];
                ;
                var matrix3D = new feng3d.Matrix3D().recompose([
                    position,
                    new feng3d.Vector3D(),
                    new feng3d.Vector3D(1, 1, 1)
                ]);
                if (skeletonJoint.parentIndex != -1) {
                    var parentskeletonJoint = createSkeletonJoint(skeletonJoint.parentIndex);
                    joint.pivotPoint = matrix3D.position.subtract(parentskeletonJoint.matrix3D.position);
                }
                else {
                    joint.pivotPoint = position;
                }
                skeletonJoint.matrix3D = matrix3D;
                skeletonjoints[index] = skeletonJoint;
                return skeletonJoint;
            }
        }
        function BuildAnimatedMeshSkin(geoset) {
            //关节索引数据
            var jointIndices0 = [];
            //关节权重数据
            var jointWeights0 = [];
            var numVertexs = geoset.Vertices.length / 3;
            for (var i = 0; i < numVertexs; i++) {
                //顶点所在组索引
                var iGroupIndex = geoset.VertexGroup[i];
                //顶点所在组索引
                var group = geoset.Groups[iGroupIndex];
                //顶点关联骨骼数量
                var numBones = group.length;
                var weightJoints = [0, 0, 0, 0];
                for (var j = 0; j < numBones; j++) {
                    var boneIndex = group[j];
                    weightJoints[j] = boneIndex;
                }
                var weightBiass = [0, 0, 0, 0];
                for (var j = 0; j < 4; j++) {
                    if (j < numBones)
                        weightBiass[j] = 1 / numBones;
                }
                //
                jointIndices0[i * 4] = weightJoints[0];
                jointIndices0[i * 4 + 1] = weightJoints[1];
                jointIndices0[i * 4 + 2] = weightJoints[2];
                jointIndices0[i * 4 + 3] = weightJoints[3];
                //
                jointWeights0[i * 4] = weightBiass[0];
                jointWeights0[i * 4 + 1] = weightBiass[1];
                jointWeights0[i * 4 + 2] = weightBiass[2];
                jointWeights0[i * 4 + 3] = weightBiass[3];
            }
            return { jointIndices0: jointIndices0, jointWeights0: jointWeights0 };
        }
        function createAnimationClips(war3Model) {
            var sequences = war3Model.sequences;
            var animationclips = [];
            for (var i = 0; i < sequences.length; i++) {
                var sequence = sequences[i];
                var animationclip = new feng3d.AnimationClip();
                animationclip.name = sequence.name;
                animationclip.loop = sequence.loop;
                animationclip.length = sequence.interval.end - sequence.interval.start;
                animationclip.propertyClips = [];
                var __chache__ = {};
                war3Model.bones.forEach(function (bone) {
                    bone.buildAnimationclip(animationclip, __chache__, sequence.interval.start, sequence.interval.end);
                });
                animationclips.push(animationclip);
            }
            return animationclips;
        }
    })(war3 = feng3d.war3 || (feng3d.war3 = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var war3;
    (function (war3) {
        /**
         * war3的mdl文件解析
         * @author warden_feng 2014-6-14
         */
        war3.MdlParser = {
            parse: parse
        };
        var VERSION_TOKEN = "Version";
        var COMMENT_TOKEN = "//";
        var MODEL = "Model";
        var SEQUENCES = "Sequences";
        var GLOBALSEQUENCES = "GlobalSequences";
        var TEXTURES = "Textures";
        var MATERIALS = "Materials";
        var GEOSET = "Geoset";
        var GEOSETANIM = "GeosetAnim";
        var BONE = "Bone";
        var HELPER = "Helper";
        function parse(data, onParseComplete) {
            var token;
            var bone;
            var geoset;
            var junpStr;
            var num = 0;
            var war3Model = new war3.War3Model();
            /** 字符串数据 */
            var context = data;
            /** 当前解析位置 */
            var _parseIndex = 0;
            /** 是否文件尾 */
            var _reachedEOF = false;
            /** 当前解析行号 */
            var _line;
            /** 当前行的字符位置 */
            var _charLineIndex = 0;
            while (!_reachedEOF) {
                //获取关键字
                token = getNextToken();
                switch (token) {
                    case COMMENT_TOKEN:
                        ignoreLine();
                        break;
                    case VERSION_TOKEN:
                        war3Model._version = parseVersion();
                        break;
                    case MODEL:
                        war3Model.model = parseModel();
                        break;
                    case SEQUENCES:
                        war3Model.sequences = parseSequences();
                        break;
                    case GLOBALSEQUENCES:
                        war3Model.globalsequences = parseGlobalsequences();
                        break;
                    case TEXTURES:
                        war3Model.textures = parseTextures();
                        break;
                    case MATERIALS:
                        war3Model.materials = parseMaterials();
                        break;
                    case GEOSET:
                        geoset = parseGeoset();
                        war3Model.geosets.push(geoset);
                        break;
                    case GEOSETANIM:
                        parseGeosetanim();
                        break;
                    case BONE:
                        bone = parseBone();
                        war3Model.bones[bone.ObjectId] = bone;
                        break;
                    case HELPER:
                        bone = parseHelper();
                        war3Model.bones[bone.ObjectId] = bone;
                        break;
                    case "PivotPoints":
                        war3Model.pivotPoints = parsePivotPoints();
                        break;
                    case "ParticleEmitter2":
                        parseLiteralString();
                        junpStr = jumpChunk();
                        break;
                    case "EventObject":
                        parseLiteralString();
                        junpStr = jumpChunk();
                        break;
                    case "Attachment":
                        parseLiteralString();
                        junpStr = jumpChunk();
                        break;
                    case "RibbonEmitter":
                        parseLiteralString();
                        junpStr = jumpChunk();
                        break;
                    case "CollisionShape":
                        parseLiteralString();
                        junpStr = jumpChunk();
                        break;
                    case "Camera":
                        parseLiteralString();
                        junpStr = jumpChunk();
                        break;
                    case "Light":
                        parseLiteralString();
                        junpStr = jumpChunk();
                        break;
                    default:
                        if (!_reachedEOF)
                            sendUnknownKeywordError(token);
                }
            }
            onParseComplete && onParseComplete(war3Model);
            /**
             * 获取骨骼深度
             * @param bone
             * @param bones
             * @return
             */
            function getBoneDepth(bone, bones) {
                if (bone.Parent == -1)
                    return 0;
                return getBoneDepth(bones[bone.Parent], bones) + 1;
            }
            /**
             * 解析版本号
             */
            function parseVersion() {
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                token = getNextToken();
                if (token != "FormatVersion")
                    sendUnknownKeywordError(token);
                var version = getNextInt();
                token = getNextToken();
                if (token != "}")
                    sendParseError(token);
                return version;
            }
            /**
             * 解析模型数据统计结果
             */
            function parseModel() {
                var model = new war3.Model();
                model.name = parseLiteralString();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "BlendTime":
                            model.BlendTime = getNextInt();
                            break;
                        case "MinimumExtent":
                            model.MinimumExtent = parseVector3D();
                            break;
                        case "MaximumExtent":
                            model.MaximumExtent = parseVector3D();
                            break;
                        case "}":
                            break;
                        default:
                            ignoreLine();
                            break;
                    }
                }
                return model;
            }
            /**
             * 解析动作序列
             */
            function parseSequences() {
                //跳过动作个数
                getNextInt();
                var sequences = [];
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "Anim":
                            var anim = parseAnim();
                            sequences.push(anim);
                            break;
                        case "}":
                            break;
                        default:
                            sendUnknownKeywordError(ch);
                            break;
                    }
                }
                return sequences;
            }
            /**
             * 解析全局序列
             */
            function parseGlobalsequences() {
                var globalsequences = new war3.Globalsequences();
                globalsequences.id = getNextInt();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "Duration":
                            var duration = getNextInt();
                            globalsequences.durations.push(duration);
                            break;
                        case "}":
                            break;
                        default:
                            sendUnknownKeywordError(ch);
                            break;
                    }
                }
                return globalsequences;
            }
            /**
             * 解析纹理列表
             */
            function parseTextures() {
                //跳过纹理个数
                getNextInt();
                var bitmaps = [];
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "Bitmap":
                            var bitmap = parseBitmap();
                            bitmaps.push(bitmap);
                            break;
                        case "}":
                            break;
                        default:
                            sendUnknownKeywordError(ch);
                            break;
                    }
                }
                return bitmaps;
            }
            /**
             * 解析材质
             */
            function parseMaterials() {
                //跳过纹理个数
                getNextInt();
                var materials = [];
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "Material":
                            var material = parseMaterial();
                            materials.push(material);
                            break;
                        case "}":
                            break;
                        default:
                            sendUnknownKeywordError(ch);
                            break;
                    }
                }
                return materials;
            }
            function parseGeoset() {
                var geoset = new war3.Geoset();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "Vertices":
                            geoset.Vertices = parseVertices();
                            break;
                        case "Normals":
                            geoset.Normals = parseNormals();
                            break;
                        case "TVertices":
                            geoset.TVertices = parseTVertices();
                            break;
                        case "VertexGroup":
                            geoset.VertexGroup = parseVertexGroup();
                            break;
                        case "Faces":
                            geoset.Faces = parseFaces();
                            break;
                        case "Groups":
                            geoset.Groups = parseGroups();
                            break;
                        case "MinimumExtent":
                            geoset.MinimumExtent = parseVector3D();
                            break;
                        case "MaximumExtent":
                            geoset.MaximumExtent = parseVector3D();
                            break;
                        case "BoundsRadius":
                            geoset.BoundsRadius = getNextNumber();
                            break;
                        case "Anim":
                            var anim = parseAnim1();
                            geoset.Anims.push(anim);
                            break;
                        case "MaterialID":
                            geoset.MaterialID = getNextInt();
                            break;
                        case "SelectionGroup":
                            geoset.SelectionGroup = getNextInt();
                            break;
                        case "Unselectable":
                            geoset.Unselectable = true;
                            break;
                        case "}":
                            break;
                        default:
                            sendUnknownKeywordError(ch);
                            break;
                    }
                }
                return geoset;
            }
            /**
             * 解析骨骼动画
             */
            function parseBone() {
                var bone = new war3.BoneObject();
                bone.type = "bone";
                bone.name = parseLiteralString();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "ObjectId":
                            bone.ObjectId = getNextInt();
                            break;
                        case "Parent":
                            bone.Parent = getNextInt();
                            break;
                        case "GeosetId":
                            bone.GeosetId = getNextToken();
                            break;
                        case "GeosetAnimId":
                            bone.GeosetAnimId = getNextToken();
                            break;
                        case "Billboarded":
                            bone.Billboarded = true;
                            break;
                        case "Translation":
                            parseBoneTranslation(bone.Translation);
                            break;
                        case "Scaling":
                            parseBoneScaling(bone.Scaling);
                            break;
                        case "Rotation":
                            parseBoneRotation(bone.Rotation);
                            break;
                        case "BillboardedLockZ":
                            break;
                        case "BillboardedLockY":
                            break;
                        case "BillboardedLockX":
                            break;
                        case "}":
                            break;
                        default:
                            sendUnknownKeywordError(ch);
                            break;
                    }
                }
                return bone;
            }
            /**
             * 解析骨骼动画
             */
            function parseHelper() {
                var bone = new war3.BoneObject();
                bone.type = "helper";
                bone.name = parseLiteralString();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "ObjectId":
                            bone.ObjectId = getNextInt();
                            break;
                        case "Parent":
                            bone.Parent = getNextInt();
                            break;
                        case "GeosetId":
                            bone.GeosetId = getNextToken();
                            break;
                        case "GeosetAnimId":
                            bone.GeosetAnimId = getNextToken();
                            break;
                        case "Billboarded":
                            bone.Billboarded = true;
                            break;
                        case "Translation":
                            parseBoneTranslation(bone.Translation);
                            break;
                        case "Scaling":
                            parseBoneScaling(bone.Scaling);
                            break;
                        case "Rotation":
                            parseBoneRotation(bone.Rotation);
                            break;
                        case "BillboardedLockX":
                            break;
                        case "BillboardedLockY":
                            break;
                        case "BillboardedLockZ":
                            break;
                        case "DontInherit":
                            jumpChunk();
                            break;
                        case "}":
                            break;
                        default:
                            sendUnknownKeywordError(ch);
                            break;
                    }
                }
                return bone;
            }
            /**
             * 解析骨骼角度
             */
            function parseBoneScaling(boneScaling) {
                //跳过长度
                var len = getNextInt();
                check("{");
                boneScaling.type = getNextToken();
                var currentIndex = _parseIndex;
                var token = getNextToken();
                if (token == "GlobalSeqId") {
                    boneScaling.GlobalSeqId = getNextInt();
                }
                else {
                    _parseIndex = currentIndex;
                }
                var i = 0;
                var scaling;
                switch (boneScaling.type) {
                    case "Hermite":
                    case "Bezier":
                        for (i = 0; i < len; i++) {
                            scaling = new war3.Scaling();
                            scaling.time = getNextInt();
                            scaling.value = parseVector3D();
                            scaling[getNextToken()] = parseVector3D();
                            scaling[getNextToken()] = parseVector3D();
                            boneScaling.scalings.push(scaling);
                        }
                        break;
                    case "Linear":
                        for (i = 0; i < len; i++) {
                            scaling = new war3.Scaling();
                            scaling.time = getNextInt();
                            scaling.value = parseVector3D();
                            boneScaling.scalings.push(scaling);
                        }
                        break;
                    case "DontInterp":
                        for (i = 0; i < len; i++) {
                            scaling = new war3.Scaling();
                            scaling.time = getNextInt();
                            scaling.value = parseVector3D();
                            boneScaling.scalings.push(scaling);
                        }
                        break;
                    default:
                        throw new Error("未处理" + boneScaling.type + "类型角度");
                }
                check("}");
            }
            /**
             * 解析骨骼角度
             */
            function parseBoneTranslation(boneTranslation) {
                //跳过长度
                var len = getNextInt();
                check("{");
                boneTranslation.type = getNextToken();
                var currentIndex = _parseIndex;
                var token = getNextToken();
                if (token == "GlobalSeqId") {
                    boneTranslation.GlobalSeqId = getNextInt();
                }
                else {
                    _parseIndex = currentIndex;
                }
                var i = 0;
                var translation;
                switch (boneTranslation.type) {
                    case "Hermite":
                    case "Bezier":
                        for (i = 0; i < len; i++) {
                            translation = new war3.Translation();
                            translation.time = getNextInt();
                            translation.value = parseVector3D();
                            translation[getNextToken()] = parseVector3D();
                            translation[getNextToken()] = parseVector3D();
                            boneTranslation.translations.push(translation);
                        }
                        break;
                    case "Linear":
                        for (i = 0; i < len; i++) {
                            translation = new war3.Translation();
                            translation.time = getNextInt();
                            translation.value = parseVector3D();
                            boneTranslation.translations.push(translation);
                        }
                        break;
                    case "DontInterp":
                        for (i = 0; i < len; i++) {
                            translation = new war3.Translation();
                            translation.time = getNextInt();
                            translation.value = parseVector3D();
                            boneTranslation.translations.push(translation);
                        }
                        break;
                    default:
                        throw new Error("未处理" + boneTranslation.type + "类型角度");
                }
                check("}");
            }
            /**
             * 解析骨骼角度
             */
            function parseBoneRotation(boneRotation) {
                var len = getNextInt();
                check("{");
                boneRotation.type = getNextToken();
                var currentIndex = _parseIndex;
                var token = getNextToken();
                if (token == "GlobalSeqId") {
                    boneRotation.GlobalSeqId = getNextInt();
                }
                else {
                    _parseIndex = currentIndex;
                }
                var i = 0;
                var rotation;
                switch (boneRotation.type) {
                    case "Hermite":
                    case "Bezier":
                        for (i = 0; i < len; i++) {
                            rotation = new war3.Rotation();
                            rotation.time = getNextInt();
                            rotation.value = parseVector3D4();
                            rotation[getNextToken()] = parseVector3D4();
                            rotation[getNextToken()] = parseVector3D4();
                            boneRotation.rotations.push(rotation);
                        }
                        break;
                    case "Linear":
                        for (i = 0; i < len; i++) {
                            rotation = new war3.Rotation();
                            rotation.time = getNextInt();
                            rotation.value = parseVector3D4();
                            boneRotation.rotations.push(rotation);
                        }
                        break;
                    case "DontInterp":
                        for (i = 0; i < len; i++) {
                            rotation = new war3.Rotation();
                            rotation.time = getNextInt();
                            rotation.value = parseVector3D4();
                            boneRotation.rotations.push(rotation);
                        }
                        break;
                    default:
                        throw new Error("未处理" + boneRotation.type + "类型角度");
                }
                check("}");
            }
            /**
             * 解析多边形动画
             */
            function parseGeosetanim() {
                var jumpStr = jumpChunk();
                return null;
                // if (war3Model.geosetAnims == null)
                // 	war3Model.geosetAnims = [];
                // var geosetAnim: GeosetAnim = new GeosetAnim();
                // war3Model.geosetAnims.push(geosetAnim);
                // var token: string = getNextToken();
                // if (token != "{")
                // 	sendParseError(token);
                // var ch: string;
                // while (ch != "}")
                // {
                // 	ch = getNextToken();
                // 	switch (ch)
                // 	{
                // 		case COMMENT_TOKEN:
                // 			ignoreLine();
                // 			break;
                // 		case "Alpha":
                // 			//						parseAnimAlpha();
                // 			break;
                // 		case "}":
                // 			break;
                // 		default:
                // 			sendUnknownKeywordError(ch);
                // 			break;
                // 	}
                // }
                // return geosetAnim;
            }
            /**
             * 解析顶点
             */
            function parseVertices() {
                var vertices = [];
                //跳过长度
                var len = getNextInt();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var vertex;
                for (var i = 0; i < len; i++) {
                    vertex = parseVector3D();
                    vertices.push(vertex.x, vertex.y, vertex.z);
                }
                token = getNextToken();
                if (token != "}")
                    sendParseError(token);
                return vertices;
            }
            /**
             * 解析法线
             */
            function parseNormals() {
                var normals = [];
                //跳过长度
                var len = getNextInt();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var vertex;
                for (var i = 0; i < len; i++) {
                    vertex = parseVector3D();
                    normals.push(vertex.x, vertex.y, vertex.z);
                }
                token = getNextToken();
                if (token != "}")
                    sendParseError(token);
                return normals;
            }
            /**
             * 解析纹理坐标
             */
            function parseTVertices() {
                var tVertices = [];
                //跳过长度
                var len = getNextInt();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var uv;
                for (var i = 0; i < len; i++) {
                    uv = parsePoint();
                    tVertices.push(uv.x, uv.y);
                }
                token = getNextToken();
                if (token != "}")
                    sendParseError(token);
                return tVertices;
            }
            /**
             * 解析顶点分组
             */
            function parseVertexGroup() {
                var vertexGroup = [];
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                token = getNextToken();
                while (token != "}") {
                    vertexGroup.push(Number(token));
                    token = getNextToken();
                }
                return vertexGroup;
            }
            /**
             * 解析面
             */
            function parseFaces() {
                var faces = [];
                var faceNum = getNextInt();
                var indexNum = getNextInt();
                var token;
                check("{");
                check("Triangles");
                check("{");
                check("{");
                token = getNextToken();
                while (token != "}") {
                    faces.push(Number(token));
                    token = getNextToken();
                }
                check("}");
                check("}");
                return faces;
            }
            /**
             * 解顶点分组
             */
            function parseGroups() {
                var groups = [];
                var groupNum = getNextInt();
                var valueNum = getNextInt();
                var token;
                check("{");
                token = getNextToken();
                while (token != "}") {
                    if (token == "Matrices") {
                        check("{");
                        token = getNextToken();
                        var Matrices = [];
                        while (token != "}") {
                            Matrices.push(Number(token));
                            token = getNextToken();
                        }
                        groups.push(Matrices);
                    }
                    token = getNextToken();
                }
                return groups;
            }
            /**
             * 解析纹理
             */
            function parseBitmap() {
                var bitmap = new war3.FBitmap();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "Image":
                            bitmap.image = parseLiteralString();
                            break;
                        case "ReplaceableId":
                            bitmap.ReplaceableId = getNextInt();
                            break;
                        case "WrapWidth":
                            break;
                        case "WrapHeight":
                            break;
                        case "}":
                            break;
                        default:
                            sendUnknownKeywordError(ch);
                            break;
                    }
                }
                return bitmap;
            }
            /**
             * 解析材质
             */
            function parseMaterial() {
                var material = new war3.Material();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "Layer":
                            var layer = parseLayer();
                            material.layers.push(layer);
                            break;
                        case "SortPrimsFarZ":
                            break;
                        case "ConstantColor":
                            break;
                        case "}":
                            break;
                        default:
                            sendUnknownKeywordError(ch);
                            break;
                    }
                }
                return material;
            }
            /**
             * 解析材质层
             */
            function parseLayer() {
                var layer = new war3.Layer();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var staticSigned = false;
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "FilterMode":
                            layer.FilterMode = getNextToken();
                            break;
                        case "static":
                            staticSigned = true;
                            break;
                        case "TextureID":
                            if (staticSigned) {
                                layer.TextureID = getNextInt();
                            }
                            else {
                                sendUnknownKeywordError(ch);
                            }
                            staticSigned = false;
                            break;
                        case "Alpha":
                            if (staticSigned) {
                                layer.Alpha = getNextNumber();
                            }
                            else {
                                getNextInt();
                                jumpChunk();
                                //							sendUnknownKeywordError(ch);
                            }
                            staticSigned = false;
                            break;
                        case "Unshaded":
                            layer.Unshaded = true;
                            break;
                        case "Unfogged":
                            layer.Unfogged = true;
                            break;
                        case "TwoSided":
                            layer.TwoSided = true;
                            break;
                        case "SphereEnvMap":
                            layer.SphereEnvMap = true;
                            break;
                        case "NoDepthTest":
                            layer.NoDepthTest = true;
                            break;
                        case "NoDepthSet":
                            layer.NoDepthSet = true;
                            break;
                        case "}":
                            break;
                        default:
                            sendUnknownKeywordError(ch);
                            break;
                    }
                }
                return layer;
            }
            /**
             * 解析动作信息
             */
            function parseAnim() {
                var anim = new war3.AnimInfo();
                anim.name = parseLiteralString();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "Interval":
                            anim.interval = parseInterval();
                            break;
                        case "MinimumExtent":
                            anim.MinimumExtent = parseVector3D();
                            break;
                        case "MaximumExtent":
                            anim.MaximumExtent = parseVector3D();
                            break;
                        case "BoundsRadius":
                            anim.BoundsRadius = getNextNumber();
                            break;
                        case "Rarity":
                            anim.Rarity = getNextNumber();
                            break;
                        case "NonLooping":
                            anim.loop = false;
                            break;
                        case "MoveSpeed":
                            anim.MoveSpeed = getNextNumber();
                            break;
                        case "}":
                            break;
                        default:
                            sendUnknownKeywordError(ch);
                            break;
                    }
                }
                return anim;
            }
            /**
             * 解析几何体动作信息
             */
            function parseAnim1() {
                var anim = new war3.AnimInfo1();
                var token = getNextToken();
                if (token != "{")
                    sendParseError(token);
                var ch = "";
                while (ch != "}") {
                    ch = getNextToken();
                    switch (ch) {
                        case COMMENT_TOKEN:
                            ignoreLine();
                            break;
                        case "MinimumExtent":
                            anim.MinimumExtent = parseVector3D();
                            break;
                        case "MaximumExtent":
                            anim.MaximumExtent = parseVector3D();
                            break;
                        case "BoundsRadius":
                            anim.BoundsRadius = getNextNumber();
                            break;
                        case "}":
                            break;
                        default:
                            sendUnknownKeywordError(ch);
                            break;
                    }
                }
                return anim;
            }
            /**
             * 解析骨骼轴心坐标
             */
            function parsePivotPoints() {
                var points = [];
                var len = getNextInt();
                check("{");
                for (var i = 0; i < len; i++) {
                    var point = parseVector3D();
                    points.push(point);
                }
                check("}");
                return points;
            }
            /**
             * 解析3d向量
             */
            function parseVector3D() {
                var vec = new feng3d.Vector3D();
                var ch = getNextToken();
                if (ch != "{")
                    sendParseError("{");
                vec.x = getNextNumber();
                vec.y = getNextNumber();
                vec.z = getNextNumber();
                ch = getNextToken();
                if (!(ch == "}" || ch == "},"))
                    sendParseError("}");
                return vec;
            }
            /**
             * 解析四元素
             */
            function parseVector3D4() {
                var vec = new feng3d.Quaternion();
                var ch = getNextToken();
                if (ch != "{")
                    sendParseError("{");
                vec.x = getNextNumber();
                vec.y = getNextNumber();
                vec.z = getNextNumber();
                vec.w = getNextNumber();
                ch = getNextToken();
                if (!(ch == "}" || ch == "},"))
                    sendParseError("}");
                return vec;
            }
            /**
             * 解析2d坐标
             */
            function parsePoint() {
                var point = new feng3d.Point();
                var ch = getNextToken();
                if (ch != "{")
                    sendParseError("{");
                point.x = getNextNumber();
                point.y = getNextNumber();
                ch = getNextToken();
                if (!(ch == "}" || ch == "},"))
                    sendParseError("}");
                return point;
            }
            /**
             * 解析间隔
             */
            function parseInterval() {
                var interval = new war3.Interval();
                var ch = getNextToken();
                if (ch != "{")
                    sendParseError("{");
                interval.start = getNextInt();
                interval.end = getNextInt();
                ch = getNextToken();
                if (!(ch == "}" || ch == "},"))
                    sendParseError("}");
                return interval;
            }
            /**
             * 解析带双引号的字符串
             */
            function parseLiteralString() {
                skipWhiteSpace();
                var ch = getNextChar();
                var str = "";
                if (ch != "\"")
                    sendParseError("\"");
                do {
                    if (_reachedEOF)
                        sendEOFError();
                    ch = getNextChar();
                    if (ch != "\"")
                        str += ch;
                } while (ch != "\"");
                return str;
            }
            /**
             * 读取下个Number
             */
            function getNextNumber() {
                var f = parseFloat(getNextToken());
                if (isNaN(f))
                    sendParseError("float type");
                return f;
            }
            /**
             * 读取下个字符
             */
            function getNextChar() {
                var ch = context.charAt(_parseIndex++);
                if (ch == "\n") {
                    ++_line;
                    _charLineIndex = 0;
                }
                else if (ch != "\r")
                    ++_charLineIndex;
                if (_parseIndex >= context.length)
                    _reachedEOF = true;
                return ch;
            }
            /**
             * 读取下个int
             */
            function getNextInt() {
                var i = parseInt(getNextToken());
                if (isNaN(i))
                    sendParseError("int type");
                return i;
            }
            /**
             * 获取下个关键字
             */
            function getNextToken() {
                var ch;
                var token = "";
                while (!_reachedEOF) {
                    ch = getNextChar();
                    if (ch == " " || ch == "\r" || ch == "\n" || ch == "\t" || ch == ",") {
                        if (token != COMMENT_TOKEN)
                            skipWhiteSpace();
                        if (token != "")
                            return token;
                    }
                    else
                        token += ch;
                    if (token == COMMENT_TOKEN)
                        return token;
                }
                return token;
            }
            /**
             * 跳过块
             * @return 跳过的内容
             */
            function jumpChunk() {
                var start = _parseIndex;
                check("{");
                var stack = ["{"];
                var ch;
                while (!_reachedEOF) {
                    ch = getNextChar();
                    if (ch == "{") {
                        stack.push("{");
                    }
                    if (ch == "}") {
                        stack.pop();
                        if (stack.length == 0) {
                            return context.substring(start, _parseIndex);
                        }
                    }
                }
                return "";
            }
            /**
             * 返回到上个字符位置
             */
            function putBack() {
                _parseIndex--;
                _charLineIndex--;
                _reachedEOF = _parseIndex >= context.length;
            }
            /**
             * 跳过空白
             */
            function skipWhiteSpace() {
                var ch;
                do
                    ch = getNextChar();
                while (ch == "\n" || ch == " " || ch == "\r" || ch == "\t");
                putBack();
            }
            /**
             * 忽略该行
             */
            function ignoreLine() {
                var ch = "";
                while (!_reachedEOF && ch != "\n")
                    ch = getNextChar();
            }
            function check(key) {
                var token = getNextToken();
                if (token != key)
                    sendParseError(token);
            }
            /**
             * 抛出一个文件尾过早结束文件时遇到错误
             */
            function sendEOFError() {
                throw new Error("Unexpected end of file");
            }
            /**
             * 遇到了一个意想不到的令牌时将抛出一个错误。
             * @param expected 发生错误的标记
             */
            function sendParseError(expected) {
                throw new Error("Unexpected token at line " + (_line + 1) + ", character " + _charLineIndex + ". " + expected + " expected, but " + context.charAt(_parseIndex - 1) + " encountered");
            }
            /**
             * 发生未知关键字错误
             */
            function sendUnknownKeywordError(keyword) {
                throw new Error("Unknown keyword[" + keyword + "] at line " + (_line + 1) + ", character " + _charLineIndex + ". ");
            }
        }
    })(war3 = feng3d.war3 || (feng3d.war3 = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Obj模型加载类
     * @author feng 2017-01-18
     */
    feng3d.ObjLoader = {
        /**
         * 加载Obj模型
         */
        load: load,
        parse: parse,
    };
    /**
     * 加载资源
     * @param url   路径
     */
    function load(url, completed) {
        feng3d.Loader.loadText(url, function (content) {
            var material = new feng3d.StandardMaterial();
            var objData = feng3d.OBJParser.parser(content);
            var mtl = objData.mtl;
            if (mtl) {
                var mtlRoot = url.substring(0, url.lastIndexOf("/") + 1);
                feng3d.Loader.loadText(mtlRoot + mtl, function (content) {
                    var mtlData = feng3d.MtlParser.parser(content);
                    createObj(objData, material, mtlData, completed);
                });
            }
            else {
                createObj(objData, material, null, completed);
            }
        });
    }
    function parse(content, completed) {
        var material = new feng3d.StandardMaterial();
        var objData = feng3d.OBJParser.parser(content);
        createObj(objData, material, null, completed);
    }
    function createObj(objData, material, mtlData, completed) {
        var object = feng3d.GameObject.create();
        var objs = objData.objs;
        for (var i = 0; i < objs.length; i++) {
            var obj = objs[i];
            var gameObject = createSubObj(objData, obj, material, mtlData);
            object.addChild(gameObject);
        }
        completed && completed(object);
    }
    function createSubObj(objData, obj, material, mtlData) {
        var gameObject = feng3d.GameObject.create(obj.name);
        var subObjs = obj.subObjs;
        for (var i = 0; i < subObjs.length; i++) {
            var materialObj = createMaterialObj(objData, subObjs[i], material, mtlData);
            gameObject.addChild(materialObj);
        }
        return gameObject;
    }
    var _realIndices;
    var _vertexIndex;
    function createMaterialObj(obj, subObj, material, mtlData) {
        var gameObject = feng3d.GameObject.create();
        var model = gameObject.addComponent(feng3d.MeshRenderer);
        model.material = material || new feng3d.StandardMaterial();
        model.material.cullFace = feng3d.CullFace.FRONT;
        var geometry = model.geometry = new feng3d.CustomGeometry();
        var vertices = [];
        var normals = [];
        var uvs = [];
        _realIndices = [];
        _vertexIndex = 0;
        var faces = subObj.faces;
        var indices = [];
        for (var i = 0; i < faces.length; i++) {
            var face = faces[i];
            var numVerts = face.indexIds.length - 1;
            for (var j = 1; j < numVerts; ++j) {
                translateVertexData(face, j, vertices, uvs, indices, normals, obj);
                translateVertexData(face, 0, vertices, uvs, indices, normals, obj);
                translateVertexData(face, j + 1, vertices, uvs, indices, normals, obj);
            }
        }
        geometry.indices = indices;
        geometry.setVAData("a_position", vertices, 3);
        if (normals.length > 0)
            geometry.setVAData("a_normal", normals, 3);
        if (uvs.length > 0)
            geometry.setVAData("a_uv", uvs, 2);
        if (mtlData && subObj.material && mtlData[subObj.material]) {
            var materialInfo = mtlData[subObj.material];
            var kd = materialInfo.kd;
            var standardMaterial = new feng3d.StandardMaterial();
            var materialInfo = mtlData[subObj.material];
            var kd = materialInfo.kd;
            standardMaterial.diffuseMethod.color = new feng3d.Color(kd[0], kd[1], kd[2]);
            model.material = standardMaterial;
        }
        return gameObject;
        function translateVertexData(face, vertexIndex, vertices, uvs, indices, normals, obj) {
            var index;
            var vertex;
            var vertexNormal;
            var uv;
            if (!_realIndices[face.indexIds[vertexIndex]]) {
                index = _vertexIndex;
                _realIndices[face.indexIds[vertexIndex]] = ++_vertexIndex;
                vertex = obj.vertex[face.vertexIndices[vertexIndex] - 1];
                vertices.push(vertex.x, vertex.y, vertex.z);
                if (face.normalIndices && face.normalIndices.length > 0) {
                    vertexNormal = obj.vn[face.normalIndices[vertexIndex] - 1];
                    normals.push(vertexNormal.x, vertexNormal.y, vertexNormal.z);
                }
                if (face.uvIndices && face.uvIndices.length > 0) {
                    try {
                        uv = obj.vt[face.uvIndices[vertexIndex] - 1];
                        uvs.push(uv.u, uv.v);
                    }
                    catch (e) {
                        switch (vertexIndex) {
                            case 0:
                                uvs.push(0, 1);
                                break;
                            case 1:
                                uvs.push(.5, 0);
                                break;
                            case 2:
                                uvs.push(1, 1);
                        }
                    }
                }
            }
            else
                index = _realIndices[face.indexIds[vertexIndex]] - 1;
            indices.push(index);
        }
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * MD5模型加载类
     * @author feng 2017-01-18
     */
    feng3d.MD5Loader = {
        load: load,
        loadAnim: loadAnim,
        parseMD5Mesh: parseMD5Mesh,
        parseMD5Anim: parseMD5Anim,
    };
    /**
     * 加载资源
     * @param url   路径
     */
    function load(url, completed) {
        feng3d.Loader.loadText(url, function (content) {
            var objData = feng3d.MD5MeshParser.parse(content);
            createMD5Mesh(objData, completed);
        });
    }
    function parseMD5Mesh(content, completed) {
        var objData = feng3d.MD5MeshParser.parse(content);
        createMD5Mesh(objData, completed);
    }
    function loadAnim(url, completed) {
        feng3d.Loader.loadText(url, function (content) {
            var objData = feng3d.MD5AnimParser.parse(content);
            createAnimator(objData, completed);
        });
    }
    function parseMD5Anim(content, completed) {
        var objData = feng3d.MD5AnimParser.parse(content);
        createAnimator(objData, completed);
    }
    function createMD5Mesh(md5MeshData, completed) {
        var gameObject = feng3d.GameObject.create();
        gameObject.transform.rx = -90;
        //顶点最大关节关联数
        var _maxJointCount = calculateMaxJointCount(md5MeshData);
        feng3d.debuger && feng3d.assert(_maxJointCount <= 8, "顶点最大关节关联数最多支持8个");
        var skeletonjoints = createSkeleton(md5MeshData.joints);
        var skeletonComponent = gameObject.addComponent(feng3d.SkeletonComponent);
        skeletonComponent.joints = skeletonjoints;
        for (var i = 0; i < md5MeshData.meshs.length; i++) {
            var skinSkeleton = new feng3d.SkinSkeletonTemp();
            var geometry = createGeometry(md5MeshData.meshs[i], skeletonComponent, skinSkeleton);
            var skeletonGameObject = feng3d.GameObject.create();
            var skinnedMeshRenderer = skeletonGameObject.addComponent(feng3d.SkinnedMeshRenderer);
            skinnedMeshRenderer.geometry = geometry;
            skinnedMeshRenderer.material = new feng3d.StandardMaterial();
            skinnedMeshRenderer.skinSkeleton = skinSkeleton;
            gameObject.addChild(skeletonGameObject);
        }
        completed && completed(gameObject);
    }
    /**
     * 计算最大关节数量
     */
    function calculateMaxJointCount(md5MeshData) {
        var _maxJointCount = 0;
        //遍历所有的网格数据
        var numMeshData = md5MeshData.meshs.length;
        for (var i = 0; i < numMeshData; ++i) {
            var meshData = md5MeshData.meshs[i];
            var vertexData = meshData.verts;
            var numVerts = vertexData.length;
            //遍历每个顶点 寻找关节关联最大数量
            for (var j = 0; j < numVerts; ++j) {
                var zeroWeights = countZeroWeightJoints(vertexData[j], meshData.weights);
                var totalJoints = vertexData[j].countWeight - zeroWeights;
                if (totalJoints > _maxJointCount)
                    _maxJointCount = totalJoints;
            }
        }
        return _maxJointCount;
    }
    /**
     * 计算0权重关节数量
     * @param vertex 顶点数据
     * @param weights 关节权重数组
     * @return
     */
    function countZeroWeightJoints(vertex, weights) {
        var start = vertex.startWeight;
        var end = vertex.startWeight + vertex.countWeight;
        var count = 0;
        var weight;
        for (var i = start; i < end; ++i) {
            weight = weights[i].bias;
            if (weight == 0)
                ++count;
        }
        return count;
    }
    function createSkeleton(joints) {
        var skeletonjoints = [];
        for (var i = 0; i < joints.length; i++) {
            var skeletonJoint = createSkeletonJoint(joints[i]);
            skeletonjoints.push(skeletonJoint);
        }
        return skeletonjoints;
    }
    function createSkeletonJoint(joint) {
        var skeletonJoint = new feng3d.SkeletonJoint();
        skeletonJoint.name = joint.name;
        skeletonJoint.parentIndex = joint.parentIndex;
        var position = joint.position;
        var rotation = joint.rotation;
        var quat = new feng3d.Quaternion(rotation[0], -rotation[1], -rotation[2]);
        // quat supposed to be unit length
        var t = 1 - quat.x * quat.x - quat.y * quat.y - quat.z * quat.z;
        quat.w = t < 0 ? 0 : -Math.sqrt(t);
        //
        var matrix3D = quat.toMatrix3D();
        matrix3D.appendTranslation(-position[0], position[1], position[2]);
        //
        skeletonJoint.matrix3D = matrix3D;
        return skeletonJoint;
    }
    function createGeometry(md5Mesh, skeleton, skinSkeleton) {
        var vertexData = md5Mesh.verts;
        var weights = md5Mesh.weights;
        var indices = md5Mesh.tris;
        var geometry = new feng3d.CustomGeometry();
        var len = vertexData.length;
        var vertex;
        var weight;
        var bindPose;
        var pos;
        //uv数据
        var uvs = [];
        uvs.length = len * 2;
        //顶点位置数据
        var vertices = [];
        vertices.length = len * 3;
        //关节索引数据
        var jointIndices0 = [];
        jointIndices0.length = len * 4;
        var jointIndices1 = [];
        jointIndices1.length = len * 4;
        //关节权重数据
        var jointWeights0 = [];
        jointWeights0.length = len * 4;
        var jointWeights1 = [];
        jointWeights1.length = len * 4;
        for (var i = 0; i < len; ++i) {
            vertex = vertexData[i];
            vertices[i * 3] = vertices[i * 3 + 1] = vertices[i * 3 + 2] = 0;
            /**
             * 参考 http://blog.csdn.net/summerhust/article/details/17421213
             * VertexPos = (MJ-0 * weight[index0].pos * weight[index0].bias) + ... + (MJ-N * weight[indexN].pos * weight[indexN].bias)
             * 变量对应  MJ-N -> bindPose; 第J个关节的变换矩阵
             * weight[indexN].pos -> weight.pos;
             * weight[indexN].bias -> weight.bias;
             */
            var weightJoints = [];
            var weightBiass = [];
            for (var j = 0; j < 8; ++j) {
                weightJoints[j] = 0;
                weightBiass[j] = 0;
                if (j < vertex.countWeight) {
                    weight = weights[vertex.startWeight + j];
                    if (weight.bias > 0) {
                        bindPose = skeleton.joints[weight.joint].matrix3D;
                        pos = bindPose.transformVector(new feng3d.Vector3D(-weight.pos[0], weight.pos[1], weight.pos[2]));
                        vertices[i * 3] += pos.x * weight.bias;
                        vertices[i * 3 + 1] += pos.y * weight.bias;
                        vertices[i * 3 + 2] += pos.z * weight.bias;
                        weightJoints[j] = weight.joint;
                        weightBiass[j] = weight.bias;
                    }
                }
            }
            jointIndices0[i * 4] = weightJoints[0];
            jointIndices0[i * 4 + 1] = weightJoints[1];
            jointIndices0[i * 4 + 2] = weightJoints[2];
            jointIndices0[i * 4 + 3] = weightJoints[3];
            jointIndices1[i * 4] = weightJoints[4];
            jointIndices1[i * 4 + 1] = weightJoints[5];
            jointIndices1[i * 4 + 2] = weightJoints[6];
            jointIndices1[i * 4 + 3] = weightJoints[7];
            //
            jointWeights0[i * 4] = weightBiass[0];
            jointWeights0[i * 4 + 1] = weightBiass[1];
            jointWeights0[i * 4 + 2] = weightBiass[2];
            jointWeights0[i * 4 + 3] = weightBiass[3];
            jointWeights1[i * 4] = weightBiass[4];
            jointWeights1[i * 4 + 1] = weightBiass[5];
            jointWeights1[i * 4 + 2] = weightBiass[6];
            jointWeights1[i * 4 + 3] = weightBiass[7];
            uvs[vertex.index * 2] = vertex.u;
            uvs[vertex.index * 2 + 1] = vertex.v;
        }
        skinSkeleton.resetJointIndices(jointIndices0, skeleton);
        skinSkeleton.resetJointIndices(jointIndices1, skeleton);
        //更新索引数据
        geometry.indices = indices;
        //更新顶点坐标与uv数据
        geometry.setVAData("a_position", vertices, 3);
        geometry.setVAData("a_uv", uvs, 2);
        //更新关节索引与权重索引
        geometry.setVAData("a_jointindex0", jointIndices0, 4);
        geometry.setVAData("a_jointweight0", jointWeights0, 4);
        geometry.setVAData("a_jointindex1", jointIndices1, 4);
        geometry.setVAData("a_jointweight1", jointWeights1, 4);
        return geometry;
    }
    function createAnimator(md5AnimData, completed) {
        var animationClip = new feng3d.AnimationClip();
        animationClip.length = md5AnimData.numFrames / md5AnimData.frameRate * 1000;
        animationClip.propertyClips = [];
        var __chache__ = {};
        for (var i = 0; i < md5AnimData.numFrames; ++i) {
            translatePose(md5AnimData, md5AnimData.frame[i], animationClip);
        }
        completed && completed(animationClip);
        /**
         * 将一个关键帧数据转换为SkeletonPose
         * @param frameData 帧数据
         * @return 包含帧数据的SkeletonPose对象
         */
        function translatePose(md5AnimData, frameData, animationclip) {
            var hierarchy;
            var base;
            var flags;
            var j;
            //偏移量
            var translation = new feng3d.Vector3D();
            //旋转四元素
            var components = frameData.components;
            for (var i = 0; i < md5AnimData.numJoints; ++i) {
                //通过原始帧数据与层级数据计算出当前骨骼pose数据
                j = 0;
                //层级数据
                hierarchy = md5AnimData.hierarchy[i];
                //基础帧数据
                base = md5AnimData.baseframe[i];
                //层级标记
                flags = hierarchy.flags;
                translation.x = base.position[0];
                translation.y = base.position[1];
                translation.z = base.position[2];
                var orientation = new feng3d.Quaternion();
                orientation.x = base.orientation[0];
                orientation.y = base.orientation[1];
                orientation.z = base.orientation[2];
                //调整位移与角度数据
                if (flags & 1)
                    translation.x = components[hierarchy.startIndex + (j++)];
                if (flags & 2)
                    translation.y = components[hierarchy.startIndex + (j++)];
                if (flags & 4)
                    translation.z = components[hierarchy.startIndex + (j++)];
                if (flags & 8)
                    orientation.x = components[hierarchy.startIndex + (j++)];
                if (flags & 16)
                    orientation.y = components[hierarchy.startIndex + (j++)];
                if (flags & 32)
                    orientation.z = components[hierarchy.startIndex + (j++)];
                //计算四元素w值
                var w = 1 - orientation.x * orientation.x - orientation.y * orientation.y - orientation.z * orientation.z;
                orientation.w = w < 0 ? 0 : -Math.sqrt(w);
                orientation.y = -orientation.y;
                orientation.z = -orientation.z;
                translation.x = -translation.x;
                var eulers = orientation.toEulerAngles();
                eulers.scaleBy(180 / Math.PI);
                var path = [
                    [feng3d.PropertyClipPathItemType.GameObject, hierarchy.name],
                    [feng3d.PropertyClipPathItemType.Component, "feng3d.Transform"],
                ];
                var time = (frameData.index / md5AnimData.frameRate) * 1000;
                setPropertyClipFrame(path, "position", time, translation.toArray(), "Vector3D");
                setPropertyClipFrame(path, "orientation", time, orientation.toArray(), "Quaternion");
            }
            function setPropertyClipFrame(path, propertyName, time, propertyValue, type) {
                var propertyClip = getPropertyClip(path, propertyName);
                propertyClip.type = type;
                propertyClip.propertyValues.push([time, propertyValue]);
            }
            function getPropertyClip(path, propertyName) {
                var key = path.join("-") + propertyName;
                if (__chache__[key])
                    return __chache__[key];
                if (!__chache__[key]) {
                    var propertyClip = __chache__[key] = new feng3d.PropertyClip();
                    propertyClip.path = path;
                    propertyClip.propertyName = propertyName;
                    propertyClip.propertyValues = [];
                    animationclip.propertyClips.push(propertyClip);
                }
                return __chache__[key];
            }
        }
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    feng3d.mdlLoader = {
        load: load,
    };
    function load(mdlurl, callback) {
        feng3d.Loader.loadText(mdlurl, function (content) {
            feng3d.war3.MdlParser.parse(content, function (war3Model) {
                war3Model.root = mdlurl.substring(0, mdlurl.lastIndexOf("/") + 1);
                var showMesh = war3Model.getMesh();
                callback(showMesh);
            });
        });
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 坐标系，三叉戟
     * @author feng 2017-02-06
     */
    var Trident = /** @class */ (function (_super) {
        __extends(Trident, _super);
        function Trident() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.lineLength = 1;
            _this.arrowradius = 0.05;
            _this.arrowHeight = 0.18;
            return _this;
        }
        Trident.prototype.init = function (gameObject) {
            _super.prototype.init.call(this, gameObject);
            var tridentObject = this.tridentObject = feng3d.GameObject.create("trident");
            tridentObject.mouseEnabled = false;
            tridentObject.transform.showInInspector = false;
            gameObject.addChild(tridentObject);
            this.buildTrident();
        };
        Trident.prototype.buildTrident = function () {
            var xLine = feng3d.GameObject.create("xLine");
            xLine.serializable = false;
            xLine.showinHierarchy = false;
            var segmentGeometry = new feng3d.SegmentGeometry();
            segmentGeometry.addSegment(new feng3d.Segment(new feng3d.Vector3D(), new feng3d.Vector3D(this.lineLength, 0, 0), new feng3d.Color(1, 0, 0), new feng3d.Color(1, 0, 0)));
            var meshRenderer = xLine.addComponent(feng3d.MeshRenderer);
            meshRenderer.geometry = segmentGeometry;
            meshRenderer.material = new feng3d.SegmentMaterial();
            this.tridentObject.addChild(xLine);
            //
            var yLine = feng3d.GameObject.create("yLine");
            yLine.serializable = false;
            yLine.showinHierarchy = false;
            var segmentGeometry = new feng3d.SegmentGeometry();
            segmentGeometry.addSegment(new feng3d.Segment(new feng3d.Vector3D(), new feng3d.Vector3D(0, this.lineLength, 0), new feng3d.Color(0, 1, 0), new feng3d.Color(0, 1, 0)));
            meshRenderer = yLine.addComponent(feng3d.MeshRenderer);
            meshRenderer.material = new feng3d.SegmentMaterial();
            meshRenderer.geometry = segmentGeometry;
            this.tridentObject.addChild(yLine);
            //
            var zLine = feng3d.GameObject.create("zLine");
            zLine.serializable = false;
            zLine.showinHierarchy = false;
            var segmentGeometry = new feng3d.SegmentGeometry();
            segmentGeometry.addSegment(new feng3d.Segment(new feng3d.Vector3D(), new feng3d.Vector3D(0, 0, this.lineLength), new feng3d.Color(0, 0, 1), new feng3d.Color(0, 0, 1)));
            meshRenderer = zLine.addComponent(feng3d.MeshRenderer);
            meshRenderer.material = new feng3d.SegmentMaterial();
            meshRenderer.geometry = segmentGeometry;
            this.tridentObject.addChild(zLine);
            //
            var xArrow = feng3d.GameObject.create("xArrow");
            xArrow.serializable = false;
            xArrow.showinHierarchy = false;
            xArrow.transform.x = this.lineLength;
            xArrow.transform.rz = -90;
            var meshRenderer = xArrow.addComponent(feng3d.MeshRenderer);
            var material = meshRenderer.material = new feng3d.ColorMaterial();
            meshRenderer.geometry = new feng3d.ConeGeometry(this.arrowradius, this.arrowHeight);
            ;
            material.color = new feng3d.Color(1, 0, 0);
            this.tridentObject.addChild(xArrow);
            //
            var yArrow = feng3d.GameObject.create("yArrow");
            yArrow.serializable = false;
            yArrow.showinHierarchy = false;
            yArrow.transform.y = this.lineLength;
            meshRenderer = yArrow.addComponent(feng3d.MeshRenderer);
            var material = meshRenderer.material = new feng3d.ColorMaterial();
            meshRenderer.geometry = new feng3d.ConeGeometry(this.arrowradius, this.arrowHeight);
            material.color = new feng3d.Color(0, 1, 0);
            this.tridentObject.addChild(yArrow);
            //
            var zArrow = feng3d.GameObject.create("zArrow");
            zArrow.serializable = false;
            zArrow.showinHierarchy = false;
            zArrow.transform.z = this.lineLength;
            zArrow.transform.rx = 90;
            meshRenderer = zArrow.addComponent(feng3d.MeshRenderer);
            meshRenderer.geometry = new feng3d.ConeGeometry(this.arrowradius, this.arrowHeight);
            var material = meshRenderer.material = new feng3d.ColorMaterial();
            material.color = new feng3d.Color(0, 0, 1);
            this.tridentObject.addChild(zArrow);
        };
        __decorate([
            feng3d.oav()
        ], Trident.prototype, "lineLength", void 0);
        __decorate([
            feng3d.oav()
        ], Trident.prototype, "arrowradius", void 0);
        __decorate([
            feng3d.oav()
        ], Trident.prototype, "arrowHeight", void 0);
        return Trident;
    }(feng3d.Component));
    feng3d.Trident = Trident;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    feng3d.GameObjectFactory = {
        create: create,
        createGameObject: createGameObject,
        createCube: createCube,
        createPlane: createPlane,
        createCylinder: createCylinder,
        createSphere: createSphere,
        createCapsule: createCapsule,
        createCone: createCone,
        createTorus: createTorus,
        createParticle: createParticle,
        createCamera: createCamera,
        createPointLight: createPointLight,
    };
    function create(name) {
        if (name === void 0) { name = "GameObject"; }
        var gameobject = feng3d.GameObject.create(name);
        gameobject.mouseEnabled = true;
        if (name == "GameObject")
            return gameobject;
        var meshRenderer = gameobject.addComponent(feng3d.MeshRenderer);
        meshRenderer.material = new feng3d.StandardMaterial();
        switch (name) {
            case "Plane":
                meshRenderer.geometry = new feng3d.PlaneGeometry();
                break;
            case "Cube":
                meshRenderer.geometry = new feng3d.CubeGeometry();
                break;
            case "Sphere":
                meshRenderer.geometry = new feng3d.SphereGeometry();
                break;
            case "Capsule":
                meshRenderer.geometry = new feng3d.CapsuleGeometry();
                break;
            case "Cylinder":
                meshRenderer.geometry = new feng3d.CylinderGeometry();
                break;
            case "Cone":
                meshRenderer.geometry = new feng3d.ConeGeometry();
                break;
            case "Torus":
                meshRenderer.geometry = new feng3d.TorusGeometry();
                break;
            case "Particle":
                meshRenderer.geometry = new feng3d.TorusGeometry();
                break;
        }
        return gameobject;
    }
    function createGameObject(name) {
        if (name === void 0) { name = "GameObject"; }
        var gameobject = feng3d.GameObject.create(name);
        return gameobject;
    }
    function createCube(name) {
        if (name === void 0) { name = "cube"; }
        var gameobject = feng3d.GameObject.create(name);
        var model = gameobject.addComponent(feng3d.MeshRenderer);
        model.geometry = new feng3d.CubeGeometry();
        model.material = new feng3d.StandardMaterial();
        return gameobject;
    }
    function createPlane(name) {
        if (name === void 0) { name = "plane"; }
        var gameobject = feng3d.GameObject.create(name);
        var model = gameobject.addComponent(feng3d.MeshRenderer);
        model.geometry = new feng3d.PlaneGeometry();
        model.material = new feng3d.StandardMaterial();
        return gameobject;
    }
    function createCylinder(name) {
        if (name === void 0) { name = "cylinder"; }
        var gameobject = feng3d.GameObject.create(name);
        var model = gameobject.addComponent(feng3d.MeshRenderer);
        model.geometry = new feng3d.CylinderGeometry();
        model.material = new feng3d.StandardMaterial();
        return gameobject;
    }
    function createCone(name) {
        if (name === void 0) { name = "Cone"; }
        var gameobject = feng3d.GameObject.create(name);
        var model = gameobject.addComponent(feng3d.MeshRenderer);
        model.geometry = new feng3d.ConeGeometry();
        model.material = new feng3d.StandardMaterial();
        return gameobject;
    }
    function createTorus(name) {
        if (name === void 0) { name = "Torus"; }
        var gameobject = feng3d.GameObject.create(name);
        var model = gameobject.addComponent(feng3d.MeshRenderer);
        model.geometry = new feng3d.TorusGeometry();
        model.material = new feng3d.StandardMaterial();
        return gameobject;
    }
    function createSphere(name) {
        if (name === void 0) { name = "sphere"; }
        var gameobject = feng3d.GameObject.create(name);
        var model = gameobject.addComponent(feng3d.MeshRenderer);
        model.geometry = new feng3d.SphereGeometry();
        model.material = new feng3d.StandardMaterial();
        return gameobject;
    }
    function createCapsule(name) {
        if (name === void 0) { name = "capsule"; }
        var gameobject = feng3d.GameObject.create(name);
        var model = gameobject.addComponent(feng3d.MeshRenderer);
        model.geometry = new feng3d.CapsuleGeometry();
        model.material = new feng3d.StandardMaterial();
        return gameobject;
    }
    function createCamera(name) {
        if (name === void 0) { name = "Camera"; }
        var gameobject = feng3d.GameObject.create(name);
        gameobject.addComponent(feng3d.Camera);
        return gameobject;
    }
    function createPointLight(name) {
        if (name === void 0) { name = "PointLight"; }
        var gameobject = feng3d.GameObject.create(name);
        gameobject.addComponent(feng3d.PointLight);
        return gameobject;
    }
    function createParticle(name) {
        if (name === void 0) { name = "Particle"; }
        var _particleMesh = feng3d.GameObject.create("particle");
        var meshRenderer = _particleMesh.addComponent(feng3d.MeshRenderer);
        meshRenderer.geometry = new feng3d.PointGeometry();
        var material = meshRenderer.material = new feng3d.StandardMaterial();
        material.renderMode = feng3d.RenderMode.POINTS;
        var particleAnimator = _particleMesh.addComponent(feng3d.ParticleAnimator);
        particleAnimator.numParticles = 1000;
        //通过函数来创建粒子初始状态
        particleAnimator.generateFunctions.push({
            generate: function (particle) {
                particle.birthTime = Math.random() * 5 - 5;
                particle.lifetime = 5;
                var degree2 = Math.random() * Math.PI * 2;
                var r = Math.random() * 1;
                particle.velocity = new feng3d.Vector3D(r * Math.cos(degree2), r * 2, r * Math.sin(degree2));
            }, priority: 0
        });
        particleAnimator.cycle = 10;
        return _particleMesh;
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    feng3d.GameObjectUtil = {
        addScript: addScript,
        removeScript: removeScript,
        reloadJS: reloadJS,
        loadJs: loadJs,
    };
    var resultScriptCache = {};
    function addScript(gameObject, scriptPath, callback) {
        loadJs(scriptPath, function (resultScript) {
            removeScript(gameObject, scriptPath);
            var windowEval = eval.bind(window);
            var componentClass = windowEval(resultScript.className);
            var scriptcomponent = gameObject.addComponent(componentClass);
            scriptcomponent["_url"] = scriptPath;
            scriptcomponent.enabled = true;
            callback && callback(scriptcomponent);
        });
    }
    function removeScript(gameObject, script) {
        if (script instanceof feng3d.Script) {
            script.enabled = false;
            gameObject.removeComponent(script);
        }
        else {
            var scripts = gameObject.getComponents(feng3d.Script);
            while (scripts.length > 0) {
                var scriptComponent = scripts[scripts.length - 1];
                scripts.pop();
                if (scriptComponent.url == script) {
                    removeScript(gameObject, scriptComponent);
                }
            }
        }
    }
    function reloadJS(scriptPath) {
        delete resultScriptCache[scriptPath];
        loadJs(scriptPath);
    }
    function loadJs(scriptPath, onload) {
        if (resultScriptCache[scriptPath]) {
            onload && onload(resultScriptCache[scriptPath]);
            return;
        }
        var resultScript = {};
        var loadPath = scriptPath + ("?version=" + Math.random());
        feng3d.Loader.loadText(loadPath, function (content) {
            var reg = /(feng3d.(\w+)) = (\w+);/;
            var result = content.match(reg);
            if (result)
                resultScript.className = result[1];
            //
            var scriptTag = document.getElementById(scriptPath);
            var head = document.getElementsByTagName('head').item(0);
            if (scriptTag)
                head.removeChild(scriptTag);
            var script = document.createElement('script');
            script.onload = function (e) {
                resultScript.script = script;
                resultScriptCache[scriptPath] = resultScript;
                onload && onload(resultScript);
            };
            script.src = loadPath;
            script.type = 'text/javascript';
            script.id = scriptPath;
            head.appendChild(script);
        });
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 鼠标事件管理
     * @author feng 2014-4-29
     */
    var Mouse3DManager = /** @class */ (function () {
        function Mouse3DManager(canvas) {
            //
            feng3d.windowEventProxy.on("click", onMouseEvent, null);
            feng3d.windowEventProxy.on("dblclick", onMouseEvent, null);
            feng3d.windowEventProxy.on("mousedown", onMouseEvent, null);
            feng3d.windowEventProxy.on("mouseup", onMouseEvent, null);
            var mouseX = 0;
            var mouseY = 0;
            var selectedGameObject;
            var mouseEventTypes = [];
            /**
             * 鼠标按下时的对象，用于与鼠标弹起时对象做对比，如果相同触发click
             */
            var preMouseDownGameObject;
            /**
             * 统计处理click次数，判断是否达到dblclick
             */
            var gameObjectClickNum;
            var _catchMouseMove = false;
            this.draw = draw;
            this.catchMouseMove = catchMouseMove;
            this.getSelectedGameObject = getSelectedGameObject;
            /**
             * 是否捕捉鼠标移动，默认false。
             */
            function catchMouseMove(value) {
                if (_catchMouseMove == value)
                    return;
                if (_catchMouseMove) {
                    feng3d.windowEventProxy.off("mousemove", onMouseEvent, null);
                }
                _catchMouseMove = value;
                if (_catchMouseMove) {
                    feng3d.windowEventProxy.on("mousemove", onMouseEvent, null);
                }
            }
            /**
             * 监听鼠标事件收集事件类型
             */
            function onMouseEvent(event) {
                var canvasRect = canvas.getBoundingClientRect();
                var bound = new feng3d.Rectangle(canvasRect.left, canvasRect.top, canvasRect.width, canvasRect.height);
                if (!bound.contains(feng3d.windowEventProxy.clientX, feng3d.windowEventProxy.clientY))
                    return;
                var type = event.type;
                // 处理鼠标中键与右键
                if (event instanceof MouseEvent) {
                    if (["click", "mousedown", "mouseup"].indexOf(event.type) != -1) {
                        type = ["", "middle", "right"][event.button] + event.type;
                    }
                }
                if (mouseEventTypes.indexOf(type) == -1)
                    mouseEventTypes.push(type);
                mouseX = event.clientX;
                mouseY = event.clientY;
            }
            /**
             * 渲染
             */
            function draw(scene3d, camera, viewRect) {
                if (!viewRect.contains(mouseX, mouseY))
                    return;
                if (mouseEventTypes.length == 0)
                    return;
                var mouseCollisionEntitys = scene3d.mouseCheckObjects;
                if (mouseCollisionEntitys.length == 0)
                    return;
                pick(scene3d, camera);
            }
            function pick(scene3d, camera) {
                var mouseRay3D = camera.getMouseRay3D();
                //计算得到鼠标射线相交的物体
                var mouseCollisionEntitys = scene3d.mouseCheckObjects;
                var pickingCollisionVO = null;
                for (var i = 0; i < mouseCollisionEntitys.length; i++) {
                    var entitys = mouseCollisionEntitys[i].objects;
                    pickingCollisionVO = feng3d.raycastPicker.pick(mouseRay3D, entitys);
                    if (pickingCollisionVO)
                        break;
                }
                var gameobject = pickingCollisionVO && pickingCollisionVO.gameObject;
                if (gameobject)
                    setSelectedGameObject(gameobject);
                else
                    setSelectedGameObject(scene3d.gameObject);
            }
            /**
             * 设置选中对象
             */
            function setSelectedGameObject(value) {
                if (selectedGameObject != value) {
                    if (selectedGameObject)
                        selectedGameObject.dispatch("mouseout", null, true);
                    if (value)
                        value.dispatch("mouseover", null, true);
                }
                selectedGameObject = value;
                if (selectedGameObject) {
                    mouseEventTypes.forEach(function (element) {
                        switch (element) {
                            case "mousedown":
                                if (preMouseDownGameObject != selectedGameObject) {
                                    gameObjectClickNum = 0;
                                    preMouseDownGameObject = selectedGameObject;
                                }
                                selectedGameObject.dispatch(element, null, true);
                                break;
                            case "mouseup":
                                if (selectedGameObject == preMouseDownGameObject) {
                                    gameObjectClickNum++;
                                }
                                else {
                                    gameObjectClickNum = 0;
                                    preMouseDownGameObject = null;
                                }
                                selectedGameObject.dispatch(element, null, true);
                                break;
                            case "mousemove":
                                selectedGameObject.dispatch(element, null, true);
                                break;
                            case "click":
                                if (gameObjectClickNum > 0)
                                    selectedGameObject.dispatch(element, null, true);
                                break;
                            case "dblclick":
                                if (gameObjectClickNum > 1)
                                    selectedGameObject.dispatch(element, null, true);
                                break;
                        }
                    });
                }
                else {
                    gameObjectClickNum = 0;
                    preMouseDownGameObject = null;
                }
                mouseEventTypes.length = 0;
            }
            function getSelectedGameObject() {
                return selectedGameObject;
            }
        }
        return Mouse3DManager;
    }());
    feng3d.Mouse3DManager = Mouse3DManager;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    feng3d.shaderFileMap = {
        "shaders/color.fragment.glsl": "\r\n\r\nprecision mediump float;\r\n\r\nuniform vec4 u_diffuseInput;\r\n\r\n\r\n\r\nvoid main(void) {\r\n   \r\n    gl_FragColor = u_diffuseInput;\r\n}\r\n",
        "shaders/color.vertex.glsl": "\r\n\r\nattribute vec3 a_position;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvoid main(void) {\r\n\r\n    vec4 globalPosition = u_modelMatrix * vec4(a_position, 1.0);\r\n    gl_Position = u_viewProjection * globalPosition;\r\n}",
        "shaders/modules/cartoon.fragment.glsl": "#ifdef cartoon_Anti_aliasing\r\n    #extension GL_OES_standard_derivatives : enable\r\n#endif\r\n\r\nuniform vec4 u_diffuseSegment;\r\nuniform vec4 u_diffuseSegmentValue;\r\nuniform float u_specularSegment;\r\n\r\n//漫反射\r\nfloat cartoonLightDiffuse(vec3 normal,vec3 lightDir){\r\n\r\n    float diff = dot(normal, lightDir);\r\n    diff = diff * 0.5 + 0.5;\r\n\r\n    #ifdef cartoon_Anti_aliasing\r\n        float w = fwidth(diff) * 2.0;\r\n        if (diff < u_diffuseSegment.x + w) {\r\n            diff = mix(u_diffuseSegment.x, u_diffuseSegment.y, smoothstep(u_diffuseSegment.x - w, u_diffuseSegment.x + w, diff));\r\n        //  diff = mix(u_diffuseSegment.x, u_diffuseSegment.y, clamp(0.5 * (diff - u_diffuseSegment.x) / w, 0, 1));\r\n        } else if (diff < u_diffuseSegment.y + w) {\r\n            diff = mix(u_diffuseSegment.y, u_diffuseSegment.z, smoothstep(u_diffuseSegment.y - w, u_diffuseSegment.y + w, diff));\r\n        //  diff = mix(u_diffuseSegment.y, u_diffuseSegment.z, clamp(0.5 * (diff - u_diffuseSegment.y) / w, 0, 1));\r\n        } else if (diff < u_diffuseSegment.z + w) {\r\n            diff = mix(u_diffuseSegment.z, u_diffuseSegment.w, smoothstep(u_diffuseSegment.z - w, u_diffuseSegment.z + w, diff));\r\n        //  diff = mix(u_diffuseSegment.z, u_diffuseSegment.w, clamp(0.5 * (diff - u_diffuseSegment.z) / w, 0, 1));\r\n        } else {\r\n            diff = u_diffuseSegment.w;\r\n        }\r\n    #else\r\n        if (diff < u_diffuseSegment.x) {\r\n            diff = u_diffuseSegmentValue.x;\r\n        } else if (diff < u_diffuseSegment.y) {\r\n            diff = u_diffuseSegmentValue.y;\r\n        } else if (diff < u_diffuseSegment.z) {\r\n            diff = u_diffuseSegmentValue.z;\r\n        } else {\r\n            diff = u_diffuseSegmentValue.w;\r\n        }\r\n    #endif\r\n\r\n    return diff;\r\n}\r\n\r\n//镜面反射漫反射\r\nfloat cartoonLightSpecular(vec3 normal,vec3 lightDir,vec3 viewDir,float glossiness){\r\n\r\n    vec3 halfVec = normalize(lightDir + viewDir);\r\n    float specComp = max(dot(normal,halfVec),0.0);\r\n    specComp = pow(specComp, glossiness);\r\n\r\n    #ifdef cartoon_Anti_aliasing\r\n        float w = fwidth(specComp);\r\n        if (specComp < u_specularSegment + w) {\r\n            specComp = mix(0.0, 1.0, smoothstep(u_specularSegment - w, u_specularSegment + w, specComp));\r\n            // specComp = smoothstep(u_specularSegment - w, u_specularSegment + w, specComp);\r\n        } else {\r\n            specComp = 1.0;\r\n        }\r\n    #else\r\n        if(specComp < u_specularSegment)\r\n        {\r\n            specComp = 0.0;\r\n        }else\r\n        {\r\n            specComp = 1.0;\r\n        }\r\n    #endif\r\n\r\n    return specComp;\r\n}",
        "shaders/modules/envmap.fragment.glsl": "uniform samplerCube s_envMap;\r\nuniform float u_reflectivity;\r\n\r\nvec4 envmapMethod(vec4 finalColor)\r\n{\r\n    vec3 cameraToVertex = normalize( v_globalPosition - u_cameraMatrix[3].xyz );\r\n    vec3 reflectVec = reflect( cameraToVertex, v_normal );\r\n    vec4 envColor = textureCube( s_envMap, reflectVec );\r\n    finalColor.xyz *= envColor.xyz * u_reflectivity;\r\n    return finalColor;\r\n}",
        "shaders/modules/fog.fragment.glsl": "#define FOGMODE_NONE    0.\r\n#define FOGMODE_EXP     1.\r\n#define FOGMODE_EXP2    2.\r\n#define FOGMODE_LINEAR  3.\r\n#define E 2.71828\r\n\r\nuniform float u_fogMode;\r\nuniform float u_fogMinDistance;\r\nuniform float u_fogMaxDistance;\r\nuniform float u_fogDensity;\r\nuniform vec3 u_fogColor;\r\n\r\nfloat CalcFogFactor(float fogDistance)\r\n{\r\n\tfloat fogCoeff = 1.0;\r\n\tif (FOGMODE_LINEAR == u_fogMode)\r\n\t{\r\n\t\tfogCoeff = (u_fogMaxDistance - fogDistance) / (u_fogMaxDistance - u_fogMinDistance);\r\n\t}\r\n\telse if (FOGMODE_EXP == u_fogMode)\r\n\t{\r\n\t\tfogCoeff = 1.0 / pow(E, fogDistance * u_fogDensity);\r\n\t}\r\n\telse if (FOGMODE_EXP2 == u_fogMode)\r\n\t{\r\n\t\tfogCoeff = 1.0 / pow(E, fogDistance * fogDistance * u_fogDensity * u_fogDensity);\r\n\t}\r\n\r\n\treturn clamp(fogCoeff, 0.0, 1.0);\r\n}\r\n\r\nvec4 fogMethod(vec4 color)\r\n{\r\n    vec3 fogDistance = u_cameraMatrix[3].xyz - v_globalPosition.xyz;\r\n\tfloat fog = CalcFogFactor(length(fogDistance));\r\n\tcolor.rgb = fog * color.rgb + (1.0 - fog) * u_fogColor;\r\n    return color;\r\n}",
        "shaders/modules/lightShading.fragment.glsl": "#ifdef NUM_POINTLIGHT\r\n    #if NUM_POINTLIGHT > 0\r\n        //点光源位置数组\r\n        uniform vec3 u_pointLightPositions[NUM_POINTLIGHT];\r\n        //点光源颜色数组\r\n        uniform vec3 u_pointLightColors[NUM_POINTLIGHT];\r\n        //点光源光照强度数组\r\n        uniform float u_pointLightIntensitys[NUM_POINTLIGHT];\r\n        //点光源光照范围数组\r\n        uniform float u_pointLightRanges[NUM_POINTLIGHT];\r\n    #endif\r\n#endif\r\n\r\n#ifdef NUM_DIRECTIONALLIGHT\r\n    #if NUM_DIRECTIONALLIGHT > 0\r\n        //方向光源方向数组\r\n        uniform vec3 u_directionalLightDirections[NUM_DIRECTIONALLIGHT];\r\n        //方向光源颜色数组\r\n        uniform vec3 u_directionalLightColors[NUM_DIRECTIONALLIGHT];\r\n        //方向光源光照强度数组\r\n        uniform float u_directionalLightIntensitys[NUM_DIRECTIONALLIGHT];\r\n    #endif\r\n#endif\r\n\r\n//卡通\r\n#ifdef IS_CARTOON\r\n    #include<modules/cartoon.fragment>\r\n#endif\r\n\r\n//计算光照漫反射系数\r\nfloat calculateLightDiffuse(vec3 normal,vec3 lightDir){\r\n    #ifdef IS_CARTOON\r\n        return cartoonLightDiffuse(normal,lightDir);\r\n    #else\r\n        return clamp(dot(normal,lightDir),0.0,1.0);\r\n    #endif\r\n}\r\n\r\n//计算光照镜面反射系数\r\nfloat calculateLightSpecular(vec3 normal,vec3 lightDir,vec3 viewDir,float glossiness){\r\n\r\n    #ifdef IS_CARTOON\r\n        return cartoonLightSpecular(normal,lightDir,viewDir,glossiness);\r\n    #else\r\n        vec3 halfVec = normalize(lightDir + viewDir);\r\n        float specComp = max(dot(normal,halfVec),0.0);\r\n        specComp = pow(specComp, glossiness);\r\n\r\n        return specComp;\r\n    #endif\r\n}\r\n\r\n//根据距离计算衰减\r\nfloat computeDistanceLightFalloff(float lightDistance, float range)\r\n{\r\n    #ifdef USEPHYSICALLIGHTFALLOFF\r\n        float lightDistanceFalloff = 1.0 / ((lightDistance * lightDistance + 0.0001));\r\n    #else\r\n        float lightDistanceFalloff = max(0., 1.0 - lightDistance / range);\r\n    #endif\r\n    \r\n    return lightDistanceFalloff;\r\n}\r\n\r\n//渲染点光源\r\nvec3 lightShading(vec3 normal,vec3 diffuseColor,vec3 specularColor,vec3 ambientColor,float glossiness){\r\n\r\n    //视线方向\r\n    vec3 viewDir = normalize(u_cameraMatrix[3].xyz - v_globalPosition);\r\n\r\n    vec3 totalDiffuseLightColor = vec3(0.0,0.0,0.0);\r\n    vec3 totalSpecularLightColor = vec3(0.0,0.0,0.0);\r\n    #ifdef NUM_POINTLIGHT\r\n        #if NUM_POINTLIGHT > 0\r\n            for(int i = 0;i<NUM_POINTLIGHT;i++){\r\n                //\r\n                vec3 lightOffset = u_pointLightPositions[i] - v_globalPosition;\r\n                float lightDistance = length(lightOffset);\r\n                //光照方向\r\n                vec3 lightDir = normalize(lightOffset);\r\n                //灯光颜色\r\n                vec3 lightColor = u_pointLightColors[i];\r\n                //灯光强度\r\n                float lightIntensity = u_pointLightIntensitys[i];\r\n                //光照范围\r\n                float range = u_pointLightRanges[i];\r\n                float attenuation = computeDistanceLightFalloff(lightDistance,range);\r\n                lightIntensity = lightIntensity * attenuation;\r\n                //\r\n                totalDiffuseLightColor = totalDiffuseLightColor +  calculateLightDiffuse(normal,lightDir) * lightColor * lightIntensity;\r\n                totalSpecularLightColor = totalSpecularLightColor +  calculateLightSpecular(normal,lightDir,viewDir,glossiness) * lightColor * lightIntensity;\r\n            }\r\n        #endif\r\n    #endif\r\n    #ifdef NUM_DIRECTIONALLIGHT\r\n        #if NUM_DIRECTIONALLIGHT > 0\r\n            for(int i = 0;i<NUM_DIRECTIONALLIGHT;i++){\r\n                //光照方向\r\n                vec3 lightDir = normalize(-u_directionalLightDirections[i]);\r\n                //灯光颜色\r\n                vec3 lightColor = u_directionalLightColors[i];\r\n                //灯光强度\r\n                float lightIntensity = u_directionalLightIntensitys[i];\r\n                //\r\n                totalDiffuseLightColor = totalDiffuseLightColor +  calculateLightDiffuse(normal,lightDir) * lightColor * lightIntensity;\r\n                totalSpecularLightColor = totalSpecularLightColor +  calculateLightSpecular(normal,lightDir,viewDir,glossiness) * lightColor * lightIntensity;\r\n            }\r\n        #endif\r\n    #endif\r\n\r\n    vec3 resultColor = vec3(0.0,0.0,0.0);\r\n    resultColor = resultColor + totalDiffuseLightColor * diffuseColor;\r\n    resultColor = resultColor + totalSpecularLightColor * specularColor;\r\n    resultColor = resultColor + ambientColor * diffuseColor;\r\n    return resultColor;\r\n}",
        "shaders/modules/particle.fragment.glsl": "#ifdef D_a_particle_color\r\n    varying vec4 v_particle_color;\r\n#endif\r\n\r\nvec4 particleAnimation(vec4 color) {\r\n\r\n    #ifdef D_a_particle_color\r\n        color = color * v_particle_color;\r\n    #endif\r\n    return color;\r\n}",
        "shaders/modules/particle.vertex.glsl": "//根据是否提供(a_particle_position)数据自动定义 #define D_(a_particle_position)\r\n\r\n#ifdef D_a_particle_birthTime\r\n    attribute float a_particle_birthTime;\r\n#endif\r\n\r\n#ifdef D_a_particle_position\r\n    attribute vec3 a_particle_position;\r\n#endif\r\n\r\n#ifdef D_a_particle_velocity\r\n    attribute vec3 a_particle_velocity;\r\n#endif\r\n\r\n#ifdef D_a_particle_lifetime\r\n    attribute float a_particle_lifetime;\r\n#endif\r\n\r\n#ifdef D_a_particle_color\r\n    attribute vec4 a_particle_color;\r\n    varying vec4 v_particle_color;\r\n#endif\r\n\r\nuniform float u_particleTime;\r\n\r\n#ifdef D_u_particle_acceleration\r\n    uniform vec3 u_particle_acceleration;\r\n#endif\r\n\r\n#ifdef D_u_particle_billboardMatrix\r\n    uniform mat4 u_particle_billboardMatrix;\r\n#endif\r\n\r\nvec4 particleAnimation(vec4 position) {\r\n\r\n    #ifdef D_a_particle_birthTime\r\n    float pTime = u_particleTime - a_particle_birthTime;\r\n    if(pTime > 0.0){\r\n\r\n        #ifdef D_a_particle_lifetime\r\n            pTime = mod(pTime,a_particle_lifetime);\r\n        #endif\r\n\r\n        vec3 pVelocity = vec3(0.0,0.0,0.0);\r\n\r\n        #ifdef D_u_particle_billboardMatrix\r\n            position = u_particle_billboardMatrix * position;\r\n        #endif\r\n\r\n        #ifdef D_a_particle_position\r\n            position.xyz = position.xyz + a_particle_position;\r\n        #endif\r\n\r\n        #ifdef D_a_particle_velocity\r\n            pVelocity = pVelocity + a_particle_velocity;\r\n        #endif\r\n\r\n        #ifdef D_u_particle_acceleration\r\n            pVelocity = pVelocity + u_particle_acceleration * pTime;\r\n        #endif\r\n        \r\n        #ifdef D_a_particle_color\r\n            v_particle_color = a_particle_color;\r\n        #endif\r\n\r\n        position.xyz = position.xyz + pVelocity * pTime;\r\n    }\r\n    #endif\r\n    \r\n    return position;\r\n}",
        "shaders/modules/pointLightShading.declare.glsl.bak": "//参考资料\r\n//http://blog.csdn.net/leonwei/article/details/44539217\r\n//https://github.com/mcleary/pbr/blob/master/shaders/phong_pbr_frag.glsl\r\n\r\n#if NUM_POINTLIGHT > 0\r\n    //点光源位置列表\r\n    uniform vec3 u_pointLightPositions[NUM_POINTLIGHT];\r\n    //点光源漫反射颜色\r\n    uniform vec3 u_pointLightColors[NUM_POINTLIGHT];\r\n    //点光源镜面反射颜色\r\n    uniform float u_pointLightIntensitys[NUM_POINTLIGHT];\r\n    //反射率\r\n    uniform float u_reflectance;\r\n    //粗糙度\r\n    uniform float u_roughness;\r\n    //金属度\r\n    uniform float u_metalic;\r\n\r\n    vec3 fresnelSchlick(float VdotH,vec3 reflectance){\r\n\r\n        return reflectance + (1.0 - reflectance) * pow(clamp(1.0 - VdotH, 0.0, 1.0), 5.0);\r\n        // return reflectance;\r\n    }\r\n\r\n    float normalDistributionGGX(float NdotH,float alphaG){\r\n\r\n        float alphaG2 = alphaG * alphaG;\r\n        float d = NdotH * NdotH * (alphaG2 - 1.0) + 1.0; \r\n        return alphaG2 / (3.1415926 * d * d);\r\n    }\r\n\r\n    float smithVisibility(float dot,float alphaG){\r\n\r\n        float tanSquared = (1.0 - dot * dot) / (dot * dot);\r\n        return 2.0 / (1.0 + sqrt(1.0 + alphaG * alphaG * tanSquared));\r\n    }\r\n\r\n    vec3 calculateLight(vec3 normal,vec3 viewDir,vec3 lightDir,vec3 lightColor,float lightIntensity,vec3 baseColor,vec3 reflectance,float roughness){\r\n\r\n        //BRDF = D(h) * F(1, h) * V(l, v, h) / (4 * dot(n, l) * dot(n, v));\r\n\r\n        vec3 halfVec = normalize(lightDir + viewDir);\r\n        float NdotL = clamp(dot(normal,lightDir),0.0,1.0);\r\n        float NdotH = clamp(dot(normal,halfVec),0.0,1.0);\r\n        float NdotV = max(abs(dot(normal,viewDir)),0.000001);\r\n        float VdotH = clamp(dot(viewDir, halfVec),0.0,1.0);\r\n        \r\n        float alphaG = max(roughness * roughness,0.0005);\r\n\r\n        //F(v,h)\r\n        vec3 F = fresnelSchlick(VdotH, reflectance);\r\n\r\n        //D(h)\r\n        float D = normalDistributionGGX(NdotH,alphaG);\r\n\r\n        //V(l,h)\r\n        float V = smithVisibility(NdotL,alphaG) * smithVisibility(NdotV,alphaG) / (4.0 * NdotL * NdotV);\r\n\r\n        vec3 specular = max(0.0, D * V) * 3.1415926 * F;\r\n        \r\n        return (baseColor + specular) * NdotL * lightColor * lightIntensity;\r\n    }\r\n\r\n    //渲染点光源\r\n    vec3 pointLightShading(vec3 normal,vec3 baseColor){\r\n\r\n        float reflectance = u_reflectance;\r\n        float roughness = u_roughness;\r\n        float metalic = u_metalic;\r\n\r\n        reflectance = mix(0.0,0.5,reflectance);\r\n        vec3 realBaseColor = (1.0 - metalic) * baseColor;\r\n        vec3 realReflectance = mix(vec3(reflectance),baseColor,metalic);\r\n\r\n        vec3 totalLightColor = vec3(0.0,0.0,0.0);\r\n        for(int i = 0;i<NUM_POINTLIGHT;i++){\r\n            //光照方向\r\n            vec3 lightDir = normalize(u_pointLightPositions[i] - v_globalPosition);\r\n            //视线方向\r\n            vec3 viewDir = normalize(u_cameraMatrix[3].xyz - v_globalPosition);\r\n            //灯光颜色\r\n            vec3 lightColor = u_pointLightColors[i];\r\n            //灯光强度\r\n            float lightIntensity = u_pointLightIntensitys[i];\r\n\r\n            totalLightColor = totalLightColor + calculateLight(normal,viewDir,lightDir,lightColor,lightIntensity,realBaseColor,realReflectance,roughness);\r\n        }\r\n        \r\n        return totalLightColor;\r\n    }\r\n#endif",
        "shaders/modules/pointLightShading.main.glsl.bak": "#if NUM_POINTLIGHT > 0\r\n    // finalColor = finalColor * 0.5 +  pointLightShading(v_normal,u_baseColor) * 0.5;\r\n    finalColor.xyz = pointLightShading(v_normal,finalColor.xyz);\r\n#endif",
        "shaders/modules/skeleton.vertex.glsl": "attribute vec4 a_jointindex0;\r\nattribute vec4 a_jointweight0;\r\n\r\n#ifdef HAS_a_jointindex1\r\n    attribute vec4 a_jointindex1;\r\n    attribute vec4 a_jointweight1;\r\n#endif\r\n\r\nuniform mat4 u_skeletonGlobalMatriices[NUM_SKELETONJOINT];\r\n\r\nvec4 skeletonAnimation(vec4 position) {\r\n\r\n    vec4 totalPosition = vec4(0.0,0.0,0.0,1.0);\r\n    for(int i = 0; i < 4; i++){\r\n        totalPosition += u_skeletonGlobalMatriices[int(a_jointindex0[i])] * position * a_jointweight0[i];\r\n    }\r\n    #ifdef HAS_a_jointindex1\r\n        for(int i = 0; i < 4; i++){\r\n            totalPosition += u_skeletonGlobalMatriices[int(a_jointindex1[i])] * position * a_jointweight1[i];\r\n        }\r\n    #endif\r\n    position.xyz = totalPosition.xyz;\r\n    return position;\r\n}",
        "shaders/modules/terrain.fragment.glsl": "#ifdef USE_TERRAIN_MERGE\r\n    #include<modules/terrainMerge.fragment>\r\n#else\r\n    #include<modules/terrainDefault.fragment>\r\n#endif",
        "shaders/modules/terrainDefault.fragment.glsl": "uniform sampler2D s_splatTexture1;\r\nuniform sampler2D s_splatTexture2;\r\nuniform sampler2D s_splatTexture3;\r\n\r\nuniform sampler2D s_blendTexture;\r\nuniform vec4 u_splatRepeats;\r\n\r\nvec4 terrainMethod(vec4 diffuseColor,vec2 v_uv) {\r\n\r\n    vec4 blend = texture2D(s_blendTexture,v_uv);\r\n\r\n    vec2 t_uv = v_uv.xy * u_splatRepeats.y;\r\n    vec4 tColor = texture2D(s_splatTexture1,t_uv);\r\n    diffuseColor = (tColor - diffuseColor) * blend.x + diffuseColor;\r\n\r\n    t_uv = v_uv.xy * u_splatRepeats.z;\r\n    tColor = texture2D(s_splatTexture2,t_uv);\r\n    diffuseColor = (tColor - diffuseColor) * blend.y + diffuseColor;\r\n\r\n    t_uv = v_uv.xy * u_splatRepeats.w;\r\n    tColor = texture2D(s_splatTexture3,t_uv);\r\n    diffuseColor = (tColor - diffuseColor) * blend.z + diffuseColor;\r\n    return diffuseColor;\r\n}",
        "shaders/modules/terrainMerge.fragment.1.glsl": "//代码实现lod，使用默认线性插值\r\n#extension GL_EXT_shader_texture_lod : enable\r\n#extension GL_OES_standard_derivatives : enable\r\n\r\n#define LOD_LINEAR\r\n\r\nuniform sampler2D s_splatMergeTexture;\r\nuniform sampler2D s_blendTexture;\r\nuniform vec4 u_splatRepeats;\r\n\r\nvec2 imageSize =    vec2(2048.0,1024.0);\r\nvec4 offset[3];\r\nvec2 tileSize = vec2(512.0,512.0);\r\n// float maxLod = 7.0;\r\nfloat maxLod = 5.0;\r\n\r\nvec4 terrainTexture2DLod(sampler2D s_splatMergeTexture,vec2 uv,float lod,vec4 offset){\r\n\r\n    //计算不同lod像素缩放以及起始坐标\r\n    vec4 lodvec = vec4(0.5,1.0,0.0,0.0);\r\n    lodvec.x = lodvec.x * pow(0.5,lod);\r\n    lodvec.y = lodvec.x * 2.0;\r\n    lodvec.z = 1.0 - lodvec.y;\r\n\r\n    //lod块尺寸\r\n    vec2 lodSize = imageSize * lodvec.xy;\r\n    vec2 lodPixelOffset = 1.0 / lodSize;\r\n\r\n    //扩展边缘一像素\r\n    offset.xy = offset.xy - lodPixelOffset * 2.0;\r\n    offset.zw = offset.zw + lodPixelOffset;\r\n    //lod块中uv\r\n    vec2 t_uv = uv * offset.xy + offset.zw;\r\n    t_uv = t_uv * lodvec.xy;\r\n    //取整像素\r\n    t_uv = (t_uv * imageSize + vec2(-0.0,0.0)) / imageSize;\r\n    // t_uv = (t_uv * imageSize + 0.5) / imageSize;\r\n    // t_uv = floor(t_uv * imageSize - 1.0) / imageSize;\r\n    // t_uv = ceil(t_uv * imageSize + 1.0) / imageSize;\r\n    //添加lod起始坐标\r\n    t_uv = t_uv * (1.0 - 1.0 / imageSize);\r\n    t_uv = t_uv + lodvec.zw;\r\n    vec4 tColor = texture2D(s_splatMergeTexture,t_uv);\r\n\r\n    return tColor;\r\n\r\n    // return vec4(mixFactor.x,mixFactor.y,0.0,1.0);\r\n    // return vec4(mixFactor.x + 0.5,mixFactor.y + 0.5,0.0,1.0);\r\n}\r\n\r\n//参考 http://blog.csdn.net/cgwbr/article/details/6620318\r\n//计算MipMap层函数：\r\nfloat mipmapLevel(vec2 uv, vec2 textureSize)\r\n{\r\n    vec2 dx = dFdx(uv * textureSize.x);\r\n    vec2 dy = dFdy(uv * textureSize.y);\r\n    float d = max(dot(dx, dx), dot(dy, dy));  \r\n    return 0.5 * log2(d);\r\n}\r\n\r\nvec4 terrainTexture2D(sampler2D s_splatMergeTexture,vec2 t_uv,float lod,vec4 offset){\r\n \r\n    #ifdef LOD_LINEAR\r\n        vec4 tColor = mix(terrainTexture2DLod(s_splatMergeTexture,t_uv,floor(lod),offset),terrainTexture2DLod(s_splatMergeTexture,t_uv,ceil(lod),offset),fract(lod));\r\n    #else\r\n        vec4 tColor = terrainTexture2DLod(s_splatMergeTexture,t_uv,floor(lod),offset);\r\n    #endif\r\n\r\n    return tColor;\r\n}\r\n\r\nvec4 terrainMethod(vec4 diffuseColor,vec2 v_uv) {\r\n    \r\n    offset[0] = vec4(0.5,0.5,0.0,0.0);\r\n    offset[1] = vec4(0.5,0.5,0.5,0.0);\r\n    offset[2] = vec4(0.5,0.5,0.0,0.5);\r\n    \r\n    vec4 blend = texture2D(s_blendTexture,v_uv);\r\n    for(int i = 0; i < 3; i++)\r\n    {\r\n        vec2 t_uv = v_uv.xy * u_splatRepeats[i];\r\n        float lod = mipmapLevel(t_uv,tileSize);\r\n        lod = clamp(lod,0.0,maxLod);\r\n        // lod = 5.0;\r\n        t_uv = fract(t_uv);\r\n        vec4 tColor = terrainTexture2D(s_splatMergeTexture,t_uv,lod,offset[i]);\r\n        diffuseColor = (tColor - diffuseColor) * blend[i] + diffuseColor;\r\n    }\r\n\r\n    // diffuseColor.xyz = vec3(1.0,0.0,0.0);\r\n    // diffuseColor.xyz = vec3(floor(lod)/7.0,0.0,0.0);\r\n    return diffuseColor;\r\n}",
        "shaders/modules/terrainMerge.fragment.glsl": "//代码实现lod以及线性插值 feng\r\n#extension GL_EXT_shader_texture_lod : enable\r\n#extension GL_OES_standard_derivatives : enable\r\n\r\n#define LOD_LINEAR\r\n\r\nuniform sampler2D s_splatMergeTexture;\r\nuniform sampler2D s_blendTexture;\r\nuniform vec4 u_splatRepeats;\r\n\r\nuniform vec2 u_imageSize;\r\nuniform vec4 u_tileOffset[3];\r\nuniform vec4 u_lod0vec;\r\nuniform vec2 u_tileSize;\r\nuniform float u_maxLod;\r\nuniform float u_scaleByDepth;\r\nuniform float u_uvPositionScale;\r\n\r\n\r\nvec4 terrainTexture2DLod(sampler2D s_splatMergeTexture,vec2 uv,float lod,vec4 offset){\r\n\r\n    //计算不同lod像素缩放以及起始坐标\r\n    vec4 lodvec = u_lod0vec;\r\n    lodvec.x = lodvec.x * pow(0.5,lod);\r\n    lodvec.y = lodvec.x * 2.0;\r\n    lodvec.z = 1.0 - lodvec.y;\r\n\r\n    //lod块尺寸\r\n    vec2 lodSize = u_imageSize * lodvec.xy;\r\n    vec2 lodPixelOffset = 1.0 / lodSize * 2.0;\r\n\r\n    // uv = uv - 1.0 / lodPixelOffset;\r\n    vec2 mixFactor = mod(uv, lodPixelOffset) / lodPixelOffset;\r\n\r\n    //lod块中像素索引\r\n    vec2 t_uv = fract(uv + lodPixelOffset * vec2(0.0, 0.0));\r\n    t_uv = t_uv * offset.xy + offset.zw;\r\n    //添加lod起始坐标\r\n    t_uv = t_uv * lodvec.xy + lodvec.zw;\r\n    //取整像素\r\n    t_uv = floor(t_uv * u_imageSize) / u_imageSize;\r\n    vec4 tColor00 = texture2D(s_splatMergeTexture,t_uv);\r\n\r\n    t_uv = fract(uv + lodPixelOffset * vec2(1.0, 0.0));\r\n    t_uv = t_uv * offset.xy + offset.zw;\r\n    //添加lod起始坐标\r\n    t_uv = t_uv * lodvec.xy + lodvec.zw;\r\n    //取整像素\r\n    t_uv = floor(t_uv * u_imageSize) / u_imageSize;\r\n    vec4 tColor10 = texture2D(s_splatMergeTexture,t_uv);\r\n\r\n    t_uv = fract(uv + lodPixelOffset * vec2(0.0, 1.0));\r\n    t_uv = t_uv * offset.xy + offset.zw;\r\n    //添加lod起始坐标\r\n    t_uv = t_uv * lodvec.xy + lodvec.zw;\r\n    //取整像素\r\n    t_uv = floor(t_uv * u_imageSize) / u_imageSize;\r\n    vec4 tColor01 = texture2D(s_splatMergeTexture,t_uv);\r\n\r\n    t_uv = fract(uv + lodPixelOffset * vec2(1.0, 1.0));\r\n    t_uv = t_uv * offset.xy + offset.zw;\r\n    //添加lod起始坐标\r\n    t_uv = t_uv * lodvec.xy + lodvec.zw;\r\n    //取整像素\r\n    t_uv = floor(t_uv * u_imageSize) / u_imageSize;\r\n    vec4 tColor11 = texture2D(s_splatMergeTexture,t_uv);\r\n\r\n    vec4 tColor0 = mix(tColor00,tColor10,mixFactor.x);\r\n    vec4 tColor1 = mix(tColor01,tColor11,mixFactor.x);\r\n    vec4 tColor = mix(tColor0,tColor1,mixFactor.y);\r\n\r\n    return tColor;\r\n\r\n    // return vec4(mixFactor.x,mixFactor.y,0.0,1.0);\r\n    // return vec4(mixFactor.x + 0.5,mixFactor.y + 0.5,0.0,1.0);\r\n}\r\n\r\n//参考 http://blog.csdn.net/cgwbr/article/details/6620318\r\n//计算MipMap层函数：\r\nfloat mipmapLevel(vec2 uv)\r\n{\r\n    vec2 dx = dFdx(uv);\r\n    vec2 dy = dFdy(uv);\r\n    float d = max(dot(dx, dx), dot(dy, dy));\r\n    return 0.5 * log2(d);\r\n}\r\n\r\n//根据距离以及法线计算MipMap层函数：\r\nfloat mipmapLevel1(vec2 uv)\r\n{\r\n    //视线方向\r\n    vec3 viewDir = u_cameraMatrix[3].xyz - v_globalPosition.xyz;\r\n    float fogDistance = length(viewDir);\r\n    float value = u_scaleByDepth * fogDistance * u_uvPositionScale;//uv变化率与距离成正比，0.001为顶点位置与uv的变化比率\r\n    viewDir = normalize(viewDir);\r\n    float dd = clamp(dot(viewDir, v_normal),0.05,1.0);//取法线与视线余弦值的倒数，余弦值越大（朝向摄像机时uv变化程度越低）lod越小\r\n    value = value / dd;\r\n    value = value * 0.5;//还没搞懂0.5的来历\r\n    return log2(value);\r\n}\r\n\r\nvec4 terrainTexture2D(sampler2D s_splatMergeTexture,vec2 t_uv,float lod,vec4 offset){\r\n \r\n    #ifdef LOD_LINEAR\r\n        vec4 tColor = mix(terrainTexture2DLod(s_splatMergeTexture,t_uv,floor(lod),offset),terrainTexture2DLod(s_splatMergeTexture,t_uv,ceil(lod),offset),fract(lod));\r\n    #else\r\n        vec4 tColor = terrainTexture2DLod(s_splatMergeTexture,t_uv,ceil(lod),offset);\r\n    #endif\r\n\r\n    return tColor;\r\n}\r\n\r\nvec4 terrainMethod(vec4 diffuseColor,vec2 v_uv) {\r\n    \r\n    float lod = 0.0;\r\n    vec4 blend = texture2D(s_blendTexture,v_uv);\r\n    for(int i = 0; i < 3; i++)\r\n    {\r\n        vec2 t_uv = v_uv * u_splatRepeats[i];\r\n        // lod = mipmapLevel(v_uv) + log2(u_tileSize.x * u_splatRepeats[i]);\r\n        lod = mipmapLevel1(v_uv) + log2(u_tileSize.x * u_splatRepeats[i]);\r\n        lod = clamp(lod,0.0,u_maxLod);\r\n        vec4 tColor = terrainTexture2D(s_splatMergeTexture,t_uv,lod,u_tileOffset[i]);\r\n        diffuseColor = (tColor - diffuseColor) * blend[i] + diffuseColor;\r\n    }\r\n\r\n    // diffuseColor.xyz = vec3(1.0,0.0,0.0);\r\n    // diffuseColor.xyz = vec3(lod/u_maxLod,0.0,0.0);\r\n    // diffuseColor.xyz = vec3(floor(lod)/u_maxLod,0.0,0.0);\r\n    return diffuseColor;\r\n}",
        "shaders/modules/terrainMerge.fragment1.glsl": "#extension GL_EXT_shader_texture_lod : enable\r\n#extension GL_OES_standard_derivatives : enable\r\n\r\n#define LOD_LINEAR\r\n\r\nuniform sampler2D s_splatMergeTexture;\r\nuniform sampler2D s_blendTexture;\r\nuniform vec4 u_splatRepeats;\r\n\r\nvec2 imageSize =    vec2(2048.0,1024.0);\r\nvec4 offset[3];\r\nvec2 tileSize = vec2(512.0,512.0);\r\nfloat maxLod = 7.0;\r\n\r\nvec4 terrainTexture2DLod(sampler2D s_splatMergeTexture,vec2 t_uv,float lod)\r\n{\r\n    vec4 lodvec = vec4(0.5,1.0,0.0,0.0);\r\n    lodvec.x = lodvec.x * pow(0.5,lod);\r\n    lodvec.y = lodvec.x * 2.0;\r\n    lodvec.z = 1.0 - lodvec.y;\r\n    \r\n    t_uv = t_uv * lodvec.xy + lodvec.zw;\r\n    t_uv = floor(t_uv * imageSize) / imageSize;\r\n    \r\n    vec4 tColor = texture2D(s_splatMergeTexture,t_uv);\r\n    return tColor;\r\n}\r\n\r\n//参考 http://blog.csdn.net/cgwbr/article/details/6620318\r\n//计算MipMap层函数：\r\nfloat mipmapLevel(vec2 uv, vec2 textureSize)\r\n{\r\n    vec2 dx = dFdx(uv * textureSize.x);\r\n    vec2 dy = dFdy(uv * textureSize.y);\r\n    float d = max(dot(dx, dx), dot(dy, dy));  \r\n    return 0.5 * log2(d);\r\n}\r\n\r\nvec4 terrainTexture2DLodMix(sampler2D s_splatMergeTexture,vec2 t_uv,vec4 offset)\r\n{\r\n    float lod = mipmapLevel(t_uv,tileSize);\r\n    lod = clamp(lod,0.0,maxLod);\r\n    t_uv = fract(t_uv);\r\n    t_uv = t_uv * offset.xy + offset.zw;\r\n \r\n    #ifdef LOD_LINEAR\r\n        vec4 tColor = mix(terrainTexture2DLod(s_splatMergeTexture,t_uv,floor(lod)),terrainTexture2DLod(s_splatMergeTexture,t_uv,ceil(lod)),fract(lod));\r\n    #else\r\n        vec4 tColor = terrainTexture2DLod(s_splatMergeTexture,t_uv,ceil(lod));\r\n    #endif\r\n    return tColor;\r\n}\r\n\r\nvec4 terrainTexture2D(sampler2D s_splatMergeTexture,vec2 t_uv,float splatRepeat,vec4 offset)\r\n{\r\n    t_uv = t_uv.xy * splatRepeat;\r\n    \r\n    vec2 dx = dFdx(t_uv);\r\n    vec2 dy = dFdy(t_uv);\r\n    \r\n    vec4 tColor0 = terrainTexture2DLodMix(s_splatMergeTexture, t_uv, offset);\r\n    vec4 tColor1 = terrainTexture2DLodMix(s_splatMergeTexture, t_uv + dx, offset);\r\n\r\n    vec4 tColor = mix(tColor0,tColor1,0.5);\r\n\r\n    return tColor;\r\n}\r\n\r\nvec4 terrainMethod(vec4 diffuseColor,vec2 v_uv) \r\n{\r\n    \r\n    offset[0] = vec4(0.5,0.5,0.0,0.0);\r\n    offset[1] = vec4(0.5,0.5,0.5,0.0);\r\n    offset[2] = vec4(0.5,0.5,0.0,0.5);\r\n    \r\n    vec4 blend = texture2D(s_blendTexture,v_uv);\r\n    for(int i = 0; i < 3; i++)\r\n    {\r\n        vec4 tColor = terrainTexture2D(s_splatMergeTexture,v_uv,u_splatRepeats[i],offset[i]);\r\n        diffuseColor = (tColor - diffuseColor) * blend[i] + diffuseColor;\r\n    }\r\n\r\n    // diffuseColor.xyz = vec3(1.0,0.0,0.0);\r\n    // diffuseColor.xyz = vec3(floor(lod)/7.0,0.0,0.0);\r\n    return diffuseColor;\r\n}",
        "shaders/mouse.fragment.glsl": "\r\n\r\nprecision highp float;\r\n\r\nuniform int u_objectID;\r\n\r\nvoid main(){\r\n\r\n    //支持 255*255*255*255 个索引\r\n    const float invColor = 1.0/255.0;\r\n    float temp = float(u_objectID);\r\n    temp = floor(temp) * invColor;\r\n    gl_FragColor.x = fract(temp);\r\n    temp = floor(temp) * invColor;\r\n    gl_FragColor.y = fract(temp);\r\n    temp = floor(temp) * invColor;\r\n    gl_FragColor.z = fract(temp);\r\n    temp = floor(temp) * invColor;\r\n    gl_FragColor.w = fract(temp);\r\n}",
        "shaders/mouse.vertex.glsl": "\r\n\r\nattribute vec3 a_position;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvoid main(){\r\n\r\n    vec4 globalPosition = u_modelMatrix * vec4(a_position, 1.0);\r\n    gl_Position = u_viewProjection * globalPosition;\r\n}",
        "shaders/outline.fragment.glsl": "precision mediump float;\r\n\r\nuniform vec4 u_outlineColor;\r\n\r\nvoid main(void) {\r\n   \r\n    gl_FragColor = u_outlineColor;\r\n}",
        "shaders/outline.vertex.glsl": "precision mediump float;  \r\n\r\n//此处将填充宏定义\r\n#define macros\r\n\r\n//坐标属性\r\nattribute vec3 a_position;\r\nattribute vec3 a_normal;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_ITModelMatrix;\r\nuniform mat4 u_cameraMatrix;\r\nuniform mat4 u_viewProjection;\r\nuniform float u_scaleByDepth;\r\nuniform float u_outlineMorphFactor;\r\n\r\n#ifdef HAS_SKELETON_ANIMATION\r\n    #include<modules/skeleton.vertex>\r\n#endif\r\n\r\nuniform float u_outlineSize;\r\n\r\nvoid main(void) {\r\n\r\n    vec4 position = vec4(a_position,1.0);\r\n\r\n    #ifdef HAS_SKELETON_ANIMATION\r\n        position = skeletonAnimation(position);\r\n    #endif\r\n    \r\n    vec3 normal = a_normal;\r\n\r\n    //全局坐标\r\n    vec4 globalPosition = u_modelMatrix * position;\r\n    //全局法线\r\n    vec3 globalNormal = normalize((u_ITModelMatrix * vec4(normal,0.0)).xyz);\r\n\r\n    float depth = distance(globalPosition.xyz , u_cameraMatrix[3].xyz);\r\n    \r\n    vec3 offsetDir = mix(globalNormal,normalize(globalPosition.xyz),u_outlineMorphFactor);\r\n    //摄像机远近保持粗细一致\r\n    offsetDir = offsetDir * depth * u_scaleByDepth;\r\n    //描边宽度\r\n    offsetDir = offsetDir * u_outlineSize;\r\n\r\n    globalPosition.xyz = globalPosition.xyz + offsetDir;//\r\n\r\n    //计算投影坐标\r\n    gl_Position = u_viewProjection * globalPosition;\r\n}",
        "shaders/point.fragment.glsl": "precision mediump float;\r\n\r\nvarying vec4 v_color;\r\nuniform vec4 u_color;\r\n\r\nvoid main(void) {\r\n   \r\n    gl_FragColor = v_color * u_color;\r\n}\r\n",
        "shaders/point.vertex.glsl": "attribute vec3 a_position;\r\nattribute vec4 a_color;\r\n\r\nuniform float u_PointSize;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvarying vec4 v_color;\r\n\r\nvoid main(void) {\r\n\r\n    vec4 globalPosition = u_modelMatrix * vec4(a_position, 1.0);\r\n    gl_Position = u_viewProjection * globalPosition;\r\n    gl_PointSize = u_PointSize;\r\n\r\n    v_color = a_color;\r\n}",
        "shaders/postEffect/fxaa.fragment.glsl": "\r\n\r\n#define FXAA_REDUCE_Mvarying   (1.0/128.0)\r\n#define FXAA_REDUCE_MUL   (1.0/8.0)\r\n#define FXAA_SPAN_MAX     8.0\r\n\r\nvarying vec2 vUV;\r\nuniform sampler2D textureSampler;\r\nuniform vec2 texelSize;\r\n\r\n\r\n\r\nvoid main(){\r\n\tvec2 localTexelSize = texelSize;\r\n\tvec4 rgbNW = texture2D(textureSampler, (vUV + vec2(-1.0, -1.0) * localTexelSize));\r\n\tvec4 rgbNE = texture2D(textureSampler, (vUV + vec2(1.0, -1.0) * localTexelSize));\r\n\tvec4 rgbSW = texture2D(textureSampler, (vUV + vec2(-1.0, 1.0) * localTexelSize));\r\n\tvec4 rgbSE = texture2D(textureSampler, (vUV + vec2(1.0, 1.0) * localTexelSize));\r\n\tvec4 rgbM = texture2D(textureSampler, vUV);\r\n\tvec4 luma = vec4(0.299, 0.587, 0.114, 1.0);\r\n\tfloat lumaNW = dot(rgbNW, luma);\r\n\tfloat lumaNE = dot(rgbNE, luma);\r\n\tfloat lumaSW = dot(rgbSW, luma);\r\n\tfloat lumaSE = dot(rgbSE, luma);\r\n\tfloat lumaM = dot(rgbM, luma);\r\n\tfloat lumaMvarying = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\r\n\tfloat lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\r\n\r\n\tvec2 dir = vec2(-((lumaNW + lumaNE) - (lumaSW + lumaSE)), ((lumaNW + lumaSW) - (lumaNE + lumaSE)));\r\n\r\n\tfloat dirReduce = max(\r\n\t\t(lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL),\r\n\t\tFXAA_REDUCE_MIN);\r\n\r\n\tfloat rcpDirMvarying = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\r\n\tdir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),\r\n\t\tmax(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),\r\n\t\tdir * rcpDirMin)) * localTexelSize;\r\n\r\n\tvec4 rgbA = 0.5 * (\r\n\t\ttexture2D(textureSampler, vUV + dir * (1.0 / 3.0 - 0.5)) +\r\n\t\ttexture2D(textureSampler, vUV + dir * (2.0 / 3.0 - 0.5)));\r\n\r\n\tvec4 rgbB = rgbA * 0.5 + 0.25 * (\r\n\t\ttexture2D(textureSampler, vUV + dir *  -0.5) +\r\n\t\ttexture2D(textureSampler, vUV + dir * 0.5));\r\n\tfloat lumaB = dot(rgbB, luma);\r\n\tif ((lumaB < lumaMin) || (lumaB > lumaMax)) {\r\n\t\tgl_FragColor = rgbA;\r\n\t}\r\n\telse {\r\n\t\tgl_FragColor = rgbB;\r\n\t}\r\n}",
        "shaders/segment.fragment.glsl": "\r\nprecision mediump float;\r\n\r\nvarying vec4 v_color;\r\n\r\nuniform vec4 u_segmentColor;\r\n\r\nvoid main(void) {\r\n    gl_FragColor = v_color * u_segmentColor;\r\n}",
        "shaders/segment.vertex.glsl": "\r\n\r\nattribute vec3 a_position;\r\nattribute vec4 a_color;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvarying vec4 v_color;\r\n\r\nvoid main(void) {\r\n    gl_Position = u_viewProjection * u_modelMatrix * vec4(a_position, 1.0);\r\n    v_color = a_color;\r\n}",
        "shaders/shadow.fragment.glsl": "precision mediump float;\r\n\r\nvoid main() {\r\n    const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);\r\n    const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);\r\n    vec4 rgbaDepth = fract(gl_FragCoord.z * bitShift); // Calculate the value stored into each byte\r\n    rgbaDepth -= rgbaDepth.gbaa * bitMask; // Cut off the value which do not fit in 8 bits\r\n    gl_FragColor = rgbaDepth;\r\n}",
        "shaders/shadow.vertex.glsl": "attribute vec3 a_position;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvoid main(void) {\r\n\r\n    vec4 globalPosition = u_modelMatrix * vec4(a_position, 1.0);\r\n    gl_Position = u_viewProjection * globalPosition;\r\n}",
        "shaders/skybox.fragment.glsl": "\r\n\r\nprecision highp float;\r\n\r\nuniform samplerCube s_skyboxTexture;\r\nuniform mat4 u_cameraMatrix;\r\n\r\nvarying vec3 v_worldPos;\r\n\r\n\r\n\r\nvoid main(){\r\n    vec3 viewDir = normalize(v_worldPos - u_cameraMatrix[3].xyz);\r\n    gl_FragColor = textureCube(s_skyboxTexture, viewDir);\r\n}",
        "shaders/skybox.vertex.glsl": "\r\n\r\nattribute vec3 a_position;\r\n\r\nuniform mat4 u_cameraMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nuniform float u_skyBoxSize;\r\n\r\nvarying vec3 v_worldPos;\r\n\r\nvoid main(){\r\n    vec3 worldPos = a_position.xyz * u_skyBoxSize + u_cameraMatrix[3].xyz;\r\n    gl_Position = u_viewProjection * vec4(worldPos.xyz,1.0);\r\n    v_worldPos = worldPos;\r\n}",
        "shaders/standard.fragment.glsl": "precision mediump float;\r\n\r\n//此处将填充宏定义\r\n#define macros\r\n\r\nvarying vec2 v_uv;\r\nvarying vec3 v_globalPosition;\r\nvarying vec3 v_normal;\r\n\r\n#ifdef HAS_NORMAL_SAMPLER\r\n    varying vec3 v_tangent;\r\n    varying vec3 v_bitangent;\r\n#endif\r\n\r\nuniform mat4 u_cameraMatrix;\r\n\r\nuniform float u_alphaThreshold;\r\n//漫反射\r\nuniform vec4 u_diffuse;\r\n#ifdef HAS_DIFFUSE_SAMPLER\r\n    uniform sampler2D s_diffuse;\r\n#endif\r\n\r\n//法线贴图\r\n#ifdef HAS_NORMAL_SAMPLER\r\n    uniform sampler2D s_normal;\r\n#endif\r\n\r\n//镜面反射\r\nuniform vec3 u_specular;\r\nuniform float u_glossiness;\r\n#ifdef HAS_SPECULAR_SAMPLER\r\n    uniform sampler2D s_specular;\r\n#endif\r\n\r\nuniform vec4 u_sceneAmbientColor;\r\n\r\n//环境\r\nuniform vec4 u_ambient;\r\n#ifdef HAS_AMBIENT_SAMPLER\r\n    uniform sampler2D s_ambient;\r\n#endif\r\n\r\n#ifdef HAS_TERRAIN_METHOD\r\n    #include<modules/terrain.fragment>\r\n#endif\r\n\r\n#include<modules/lightShading.fragment>\r\n\r\n#ifdef HAS_FOG_METHOD\r\n    #include<modules/fog.fragment>\r\n#endif\r\n\r\n#ifdef HAS_ENV_METHOD\r\n    #include<modules/envmap.fragment>\r\n#endif\r\n\r\n#ifdef HAS_PARTICLE_ANIMATOR\r\n    #include<modules/particle.fragment>\r\n#endif\r\n\r\nvoid main(void)\r\n{\r\n    vec4 finalColor = vec4(1.0,1.0,1.0,1.0);\r\n\r\n    //获取法线\r\n    vec3 normal;\r\n    #ifdef HAS_NORMAL_SAMPLER\r\n        normal = texture2D(s_normal,v_uv).xyz * 2.0 - 1.0;\r\n        normal = normalize(normal.x * v_tangent + normal.y * v_bitangent + normal.z * v_normal);\r\n    #else\r\n        normal = normalize(v_normal);\r\n    #endif\r\n\r\n    //获取漫反射基本颜色\r\n    vec4 diffuseColor = u_diffuse;\r\n    #ifdef HAS_DIFFUSE_SAMPLER\r\n        diffuseColor = diffuseColor * texture2D(s_diffuse, v_uv);\r\n    #endif\r\n\r\n    if(diffuseColor.w < u_alphaThreshold)\r\n    {\r\n        discard;\r\n    }\r\n\r\n    #ifdef HAS_TERRAIN_METHOD\r\n        diffuseColor = terrainMethod(diffuseColor, v_uv);\r\n    #endif\r\n\r\n    //环境光\r\n    vec3 ambientColor = u_ambient.w * u_ambient.xyz * u_sceneAmbientColor.xyz * u_sceneAmbientColor.w;\r\n    #ifdef HAS_AMBIENT_SAMPLER\r\n        ambientColor = ambientColor * texture2D(s_ambient, v_uv).xyz;\r\n    #endif\r\n\r\n    finalColor = diffuseColor;\r\n\r\n    //渲染灯光\r\n    #ifdef NUM_LIGHT\r\n        #if NUM_LIGHT > 0\r\n\r\n            //获取高光值\r\n            float glossiness = u_glossiness;\r\n            //获取镜面反射基本颜色\r\n            vec3 specularColor = u_specular;\r\n            #ifdef HAS_SPECULAR_SAMPLER\r\n                vec4 specularMapColor = texture2D(s_specular, v_uv);\r\n                specularColor.xyz = specularMapColor.xyz;\r\n                glossiness = glossiness * specularMapColor.w;\r\n            #endif\r\n            \r\n            finalColor.xyz = lightShading(normal, diffuseColor.xyz, specularColor, ambientColor, glossiness);\r\n        #endif\r\n    #endif\r\n\r\n    #ifdef HAS_ENV_METHOD\r\n        finalColor = envmapMethod(finalColor);\r\n    #endif\r\n\r\n    #ifdef HAS_PARTICLE_ANIMATOR\r\n        finalColor = particleAnimation(finalColor);\r\n    #endif\r\n\r\n    #ifdef HAS_FOG_METHOD\r\n        finalColor = fogMethod(finalColor);\r\n    #endif\r\n\r\n    gl_FragColor = finalColor;\r\n}",
        "shaders/standard.vertex.glsl": "precision mediump float;  \r\n\r\n//此处将填充宏定义\r\n#define macros\r\n\r\n//坐标属性\r\nattribute vec3 a_position;\r\n#ifdef HSA_a_uv\r\n    attribute vec2 a_uv;\r\n#endif\r\n#ifdef HSA_a_normal\r\n    attribute vec3 a_normal;\r\n#endif\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_ITModelMatrix;\r\nuniform mat4 u_viewProjection;\r\nuniform float u_scaleByDepth;\r\n\r\nvarying vec2 v_uv;\r\nvarying vec3 v_globalPosition;\r\nvarying vec3 v_normal;\r\n\r\n#ifdef HAS_NORMAL_SAMPLER\r\n    attribute vec3 a_tangent;\r\n\r\n    varying vec3 v_tangent;\r\n    varying vec3 v_bitangent;\r\n#endif\r\n\r\n#ifdef HAS_SKELETON_ANIMATION\r\n    #include<modules/skeleton.vertex>\r\n#endif\r\n\r\n#ifdef IS_POINTS_MODE\r\n    uniform float u_PointSize;\r\n#endif\r\n\r\n#ifdef HAS_PARTICLE_ANIMATOR\r\n    #include<modules/particle.vertex>\r\n#endif\r\n\r\nvoid main(void) {\r\n\r\n    vec4 position = vec4(a_position,1.0);\r\n\r\n    #ifdef HAS_SKELETON_ANIMATION\r\n        position = skeletonAnimation(position);\r\n    #endif\r\n    \r\n    #ifdef HAS_PARTICLE_ANIMATOR\r\n        position = particleAnimation(position);\r\n    #endif\r\n\r\n    #ifdef HSA_a_normal\r\n        vec3 normal = a_normal;\r\n    #else\r\n        vec3 normal = vec3(0.0,1.0,0.0);\r\n    #endif\r\n\r\n    //获取全局坐标\r\n    vec4 globalPosition = u_modelMatrix * position;\r\n    //计算投影坐标\r\n    gl_Position = u_viewProjection * globalPosition;\r\n    //输出全局坐标\r\n    v_globalPosition = globalPosition.xyz;\r\n    #ifdef HSA_a_uv\r\n    //输出uv\r\n        v_uv = a_uv;\r\n    #else\r\n        v_uv = vec2(0.0,0.0);\r\n    #endif\r\n\r\n    //计算法线\r\n    v_normal = normalize((u_ITModelMatrix * vec4(normal,0.0)).xyz);\r\n    #ifdef HAS_NORMAL_SAMPLER\r\n        v_tangent = normalize((u_modelMatrix * vec4(a_tangent,0.0)).xyz);\r\n        v_bitangent = cross(v_normal,v_tangent);\r\n    #endif\r\n    \r\n    #ifdef IS_POINTS_MODE\r\n        gl_PointSize = u_PointSize;\r\n    #endif\r\n}",
        "shaders/texture.fragment.glsl": "precision mediump float;\r\n\r\nuniform sampler2D s_texture;\r\nvarying vec2 v_uv;\r\n\r\nuniform vec4 u_color;\r\n\r\nvoid main(void) {\r\n\r\n    vec4 color = texture2D(s_texture, v_uv);\r\n    gl_FragColor = color * u_color;\r\n}\r\n",
        "shaders/texture.vertex.glsl": "\r\n\r\nattribute vec3 a_position;\r\nattribute vec2 a_uv;\r\n\r\nvarying vec2 v_uv;\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\nvoid main(void) {\r\n\r\n    gl_Position = u_viewProjection * u_modelMatrix * vec4(a_position, 1.0);\r\n    v_uv = a_uv;\r\n}",
        "shaders/wireframe.fragment.glsl": "precision mediump float;\r\n\r\nuniform vec4 u_wireframeColor;\r\n\r\nvoid main(void) {\r\n    gl_FragColor = u_wireframeColor;\r\n}",
        "shaders/wireframe.vertex.glsl": "precision mediump float;  \r\n\r\n//此处将填充宏定义\r\n#define macros\r\n\r\nattribute vec3 a_position;\r\nattribute vec4 a_color;\r\n\r\nuniform mat4 u_modelMatrix;\r\nuniform mat4 u_viewProjection;\r\n\r\n#ifdef HAS_SKELETON_ANIMATION\r\n    #include<modules/skeleton.vertex>\r\n#endif\r\n\r\n#ifdef HAS_PARTICLE_ANIMATOR\r\n    #include<modules/particle.vertex>\r\n#endif\r\n\r\nvoid main(void) {\r\n\r\n    vec4 position = vec4(a_position,1.0);\r\n\r\n    #ifdef HAS_SKELETON_ANIMATION\r\n        position = skeletonAnimation(position);\r\n    #endif\r\n\r\n    #ifdef HAS_PARTICLE_ANIMATOR\r\n        position = particleAnimation(position);\r\n    #endif\r\n\r\n    gl_Position = u_viewProjection * u_modelMatrix * position;\r\n}"
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * FPS模式控制器
     * @author feng 2016-12-19
     */
    var FPSControllerScript = /** @class */ (function (_super) {
        __extends(FPSControllerScript, _super);
        function FPSControllerScript() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.ischange = false;
            return _this;
        }
        Object.defineProperty(FPSControllerScript.prototype, "auto", {
            get: function () {
                return this._auto;
            },
            set: function (value) {
                if (this._auto == value)
                    return;
                if (this._auto) {
                    feng3d.windowEventProxy.off("mousedown", this.onMousedown, this);
                    feng3d.windowEventProxy.off("mouseup", this.onMouseup, this);
                    this.onMouseup();
                }
                this._auto = value;
                if (this._auto) {
                    feng3d.windowEventProxy.on("mousedown", this.onMousedown, this);
                    feng3d.windowEventProxy.on("mouseup", this.onMouseup, this);
                }
            },
            enumerable: true,
            configurable: true
        });
        FPSControllerScript.prototype.init = function (gameobject) {
            _super.prototype.init.call(this, gameobject);
            this.keyDirectionDic = {};
            this.keyDirectionDic["a"] = new feng3d.Vector3D(-1, 0, 0); //左
            this.keyDirectionDic["d"] = new feng3d.Vector3D(1, 0, 0); //右
            this.keyDirectionDic["w"] = new feng3d.Vector3D(0, 0, 1); //前
            this.keyDirectionDic["s"] = new feng3d.Vector3D(0, 0, -1); //后
            this.keyDirectionDic["e"] = new feng3d.Vector3D(0, 1, 0); //上
            this.keyDirectionDic["q"] = new feng3d.Vector3D(0, -1, 0); //下
            this.keyDownDic = {};
            this.acceleration = 0.0005;
            this.auto = true;
            this.enabled = true;
        };
        FPSControllerScript.prototype.onMousedown = function () {
            this.ischange = true;
            this.preMousePoint = null;
            this.mousePoint = null;
            this.velocity = new feng3d.Vector3D();
            this.keyDownDic = {};
            feng3d.windowEventProxy.on("keydown", this.onKeydown, this);
            feng3d.windowEventProxy.on("keyup", this.onKeyup, this);
            feng3d.windowEventProxy.on("mousemove", this.onMouseMove, this);
        };
        FPSControllerScript.prototype.onMouseup = function () {
            this.ischange = false;
            this.preMousePoint = null;
            this.mousePoint = null;
            feng3d.windowEventProxy.off("keydown", this.onKeydown, this);
            feng3d.windowEventProxy.off("keyup", this.onKeyup, this);
            feng3d.windowEventProxy.off("mousemove", this.onMouseMove, this);
        };
        /**
         * 销毁
         */
        FPSControllerScript.prototype.dispose = function () {
            this.auto = false;
        };
        /**
         * 手动应用更新到目标3D对象
         */
        FPSControllerScript.prototype.update = function () {
            if (!this.ischange)
                return;
            if (this.mousePoint && this.preMousePoint) {
                //计算旋转
                var offsetPoint = this.mousePoint.subtract(this.preMousePoint);
                offsetPoint.x *= 0.15;
                offsetPoint.y *= 0.15;
                // this.targetObject.transform.rotate(Vector3D.X_AXIS, offsetPoint.y, this.targetObject.transform.position);
                // this.targetObject.transform.rotate(Vector3D.Y_AXIS, offsetPoint.x, this.targetObject.transform.position);
                var matrix3d = this.transform.localToWorldMatrix;
                matrix3d.appendRotation(matrix3d.right, offsetPoint.y, matrix3d.position);
                var up = feng3d.Vector3D.Y_AXIS;
                if (matrix3d.up.dotProduct(up) < 0) {
                    up = up.clone();
                    up.scaleBy(-1);
                }
                matrix3d.appendRotation(up, offsetPoint.x, matrix3d.position);
                this.transform.localToWorldMatrix = matrix3d;
                //
                this.preMousePoint = this.mousePoint;
                this.mousePoint = null;
            }
            //计算加速度
            var accelerationVec = new feng3d.Vector3D();
            for (var key in this.keyDirectionDic) {
                if (this.keyDownDic[key] == true) {
                    var element = this.keyDirectionDic[key];
                    accelerationVec.incrementBy(element);
                }
            }
            accelerationVec.scaleBy(this.acceleration);
            //计算速度
            this.velocity.incrementBy(accelerationVec);
            var right = this.transform.rightVector;
            var up = this.transform.upVector;
            var forward = this.transform.forwardVector;
            right.scaleBy(this.velocity.x);
            up.scaleBy(this.velocity.y);
            forward.scaleBy(this.velocity.z);
            //计算位移
            var displacement = right.clone();
            displacement.incrementBy(up);
            displacement.incrementBy(forward);
            this.transform.x += displacement.x;
            this.transform.y += displacement.y;
            this.transform.z += displacement.z;
        };
        /**
         * 处理鼠标移动事件
         */
        FPSControllerScript.prototype.onMouseMove = function (event) {
            this.mousePoint = new feng3d.Point(event.clientX, event.clientY);
            if (this.preMousePoint == null) {
                this.preMousePoint = this.mousePoint;
                this.mousePoint = null;
            }
        };
        /**
         * 键盘按下事件
         */
        FPSControllerScript.prototype.onKeydown = function (event) {
            var boardKey = String.fromCharCode(event.keyCode).toLocaleLowerCase();
            if (this.keyDirectionDic[boardKey] == null)
                return;
            if (!this.keyDownDic[boardKey])
                this.stopDirectionVelocity(this.keyDirectionDic[boardKey]);
            this.keyDownDic[boardKey] = true;
        };
        /**
         * 键盘弹起事件
         */
        FPSControllerScript.prototype.onKeyup = function (event) {
            var boardKey = String.fromCharCode(event.keyCode).toLocaleLowerCase();
            if (this.keyDirectionDic[boardKey] == null)
                return;
            this.keyDownDic[boardKey] = false;
            this.stopDirectionVelocity(this.keyDirectionDic[boardKey]);
        };
        /**
         * 停止xyz方向运动
         * @param direction     停止运动的方向
         */
        FPSControllerScript.prototype.stopDirectionVelocity = function (direction) {
            if (direction == null)
                return;
            if (direction.x != 0) {
                this.velocity.x = 0;
            }
            if (direction.y != 0) {
                this.velocity.y = 0;
            }
            if (direction.z != 0) {
                this.velocity.z = 0;
            }
        };
        __decorate([
            feng3d.oav()
        ], FPSControllerScript.prototype, "acceleration", void 0);
        return FPSControllerScript;
    }(feng3d.Script));
    feng3d.FPSControllerScript = FPSControllerScript;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * feng3d的版本号
     * @author feng 2015-03-20
     */
    feng3d.revision = "0.0.0";
    /**
     * 是否开启调试(主要用于断言)
     */
    feng3d.debuger = true;
    /**
     * 快捷键
     */
    feng3d.shortcut = new feng3d.ShortCut();
    /**
     * 资源路径
     */
    feng3d.assetsRoot = "";
    feng3d.componentMap = {
        Transform: feng3d.Transform,
    };
    feng3d.log("Feng3D version " + feng3d.revision);
})(feng3d || (feng3d = {}));
//# sourceMappingURL=feng3d.js.map

(function universalModuleDefinition(root, factory)
{
    if (root && root["feng3d"])
    {
        return;
    }
    if (typeof exports === 'object' && typeof module === 'object')
        module.exports = factory();
    else if (typeof define === 'function' && define.amd)
        define([], factory);
    else if (typeof exports === 'object')
        exports["feng3d"] = factory();
    else
    {
        root["feng3d"] = factory();
    }
})(this, function ()
{
    return feng3d;
});