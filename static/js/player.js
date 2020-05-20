var jwObj = null;

var barrageList = new Array();

var isScroll = true;

/*
 * 初始化视频播放器,，默认尺寸为 640x360(16:9)
 * 
 * containerId 绑定的div id , 不带  #
 * parentFolder 视频文件的父亲目录路径（相对路径）
 * autostart 自动播放标志
 * seekTime 跳转时间点，单位为：秒
 * onTimeCallback 视频播放时定时回调函数，回调参数为JSON ， {"position" : 5}
 */
function initVideoPlayer(containerId, options) {
    var nodeId = options.nodeId;//资源id
    var itemId = options.itemId;//资源id
    $.ajax({
        type: "post",
        url: CONTEXTPATH + "/item/detail.mooc",
        data: {
            nodeId: nodeId,
            itemId: itemId
        },
        dataType: "json",
        success: function (response) {
            if (options['autostart']) {
                if (options['isStudyOver'] && options['isStudyOver'] == 2) {
                    //options['autostart']=false;
                    if (response.barrages) {
                        var barrages = response.barrages;
                        if (barrages.length > 0) {
                            var b = barrages[0];
                            var $btn = $('<a class="btn-public btn-submit">进入练习</a>');
                            if (options.previewExamCallBack != null) {
                                var previewExamCallBack = options.previewExamCallBack;//视频弹出试卷函数
                                $btn.bind('click', function () {
                                    previewExamCallBack(b.barrageId, b.type, b.begin, b.testPaperId);
                                })
                                $btn.insertAfter($('#' + containerId).parent().parent());
                            }
                        }
                    }
                }
            }
            initPlay(containerId, options, response.node, response.barrages, response.path, response['mediaResources']);
        },
        error: function () {
            //$.dialog.error( Msg.get("study.node.error"));
        }
    });

}

function getThirdpartyUrl(url) {
    var u = url.substring(7, url.length);
    while (u.indexOf("/") == 0) {
        u = u.substring(1, u.length);
    }
    u = "/thirdparty/" + u;
    return u;
}

function isHttpUrl(url) {
    return url.indexOf("http:") == 0 || url.indexOf("https:") == 0;
}

function getDefinitionName(definition) {
    var name = "默认";
    definition = definition || "";
    if (definition.length ==0) return name;
    definition = definition.toLowerCase();

    if(definition == "720p" || definition == "720p.mp4")  {
        name = "高清 720P";
    }else if (definition == "360p" || definition == "360p.mp4")  {
        name = "标清 360P";
    }else if (definition == "480p" || definition == "480p.mp4")  {
        name = "标清 480P";
    }else if (definition == "270p"||definition == "270" || definition == "270p.mp4" || definition == "270.mp4")  {
        name = "流畅 270P";
    } else if (definition == "1080p" || definition == "1080p.mp4")  {
        name = "超清 1080P";
    }

    return name;
}

function getSyscode(){
    var sysCode = 'cnmooc';
    $.ajax({
        type: "post",
        async:false,
        url: CONTEXTPATH + "/home/getSysCode.mooc",
        data: {
        },
        dataType: "json",
        success: function (response) {
            sysCode = response.sysCode;
        },
        error: function () {
            //$.dialog.error( Msg.get("study.node.error"));
        }
    });
    return sysCode;
}

function getLanguageName(lang) {
    lang = lang || "";
    if (lang == "cn") {
        lang = "中文";
    } else if (lang == "en") {
        lang = "英文";
    }

    return lang;
}

