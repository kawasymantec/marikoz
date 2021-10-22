var app = new Vue({
    el: '#mainapp',
    data: {
      status: 0,
      message: '青木書店'
    }
  });
  AFRAME.registerComponent("bookshelf", {
    init: function () {
        var topboard = document.createElement("a-box");
        topboard.setAttribute("height",0.02);
        topboard.setAttribute("width", 0.9);
        topboard.setAttribute("depth", 0.5);
        topboard.setAttribute("position","0 2.2 0.25");
        topboard.setAttribute("src", "#wood");
        var sideboard_L = document.createElement("a-box");
        sideboard_L.setAttribute("height",2.2);
        sideboard_L.setAttribute("width", 0.02);
        sideboard_L.setAttribute("depth", 0.5);
        sideboard_L.setAttribute("position","-0.45 1.1 0.25");
        sideboard_L.setAttribute("src", "#wood");
        var sideboard_R = sideboard_L.cloneNode(true);
        sideboard_R.setAttribute("position","0.45 1.1 0.25");
        var backboard = document.createElement("a-box");
        backboard.setAttribute("height",2.2);
        backboard.setAttribute("width", 0.87);
        backboard.setAttribute("depth", 0.02);
        backboard.setAttribute("position","0 1.1 0");
        var board01 = topboard.cloneNode(true);
        board01.setAttribute("position","0 1.8 0.25");
        var board02 = topboard.cloneNode(true);
        board02.setAttribute("position","0 1.4 0.25");
        var board03 = topboard.cloneNode(true);
        board03.setAttribute("position","0 1.0 0.25");
        var board04 = topboard.cloneNode(true);
        board04.setAttribute("position","0 0.6 0.25");
        this.el.appendChild(topboard);
        this.el.appendChild(backboard);
        this.el.appendChild(board01);
        this.el.appendChild(board02);
        this.el.appendChild(board03);
        this.el.appendChild(board04);
        this.el.appendChild(sideboard_L);
        this.el.appendChild(sideboard_R);
    }
  });

  AFRAME.registerComponent("booktest", {
    init: function () {
        var addbook = function(title, author, pos){
            var book = document.createElement("a-text");
            book.setAttribute("position",pos);
            var bookbody = document.createElement("a-box");
            bookbody.setAttribute("height",0.25);
            bookbody.setAttribute("width", 0.02);
            bookbody.setAttribute("depth", 0.2);
            if(Math.random()<0.1){
                bookbody.setAttribute("color", "lightblue");
            }else{
                bookbody.setAttribute("color", "white");
            }
            book.appendChild(bookbody);
            var tate =function(str){
                return str.split('').reduce(function (accumulator, currentValue, currentIndex, array) {
                    return accumulator + "\n" + currentValue;
                });
            };
            var backcover = document.createElement("a-text");
            backcover.setAttribute("value",tate(title) + "\n\n" +tate(author) );
            backcover.setAttribute("font","font/mplus-msdf.json" );
            backcover.setAttribute("font-image","font/mplus-msdf.png" );
            backcover.setAttribute("negate","false" );
            backcover.setAttribute("baseline","top");
            backcover.setAttribute("anchor","align");
            backcover.setAttribute("scale","0.06 0.06" );
            backcover.setAttribute("color", "black");
            backcover.setAttribute("position", "-0.01 0.12 0.1");
            book.appendChild(backcover);
            return book;
        };
        for(var i=0;i<176;i++){
            this.el.appendChild(addbook("ベンガーデルZ","青木まりこ"+i,((i%44)*0.02 - 0.43) + " " + (1.95 - Math.floor(i/44)*0.4) + " 0.2"));
        }
    },tick: function(){}
    });

  AFRAME.registerComponent("player", {
    dependencies: ["raycaster"],
    init: function () {
        // 移動速度・方向
        this.rotating = null;
        this.speeding = null;
        this.speed = 0.0;
        this.raydirection=-1;

        // 現在位置のバックアップ先
        this.currentPosition = { x: 0, y: 0, z: 0 };
        // 衝突面の法線ベクトル
        this.normalVec = null;
        // raycasterの交差イベント
        this.el.addEventListener("raycaster-intersection", (e) => {
            console.log("hit");
            this.normalVec = e.detail.intersections[0].face.normal
        });
        // raycasterの交差解放イベント
        this.el.addEventListener("raycaster-intersection-cleared", () => {
            console.log("clear");
            this.normalVec = null
        });
        this.key_down_arrow_up = false;
        this.key_down_arrow_down = false;
        this.key_down_arrow_left = false;
        this.key_down_arrow_right = false;
        document.addEventListener('keydown', (event) => {
            var keyName = event.key;
            console.log('keydown:' + keyName);
            switch (keyName){
            case 'ArrowUp':
                key_down_arrow_up = true;
                this.speeding = 'up';
                break;
            case 'ArrowDown':
                key_down_arrow_down = true;
                this.speeding = 'down';
                break;
            case 'ArrowLeft':
                key_down_arrow_left = true;
                this.rotating = 'left';
                break;
            case 'ArrowRight':
                key_down_arrow_right = true;
                this.rotating = 'right';
                break;
        }});
        document.addEventListener('keyup', (event) => {
            var keyName = event.key;
            console.log('keyup:' + keyName);
            switch (keyName){
            case 'ArrowUp':
                if(this.speeding=='up'){
                    this.speeding=null;
                }
                key_down_arrow_up = false;
                break;
            case 'ArrowDown':
                if(this.speeding=='down'){
                    this.speeding=null;
                }
                key_down_arrow_down = false;
                break;
            case 'ArrowLeft':
                if(this.rotating=='left'){
                    this.rotating = null;
                }
                key_down_arrow_left = false;
                break;
            case 'ArrowRight':
                if(this.rotating=='right'){
                    this.rotating = null;
                }
                key_down_arrow_right = false;
                break;
        }});
    
    },
    tick: function() {
        // 回転処理
        const rotation = this.el.getAttribute('rotation')
        if (this.rotating == 'left') {
            rotation.y+=2;
            this.el.setAttribute('rotation', rotation)
        } else if (this.rotating == 'right') {
            rotation.y+=-2;
            this.el.setAttribute('rotation', rotation)
        }
        // 移動処理
        if (this.speeding == 'up') {
            this.speed = Math.min(this.speed + 0.01, 0.15)
        } else if (this.speeding == 'down') {
            this.speed = Math.max(this.speed - 0.01, -0.15)
        }
        const position = this.el.getAttribute('position')
        position.x += -Math.cos((rotation.y - 90) * Math.PI / 180) * this.speed;
        position.z += Math.sin((rotation.y - 90) * Math.PI / 180) * this.speed;
        this.el.setAttribute('position', position)
//        const angle = Math.PI * rotation.y / 180
//        position.x += this.speed * Math.sin(angle)
//        position.z += this.speed * Math.cos(angle)
//        this.el.setAttribute('position', position)
        if (this.speed > 0) {
            this.speed = Math.max(this.speed - 0.005, 0)
        }
        if (this.speed < 0) {
            this.speed = Math.min(this.speed + 0.005, 0)
        }
        if(this.speed>=0){
            if(this.raydirection!=-1){
                this.raydirection=-1;
                this.el.setAttribute("raycaster","objects: .wall; far: 0.6; direction: 0 0 -1;");
            }
        }else{
            if(this.raydirection!=1){
                this.raydirection=1;
                this.el.setAttribute("raycaster","objects: .wall; far: 0.6; direction: 0 0 1;");
            }
        }

      // 交差していなければ常に現在位置をバックアップ
      if(!this.normalVec){
        Object.assign(this.currentPosition, this.el.object3D.position);
        document.getElementById("debug-text").setAttribute("value","");
        return;
      }else{
        document.getElementById("debug-text").setAttribute("value","x:"+ this.normalVec.x +" z:" +this.normalVec.z);
        this.el.object3D.position.x = this.currentPosition.x;
        this.el.object3D.position.z = this.currentPosition.z;

      }
      /*
      // 右側面の衝突
      if (this.normalVec.x < 0) {
        this.el.object3D.position.x = this.currentPosition.x
      // 左側面の衝突
      }else if (this.normalVec.x > 0) {
        this.el.object3D.position.x = this.currentPosition.x
      // 正面の衝突
      }else if (this.normalVec.z > 0) {
        this.el.object3D.position.z = this.currentPosition.z
      // 背面の衝突
      }else if (this.normalVec.z < 0) {
        this.el.object3D.position.z = this.currentPosition.z

      }*/

    },
    update: function() {}
  });
