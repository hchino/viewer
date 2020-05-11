var message_timer = [];
var talk_info = [];
var video = [];
var talk_time = [];
var z_index = Array(document.getElementsByClassName('field_object').length);
z_index.fill(0);
var log_file = 'resource/data/shiga_log.csv';
$(function() {
	var talk_counter = 0;
	var message_counter = 0;
	var insert_contents = '';
	$.ajax({
	    beforeSend : function(xhr) {
	    xhr.overrideMimeType("text/plain; charset=shift_jis");
	    },
	    url: log_file,
	    success: function(data) {
	    	var csvList = $.csv.toArrays(data);
	    	for (var i=1; i<csvList.length; i++) {
	    		var hms = timer_count(csvList[i][0]);
		        if (csvList[i][0] != "") {
		        	if (csvList[i][1] != "") {
						insert_contents += '<div id=talk' + talk_counter + ' class = "topic' + csvList[i][5] + '"><div id="message' + csvList[i][0] + '" onclick="' + 'video_controll(' + "'" + "log_change" +"'" + ',this.id)"><span class="cursor">' + hms + '<br>' + '<font color = "' + checkcolor(csvList[i][1]) + '">' +csvList[i][1] + '</font>' + '&nbsp;&nbsp;→&nbsp;&nbsp;' + '<font color = "' + checkcolor(csvList[i][2]) + '">' + csvList[i][2] + '</font>' + '<br>' +  csvList[i][3] + '<br></div></span>';
		       			talk_info.push([csvList[i][0],csvList[i][1],csvList[i][2],csvList[i][5]]);
		       			talk_counter++;
		        	} else {
		        		insert_contents += '<a>________________________________<br><br></a>' + '<div id="message' + csvList[i][0] + '" onclick="' + 'video_controll(' + "'" + "log_change" +"'" + ',this.id)"><span class="cursor" id=message>' + hms + '<br>' + csvList[i][3] + '<br></span></div>';
		        	}
		        	message_timer.push(csvList[i][0]);
	       			message_counter++;
		        } else {
		        	insert_contents += '<a>________________________________<br>________________________________<br>________________________________<br><br></a></div>'
		        }
	    	}
			for (var i=0; i<7; i++) {
				var video_id = "video" + i;
				video[i] = videojs(video_id);
				if (i != video.length - 1) {
					video[i].volume = 0;
				}
			}

	    	$('#infobox').append(insert_contents);
	    	for (var i=0; i<talk_counter; i++) {
				var talk_id = "talk" + i;
				var element = document.getElementById(talk_id);
				var talk_message_id = $('#' + talk_id).children('div');
				talk_time.push([parseInt((talk_message_id[0].id).replace(/message/g,'')),((talk_message_id[talk_message_id.length - 1].id).replace(/message/g,'')) - ((talk_message_id[0].id).replace(/message/g,'')),parseInt((element.className).replace(/topic/g,''))]);
			}
			video[video.length - 1].onloadeddata = function() {
				timeline_script(false,false);
			}
	    }
	});

	var range_element = document.getElementById("range");
	range_element.addEventListener('input',rangeValue(range_element,(document.getElementById("value"))));

	$('.video-frame').resizable({
    	aspectRatio: 16/9,
    	minHeight:144,
    	minWidth: 256,
    	start: function(){
      		sort_active_video($(this).parent().attr('id'));
      		z_index_check();  
    	}
  	});
  	$('.main-video-frame').resizable({
    	aspectRatio: 16/9,
    	minHeight: 306,
    	minWidth: 544,
  	});
  	$('#tag-box').resizable({
    	minHeight: 306,
    	minWidth: 256,
    	start: function(){
      		sort_active_video(this.id);
    	}
  	});
  	$('.field_object').draggable({
  		start: function(){
		    var object_count = document.getElementsByClassName('field_object').length;
		    sort_active_video(this.id);
	  	}
	});
	$("#createTag").on("click", function() {
		var dialog = document.getElementById('tag_dialog');
		$("#tag_dialog").dialog();
	});
	$('#infobox').draggable({
	});
	$('#tag-box').draggable({
	});
	$('#infobox').scroll(function() {
		jQuery(":hover").each(function () {
		    if ($(this).hasClass('infobox')) {
		    	Interval_change("scroll");
		    }
	  	})
	});
	interval_set = setInterval(scroll, 1000);
	messageColor = setInterval(switch_messageColor, 1000);
	clearInterval(interval_set);
	$('.btn_script').click(function() {
    	$(this).toggleClass('on');
    	timeline_script($('#bar_script').hasClass('on'),$('#color_script').hasClass('on'));
  	}); 

  	$('#ok_button').click(function() {
  		console.log('aaaaa');
  		var formdata = new FormData($('#tag_dialog').get()[0]);
  		console.log(formdata);
  		$.ajax({
  			url:'./tag_upload.php',
  			method:'POST',
  			processData: false,
  			contentType: false,
  			data:formdata,
  			success:function(data) {
  				console.log(data);
  			}
  		})
  	})
});

