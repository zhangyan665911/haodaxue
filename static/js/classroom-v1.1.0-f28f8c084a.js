window.ztui = window.ztui || {};
/**
 * 获取一组随机数
 * @param options {number,array}
 * length 随机数组长度
 * range  随机数范围 [min,max],
 * exclude排除项
 * Math.random() * (max-min) + min
 */
ztui.getRandoms = function (options) {
    var opt = $.extend({
        length: 3,
        range: [0, 10],
        exclude:[],
    }, options);
    var result = [];
    for (var i = 0; i < opt.length; i++) {
        var num = Math.round(Math.random() * (opt.range[1] - opt.range[0])) + opt.range[0];
        if (~result.indexOf(num)||~opt.exclude.indexOf(num)) {
            i--;
        } else {
            result.push(num);
        }
    }
    return result;
};
/**
 * time：剩余时间-（秒）
 * step：逐步回调函数
 * end： 结束回调函数
 * joinStr:['时','分','秒']
 */
ztui.countdown = function (options) {
    var timer = parseInt(options.time);
    if (options.joinStr == null || options.joinStr.length < 3) {
        options.joinStr = ['小时', '分钟', '秒']
    }
    loop();
    var countDownInterval = setInterval(loop, 1000);
    function loop(){
        if (timer === 0) { //时间结束
            clearInterval(countDownInterval);
            options.end && options.end();
        }
        var timerStr = "",
            h = Math.floor(timer / 3600),
            m = Math.floor(timer / 60 % 60),
            s = Math.floor(timer % 60),
            result = [h, m, s];

        timer -= 1;
        if (h < 10) {
            h = '0' + h;
        }
        timerStr = h + options.joinStr[0];
        if (m < 10) {
            m = '0' + m;
        }
        timerStr += (m + options.joinStr[1]);
        if (s < 10) {
            s = '0' + s;
        }
        timerStr += (s + options.joinStr[2]);
        options.step && options.step(timerStr, result);
    }
    return countDownInterval;
};
ztui.countup = function (options) {
    var timer = parseInt(options.time);
    if (options.joinStr == null || options.joinStr.length < 3) {
        options.joinStr = ['小时', '分钟', '秒']
    }
    loop();
    var countUpInterval = setInterval(loop, 1000);
    function loop(){
        var timerStr = "",
            h = Math.floor(timer / 3600),
            m = Math.floor(timer / 60 % 60),
            s = Math.floor(timer % 60),
            result = [h, m, s];

        timer += 1;
        if (h < 10) {
            h = '0' + h;
        }
        timerStr = h + options.joinStr[0];

        if (m < 10) {
            m = '0' + m;
        }
        timerStr += (m + options.joinStr[1]);
        if (s < 10) {
            s = '0' + s;
        }
        timerStr += (s + options.joinStr[2]);
        options.step && options.step(timerStr, result);
    }
    return countUpInterval;
}
ztui.simpleSlider=function(options){
    var opt=$.extend({
        target:".scroll-pages:eq(0)",
        pageWrap:".pages-wrap",
        pagesInner:".page-inner",
        actPrev:".act-prev",
        actNext:".act-next",
        items:".pages-item",
        itemWidth:44,
        showSize:1,
        current:1,
        onChange:null,
    },options);
    var
        scrollPages=$(opt.target).get(0),
        current=opt.current,
        pagesWrap=$(opt.pageWrap,scrollPages),
        pagesInner=$(opt.pagesInner,scrollPages),
        actPrev=$(opt.actPrev,scrollPages),
        actNext=$(opt.actNext,scrollPages),
        items=$(opt.items,pagesWrap),
        size=items.length,
        showSize=opt.showSize,
        itemWidth=opt.itemWidth;
    if(size<=0){
        return;
    }
    var lastSize=size%showSize,
        pages=lastSize===0?size/showSize:Math.floor(size/showSize)+1;
    if(items.width()<1){
        console.log("隐藏的元素无法获取尺寸，请给出当前分页项宽度,当前默认"+itemWidth)
    }else{
        itemWidth=items.outerWidth();
    }
    if(current>1){
        updatePosition();
    }
    if(size<showSize){
        pagesWrap.addClass("no-pages");
        pagesWrap.css("width",size*itemWidth);
    }
    updateAct();
    actPrev.on("click",function(){
        current--;
        pagesInner.css({
            left:-(current-1)*showSize*itemWidth
        });
        updatePosition();
    });
    actNext.on("click",function(){
        current++;
        updatePosition();
    });

    function updatePosition(){
        var len=(current-1)*showSize*itemWidth;
        if(current>1&&current===pages&&lastSize>0){
            //最后一页不足者则补足
            len-=(showSize-lastSize)*itemWidth;
        }
        pagesInner.css({
            left:-len
        });
        opt.onChange&&opt.onChange(current);
        updateAct();
    }
    function updateAct(){
        var classname="act-active";
        if(pages>1&&current<pages){
            actNext.addClass(classname);
        }else{
            actNext.removeClass(classname);
        }
        if(current>1){
            actPrev.addClass(classname);
        }else{
            actPrev.removeClass(classname);
        }
    }
    return this;
}

