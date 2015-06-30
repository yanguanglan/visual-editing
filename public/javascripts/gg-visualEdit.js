//动画服务
angular.module('drag', []).factory('animatePrivoder', function() {
	return {
		animate: function(self) {
			var animateName = '',
				input = $('<div class="setNumber">持续: <input id="duration" type="text" value="1.0"/></div><div class="setNumber">延时: <input id="delay" type="text" value="1.0"/></div>'),
				ul = $('<ul><li class="noeffect">无效果</li><li class="bounceInDown">淡入</li><li class="fadeIn">弹性放大</li><li class="fadeOut">弹性缩小</li><li class="zoomIn">放大</li></ul>'),
				animatable = self.find('.animatable');

			$('.animate').html('').append(input).append(ul);
			//点击切换动画
			ul.on('mousedown', 'li', function(e) {
				e.stopPropagation();    

				var duration = $('#duration').val() || 1,
					delay = $('#delay').val() || 1;
						
				//秒切动画，去掉上一次的动画
				animatable.removeClass(animateName + ' animated');

				animateName = $(e.target).attr('class');
				animatable.css({
						'-webkit-animation-duration': duration + 's',
						'-webkit-animation-delay': delay + 's',
						'-moz-animation-duration': duration + 's',
						'-moz-animation-delay': delay + 's',
						'-animation-duration': duration + 's',
						'-animation-delay': delay + 's'
				});
				animatable.addClass(animateName + ' animated');                                 
			});
			self.on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
				animatable.removeClass('animated');
			}); 
		}
	}
})
//剪切图片服务,使用jcrop插件
.factory('jcropPrivoder', function() {
	return {
		//lastC保存的上一次的状态
		jcrop: function(self, lastC) {
			var jcrop = $('<img id="jcrop" src="">'),
				img = self.find('img'),
				imgWidth = img.width(),
				imgHeight = img.height();

			jcrop.attr('src', img.attr('src'));
			var r = imgWidth / imgHeight,
				maxHeight = $('.img-Jcrop').height(),
				maxWidth = $('.img-Jcrop').width();

			r <= 1? jcrop.height(maxHeight).width(maxHeight * r): jcrop.height(maxWidth / r).width(maxWidth);

			$('.img-Jcrop').html(jcrop);

			var jcrop_api = $.Jcrop(jcrop, {
				onChange: updatePreview,
				onSelect: updatePreview,
				setSelect: [ lastC.c.x||0, lastC.c.y||0, lastC.c.x2||300, lastC.c.y2||300 ]
			});
															
			function updatePreview(c) {
				//此处必须为图片当前的宽度，因为有个缩放倍数的影响
				var img = self.find('img'),
					imgWidth = img.width(),
					imgHeight = img.height();

				var tmpDivWidth = c.w,
					tmpDivHeight = c.h,
					tmpImgWidth = jcrop.width(),
					tmpImgHeight = jcrop.height();

				//self不能隐藏掉旋转按钮
				self.width(tmpDivWidth / tmpImgWidth * imgWidth)
					.height(tmpDivHeight / tmpImgHeight * imgHeight)
					.find('.edit-img')//overflow：hidden
					.width(tmpDivWidth / tmpImgWidth * imgWidth)
					.height(tmpDivHeight / tmpImgHeight * imgHeight);

				img.css({'left': -c.x / tmpImgHeight * imgHeight + 'px', 'top': -c.y / tmpImgWidth * imgWidth + 'px'});

				lastC.c = c;

				self.find('.bar-rotate').css({'left': self.width()/2 - self.find('.bar-rotate').width()/2 + 'px'});                    
			}
		}
	}
})
//获取层级服务
.factory('getzIndexPrivoder', function() {
	return {
		//lastC保存的上一次的状态
		max: function() {
			var draggable = $('.draggable'),
				max = -100000;
			$.each(draggable, function() {
				var self = $(this),
					num = self.css('zIndex');
				max = max > num? max: num;
			});
			return max;
		},
		min: function() {
			var draggable = $('.draggable'),
				min = 100000;
			$.each(draggable, function() {
				var self = $(this),
					num = self.css('zIndex');
				min = min < num? min: num;
			});
			return min;
		}
	}
})
//拖动指令,要考虑旋转之后的状态
.directive('ggDrag', function() {
	return {
		restrict: "A",
		link: function(a, b) {
			var c, d = 0,
				e = 0,
				f = {},
				g = {},
				h = {},
				i = {},
				j = $(b),//旋转层
				k = j.parent(),//最外层
				l = {
					width: k.width(),
					height: k.height()
				},
				m = new Hammer(j.get(0));

			m.get("pan").set({
				threshold: 0
			}), m.on("panstart", function(a) {
				if (a.preventDefault(), a.srcEvent.preventDefault(), !j.hasClass("no-drag")) {
					j.css({"opacity": .35}), $("body").css({
						"user-select": "none",
						cursor: "default"
					}), c = k.offset();
				
					var b = {
						width: j.width(),
						height: j.height()
					};
					 d = j.get(0).style.transform || j.get(0).style.webkitTransform || 0, d = d && d.replace("rotateZ(", "").replace("deg)", ""), d = d && parseFloat(d), d >= 90 && 180 > d && (d = 180 - d), d >= 180 && 270 > d && (d = 270 - d), d >= 270 && 360 > d && (d = 360 - d), e = 2 * d * Math.PI / 360;
					//拖拽之前，计算一次旋转之后（可能没有旋转）的长宽
					var m = 0 == e ? b.height : (b.width / 2 + b.height / 2 / Math.tan(e)) * Math.sin(e) * 2,
						n = 0 == e ? b.width : (b.width / 2 + b.height / 2 / Math.tan(Math.PI / 2 - e)) * Math.sin(Math.PI / 2 - e) * 2;
					i = {
						height: m,
						width: n
					}, h = j.offset();
					var o = j.position();
						
					g = a.center;//旋转层中心相对视窗的x,y坐标
						//拖拽之前，计算边界和中心相对旋转层的x,y坐标
					g.top = g.y - o.top, g.bottom = g.y + l.height - (o.top + i.height), g.left = g.x - o.left, g.right = g.x + l.width - (o.left + i.width), f.x = a.center.x - (parseFloat(j.css("left")) + c.left), f.y = a.center.y - (parseFloat(j.css("top")) + c.top)
				}
				}), m.on("panmove", function(a) {//a能得到旋转层当前位置的中心相对视窗的x,y坐标

					//  a.preventDefault();
					if(j.hasClass("no-drag"))return;

					//阻止图片的默认拖动事件
					"img" == a.target.tagName.toLowerCase() && (a.target.ondragstart = function() {
						return false;
					});

					j.hasClass("no-drag") || (j.css("top", a.center.y - c.top - f.y), j.css("left", a.center.x - c.left - f.x))
				}), m.on("panend", function(b) {
				j.css({"opacity": 1}), $("body").css({
					"user-select": "initial",
					cursor: "default"
				});
				var c = (j.position(), {
					top: j.css("top"),
					left: j.css("left")
				});
			})
		}
	}
})
//旋转指令
.directive('ggRotate', function() {
	return {
		restrict : 'A',  
		link : function(scope, element) {
			var $this = element,
			$rotate = $('<div class="bar bar-rotate bar-radius">');
			$rotate.hide();

			var e, f = {},
			hammer = new Hammer($rotate.get(0));

			$this.append($rotate).append('<div class="bar bar-line">');

			hammer.on('panstart', function(a) { 
				$this.addClass('no-drag');
		
				$('body').css({
					'user-select': 'none',
					cursor: 'default'
				});
				var $container = $this.parent();

				f = {
					x: parseFloat($this.css('left')) + $container.offset().left + $this.width() / 2,
					y: parseFloat($this.css('top')) + $container.offset().top + $this.height() / 2
				}
			});

			hammer.on('panmove', function(a) {
				var b = a.center,
				d = b.x - f.x,
				g = b.y - f.y,
				h = Math.abs(d / g);

				e = Math.atan(h) / (2 * Math.PI) * 360, d > 0 && 0 > g ? e = 360 + e : d > 0 && g > 0 ? e = 180 - e : 0 > d && g > 0 ? e = 180 + e : 0 > d && 0 > g && (e = 360 - e), e > 360 && (e -= 360), $this.css({
					transform: 'rotateZ(' + e + 'deg)'
				})
			});

			hammer.on('panend', function() {
				$this.removeClass("no-drag");
				$("body").css({
					"user-select": "initial",
					cursor: "default"
				});
				//  scope.updateCompAngle($this.attr("id"), e);
				//  scope.$broadcast("updateTransform", e);
			});
		}
	};
})
//缩放指令
.directive('ggResize', ['jcropPrivoder', 'animatePrivoder', function(jcropPrivoder, animatePrivoder) {
	return {
		restrict: 'A',
		link: function(scope, element) {
			var self = element,
				jqimg = self.find('img'),
				allDraggable = self.parent().find('.draggable'),
				image = new Image();
	
			var lastC = {c:{}};

			//初始化旋转按钮的位置            
			self.find('.bar-rotate').css({'left': self.width()/2 - self.find('.bar-rotate').width()/2 + 'px'});

			//初始化图片的位置大小
			if('4' == self.attr('ctype').charAt(0)) {
				image.src = jqimg.attr('src');
				image.onload = function() {                        
					var r = image.width / image.height,
						W = 320,//最大宽度
						H = W / r;

					jqimg.height(H).width(W);

					self.height(H).width(W).find('.edit-img').height(H).width(W);                 
				}
			}
				
			self.on('mousedown', function(e) {   
				e.stopPropagation();      
				//设置旋转按钮的位置 
				self.find('.bar-rotate').css({'left': self.width()/2 - self.find('.bar-rotate').width()/2 + 'px'});
				allDraggable
					.find('.ui-resizable-handle').hide()
					.end()
					.find('.bar-rotate').hide();

				var oh, ow, oimgw, oimgh, left, top;
				var aspectRatio = '4' == self.attr('ctype').charAt(0)? self.width() / self.height(): 0;

				var options = {
					disabled: false, 
					handles: 'all',
					aspectRatio: aspectRatio,
					start: function() {
						self.addClass('no-drag');
						if('4' == self.attr('ctype').charAt(0)) {
							ow = self.width();
							oh = self.height();
							oimgw = jqimg.width();
							oimgh = jqimg.height();
							left = jqimg.css('left').split('px')[0];
							top = jqimg.css('top').split('px')[0];
						}
					},
					resize: function(a, c) {                                
						self.find('.bar-rotate').css({'left': self.width()/2 - self.find('.bar-rotate').width()/2 + 'px'});

						if('4' == self.attr('ctype').charAt(0)) {
							self
								.find('.edit-img')
								.width(self.width())
								.height(self.height());

							jqimg
								.width(self.width() / ow * oimgw)
								.height(self.height() / oh * oimgh)
								.css({'left': self.width() / ow * left + 'px', 'top': self.width() / ow * top + 'px'});
						}
					},
					stop: function() {
						self.removeClass('no-drag');
					}
				};

				//记录右键菜单对应的draggable    
		//    that = self.closest('.draggable');
				$('.right-menu').hide();
				//绑定右键事件
				self.closest('.draggable').on('contextmenu', function(e) {
					e.preventDefault();

					var o = {
						x: e.pageX - $('.middle').css('marginLeft').split('px')[0],
						y: e.pageY - $('.middle').css('marginTop').split('px')[0]
					}; 
					
					$('.right-menu').css({'left':o.x+'px','top':o.y+'px'}).show();
				});
				
				self.resizable(options).find('.ui-resizable-handle').show()
					.end()
					.find('.bar-rotate').show();

				//截图                        
				if('4' == self.attr('ctype').charAt(0)) {                           
					jcropPrivoder.jcrop(self, lastC);
				} else {
					$('.img-Jcrop').html('');
				}

				//动画
				animatePrivoder.animate(self);

				//当前右键菜单对应的draggable
				scope.$emit('set-That', self);
			});
		}
	}
}]).directive('ggEdit', function() {
	return {
		restrict: 'A',
		link: function(scope, element) {                    
			var allDraggable = element.parent().find('.draggable');

			element.find('.edit-text').css({'position':'relative','width':'100%','height':'100%'});

			scope.editWord = function(e) {
				if('2' == $(e.currentTarget).attr('ctype').charAt(0)) {
					var target = $(e.target);
					
					target
						.closest('.draggable')
						.addClass('no-drag')
						.find('.edit-text')
						.wysiwyg();

					//wysiwyg会自动设置当前对象的contenteditable属性为true
					window.prettyPrint && prettyPrint();
				} 
			};
		}
	}
}).directive('ggMiddle', function() {
	return {
		restrict: 'A',
		link: function(scope, element) {                  
			var that;

			scope.midClick = function(e) {
				var allDraggable = element.find('.draggable');
				e.stopPropagation();

				var self = $(e.target);
				
				allDraggable.removeClass('no-drag')
					.find('.edit-text').attr('contenteditable', false)
					.end()
					.find('.ui-resizable-handle').hide()
					.end()
					.find('.bar-rotate').hide();                            

				if(self.closest('.draggable').hasClass('draggable')) {
					self.closest('.draggable')
						.find('.ui-resizable-handle').show()
						.end()
						.find('.bar-rotate').show();                            
				} else {
					$('.img-Jcrop').html('');
				}

				if(self.closest('.right-menu').hasClass('right-menu')) {
					//触发右键菜单
					scope.$emit('to-rightMenu', self);
				}

				$('.right-menu').hide();
			};
		}
	};
}).controller('containerController', ['$scope', '$compile', 'getzIndexPrivoder', function($scope, $compile, getzIndexPrivoder) {    
	var that;   

	//右键菜单处理
	$scope.$on('to-rightMenu', function(e, self) {
		if(self.hasClass('delete')) {
			that.remove();
		} else if(self.hasClass('stick')) {
			var num = parseInt(getzIndexPrivoder.max());
			that.css({'zIndex': num + 1});
		} else if(self.hasClass('bottom')) {
			var num = parseInt(getzIndexPrivoder.min());
			that.css({'zIndex': num - 1});
		} else if(self.hasClass('upfloor')) {
			var num = parseInt(that.css('zIndex'));
			that.css({'zIndex': num + 1});
		} else if(self.hasClass('downfloor')) {
			var num = parseInt(that.css('zIndex'));
			that.css({'zIndex': num - 1});
		} else if(self.hasClass('copy')) {
			var draggable = $('.draggable'),
				text = '';
			$.each(draggable, function() {
				var self = $(this);

				if(self.data('no') == that.data('no')) {
					//outerHTML有些浏览器不兼容
					text = $(self[0].outerHTML);
					return false;
				}
			});
			
			//修改每个可移动单位的编号,当前唯一值
			text.attr('data-no', 65);
			$('.container').append(text);
			$compile(text)($scope);
		}
	});
	//给右键菜单设置对应对象
	$scope.$on('set-That', function(e, data) {
		that = data;
	});
}]).controller('headController', function($scope, $http, $compile) {
	$scope.saveJson = function() {
		var _json = {elements:[]};

		$('.draggable').each(function() {
			var self = $(this),
				animatableClass = self.find('.animatable').attr('class').split('animatable')[1].replace(/(^\s*)|(\s*$)/g, "") || '',
				duration = 0,
				delay = 0;

			var arr = self.find('.animatable').attr('style').split(';');

			$.each(arr, function(i) {
				duration = /duration/.test(arr[i])? arr[i].split(':')[1].replace(/(^\s*)|(\s*$)/g, ""): duration;
				delay = /delay/.test(arr[i])? arr[i].split(':')[1].replace(/(^\s*)|(\s*$)/g, ""): delay;
			});

			var obj = {
				"id":2,
				"pageId":36846632,
				"sceneId":2535545,
				"css":{
					"zIndex":self.css('zIndex'),
					"left":self.css('left'),
					"top":self.css('top'),
					"width":self.width() + 'px',
					"height":self.height()  + 'px'
				},
				"animatable":{
					"class":animatableClass,
					"anim":{
						"type":1,
						"direction":2,
						"duration":duration,
						"delay":delay
					}                
				}
			};

			if('4' === self.attr('ctype').charAt()) {
				obj.type = 4;
				obj.imgStyle = {
					"width":self.find('img').width() + 'px',
					"height":self.find('img').height() + 'px',
					"left":self.find('img').css('left'),
					"top":self.find('img').css('top')
				};
				obj.imgSrc = self.find('img').attr('src');
			} else {
				obj.type = 2;                           
				obj.content = self.find('.animatable').html();
			}
			_json.elements.push(obj);
		});

		$http({
			method: 'POST',
			url: 'users',
			params: _json
		});
		console.log(JSON.stringify(_json));
	};

	$scope.viewTest = function() {
		window.location.href = 'html/test.html'; 
	};

	$scope.addWordBox = function() {
		var text = $('<div gg-rotate gg-resize gg-drag gg-edit ctype="2" ng-dblclick="editWord($event)" class="draggable"><div class="edit animatable" style=""><div class="text preventDom edit-text" style="word-wrap: break-word;"><div style="text-align: center;">请修改文本</div></div></div></div>');
		$('.container').append(text);
		$compile(text)($scope);
	};

	$scope.addPicBox = function() {
		var text = $('<div gg-rotate gg-resize gg-drag gg-edit class="draggable" ctype="4" style="top:50px"><div class="edit-img animatable" style=""><img class="element comp_image editable-image" src="/images/head.png" ></div></div>');
		$('.container').append(text);
		$compile(text)($scope);
	};
}).controller('uploadPicController', function($scope) {
	$scope.selectPic = function() {
		$('#file').click();
	}
});