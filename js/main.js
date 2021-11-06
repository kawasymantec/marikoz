  /* global */
  var joy_x = null;
  var joy_y = null;
  var g_selectedShelf = null;
  let g_ShelfDatas = {};
  let g_BookDatas = {};

  function debugMessage(message){
    document.getElementById("debug-text").setAttribute("value",message);
  }
  function zoomUp(){
      console.log("zoomUp");
    document.getElementById("camera").setAttribute("zoom",5);
  }
  function zoomDown(){
    console.log("zoomDown");
    document.getElementById("camera").setAttribute("zoom",1);
  }
  AFRAME.registerComponent("bookshelf", {
    schema: { 
      no: {type: "string", default: "" }
    },
    init: function () {
        var topboard = document.createElement("a-box");
        topboard.setAttribute("height",0.02);
        topboard.setAttribute("width", 0.9);
        topboard.setAttribute("depth", 0.3);
        topboard.setAttribute("position","0 1.8 0.15");
        topboard.setAttribute("src", "#wood");
        var sideboard_L = document.createElement("a-box");
        sideboard_L.setAttribute("height",1.8);
        sideboard_L.setAttribute("width", 0.02);
        sideboard_L.setAttribute("depth", 0.3);
        sideboard_L.setAttribute("position","-0.45 0.9 0.15");
        sideboard_L.setAttribute("src", "#wood");
        var sideboard_R = sideboard_L.cloneNode(true);
        sideboard_R.setAttribute("position","0.45 0.9 0.15");
        var backboard = document.createElement("a-box");
        backboard.setAttribute("height",1.8);
        backboard.setAttribute("width", 0.87);
        backboard.setAttribute("depth", 0.02);
        backboard.setAttribute("position","0 0.9 0");
        var board01 = topboard.cloneNode(true);
        board01.setAttribute("position","0 1.5 0.15");
        var board02 = topboard.cloneNode(true);
        board02.setAttribute("position","0 1.2 0.15");
        var board03 = topboard.cloneNode(true);
        board03.setAttribute("position","0 0.9 0.15");
        var board04 = topboard.cloneNode(true);
        board04.setAttribute("position","0 0.6 0.15");
        var bottomShelf = document.createElement("a-box");
        bottomShelf.setAttribute("height",0.6);
        bottomShelf.setAttribute("width", 0.9);
        bottomShelf.setAttribute("depth", 0.3);
        bottomShelf.setAttribute("position","0 0.3 0.45");
        bottomShelf.setAttribute("src", "#wood");
        bottomShelf.classList.add("wall");
        this.el.appendChild(topboard);
        this.el.appendChild(backboard);
        this.el.appendChild(board01);
        this.el.appendChild(board02);
        this.el.appendChild(board03);
        this.el.appendChild(board04);
        this.el.appendChild(sideboard_L);
        this.el.appendChild(sideboard_R);
        this.el.appendChild(bottomShelf);
        var addbookbody = function(id,pos){
            var bookbody = document.createElement("a-box");
            bookbody.setAttribute("height",0.2);
            bookbody.setAttribute("width", 0.88);
            bookbody.setAttribute("depth",0.15);
            bookbody.setAttribute("src","#book_top");
            bookbody.setAttribute("position",pos[0] + " " + pos[1] + " " + pos[2]);
            return bookbody;
        };
        var addbooks = function(id,srcImg,srcLowImg,pos,offset,shelf_id){
          var bookface = document.createElement("a-plane");
          bookface.setAttribute("id",id);
          bookface.setAttribute("nearsrc",srcImg);
          bookface.setAttribute("src",srcLowImg);
          bookface.setAttribute("bookOffet",offset);
          bookface.setAttribute("shelf_id",shelf_id);
          bookface.setAttribute("height",0.2);
          bookface.setAttribute("width", 0.88);
          bookface.setAttribute("position",pos[0] + " " + pos[1] + " " + pos[2]);
          bookface.setAttribute("bookface","shelf_id: " + shelf_id);
          bookface.classList.add("collidable");
          return bookface;
      };
      if(this.data.no){
        //json 読み込み
        fetch('json/' + this.data.no + '.json')
        .then((response) => {
            if (!response.ok) {
                throw new Error();
            }
            return response.json(); 
        })
        .then((blob) => {
          console.log("load json! :" + this.data.no);
          if(!g_ShelfDatas[this.data.no]){
              g_ShelfDatas[this.data.no] = blob;
              blob.books.forEach((item)=>{
                g_BookDatas[item.isbn] = item;
              });
          }
          for(var i=1;i<=4;i++){
            this.el.appendChild(addbookbody(this.data.no+"-"+i,[0,0.41+i*0.3,0.175]));
            this.el.appendChild(addbooks(this.data.no+"-"+i,blob.back_cover_images[i-1],blob.back_cover_low_images[i-1],[0,0.41+i*0.3,0.251],(i-1)*44,this.data.no));
          }
        })
        .catch((reason) => {
            // エラー
            console.log(reason);
        });

      }

        
    }
  });
  AFRAME.registerComponent("bookface",{
    schema:{shelf_id:{type:'string'}},
    init: function() {
        this.nearTexture = this.el.getAttribute("nearsrc");
        this.farTexture = this.el.getAttribute("src");
        this.targetCam = document.getElementById("camera");
        this.bookOffet = this.el.getAttribute("bookOffet");
        this.isFocused=false;
        this.isFar=true;
        this.el.addEventListener('shelf_select',(event) => {
            for(var i=1;i<=44;i++){
                var addbook = function(id,pos,isbn){
                    var book = document.createElement("a-plane");
                    book.setAttribute("id",id);
                    book.setAttribute("isbn",isbn);
                    book.setAttribute("height",0.2);
                    book.setAttribute("width", 0.02);
                    book.setAttribute("position",pos[0] + " " + pos[1] + " " + pos[2]);
                    book.setAttribute("opacity",0);
                    book.setAttribute("book","isbn: " + isbn);
                    book.classList.add("collidable");
                    return book;
                };
                this.el.appendChild(addbook(this.data.shelf_id +"-" +i,[i*0.02-0.45,0,0.005],g_ShelfDatas[this.data.shelf_id].books[i-1].isbn));
            }
        });
        this.el.addEventListener('shelf_release',(event) => {
            console.log("bookface reelase");
            while( this.el.firstChild ){
                this.el.removeChild( this.el.firstChild );
              }
        });
      },
      tick: function(){
        const selfPos = this.el.object3D.getWorldPosition(new THREE.Vector3());
        const targetPos = this.targetCam.object3D.getWorldPosition(new THREE.Vector3());
        if(selfPos.distanceTo(targetPos)>3){
            if(!this.isFar){
                this.isFar =true;
                this.el.setAttribute("src",this.farTexture);
            }
        }else{
            if(this.isFar){
                this.isFar =false;
                this.el.setAttribute("src",this.nearTexture);
            }

        }

      }
  });
  AFRAME.registerComponent("book", {
    schema:{isbn:{type:'string'}},
    init: function () {
      this.el.addEventListener('book_select',(event) =>{

      });

    },
    tick: function () {

    }
  });


  AFRAME.registerComponent("sideshelf", {
    init: function () {
        var bottomShelf = document.createElement("a-box");
        bottomShelf.setAttribute("height",0.6);
        bottomShelf.setAttribute("width",1.2);
        bottomShelf.setAttribute("depth", 0.6);
        bottomShelf.setAttribute("position","0 0.3 0");
        bottomShelf.setAttribute("src", "#wood");
        bottomShelf.classList.add("wall");
        this.el.appendChild(bottomShelf);
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
            backcover.setAttribute("alight","center");
            backcover.setAttribute("scale","0.06 0.06" );
            backcover.setAttribute("color", "black");
            backcover.setAttribute("position", "-0.01 0.12 0.1");
            book.appendChild(backcover);
            return book;
        };
        for(var i=0;i<44;i++){
            this.el.appendChild(addbook("ベンガーデルZ","青木まりこ"+i,((i%44)*0.02 - 0.43) + " " + (1.95 - Math.floor(i/44)*0.4) + " 0.2"));
        }
    },tick: function(){}
    });
  AFRAME.registerComponent("game_master",{
    init: function () {
      this.el.addEventListener("game_start", (event) => {
        
      });
      
      this.el.addEventListener("book_select", (event) => {
        
      });
      
      
    },
    tick: function (){


    }
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
        this.el.addEventListener("raycaster-intersection", (event) => {
//            console.log("hit");
            this.normalVec = event.detail.intersections[0].face.normal
        });
        // raycasterの交差解放イベント
        this.el.addEventListener("raycaster-intersection-cleared", (event) => {
//            console.log("clear");
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
            case 'z':
            case 'Z':
                zoomUp();
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
            case 'z':
            case 'Z':
                zoomDown();
                break;
            }});
    },
    tick: function() {
        // joystick処理
        if(joy_y!=null){
            if(joy_y>0.2){
                this.speeding = 'down';
            }else if(joy_y<-0.2){
                this.speeding = 'up';
            }else{
                this.speeding = null;
            }
        }
        if(joy_x!=null){
            if(joy_x>0.2){
                this.rotating = 'right';
            }else if(joy_x<-0.2){
                this.rotating = 'left';
            }else{
                this.rotating = null;
            }

        }
        if(joy_x!=null&&joy_y!=null){
//        debugMessage("x:"+ joy_x +" z:" +joy_y);

        }
        // 回転処理
        const rotation = this.el.getAttribute('rotation')
        if (this.rotating == 'left') {
            rotation.y+=2;
            this.el.setAttribute('rotation', rotation)
        } else if (this.rotating == 'right') {
            rotation.y-=2;
            this.el.setAttribute('rotation', rotation)
        }
        // 移動処理
        if (this.speeding == 'up') {
            this.speed = Math.min(this.speed + 0.015, 0.1)
        } else if (this.speeding == 'down') {
            this.speed = Math.max(this.speed - 0.015, -0.1)
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
        return;
      }else{
        this.el.object3D.position.x = this.currentPosition.x;
        this.el.object3D.position.z = this.currentPosition.z;

      }

    },
    update: function() {}
  });

  AFRAME.registerComponent('mouse-listener', {
    init: function () {
      this.el.isMouseDown = false;
      this.el.selectedShelf = null; //選択中の棚
      this.el.addEventListener('raycaster-intersection',  (event) => {
        event.detail.els.forEach(item =>{
            if(item.getAttribute("bookface")!=null){
                console.log("bookface");
                if(this.selectedShelf!=null){
                    console.log("release!!");
                    {
                        this.selectedShelf.dispatchEvent(new Event("shelf_release"));
                    }
                }
                item.dispatchEvent(new Event("shelf_select"));
                this.selectedShelf = item;
            }
        });
        for(var i=0;i<event.detail.els.length;i++){
            if(event.detail.els[i].getAttribute("bookface")==null){
                this.selectedObj = event.detail.els[i];
                this.selectedObj.setAttribute("opacity",0.5);
                this.isMouseDown = false;
                return;
            }
        }
      });
      this.el.addEventListener('raycaster-intersection-cleared',  (event)=> {
        //レイキャスターと接触しているオブジェクトの情報をクリア
        console.log("cleard");
        if(this.selectedShelf){
            event.detail.clearedEls.forEach(item =>{
                if(this.selectedShelf == item){
                    console.log("release!!");
                    this.selectedShelf.dispatchEvent(new Event("shelf_release"));
                    this.selectedShelf = null;
                }
            });
        }
        for(var i=0;i<event.detail.clearedEls.length;i++){
            if(this.selectedObj==event.detail.clearedEls[i]){
                this.selectedObj.setAttribute("opacity",0);              
                this.selectedObj = null;
                this.isMouseDown = false;
                return;
            }
        }
      });
      this.el.addEventListener('mousedown',(event)=> {
        if(!this.selectedObj){return;}
        this.isMouseDown = true;
      });
      this.el.addEventListener('mouseup', (event)=> {
        if(this.selectedObj&&this.isMouseDown){
          this.selectedObj.dispatchEvent(new CustomEvent("book_select",{detail:{isbn: this.selectedObj.getAttribute('isbn')}}));
        }
        this.isMouseDown = false;
      });
      
    },
    
  });
  
  AFRAME.registerComponent('touch-checker', {
    init: function () {
      this.isTriggerd = false;
      this.selectedShelf = null; //選択中の棚
      //Trigger Pressed
      this.el.addEventListener('triggerdown',  (event) => {
        this.isTriggerd = true;
      });
      //Trigger Released
      this.el.addEventListener('triggerup',  (event) => {
        this.isTriggerd = false;
      });
      this.el.addEventListener('raycaster-intersection', (event) => {
        event.detail.els.forEach(item =>{
            if(item.getAttribute("bookface")!=null){
                console.log("bookface");
                if(selectedShelf!=null){
                    console.log("release!!");
                    {
                        selectedShelf.dispatchEvent(new Event("shelf_release"));
                    }
                }
                item.dispatchEvent(new Event("shelf_select"));
                this.selectedShelf = item;
            }
        });
        for(var i=0;i<event.detail.els.length;i++){
            if(event.detail.els[i].getAttribute("bookface")==null){
                this.selectedObj = event.detail.els[i];
                this.selectedObj.setAttribute("opacity",0.5);
                this.isTriggerd = false;
                return;
            }
        }
      });

      //レイキャスターとオブジェクトとの接触完了
      this.el.addEventListener('raycaster-intersection-cleared',  (event) => {
        if(this.selectedShelf){
            var hit = false;
            event.detail.clearedEls.forEach(item =>{
                if(this.selectedShelf == item){
                    console.log("release!!");
                    this.selectedShelf.dispatchEvent(new Event("shelf_release"));
                    this.selectedShelf = null;
                }
            });
        }
        for(var i=0;i<event.detail.clearedEls.length;i++){
            if(this.selectedObj==event.detail.clearedEls[i]){
                this.selectedObj.setAttribute("opacity",0);              
                this.selectedObj = null;
                this.isTriggerd = false;
                return;
            }
        }
      });        
    },
    tick: function () {
      if(!this.el.isTriggerd){ return; }
      if(!this.el.selectedObj) { return; }
      this.el.isTriggerd = false;
//      soundPlay("sound_button");
    }
  });

  AFRAME.registerComponent('input-listener', {
    //Definition of right or left hand as a controller's property.
    schema: { 
        hand: {type: "string", default: "" }
    },
    //Initialization
    init:function () {
      //Stick Moved
      this.el.addEventListener('axismove',(event)=>{
        if(event.detail.axis.length>=4){
          //for oculus
          joy_x = event.detail.axis[2];
          joy_y = event.detail.axis[3];
        }else{
          //for vive
          joy_x = event.detail.axis[0];
          joy_y = event.detail.axis[1];
        }
      }); 
      
      //Trigger Touch Started
      this.el.addEventListener('triggertouchstart', (event)=> {

      });
      //Trigger Touch Ended
      this.el.addEventListener('triggertouchend',  (event) =>{

      });
      
      //Trigger Pressed
      this.el.addEventListener('triggerdown', (event) =>{
      });
      //Trigger Released
      this.el.addEventListener('triggerup', (event) => {
      });
      
      //Grip Pressed
      this.el.addEventListener('gripdown', (event) =>{
      }); 

      //Grip Up
      this.el.addEventListener('gripup', (event) => {
      }); 

      let key_ctrl_on = false;
/*      if(this.data.hand=="left"){
        document.addEventListener('keydown', (event) => {
          var keyName = event.key;
          console.log('keydown:' + keyName);
          switch (keyName){
          case 'z':
          case 'Z':
            zoomUp();
            break;
          }
        });
        document.addEventListener('keyup', (event) => {
          var keyName = event.key;
          console.log('keyup:' + keyName);
          switch (keyName){
          case 'z':
          case 'Z':
            zoomDown();
            break;
          }
        });
      }
*/
             //Grip Released
      this.el.addEventListener('gripup',  (event)=> {
      });
      //A-buttorn Pressed 
      this.el.addEventListener('abuttondown', (event)=> {
      });
      //A-buttorn Released
      this.el.addEventListener('abuttonup', (event)=> {
      });
      //B-buttorn Pressed
      this.el.addEventListener('bbuttondown', (event)=> {
      });
      //B-buttorn Released
      this.el.addEventListener('bbuttonup', (event)=> {
      });
      //Y-buttorn Pressed 
      this.el.addEventListener('ybuttondown', (event)=>  {
      });
      //Y-buttorn Released
      this.el.addEventListener('ybuttonup', (event)=> {
        this.txt.setAttribute("value","Y-button up");
      });
      //X-buttorn Pressed
      this.el.addEventListener('xbuttondown', (event)=> {
      });
      //X-buttorn Released
      this.el.addEventListener('xbuttonup',(event)=>  {
        this.txt.setAttribute("value","X-button up");
      });
    },
    //called evry frame
    tick: function () {
      //Position of left-hand controller is shown in real-time.
      if(this.data.hand=="left"){
//            var p=this.el.object3D.position;
//            this.el.txt2.setAttribute("value","R-Position: "+ p.x.toFixed(2)+", "+p.y.toFixed(2)+", "+p.z.toFixed(2));
      }
    }
});

