var jade = require("jade"),
	fs = require("fs"),
	_ = require('underscore');

function gen_article(md_string, art_id, isExists){
	var meta = {size:0};
	var isreadmeta=true;
	var content_list=[];
	md_string.split("\n").forEach(function(line){
		if(isreadmeta){
			if(line.trim()==""){
				isreadmeta=false;
			}else{
				var line_fields=line.trim().split(":",2);
				meta[line_fields[0].trim()]=line_fields[1].trim();
			}
			return;
		}
		content_list.push(line);
	});
	var content_string=content_list.join("\n");
	var html="";
  var data_index=[0,0];
  var tran_dict={};
	content_string.split(/[\n]{2,}/).forEach(function(p_content){
		if(p_content.substring(0,1)=='#'){
			var line_fields=p_content.substring(1).split('/');
			html+="<h2>"+line_fields[0]+"</h2>";
			return;
		}
		html+="<div class='p'>";
		var lines=p_content.split(/[\n\r]+/);
    var br_list=[];
		lines.forEach(function(line){
			var line_fields=line.split('/');
			if(line_fields[0].trim()=='')return;
      var data_id=data_index[0]*1000+data_index[1];
			html+='<p data-tran="'+data_id+'">';
      html+=line_fields[0].trim();
      meta.size += line_fields[0].length;
      //<span>'+line_fields[0].trim().split('').join('</span><span>')+'</span>';
			if(line_fields.length==2) tran_dict[data_id]=line_fields[1].trim();
			html+='</p>';
      data_index[1]++;
		});
		html+="</div>";
    data_index[0]++;
	});
  if(!isExists){
    fs.writeFileSync("publish/"+art_id+'.html',
              jade.renderFile('templates/article.jade',
                _.extend(meta, {"content":html,"tran_dict":JSON.stringify(tran_dict)})),
              "utf-8");
  }
	return meta;
}
function gen_index(art_list){
  var html="<ul>";
  art_list.sort(function(a,b){return b.mtime - a.mtime});
  for(var i in art_list){
    var art = art_list[i];
    if(art.id=='test')continue;
    html+='<li>['+art.level+'] <a href="'+art.id+'.html">'+art.name+'</a> - '+ (art.size?art.size+'字':'') +'</li>';
  }
  html+='</ul>';
	fs.writeFileSync('publish/index.html',
      jade.renderFile('templates/index.jade', {"list":html}),
      "utf-8");
}



var artfile_list=fs.readdirSync("./articles/");

var art_list=[];
artfile_list.forEach(function(name){
  var art_id=name.replace(/.md$/g,'');
  if(art_id==name)return;
  var mdMtime = fs.statSync("./articles/"+name).mtimeMs;
  var htmlFile = "./publish/"+art_id+".html";
  var isExists = fs.existsSync(htmlFile) && fs.statSync(htmlFile).mtimeMs>mdMtime;
  if(!isExists){
    console.log(art_id);
  }
	art_list.push(Object.assign(gen_article(fs.readFileSync("./articles/"+name,"utf-8"), art_id, isExists),
    {"mtime": mdMtime, "id": art_id}));
});
gen_index(art_list);