function initPlay(containerId, options, node, barrages, resourcePath, mediaResources) {
    mediaResources = mediaResources || {};
    //-------------------传入参数start-----------------------------------------------
    var defaultWidth = options.defaultWidth;//播放器宽度
    var defaultHeight = options.defaultHeight;//播放器高度
    var allowseek = options.allowseek;//是否可拖拽
    var seekTime = options.seekTime;//定位时间点
    var onTimeCallback = options.onTimeCallback;//播放过程中回调函数
    var onCompleteCallback = options.onCompleteCallback;//播放结束回调函数
    var previewExamCallBack = options.previewExamCallBack;//视频弹出试卷函数
    var autostart = options.autostart;//是否自动开始播放
    var duration = options.duration || 0;//视频时长
    var srtTextShow = options.srtTextShow || false;//是否将字幕以文本方式展示
    var localImage = node.thumbnailsPath;//视频缩略图
    var flv_url = node.flvUrl;//视频文件名串
    var nodeId = node.nodeId;//资源id
    var itemId = options.itemId;
    var itemType = options.itemType;
    var courseOpenId = options.courseOpenId;
    var logurl = options.logurl;
    var studyMode = false === options.studyMode ? false : true;
    var definition = options.definitions || "";
    var definitions = definition.split(",");
    barrageList = barrages;//打点数据
    var srtTextShowTemp = true;
    //播放器尺寸
    var width = 640;
    var height = 360;
    if (defaultWidth != null && defaultHeight != null) {
        width = defaultWidth;
        height = defaultHeight;
    }
    //是否可拖拽
    var enabledDragableSlider = true;
    if (allowseek != null) {
        enabledDragableSlider = allowseek;
    }
    //视频资源
    var isMobile = jwplayer.utils.isMobile();
    var isIE8 = jwplayer.utils.isIETrident(8);
    var files1 = [];
    var files2 = [];
    var playlist = [];
    var source1 = null;
    var source2 = null;
    var videoTemp;
    var mediaUrls = mediaResources['mediaUrls'] || [];
    var currentUrl = mediaResources['currentUrl'] || "";
    var inSchool = mediaResources['networkInSchool'] || "0";
    var storeId = mediaResources['storeId'] || 0;
    var mediaUrl;
    var defHd,defIndex=0;
    var shots = "";
    var sysCode = getSyscode();
    if(sysCode == 'mooc_cloud'){
        if(isHttpUrl(flv_url)){
            inSchool = 0;
        }
    }
    if (! isHttpUrl(flv_url)) {
        var _m = flv_url;
        var _i = _m.lastIndexOf("/");
        var _j = _m.lastIndexOf(".");
        var _p = _m.substring(0, _i).concat("/files");
        var _shot = _p + "/thumb.vtt";

        var path = _m.substring(0, _i+1);
        var extName = _m.substring(_j, _m.length);

        _p = definitions[0];

        definitions = definitions.sort(function (a,b) {
            var n1 = parseInt(a),n2 = parseInt(b);
            return n2 - n1;
        });

        if ("1" == inSchool) {
            if (currentUrl.length > 0 && mediaUrls.length > 0) {
                defIndex = 0;
                for (var i = 0; i < mediaUrls.length; i++) {
                    mediaUrl = mediaUrls[i] || "";
                    if (definition.length > 0) {
                        for (var j = 0; j < definitions.length; j++) {
                            defHd = false;
                            if (definitions[j] == _p) {
                                if (defIndex == 0) {
                                    defHd = true;
                                }
                                defIndex++;
                            }
                            videoTemp = {'file': mediaUrl.concat(path,definitions[j],extName), 'label': getDefinitionName(definitions[j]), 'default': defHd};
                            files1.push(videoTemp);
                        }
                    } else {
                        videoTemp = {'file': mediaUrl.concat(flv_url), 'label': getDefinitionName()};
                        files1.push(videoTemp);
                    }
                }
                shots = currentUrl + _shot;
            } else {
                shots = resourcePath + _shot;
            }
        }

        if (storeId == 0) {
            if (definition.length > 0) {
                for (var j = 0; j < definitions.length; j++) {
                    defHd = false;
                    if (definitions[j] == _p) {
                        defHd = true;
                    }
                    videoTemp = {'file': resourcePath.concat(path,definitions[j],extName), 'label': getDefinitionName(definitions[j]), 'default': defHd};
                    files2.push(videoTemp);
                }
            }else {
                videoTemp = {'file': resourcePath.concat(flv_url), 'label': getDefinitionName()};
                files2.push(videoTemp);
            }
        }
    } else {
        if ((isMobile || ! isIE8) && flv_url.indexOf(".chuanke.com") > 0 && flv_url.indexOf(".flv") > 0) {
            flv_url = flv_url.replace(".enc.flv", ".flv");
            flv_url = flv_url.replace(".flv", ".mp4");
        }
        var hds = [], path="",extName="";
        if (flv_url.indexOf("*")>0 || flv_url.indexOf("|")>0) {
            var _l = flv_url;
            var _i = _l.lastIndexOf("/");
            var _j = _l.lastIndexOf(".");
            path = _l.substring(0, _i+1);
            extName = _l.substring(_j, _l.length);
            var tempDefin = _l.substring(_i+1,_j);
            if(tempDefin == "*"){
            	hds = definitions; 
            }else{
	            hds = tempDefin.split("|");
            }
        }
        if(hds.length>0){
	        if ("1" == inSchool) {
	            var _flv_url;
	            defIndex = 0;
	            if (currentUrl.length > 0 && mediaUrls.length > 0) {
	                    for (var j = 0; j < hds.length; j++) {
	                        _flv_url = path+hds[j]+extName;
	                        _flv_url = getThirdpartyUrl(_flv_url);
	                        for (var i = 0; i < mediaUrls.length; i++) {
	                            mediaUrl = mediaUrls[i] || "";
	                            defHd = false;
	                            if (currentUrl == mediaUrl) {
	                                if (defIndex == 0) {
	                                    defHd = true;
	                                }
	                                defIndex ++;
	                            }
	                            videoTemp = {'file': mediaUrl.concat(_flv_url), 'label': getDefinitionName(hds[j]), 'default': defHd};
	                            files1.push(videoTemp);
	                        }
	                    }
	                }
	            }
	            for (var j = 0; j < hds.length; j++) {
	                defHd = false;
	                if(j==0){
	                    defHd = true;
	                }
	                videoTemp = {'file': path+hds[j]+extName, 'label': getDefinitionName(hds[j]), 'default': defHd};
	                files2.push(videoTemp);
	            }
	        } else {
	            if ("1" == inSchool) {
	                if (currentUrl.length > 0 && mediaUrls.length > 0) {
	                var _flv_url = getThirdpartyUrl(flv_url);
	                for (var i = 0; i < mediaUrls.length; i++) {
	                    mediaUrl = mediaUrls[i] || "";
	                        defHd = false;
	                    if (currentUrl == mediaUrl) {
	                            defHd = true;
	                    }
	                        videoTemp = {'file': mediaUrl.concat(_flv_url), 'label': getDefinitionName(), 'default': defHd};
	                    files1.push(videoTemp);
	                }
	            }
	        }
	        videoTemp = {'file': flv_url, 'label': getDefinitionName()};
	        files2.push(videoTemp);
        }
    }

    //字幕
    var paramTracks = new Array();
    if (node.nodeExts) {
        var first = 0;
        for (var i = 0; i < node.nodeExts.length; i++) {
            var ext = node.nodeExts[i];
            //2为字幕文件
            if (2 == ext.extType) {
                var extUrl = ext.node.rsUrl;
                if (! isHttpUrl(extUrl)) {
                    if (currentUrl.length > 0 && mediaUrls.length > 0) {
                        extUrl = currentUrl + extUrl;
                    } else {
                        extUrl = resourcePath + extUrl;
                    }
                }
                var srtTemp = {file: extUrl, kind: "captions", label: getLanguageName(ext.languageCode)};
                if (first == 0) {//第一个字幕为默认
                    srtTemp = {file: extUrl, kind: "captions", label: getLanguageName(ext.languageCode), "default": true};
                }
                paramTracks.push(srtTemp);
                first = first + 1;
            }
        }
    }
    if (shots.length > 0) {
        paramTracks.push({ file: shots, kind: 'thumbnails'});
    }

    if (files1.length > 0) {
        if (isHttpUrl(localImage)) {
            if (currentUrl.length > 0 && mediaUrls.length > 0) {
                var _localImage = getThirdpartyUrl(localImage);
                localImage = currentUrl + _localImage;
            }
        } else {
            if (currentUrl.length > 0 && mediaUrls.length > 0) {
                localImage = currentUrl + localImage
            } else {
                localImage = resourcePath + localImage;
            }
        }
        playlist.push({title:'内网',image: localImage,sources: files1,tracks: paramTracks})
    }
    if (storeId == 0){
    	if (files2.length > 0) {
	        if (! isHttpUrl(localImage)) {
	            if (currentUrl.length > 0 && mediaUrls.length > 0) {
	                localImage = currentUrl + localImage
	            } else {
	                localImage = resourcePath + localImage;
	            }
	        }
	        playlist.push({title:'公网',image: localImage,sources: files2,tracks: paramTracks})
	    }
    }

    jwObj = jwplayer(containerId).setup({
            allowseek: enabledDragableSlider,
            allowsource: true,
            controls: true,
            primary: isMobile ? "html5" : "html5,flash",
            width: width,
            height: height,
            autostart: autostart,
            startparam: 'start',
            playlist: playlist,
            shoturl: CONTEXTPATH + "/view/shot.mooc",
            logurl: logurl ? Logger.getLogUrl(courseOpenId, itemId, itemType) : "",
            captions: {
                back: false,
                color: 'ffffff',
                fontsize: 16
            },
            starttime: (seekTime / 1000) || 0
        }).onReady(function () {
        	
        }).onPlaylistItem(function () {
            if (!studyMode) return;
            jwObj.setCues(barrageList);//设置打点
        }).onTime(function (evt) {
            if (!studyMode) return;
            if (srtTextShow && srtTextShowTemp) {
                try {
                    extCurrent(evt.position);//字幕文本定位
                } catch (e) {
                    console.info(e);
                }
            }
            if (onTimeCallback != null) {
                onTimeCallback({//回调，更新学习记录
                    "position": evt.position
                });
            }
            if (previewExamCallBack != null) {//展示试卷回调
                viewPaper(barrageList, evt.position, previewExamCallBack);
            }
        }).onComplete(function () {
            if (!studyMode) return;
            if (onCompleteCallback != null) {
                onCompleteCallback();//播放结束回调
            }
        }).onShotFinish(function (event) {//截图
            if (!studyMode) return;
            var data = event;
            if (typeof data == "string") {
                data = $.parseJSON(data);
            }
            if (data.code == 0) {
                $("#shoturl").val(data.result.thumbnail);
            }
            else {
                //$.dialog.error(data.msg || Msg.get("study.error.again"));
            }
        }).onCaptionsChange(function (e) {
            if (!studyMode) return;
            //切换字幕
            if (srtTextShow) {
                if (e.tracks[e.track].data) {//e.track为字幕索引，即当前字幕在字幕列表中的索引,0为off
                    srtTextShowTemp = true;
                    $(".video-play").removeClass("video-play-temp");
                    $(".preview-practice").removeClass("preview-practice-temp");
                    jwObj.resize(640, 360);
                    $(".video-subtitle").show();
                    var text = loadSrtDiv(e.tracks[e.track].data);
                    var jsPane = $('.wscroll-pane').data('jsp');
                    jsPane.getContentPane().html(text);

                    jsPane.reinitialise();
                }
                else {//没有字幕或字幕加载失败
                    srtTextShowTemp = false;
                    $(".video-play").addClass("video-play-temp");
                    $(".preview-practice").addClass("preview-practice-temp");
                    $(".video-subtitle").hide();
                    jwObj.resize(900, 900 * 9 / 16);
                }
            }
        }).onHeart(function (evt) {
            if (!studyMode) return;
            Logger.heart(evt);
        });
}