//tooltip
$(function () {
    var $tooltip = $(".zt-tooltip");
    ztui.ztTooltip = {
        target: $tooltip,
        isEnabled: true, //是否启用
        enabled: function (isEnabled) {
            this.isEnabled = isEnabled;
            if (!isEnabled) {
                this.hide();
            } else {
                this.show();
            }
        },
        hide: function () {
            this.target.removeClass("zt-active");
        },
        show: function () {
            this.target.addClass("zt-active");
        }
    };

    $("body").on("mouseover", "[data-tooltip]", function (e) {
        var _toolTip = ztui.ztTooltip;
        if (!_toolTip.isEnabled) {
            _toolTip.hide();
            return;
        }
        var that = $(this),
            tipData = that.data("tooltip"),
            offset = that.offset();
        if ($tooltip.length < 1) {
            $tooltip = $("<div class='zt-tooltip'></div>");
            $("body").append($tooltip);
        }
        ztui.ztTooltip.target = $tooltip;
        if (typeof tipData === 'string') {
            $tooltip.html(tipData);

        } else if (typeof tipData === 'object') {
            //如果设置方向则在做 现在没时间
            $tooltip.html(tipData.content);

        }

        var oh = $tooltip.outerHeight(),
            ow = $tooltip.outerWidth(),
            tw = that.outerWidth(),
            th = that.outerHeight(),
            ww = $(window).width(),
            wh = $(window).height();

        var _waitPosition = {
            "top": {
                dir: "top",
                top: offset.top - oh - 8,
                left: offset.left + (tw - ow) / 2
            },
            "right": {
                dir: "right",
                top: offset.top + (th - oh) / 2,
                left: offset.left + tw + 8
            }, "bottom": {
                dir: "bottom",
                top: offset.top + th + 8,
                left: offset.left + (tw - ow) / 2
            }, "left": {
                dir: "left",
                top: offset.top + (th - oh) / 2,
                left: offset.left - ow - 8
            }
        }

        //极限位置没有判断
        var _position = _waitPosition.top;

        if (offset.top < 24) {
            _position = _waitPosition.bottom;
        }
        if (offset.top + th > wh) {
            _position = _waitPosition.top;
        }

        /*//左边没位置了就排在右边
        if (offset.left < 24) {
            _position = _waitPosition.right;
        }
        if (offset.left + tw - ww < 24) {
            _position = _waitPosition.left;
        }*/


        //如果指定了方向则强制使用此项
        if (tipData.dir) {
            if ("top|right|bottom|left".indexOf(tipData.dir) < 0) {
                console.log("tooltip:dir 只能是 top|right|bottom|left");
                tipData.dir = "bottom" //默认在下面
            }
            _position = _waitPosition[tipData.dir]

        }

        //设置位置 默认放在当前需要提示元素上方
        $tooltip.css({
            top: _position.top,
            left: _position.left,
        });
        //显示
        $tooltip.attr("class", "zt-tooltip to-" + _position.dir);
        _toolTip.show();

        that.off("mouseleave").on("mouseleave", function () {
            ztui.ztTooltip.hide();
        })
    }).on("click", ".zt-to-top", function (e) {
        $("html,body")
            .stop()
            .animate({scrollTop: 0}, 300, function () {
            });

    });
});

