$(document).ready(function() {

//google spreadsheet url
var url = 'https://script.google.com/macros/s/AKfycbz04RlWxW1JKtFJN8d2iq5vr1GnpIc9dkmfDU3I0V-wDUBPKqCt/exec';
// current page number (default: -1)
var curPageNo = -1;
var surveyPageId = "#survey-page";
var resultObject = [];
var resultStorageName = "surveyresult";

//email, text, date, digit(comma, point), zip code(5 digits), phone number(start(0, 3), length 6~10)
//JSON for Pages Contents
var pageJSON = {
	title: "Survey Form",
	// single select
	pages: [
	{
		id: "singleselect1",
		question: "Single Select 1",
		type: "singleselect",
		answers: [
		{
			title: "Answer 1",
			value: "answer1"
		},
		{
			title: "Answer 2",
			value: "answer2"
		}
		]
	},
	// single select
	{
		id: "singleselect2",
		question: "Single Select 2",
		type: "singleselect",
		answers: [
		{
			title: "Answer 1",
			value: "answer1"
		},
		{
			title: "Answer 2",
			value: "answer2"
		},
		{
			title: "Answer 3",
			value: "answer3"
		},
		{
			title: "Answer 4",
			value: "answer4"
		},
		{
			title: "Answer 5",
			value: "answer5"
		}
		]
	},
	// multi select
	{
		id: "multiselect",
		question: "Multi Select 3",
		type: "multiselect",
		subtitle: "(optional)",
		answers: [
		{
			title: "Bank of America",
			value: "select1"
		},
		{
			title: "Chase",
			value: "select2"
		},
		{
			title: "Citibank",
			value: "select3"
		},
		{
			title: "USAA",
			value: "select4"
		},
		{
			title: "US Bank",
			value: "select5"
		},
		{
			title: "Wells Fargo",
			value: "select6"
		},
		{
			title: "Other",
			value: "select7"
		}
		]
	},
	// cf code
	{
		id: "cfcode",
		question: "codice fiscale",
		type: "input",
		validate: {
			type: "cf",
			errormsg: "Please Enter Valid CF"
		}
	},
	// common text(name)
	{
		id: "commontext",
		question: "Common Text 4",
		type: "input",
		subtitle: "Enter Your Name",
		validate: {
			type: "text",
			min: 1,
			max: 20,
			errormsg: "Please Enter Valid Name(length: 1 ~ 20)"
		}
	},
	// currency
	{
		id: "currency",
		question: "Currency 5",
		type: "input",
		validate: {
			type: "currency",
			unit: "€",
			errormsg: "Please Enter Valid Currency"
		}
	},
	// email address
	{
		id: "email",
		question: "Email 6",
		type: "input",
		validate: {
			type: "email",
			errormsg: "Please Enter Valid Mail Address"
		}
	},
	// date (DD/MM/YYYY)
	{
		id: "date",
		question: "Date 7",
		type: "input",
		validate: {
			type: "date",
			placeholder: "DD/MM/YYYY",
			errormsg: "Please Enter Valid Date"
		}
	},
	// phone number
	{
		id: "phonenumber",
		question: "Phone Number 8",
		type: "input",
		validate: {
			type: "phonenumber",
			start: [0, 3],
			min: 6,
			max: 10,
			errormsg: "Please Enter Valid Phone Number"
		}
	},
	// zip code
	{
		id: "zipcode",
		question: "Zip Code 9",
		type: "input",
		validate: {
			type: "zipcode",
			length: 5,
			errormsg: "Please Enter Valide Zip Code(Number:5 digits)"
		}
	}
]};

jQuery.fn.putCursorAtEnd = function() {

  return this.each(function() {
    
    // Cache references
    var $el = $(this),
        el = this;

    // Only focus if input isn't already
    if (!$el.is(":focus")) {
     $el.focus();
    }

    // If this function exists... (IE 9+)
    if (el.setSelectionRange) {

      // Double the length because Opera is inconsistent about whether a carriage return is one character or two.
      var len = $el.val().length * 2;
      
      // Timeout seems to be required for Blink
      setTimeout(function() {
        el.setSelectionRange(len, len);
      }, 1);
    
    } else {
      
      // As a fallback, replace the contents with itself
      // Doesn't work in Chrome, but Chrome supports setSelectionRange
      $el.val($el.val());
      
    }

    // Scroll to the bottom, in case we're in a tall textarea
    // (Necessary for Firefox and Chrome)
    this.scrollTop = 999999;
    console.log('cursor end');
  });

};

// Add Element To Survey Page
function addQuestionElement(question) {
	var questionElement = '<h1>' + question + '</h1>';
	$(surveyPageId).append(questionElement);
}

// Add Element To Survey Page
function addInputElement(id, validate) {
	var inputBox = "";
	var value = getResultStorage(id);

	if (validate.type == "text") {
		inputBox = '<div class="survey-input-area"><div class="survey-input-overlay"><input id="input-box" type="text" value="' + value + '"></div><p id="error-msg" class="survey-input-error">' + validate.errormsg + '</p></div>';
	} else if (validate.type == "cf") {
		inputBox = '<div class="survey-input-area"><div class="survey-input-overlay"><input id="input-box" type="text" value="' + value + '"></div><p id="error-msg" class="survey-input-error">' + validate.errormsg + '</p></div>';
	} else if (validate.type == "email") {
		inputBox = '<div class="survey-input-area"><div class="survey-input-overlay"><input id="input-box" type="email" value="' + value + '"></div><p id="error-msg" class="survey-input-error">' + validate.errormsg + '</p></div>';
	} else if (validate.type == "phonenumber") {
		inputBox = '<div class="survey-input-area"><div class="survey-input-overlay"><input id="input-box" type="tel" value="' + value + '"></div><p id="error-msg" class="survey-input-error">' + validate.errormsg + '</p></div>';
	} else if (validate.type == "zipcode") {
		inputBox = '<div class="survey-input-area"><div class="survey-input-overlay"><input id="input-box" type="text" value="' + value + '"></div><p id="error-msg" class="survey-input-error">' + validate.errormsg + '</p></div>';
	} else if (validate.type == "currency") {
		inputBox = '<div class="survey-input-area"><div class="survey-input-overlay"><div class="survey-input-overlay-left">' + validate.unit + '</div><input id="input-box" type="text" style="padding-left: 22px;" value="' + value + '"></div><p id="error-msg" class="survey-input-error">' + validate.errormsg + '</p></div>';
	} else if (validate.type == "date") {
		// inputBox = '<div class="survey-input-area"><div class="survey-input-overlay"><input id="input-box" type="text" placeholder="DD/MM/YYYY" value="' + value + '"></div><p id="error-msg" class="survey-input-error">' + validate.errormsg + '</p></div>';
		inputBox = '<div class="survey-input-area"><div class="survey-input-overlay"><div><input id="input-date-date" type="text" class="input-date" style="width:50px;" placeholder="DD" maxlength="2" size="2" value="' + value.substring(0, 2) + '">&nbsp;<input id="input-date-month" type="text" class="input-date" style="width:50px;" placeholder="MM" maxlength="2" size="2" value="' + value.substring(3, 5) + '">&nbsp;<input id="input-date-year" type="text" class="input-date" style="width:65px;" placeholder="YYYY" maxlength="4" size="4" value="' + value.substring(6, 10) + '"></div></div><p id="error-msg" class="survey-input-error">' + validate.errormsg + '</p></div>';
	}
	$(surveyPageId).append(inputBox);
	$("#input-box").focus(function() {
		hideInputError();
	});
	// add auto complete
	if (validate.type == "currency") {
		$("#input-box").on('input', function() {
			var currency = $(this).val();
			if (validateCurrency(currency)) {
				currency = currency.replace(/,/g, '');
				var newCurrency = numberWithCommas(currency);
				// console.log(newCurrency);
				$(this).val('');
				$(this).val(newCurrency);
				$(this).putCursorAtEnd();
			}
		});
	} else if (validate.type == "date") {
		$("#input-box").on('input', function() {
			var date = $(this).val().replace(/\//g, '');
			if (date.length >=4) {
				date = date.substring(0, 4) + '/' + date.substring(4);
			}
			if (date.length >=2) {
				date = date.substring(0, 2) + '/' + date.substring(2);
			}
			$(this).val(date);
			// $(this).selectionStart = $(this).selectionEnd = date.length;
			$(this).setSelectionRange(date.length, date.length);
			// console.log($(this));
			// console.log($(this).selectionStart);
		});
	}
}

// Add Element To Survey Page
function addSingleElements(id, answers) {
	var nAnswerCount = answers.length;

	for (var i = 0; i < nAnswerCount; i++) {
		var answer = answers[i].title;
		var answerElementId = "btn-answer-" + i;
		var answerElement;
		if (answers[i].value == getResultStorage(id)) {
			answerElement = '<a class="survey-button-primary survey-button-selected survey-icon-check" id="' + answerElementId + '">' + answer + '</a>';
		} else {
			answerElement = '<a class="survey-button-primary" id="' + answerElementId + '">' + answer + '</a>';
		}
		$(surveyPageId).append(answerElement);
		$("#" + answerElementId).click(function() {
			var index = parseInt($(this).attr('id').substring(11));
			goToNextPage(index);
		});
	}
}

// Add Element To Survey Page
function addMultiElements(id, answers) {
	$(surveyPageId).append('<div style="display: inline-block; max-width: 300px;"><ul id="multiselect-area" class="survey-toggles"></ul></div>')
	var nAnswerCount = answers.length;
	for (var i = 0; i < nAnswerCount; i++) {
		var answer = answers[i].title;
		var answerElementId = "multi-answer-" + i;
		var answerElement;
		var values = getResultStorage(id);
		if (answers[i].value == values[i]) {
			answerElement = '<li><label class="selected" id="' + answerElementId + '">' + answer + '</label></li>';	
		} else {
			answerElement = '<li><label id="' + answerElementId + '">' + answer + '</label></li>';
		}
		$("#multiselect-area").append(answerElement);
		$("#" + answerElementId).click(function() {
			var index = parseInt($(this).attr('id').substring(13));
			

			$(this).toggleClass("selected");
			var className = $(this).attr('class');
			var values = getResultStorage(id);
			// var answers = getMultipleAnswers(id);
			if (className == "selected") {
				values[index] = answers[index].value;
			} else {
				values[index] = "";
			}
			saveResultStorage(id, values);
		});
	}
}

// Add Element To Survey Page
function addSubtitle(subtitle) {
	// <p style="margin-bottom: 30px;">(Optional)</p>
	var subtitleElement = '<p>' + subtitle + '</p>'
	$(surveyPageId).append(subtitleElement);
}

// Add Element To Survey Page
function addNextButton() {
	var nextButton = '<div><a id="btn-next" class="survey-button-primary">Next</a></div>';
	$(surveyPageId).append(nextButton);

	$("#btn-next").click(function () {
		goToNextPage();
	});
}

// Add Final Thank you page
function addFinalPage() {
	var finalElement = '<h1 style="font-size: 30px;">Thank You!</h1>';
	$(surveyPageId).append(finalElement);
}

// Show Error for Input
function showInputError() {
	$("#input-box").addClass("input-error");
	$("#error-msg").css("visibility", "visible");
}

// Hide Error for Input
function hideInputError() {
	$("#input-box").removeClass("input-error");
	$("#error-msg").css("visibility", "hidden");
}

// Validate Text Min Max
function validateText(text, min, max) {
	var textLength = text.length;
	if (textLength >= min && textLength <= max) {
		return true;
	} else {
		return false;
	}
}

// Validate Currency
function validateCurrency(text) {
	var currency = text.replace(/,/g, '');
	if (currency.length > 0 && !isNaN(currency)) {
		return true;
	} else {
		return false;
	}
}

// Validate Email
function validateEmail(text) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(text);
}

// Validate Date
function validateDate(text) {
	var re = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
	return re.test(text);
}

// Validate Phone Number
function validatePhoneNumber(text, start, min, max) {
	
	if (text.length < min || text.length > max) {
		return false;
	}
	var check = false;
	for (var i = 0; i < start.length; i++) {
		console.log(start[i].toString());
		if (text.startsWith(start[i].toString())) {
			check = true;
			break;
		}
	}
	return check;
}

// Validate Zip Code
function validateZipCode(text, length) {
	var reg = /^\d+$/;
	if (text.length == length && reg.test(text)) {
		return true;
	} else {
		return false;
	}
}

// Validate CF Code
function validateCF(cf) {
	cf = cf.toUpperCase();
	if( cf == '' )  return false;
	if( ! /^[0-9A-Z]{16}$/.test(cf) )
		return false;
	var map = [1, 0, 5, 7, 9, 13, 15, 17, 19, 21, 1, 0, 5, 7, 9, 13, 15, 17,
		19, 21, 2, 4, 18, 20, 11, 3, 6, 8, 12, 14, 16, 10, 22, 25, 24, 23];
	var s = 0;
	for(var i = 0; i < 15; i++){
		var c = cf.charCodeAt(i);
		if( c < 65 )
			c = c - 48;
		else
			c = c - 55;
		if( i % 2 == 0 )
			s += map[c];
		else
			s += c < 10? c : c - 10;
	}
	var atteso = String.fromCharCode(65 + s % 26);
	if( atteso != cf.charAt(15) )
		return false;
	return true;
}

// Validate All Process
function validateProcess(index) {

	var idx = parseInt(index);
	var form = pageJSON.pages[curPageNo];

	if (form.type == "singleselect") {
		saveResultStorage(form.id, form.answers[idx].value);
		return true;
	} else if (form.type == "input") {
		var inputValue = $("#input-box").val();
		// validate for common text
		if (form.validate.type == "text") {
			if (validateText(inputValue, form.validate.min, form.validate.max)) {
				hideInputError();
				saveResultStorage(form.id, inputValue);
				return true;
			} else {
				showInputError();
				return false;
			}
		// validate for currency
		} else if (form.validate.type == "currency") {
			if (validateCurrency(inputValue)) {
				hideInputError();
				saveResultStorage(form.id, inputValue);
				return true;
			} else {
				showInputError();
				return false;
			}
		// validate for email
		} else if (form.validate.type == "email") {
			if (validateEmail(inputValue)) {
				hideInputError();
				saveResultStorage(form.id, inputValue);
				return true;
			} else {
				showInputError();
				return false;
			}
		// validate for date
		} else if (form.validate.type == "date") {
			var dateValue = $('#input-date-date').val() + '/' + $('#input-date-month').val() + '/' + $('#input-date-year').val();
			if (validateDate(dateValue)) {
				hideInputError();
				saveResultStorage(form.id, dateValue);
				return true;
			} else {
				showInputError();
				return false;
			}
		// validate for phone number
		} else if (form.validate.type == "phonenumber") {
			if (validatePhoneNumber(inputValue, form.validate.start, form.validate.min, form.validate.max)) {
				hideInputError();
				saveResultStorage(form.id, inputValue);
				return true;
			} else {
				showInputError();
				return false;
			}
		// validate for zipcode
		} else if (form.validate.type == "zipcode") {
			if (validateZipCode(inputValue, form.validate.length)) {
				hideInputError();
				saveResultStorage(form.id, inputValue);
				return true;
			} else {
				showInputError();
				return false;
			}
		// validate for cf
		} else if (form.validate.type == "cf") {
			if (validateCF(inputValue)) {
				hideInputError();
				saveResultStorage(form.id, inputValue);
				return true;
			} else {
				showInputError();
				return false;
			}
		}

		return true;
	} else if (form.type == "multiselect") {
		return true;
	} else {
		return false;
	}
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//goto next page
function goToNextPage(index) {
	if (curPageNo >= 0 && !validateProcess(index)) {
		return;
	}
	if (curPageNo < pageJSON.pages.length) {
		curPageNo++;
		// if ()
		if (curPageNo >= pageJSON.pages.length) {
			removePageContent();
			doPostSpreadSheet();
			addFinalPage();
			// alert('final page');
		} else {
			removePageContent();
			addPageContent(curPageNo);
		}
	}
}

// remove element from survey page
function removePageContent() {
	$(surveyPageId).empty();
}

// add element into survey page
function addPageContent(curPageNo) {
	var form = pageJSON.pages[curPageNo];
	// Add Question Title
	addQuestionElement(form.question);
	if (form.subtitle != null && form.subtitle.length > 0) {
		addSubtitle(form.subtitle);
	}
	// If type is "singleselect", "input"
	if (form.type == "singleselect") {
		addSingleElements(form.id, form.answers);
	// "multiselect"
	} else if (form.type == "multiselect") {
		addMultiElements(form.id, form.answers);
		addNextButton();
	// "input"(date, email, name, currency, phone)
	} else if (form.type == "input") {
		addInputElement(form.id, form.validate);
		addNextButton();
	}
}

// load result from local storage
function loadResultStorage() {
	if (!window.localStorage[resultStorageName]) {
		createResultStorage();
		resultObject = JSON.parse(window.localStorage[resultStorageName]);
	} else {
		resultObject = JSON.parse(window.localStorage[resultStorageName]);
		if (resultObject.length == 0) {
			createResultStorage();
			resultObject = JSON.parse(window.localStorage[resultStorageName]);
		}
	}
}

// save all result to local storage
function storeResultStorage() {
	window.localStorage.setItem(resultStorageName, JSON.stringify(resultObject));
}

// create new local storage
function createResultStorage() {
	var pageLength = pageJSON.pages.length;
	for (var i = 0; i < pageLength; i++) {
		var form = pageJSON.pages[i];
		var item = null;
		if (form.type == "singleselect" ||
			form.type == "input") {
			item = {
				id: form.id,
				value: ""
			};

		} else if (form.type == "multiselect") {
			var nLength = form.answers.length;
			var values = [];
			for (var j = 0; j < nLength; j++) {
				values[j] = "";
			}
			item = {
				id: form.id,
				value: values
			};
		}
		resultObject[i] = item;
	}
	window.localStorage.setItem(resultStorageName, JSON.stringify(resultObject));
}

// get value from result object which equals to local storage
function getResultStorage(id) {
	if (!window.localStorage[resultStorageName]) {
		createResultStorage();
		return "";
	} else {
		var nResultLength = resultObject.length;
		for (var i = 0; i < nResultLength; i++) {
			if (resultObject[i].id == id) {
				return resultObject[i].value;
			}
		}
		return "";
	}
}

// save value to result object as well as local storage
function saveResultStorage(id, value) {
	if (!window.localStorage[resultStorageName]) {
		createResultStorage();
	} else {
		var nResultLength = resultObject.length;
		for (var i = 0; i < nResultLength; i++) {
			if (resultObject[i].id == id) {
				resultObject[i].value = value;
				storeResultStorage();
				return;
			}
		}
	}	
}

function doPostSpreadSheet() {
	if (!window.localStorage[resultStorageName]) {
		alert('No survey data');
	}
	$.post(url,
  {
      singleselect1: "\'" + getResultStorage("singleselect1"),
      singleselect2: "\'" + getResultStorage("singleselect2"),
      multiselect: "\'" + JSON.stringify(getResultStorage("multiselect")),
      cfcode: "\'" + getResultStorage("cfcode"),
      commontext: "\'" + getResultStorage("commontext"),
      currency: "\'" + getResultStorage("currency"),
      email: "\'" + getResultStorage("email"),
      date: "\'" + getResultStorage("date"),
      phonenumber: "\'" + getResultStorage("phonenumber"),
      zipcode: "\'" + getResultStorage("zipcode"),
  },
  function(data, status){
  		// addFinalPage();
      console.log("Data: " + data + "\nStatus: " + status);
  });
  // alert('posted');
}

// Load User Info from Local Storage
loadResultStorage();

// Go to first page at start
goToNextPage();

});