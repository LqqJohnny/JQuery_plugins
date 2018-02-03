 $('#chooseImg').change(function(){
            var file=this.files[0];
            var reader=new FileReader();
            reader.onload=function(){ 
                // 通过 reader.result 来访问生成的 DataURL
                var url=reader.result;
               setImageURL(url);
               
            };       
            reader.readAsDataURL(file);  //  直接装换成了  base64 图片 
        });
        
//      $("#clipImg")
        function setImageURL(url){
        	var image=new Image();
        	image.src=url;
        	$("#imgshowPot img").remove();
        	$("#imgshowPot").append(image).css("display","inline-block");
        	
        }
        function startEdit(){
        	$("#imgshowPot").addClass("gray")
        	$("#imgshowPot .edit").hide();
        }
        //  按下
        $("#imgshowPot").on("mousedown",".mask",function(event){
        	//  开始选区了
        	console.log(event)
        	var startX=event.offsetX;
        	var startY=event.offsetY;
        	
			$("#imgshowPot .imgclipArea").remove();
        	$("#imgshowPot").append("<div class='imgclipArea' style='position:absolute;z-index:10;'></div>");
        	$("#imgshowPot .imgclipArea").css({
        		top:startY+"px",
        		left:startX+"px",
        		background:"url("+$("#imgshowPot img").attr("src")+")",
        		backgroundPosition:"-"+startX+"px -"+startY+"px"  
        	})
        	 $("#imgshowPot").on("mousemove",".mask",function(e){
        	 	var w= e.offsetX-startX;
        	 	var h= e.offsetY-startY;
        	 	updateclip(h,w);
        	 })
        	 
        	   //  松开
          $("#imgshowPot").on("mouseup",".mask",function(e){
        	 	var endX= e.offsetX;
        	 	var endY= e.offsetY;
        	 	// 取消 mousemove 事件 
        	 	 $("#imgshowPot").unbind("mousemove");
        	 	canvasDrawImg(startX,startY,endX-startX,endY-startY);
        	 })
        })
        
      
        function updateclip(h,w){
        	$("#imgshowPot .imgclipArea").css({
        		height:h,
        		width:w
        	})
        }
        function canvasDrawImg(sx,sy,w,h){
        	// 先清除画布 
        	
        	var imgData =  $("#imgshowPot img").get(0);
        	var canvas = document.getElementById("clipImg");
        	var ctx = canvas.getContext("2d");
        	 ctx.clearRect(0,0,canvas.width,canvas.height); 
        	console.log(sx,sy,w,h);
        	canvas.width=w;
        	canvas.height=h;
        	ctx.drawImage(imgData,sx,sy,w,h,0,0,w,h);
        }
        $("#submit").click(function(){
        	var canvas = document.getElementById("clipImg");
        	$("#imgForm .file").val(canvas.toDataURL());
        	$("#imgForm").submit();
        })