function sort_active_video(object_name) {
	z_index.some(function(v,i) {
		if (v == object_name) {
			z_index.splice(i,1);
		}
	})
	z_index.unshift(object_name);
	for (var j=0; j<z_index.length; j++) {
		if (document.getElementById(z_index[j]) != null) {
			document.getElementById(z_index[j]).style.zIndex = 100 - j;
		}
	}
}

function play_movie(id) {
  current = video[6].currentTime();
  if (id.match(/html5_api/)){
    //console.log("特に何もないよ！！");
  } else {
  	video_id = id.replace(/video/g, '');
    video[6].src(video[video_id].src());
    for (var i = 0;i < video.length; i++) {
      video[i].currentTime(current);
      video[i].pause();
    }
    // clear_Interval();
    setTimeout(() => {
      video[6].currentTime(current);
      video[6].pause();
    }, 100);
  }
}

// function play_movie(id) {
// 	var current = video[video.length - 1].currentTime;
// 	console.log(id);
// 	video[video.length - 1].src = document.getElementById(id).currentSrc;
// 	video_controll("pause",video[video.length - 1].currentTime)
// 	setTimeout(() => {
//       video[video.length - 1].currentTime = current;
//       video[video.length - 1].pause();
//     }, 100);
// }

function video_controll(command, now) {
	Interval_change("clear");
	if (command == 'log_change') {
		now = now.replace(/message/g, '');
		var elem = document.getElementById("range");
		var hms = timer_count(elem.value);
		var value = document.getElementById("value");
		value.innerHTML = hms;
	}
	if (now == false) {
		now = document.getElementById("range").value;
	} else {
		document.getElementById("range").value = now;
	}
	for (var i=0; i<video.length; i++) {
		video[i].currentTime(now)
		;
		switch (command) {
			case 'play':
				video[i].play();
				break;
			case 'log_change':
			case 'pause':
				video[i].pause();
				break;
		}
	}
	if (command == 'play') {
		Interval_change("start");
	}
}

function Interval_change (state) {
	switch (state) {
		case 'start':
			interval_set = setInterval(scroll, 1000);

			break;
		case 'clear':
			clearInterval(interval_set);
			break;
	}
}

function rangeValue(elem, realtime) {
	return function(evt){
		var hms = timer_count(elem.value);
		realtime.innerHTML = hms;
		video_controll("pause", elem.value);
	}
}

function timer_count(now_time) {
  var hh = parseInt(now_time / 3600); 
  var mm = ( '00' + parseInt((now_time - (hh*3600))/60)).slice(-2);
  var ss = ( '00' + parseInt(now_time - (hh*3600) - (mm*60))).slice(-2);
  timer = hh + ":" + mm + ":" + ss;
  return timer;
}

function scroll() {
	var timer = parseInt((video[video.length - 1]).currentTime());
	var speed = 400;
	var message_id = "message" + timer;
	var hms = timer_count(timer);
	document.getElementById("value").innerText = hms;
	document.getElementById("range").value = timer;

	for (var i=0; i<talk_info.length; i++) {
		if (timer > Number(talk_info[i][0]) && timer < Number(talk_info[i+1][0])) {
			break;
		}
	}
	var from = checkcolor(talk_info[i-1][1]);
	var to = checkcolor(talk_info[i-1][2]);
	// for (var i=0; i<video.length - 1; i++) {
	// 	var position_name = "camera_" + i;
	// 	if(document.getElementById(position_name).style.color == from) {
	// 	    video[i].style.border = "5px solid black";
	// 	} else if (document.getElementById(position_name).style.color == to) {
	// 	    video[i].style.border = "5px solid black";
	// 	} else {
	// 	    video[i].style.border = "1px solid black";
	// 	}
	// }

	for (var i=0; i<message_timer; i++) {
		var message_id = "message" + message_timer[i];
		if (message_timer[i] < now && message_timer[i+1] > now){
      		document.getElementById(message_id).style.backgroundColor = '#CCCCCC';
    	}
    	else {
      		document.getElementById(message_id).style.backgroundColor = '#fff0f0';
    	}
	}

	while (!(document.getElementById(message_id))) {
		timer = timer - 1;
		message_id = "message" + timer;
		if (timer < 1) {
			break;
		}
	}
	var mes = "#message" + timer;
	if (timer > 1) {
		$('#infobox').animate({scrollTop:$("#" + message_id).position().top + $('#infobox').scrollTop() - 22 - 300}, speed, 'swing');
	} else {
		return false;
	}
}

function checkcolor(color) {
  switch (color) {
    case '赤エリア':
      var color = 'red';
      break;
    case '黄エリア':
      var color = '#FFCC00';
      break;
    case '緑エリア':
      var color = 'green';
      break;
    //case 'トリアージ本部':
    case '現地統括本部':
      var color = '#00CC00';
      break;
    case '災害対策本部':
      var color = 'blue'
      break;
    case '1次トリアージエリア':
      var color = '#ffa07a'
      break;
  }
  return color;
}

