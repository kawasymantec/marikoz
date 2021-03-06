  /* global */
  var joy_x = null;
  var joy_y = null;
  var g_selectedShelf = null;
  let g_ShelfLoading = {};
  let g_ShelfDatas = {};
  let g_BookDatas = {};
  let g_selectObject = null;
  var game_state = 0;

  function debugMessage(message){
    document.getElementById("debug-text").setAttribute("value",message);
  }
  function showMessage(message){
    document.getElementById("debug-text").setAttribute("value",message);
  }
  function escape(){
    document.getElementById("rig").dispatchEvent(new CustomEvent("escape"));
  }
  function zoomUp(){
    console.log("zoomUp");
    document.getElementById("camera").setAttribute("zoom",5);
  }

  function playBgm(){
    let bgm = document.getElementById("sound_bgm");
    if(bgm.paused){
      bgm.volume=0.3;
      bgm.play();
    }

  }

  function playSE(filename){
    const se = new Audio(filename);
    se.play();
  }


  function zoomDown(){
    console.log("zoomDown");
    document.getElementById("camera").setAttribute("zoom",1);
  }

  function showBookDetail(bookdetail,pos,rotation){
    if(document.getElementById("bookdetailview")){
      document.getElementById("bookdetailview").remove();
    }

    var base = document.createElement("a-entity");
    base.setAttribute("id","bookdetailview");
    base.setAttribute("position","0 0 0.1");
//    base.setAttribute("rotation",rotation);

    var backpanel = document.createElement("a-plane");
    backpanel.setAttribute("height",0.2);
    backpanel.setAttribute("width", 0.5);
    base.appendChild(backpanel);
    var bookimage = document.createElement("a-image");
    bookimage.setAttribute("height",0.12);
    bookimage.setAttribute("width", 0.08);
    if(bookdetail.main_cover.length>0){
      bookimage.setAttribute("src", bookdetail.main_cover);
    }
    bookimage.setAttribute("position","-0.19 0 0.002");
    base.appendChild(bookimage);

    var titletext = document.createElement("a-text");
    titletext.setAttribute("font", "font/mplus-msdf.json");
    titletext.setAttribute("font-image", "font/mplus-msdf.png");
    titletext.setAttribute("negate", "false");
    titletext.setAttribute("align", "left");
    titletext.setAttribute("color", "black");
    titletext.setAttribute("scale", "0.08 0.08");
    titletext.setAttribute("value",bookdetail.title.replaceAll(' ','???'));
    titletext.setAttribute("position","-0.14 0.06 0.002");
    var authortext = titletext.cloneNode();
    authortext.setAttribute("scale", "0.08 0.08");
    authortext.setAttribute("value",bookdetail.contributor.replaceAll(' ','???'));
    authortext.setAttribute("position","-0.14 0.03 0.002");
    var imprinttext = titletext.cloneNode();
    imprinttext.setAttribute("scale", "0.08 0.08");
    imprinttext.setAttribute("value",bookdetail.imprint.replaceAll(' ','???'));
    imprinttext.setAttribute("position","-0.14 0 0.002");
    var btnBuyBack = document.createElement("a-plane");
    btnBuyBack.setAttribute("color","skyblue");
    btnBuyBack.setAttribute("height",0.022);
    btnBuyBack.setAttribute("width", 0.05);
    btnBuyBack.setAttribute("position","0 -0.04 0.001");
    var btnCloseBack = document.createElement("a-plane");
    btnCloseBack.setAttribute("color","skyblue");
    btnCloseBack.setAttribute("height",0.022);
    btnCloseBack.setAttribute("width", 0.05);
    btnCloseBack.setAttribute("position","0.2 -0.04 0.001");

    var btnBuyText = titletext.cloneNode();
    btnBuyText.setAttribute("scale", "0.08 0.08");
    btnBuyText.setAttribute("value","??????");
    btnBuyText.setAttribute("position","0 -0.04 0.002");
    btnBuyText.setAttribute("align", "center");
    var btnCloseText = btnBuyText.cloneNode();
    btnCloseText.setAttribute("scale", "0.08 0.08");
    btnCloseText.setAttribute("value","?????????");
    btnCloseText.setAttribute("position","0.2 -0.04 0.002");
    var btnBuy = document.createElement("a-plane");
    btnBuy.setAttribute("height",0.022);
    btnBuy.setAttribute("width", 0.05);
    btnBuy.setAttribute("position","0 -0.04 0.003");
    btnBuy.setAttribute("opacity",0);
    btnBuy.classList.add("collidable");
    btnBuy.addEventListener('click',(event)=>{
      window.open(bookdetail.item_url);
    });
    var btnClose = document.createElement("a-plane");
    btnClose.setAttribute("height",0.02);
    btnClose.setAttribute("width", 0.05);
    btnClose.setAttribute("position","0.2 -0.04 0.003");
    btnClose.setAttribute("opacity",0);
    btnClose.addEventListener('click',(event)=>{
      if(document.getElementById("bookdetailview")){
        document.getElementById("bookdetailview").remove();
      }
    });
    btnClose.classList.add("collidable");
    base.appendChild(titletext);
    base.appendChild(authortext);
    base.appendChild(imprinttext);
    base.appendChild(btnBuyBack);
    base.appendChild(btnCloseBack);
    base.appendChild(btnBuyText);
    base.appendChild(btnCloseText);
    base.appendChild(btnBuy);
    base.appendChild(btnClose);
    if(g_selectObject){
      g_selectObject.appendChild(base);
    }
//    document.getElementById("bookstore").appendChild(base);
  }

  function showTargetBookDetail(bookdetail){
    if(document.getElementById("targetbookdetailview")){
      document.getElementById("targetbookdetailview").remove();
    }

    var base = document.createElement("a-entity");
    base.setAttribute("id","targetbookdetailview");
    base.setAttribute("position","0 0 0.05");
    base.setAttribute("scale", "2 2");

    var backpanel = document.createElement("a-plane");
    backpanel.setAttribute("height",0.2);
    backpanel.setAttribute("width", 0.5);
    backpanel.setAttribute("side","double");
    base.appendChild(backpanel);
    var bookimage = document.createElement("a-image");
    bookimage.setAttribute("height",0.12);
    bookimage.setAttribute("width", 0.08);
    if(bookdetail.main_cover.length>0){
      bookimage.setAttribute("src", bookdetail.main_cover);
    }
    bookimage.setAttribute("position","-0.19 0 0.002");
    base.appendChild(bookimage);

    var titletext = document.createElement("a-text");
    titletext.setAttribute("font", "font/mplus-msdf.json");
    titletext.setAttribute("font-image", "font/mplus-msdf.png");
    titletext.setAttribute("negate", "false");
    titletext.setAttribute("align", "left");
    titletext.setAttribute("color", "black");
    titletext.setAttribute("scale", "0.08 0.08");
    titletext.setAttribute("value",bookdetail.title.replaceAll(' ','???'));
    titletext.setAttribute("position","-0.14 0.06 0.002");
    var authortext = titletext.cloneNode();
    authortext.setAttribute("scale", "0.08 0.08");
    authortext.setAttribute("value",bookdetail.contributor.replaceAll(' ','???'));
    authortext.setAttribute("position","-0.14 0.03 0.002");
    var imprinttext = titletext.cloneNode();
    imprinttext.setAttribute("scale", "0.08 0.08");
    imprinttext.setAttribute("value",bookdetail.imprint.replaceAll(' ','???'));
    imprinttext.setAttribute("position","-0.14 0 0.002");
    var btnBuyText = titletext.cloneNode();
    btnBuyText.setAttribute("scale", "0.08 0.08");
    btnBuyText.setAttribute("value","??????");
    btnBuyText.setAttribute("position","0 -0.04 0.002");
    btnBuyText.setAttribute("align", "center");
    var btnBuyBack = document.createElement("a-plane");
    btnBuyBack.setAttribute("color","skyblue");
    btnBuyBack.setAttribute("height",0.022);
    btnBuyBack.setAttribute("width", 0.05);
    btnBuyBack.setAttribute("position","0 -0.04 0.001");
    var btnStartBack = document.createElement("a-plane");
    btnStartBack.setAttribute("color","skyblue");
    btnStartBack.setAttribute("height",0.022);
    btnStartBack.setAttribute("width", 0.07);
    btnStartBack.setAttribute("position","0.2 -0.04 0.001");

    var btnStartText = btnBuyText.cloneNode();
    btnStartText.setAttribute("scale", "0.08 0.08");
    btnStartText.setAttribute("value","????????????");
    btnStartText.setAttribute("position","0.2 -0.04 0.002");

    var btnDescText = btnBuyText.cloneNode();
    btnDescText.setAttribute("scale", "0.08 0.08");
    btnDescText.setAttribute("value","?????????????????????");
    btnDescText.setAttribute("align", "left");
    btnDescText.setAttribute("position","-0.24 0.08 0.002");
    var btnBuy = document.createElement("a-plane");
    btnBuy.setAttribute("height",0.022);
    btnBuy.setAttribute("width", 0.05);
    btnBuy.setAttribute("position","0 -0.04 0.003");
    btnBuy.setAttribute("opacity",0);
    btnBuy.classList.add("collidable");
    btnBuy.addEventListener('click',(event)=>{
      window.open(bookdetail.item_url);
    });
    var btnStart = document.createElement("a-plane");
    btnStart.setAttribute("height",0.02);
    btnStart.setAttribute("width", 0.07);
    btnStart.setAttribute("position","0.2 -0.04 0.003");
    btnStart.setAttribute("opacity",0);
    btnStart.addEventListener('click',(event)=>{
      playBgm();
    });
    btnStart.classList.add("collidable");

    base.appendChild(btnDescText);
    base.appendChild(titletext);
    base.appendChild(authortext);
    base.appendChild(imprinttext);
    base.appendChild(btnBuyBack);
    base.appendChild(btnBuyText);
    base.appendChild(btnBuy);
    base.appendChild(btnStartBack);
    base.appendChild(btnStartText);
    base.appendChild(btnStart);
    document.getElementById("searchTarget").appendChild(base);
  }
  AFRAME.registerComponent('autoremove', {
    init: function () {
      var target = this.data.target;
      setTimeout(function(){
        document.getElementById(target).remove();
      },10000);
    }
  });


  AFRAME.registerComponent("bookshelf", {
    schema: { 
      no: {type: "string", default: "" }
    },
    init: function () {
        var topboard = document.createElement("a-box");
        topboard.setAttribute("height",0.06);
        topboard.setAttribute("width", 0.9);
        topboard.setAttribute("depth", 0.3);
        topboard.setAttribute("position","0 1.8 0.15");
        topboard.setAttribute("src", "#wood");
        var sideboard_L = document.createElement("a-box");
        sideboard_L.setAttribute("height",1.8);
        sideboard_L.setAttribute("width", 0.01);
        sideboard_L.setAttribute("depth", 0.3);
        sideboard_L.setAttribute("position","-0.445 0.9 0.15");
        sideboard_L.setAttribute("src", "#wood");
        sideboard_L.classList.add("wall");
        var sideboard_R = sideboard_L.cloneNode(true);
        sideboard_R.setAttribute("position","0.445 0.9 0.15");
        var backboard = document.createElement("a-box");
        backboard.setAttribute("height",1.8);
        backboard.setAttribute("width", 0.87);
        backboard.setAttribute("depth", 0.02);
        backboard.setAttribute("position","0 0.9 0");
        var board01 = topboard.cloneNode(true);
        board01.setAttribute("height",0.02);
        board01.setAttribute("position","0 1.5 0.15");
        var board02 = board01.cloneNode(true);
        board02.setAttribute("position","0 1.2 0.15");
        var board03 = board01.cloneNode(true);
        board03.setAttribute("position","0 0.9 0.15");
        var board04 = board01.cloneNode(true);
        board04.setAttribute("position","0 0.6 0.15");
        var bottomShelf = document.createElement("a-box");
        bottomShelf.setAttribute("height",0.6);
        bottomShelf.setAttribute("width", 0.9);
        bottomShelf.setAttribute("depth", 0.6);
        bottomShelf.setAttribute("position","0 0.3 0.3");
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
    var addStackBook = function(id,isbn,srcImg,pos,count){
      const book_height = 0.2;
      const book_width = 0.15;
      const book_depth = 0.02;
      var book = document.createElement("a-entity");
      book.setAttribute("position",pos[0] + " " + pos[1] + " " + pos[2]);
      var cover = document.createElement("a-plane");
      cover.setAttribute("id",id);
      cover.setAttribute("isbn",isbn);
      cover.setAttribute("popup_rotation","-90 0 0");
      cover.setAttribute("popup_pos",pos[0] + " " + pos[1]+0.2 + " " + pos[2]+0.1);
      cover.setAttribute("height",book_height);
      cover.setAttribute("width", book_width);
      cover.setAttribute("opacity",0);
      cover.setAttribute("book","isbn: " + isbn);
      cover.setAttribute("rotation", "-90 0 0");
      cover.setAttribute("position", "0 "+((book_depth*count)+0.002)+" 0");
      cover.classList.add("collidable");
      var bookface = document.createElement("a-plane");
      bookface.setAttribute("id",id);
      bookface.setAttribute("src",srcImg);
      bookface.setAttribute("height",book_height);
      bookface.setAttribute("width", book_width);
      bookface.setAttribute("rotation", "-90 0 0");
      bookface.setAttribute("position", "0 "+ ((book_depth*count)+0.001) +" 0" );
      var bookbox = document.createElement("a-box");
      bookbox.setAttribute("height",book_height);
      bookbox.setAttribute("width", book_width);
      bookbox.setAttribute("depth", (book_depth*count));
      bookbox.setAttribute("rotation", "-90 0 0");
      bookbox.setAttribute("position", "0 " + (book_depth*count)/2 + " 0");
      book.appendChild(bookbox);
      book.appendChild(bookface);
      book.appendChild(cover);
      return book;
    };
    var addShelfTitle = function(title){
      var titlepanel = document.createElement("a-entity");
      titlepanel.setAttribute("position","0 1.8 0.3");
      var titleback = document.createElement("a-plane");
      titleback.setAttribute("height",0.05);
      titleback.setAttribute("width", 0.5);
      titleback.setAttribute("position","0 0 0.001");
      var titletext = document.createElement("a-text");
      titletext.setAttribute("value",title);
      titletext.setAttribute("font", "font/mplus-msdf.json");
      titletext.setAttribute("font-image", "font/mplus-msdf.png");
      titletext.setAttribute("negate", "false");
      titletext.setAttribute("align", "center");
      titletext.setAttribute("color", "black");
      titletext.setAttribute("scale", "0.1 0.1");
      titletext.setAttribute("position","0 0 0.002");
      titlepanel.appendChild(titleback);
      titlepanel.appendChild(titletext);
      return titlepanel;
  };

    if(this.data.no){
        //json ????????????
        fetch('json/' + this.data.no + '.json')
        .then((response) => {
          if (!response.ok) {
              throw new Error();
            }
            return response.json(); 
        })
        .then((blob) => {
          console.log("load json! :" + this.data.no);
          g_ShelfLoading[this.data.no] = "loaded";
          if(!g_ShelfDatas[this.data.no]){
              g_ShelfDatas[this.data.no] = blob;
              blob.books.forEach((item)=>{
                g_BookDatas[item.isbn] = item;
              });
          }
          this.el.appendChild(addShelfTitle(blob.shelf_title));
          for(var i=1;i<=4;i++){
            this.el.appendChild(addbookbody(this.data.no+"-"+i,[0,0.41+i*0.3,0.175]));
            this.el.appendChild(addbooks(this.data.no+"-"+i,blob.back_cover_images[4-i],blob.back_cover_low_images[4-i],[0,0.41+i*0.3,0.251],(4-i)*44,this.data.no));
          }
          {
            var i=0;
            var j=0;
            while(i<6&&j<176){
              if(blob.books[j].main_cover.length>0){
                this.el.appendChild(addStackBook(this.data.no+"-h-"+i,blob.books[j].isbn,blob.books[j].main_cover,[-0.375+i*0.15,0.6,0.4],Math.floor( Math.random() * 3 )+1));
                i++;
              }
              j++;
            }

          }
        })
        .catch((reason) => {
          g_ShelfLoading[this.data.no] = "error";
          // ?????????
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
                    book.setAttribute("popup_rotation","0 0 0");
                    book.setAttribute("popup_pos",pos[0] + " " + pos[1] + " " + pos[2]+0.1);
                    book.setAttribute("height",0.2);
                    book.setAttribute("width", 0.02);
                    book.setAttribute("position",pos[0] + " " + pos[1] + " " + pos[2]);
                    book.setAttribute("opacity",0);
                    book.setAttribute("book","isbn: " + isbn);
                    book.classList.add("collidable");
                    return book;
                };
                this.el.appendChild(addbook(this.data.shelf_id +"-" +i,[i*0.02-0.45,0,0.005],g_ShelfDatas[this.data.shelf_id].books[parseInt(this.bookOffet)+i-1].isbn));
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
  AFRAME.registerComponent("clicktoremove",{
    init: function () {
      this.bInit = false;
      window.addEventListener('click',(event)=> {
        this.bInit = true;
        playBgm();
        setTimeout(function(){
          document.getElementById("top_logo").remove();
        },3000);
      });
    }

  });
  AFRAME.registerComponent("game_ctrl",{
    init: function () {
      game_state = 0;
      this.shelfnum = 66;
      this.el.addEventListener("game_start", (event) => {
        //??????
        let keys = Object.keys(g_BookDatas);
        let index = Math.floor(Math.random()*keys.length);
        console.log("target index:" + index);
        console.log("target isbn:" + keys[index]);
        this.target_book = g_BookDatas[keys[index]];
        showTargetBookDetail(this.target_book);
        //        showBookDetail(this.target_book,"0 0 0","0 0 0");
        showMessage("????????????????????????????????????");
        setTimeout(function(){showMessage("")},5000);
        game_state = 1;

      });
      
      this.el.addEventListener("book_select", (event) => {
        //??????????????????
        console.log(g_BookDatas[event.detail.isbn]);
        if(this.target_book.isbn==event.detail.isbn){
          console.log("Target Find!");
          showMessage("?????????????????????");
          playSE("sound/clear.mp3");
          setTimeout(function(){showMessage("")},3000);
        }else{
          playSE("sound/select.mp3");
        }
        showBookDetail(g_BookDatas[event.detail.isbn],event.detail.pos,event.detail.rotation);
      });

      this.el.addEventListener("answer", (event) => {
        //??????        
      });
      
      this.el.addEventListener("escape", (event) => {
        //?????????
        showMessage("?????????????????????");
        setTimeout(function(){showMessage("")},3000);
        playSE("sound/wc_clear.mp3");
      });
      
    },
    tick: function (){
      switch(game_state){
        case 0: //loading
          if(Object.keys(g_BookDatas).length>0&&Object.keys(g_ShelfLoading).length==this.shelfnum){
            console.log("loading finish!");
            this.el.dispatchEvent(new CustomEvent("game_start"));
          }
        break;
        case 1: //shutudai
        break;
        case 2: //ready
        break;
        case 3: //
        break;

        default:

        break;
      }
      


    }
  });
    
  AFRAME.registerComponent("player", {
    dependencies: ["raycaster"],
    init: function () {
        // ?????????????????????
        this.rotating = null;
        this.speeding = null;
        this.speed = 0.0;
        this.raydirection=-1;

        // ????????????????????????????????????
        this.currentPosition = { x: 0, y: 0, z: 0 };
        // ??????????????????????????????
        this.normalVec = null;
        // raycaster?????????????????????
        this.el.addEventListener("raycaster-intersection", (event) => {
//            console.log("hit");
            this.normalVec = event.detail.intersections[0].face.normal
        });
        // raycaster???????????????????????????
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
        // joystick??????
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
        // ????????????
        const rotation = this.el.getAttribute('rotation')
        if (this.rotating == 'left') {
            rotation.y+=2;
            this.el.setAttribute('rotation', rotation)
        } else if (this.rotating == 'right') {
            rotation.y-=2;
            this.el.setAttribute('rotation', rotation)
        }
        // ????????????
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

      // ??????????????????????????????????????????????????????????????????
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
      this.el.selectedShelf = null; //???????????????
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
        //?????????????????????????????????????????????????????????????????????????????????
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
        if(this.selectedObj&&this.isMouseDown&&this.selectedObj.getAttribute('isbn')){
          g_selectObject = this.selectedObj;
          let pos = this.selectedObj.object3D.getWorldPosition(new THREE.Vector3());
          let direction = this.selectedObj.object3D.getWorldDirection(new THREE.Vector3());
          let popup_pos = direction.clone().multiplyScalar(0.05).add(pos);
          document.getElementById("rig").dispatchEvent(new CustomEvent("book_select",{detail:{isbn: this.selectedObj.getAttribute('isbn'),pos: popup_pos.x + " " +popup_pos.y +" " + popup_pos.z,rotation: direction.x + " " + direction.y+ " "+ direction.z} }));
        }
        this.isMouseDown = false;
      });
      
    },
    
  });
  
  AFRAME.registerComponent('touch-checker', {
    init: function () {
      this.isFirstTrigger = true;
      this.isTriggerd = false;
      this.selectedShelf = null; //???????????????
      //Trigger Pressed
      this.el.addEventListener('triggerdown',  (event) => {
        this.isTriggerd = true;
        if(this.isFirstTrigger){
          document.getElementById("top_logo").dispatchEvent(new Event("click"));
          this.isFirstTrigger = false;
        }
      });
      //Trigger Released
      this.el.addEventListener('triggerup',  (event) => {
        if(this.selectedObj&&this.isTriggerd){
          if(this.selectedObj.getAttribute('isbn')){
            g_selectObject = this.selectedObj;
            let pos = this.selectedObj.object3D.getWorldPosition(new THREE.Vector3());
            let direction = this.selectedObj.object3D.getWorldDirection(new THREE.Vector3());
            let popup_pos = direction.clone().multiplyScalar(0.05).add(pos);
            document.getElementById("rig").dispatchEvent(new CustomEvent("book_select",{detail:{isbn: this.selectedObj.getAttribute('isbn'),pos: popup_pos.x + " " +popup_pos.y +" " + popup_pos.z,rotation: direction.x + " " + direction.y+ " "+ direction.z} }));
          }else{
//            this.selectedObj.dispatchEvent(new Event("click"));
          }

        }
        this.isTriggerd = false;
      });
      this.el.addEventListener('raycaster-intersection', (event) => {
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
                this.isTriggerd = false;
                return;
            }
        }
      });

      //????????????????????????????????????????????????????????????
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