// 界面自适应大小，很想使用flex。为了兼容以防万一
var classRoom = {
    autoHeight: function (h) {
        //console.log("中间高度：" + h);
    },
    viewCoreHeight: 0,
    fullScreen:function(fn){
        var docElm = document.documentElement;
        if(docElm.requestFullscreen) {
            docElm.requestFullscreen();
        }else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        }else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        }else if (docElm.msRequestFullscreen) {
            docElm.msRequestFullscreen();
        }
        fn&&fn()
    },
    exitFullScreen:function(fn){
        // 混用会出问题
        // 当用户按F11进入全屏，点击界面退出全屏按钮就会出一次错误（权限），后续考虑直接接管F11按键事件
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        fn&&fn()
    }
};

//课堂教学自适应布局计算
;$(function () {
    var roomMain = $(".room-main");
    if (roomMain.length <= 0) {
        return false;
    }
    var body = $("body"),
        header=$("#header"),
        sidebar = $(".sidebar"),
        main = roomMain,
        mainTools=$(".main-tools",main),
        innerMain = $(".inner-main",main),
        mainBody = $(".main-body", innerMain),
        mainFooter = $(".main-footer", innerMain),
        sideHandout = $(".side-handout",sidebar),
        sideDir = $(".side-dir",sidebar),
        viewCore = $(".view-core",innerMain),
        viewCoreHeader = $("> .view-header",viewCore),
        viewCoreBody = $("> .view-content",viewCore),
        viewCoreFooter = $("> .view-footer",viewCore),
        win=$(window);
    var header_h=0,mainTools_h=0;

    function getPadding($target,dir){
        return dir==="vertical"
            ?(parseInt($target.css("paddingTop"),10)+parseInt($target.css("paddingBottom"),10))
            :(parseInt($target.css("paddingLeft"),10)+parseInt($target.css("paddingRight"),10))
    }

    /**
     * 初始左侧讲义和活动区滚动条
     * @returns [讲义滚动条Object,活动滚动条Object]
     */
    function initScrollbar(){

        var handoutList=$(".handout-list"),
            activityList=$(".side-dir .drag-list");
        var handoutScrollbar=null,
            activityScrollbar=null;

        if(handoutList.find(".handout-item").length>3){
            var current=handoutList.find(".handout-item.zt-current");
            if(current.index()>2){ //初始化时候，默认选择的项索引超过三，要显示在可视区（第二个）
                handoutList.scrollTop(current.position().top-current.height())
            }
            handoutScrollbar=new PerfectScrollbar(handoutList[0],{
                suppressScrollX: true,
                //这个界面键盘事件不加，防止影响ppt播放
                handlers: ['click-rail', 'drag-thumb', /*'keyboard',*/ 'wheel', 'touch'],
            });
        }
        if(activityList.find(".drag-item").length>0){
            var current=activityList.find(".drag-item.zt-current");
            if(current.length>0){
                activityList.scrollTop(current.position().top-current.height());
            }
            activityScrollbar=new PerfectScrollbar(activityList[0],{
                suppressScrollX: true,
                //这个界面键盘事件不加，防止影响ppt播放
                handlers: ['click-rail', 'drag-thumb', /*'keyboard',*/ 'wheel', 'touch'],
            });
        }
        //示意滚动条
        setTimeout(function () {
            handoutList.addClass('ps--focus');
            activityList.addClass('ps--focus');
        }, 0);
        setTimeout(function () {
            handoutList.removeClass('ps--focus');
            activityList.removeClass('ps--focus');
        }, 1000);

        //滚动到指定位置
        //handoutList.scrollTop(0); 根据选择项设置滚动高度，然后更新即可
        //handoutScrollbar.update();

        //也可以在其他位置直接更新，重新查询元素即可
        //$("#Demo").scrollTop(0);
        //$("#Demo").perfectScrollbar('update');
        return [handoutScrollbar,activityScrollbar]

    }

    var sideScrollbars=initScrollbar();

    function setHeight() {
        var compute = win.height();
        if(body.hasClass("zt-fullscreen")){
            if(viewCoreBody.length > 0){
                viewCoreBody.css("min-height", compute);
            }
        }else{
            if(header.length>0){
                header_h=header.outerHeight();
            }
            if(mainTools.length>0){
                mainTools_h=mainTools.outerHeight();
            }
            if(body.hasClass("room-full")){
                mainTools_h=0;
            }

            compute=compute
                - header_h
                - mainTools_h;

            if(mainBody.length > 0){
                if(mainFooter.length > 0){
                    compute-=mainFooter.outerHeight();
                }
                mainBody.css("min-height", compute);

                compute-=getPadding(mainBody,"vertical");
                if(viewCoreHeader.length > 0){
                    compute-=viewCoreHeader.outerHeight();
                }
                if(viewCoreFooter.length > 0){
                    compute-=viewCoreFooter.outerHeight();
                }

                if(viewCoreBody.length > 0){
                    viewCoreBody.css("min-height", compute);
                    if(viewCoreBody.hasClass("view-split")){
                        if(compute<600){
                            compute=600;
                        }
                        viewCoreBody.css("height", compute);
                    }
                }
            }

        }

        if (sideDir.length > 0) {
            var _h = sidebar.height();
            var _divider=2;

            if(sideHandout.length>0){
                _h=_h-sideHandout.outerHeight()-_divider-40;
            }
            sideDir.find(".drag-list").height(_h);

            sideScrollbars.forEach(function(item,index){
                item&&item.update()
            })
        }
        if (classRoom) {
            classRoom.viewCoreHeight=compute;
            classRoom.autoHeight && classRoom.autoHeight(compute);
        }
    }

    body.on("click", ".sidebar-control", function () {
        setTimeout(setHeight, 360)
    });

    $(window).resize(function () {
        if(screen.height===$(window).height()){
            body.addClass("zt-fullscreen")
        }else{
            body.removeClass("zt-fullscreen")
        }
        if(window.fullTimeout){
            window.clearTimeout(window.fullTimeout)
        }
        //避免频发触发
        window.fullTimeout=window.setTimeout(setHeight,320);
    });

    setHeight();
    //全局提示，
    body.on("click",".panel-activity .panel-header",function(){
        var panel=$(this).closest(".panel-activity");
        if(panel.hasClass("panel-active")){
            panel.removeClass("panel-active");
            panel.find(".panel-body").slideDown();
        }else{
            panel.addClass("panel-active");
            panel.find(".panel-body").slideUp();
        }

    }).on("click",".btn-fullscreen",function(){
        classRoom.fullScreen(function(){
            body.addClass("zt-fullscreen");
        });
    }).on("click",".btn-exit-fullscreen",function(){
        classRoom.exitFullScreen(function(){
            body.removeClass("zt-fullscreen");
        });
    }).on("mouseenter",".sidebar",function(){
        if(window.closeSidebar){
            window.clearTimeout(window.closeSidebar)
        }
    }).on("mouseleave",".sidebar",function(){
        if(body.hasClass("zt-fullscreen")){
            if(window.closeSidebar){
                window.clearTimeout(window.closeSidebar)
            }
            //停留.6s移除
            window.closeSidebar=window.setTimeout(function(){
                sidebar.removeClass("zt-active")
            },600)
        }
    }).on("mouseenter",".sidebar-fullscreen-tip",function(e){
        sidebar.addClass("zt-active");
    })
})

