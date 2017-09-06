/**
 * Created by Administrator on 2017/8/31.
 */
var w = window.innerWidth;
var h = window.innerHeight;

function Tunnel(texture){
    this.container = document.getElementById('tubes');
    this.speed = 0.02;
    this.repeatX = 30;
    this.plus = 1;
    this.time = 0;
    this.init();

    //创建管子
    this.createMesh(texture);

    //自适应
    this.handEvents();
    this.render();
}

//初始化
Tunnel.prototype.init = function(){
    this.mouse = {
        position: new THREE.Vector2(0, 0),
        target: new THREE.Vector2(0, 0)
    };


    this.renderer = new THREE.WebGLRenderer({antialias : true});
    this.renderer.setSize(w,h);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(15, w / h, 0.01, 10);

    this.camera.position.z = 0.35;

    this.container.appendChild(this.renderer.domElement);
}

//创建立方体
Tunnel.prototype.createMesh = function(texture){

    var points = [];
    var i;
    for (i = 0; i < 5; i += 1) {
        points.push(new THREE.Vector3(0, 0, 3 * (i / 4)));
    }
    points[4].y = -0.06;


    this.curve = new THREE.CatmullRomCurve3(points);

    var geometry = new THREE.Geometry();

    //平均分成70份
    geometry.vertices = this.curve.getPoints(70);

    this.splineMesh = new THREE.Line(geometry,new THREE.LineBasicMaterial());


    this.tubeGeometry = new THREE.TubeGeometry(this.curve , 70 , 0.02 , 30 , false);
    this.tubeMaterial = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: texture,
        // color:0xff0000
        // wireframe:true
    });

    //缓存主所有的相对点位置
    this.tubeGeometry_o = this.tubeGeometry.clone();

    this.tubeMaterial.map.wrapS = THREE.MirroredRepeatWrapping;
    this.tubeMaterial.map.wrapT = THREE.MirroredRepeatWrapping;
    this.tubeMaterial.map.repeat.set(this.repeatX, 6);


    this.tubeMesh = new THREE.Mesh(this.tubeGeometry , this.tubeMaterial);
    this.scene.add(this.tubeMesh);

}

//自适应
Tunnel.prototype.handEvents = function(){
    //自适应
    window.addEventListener('resize' , this.onResize.bind(this),false);

    //鼠标哦移动
    this.container.addEventListener('mousemove' , this.onMouseMove.bind(this),false);
};


//归一化
Tunnel.prototype.onMouseMove = function(e){
    this.mouse.target.x = (e.clientX - w/2)/(w/2);
    this.mouse.target.y = -(e.clientY - h/2)/(h/2);
}


// 调整渲染器
Tunnel.prototype.onResize = function(){
    w = window.innerWidth;
    h = window.innerHeight;
    this.camera.aspect = w/h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w,h);
}

//更新材质
Tunnel.prototype.updateMaterialOffset = function(){
    this.tubeMaterial.map.offset.x += this.speed;
}

//更新相机位置
Tunnel.prototype.updateCameraPosition = function() {
    this.mouse.position.x += (this.mouse.target.x - this.mouse.position.x) / 30;
    this.mouse.position.y += (this.mouse.target.y - this.mouse.position.y) / 30;

    this.camera.rotation.z = this.mouse.position.x * 0.2;
    this.camera.rotation.y = Math.PI - this.mouse.position.x * 0.06;
    this.camera.position.x = this.mouse.position.x * 0.015;
    this.camera.position.y = -this.mouse.position.y * 0.015;
};


//更新管道
Tunnel.prototype.updateCurveVertices = function(){
    var vertices = this.tubeGeometry.vertices;
    var vertices_o = this.tubeGeometry_o.vertices;
    var index , vertice,vertice_o;
    for(let i = 0 ; i < vertices.length ;i++){
        vertice = vertices[i];
        vertice_o = vertices_o[i];

        index = Math.floor(i/30);

        vertice.x += (vertice_o.x + this.splineMesh.geometry.vertices[index].x - vertice.x)/5;
        vertice.y += (vertice_o.y + this.splineMesh.geometry.vertices[index].y - vertice.y)/5;

    }
    this.tubeGeometry.verticesNeedUpdate = true;

    this.curve.points[2].x = -this.mouse.position.x*0.2;
    this.curve.points[2].y = this.mouse.position.y*0.2;

    this.splineMesh.geometry.vertices = this.curve.getPoints(70);
    this.splineMesh.geometry.verticesNeedUpdate = true;

};

//加速度
Tunnel.prototype.updateSpeed = function(){
    if(this.repeatX > 0 || this.plus === -1){
        if(this.time < 300) {
            this.repeatX -= this.plus*0.1;
            this.tubeMaterial.map.repeat.set(this.repeatX, 6);
        }
        if(this.repeatX <= 0 ){
            this.plus = -1;
        }
        if(this.repeatX >= 30){
            this.plus = 1;
        }
    }
    this.time += 1;
    if(this.time > 450){
        this.time = 0;
    }
};

//渲染
Tunnel.prototype.render = function(){
    //更新材质

    this.updateMaterialOffset();
    this.updateCameraPosition();
    this.updateCurveVertices();

    //加速系统
    this.updateSpeed();
    this.camera.rotation.y = Math.PI;
    this.renderer.render(this.scene,this.camera);
    requestAnimationFrame(this.render.bind(this));



}

