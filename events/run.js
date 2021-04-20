(function() {
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    Date.prototype.getMonthName = function() {
        return months[ this.getMonth() ];
    };
    Date.prototype.getDayName = function() {
        return days[ this.getDay() ];
    };
})();
  
pad = function(v){
    if(v<9){
	return "0"+v;
    }else{
	return ""+v;
    };
};

function makedescription(event, max){
    if (!event.description){ 
	return "";
    };
    var trimmed = trimit(event.description, max)
    var text = trimmed[0];
    if(trimmed[1]){
	text = text;
    };
    return [text, trimmed[1]];

};


function trimit(t, max){
    if(!t){ return ["", false] };
    if(t.length <= max){
	return [t, false];
    }
    return [t.substr(0,max), true]
};

var monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];

var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];


var templates = {
    eventList: $('<div class="eventlist">'),
    eventItem: $('<div class="event"><h3 class="summary"><a target="_blank" href=""></a></h3><div class="start"><span class="when"/> <span class="where"/></div><div class="description"></div></div>'),
    upcomingBox: $('<div class="upcoming"><h4>Coming Next...</h4></div>'),
    upcomingItem: $('<div class="event"><h6 class="when"/><h5 class="summary"><a title="open calendar entry" href="" target="_blank"></a></h5><p class="description"><a href="more">more</a></p><div class="where"/></div>')
};

dateFormat = function(d){
    var yr = d.getYear() + 1900;
    return d.getDayName() + ", " + d.getDate() + " " + d.getMonthName() + " " + yr;
}

getWhen = function(v){
    starter=v.start;
    if(starter.date){
	var start = new Date(starter.date);
	var end = new Date(v.end.date);
	var startString = dateFormat(start);
	var endString = dateFormat(end);
	if(startString != endString){
	    when = startString + " - " + endString;
	}else{
	    when = startString;
	};
    }else{
	var when = new Date(starter.dateTime);
	when = dateFormat(when) + " at " + when.getHours() + ":" + pad(when.getMinutes());
    };
    return when;
};

now = new Date().toISOString();

api="AIzaSyAB1Jd-Jf3U-R84BJzJAPTIYZZmM1sqtjs";

function getN(n, root, wrapper, item, trim){
    var r = root;
    var now = new Date().toISOString();
    var URL = "https://www.googleapis.com/calendar/v3/calendars/e8j7bjqajiblsstfcc59iimss0%40group.calendar.google.com/events?callback=?&maxResults="+n+"&timeMin="+now+"&orderBy=startTime&singleEvents=true&key="+api;
    addEvents(URL, r, wrapper, item, trim, false);
}


function getArchived(root, wrapper, item, trim){
    var r=root;
    var URL = "https://www.googleapis.com/calendar/v3/calendars/e8j7bjqajiblsstfcc59iimss0%40group.calendar.google.com/events?callback=?&orderBy=startTime&timeMax="+now+"&singleEvents=true&key="+api;
  
    addEvents(URL, r, wrapper, item, trim, true);
    
}
    
function addEvents(URL, r, wrapper, item, trim, reverse){
    $.getJSON(URL , function(json) {
        $(r).empty();
	// leave empty if no events
	if (json.items.length == 0){
	    return;
	}
	var events = json.items;
	var list = templates[wrapper].clone();
	$.each(events, function(){
	    var e = templates[item].clone();
	    var when = getWhen(this);
	    var where;
	    if(this.location){
		where = this.location;
	    }else{
		where = " ";
	    };
	    var texttrim = makedescription(this, trim);
	    e.find("a").text(this.summary).attr("href",this.htmlLink).end()
		.find(".when").text(when).end()
		.find(".where").text(where).end()
		.find(".description").text(texttrim[0]);
	    if (texttrim[1]){
		e.find(".description").append('...<a title="details" href="'+this.htmlLink+'">(more)</a>');
	    };
	    try {
		var gg = google_calendar_to_links(this);
		e.append(gg);
	    }
	    catch(err) {

	    };
	    if(reverse){
		list.prepend(e);
	    }else{
		list.append(e);
	    }
	});
	$(r).append(list);
	// get event.object[0].summary, htmlLink,start.dateTime
	
    }
	     );
};



function drawcalendar(){
    $('#calendar').fullCalendar({
	googleCalendarApiKey: 'AIzaSyAB1Jd-Jf3U-R84BJzJAPTIYZZmM1sqtjs',
	events: {
	    googleCalendarId: 'e8j7bjqajiblsstfcc59iimss0@group.calendar.google.com',
            className: 'gcal-event'
        },
	header: {
	    left:   'title',
	    center: '',
	    right:  'today prev,next month basicWeek'
	},
        loading: function(a,b){
	    $("#calendar").show();
	},
	eventClick: function(event) {
	    // opens events in a new window
            $("#event-details").find("#popup-event").empty().append(popuptemplate(event));
	    add_calendar_links(event, "#popup-event .description");
	    $("#event-details").trigger('openModal');

	    return false;
	},
	eventRender: function(event, element) {
            element.attr('title', event.title);
        }
        // put your options and callbacks here
    })
    }

 
function popuptemplate(event){
    var e = templates["eventItem"].clone();
    var when = event.start;
    var where = event.location || ' ';
    var texttrim = trimit(event.description || '',500);
    e.find("a").text(event.title).attr("href",event.url).end()
	.find(".when").text(when).end()
	.find(".where").text(where).end()
	.find(".description").text(texttrim[0]);
    if (texttrim[1]){
	e.find(".description").append('...<a title="details" href="'+event.url+'">(more)</a>');
    };
    return e;
};

function google_calendar_to_links(event){
    if (event.start.dateTime){
	var start=new Date(event.start.dateTime);
    }
    if (event.start.date){
	var start= new Date(event.start.date);
    }

    if (event.end.dateTime){
	var end=new Date(event.end.dateTime);
    }
    if (event.end.date){
	var end= new Date(event.end.date);
    }

    var myCalendar = createCalendar({
	calendars: ['google','ical','yahoo','outlook'],
	options: {
	    class_name: 'calendaradder',
	},
	data: {
	    title: event.summary,
	    start: new Date(start),
	    end: new Date(end),     
	    address: event.location,
	    description: event.description
	}
    });
    return myCalendar;
}

function add_calendar_links(event, id){
    var myCalendar = createCalendar({
	calendars: ['google','ical','yahoo','outlook'],
	options: {
	    class_name: 'calendaradder',
	    id: 'addtocalendar'
	},
	data: {
	    title: event.title,
	    start: new Date(event.start),
	    end: new Date(event.end),     
	    address: event.location,
	    description: event.description
	}
    });
    document.querySelector(id).appendChild(myCalendar);
}