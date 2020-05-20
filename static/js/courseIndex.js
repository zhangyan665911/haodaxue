function loadPage(url) {
	var selectCertType;
	var menuType = $("#currentContent").val();
    if (History.isEmptyParam(url)) {
    	url = "k="+encodeURIComponent($.trim($("#searchWord").val()))+"&n="+menuType+"&f=0&t=all&m=0&e=all&l=all&c=all&p=1";
    }
    var keyWord = $.trim($("#searchWord").val());
    var data = History.loadParam(url);

    data.k = data.k||keyWord;
    data.k = data.k.replace(/\+/g, " ");
    data.n = data.n||menuType;
    data.f = data.f||0;
    data.t = data.t||""; //课程来源
    data.m = data.m||0;
    data.e = data.e||"";
    data.l = data.l||"";
    data.c = data.c||"";
    data.s = data.s||"";
    data.p = data.p||1;
    initOption(data);
    if (data.e=="all") data.e = "";
    if (data.l=="all") data.l = "";
    if (data.c=="all") data.c = "";
    if (data.t=="all") data.t = "";
    computeCount(data.k, data.n, data.f, data.t,data.m,data.e, data.l, data.c,data.s);
    queryCourse(data.k, data.n, data.f, data.t,data.m,data.e, data.l, data.c,data.s,data.p||1);
    if ("1"==selectCertType){
    	checkCertType(selectCertType);
    }
}

function initOption(data) {
    $("#searchWord").val(data.k);
    $("#openType").find("li a").each(function(){
        var $this = $(this);
        if ($this.attr("openFlag") == data.f){
            if (! $this.hasClass("selected")) $this.addClass("selected");
        } else {
            $this.removeClass("selected");
        }
    })
     //课程来源
    var fromType ="";
    if ($.isArray(data.t)) {
    	fromType = ","+data.t.join(",") + ",";
    } else if (data.t == "all") {
    	fromType = "all";
    } else if (data.t != "") {
    	fromType = ","+data.t+",";
    }
    if (fromType == "all") {
        $(".allFromType").addClass("selected");
    } else {
        $(".allFromType").removeClass("selected");
    }
    $("#fromType").find("li a").each(function(){
        var $this = $(this);
        if (fromType == "all" || fromType.indexOf(","+$this.attr("fromType")+",") > -1){
            if (!$this.hasClass("selected")) $this.addClass("selected");
        } else {
        	 $this.removeClass("selected");
        }
    })
    //随到随学
    var mode="";
    if ($.isArray(data.m)) {
    	mode = data.m;
    }
    else if (data.m != "") {
    	mode = data.m;
    }
	if (mode==0){
		$("#learningMode").find(".input-c").removeClass("selected");
	}
	else if (mode==1){
		$("#learningMode").find(".input-c").addClass("selected");
	}
    //合作机构
    var schoolId="";
    if($.isArray(data.s)){
        schoolId = data.s;
    }else if(data.s!=""){
        schoolId= data.s;
    }
    if (schoolId != "") {
        $("#allOrgCourse").addClass("selected");
        $("#org").find(".input-r").each(function(){
            var $this = $(this);
            if($this.attr('schoolid')==schoolId){
                $this.addClass("selected");
                return;
            }
        })
    }

    //证书
    var cert ="";
    if ($.isArray(data.e)) {
    	cert = ","+data.e.join(",") + ",";
    } else if (data.e == "all") {
    	cert = "all";
    } else if (data.e != "") {
    	cert = ","+data.e+",";
    }
    if (cert == "all") {
        $(".allcert").addClass("selected");
    } else {
        $(".allcert").removeClass("selected");
    }
    $("#certType").find("li a").each(function(){
        var $this = $(this);
        if (cert == "all" || cert.indexOf(","+$this.attr("certType")+",") > -1){
            if (! $this.hasClass("selected")) $this.addClass("selected");
        } else {
        	 $this.removeClass("selected");
        }
    })
    
    //语言
    var language = "";
    if ($.isArray(data.l)) {
        language = ","+data.l.join(",") + ",";
    } else if (data.l == "all") {
        language = "all";
    } else if (data.l != "") {
        language = ","+data.l+",";
    }

    if (language == "all") {
        $(".alllanguage").addClass("selected");
    } else {
        $(".alllanguage").removeClass("selected");
    }

    $("#languageType").find("li a").each(function(){
        var $this = $(this);
        if (language == "all" || language.indexOf(","+$this.attr("languageId")+",") > -1){
            if (! $this.hasClass("selected")) $this.addClass("selected");
        } else {
            $this.removeClass("selected");
        }
    })
    
    
    //分类
    var category = "";
    if ($.isArray(data.c)) {
        category = ","+data.c.join(",") + ",";
    } else if (data.c == "all") {
        category = "all";
    } else if (data.c != "") {
        category = ","+data.c+",";
    }

    if (category == "all") {
        $(".allSubject").addClass("selected")
    } else {
        $(".allSubject").removeClass("selected");
    }

    $("#categoryType li").each(function(){
        var $this = $(this).children(".tree-node").find(".input-c");
        var isChild = $this.attr("isChild");

        if (category == "all" || category.indexOf(","+$this.attr("categoryId")+",") > -1){
            if (! $this.hasClass("selected")) $this.addClass("selected");
        } else {
            if (category != "") $this.removeClass("selected");
        }
    })
}

