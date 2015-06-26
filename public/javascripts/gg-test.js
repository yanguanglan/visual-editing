angular.module('drag', []).directive('ggDrag', function() {
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

					//	a.preventDefault();
						if(j.hasClass("no-drag"))return;

						//阻止图片的默认拖动事件
						"img" == a.target.tagName.toLowerCase() && (a.target.ondragstart = function() {
						 	return false;
						});

						j.hasClass("no-drag") || (a.center.y >= g.top && a.center.y <= g.bottom && j.css("top", a.center.y - c.top - f.y), a.center.x >= g.left && a.center.x <= g.right && j.css("left", a.center.x - c.left - f.x))
					}), m.on("panend", function(b) {
						j.css({"opacity": 1, "border":"0"}), $("body").css({
							"user-select": "initial",
							cursor: "default"
						});
						var c = (j.position(), {
							top: j.css("top"),
							left: j.css("left")
						});
						// a.updateCompPosition(j.attr("id"), c), $(b.srcEvent.target).one("click", function(a) {
						// 	return a.stopImmediatePropagation(), a.stopPropagation(), a.preventDefault(), !1
						// })
					})
				}
			}
		}).directive('ggRotate', function() {
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
					//	scope.updateCompAngle($this.attr("id"), e);
						scope.$broadcast("updateTransform", e);
					});
			    }
			};
    	}).directive('ggResize', function() {
			return {
				restrict: 'A',
				link: function(scope, element) {
					var $this = element,
						$container = $this.parent(),
						$allDraggable = $container.find('.draggable'),
						container = '#' + $container.attr('id'),
						$img = $this.find('img'),
						image = new Image();

				/**
				 *	初始化旋转按钮的位置和图片的位置大小
				 */
					var w = $this.find('.bar-rotate').width();
			        $this.find('.bar-rotate').css({'left': $this.width()/2-w/2 + 'px'});
					
				//	image.src = 'http://res.eqxiu.com/group1/M00/BB/5E/yq0KA1Ru0U-AdRYLAAJEctNDtt4127.png';
					image.src = $img.attr('src');
					image.onload = function() {						
				        var	r = image.width / image.height,
				        	W = 320,//最大宽度
				        	H = W / r;

					 	$img.height(H).css({'margin-top':-H/2, 'margin-left':-W/2});
						$this.height(H).width(W);					
					}
				
					$this.on('mousedown', function(e) {
					
						//设置相对div居中
			        	$this.find('.bar-rotate').css({'left': $this.width()/2 - $this.find('.bar-rotate').width()/2 + 'px'});

		            	//销毁所有dom缩放事件
		            	$allDraggable
		            		.resizable({containment:container, disabled:true, handles: "all"})
		            		.addClass('ui-resizable-disabled')
		            		.find('.bar-rotate').hide();

		            	//给当前dom绑定缩放事件
		            	$this
		            		.resizable({
		            			containment:container,
		            			disabled:false, 
		            			handles: "all",

		            			resize: function(a, c) {
									if ("4" == $(c.element).attr("ctype").charAt(0)) {										
										var r = $img.width() / $img.height();

										$img.height(c.size.height).css({"margin-top":-c.size.height/2, "margin-left":-c.size.height*r/2});
									} else {
										//c.element.find(".element").width(c.size.width), c.element.find(".element").height(c.size.height);
									} 
		            			}
		            		})
		            		.find('.bar-rotate').show();

		            	//当点击其他的draggable，就还原所有的draggable
						if($this.hasClass('draggable') && !$this.hasClass('editable')) {
							$allDraggable.removeClass("no-drag").find(".edit-text").attr('contenteditable', false);
						}

						var resizeHandle = $this.find('.ui-resizable-handle'),
							corder = [];

						corder.push(new Hammer(resizeHandle.get(0)));
			            corder.push(new Hammer(resizeHandle.get(1)));
			            corder.push(new Hammer(resizeHandle.get(2)));
			            corder.push(new Hammer(resizeHandle.get(3)));
			            corder.push(new Hammer(resizeHandle.get(4)));
			            corder.push(new Hammer(resizeHandle.get(5)));
			            corder.push(new Hammer(resizeHandle.get(6)));
			            corder.push(new Hammer(resizeHandle.get(7)));
			            $.each(corder, function() {
			            	this.on('panmove', function(a) {
								$this.addClass('no-drag');	
								$this.find('.bar-rotate').css({'left': $this.width()/2 - $this.find('.bar-rotate').width()/2 + 'px'});		
							}).on('panend', function() {
								$this.removeClass("no-drag");							
							});
			            });
		            });
				}
			}
		}).directive('ggEdit', function() {
			return {
				restrict: 'A',
				link: function(scope, element) {
					var	$this = element,	
			    		$container = $this.parent(),		    		
			    		$allDraggable = $container.find('.draggable'),
			    		container = '#' + $container.attr('id');

			    	$this.find('.edit-text').css({'position':'relative','width':'100%','height':'100%'});
					//点击document执行click
			    	$(container).on('click', function(e) {
			    		var $target = $(e.target);

			    		//重置拖动事件
			    		var draggable = $target.closest(".draggable");

			    		//点击的是正在编辑的那个div或者是img，就不执行下面的还原操作
			    		if(draggable.hasClass('editable') || "img" == e.target.tagName.toLowerCase()) {
			    			return;
			    		}

			    		//判断点击文本及缩放手柄执行以下代码
			    		if(!$target.hasClass("preventDom") && $target.hasClass("draggable")!=true && $target.hasClass("ui-resizable-handle")!=true) {
			    			$('.bar-rotate').hide();
			    			$allDraggable
			            	    .resizable({containment:container, disabled:true, handles: "all"})
			            	    .removeClass("no-drag")
			            	    .addClass("ui-resizable-disabled")
			            	    .find(".edit-text").attr('contenteditable', false);
			            	
			    		}
			    	});

					element.on('dblclick',  function(e) {
						if($(e.target).hasClass('edit-text')) {
							var $this = $(this);
		    				$allDraggable.removeClass('editable');

		    				$this.closest(".draggable")
		    					.addClass("no-drag editable");

		    				//wysiwyg会自动设置当前对象的contenteditable属性为true
		    				$this.wysiwyg();
		    				$this.focus();
		    				window.prettyPrint && prettyPrint();
						} else {
							
						}
	    				
	    			});
				}
			}
		});