//教师互动 弹出层样式
;(function ($) {
    $.crTip=$.crTip||{};

    var icons= $.crTip.icons ={
        success:'success',
        warn:'warn',
        error:'error',
        confirm:'confirm',
        alert:'alert',
        nothing:'nothing',
    };

    $.crTip.success=function(settings){
        return getTipDialog(icons.success,settings);
    };

    $.crTip.warn=function(settings){
        return getTipDialog(icons.warn,settings);
    };

    $.crTip.error=function(settings){
        return getTipDialog(icons.error,settings);
    };

    $.crDialog=$.crDialog||{};

    $.crDialog.success=function(settings){
        return getDialog(icons.success,settings);
    };
    $.crDialog.warn=function(settings){
        return getDialog(icons.warn,settings);
    };
    $.crDialog.error=function(settings){
        return getDialog(icons.error,settings);
    };
    $.crDialog.tip=function(settings){
        return getDialog(icons.nothing,settings);
    };
    $.crDialog.dialog=function(settings){
        var opts={
            title:null,
            skin:'cr-dialog'
        };

        if(typeof settings === 'string'){
            opts.content=settings
        }else{
            opts=$.extend({},opts,settings);
        }
        return $.dialog(opts);
    };


    function getDialog(type,settings){
        var opts={
            title:null,
            skin:'cr-dialog cr-dialog-center'
        };

        if(typeof settings === 'string'){
            opts.content=settings
        }else {
            opts = $.extend({}, opts, settings);

        }if(!opts.title){
            opts.skin+=" cr-title-transparent"
        }
        var content=$('<div class="cr-dialog-wrap dialog-{0}"><i class="cr-icon icon-d-{0}"></i><div class="cr-d-content"></div></div>'.strFormat(type));;

        if(typeof opts.content === 'string'){
            content.find(".cr-d-content").append(opts.content);
        }else{
            content.find(".cr-d-content").append($.clone(opts.content));
        }
        opts.content=content[0];
        return $.dialog(opts);
    }

    //快捷提示
    function getTipDialog(type,settings){
        var opts={
            title:null,
            time: 2000,
            skin:'cr-dialog-tip',
            content:''
        };
        if(typeof settings === 'string'){
            opts.content=settings
        }else{
            opts=$.extend({},opts,settings);
        }

        var content=$('<div class="cr-tip-wrap dialog-{0}"><i class="cr-icon icon-{0}"></i></div>'.strFormat(type));
        if(typeof opts.content === 'string'){
            content.append(opts.content)
        }else{
            content.append($.clone(opts.content));
        }
        opts.content=content[0];

        return $.dialog(opts);
    }
})(window.jQuery)

