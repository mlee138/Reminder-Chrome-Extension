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
                if(filter === "all" ||
                (filter === "today" && today.getTime() === objDate.getTime()) ||
                (filter === "tomorrow" && tomorrow.getTime() === objDate.getTime()) ||
                (filter === "incomplete" && today.getTime() > objDate.getTime())){
                    return obj;
                }
            });
            return filtered;
        },
    }
})();

var QuoteController = (function(){
    const quotes = [
        {text: "Life is about making an impact, not making an income.", author: "Kevin Kruse"},
        {text: "Whatever the mind of man can conceive and believe, it can achieve.", author: "Napoleon Hill"},
        {text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein"},
        {text: "Two roads diverged in a wood, and I—I took the one less traveled by, And that has made all the difference.", author: "Robert Frost"},
        {text: "I attribute my success to this: I never gave or took any excuse.", author: "Florence Nightingale"},
        {text: "You miss 100% of the shots you don’t take.", author: "Wayne Gretzky"},
        {text: "The most difficult thing is the decision to act, the rest is merely tenacity.", author: "Amelia Earhart"},
        {text: "Every strike brings me closer to the next home run.", author: "Babe Ruth"},
        {text: "Definiteness of purpose is the starting point of all achievement.", author: "W. Clement Stone"},
        {text: "Life isn't about getting and having, it's about giving and being.", author: "Kevin Kruse"},
        {text: "Life is what happens to you while you’re busy making other plans.", author: "John Lennon"},
        {text: "We become what we think about.", author: "Earl Nightingale"},
        {text: "Life is 10% what happens to me and 90% of how I react to it.", author: "Charles Swindoll"},
        {text: "The most common way people give up their power is by thinking they don’t have any.", author: "Alice Walker"},
        {text: "The mind is everything. What you think you become.", author: "Buddha"},
        {text: "Eighty percent of success is showing up.", author: "Woody Allen"},
        {text: "Your time is limited, so don’t waste it living someone else’s life.", author: "Steve Jobs"},
        {text: "Winning isn’t everything, but wanting to win is.", author: "Vince Lombardi"},
        {text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey"},
        {text: "Whether you think you can or you think you can’t, you’re right.", author: "Henry Ford"},
        {text: "The two most important days in your life are the day you are born and the day you find out why.", author: "Mark Twain"},
        {text: "The best revenge is massive success.", author: "Frank Sinatra"},
        {text: "People often say that motivation doesn’t last. Well, neither does bathing.  That’s why we recommend it daily.", author: "Zig Ziglar"},
        {text: "Life shrinks or expands in proportion to one's courage.", author: "Anais Nin"},
        {text: "If you hear a voice within you say “you cannot paint,” then by all means paint and that voice will be silenced.", author: "Vincent Van Gogh"},
        {text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Valdo Emerson"},
        {text: "Go confidently in the direction of your dreams.  Live the life you have imagined.", author: "Henry David Thoreau"},
        {text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt"},
        {text: "Everything you’ve ever wanted is on the other side of fear.", author: "George Addair"},
        {text: "Start where you are. Use what you have.  Do what you can.", author: "Arthur Ashe"},
        {text: "Everything has beauty, but not everyone can see.", author: "Confucius"},
        {text: "How wonderful it is that nobody need wait a single moment before starting to improve the world.", author: "Anne Frank"},
        {text: "When I let go of what I am, I become what I might be.", author: "Lao Tzu"},
        {text: "Life is not measured by the number of breaths we take, but by the moments that take our breath away.", author: "Maya Angelou"},
        {text: "Happiness is not something readymade.  It comes from your own actions.", author: "Dalai Lama"}
    ];

    return {
        getQuote: function(){
            let rand = Math.floor(Math.random()*35);
            return quotes[rand];
        }
    }
})();

//Controls the User Interface===============
var UIController = (function() {
    const DOMstrings = {
        datePicker: ".info--datepicker",
        date: "#info--date",
        time: "#info--time",
        quote: "#info--quote--text",
        author: "#info--quote--author",
        input: ".info--input",
        addBtn: ".info--add",
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
            $(selector).fadeOut(300);
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
        },
        addQuote: function(quote) {
            $(DOMstrings.quote).text(quote);
        },
        addAuthor: function(author) {
            $(DOMstrings.author).text(author);
        }
    }
})();

//Communicates between controllers===============
var Controller = (function(listCtrl, uiCtrl, quoteCtrl){
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

    function addQuote(){
        //get today's quote
        var today = quoteCtrl.getQuote();
        //show quote in UI
        uiCtrl.addQuote(today.text);
        uiCtrl.addAuthor(today.author);
    }

    function checkItem(item){
        var now = new Date();
        now.setHours(0,0,0,0);
        var tomorrow = new Date();
            tomorrow.setHours(0,0,0,0);
            tomorrow.setDate(now.getDate()+1);
        var objDate = new Date(item.deadline);
        var option = uiCtrl.getViewOption();

        if(option === "all" ||
        (option === "today" && now.getTime() === objDate.getTime()) ||
        (option === "tomorrow" && tomorrow.getTime() === objDate.getTime()) ||
        (option === "incomplete" && now.getTime() > objDate.getTime())){
            return true;
        }
        return false;
    }

    function handleAdd(e) {
        e.preventDefault();
        //get the input
        var userInputs = uiCtrl.getInputs();
        //add the item
        var newItem = listCtrl.addItem(userInputs.text, userInputs.date);
        //check if UI should be updated
        if(checkItem(newItem)){
            uiCtrl.addItem(newItem);
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
            addQuote();
            loadInitialList();
        }
    }
})(ListController, UIController, QuoteController);

//Start==============================
$(document).ready(function(){
    Controller.init();
});