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
        deleteItem: function(id){
            var allID, index;
            allID = items.map(function(obj){
                return obj.id;
            });
            index = allID.indexOf(id);

            if(index !== -1){
                items.splice(index, 1);
                saveList();
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
        getFilteredList: function(filter) {
            var today = new Date();
            today.setHours(0,0,0,0);
            var tomorrow = new Date();
            tomorrow.setHours(0,0,0,0);
            tomorrow.setDate(today.getDate()+1);

            var filtered = items.map(function(obj){
                var objDate = new Date(obj.deadline);
                if(filter === "today" && today.getTime() === objDate.getTime()) {
                        return obj;
                } else if(filter === "tomorrow"){
                    if(tomorrow.getTime() === objDate.getTime()){
                        return obj;
                    }
                } else if (filter === "incomplete" && today.getTime() > objDate.getTime()){
                        return obj;
                }
            });
            return filtered;
        },
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
        list: ".list--items",
        item: ".item",
        options: ".list--options"
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
            template = '<li id="%id%" class="item"><div class="item--text"> <p>%txt%</p> <p>%dl%</p> </div><button class="item--btn"></button></li>';
            html = template.replace('%txt%', item.text);
            html = html.replace('%dl%', item.deadline);
            html = html.replace('%id%', item.id);
            document.querySelector(DOMstrings.list).insertAdjacentHTML('beforeend', html);
            
        },
        deleteItem: function(id){
            var selector = "#" + id;
            $(selector).fadeOut();
            setTimeout(function(){
                $(selector).remove();
            }, 500);
        },
        resetFields: function() {
            $(DOMstrings.input).val("");
        },
        resetList: function() {
            $(DOMstrings.list).children(DOMstrings.item).remove();
        },
        getViewOption: function() {
            return $('input:checked').val();
        },
        focusInput: function(){
            $(DOMstrings.input).focus();
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
        
        $(DOMstrings.list).click(handleDelete);
        $(DOMstrings.addBtn).click(handleAdd);
        $(DOMstrings.options).click(handleOptionChange);
    };

    function loadInitialList(){
        listCtrl.loadList();
        var items = listCtrl.getFilteredList("today");
        items.forEach(function(obj){
            if(obj !== undefined){
                uiCtrl.addItem(obj);
            }
        });
    }

    function handleAdd(e) {
        e.preventDefault();
        //get the input
        var userInputs = uiCtrl.getInputs();
        //add the item
        var newItem = listCtrl.addItem(userInputs.text, userInputs.date);
        //check if UI should be updated
        var now = new Date();
        now.setHours(0,0,0,0);
        var objDate = new Date(newItem.deadline);

        var option = uiCtrl.getViewOption();
        if(option === "today" && now.getTime() === objDate.getTime()){
            uiCtrl.addItem(newItem);
        } else if(option === "incomplete" && now.getTime() > objDate.getTime()){
            uiCtrl.addItem(newItem);
        } else if (option === "tomorrow"){
            var tomorrow = now;
            tomorrow.setDate(now.getDate()+1);
            if(tomorrow.getTime() === objDate.getTime()){
                uiCtrl.addItem(newItem);
            }
        }
        //clear the fields
        uiCtrl.resetFields();
        uiCtrl.focusInput();
    }

    function handleDelete(e) {
        var itemId = e.target.parentNode.id;
        //delete item from structure
        listCtrl.deleteItem(parseInt(itemId));
        //delete item from UI
        uiCtrl.deleteItem(itemId);
    }

    function handleOptionChange(e) {
        var option = e.target.value;
        if(option !== undefined){
            //reset the list
            uiCtrl.resetList();
            //return a filtered list
            var filtered = listCtrl.getFilteredList(option);
            //display filtered list
            filtered.forEach(function(obj){
                if(obj !== undefined ){
                    uiCtrl.addItem(obj);
                }
            });
        }
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