;(function ($) {
    //在某一块区域内的弹出层
    $.partDialog=function(options){
        var d=null,
            opts=$.extend({
                parent:null,
                skin:'cr-dialog'
            },options);

        var mask=$(".part-mask",opts.parent);
        if(opts.parent!=null&&opts.parent.length>0&&opts.lock){
            mask.show();
        }
        if(!opts.title){
            opts.skin+=" cr-dialog-center cr-title-transparent"
        }
        opts.beforeunload=function(){
            if(opts._lock){
                mask.hide();
            }
            options.beforeunload&&options.beforeunload();
        };
        //备份属性，关闭时候使用
        opts._lock=opts.lock;
        opts.lock=false;
        d=$.dialog(opts);
        $(d.dom.wrap).css({
            marginLeft:opts.parent.position().left/2
        });
        return d;
    };

    $.windowDialog=function(options){
        var d=null,
            opts=$.extend({
                parent:null,
                skin:'zt-window-dialog',
            },options);

        opts.beforeunload=function(){
            options.beforeunload&&options.beforeunload();
        };
        //备份属性，关闭时候使用
        d=$.dialog(opts);
        d.dom.wrap[0]["_dialog_"]=d;
        return d;
    }

})(window.jQuery);
;(function ($) {
    function NumberFlip(opt) {
        if (window === this) {
            return new NumberFlip();
        }
        return this.init(opt);
    };
    NumberFlip.prototype = {
        wrap: null,
        tempItem:'<div class="number-flip v-{0}"><span class="number-bak">{1}</span><span class="number-list-bg">0123456789</span></div>',
        init: function (opt) {
            var that=this;
            that.wrap=opt.wrap;
            var bak=$.trim(that.wrap.text()),
                itemHtml=[];
            for (var i = 0; i < bak.toString().length; i++) {
                itemHtml.push(that.tempItem.strFormat(bak[i],bak[i]));
            }
            this.wrap.html(itemHtml.join(''));
            return this;
        }
    };
    $.fn.numberFlip = function (opt) {
        return this.each(function (i, item) {
            var opt = $.extend({}, opt, {wrap: $(item)});
            if(item.numberFlip){
                return item;
            }
            item.numberFlip = new NumberFlip(opt);
            return item;
        })
    };
    // $(".number-flip").numberFlip()
})(window.jQuery);

/**
 * 弹幕函数，只负责发送弹幕
 * 1:轨道顺序随机
 * 2:优先前三个轨道（如果是视频弹幕，为了不影响观看需要将第四点提升至第三，课堂教学弹幕需要平局分布。）
 * 3:优先采用空白轨道
 * 4:空白轨道都被占用则选择轨道空白最大的
 * 5:没有轨道可用则延迟重试
 * @param options 参数
 */
