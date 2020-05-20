var submitFlag = false;
var submitSendFlag = false;
var submitPassFlag = false;
var LoginCallback;
$(function(){
	$(".panel-login #loginName").focus();
	$(".panel-body .input-r").click(function(){
		var $this = $(this);
		$(".panel-body .input-cr .input-r").each(function(){
			$(this).removeClass("selected");
		})
		$this.addClass("selected");
	})
	
	$(".panel-body .input-c").click(function(){
		var $this = $(this);
		if ($this.hasClass("selected")){
			$this.removeClass("selected");
		}
		else {
			$this.addClass("selected");
		}
	})
	//初始化页面
	if ($('#check_code:visible').length > 0 || $("#openCheckCode").val()=='true') {
		 initImage();
	}
	
	//登陆页面的验证码
	$(".panel-login #checkCode").keyup(function(event) {
		var checkCode = $.trim($("#checkCode").val());
    	if (checkCode.length>0){
    		$(".public-checkCode").addClass("publicTip");
    	}
    	else{
    		$(".public-checkCode").removeClass("publicTip");
    	}
    	if(event.keyCode==13){
    		$("#userLogin").trigger("click");
    	}
	})
    //登陆页面--登录名
    $(".panel-login #loginName").keyup(function(event) {
        var loginName = $.trim($("#loginName").val());
        if (loginName.length >0 && event.keyCode == 13){
            $(".panel-login #password").focus();
        }
    })

    //登陆页面--密码
    $(".panel-login #password").keyup(function(event) {
        var password = $.trim($("#password").val());
        if (password.length>0 && event.keyCode == 13){
            $("#userLogin").trigger("click");
        }
    })
    
    //注册页面-密码
     $(".panel-regist #password").keyup(function(event) {
        var password = $.trim($("#password").val());
        if (password.length>0){
            $(".public-pwd1-tip").addClass("publicTip");
        }
        if (event.keyCode == 13){
        	$("#confirmPassword").focus();
        }
    }) 
    //注册页面-确认密码
    $(".panel-regist #confirmPassword").keyup(function(event) {
        var confirmPassword = $.trim($("#confirmPassword").val());
        if (confirmPassword.length>0){
            $(".public-confirmPassword-tip").addClass("publicTip");
        }
        if (event.keyCode == 13){
        	$("#userRegister").trigger("click");
        }
    })
	
    //注册页面-邮箱
     $(".panel-regist #email").keyup(function(event) {
        var email = $.trim($("#email").val());
        if (email.length>0){
        	$(".public-email").addClass("publicTip");
        }
        else{
    		$(".public-email").removeClass("publicTip");
    	}
        if (event.keyCode==13){
        	$(".panel-regist #password").focus();
        }
    }) 
        
    //统一身份登陆/用户登陆切换
	$(".panel-login-spoc").find(".panel-title").click(function(){
		$(".panel-title").removeClass("current");
		$(this).addClass("current");
		var _index=$(this).index(".panel-title");
		var $tab =$(".panel-login-spoc").find(".panel-tab");
		$tab.hide();
		$($tab.get(_index)).show();
		var loginType = $(this).attr("loginType");
		if (loginType=='1'){ //统一身份认证
			$(".panel-auth-common").removeClass("publicTip");
			$(".panel-login-common").addClass("publicTip");
		}
		else { //用户登陆
			$(".panel-login-common").removeClass("publicTip");
			$(".panel-auth-common").addClass("publicTip");
		}
	});

	$("#changeCode").click(function(){
		changeimg();
	})

	
	//用户登录	
	var loginNum = 0;
	$("#userLogin").click(function(){
		var key;
		var strToken;
		var loginType="0";
		$("#activeEmailMsg").addClass("publicTip");
		$("#activeStudentMsg").addClass("publicTip");
		$("#errorMsg").addClass("publicTip");
		var password = $.trim($("#password").val());
		var loginName = $.trim($("#loginName").val());
		if (loginName.length==0){
			$('#errorMsg').find("span").empty().html(Msg.get("login.null"));
			$('#errorMsg').removeClass("publicTip");
			return;
		}
		else {
			//若有全角转换成半角
			loginName = fullChar2halfChar(loginName);
			if (loginName.indexOf("@")>0){
	        	if (!checkMail(loginName)){
	        		$('#errorMsg').find("span").empty().html(Msg.get("email.style.error"));
	        		$('#errorMsg').removeClass("publicTip");
		        	return;
	        	}			
		    }
			else{
				$('#errorMsg').addClass("publicTip");
			}
		}
		if (password.length==0){
			$('#errorMsg').find("span").empty().html(Msg.get("password.null"));
			$('#errorMsg').removeClass("publicTip");
			return;
		}
		else {
			$('#errorMsg').addClass("publicTip");
		}
       
        var	isCheckCode = 0;
        var checkCode;
        if ($('#check_code:visible').length > 0) {
             checkCode = $("#checkCode").val();
            if (!checkCode) {
            	$('#errorMsg').find('.errorMsg').empty().html(Msg.get("checkCode.error"));
            	$('#errorMsg').removeClass("publicTip");
        		$("#checkCode").html('');
                return;
            }
            $('#checkCode').val('');
            isCheckCode = 1; //有验证码
            $("#activeStudentMsg").addClass("publicTip");
            $("#activeStudentMsg").addClass("publicTip");
        } 
        
        var token ;
		var tokenId = $("#tokenId").val();
		setMaxDigits(130); 
		var modulus = $("#modulus").val();
		var exponent = $("#exponent").val();	
		key = new RSAKeyPair(exponent,"",modulus);
		if ($("#autoLogin").hasClass("selected")){
			loginType = "selected";//选择了一周内登录有效
			var time = new Date().getTime();   
			token = tokenId+"\n"+time+"\n"+password;
		}
		else {
			token = tokenId+"\n"+password;
		}
		strToken = encryptedString(key, token);
		var historyUrl = $("#historyUrl").val();
		var lang = $(".dk-selected").find("span").attr("lang");
		if (submitFlag==false){
			$(this).empty().text(Msg.get("user.loggingin"));
			submitFlag = true;
		}
		else {
			return;
		}
		var loginStyle = $(this).attr("loginStyle"); //登陆方式：1：正常登陆，2：ajax重新登陆
		var sysCode = $(this).attr("sysCode")==null?"":$(this).attr("sysCode");
		$.ajax({
			type:'post',
			datatype : "json",
			url : CONTEXTPATH+"/home/doLogin.mooc",
			data:{
				loginName:loginName,
				strToken:strToken,
				loginType:loginType,
				isCheckCode:isCheckCode,
				checkCode:checkCode,
				historyUrl:historyUrl,
				lang:lang
			},
	        success:function(result){
				//登录成功后，跳转到 个人主页
                var newUrl = "";
				if (result.retCode=="success"){
					if ("1"==loginStyle){  //1：正常登陆
                        loginSuccessHref(result);
					}
					else if ("2"==loginStyle){  //2：ajax重新登陆
						$.dialog({id:"reLoginDialog"}).close();
                        if(LoginCallback!=null&&typeof LoginCallback == 'function'){
                            LoginCallback();
                        }
					}
				}
				else {
					submitFlag = false;
					$("#userLogin").empty().text(Msg.get("user.login"));
					if (result.retCode=="610008") { //未激活
						if (sysCode!=null && sysCode!="" && sysCode=="org_cloud"){ //知途网
							$("#errorMsg").find("span").html(result.retMsg);
							$("#errorMsg").removeClass("publicTip");
						}else{
							if (result.isEmail){
								$("#activeEmailMsg").removeClass("publicTip");
							}
							else {
								$("#activeStudentMsg").removeClass("publicTip");
							}
						}
					}else if(result.retCode=="610033"){
                        var loginIp = result.loginIp;
                        $.dialog.confirm("当前用户已经在IP为["+loginIp+"]的电脑登录，要注销已登录用户吗？", function () {
                            setCookie("rlb","1");
                            $.ajax({
                                type:'post',
                                data:{
                                    loginName:result.loginName,
                                    strToken:result.strToken,
                                    loginType:result.loginType,
                                    isCheckCode:result.isCheckCode,
                                    checkCode:'',
                                    historyUrl:result.historyUrl,
                                    lang:lang
                                },
                                url:CONTEXTPATH+"/home/doLogin.mooc",
                                beforeSend:function(xhr){
                                    $.dialog({
                                        content:"<img src='../../../images/loading.gif'  width='25'>",
                                        width:"200px",
                                        lock:true
                                    });
                                },
                                success:function(result){
                                    if (result.retCode=="success"){
                                        loginSuccessHref(result);
                                    }
                                }
                            })
                        },function(){})
                    }
					else { 
						$("#errorMsg").find("span").html(result.retMsg);
						$("#errorMsg").removeClass("publicTip");
					}
					//服务器端判断超过3次登录失败，出现验证码
					if (result.retCode != "610033") {
						loginNum = result.loginCount;
						if (loginNum >= 3) {
							initImage();
						}
					}
				}
		    },
		    error:function(){
			}
		})
	})

	function changeimg()
	{
		var myimg = document.getElementById("myimg");
		myimg.src="changeForgetImage.mooc?"+Math.random();//随机生成一个数字，让图片缓冲区认为不是同一个缓冲区
	}

    function loginSuccessHref(result){
        var isHasSchoolCourse = result.isHasSchoolCourse
        if (result.historyUrl==null || result.historyUrl==""){
            //根据用户的不同身份，默认跳转到不同的主页
            var dignity = result.dignity;
            if (dignity==10){ //超管
                newUrl = "/home/admin.mooc?checkEmail=" + result.checkEmail;
            }
            else if (dignity==20){ //校管
                /*if (isHasSchoolCourse=='1'){//课程工作室
                    newUrl = "/school/course/index.mooc";
                }
                else{ //学校后台
                    newUrl = "/school/operate/school/index.mooc";
                }*/
                newUrl = "/platform/schoolhome.mooc?checkEmail=" + result.checkEmail;
            }
            else if (dignity==30){ //教师
                if (isHasSchoolCourse=='1'){
                    newUrl = "/school/course/index.mooc?checkEmail=" + result.checkEmail;
                }
                else {//学习中心
                    newUrl="/portal/myCourseIndex/1.mooc?checkEmail=" + result.checkEmail;
                }
            }
            else {
                newUrl="/portal/myCourseIndex/1.mooc?checkEmail=" + result.checkEmail;
            }
        }
        else{
            newUrl = result.historyUrl;
        }
        location.href = (CONTEXTPATH+"/home/doAuth.mooc?bu="+encodeURIComponent(newUrl));

    }

	$("#loginName").blur(function(){
		var loginName = $("#loginName").val();
		if(loginName.length > 0){
			$.ajax({
				type:'post',
				url:CONTEXTPATH+'/home/userLoginCount.mooc',
				data:{
					loginName:loginName
				},
				success:function(result){
					if (result.loginCount>=3){
						initImage();
					}
				}
			});
		}
	});

	//发送邮件--忘记密码
	$("#sendMail").click(function(){
		if ($("#checkCode").val()==null || $("#checkCode").val()==""){
			$('.public-send-tip').find(".tip").html("验证码不能为空");
			$('.public-send-tip').removeClass("publicTip");
			return;
		}
		var checkCode=$("#checkCode").val();
		$("#activeEmailMsg").addClass("publicTip");
		var activeType="2"; //忘记密码
		$(".public-send-tip").addClass("publicTip");
		var passwordType = $("#passwordType").val();
		var backUrl = $("#backUrl").val();
		var sysCode = $(this).attr("sysCode");
		var setType ="0";
		var email= $.trim($("#email").val());
		if (email.length==0){
			$('.public-send-tip').find(".tip").html(Msg.get("email.null")).parent().removeClass("publicTip");
			return;
		}
		email = fullChar2halfChar(email);
		if (!checkMail(email)){
    		$('.public-send-tip').find(".tip").html(Msg.get("email.style.error"));
    		$('.public-send-tip').removeClass("publicTip");
        	return;
    	}
		if("1"==passwordType){ //统一身份认证设置账号/密码
			activeType="7";
			setType = $("#setType").val();  //"1"统一身份认证设置，不需要设置密码，"0"需要设置密码
			var setEmail = $("#setEmail").val();
			if (setEmail!=null && setEmail!="" && setEmail!=email){
				$('.public-send-tip').find(".tip").html("设置的邮箱与绑定的邮箱不符合！").parent().removeClass("publicTip");
				return;
			}
		}

        $.ajax({
        	type:'post',
        	url:CONTEXTPATH+'/home/doMail.mooc',
        	data:{
        		email:email,
        		activeType:activeType,
        		backUrl:backUrl,
        		setType:setType,
				checkCode:checkCode
        	},
        	success:function(result){
				//changeimg();
        		if (result.retCode=='success'){ //成功
        			$.dialog.success("发送成功！");
			    	$("#userResetPwd").load(CONTEXTPATH+"/home/mailbox.mooc",{"email": email,"activeType":activeType},function(){
			    		$.dialog({
			    			title: Msg.get("home.gomailbox"),
			    			content:$("#userResetPwd .dialog")[0],
			    			width:"600px",
			    			lock:true
			    		});
			    	});
        		}
        		else{
					initImage();
        			if (result.retCode=="610022"){
        				$("#activeEmailMsg").removeClass("publicTip");
        			}
        			else {
        				$(".public-send-tip").find(".tip").html(result.retMsg);
        				$(".public-send-tip").removeClass("publicTip");
        			}
        		}
        	}
        })
        
	})
	
	//用户注册
	$("#userRegister").click(function(){
		$(".public-email").addClass("publicTip");
		$('.public-confirmPassword-tip').addClass("publicTip");
		$(".public-pwd1-tip").addClass("publicTip");
		$("#errorMsg").parent().addClass("publicTip");
		$("#noActiveLoginMsg").addClass("publicTip");
        $(".public-verifyCode").addClass("publicTip");

		var email= $.trim($("#email").val());
		if (email.length==0){
			$(".public-email").find("span").html(Msg.get("email.null"));
			$(".public-email").removeClass("publicTip");
			return;
		}else{
		    //若有全角转换成半角
		    email = fullChar2halfChar(email);
	        if(!checkMail(email)){        	
	        	$(".public-email").find("span").html(Msg.get("email.style.error"));
	        	$(".public-email").removeClass("publicTip");
	        	return;
	        }
	        $(".public-email").addClass("publicTip");
		}
        var password = $.trim($("#password").val());
        //密码位数控制
		var middle = checkStrong(password);
		if (middle==0){ //位数小于8
			$('.psw-tip').addClass("publicTip");
			$('.public-pwd1-tip').find("span").html(Msg.get("user.checkPassword"));
			$('.public-pwd1-tip').removeClass("publicTip");
			return;
		}else if(middle==-1) {
            $('.psw-tip').addClass("publicTip");
            $('.public-pwd1-tip').find("span").html(Msg.get("user.incorrectPasswordFormat"));
            $('.public-pwd1-tip').removeClass("publicTip");
            return;
		}
        var confirmPassword =  $.trim($("#confirmPassword").val()); //确认密码
        if (confirmPassword.length==0){
        	$('.public-confirmPassword-tip').find("span").html(Msg.get("password.null"))
    		$('.public-confirmPassword-tip').removeClass("publicTip");
			return;
		}
        else {
        	if (password!=confirmPassword){
        		$('.public-confirmPassword-tip').find("span").html(Msg.get("confirmPassword.error"))
        		$('.public-confirmPassword-tip').removeClass("publicTip");
        		return
        	}
        	else {
        		$('.public-confirmPassword-tip').find("span").html(Msg.get("password.null"))
        		$('.public-confirmPassword-tip').addClass("publicTip");
        	}
        }
        var passKey;
        //手机号/短信验证码

        var mobile = $("#mobile").val()==null?"": $("#mobile").val();
		if (mobile!=null && mobile!=""){
			if (!checkPhone(mobile)){
				$(".public-mobile").removeClass("publicTip");
				return;
			}
			var verifyCode = $("#verifyCode").val();
			if (verifyCode==null || verifyCode==""){
				$(".public-verifyCode").removeClass("publicTip");
				return;
			}
		}
		setMaxDigits(130); 
		var modulus = $("#modulus").val();
		var exponent = $("#exponent").val();	
	    var key = new RSAKeyPair(exponent,"",modulus);
	    var pwd = password+"\n"+confirmPassword;
		var strPassword = encryptedString(key, pwd);
		if (!$(".userService").hasClass("selected")){
			$("#errorMsg").find("span").empty().html(Msg.get("user.checkagreement"));
			$("#errorMsg").parent().removeClass("publicTip");
			return;
		}
		else{
			$("#errorMsg").parent().addClass("publicTip");
		}
		if (submitFlag==false){
			$(this).find("span").empty().text("正在提交中...");
			submitFlag = true;
		}
		else {
			return;
		}
		$.ajax({
			type:"post",
			url:CONTEXTPATH+"/home/doRegister.mooc",
			data:{
				email:email,
				mobile:mobile,
				password:strPassword,
				passKey:passKey,
				verifyCode:verifyCode
			},
			success:function(response){
				submitFlag=false;
				if (response.returnCode=='success'){
                    $("#userRegister").find("span").empty().text("注册");
                    $("#email").val("");
                    $("#mobile").val("");
                    $("#verifyCode").val("");
                    $("#password").val("");
                    $("#confirmPassword").val("");
                    timerEnd($("#sendCode"), $(".input-code"));
					var activeType ="1"; //账户激活
			    	$("#userMail").load(CONTEXTPATH+"/home/mailbox.mooc .dialog-mail-verify",{"email": email,"activeType":activeType},function(){
			    		$.dialog({
			    			title:Msg.get("home.gomailbox"),
			    			content:$("#userMail .dialog")[0],
			    			width:"600px",
			    			lock:true
			    		});
			    	});
				}
				else {
					$("#userRegister").find("span").empty().text("注册");
					if (response.returnCode=='610022'){ //账户未激活 
						$("#noActiveLoginMsg").removeClass("publicTip");
					}else if (response.returnCode=='610030'){ //手机号码已经存在
						$(".public-mobile").find("span").html("手机号已注册");
						$(".public-mobile").removeClass("publicTip");
						$("#mobile").focus();
					}else if (response.returnCode=='610031'){//短信码已过期
						$(".public-verifyCode").find("span").html(response.retMsg);
						$(".public-verifyCode").removeClass("publicTip");
					}
					else {
						$(".public-email").find("span").html(response.retMsg);
						$(".public-email").removeClass("publicTip");
						$("#email").focus();
					}
				}
			},
			error:function(){
			}
		})
	})
	
    $('#password').keyup(function() {
    	var newpassword = $.trim($("#password").val());
    	if (newpassword.length>0 ){
    		//密码强度弱
    		var middle = checkStrong(newpassword);
    		if (middle==0){ //位数小于8
    			$('.psw-tip').addClass("publicTip");
    			$('.public-pwd1-tip').find("span").html(Msg.get("user.checkPassword"));
    			$('.public-pwd1-tip').removeClass("publicTip");
    		}else if(middle==-1) {
                $('.psw-tip').addClass("publicTip");
                $('.public-pwd1-tip').find("span").html(Msg.get("user.incorrectPasswordFormat"));
                $('.public-pwd1-tip').removeClass("publicTip");
            }
    		else{
    			$('.public-pwd1-tip').addClass("publicTip");
	    		if (middle==1){ //弱
	    			$('.psw-tip').removeClass("middle strong publicTip");
	    			
	    		}
	    		if (middle ==2){ //中
	    			$('.psw-tip').removeClass("middle strong publicTip").addClass("middle");
	    			
	    		}
	    		if (middle==3){ //强
	    			$('.psw-tip').removeClass("middle strong publicTip").addClass("strong");
	    		}
    		}
    	}
    	else {    		
    		$('.psw-tip').addClass("publicTip");
    		$('.public-pwd1-tip').find("span").html(Msg.get("password.null"));
    		$('.public-pwd1-tip').removeClass("publicTip");
    	}
    })
	 
	//进入邮箱
	$('#enterEmail').live("click",function() {
		var email = $(this).attr("email");
        openEmailUrl(email);
	})

	//重设密码后5秒后自动登录
	$("#loginLink").click(function(){
		location.href=CONTEXTPATH+"/protal/myCourseIndex/1.mooc";
	})
	
	function skipLink(){  
	    var s = 5;  //用来记录秒	    
	    timeOut = setInterval(function() {
	        s--;
	        if (s == 0) {
	        	if (activeType=='2'){
	        		location.href=CONTEXTPATH+"/home/login.mooc";//5秒后跳转
	        	}
	        	else if (activeType=='6'){
	        		var backUrl = $("#backUrl").val();
	        		location.href=CONTEXTPATH+backUrl;
	        	}
	        }
	        else{
	        	$('#reloadUrl').html(s);
	        }
	    }, 1000);
	}
    var activeType = $("#activeType").val();
    var activeFlag = $("#activeFlag").val();
    if ((activeType=="2" || activeType=="6") && activeFlag=="success" ){
    	skipLink(activeType);
    }
    
    //查看签约学校
    $("#doViewLinkSchool").click(function(){
    	$("#viewLinkSchool").load(CONTEXTPATH+"/school/viewLinkSchool.mooc",function(){
    		$.dialog({
    			title:Msg.get("view.school"),
    			content:$("#viewLinkSchool .dialog")[0],
    			width:"880px",
    			lock:true,
    			init:function(){
    				$('.scroll-pane').jScrollPane();
    			}
    		});
    	});
    })      
    
    //激活发送邮件-针对邮件地址
    function activeMail(email){
    	var activeType = "1";
    	$.ajax({
    		type:'post',
    		data:{
    			email:email,
    			activeType:activeType
    		},
    		url:CONTEXTPATH+"/home/sendMail.mooc",
    		success:function(result){
		    	$("#userMail").load(CONTEXTPATH+"/home/mailbox.mooc .dialog-mail-verify",{"email": email,"activeType":activeType},function(){
		    		$.dialog({
		    			title:Msg.get("home.gomailbox"),
		    			content:$("#userMail .dialog")[0],
		    			width:"600px",
		    			lock:true
		    		});
		    	});
    		},
    		error:function(){
    			  
    		}
    	})
    }
    
    //登陆-马上激活
    $("#activeMail").click(function(){
    	var email = $.trim($("#loginName").val());
    	if (email.length>0){
    		 //若有全角转换成半角
		    email = fullChar2halfChar(email);
	    	activeMail(email);
    	}
    })
   
    //忘记密码-未激活发送激活邮件
    $("#activeMail-forgetPass").click(function(){
    	var email = $.trim($("#email").val());
    	if (email.length>0){
	    	 //若有全角转换成半角
		    email = fullChar2halfChar(email);
		    if (email.indexOf("@")>0){
	        	if (!checkMail(email)){
	        		$.dialog.error(Msg.get("email.style.error"));
		        	return;
	        	}
	        	activeMail(email);
		    }
    	}
    })
    
    //重新发送邮件
    $("#reSendMail").live("click",function(){
    	var email = $(this).attr("email");
    	var activeType = $(this).attr("activeType");
    	var backUrl = $("#backUrl").val();
    	$.ajax({
    		type:'post',
    		data:{
    			email:email,
    			activeType:activeType,
    			backUrl:backUrl
    		},
    		url:CONTEXTPATH+"/home/sendMail.mooc",
    		success:function(result){
    			  $.dialog.success(Msg.get("mooc.operation.success"));
    		},
    		error:function(){
    			  
    		}
    	})
    })
    
    function initImage(){
    	var url = CONTEXTPATH+"/home/changeImage.mooc";
		$.ajax( {
			type : 'post',
			url : url,
			success : function(data) {
				$('#changeImage').html(data).parents(".input-group-code").removeClass("publicTip");
			}
		})
    }
    //图片切换
	$('#changeImage').click(function(){
		initImage();
	});
	
	
	//保存设置密码
	$("#resetPwd").click(function(){
		var passKey = $("#passKey").val();
		var activeType = $("#activeType").val();
		var email = $.trim($("#email").val());
		var backUrl = $("#backUrl").val();
		var password = $.trim($("#password").val());
		if (password.length==0){
			$('.public-pwd1-tip').removeClass("publicTip");
	     	return;
		}
		else {
			 //密码位数控制
			var middle = checkStrong(password);
			if (middle==0){ //位数小于8
				$('.psw-tip').addClass("publicTip");
				$('.public-pwd1-tip').find("span").html(Msg.get("user.checkPassword"));
				$('.public-pwd1-tip').removeClass("publicTip");
				return;
			}else if(middle==-1) {
                $('.psw-tip').addClass("publicTip");
                $('.public-pwd1-tip').find("span").html(Msg.get("user.incorrectPasswordFormat"));
                $('.public-pwd1-tip').removeClass("publicTip");
                return;
            }
			else{
				$('.public-pwd1-tip').addClass("publicTip");
				var cofirmPwd = $.trim($("#confirmPwd").val());
				if (cofirmPwd.length==0){
					$('.public-confirmPwd-tip').removeClass("publicTip");
			     	return;
				}
				else {
					if(cofirmPwd!=password){
						$('.public-confirmPwd-tip').find("span").html(Msg.get("home.resetpass.error"));
						$('.public-confirmPwd-tip').removeClass("publicTip");
						return;
					}
					else {
						$('.public-confirmPwd-tip').addClass("publicTip");
					}
				}
			}
		}
		var hashPassword = $.md5(password);
		$.ajax({
    		type:'post',
    		data:{
    			email:email,
    			password:hashPassword,
    			activeType:activeType,
    			passKey:passKey
    		},
    		url:CONTEXTPATH+"/home/doResetPwd.mooc",
    		success:function(result){
    			if (result.returnCode=="success") {
	    			if (activeType==8){
	    				location.href=CONTEXTPATH+"/home/resetPage/"+result.activeType+"/"+result.returnCode+".mooc?email="+email;
	    			} else if (activeType==7){
	    				location.href=CONTEXTPATH+"/home/resetPage/"+result.activeType+"/"+result.returnCode+".mooc?email="+result.retEmail+"&backUrl="+backUrl;
	    			} else if (activeType==10){
	    				location.href=CONTEXTPATH+"/home/resetPage/"+result.activeType+"/"+result.returnCode+".mooc?email="+email+"&backUrl="+backUrl;
	    			} else {
	    				location.href=CONTEXTPATH+"/home/resetPage/"+result.activeType+"/"+result.returnCode+".mooc";
	    			}
    			} else if (result.returnCode=="false") {
    				$.dialog.error("不存在该用户！");
    			} else{
					$.dialog.error("操作失败！");
				}
    		}
    	})
	})
	
	//服务条款
	$(".moocService").click(function(){
		var sysId = $("#sysId").val();
		if (sysId=="0"){//好大学
			location.href = CONTEXTPATH+"/home/moocService.mooc";
		}else {
			location.href =CONTEXTPATH+"/zhitu/concat/3.mooc";
		}
	})
	
	
	//绑定邮箱
	$("#bindEmail").live("click",function(){
		$(".mail-bind-second").removeClass("publicTip");
		$(".mail-bind-first").addClass("publicTip");
		
	})
	
	$("#loginPwd").keyup(function(){
		var loginPwd = $.trim($("#loginPwd").val());
    	if (loginPwd.length>0){
    		$(".public-loginpassword-tip").find("span").html(Msg.get("password.null"));
    		$(".public-loginpassword-tip").addClass("publicTip");
    	}
    	else{
    		$(".public-loginpassword-tip").removeClass("publicTip");
    	}
	})
	
	
	//确定
	$("#confirmUserInfo").live("click",function(){
		var email = $.trim($("#email").val());
		var loginPwd = $.trim($("#loginPwd").val());
		if (loginPwd==null || loginPwd==""){
			$(".public-loginpassword-tip").find("span").html(Msg.get("password.null"));
    		$(".public-loginpassword-tip").removeClass("publicTip");
			return false;
		}
		else {
			$(".public-loginpassword-tip").addClass("publicTip");
		}
		var password = $.md5(loginPwd);
		//确定成功后，发送绑定成功的邮件
		$.ajax({
			type:'post',
			data:{
				email:email,
				password:password
			},
			url:CONTEXTPATH+"/home/confirmEmail.mooc",
			success:function(response){
				if (response.returnCode=="success"){
					var userId = response.userId;
					$("#isSendEmail").val("1");//设置为1.需要点击激活学号时再发送绑定成功的邮件
					$("#registerUserId").val(userId); //注册的用户
					$(".public-bindemail").removeClass("publicTip");
					$("#loginPassword").addClass("publicTip");
					$("#confirm-password").addClass("publicTip");
					$.dialog({id:"emailBindId"}).close();
				}
				else {
					$(".public-loginpassword-tip").find("span").html(response.retMsg);
					$(".public-loginpassword-tip").removeClass("publicTip");
				}
			},
			error:function(){
				  
			}
		})
	})
	
	//去认证
	$(".btn-author").click(function(){
		var sysCode=$(this).attr("sysCode");
		if (sysCode=="org_cloud"){//知途网
			location.href=CONTEXTPATH+"/home/login.mooc?historyUrl=" + encodeURIComponent((new Base64()).encode(CONTEXTPATH+"/portal/setting.mooc?type=1"));
		}else{
			location.href=CONTEXTPATH+"/home/login.mooc?historyUrl=" + encodeURIComponent((new Base64()).encode(CONTEXTPATH+"/portal/setting.mooc?inSchool=20"));
		}
	})
	
	//返回
	$(".return-btn").click(function(){
		var backUrl = $(this).attr("backUrl");
		location.href=CONTEXTPATH+backUrl;
	})
	
	//重新登陆：统一身份认证/jacount
	$(".identityLogin").click(function(){
		$.dialog({id:"reLoginDialog"}).close();
		$("#backUrl").val((new Base64()).encode(CONTEXTPATH+"/home/thirdLogSuccess.mooc"));
		var loginType = $(this).attr("userLoginType");
		if ("oauthLogin" == loginType){ //统一身份登陆
			$("#identityLogin").attr("action",CONTEXTPATH+"/oauth/toMoocAuth.mooc");
		}
		else if ("jaccount" == loginType){ //jaccount登陆
			$("#identityLogin").attr("action",CONTEXTPATH+"/oauth/jacAuth.mooc");
		}
		var e = document.getElementById("identityLogin");
		if (e!=null){
			e.submit();
		}
	})
	
	//手机号验证
	$("#mobile").keyup(function(event) {
		var mobile = $("#mobile").val();
		if (mobile!=null && mobile!="" && event.keyCode==13){
			if (!checkPhone(mobile)){
				$(".public-mobile").removeClass("publicTip");
				return;
			}
		}else{
			$(".public-mobile").addClass("publicTip");
		}
	})
	
	//发送短信验证码
	$("#sendCode").on("click", function () {
		var fromType = $(this).attr("fromType");
		var mobile = $("#mobile").val();
		if (mobile==null || mobile==""){
			$(".public-mobile").removeClass("publicTip");
			return;
		} else {
            if (!checkPhone(mobile)){
                $(".public-mobile").removeClass("publicTip");
                return;
            }
        }

        $(".public-mobile").addClass("publicTip");

		var $this = $(this);
		//防止连续点击
		if ($this.hasClass("link-disabled")) {
			return;
		}
		$this.addClass("btn-disabled");
		$this.find(".timer-view").removeClass("publicTip");
		var $timeDom = $this.find("em");
		var time = parseInt($timeDom.text(), 10), backTime = time;
		var $inputCode = $(".input-code");
		$inputCode.attr("disabled", false); 
		if (submitSendFlag==false){
			submitSendFlag = true;
		}
		else {
			return;
		}
		$.ajax({
			type:'post',
			data:{
				mobile:mobile,
				fromType:fromType
			},
			url:CONTEXTPATH+"/home/sendVerifyCode.mooc",
			success:function(result){
				if (result.retCode=="success"){
					var timer = window.setInterval(function () {
						$timeDom.text(--time);
						if (time == 0) {
							window.clearInterval(timer);
                            $timeDom.text(backTime);
							timerEnd($this, $inputCode);
							submitSendFlag = false;
						}
					}, 1000);
				}
			},
            error:function() {
                timerEnd($this, $inputCode);
            }
		})
	});

	function timerEnd($time, $inputCode) {
		$time.removeClass("btn-disabled");
        if ($("#verifyCode").val() == "") {
            $inputCode.attr("disabled", "disabled");
        }
        $time.find(".timer-view").addClass("publicTip");
	}
	
	//知途网-忘记密码
	$(".reset-type .input-r").on("click",function(){
		$(".public-send-tip").addClass("publicTip");
		$(this).closest(".reset-type").find(".input-r").removeClass("selected");
		$(this).addClass("selected");
		if($(this).hasClass("input-r-phone")){
			$(".form-email").hide();
			$(".form-phone").show();
		}else{
			$(".form-email").show();
			$(".form-phone").hide();
		}
	})
	
	//手机验证下一步
	$("#nextStep").click(function(){
		var mobile = $("#mobile").val();
		$(".public-mobile").addClass("publicTip");
		$(".public-verifyCode").addClass("publicTip");
		if (mobile==null || mobile==""){
			$(".public-send-tip").find("span").html("请输入手机号！");
			$(".public-send-tip").removeClass("publicTip");
			return;
		}else {
			if (!checkPhone(mobile)){
				$(".public-send-tip").find("span").html("不是有效的手机号！");
				$(".public-send-tip").removeClass("publicTip");
				return;
			}
		}
		var verifyCode = $("#verifyCode").val();

		if (verifyCode == ""){
			$(".public-send-tip").find("span").html("请填验证码！");
			$(".public-send-tip").removeClass("publicTip");
			return;
		}
		if (submitPassFlag==false){
			$(this).empty().text("正在提交...");
			submitPassFlag = true;
		}
		else {
			return;
		}
		$.ajax({
			type:'post',
			data:{
				mobile:mobile,
				passKey:verifyCode
			},
			url:CONTEXTPATH+"/home/doPassByMobile.mooc",
			success:function(result){
				if (result.retCode=="error"){
					$(".public-send-tip").find("span").html("验证码已失效！");
					submitPassFlag = false;
                    timerEnd($("#sendCode"), $(".input-code"));
					$("#nextStep").html("下一步");
				}else{
					$("#reset_email").val(result.email);
					$("#reset_mobile").val(result.mobile);
					var e = document.getElementById("submitResetPwd");
				   	if (e!=null){
				   		e.submit();
				   	}
				}
			}
		})
		
	})
	
	$("#reSetEmail").click(function(){
		var activeType = $(this).attr("activeType");
		var backUrl = $("#backUrl").val();
		var passwordType = 0;
		if (activeType=='7' || activeType=='8' || activeType=='10'){
			passwordType = 1;
		}
		location.href=CONTEXTPATH+"/home/forgetPass/"+passwordType+".mooc?backUrl="+backUrl;
	})


    // qq登陆事件
    $('#qqLogin').click(function(){
        var url = "https://graph.qq.com/oauth2.0/authorize?response_type=code&state=zhituQQ&client_id=" + $.G_QQ_APP_ID + "&redirect_uri=" + encodeURI($.G_QQ_URL);
        location.href = url;
    });
    // wechat登陆事件
	$("#wechatLogin").click(function(){
		var url="https://open.weixin.qq.com/connect/qrconnect?appid="+$.G_WECHAT_APP_ID+"&redirect_uri="+encodeURI($.G_WECHAT_URL)+"&response_type=code&scope=snsapi_login&state=zhituWechat#wechat_redirect";
        location.href = url;
	});

    // sina登陆事件
    $('#sinaLogin').click(function(){
        var url = "https://api.weibo.com/oauth2/authorize?state=zhituSina&client_id=" + $.G_SINA_APP_ID + "&response_type=code&redirect_uri=" + encodeURI($.G_SINA_URL);
        location.href = url;
    });
})