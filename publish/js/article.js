window.articles={};
window.aId = window.location.pathname.split("/").pop();
//tts_map
var tts_map={};
var failAudio = new Audio("./sound/fail.mp3");
failAudio.load();
// 完成
function daWan(){
  var useTime = new Date().getTime()-window.time_begin;
  var score = $('#art span').length/useTime*1000*60;
	$('#time_sum').text(score.toFixed(2)+'字 / 分钟');
	$('#restart_bt>div').slideDown();
	var pos_top=$('#buttons').position().top- parseInt($(window).height()/2);
	if(pos_top>0) $("html,body").animate({scrollTop:pos_top}, 1000);
	$("#fanyi").hide();
  //
  var scores = JSON.parse(window.localStorage.getItem(aId+":score") || "[]")
  scores.unshift([new Date().getTime(), useTime, $('#art span').length]);
  window.localStorage.setItem(aId+":score", JSON.stringify(scores.slice(0, 32)));
  $("table#scores").html(scores.map(function(v){
    return "<tr><td>"+new Date(v[0])+"</td><td>"+(v[2]*1000*60/v[1]).toFixed(2)+"字/分钟</td></tr>";
    }).join(""));
	$("#scores").show();
}

//是不是一个新单词的开始
var current_p;
function check_begin(){
	var waitDom=$('#art span.wait:first');
	waitDom.addClass('next');
	if(waitDom.length==0){
    // 完成
		return daWan();
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
  window.word = window.word.toLowerCase();
	if(!tts_map.hasOwnProperty(window.word)){
		tts_map[window.word] = new Audio();
		tts_map[window.word].src = "tts/"+window.word+".mp3";
		tts_map[window.word].addEventListener('canplaythrough',function(){
			tts_map[window.word].play();
		});
    /*
		tts_map[window.word].addEventListener('error',function(){
			if(window.word!=window.word.toLowerCase()){
				tts_map[window.word] = new Audio("tts/"+window.word.toLowerCase()+".mp3");
				tts_map[window.word].play();
			}

		});
    */
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
    failAudio.play();
	}
  let tword = waitDom.attr("word");
  if(tword && tword.length>0){
    var wordWeight = parseInt(localStorage.getItem('word:'+tword) || "0");
    localStorage.setItem('word:'+tword, Math.min(tword.length*3, wordWeight + (acKey == waitDom.text()? 1:0- tword.length*2)));
  }
}
function begin(){
	$('#art>div.p>p>span').addClass('wait');
	$('td#restart_bt>div').hide();
	$("#fanyi").show();
	$("#scores").hide();
	check_begin();
	window.time_begin=new Date().getTime();
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
    var space_strings=con_string.split(/[\s]+/);
    var ciList = [];
    for(let i in space_strings){
      let ci = space_strings[i].match(/^([\w]*)([^\w]*)$/);
      if(!ci){
        ciList.push('<span>' + space_strings[i].split('').join('</span><span>') + '</span>');
      }else{
        var ci2='';
        if(ci[2]!=''){
          ci2='<span>'+ci[2].split("").join("</span><span>")+'</span>';
        }
        if(ci[1]!=''){
          var wordCss = parseInt(localStorage.getItem('word:'+ci[1]) || "0")>=0?"":'style="color:red"';
          ciList.push('<span word="'+ci[1].toLowerCase()+'" '+wordCss+'>' + ci[1].split('').join('</span><span word="'+ci[1].toLowerCase()+'" '+wordCss+'>') + '</span>'+(ci2==''?'':ci2));
        }else if(ci2!=''){
          ciList.push(ci2);
        }
      }
    }
    $(this).html(ciList.join('<span> </span>'));
//    $(this).html('<span>'+con_string.split('').join('</span><span>')+'</span>');
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