var Barrage=function(options){
    var that=this;
    if(that===window){
        that=new Barrage();
    }
    return that.init(options);
}
Barrage.prototype={
    constructor:"Barrage",
    opt:{
        wrap:$(".cr-barrage"),
        wrapNoHeight:false,
        width:0,
        height:0,
        gap:300,
        trajectory:20,
        trajectoryHeight:40,
        color:'#fff',
        baseTime:30
    },
    trajectoryList:[],
    init:function(options){
        this.opt=$.extend({},this.opt,options);
        var opt=this.opt;
        this.opt.width=opt.wrap.outerWidth();
        // this.opt.width=1363;
        if(!opt.wrapNoHeight){
            this.opt.height=opt.trajectory*opt.trajectoryHeight;
            opt.wrap.css("height",this.opt.height+"px");
        }
        //初始化轨道
        var that=this;
        that.initTrajectory();
        that._resize_=window.setTimeout(function(){
            window.clearTimeout(that._resize_);
            $(window).resize(function () {
                that.resize();
            });
        },300);
        return that;
    },
    resize:function(){
        var that=this;
        that.opt.width=that.opt.wrap.outerWidth();
        that.opt.wrap.find(".barrage-item").each(function(){
            var item=$(this),rate=+item.data("rate");
            var offsetLeft=item.offset().left;
            if(offsetLeft-item.outerWidth()+that.opt.width<=0){
                item.remove();
                return;
            }
            item.css({
                transform:"translateX({0})".strFormat(-that.opt.width-item.outerWidth()+'px'),
                transition:"all {0}s linear".strFormat(offsetLeft/rate)
            });
        });
    },
    initTrajectory:function(){
        var that=this,
            opt=that.opt;
        that.trajectoryList=[];
        for (var i=0;i<opt.trajectory;i++){
            that.trajectoryList[i]={
                index:i,
                count:0,
                items:{},
                lastId:0,
                addItem:function(id,dom){
                    var tra=this;
                    tra.count++;
                    tra.lastItem=dom;
                    tra.lastId=id;
                    dom.on("transitionend",function(){
                        that.trajectoryList[tra.index].count-=1; //这里有点问题，不影响使用，回头再说
                        $(this).remove();
                    })
                },
                getRemainderWidth:function () {
                    var tra=this,dom=tra.lastItem;
                    return opt.width-(dom.position().left+dom.width());
                }

            };
        }
    },

    getTrajectory:function(){
        var that=this,
            opt=that.opt,
            index=randomIndex();

        function randomIndex(){
            return Math.floor(Math.random()*opt.trajectory);
        }
        function priority(index){
            var j=0,_priority=3;
            for (var i=0;i<_priority;i++){
                var v=that.trajectoryList[i].count;
                if(v===0){
                    j++
                }
            }
            if(j===3){
                return Math.floor(Math.random()*_priority)
            }else{
                return index;
            }
        }
        //绿色通道
        function greenChannel(index){
            //如果都被占
            var channels=getEmptyChannel();
            if(channels.length<=0){
                //查询可复用的轨道，没有则返回-1
                index= getReusableChannel();
            }else{
                index= channels[Math.floor(Math.random()*channels.length)];
            }
            return index;
        }
        function getReusableChannel(){
            var result=opt.gap,item=null,resultItem=null;
            for(var i=0;i<that.trajectoryList.length;i++){
                item=that.trajectoryList[i];
                var width=item.getRemainderWidth();
                if(width>result){
                    result=width;
                    resultItem=item;
                    break;
                }
            }
            if(resultItem===null){
                return -1;
            }
            return resultItem.index
        }
        //轨道是否都被占用,返回未占用的轨道索引
        function getEmptyChannel(){
            var result=[],data=that.trajectoryList;
            for (var i=0;i<data.length;i++){
                if(data[i].count===0){
                    result.push(i);
                }
            }
            return result;
        }
        //优先前三个
        index=priority(index);
        //优先取空白的
        index=greenChannel(index);

        if(index>-1){
            that.trajectoryList[index].count+=1;
        }
        return index
    },
    send:function (id,item) {
        var that=this,
            opt=that.opt,
            //时间决定速度，差值为2，基数是30,
            // time=Math.random()*2+opt.baseTime,
            time=opt.baseTime,
            value="all {0}s linear".strFormat(time),
            tra=this.getTrajectory();
        //如果返回-1这延迟两秒重试。
        if(tra<0){
            window.setTimeout(function(){
                that.send(id,item)
            },2000);
            return;
        }

        item.css({
            top:tra*opt.trajectoryHeight,
            transform:"translateX(0px)",
            transition:value
        })
        item.data("trajectory",tra);
        item.data("rate",opt.width/time);
        item.attr("data-tra",tra);
        opt.wrap.append(item);

        item.css({
            transform:"translateX({0})".strFormat(-opt.width-item.outerWidth()+'px')
        });
        that.trajectoryList[tra].addItem(id,item);
    },
    remove:function(){

    },
}


