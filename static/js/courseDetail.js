var subFavoriteFlag = false;
var courseOpenId ;
var anonymousPreview;
var cur_courseId,cur_courseOpenId,cur_selectType,cur_userStudy,cur_learningMode;
$(function(){

    courseOpenId = $("#courseOpenId").val();

    anonymousPreview = $("#anonymousPreview").val();
	if(anonymousPreview==1){
		loadPreview();
	}
	
	//收藏/退掉课程
	$(".subFavorite").click(function(){
		var courseId = $("#courseId").val();
		var guest = $("#guest").val();
		if (guest=='false'){//登录
			var $this = $(this);
			var operType="add";
			
			if ($this.find(".icon-favor").hasClass("selected")){ //已经收藏
				operType="sub";
			}
			if (subFavoriteFlag==false){
				subFavoriteFlag = true;
			}
			else {
				$.dialog.warn("正在处理中...");
				return;
			}
			$.ajax({
				type:'post',
				url: CONTEXTPATH+"/portal/chaseCourse.mooc",
				data:{
					courseId:courseId,
					courseOpenId:courseOpenId,
					operType:operType
				},
				success:function(result){
					subFavoriteFlag = false;
					if (result.retCode=="success"){
						$.dialog.success("操作成功！");
						var favoriteNum = parseInt($this.find("#favoriteNum").attr("favoriteNum"),0);
						if (operType=="sub"){
							var sum = favoriteNum -1 ;
							$this.find("#favoriteNum").html(sum +" "+Msg.get("potal.studyperson"));
							$this.find("#favoriteNum").attr("favoriteNum",sum);
							if (sum>0){
								$this.find("#favoriteNum").show();
							}
							else {
								$this.find("#favoriteNum").hide();
							}
							$this.find(".icon-favor").removeClass("selected");
						}
						else {
							var sum = favoriteNum +1 ;
							$this.find("#favoriteNum").attr("favoriteNum",sum);
							$this.find("#favoriteNum").html(sum +" "+Msg.get("potal.studyperson")).show();
							$this.find(".icon-favor").addClass("selected");
						}
					}
					else {
						$.dialog.error(Msg.get("mooc.operation.failure"));
					}
				}
			})
		}
		else {			
			var hisrotyUrl=CONTEXTPATH+"/portal/course/"+courseId+"/"+courseOpenId+".mooc";
			location.href=CONTEXTPATH+"/home/login.mooc?historyUrl="+encodeURIComponent((new Base64()).encode(hisrotyUrl));
		}
		
	})	
	

	
	function loadPreview(){
		$.ajax({
			type:'post',
			url: CONTEXTPATH+"/course/preview/"+courseOpenId+".mooc",
			data:{
				courseOpenId:courseOpenId
			},
			success:function(result){
				$("#course_related").html(result);
			}
		})
	}


	
	//加入课程
	$("#joinCourse").click(function(){
        if($(this).hasClass('btn-disabled')){
            return;
        }else{
		var isCanStudy = $(this).attr("isCanStudy");
		var courseId = $("#courseId").val();
		var courseOpenId = $("#courseOpenId").val();
		var openObjectType = $(this).attr("openObjectType");
		var learningMode = $("#learningMode").val();
		var guest = $("#guest").val();
		if (guest=='true'){  //登陆再报名
			var hisrotyUrl=CONTEXTPATH+"/portal/course/"+courseId+"/"+courseOpenId+".mooc";
			location.href=CONTEXTPATH+"/home/login.mooc?historyUrl="+(new Base64()).encode(hisrotyUrl);
		}else if($("#needSendMail").val()=='false'){//todo:根据后续业务调整该参数
            $.ajax({
                type:'post',
                data:{
                    courseOpenId:courseOpenId,
                    userStudy:20
                },
                url:CONTEXTPATH+"/portal/addCourse.mooc",
                beforeSend:function(){
                    $("#joinCourse").addClass('btn-disabled');
                },
                success:function(result){
                    if (result.retCode=="success"){
                        $.dialog.success(Msg.get("mooc.operation.success"));
                        study();
                    } else if (result.retCode=="isPrice"){
                        $.dialog.warn(Msg.get("mooc.operation.isPrice"));
                    } else{
                        $.dialog.error(Msg.get("mooc.operation.failure"));
                    }
                    $("#joinCourse").removeClass('btn-disabled');
                }
            })
        }
		else { 
			//选择修学分/兴趣爱好
			checkUserName(courseId,courseOpenId,"score",null,learningMode);
		}
        }
	})
	
	
	//进入课程 /开始学习/继续学习
	$(".studySession,#studyCourse").click(function(){
		study();
	})
	
	//选择班次，刷新课程开课信息
	$(".class-select").select({
		change:function(){
			var courseOpenId = this.value;
			$("#courseOpenId").val(this.value);
			var courseId = $("#courseId").val();		
			location.href=CONTEXTPATH+"/portal/course/"+courseId+"/"+courseOpenId+".mooc";
		}
	});
	
	//教师详细
	$(".pview-item").click(function(){
		var teacherId = $(this).attr("teacherId");
		var courseOpenId = $("#courseOpenId").val();
		location.href=CONTEXTPATH+"/portal/teacher/"+ courseOpenId + "/" +teacherId+".mooc";
	})
	
	//预览课程
	$("#previewCourse").click(function(){
		var courseOpenId = $("#courseOpenId").val();
		location.href=CONTEXTPATH+"/portalPreview/session/bulletin/preview/"+courseOpenId+".mooc";
	})
	
	//兴趣爱好选课
	$(".btn-interest").click(function(){
        if($(this).hasClass('btn-disabled')){
            return;
        }else{
        $(this).addClass('btn-disabled');
		var courseId = $("#courseId").val();
		var courseOpenId = $("#courseOpenId").val();
		var userStudy = "20" ;//兴趣爱好
		checkUserName(courseId,courseOpenId,"interest",userStudy);
        }
	})
	
	//申请证书
	$("#applyCent").click(function(){
		var courseOpenId = $("#courseOpenId").val();
		location.href=CONTEXTPATH+"/portal/cert/goApplyCert/"+courseOpenId+".mooc";
	})
	
	
	//用户加入本校并选课
	$("#addUserSchool").click(function(){
		var isCanSelect = $("#isCanSelect").val();
		if (isCanSelect=="1"){  //不能选课
			$("#addUserSpocSchool").load(CONTEXTPATH + "/portal/session/addUserSpocSchool.mooc",function() {
				$.dialog( {
					title : Msg.get("mooc.dialog.tip"),
					id:"addUserSpocSchool",
					content : $("#addUserSpocSchool .dialog")[0],
					width : "400px",
					lock : true
				});
			});
		} else if (isCanSelect=="2"){   //审核未通过
			$.dialog.warn("加入专属课程的申请正在审核处理中！");
		} else if (isCanSelect=="3"){ //能选，但只能兴趣爱好
			var courseId = $("#courseId").val();
			var courseOpenId = $("#courseOpenId").val();
			var userStudy = "20" ;//兴趣爱好
			checkUserName(courseId,courseOpenId,"interest",userStudy);
		} else if (isCanSelect=="4"){ //学校未开放
			$.dialog.warn("学校专属课程，未对外开放，不能加入！");
		}
	})
    $("#coursePay").click(function(){
        var courseOpenId = $("#courseOpenId").val();
        location.href=CONTEXTPATH+"/portal/payCourse-"+courseOpenId+".mooc";
    })
})

