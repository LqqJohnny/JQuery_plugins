(function(){
	//  全局变量
	var originImageData=""; 
	var resultData="";
	var startX,startY;
	var canvasH,canvasW;
	$.fn.cropImage  = function(options){
		// 私有变量
		var defaultOps  ={
			form:$(this),
			imgResult:"#cropResult",
			chooseImgInput:"#chooseImg",
			editImgcontainer:"#editImgcontainer",
			startEditBtn:"#startEdit",
			getData:function(data){
				console.log("截图结果为："+data)
			}
		}
		var ops=$.extend({},defaultOps,options) 
		//  选择文件 
		$(ops.chooseImgInput).change(function(){
            var file=this.files[0];
            var reader=new FileReader();
            reader.onload=function(){ 
                // 通过 reader.result 来访问生成的 DataURL
                var url=reader.result;
                originImageData=url;
            	var image=new Image();
	        	image.src=url;
	        	$(ops.editImgcontainer+" img").remove();
	        	$(ops.editImgcontainer).append(image).css("display","inline-block");
            };       
            reader.readAsDataURL(file);  //  直接装换成了  base64 图片 
            // 给编辑容器 插入 内容 
            $(ops.editImgcontainer).html(
            	'<div class="mask" style="display:none;background-color: #000;position: absolute;opacity: 0.4;left:0;right:0;top:0;bottom: 0;"></div>'+
				'<div class="edit" id="startEdit">编辑</div>'+
				'<div class="imgclipArea" style="position:absolute;z-index:10;border:1px dashed #fff;cursor:all-scroll;"></div>'
				)
            
            //  触发 loadedImg 函数 
            ops.loadedImg();
       });
       // 点击按钮开始编辑 
       $(ops.editImgcontainer).on("click","#startEdit",function(){
       		startEdit();
       })
       
		//  按下
        $(ops.editImgcontainer).on("mousedown",".mask",function(event){
			//	把之前选的清除掉
			clearEditArea();
        	startX=event.pageX-$(ops.editImgcontainer).offset().left;
        	startY=event.pageY-$(ops.editImgcontainer).offset().top;
        	canvasW=0;
        	canvasH=0;

        	$(ops.editImgcontainer+" .imgclipArea").css({
        		top: startY+"px",
        		left: startX+"px",
        		background:"url("+originImageData+")",
        		backgroundPosition:"-"+startX+"px -"+startY+"px"  
        	})
        	//  拖动
        	 $(ops.editImgcontainer).on("mousemove",".mask,.imgclipArea",function(e){
        	 	var w = Math.abs(e.pageX-startX - $(ops.editImgcontainer).offset().left);
        	 	var h = Math.abs(e.pageY-startY - $(ops.editImgcontainer).offset().top);

        	 	// 限制最大size
        	 	if(ops.maxSize && ops.maxSize>0){
        			w = w>ops.maxSize?ops.maxSize:w;
        			h = h>ops.maxSize?ops.maxSize:h;
        		}
        	 	canvasW =w;
        	 	canvasH = h;
        	 	
        	 	var sx,sy ;
        	 	sx = e.pageX-$(ops.editImgcontainer).offset().left>startX?startX:e.pageX-$(ops.editImgcontainer).offset().left;
        	 	sy = e.pageY-$(ops.editImgcontainer).offset().top>startY?startY:e.pageY-$(ops.editImgcontainer).offset().top;

        	 	updateclip(h,w,sx,sy);
        	 })

        //  松开
          $(ops.editImgcontainer).on("mouseup",".mask",function(e){
        	 	var endX= e.pageX-$(ops.editImgcontainer).offset().left;
        	 	var endY= e.pageY-$(ops.editImgcontainer).offset().top;
        	 	
        	 	// 取消 mousemove 事件 
        	 	 $(ops.editImgcontainer).unbind("mousemove");
        	 	
        	 	var w = Math.abs(endX-startX);
        	 	var h = Math.abs(endY-startY);
        	 	// 限制最大size
        	 	
        	 	if(ops.maxSize && ops.maxSize>0){
        			w = w>ops.maxSize?ops.maxSize:w;
        			h = h>ops.maxSize?ops.maxSize:h;
        		}

        	 	canvasDrawImg(startX,startY,w,h);
        	 })
        })
		
		//  拖动 选区  
		$(ops.editImgcontainer).on("mousedown",".imgclipArea",function(downevent){
			var dragstartX=downevent.clientX;
        	var dragstartY=downevent.clientY;
        	var StartPos= $(this).position();
        	$(ops.editImgcontainer).on("mousemove",".imgclipArea",function(moveevent){
        		
        		var left= moveevent.clientX;
        	 	var top= moveevent.clientY;
        	 	var  tempTop= StartPos.top+top-dragstartY;
        	 	var  tempLeft= StartPos.left+left-dragstartX;
        	 	if(tempTop<0){tempTop=0}
        	 	if(tempLeft<0){tempLeft=0}
        	 	if(tempTop+canvasH>$(ops.editImgcontainer).height()){tempTop=$(ops.editImgcontainer).height()-canvasH}
        	 	if(tempLeft+canvasW>$(ops.editImgcontainer).width()){tempLeft=$(ops.editImgcontainer).width()-canvasW}
        	 	
        	 	$(this).css({
        	 		top:tempTop+"px",
        	 		left:tempLeft+"px",
        	 		backgroundPosition:"-"+tempLeft+"px -"+tempTop+"px"
        	 	});
        	 	
        	})
        	   //  松开
	        $(ops.editImgcontainer).on("mouseup",".imgclipArea",function(e){
	        	 	var endX= e.pageX;
	        	 	var endY= e.pageY;
	        	 	// 更新结果图
	        	 	var pos  = $(this).position();
        	 		canvasDrawImg(pos.left,pos.top,canvasW,canvasH);
	        	 	// 取消 mousemove 事件 
	        	 	 $(ops.editImgcontainer).unbind("mousemove");
	        	 	
	        	 })
        	
		})
		
		
		//  方法 
		function clearEditArea(){
			var area = $(ops.editImgcontainer+" .imgclipArea");
			area.css({
				height:0,
				width:0,
				top:0,
				left:0,
				background:"none"
			})
		}
		
		function startEdit(){
			$(ops.editImgcontainer).css('cursor', 'crosshair');
        	$(ops.editImgcontainer+" .mask").show();
        	$(ops.editImgcontainer+" .edit").hide();
        }
		//  选区时更新 
		function updateclip(h,w,sx,sy){
			
        	$(ops.editImgcontainer+" .imgclipArea").css({
        		height:Math.abs(h),
        		width:Math.abs(w),
        		top: sy,
        		left: sx,
        		backgroundPosition:"-"+sx+"px -"+sy+"px"
        	})
        	

        }
		// canvas  画结果图
        function canvasDrawImg(sx,sy,w,h){
        	// 先清除画布 
        	var imgData =  $(ops.editImgcontainer+" img").get(0); // 将img元素 画到canvas上
        	var canvas = $(ops.imgResult).get(0);
        	var ctx = canvas.getContext("2d");
        	ctx.clearRect(0,0,canvas.width,canvas.height); 

        	canvas.width=w;
        	canvas.height=h;
        	ctx.drawImage(imgData,sx,sy,w,h,0,0,w,h);
        	getResImgData();
        }
        function getResImgData(){
        	var data =	$(ops.imgResult).get(0).toDataURL();
        	resultData=data;
        	if($(ops.form).find('input[name=image]').length==0){
        		$(ops.form).append("<input type='text' id='cropImg' name='image' value='"+data+"'/>")
        	}else{
        		$(ops.form).find('input[name=image]').val(data);
        	}
        }
	}
})(jQuery)