var sel_schoolId='';
//刷新右侧页面
function queryCourse(keyWord, menuType, openFlag,fromType,learningMode,certType,languageId, categoryId,schoolId, pageIndex){
    $.ajax({
        type:'post',
        url:CONTEXTPATH+"/portal/ajaxCourseIndex.mooc",
        traditional: true,
        data:{
            keyWord:keyWord,
            openFlag:openFlag,
            fromType:fromType,
            learningMode:learningMode,
            certType:certType,
            languageId:languageId,
            categoryId:categoryId,
            menuType:menuType,
            schoolId:schoolId,
            pageIndex:pageIndex
        },
        beforeSend:function(){
            unformatAvatar(".t-img img");
            $(".main-body").html('<div class="read-over-loading"><i class="icon-loading"></i><p class="loading-text">'+Msg.get("portal.serching")+'</p></div>');
        },
        success:function(result){
            $(".main-body").empty().html(result);
            $("#schoolId").val(schoolId);
            viewAnimate();
        }
    })
}
// 计算
function computeCount(keyWord,menuType, openFlag, fromType,learningMode,certType,languageId, categoryId,schoolId) {
    //计算左侧课程数
    $.ajax({
        type:'post',
        url:CONTEXTPATH+"/portal/computeCourse.mooc",
        traditional: true,
        data:{
            keyWord:keyWord,
            openFlag:openFlag,
            fromType:fromType,
            learningMode:learningMode,
            certType:certType,
            languageId:languageId,
            categoryId:categoryId,
            menuType:menuType,
            schoolId:schoolId
        },
        dataType:'json',
        success:function(result){
        	var list1 = result.courseNum;
        	var list5 = result.fromTypeList;
            var list2 = result.languageList;
            var list3 = result.subjectList;
            var list4 = result.certTypeList;
            var learningModeNum = result.learningModeNum;
            
            //课程状态
            $("#openType").find("li").each(function(i){
                $(this).find(".node-count").html(list1[i]);
            })
            
            //课程来源
            $("#fromType").find("li").each(function(i){
                $(this).find(".node-count").empty().html(list5[i].courseNum);
            })

            //合作机构
            if($("#org")!=null){
                var list5 = result.orgCourseList;
                if(list5!=null&&list5.length>0){
                     var cnt = 0;
                    $("#org").find("li").each(function(i){
                        $(this).find(".node-count").empty().html(list5[i].courseCount);
                        cnt+=list5[i].courseCount;
                    })
                     //$("#org").find(".node-count").first().html(cnt);
                }
            }
            //随到随学
            if (learningModeNum!=null){
	            $("#learningMode").find(".node-count").empty().html(learningModeNum);
            }
            //证书
            if (list4!=null){
	            $("#certType").find("li").each(function(i){
	                $(this).find(".node-count").empty().html(list4[i].courseNum);
	            })
            }
            
            //授课语言
            $("#languageType").find("li").each(function(i){
                $(this).find(".node-count").html(list2[i].courseNum);
            })
            //分类
            $("#categoryType").children("li").each(function(i){
                if (!list3[i].hasChild){
                    $(this).find(".node-count").html(list3[i].courseNum);
                }
                else {
                    $(this).find(".node-count").html(list3[i].courseNum);
                    $(this).find("li").each(function(j){
                        $(this).find(".node-count").html(list3[i].childList[j].courseNum);
                    })
                }
            })
        }
    })
}