//检测当前用户密码是否设置了
function checkUserName(courseId,courseOpenId,selectType,userStudy,learningMode){
    cur_courseId=courseId;cur_courseOpenId=courseOpenId;cur_selectType=selectType;cur_userStudy=userStudy;cur_learningMode=learningMode;
    $.ajax({
        type:'post',
        url:CONTEXTPATH+"/portal/session/checkUserName.mooc",
        data:{courseOpenId:courseOpenId},
        success:function(result){
            if (result.retCode=="false"){ //设置用户名
                var backUrl = CONTEXTPATH+"/portal/course/"+courseId+"/"+courseOpenId+".mooc";
                $("#setUserPassword").load(CONTEXTPATH + "/home/noneUserPassword.mooc",{"backUrl":backUrl},function() {
                    $.dialog( {
                        title : Msg.get("mooc.dialog.tip"),
                        id:"setUserPassword",
                        content : $("#setUserPassword .dialog")[0],
                        width : "600px",
                        lock : true
                    });
                });
            }else if(result.retCode=='noneUsername'){ //合作机构，需要真实姓名
                var backUrl = CONTEXTPATH+"/portal/course/"+courseId+"/"+courseOpenId+".mooc";
                $("#setUserNameAanEmail").load(CONTEXTPATH + "/portal/session/setUsernameAndEmail.mooc",{"backUrl":backUrl},function() {
                    $.dialog( {
                        title : Msg.get("mooc.dialog.tip"),
                        id:"setUserNameAanEmail",
                        content : $("#setUserNameAanEmail .dialog")[0],
                        width : "600px",
                        lock : true
                    });
                });
            }else if(result.retCode=='validateEmail'){
                $("#selectStudyType").load(CONTEXTPATH + "/portal/session/validateEmail.mooc",{},function() {
                    $.dialog( {
                        title : Msg.get("mooc.dialog.tip"),
                        id:"selectStudyStatus",
                        content : $("#selectStudyType .dialog")[0],
                        width : "600px",
                        lock : true
                    });
                });
            }
            else if (result.retCode=="success"){
                if(result.orgFlag){
                    if (result.orgName=="bdu") {
                        var msg = '';
                        msg = '<div class="aui-content"><i class="icon-quesion"></i>学习这门课程，你必须同意自动注册大数据大学(BigDataUniversity.com.cn)并订阅新闻更新' +
                            '(<a class="link-action" href="http://www.bigdatauniversity.com.cn/tos" target="_blank">阅读条款</a>)。<br/>';

                        if (result.registFlag) {
                            msg += '已为您创建过登录邮箱为' + result.email + '的账号。</div>';
                            $('#orgPwd').val('');
                        } else {
                            msg += '将为您创建登录邮箱为' + result.email + '，密码为' + result.pwd +
                                '的账号（注：如果在大数据大学已经注册该邮箱，请使用原密码登录）。</div>';
                            $('#orgPwd').val(result.pwd);
                        }

                        $.dialog({
                            id: gM.getRID('Confirm'),
                            fixed: true,
                            lock: true,
                            content: msg,
                            ok: function () {
                                doSelect(courseId, courseOpenId, selectType, userStudy, learningMode);
                            },
                            cancel: function () {
                                $(".btn-interest").removeClass('btn-disabled');
                            },
                            okValue: '同意',
                            cancelValue: '不同意'
                        });
                    } else {
                        doSelect(courseId,courseOpenId,selectType,userStudy,learningMode);
                    }
                }else{
                    doSelect(courseId,courseOpenId,selectType,userStudy,learningMode);
                }
            }
        }
    })
}