;$(function(){

    var href=window.location.href;
    var staticPage=(href.indexOf("知途阿里云大学/version-01/")>-1
        || href.indexOf(encodeURI("知途阿里云大学/version-01/"))>-1)
        && href.indexOf(".html")>-1;
    //静态页下面一堆事件执行，后端开发自行处理
    if(!staticPage){
        return false;
    }

    var sortable=false;
    $(".drag-list").sortable({
        placeholder: "ui-state-highlight",
        revert: true,
        containment: ".sidebar",
        handle: ".drag-control",
        start:function(){
            sortable=true;
        },
        stop:function(){
            sortable=false;
        }
    }).on("click",function(){
        if(sortable){
            return false;
        }
    }).disableSelection();

    $("body").on("click",".sidebar li",function(){  //拖拽效果
        $(this).closest(".sidebar").find("li").removeClass("zt-current");
        $(this).addClass("zt-current")
    }).on("click",".sidebar-control",function(){ //收起侧栏效果
        $("body").toggleClass("room-full")
    }).on("click",".cr-drop",function(){   //下拉框点击效果
        $(this).toggleClass("drop-active")
    }).on("click",".drop-item",function(){
        //这个一定要保留
        return false;
    }).on("mouseleave",".cr-drop",function(){ //鼠标移出即关闭
        $(this).removeClass("drop-active")
    }).on("beforeChange",".input-switch",function(){
        //ajax 同步，不要异步
        // $(this).addClass("readonly")
    }).on("click",".btn-begin",function(){
        /*$.crDialog.tip({
            content:"<p class='cr-tip-title'>是否开始上课？</p><p class='cr-tip-info'>选择是，系统会推送消息提醒学生上课</p>",
            ok:function(){

            },
            cancel:function(){

            }
        })*/
    }).on("click",".change-skin",function(){
        var rm=$(".room-main").toggleClass("skin-dark");
        if(rm.hasClass("skin-dark")){
            Cookies.set("zt-cr-skin","skin-dark")
        }else{
            Cookies.set("zt-cr-skin","skin-default")
        }
        //请记录状态到cookie中，这个是全局操作。只要在课堂教学界面中都生效
        changeSkinFunction(Cookies.get("zt-cr-skin"));

    });

    function changeSkinFunction(skin){
        var body=$("body"),
            roomMain=$(".room-main",body),
            btnLabel=$(".change-skin",body).find("label");
        var skinOpt={
            title:{
                textStyle:{color:'#333'}
            },
            xAxis:{
                nameTextStyle:{fontSize:16, color:'#333'},
                axisLabel: {fontSize: 16, color:'#333'},
            },
            yAxis:{
                nameTextStyle:{fontSize:16, color:'#333'},
                axisLabel: {fontSize: 16, color:'#333'},
            },
            legend: {
                textStyle:{fontSize:14, color:'#333'}
            }

        }
        if(skin==="skin-dark"){
            skinOpt={
                skin:'skin-dark',
                title:{
                    textStyle:{color:'#fff'}
                },
                xAxis:{
                    nameTextStyle:{fontSize:16, color:'#fff'},
                    axisLabel: {fontSize: 16, color:'#fff'},
                },
                yAxis:{
                    nameTextStyle:{fontSize:16, color:'#fff'},
                    axisLabel: {fontSize: 16, color:'#fff'},
                },
                legend: {
                    textStyle:{fontSize:14, color:'#fff'}
                }
            }
            btnLabel.text("开灯");
            body.addClass("skin-dark");
            roomMain.addClass("skin-dark");
        }else{
            btnLabel.text("关灯");
            body.removeClass("skin-dark");
            roomMain.removeClass("skin-dark");
        }
        window.changeSkin&&window.changeSkin(skinOpt);
    }

    changeSkinFunction(Cookies.get("zt-cr-skin"));

    setTimeout(function(){
        changeSkinFunction(Cookies.get("zt-cr-skin"));
    },300)
});