function searchCourse(pageIndex){
    if (pageIndex==null){
        pageIndex = 1;
    }
    var searchCon = $.trim($("#searchWord").val());
    if (searchCon==null || searchCon=="" || searchCon==undefined){
        searchCon=="";
    }
    var menuType = $("#currentContent").val();
    var openFlag;
    var fromType ="";//课程来源
    var learningMode = null; //随到随学
    var certArray = [];//证书
    var languageArray = [];//语言
    var categoryArray = [];//分类
    var schoolId=$("#schoolId").val();
    //发布状态
    $("#openType").find("li a").each(function(){
        var $this = $(this);
        if ($this.hasClass("selected")){
            openFlag = $this.attr("openFlag");
        }
    })
    
    //课程来源
    if (!$(".allFromType").hasClass("selected")){
        var j=0;
        var li_count = 0;
        $("#fromType .input-c").each(function(){
        	li_count ++;
            var $this = $(this);
            if ($this.hasClass("selected")){
            	fromType = $this.attr("fromType");
                j++;
            }
        })
        if (j==li_count && j>0){
        	fromType="all";
        }
    }  
    else {
    	fromType="all";
    }  
    
    //随到随学
    $("#learningMode .input-c").each(function(){
        var $this = $(this);
        if ($this.hasClass("selected")){
        	learningMode = 1;
        }
    })

    var tempSchoolId='';

    $("#org .input-r").each(function(){
        var $this = $(this);
        if ($this.hasClass("selected")){
            tempSchoolId = $this.attr('schoolId');
        }
    })
    if ($("#allOrgCourse").hasClass("selected") && tempSchoolId=='') {
        tempSchoolId="-1";
    }

    //tempSchoolId=schoolId;
    sel_schoolId = tempSchoolId;
   
    //证书
    if (!$(".allcert").hasClass("selected")){
        var j=0;
        $("#certType .input-c").each(function(){
            var $this = $(this);
            if ($this.hasClass("selected")){
            	certArray[j]=$this.attr("certType");
                j++;
            }
        })
    }
    else {
    	certArray="all";
    }
    //语言类型
    if (!$(".alllanguage").hasClass("selected")){
        var j=0;
        $("#languageType .input-c").each(function(){
            var $this = $(this);
            if ($this.hasClass("selected")){
                languageArray[j]=$this.attr("languageId");
                j++;
            }
        })
    }
    else {
        languageArray="all";
    }

    //分类
    if (!$(".allSubject").hasClass("selected")){
        var m=0;
        $("#categoryType li").each(function(){
            var $this = $(this).children(".tree-node").find(".input-c");
            if ($this.hasClass("selected")){
                categoryArray[m]= $this.attr("categoryId");
                m++;
            }
        })
    }
    else {
        categoryArray ="all";
    }
    var data = {k:searchCon,n: menuType, f: openFlag,t:fromType,m:learningMode,e:certArray,l:languageArray,c:categoryArray,p:pageIndex,s:tempSchoolId};
    //刷新右侧页面
    History.pushState(null, document.title, menuType+".mooc?" + $.param(data, true));
}

/*所有子node选择与否*/
function setChildrenCheckbox($node) {
    var $subTree = $node.next();
    var $ck = $node.find(".input-c");
    if ($ck.hasClass("selected")) {
        $ck.removeClass("selected");
        $subTree.find(".input-c.selected").removeClass("selected");
        if ($subTree.attr("id") == 'org') {
            $subTree.find(".input-r").removeClass("selected");
        }
    } else {
        $ck.addClass("selected");
        $subTree.find(".input-c").addClass("selected");
        if ($subTree.attr("id") == 'org') {
            $subTree.find(".input-r").first().addClass("selected");
        }
    }

}
/*所有父node选中与否*/
function setParentsCheckbox($node){
    var $item=$node.parent();
    var $pnode=$item.parent().prev(".tree-node");
    if($pnode){
        var $pck=$pnode.find(".input-c");
        if(isAllSelected($node)){
            $pck.addClass("selected");
        }else{
            $pck.removeClass("selected");
        }
        var ulLen=$item.parents("ul").length;
        while(ulLen>2){
            setParentsCheckbox($pnode);
            ulLen--;
        }
    }
    function isAllSelected($node){
        var $ck=$node.find(".input-c");
        if(!$ck.hasClass("selected")){
            return false;
        }
        var b=true
        $node.parent().siblings().each(function(){
            if(!$(this).children(".tree-node").children(".input-c").hasClass("selected")){
                b=false
            }
        });
        return b;
    }
}

function checkCertType(certType){
	$("#certType .input-c").each(function(){		
		var selectCertType = $(this).attr("certType");
		if (certType!="" && certType!=selectCertType){
			$(this).removeClass("selected");
		}
	})
}


$(function(){
    History.Adapter.bind(window, 'statechange', function () {
        loadPage(History.getState().url || window.location.href);
    });
    loadPage(window.location.href);

	//单选
	$(".radioPanel .input-r").click(function(){
		var $this = $(this);
		$(".tree-node .input-r",$this.parents('.radioPanel')).each(function(){
			$(this).removeClass("selected");
		})
		$this.addClass("selected");
        if($this.parents('.tree-nav').attr("id")=='org'){
            $this.parents('.radioPanel').find('.input-c').first().addClass('selected');
        }
		searchCourse();
	})

	/*树 checkbox 事件*/
	$(".checkboxPanel .input-c").click(function(){
		var $node=$(this).parent();
		setChildrenCheckbox($node);
		setParentsCheckbox($node);
		searchCourse();
	});
	
	//输入框回车检索
	$("#searchWord").keydown(function(event) {
		if(event.keyCode == 13) {
			searchCourse();
		}
	})
	
	//搜素
	$(".searchWord").click(function(){
		searchCourse();
	})
	
	
})