function doSelect(courseId,courseOpenId,selectType,userStudy,learningMode){
    if (selectType=="interest"){//兴趣爱好
        var orgPwd = '';
        if($('#orgPwd')!=null){
            orgPwd = $('#orgPwd').val();
        }
        $.ajax({
            type:'post',
            data:{
                courseOpenId:courseOpenId,
                userStudy:userStudy,
                orgPwd:orgPwd
            },
            url:CONTEXTPATH+"/portal/addCourse.mooc",
            success:function(result){
                if (result.retCode=="success"){
                    $.dialog.success(Msg.get("mooc.operation.success"));
                    study();
                } else if (result.retCode=="isPrice"){
                    $.dialog.warn(Msg.get("mooc.operation.isPrice"));
                } else{
                    $.dialog.error(Msg.get("mooc.operation.failure"));
                }
                $(".btn-interest").removeClass('btn-disabled');
            }
        })
    }
    else {
        //修学分
        if (learningMode==0){
            $("#selectStudyType").load(CONTEXTPATH + "/portal/session/selectStudy.mooc",{"courseOpenId":courseOpenId,"learningMode":learningMode},function() {
                $.dialog( {
                    title : Msg.get("mooc.dialog.tip"),
                    id:"selectStudyStatus",
                    content : $("#selectStudyType .dialog")[0],
                    width : "600px",
                    lock : true
                });
            });
        }
        else if (learningMode==1){//随到随学
            $("#selectStudyType").load(CONTEXTPATH + "/portal/session/selectStudy.mooc",{"courseOpenId":courseOpenId,"learningMode":learningMode},function() {
                $.dialog( {
                    title : "选择课程提示",
                    id:"learningModeStudy",
                    content : $("#selectStudyType .dialog")[0],
                    width : "780px",
                    lock : true
                });
            });
        }
    }
}

//学习链接
function study(){
    var courseOpenId = $("#courseOpenId").val();
    location.href=CONTEXTPATH+"/portal/session/index/"+courseOpenId+".mooc";
}