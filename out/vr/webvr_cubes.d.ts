declare var clock: any;
declare var container: HTMLDivElement;
declare var camera: feng3d.Camera, scene: feng3d.Scene3D, raycaster: any, renderer: any;
declare var room: feng3d.GameObject;
declare var isMouseDown: boolean;
declare var INTERSECTED: any;
declare var crosshair: feng3d.GameObject;
declare function init(): void;
declare function onMouseDown(): void;
declare function onMouseUp(): void;
declare function onPointerRestricted(): void;
declare function onPointerUnrestricted(): void;
declare function onWindowResize(): void;
declare function animate(): void;
declare function render(): void;
