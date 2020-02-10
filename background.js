//Controls the reminder list===============
var ListController = (function() {
    var item = (function(id, text, deadline){
        this.id = id;
        this.text = text;
        this.deadline = deadline;
    });
    var items = [];

    //when an item is added or deleted, save the items list
    function saveList(){
        localStorage.setItem('list', JSON.stringify(items));
        console.log("list saved");
    }

    return {
        addItem: function(text, date){
            var newItem, ID;
            //create an ID for the new item
            if(items.length === 0){
                ID = 1;
            } else {
                ID = items[items.length - 1].id + 1;
            }
            //if no text was added
            if(text){
                newItem = new item(ID, text, date);
                items.push(newItem);
                saveList();
                return newItem;
            } else {
                alert("All reminders must have text");
            }
            
        },
        loadList: function(){
            var stored = JSON.parse(localStorage.getItem('list'));
            if (stored !== null){
                items = stored;
                console.log("list loaded");
            } else{
                console.log("nothing stored");
            }
        },
        getList: function(){ return items; },
    }
})();

//Controls the User Interface===============
var UIController = (function() {
    var DOMstrings = {
        datePicker: ".info--datepicker",
        date: "#info--date",
        time: "#info--time",
        input: ".info--input",
        addBtn: ".info--add",
        viewAllReminders: ".info--viewAll",
        list: ".list--items"
    };
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var AM = false;

    function formatHour(hour){
        if(hour > 12){
            AM = false;
            hour -= 12;
        } else if(hour == 12){
            AM = false;
        } else if(hour == 0){
            AM = true;
            hour += 12;
        } else {
            AM = true;
        }
        return hour;
    }

    function formatMinutes(min) {
        var newMin;
        (min < 10 ? newMin= ["0", min].join("") : newMin = min );
        return newMin;
    }

    function updateTime() {
        var now = new Date();
        var minutes = formatMinutes(now.getMinutes());
        var hour = formatHour(now.getHours());
        var time = hour + ':' + minutes + (AM ? "AM" : "PM");
        document.querySelector(DOMstrings.time).textContent = time;

        //update the date again if it is potentially a new day
        if(hour == 12 && AM === true){
            updateDate();
        }
        setTimeout(updateTime, 1000);
    }
    
    function updateDate() {
        var now = new Date();
        var date = days[now.getDay()] + ", " + months[now.getMonth()] + " " + now.getDate();
        document.querySelector(DOMstrings.date).textContent = date;
    }
    
    return {
        getDOMstrings: function() { return DOMstrings; },
        updateClock: function() {
            updateTime();
            updateDate();
        },
        getInputs: function() {
            var text = $(DOMstrings.input).val();
            var date = $(DOMstrings.datePicker).datepicker({ dateFormat: 'dd,MM,yyyy' }).val();
            return userInputs = {
                text: text,
                date: date
            };
        },
        addItem: function(item) {
            var template, html;
            //placeholder
            template = '<li class="item"><div class="item--text"> <p>%txt%</p> <p>%dl%</p> </div><button class="item--btn"></button></li>';
            html = template.replace('%txt%', item.text);
            html = html.replace('%dl%', item.deadline);
            document.querySelector(DOMstrings.list).insertAdjacentHTML('beforeend', html);
        },
        resetFields: function() {
            $(DOMstrings.input).val("");
        }
    }
})();

//Communicates between controllers===============
var Controller = (function(listCtrl, uiCtrl){
    var DOMstrings = uiCtrl.getDOMstrings();
    function setupEventListeners() {
        console.log("setupEventListeners");
        $(DOMstrings.datePicker).datepicker();
        $(DOMstrings.datePicker).datepicker("setDate", new Date());
        
        $(DOMstrings.addBtn).click(function(e) {
            e.preventDefault();
            handleAdd();
        })
    };

    function loadInitialList(){
        listCtrl.loadList();
        var items = listCtrl.getList();
        items.forEach(function(obj){
            uiCtrl.addItem(obj);
        });
    }

    function handleAdd() {
        //get the input
        var userInputs = uiCtrl.getInputs();
        //add the item
        var newItem = listCtrl.addItem(userInputs.text, userInputs.date);
        //update the UI
        uiCtrl.addItem(newItem);
        //clear the fields
        uiCtrl.resetFields();
    }

    return {
        init: function(){
            setupEventListeners();
            uiCtrl.updateClock();
            loadInitialList();
        }
    }
})(ListController, UIController);

//Start==============================
$(document).ready(function(){
    Controller.init();
});