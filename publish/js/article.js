window.articles={};
//tts_map
var tts_map={};
//是不是一个新单词的开始
var current_p;
function check_begin(){
	var waitDom=$('#art span.wait:first');
	waitDom.addClass('next');
	if(waitDom.length==0){
		$('#time_sum').text(($('#art span').length/Math.round((new Date()-window.time_begin)/1000/60)).toFixed(2)+'字 / 分钟');
		$('#restart_bt>div').slideDown();
		var pos_top=$('#buttons').position().top- parseInt($(window).height()/2);
		if(pos_top>0) $("html,body").animate({scrollTop:pos_top}, 1000);
		$("#fanyi").hide();
		return;
	}
	var pid=waitDom.parent().attr("data-tran");
	if(pid!=current_p){
		$("#fanyi").text(tran_dict[pid]);
		current_p=pid;
	}
	var prev=waitDom.prev('span');
	if(prev.length>0 && prev.text()!=' '){
		return;
	}
	window.word="";
	var split_char_list=[',','.',' ','1','2','3','4','5','6','7','8','9','0','"',"!","?","%","&","-",";",":","=","+","[","]","(",")","_","|"];
	$('#art span.wait').each(function(){
		if($.inArray($(this).text(), split_char_list)!=-1){
				return false
		}
		window.word+=$(this).text();
	});
	if(window.word=='')return;
	if(!tts_map.hasOwnProperty(window.word)){
		tts_map[window.word] = new Audio();
		tts_map[window.word].src = "tts/"+window.word+".mp3";
		tts_map[window.word].addEventListener('canplaythrough',function(){
			tts_map[window.word].play();
		});
		tts_map[window.word].addEventListener('error',function(){
			if(window.word!=window.word.toLowerCase()){
				tts_map[window.word] = new Audio("tts/"+window.word.toLowerCase()+".mp3");
				tts_map[window.word].play();
			}

		});
	}else{
		tts_map[window.word].play();
	}
	//滚动
	var pos_top=Math.max(0,parseInt(waitDom.position().top-$(window).height()/2));
	if($(document).scrollTop()!=pos_top){
		$("html,body").animate({scrollTop:pos_top}, 1000);
	}
	//$(window).scrollTop(parseInt($(window).height()/2)-pos_top);
}
//打了一个字
function inputK(acKey){
	var waitDom=$('#art span.wait:first');
	if(waitDom.length==0){
		return;
	}
	if(acKey== waitDom.text()){
		waitDom.removeClass('wait');
		waitDom.removeClass('next');
		check_begin();
	}else{
		waitDom.fadeOut(400).fadeIn(400);
	}
}
function begin(){
	$('#art>div.p>p>span').addClass('wait');
	$('td#restart_bt>div').hide();
	check_begin();
	window.time_begin=new Date();
}
function IsPC() {
	var userAgentInfo = navigator.userAgent;
	var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
	var flag = true;
	for (var v = 0; v < Agents.length; v++) {
		if (userAgentInfo.indexOf(Agents[v]) > 0) {
			flag = false;
			break;
		}
	}
	return flag;
}

$(document).ready(function(){
	if(!IsPC()){
		$('#start>img').attr('src','images/fail.gif');
		$('#start>img').attr('alt','仅支持电脑键盘操作');
		$('#start').append('<p>仅支持电脑键盘操作</p>');
		return;
	}

  $('#art>div.p>p').each(function(){
    var con_string=$(this).text().trim();//.split('');
    if(con_string=='')return;
    $(this).html('<span>'+con_string.split('').join('</span><span>')+'</span>');
  });

  $(document).keydown(function(event){
    if(event.keyCode==8)return false;
  });
  $(document).keypress(function(event){
    var acKey=String.fromCharCode(event.keyCode||event.which);
    inputK(acKey);
    return false;
  });

  //init();
  begin();

  $('#start').fadeOut();

});