//加载字幕文本区域
function loadSrtDiv(srtText) {
    var div = "";
    for (var i = 0; i < srtText.length; i++) {
        div += '<p class="v-text"' + ' begin="' + srtText[i].begin + '">' + srtText[i].text.replace(/\>/g, "&gt;").replace(/\</g, "&lt;").replace(/\"/g, "&quot;").replace(/\&lt;br[\/]?\&gt;/gi, "<br>") + '</p>';
    }
    return div;
}
var srtCurrentPos = -1;

//字幕文本区域自动跟随
function extCurrent(position) {
    var lines = $("#srtText").find("p");
    var lineCount = lines.length;
    var currLine, pos, top, lineTop, mid;
    var lineHeight;
    var containerHeight = $("#srtText .jspContainer").height();

    var jsPane = $('.wscroll-pane').data('jsp');
    for (var i = 0; i < lineCount; i++) {
        currLine = $(lines[i]);
        pos = parseFloat(currLine.attr("begin"));
        if (pos <= position && i < lineCount - 1 && $(lines[i + 1]).attr("begin") > position ||
            i == lineCount - 1 && pos <= position) {
            if (pos == srtCurrentPos) return;
            srtCurrentPos = pos;
            lines.removeClass("current");
            currLine.addClass("current");
            lineHeight = lines[i].offsetHeight;
            lineTop = lines[i].offsetTop;
            mid = (containerHeight - lineHeight) / 2;
            top = parseFloat($("#srtText .jspPane").css("top"));
            top = top || 0;

            if (isScroll) {
                if (lineTop < mid) {
                    jsPane.scrollTo(0, 0);
                } else if (lineTop > lines[i].offsetParent.offsetHeight - containerHeight) {
                    jsPane.scrollTo(0, lines[i].offsetParent.offsetHeight - containerHeight);
                } else {
                    jsPane.scrollTo(0, lineTop - mid);
                }
            }
            return;
        }
    }
    lines.last().addClass("current");
}

//弹出试卷
function viewPaper(barrageList, position, previewExamCallBack) {
    if (barrageList != null) {
        for (var i = 0; i < barrageList.length; i++) {
            var barrage = barrageList[i];
            if (position < barrage.begin - 1 || position > barrage.begin + 1) {
                barrage.popuped = false;
            }
            if (barrage.type == 2 && barrage.testPaperId != null && barrage.testPaperId > 0) {
                if (parseInt(barrage.begin) == parseInt(position) && !barrage.popuped) {
                    barrage.popuped = true;
                    //回调
                    previewExamCallBack(barrage.barrageId, barrage.type, barrage.begin, barrage.testPaperId);
                }
            }
        }
    }

}

/*function initVideoPreview(containerId, nodeId, width, height) {
    $.ajax({
        type: "post",
        url: CONTEXTPATH + "/item/detail.mooc",
        data: {
            nodeId: nodeId,
            itemId: ""
        },
        dataType: "json",
        success: function (response) {
            initPreviewPlay(containerId, response.node.thumbnailsPath, response.node.flvUrl, width, height, response.path);
        },
        error: function () {
            //$.dialog.tips("获取视频资源异常！");
        }
    });
}*/

function initPreviewPlay(containerId, localImage, flv_url, defaultWidth, defaultHeight, resourcePath, auto, spocMediaHost, networkInSchool) {
    var isMobile = jwplayer.utils.isMobile();
    var isIE8 = jwplayer.utils.isIETrident(8);
    spocMediaHost = spocMediaHost || "";
    var inSchool = networkInSchool || "0";

    if (! isHttpUrl(flv_url)) {
        if ("1" == inSchool && spocMediaHost.length > 0) {
            flv_url = spocMediaHost + flv_url;
        } else {
            flv_url = resourcePath + flv_url;
        }
    } else{
        if ((isMobile || ! isIE8) && flv_url.indexOf(".chuanke.com") > 0 && flv_url.indexOf(".flv") > 0) {
            flv_url = flv_url.replace(".enc.flv", ".flv");
            flv_url = flv_url.replace(".flv", ".mp4");
        }

        if ("1" == inSchool && spocMediaHost.length > 0) {
            flv_url = spocMediaHost + getThirdpartyUrl(flv_url);
        }
    }
    if (! isHttpUrl(localImage)) {
        if ("1" == inSchool && spocMediaHost.length > 0) {
            localImage = spocMediaHost + localImage;
        } else {
            localImage = resourcePath + localImage;
        }
    }else {
        if ("1" == inSchool && spocMediaHost.length > 0) {
            localImage = spocMediaHost + getThirdpartyUrl(localImage);
        }
    }

    //播放器尺寸
    var width = 640;
    var height = 360;
    //是否可拖拽
    var enabledDragableSlider = true;

    var files = new Array();
    var temp = {'file': flv_url, 'label': '预览'};
    files.push(temp);

    if (defaultWidth != null && defaultHeight != null) {
        width = defaultWidth;
        height = defaultHeight;
    }

    auto = typeof(auto) == "undefined" ? true : auto;

    jwObj = jwplayer(containerId).setup({
            controls: true,
            allowseek: true,
            primary: isMobile ? "html5" : "html5,flash",
            width: width,
            height: height,
            autostart: auto,
            startparam: 'start',
            image: localImage,
            sources: files
        }).onReady(function () {

        }).onTime(function () {

        }).onComplete(function () {

        }).onShotFinish(function (event) {

        });
}

function initActivityPlay(containerId, options, node, barrages, resourcePath, mediaResources) {
    mediaResources = mediaResources || {};
    //-------------------传入参数start-----------------------------------------------
    var defaultWidth = options.defaultWidth;//播放器宽度
    var defaultHeight = options.defaultHeight;//播放器高度
    var allowseek = options.allowseek;//是否可拖拽
    var seekTime = options.seekTime;//定位时间点
    var onTimeCallback = options.onTimeCallback;//播放过程中回调函数
    var onCompleteCallback = options.onCompleteCallback;//播放结束回调函数
    var previewExamCallBack = options.previewExamCallBack;//视频弹出试卷函数
    var autostart = options.autostart;//是否自动开始播放
    var duration = options.duration || 0;//视频时长
    var srtTextShow = options.srtTextShow || false;//是否将字幕以文本方式展示
    var localImage = node.thumbnailsPath;//视频缩略图
    var flv_url = node.flvUrl;//视频文件名串
    var nodeId = node.nodeId;//资源id
    var itemId = options.itemId;
    var itemType = options.itemType;
    var courseOpenId = options.courseOpenId;
    var logurl = options.logurl;
    var studyMode = false;
    var definition = options.definitions || "";
    var definitions = definition.split(",");
    barrageList = barrages;//打点数据
    var srtTextShowTemp = true;
    //播放器尺寸
    var width = 640;
    var height = 360;
    if (defaultWidth != null && defaultHeight != null) {
        width = defaultWidth;
        height = defaultHeight;
    }
    //是否可拖拽
    var enabledDragableSlider = true;
    if (allowseek != null) {
        enabledDragableSlider = allowseek;
    }
    //视频资源
    var isMobile = jwplayer.utils.isMobile();
    var isIE8 = jwplayer.utils.isIETrident(8);
    var files1 = [];
    var files2 = [];
    var playlist = [];
    var source1 = null;
    var source2 = null;
    var videoTemp;
    var mediaUrls = mediaResources['mediaUrls'] || [];
    var currentUrl = mediaResources['currentUrl'] || "";
    var inSchool = mediaResources['networkInSchool'] || "0";
    var storeId = mediaResources['storeId'] || 0;
    var mediaUrl;
    var defHd,defIndex=0;
    var shots = "";
    var sysCode = getSyscode();
    if(sysCode == 'mooc_cloud'){
        if(isHttpUrl(flv_url)){
            inSchool = 0;
        }
    }
    if (! isHttpUrl(flv_url)) {
        var _m = flv_url;
        var _i = _m.lastIndexOf("/");
        var _j = _m.lastIndexOf(".");
        var _p = _m.substring(0, _i).concat("/files");
        var _shot = _p + "/thumb.vtt";

        var path = _m.substring(0, _i+1);
        var extName = _m.substring(_j, _m.length);

        _p = definitions[0];

        definitions = definitions.sort(function (a,b) {
            var n1 = parseInt(a),n2 = parseInt(b);
            return n2 - n1;
        });

        if ("1" == inSchool) {
            if (currentUrl.length > 0 && mediaUrls.length > 0) {
                defIndex = 0;
                for (var i = 0; i < mediaUrls.length; i++) {
                    mediaUrl = mediaUrls[i] || "";
                    if (definition.length > 0) {
                        for (var j = 0; j < definitions.length; j++) {
                            defHd = false;
                            if (definitions[j] == _p) {
                                if (defIndex == 0) {
                                    defHd = true;
                                }
                                defIndex++;
                            }
                            videoTemp = {'file': mediaUrl.concat(path,definitions[j],extName), 'label': getDefinitionName(definitions[j]), 'default': defHd};
                            files1.push(videoTemp);
                        }
                    } else {
                        videoTemp = {'file': mediaUrl.concat(flv_url), 'label': getDefinitionName()};
                        files1.push(videoTemp);
                    }
                }
                shots = currentUrl + _shot;
            } else {
                shots = resourcePath + _shot;
            }
        }

        if (storeId == 0) {
            if (definition.length > 0) {
                for (var j = 0; j < definitions.length; j++) {
                    defHd = false;
                    if (definitions[j] == _p) {
                        defHd = true;
                    }
                    videoTemp = {'file': resourcePath.concat(path,definitions[j],extName), 'label': getDefinitionName(definitions[j]), 'default': defHd};
                    files2.push(videoTemp);
                }
            }else {
                videoTemp = {'file': resourcePath.concat(flv_url), 'label': getDefinitionName()};
                files2.push(videoTemp);
            }
        }
    } else {
        if ((isMobile || ! isIE8) && flv_url.indexOf(".chuanke.com") > 0 && flv_url.indexOf(".flv") > 0) {
            flv_url = flv_url.replace(".enc.flv", ".flv");
            flv_url = flv_url.replace(".flv", ".mp4");
        }
        var hds = [], path="",extName="";
        if (flv_url.indexOf("*")>0 || flv_url.indexOf("|")>0) {
            var _l = flv_url;
            var _i = _l.lastIndexOf("/");
            var _j = _l.lastIndexOf(".");
            path = _l.substring(0, _i+1);
            extName = _l.substring(_j, _l.length);
            var tempDefin = _l.substring(_i+1,_j);
            if(tempDefin == "*"){
                hds = definitions;
            }else{
                hds = tempDefin.split("|");
            }
        }
        if(hds.length>0){
            if ("1" == inSchool) {
                var _flv_url;
                defIndex = 0;
                if (currentUrl.length > 0 && mediaUrls.length > 0) {
                    for (var j = 0; j < hds.length; j++) {
                        _flv_url = path+hds[j]+extName;
                        _flv_url = getThirdpartyUrl(_flv_url);
                        for (var i = 0; i < mediaUrls.length; i++) {
                            mediaUrl = mediaUrls[i] || "";
                            defHd = false;
                            if (currentUrl == mediaUrl) {
                                if (defIndex == 0) {
                                    defHd = true;
                                }
                                defIndex ++;
                            }
                            videoTemp = {'file': mediaUrl.concat(_flv_url), 'label': getDefinitionName(hds[j]), 'default': defHd};
                            files1.push(videoTemp);
                        }
                    }
                }
            }
            for (var j = 0; j < hds.length; j++) {
                defHd = false;
                if(j==0){
                    defHd = true;
                }
                videoTemp = {'file': path+hds[j]+extName, 'label': getDefinitionName(hds[j]), 'default': defHd};
                files2.push(videoTemp);
            }
        } else {
            if ("1" == inSchool) {
                if (currentUrl.length > 0 && mediaUrls.length > 0) {
                    var _flv_url = getThirdpartyUrl(flv_url);
                    for (var i = 0; i < mediaUrls.length; i++) {
                        mediaUrl = mediaUrls[i] || "";
                        defHd = false;
                        if (currentUrl == mediaUrl) {
                            defHd = true;
                        }
                        videoTemp = {'file': mediaUrl.concat(_flv_url), 'label': getDefinitionName(), 'default': defHd};
                        files1.push(videoTemp);
                    }
                }
            }
            videoTemp = {'file': flv_url, 'label': getDefinitionName()};
            files2.push(videoTemp);
        }
    }

    //字幕
    var paramTracks = new Array();
    if (node.nodeExts) {
        var first = 0;
        for (var i = 0; i < node.nodeExts.length; i++) {
            var ext = node.nodeExts[i];
            //2为字幕文件
            if (2 == ext.extType) {
                var extUrl = ext.node.rsUrl;
                if (! isHttpUrl(extUrl)) {
                    if (currentUrl.length > 0 && mediaUrls.length > 0) {
                        extUrl = currentUrl + extUrl;
                    } else {
                        extUrl = resourcePath + extUrl;
                    }
                }
                var srtTemp = {file: extUrl, kind: "captions", label: getLanguageName(ext.languageCode)};
                if (first == 0) {//第一个字幕为默认
                    srtTemp = {file: extUrl, kind: "captions", label: getLanguageName(ext.languageCode), "default": true};
                }
                paramTracks.push(srtTemp);
                first = first + 1;
            }
        }
    }
    if (shots.length > 0) {
        paramTracks.push({ file: shots, kind: 'thumbnails'});
    }

    if (files1.length > 0) {
        if (isHttpUrl(localImage)) {
            if (currentUrl.length > 0 && mediaUrls.length > 0) {
                var _localImage = getThirdpartyUrl(localImage);
                localImage = currentUrl + _localImage;
            }
        } else {
            if (currentUrl.length > 0 && mediaUrls.length > 0) {
                localImage = currentUrl + localImage
            } else {
                localImage = resourcePath + localImage;
            }
        }
        playlist.push({title:'内网',image: localImage,sources: files1,tracks: paramTracks})
    }
    if (storeId == 0){
        if (files2.length > 0) {
            if (! isHttpUrl(localImage)) {
                if (currentUrl.length > 0 && mediaUrls.length > 0) {
                    localImage = currentUrl + localImage
                } else {
                    localImage = resourcePath + localImage;
                }
            }
            playlist.push({title:'公网',image: localImage,sources: files2,tracks: paramTracks})
        }
    }

    jwObj = jwplayer(containerId).setup({
        allowseek: enabledDragableSlider,
        allowsource: true,
        controls: true,
        primary: isMobile ? "html5" : "html5,flash",
        width: width,
        height: height,
        autostart: autostart,
        startparam: 'start',
        playlist: playlist,
        shoturl: CONTEXTPATH + "/view/shot.mooc",
        captions: {
            back: false,
            color: 'ffffff',
            fontsize: 16
        },
        starttime: (seekTime / 1000) || 0
    }).onReady(function () {

    }).onPlaylistItem(function () {
        jwObj.setCues(barrageList);//设置打点
    }).onTime(function (evt) {
        if (onTimeCallback != null) {
            onTimeCallback({//回调，更新学习记录
                "position": evt.position
            });
        }
    }).onComplete(function () {
        if (onCompleteCallback != null) {
            onCompleteCallback();//播放结束回调
        }
    });
}

function initActivityPlayer(containerId, options) {
    var nodeId = options.nodeId;//资源id
    var activityId = options.activityId;//资源id
    $.ajax({
        type: "post",
        url: CONTEXTPATH + "/activity/node/detail.mooc",
        data: {
            nodeId: nodeId,
            activityId: activityId
        },
        dataType: "json",
        success: function (response) {
            initActivityPlay(containerId, options, response.node, response.barrages, response.path, response['mediaResources']);
        },
        error: function () {
            //$.dialog.error( Msg.get("study.node.error"));
        }
    });

}

var READER = {
    init: function (containerId, options) {
        var width = 800;
        var height = 600;
        var docid = options.docid;
        var pagenow = options.pagenow;

        var callbackurl = options.callback;
        if (options.width) width = options.width;
        if (options.height) height = options.height;
        var itemId = options.itemId;
        var itemType = options.itemType;
        var courseOpenId = options.courseOpenId
        var logurl = options.logurl;
        var finishUrl = options.finishUrl;
        var endpage = options.endpage;
        var studyMode = options.studyMode || false;
        var mediaUrls = options['mediaUrls'] || [];
        var inSchool = options['inSchool'] || "0";
        var docUrl = "/view/doc";
        var _docUrl = CONTEXTPATH + docUrl + ".mooc";
        if ("1" == inSchool) {
            if (mediaUrls.length > 0) {
                _docUrl = mediaUrls[0] + docUrl + ".spoc";
            }
        }
        var slideShow = options.slideShow || false;

        READER.instance = $("#" + containerId).reader({
            width: width,
            height: height,
            id: 'reader',
            docurl: _docUrl,
            docid: docid,
            callbackurl: callbackurl,
            //extparams: '',
            pageno: pagenow,
            endpage: endpage,
            slideshow:slideShow,
            shoturl: CONTEXTPATH + '/view/shot.mooc',
            logurl: logurl ? Logger.getLogUrl(courseOpenId, itemId, itemType) : "",
            pageChange: studyMode ? function (pageno, docid, extparams, totalpage) {
                $("#currentPage").val(pageno);
            } : null,
            shotFinish: function (docid, data) {
                if (data.code == 0) {
                    $("#shoturl").val(data.result.thumbnail);
                }
                else {
                    //$.dialog.error(data.msg || Msg.get("study.error.again"));
                }
            },
            finish: studyMode ? function () {
                if ($("#mediaplayer_wrapper").length==0){
                    $("#mediaplayer").addClass("play-over");
                } else {
                    $("#mediaplayer_wrapper").addClass("play-over");
                }
                //$("#mediaplayer_wrapper").hide();
                $("#playOver").show();
                if (finishUrl != null) {
                    $.ajax({
                        type: "get",
                        url: finishUrl,
                        dataType: "json",
                        success: function () {
                        },
                        error: function () {
                        }
                    });
                }
            } : null,
            heart: studyMode ? function (docId, data) {
                Logger.heart(data);
            } : null
        })
    },
    initActivity: function (containerId, options) {
        var width = 800;
        var height = 600;
        var docid = options.docid;
        var pagenow = options.pagenow||1;
        var preview = options.preview || false;
        var previewpages = options.previewpages || 1

        // var callbackurl = options.callback;
        if (options.width) width = options.width;
        if (options.height) height = options.height;
        var activityId = options.activityId;
        var courseOpenId = options.courseOpenId
        // var finishUrl = options.finishUrl;
        var endpage = options.endpage;
        var mediaUrls = options['mediaUrls'] || [];
        var inSchool = options['inSchool'] || "0";
        var docUrl = "/view/doc";
        var _docUrl = CONTEXTPATH + docUrl + ".mooc";
        if ("1" == inSchool) {
            if (mediaUrls.length > 0) {
                _docUrl = mediaUrls[0] + docUrl + ".spoc";
            }
        }
        var slideShow = options.slideShow || false;

        READER.instance = $("#" + containerId).reader({
            width: width,
            height: height,
            renderMode:"html",
            preview: preview,
            previewpages: previewpages,
            id: containerId+'_reader',
            docurl: _docUrl,
            docid: docid,
            // callbackurl: callbackurl,
            //extparams: '',
            pageno: pagenow,
            endpage: endpage,
            slideshow:slideShow,
            shoturl: CONTEXTPATH + '/view/shot.mooc',
            pageChange: function (pageno, docid, extparams, totalpage) {
                console.info("pageNo:"+pageno)
                options.pageChange && options.pageChange({"pageno":pageno});
            },
            finish: function () {
                options.pageFinish && options.pageFinish();
            }
        })
    },
    resize:function (width, height) {
        READER.instance.resize(width, height);
    }
}

function isSlideShow(file) {
    var fileUrl = file;
    var extName = "";
    var dotIndex = fileUrl.lastIndexOf(".");
    if (dotIndex > 0) extName = fileUrl.substr(dotIndex).toLowerCase();

    return extName == ".pptx" || extName == ".ppt";
}
