function DatePicker(field, options) {

	var html =
   	[
	   	'<div class="material-datepicker hide">',
	    	'<section class="top-day">',
	    		'<span data-bind="text: day"></span>',
	    	'</section>',
	    	'<section class="middle-date">',
	    		'<div class="month" data-bind="text: shortMonth"></div>',
	    		'<div class="date" data-bind="text: date"></div>',
	    		'<div class="year" data-bind="text: year"></div>',
	    	'</section>',
	    	'<section class="calendar no-select">',
	    		'<a data-bind="click: prevMonth" class="control prev"> &#xf053 </a>',
	    		'<a data-bind="click: nextMonth" class="control next"> &#xf054 </a>',
	    		'<div class="title" data-bind="text: viewingMonthName() + \' \' + viewingYear()"></div>',
	    		'<div class="headings" data-bind="foreach: daysShort">',
		    		'<span data-bind="text: $data" class="day heading"></span>',
		    	'</div>',
	    		'<div class="days" data-bind="foreach : monthStruct()">',
	    			'<a data-bind="css:{ selected: $parent.isSelected($data), today: $parent.isToday($data) },text: $data, click: function(data,event){ $parent.chooseDate(data) }" class="day" data-bind="text: $data"></a>',
	    		'</div>',
	    	'</section>',
	    	'<section class="no-select button-container">',
	    		'<a class="close" data-bind="click: closePicker">OK</a>',
	    	'</section>',
		'</div>'
   	].join('\n');

	var picker = $(html);

	// insert picker after the field in the DOM
	$(field).after(picker);

	// show picker when field is in focus
	$(field).focus(function(){
		picker.removeClass('hide');
	});

	// setup picker position in relation to the field
	var fieldHeight = $(field).height();
	var offsetTop = $(field).offset().top + fieldHeight + 10;
	var offsetLeft = $(field).offset().left;
	picker.css('top', offsetTop);
	picker.css('left', offsetLeft);

	// setup option values
	var defaults = {
		format: "DD/MM/YYYY",
		colour: "#009688"
	};
	var options = $.extend(options, defaults);

	function AppViewModel(field, picker, options) {
		var self = this;
		self.daysShort = ['S', 'M', 'T', 'W','T', 'F', 'S'];
		self.field = field;
		self.options = options;
		self.today = ko.observable( moment() );
		self.datePickerValue = ko.observable();
		self.viewingMonth = ko.observable();
		self.viewingYear = ko.observable();
	    self.monthStruct = ko.observableArray();
		self.viewingMonthName = ko.computed(function(){
			var months = [
				'January', 'February', 'March', 'April', 'May',
				'June', 'July', 'August', 'September', 'October',
				'November', 'December'
			];
	    	return months[ self.viewingMonth() - 1 ];
	    });

	    self.closePicker = function(){
			picker.addClass('hide');
		};

		self.chooseDate = function(day) {
			if (day) {
				var date = moment( day + '/' + self.viewingMonth() + '/' + self.viewingYear(), self.options.format );
				self.datePickerValue(date);
				var year = self.viewingYear();
				var month = self.viewingMonth();
		 		var dateString = self.datePickerValue().format(self.options.format);
				$(self.field).val(dateString);
			}
		};

		self.setupViewingDates = function() {
			self.viewingYear(self.datePickerValue().year());
			self.viewingMonth(self.datePickerValue().month() + 1);
		}

		self.buildMonthStruct = function(){
	    	self.monthStruct.removeAll();
	    	var month = self.viewingMonth();
	    	var year = self.viewingYear();
	    	var startOfMonth = moment( "1/" + month + "/" + year, self.options.format).startOf('month');
	    	var startDay = startOfMonth.format('dddd');
	    	var startingPoint = startOfMonth.day();
	    	var daysInMonth = startOfMonth.endOf('month').date();
	    	var day = 1;
	    	for(var i = 0 ; i < 50 ; i++){
	    		if (i < startingPoint) {
	    			self.monthStruct.push("");
	    		}
	    		else {
	    			if(day <= daysInMonth){
		    			self.monthStruct.push(day);
	    			}
	    			day++;
	    		}
	    	}
	    };

		self.fetchDateFromField = function(){
			var dateString = $(field).val();
			if (dateString){
				self.datePickerValue( moment(dateString, self.options.format) );
			}
			else {
				self.datePickerValue( moment() );
			}
			self.setupViewingDates();
			self.buildMonthStruct();
		};

		$(field).keyup(function(){
			self.fetchDateFromField();
		});

		$(field).focus(function(){
			self.fetchDateFromField();
			self.chooseDate(self.datePickerValue().date());
		});

		   // init function
		self.init = function() {
			self.fetchDateFromField();
		};

		self.init();

	    self.nextMonth = function() {
	    	if (self.viewingMonth() < 12){
	    		self.viewingMonth(self.viewingMonth() + 1);
	    	} else {
	    		self.viewingMonth(1);
	    		self.viewingYear(self.viewingYear() + 1);
	    	}
	    	self.buildMonthStruct();
	    }

	    self.prevMonth = function() {
	    	if (self.viewingMonth() > 1){
	    		self.viewingMonth(self.viewingMonth() - 1);
	    	} else {
	    		self.viewingMonth(12);
	    		self.viewingYear(self.viewingYear() - 1);
	    	}
	    	self.buildMonthStruct();
	    }

	    self.isToday = function(day) {
	    	var thisDay = day == self.today().date();
	    	var thisMonth = self.viewingMonth() == (self.today().month() + 1);
	    	var thisYear = self.viewingYear() == self.today().year();
	    	return thisDay && thisMonth && thisYear;
	    };

	    self.isSelected = function(day) {
	    	var rightMonth = self.viewingMonth() == (self.datePickerValue().month() + 1);
	    	var rightYear = self.viewingYear() == self.datePickerValue().year();
	    	return day == self.date() && rightMonth && rightYear;
	    };

	    self.day = ko.computed(function(){
	    	return self.datePickerValue().format('dddd');
	    });

	    self.date = ko.computed(function(){
	    	return self.datePickerValue().date();
	    });

	    self.month = ko.computed(function(){
	    	return self.datePickerValue().format("MMMM");
	    });

	    self.shortMonth = ko.computed(function(){
	    	return self.datePickerValue().format("MMM");
	    });

	    self.year = ko.computed(function(){
	    	return self.datePickerValue().year();
	    });

   		self.buildMonthStruct();
	}
	var viewModel = new AppViewModel(field, picker, options);
	window.viewModel = viewModel;
	ko.applyBindings(viewModel, picker[0]);
}