function timelinebox(id) {
	video_controll('pause',id);
	document.getElementById("range").value = id;
}

function timeline_script(bar_status, color_status) {
	var target = '#time_line_box';
	var target2 = '#infobox';
	var movie_time = video[video.length - 1].duration;
	var start_height = 30.0;
	var box_height = 10.0;
	var bar_height = 4.0;
	var bar_height_range = 3.0;
	var colum_width = 2176.0;
	var bar_number = [];
	var appear_number = [];
	var color_number = [91,92,93,94]
	var color_number = [];
	$(target).children().remove();
	for (var i=0; i<talk_time.length; i++) {
		var box_color = 'red;';
		var left = (talk_time[i][0] / movie_time) * colum_width;
		if (bar_number.indexOf(talk_time[i][2]) != -1) {
			box_top = bar_number.indexOf(talk_time[i][2]) * box_height;
			if (bar_status == true) {
				var fast_left = talk_time[appear_number[bar_number.indexOf(talk_time[i][2])]][0];
				var bar_width = talk_time[i][0] - fast_left;
				var bar = "<div style='position:absolute; top:" + (box_top + bar_height_range) + "px; left: " + ((fast_left / movie_time) * colum_width) + "px; width: " + ((bar_width / movie_time) * colum_width) + "px; height: " + bar_height + "px; background-color: red;'></div>";
				$(target).append(bar);
			}
		} else {
			box_top = bar_number.length * box_height;
			bar_number.push(talk_time[i][2]);
			appear_number.push(i);
		}
		if (talk_time[i][1] == 0) {
			var box_width = (5.0 / movie_time) * colum_width;
		} else {
			var box_width = (talk_time[i][1] / movie_time) * colum_width;
		}
		if (color_status == true) {
			console.log(color_number.indexOf(talk_time[i][2]));
			if (color_number.indexOf(parseInt(talk_time[i][2])) != -1 ) {
				console.log('dafdfa');
				box_color = 'black;';
			}
		}
		var insert = "<div id=" + talk_time[i][0] + " onclick='timelinebox(this.id)' style='position:absolute; top:" + box_top + "px; left: " + left + "px; width: " + box_width + "px; height: " + box_height + "px; background-color:" + box_color + "'></div>" 
		$(target).append(insert);
	}
}

var switch_messageColor = function(){
	// console.log('aaaaa');
	var now = video[6].currentTime();
	for (var i = 0;i<message_timer.length; i++){
    	var href = "message" + message_timer[i];
    	if (message_timer[i] < now && message_timer[i+1] > now){
      		document.getElementById(href).style.backgroundColor = '#CCCCCC';
    	}
    	else {
      		document.getElementById(href).style.backgroundColor = '#fff0f0';
    	}
  	}
}

$(function (){
  var url="resource/data/shiga_send.txt";
  var httpobj =createHttpRequest();
  httpobj.open("GET",url,false);
  httpobj.send(null);
  road_str=httpobj.responseText;
  format_text(road_str);
});

function format_text(change_text){
  change_text=change_text.replace(/\r\n/g,"\n");
  arr=change_text.split(/\n/g);
  all_par=arr.length;
  var data=[];
    for(var i=0; i<arr.length;i++){
      data[i]=arr[i].split(",");
    }
  for(var i=0; i<all_par;i++){
    if(data[i] != ''){
      var insert = [];
      var tag_time = timer_count(data[i][0]);
      //insert += "<tr id=tagNumber_" + i + "><td onclick='change_movie_time_tag(" + data[i][0] +")'><a href='javascript:void(0);'>" + tag_time[0] + ":" + tag_time[1] + ":" + tag_time[2] + "</td><td>" + data[i][1] + "</td><td>" + data[i][2] + "</td></tr>";
      insert += "<tr id=tagNumber_" + i + "><td onclick='change_movie_time_tag(" + data[i][0] +")'><a href='javascript:void(0);'>" + tag_time + "</td><td>" + data[i][1] + "</td><td>" + data[i][2] + "</td></tr>";
      $("#tag_table").append(insert);
    }
  }
}

function change_movie_time_tag(time_id){
  for (var i = 0;i < video.length; i++) {
    video[i].currentTime(time_id);
    video[i].pause();
  }
}

function createHttpRequest(){
  try{
      return new XMLHttpRequest();
    }catch(e){}
    try{
      return new ActiveXObject('MSXML2.XMLHTTP.6.0');
    }catch(e){}
    try{
      return new ActiveXObject('MSXML2.XMLHTTP.3.0');
    }catch(e){}
    try{
      return new ActiveXObject('MSXML2.XMLHTTP');
    }catch(e){}
  
    return null;
  }

