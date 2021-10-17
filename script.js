var r = document.querySelector(':root');
var buttons = document.getElementsByClassName("btn");

var firstClick=1;
var buttonIDs = [];

document.addEventListener('DOMContentLoaded', updateDate, false);
window.onload = setRandomWidth;
setInterval(setRandomWidth,2500);

function updateDate() {
	let currentDate = new Date();
	console.log(currentDate)
	let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
	document.getElementById("dateString").innerHTML = "TODAY'S DATE IS " + currentDate.getDate() + "/" + (currentDate.getMonth()+1)
		+ "/" + currentDate.getFullYear();
	document.getElementById("page-title").innerHTML = "MY HABITS | " + currentDate.getDate() + "/" + (currentDate.getMonth()+1)
		+ "/" + currentDate.getFullYear();
}

function setRandomWidth(){
	let bars = ["bar1","bar2","bar3","bar4","bar5","bar6","bar7","bar8","bar9","bar10"]

	for (let i = 0; i<bars.length; i++){	
		
		let randomPercentage = 100 * Math.random() + 5;	
		
		if (randomPercentage > 100) {	
			randomPercentage = 100;	
		}	

		document.getElementById(bars[i]).style.width=randomPercentage+"%";
	}
}

function hideBackgroundImage(){
		document.body.style.backgroundColor = "#141f32"
		document.body.style.backgroundImage = "none";
		r.style.setProperty('--nav-text-color', 'white')


}

function showBackgroundImage(){
		document.body.style.backgroundColor = "beige"
		r.style.setProperty('--nav-text-color', '#474747')
		//document.body.style.backgroundImage = "linear-gradient(to bottom, rgba(0,0,0,0.4) , rgba(0,0,0,0)), url(\'img.jpg\')"
}

function showPopup(){
	document.getElementById("popup-overlay").style.display = "flex";
	setTimeout(function() {document.getElementById("popup-overlay").style.opacity = "1";},10);
}

function hidePopup(){
	document.getElementById("popup-overlay").style.opacity = "0";
	setTimeout(function(){document.getElementById("popup-overlay").style.display = "none";},300);	
}

// HABIT CARD FUNCTIONS
var clickedButtonID = null;
var clickedButtonColour = null;
var clickedButtonTitle = null;

addListenersToAllBtns();

function addListenersToAllBtns() {
	for (let i = 0; i<buttons.length; i++){
		let btn_id = guidGenerator(); //(Math.floor(Math.random()*1e7)).toString();

		buttonIDs[i]=btn_id;
		buttons[i].setAttribute("id",btn_id);

		buttons[i].addEventListener("click",function(){if (firstClick==1){firstClick=0;window.addEventListener("resize", positionHabitCard)
		document.addEventListener('DOMContentLoaded', positionHabitCard, false);}});

		buttons[i].addEventListener("click",function(){
			clickedButtonID = btn_id; 
			clickedButtonColour = buttons[i].getAttribute("class").split(" ")[1]; 
			clickedButtonTitle = buttons[i].childNodes[1].childNodes[1].innerHTML;
			console.log("The ID of the clicked button is: ", clickedButtonID, "\n",
				'The colour of the clicked button is ', clickedButtonColour)
			});
		buttons[i].addEventListener("click",showHabitCard);
	}
}

function positionHabitCard() {
	var habit_button = document.getElementById(clickedButtonID);
	var card = document.getElementById("habit-card-1");

	var habit_position = habit_button.getBoundingClientRect();
	var card_position = card.getBoundingClientRect();

	var scroll_offset = document.body.getBoundingClientRect().top;

	var translate_X = -1*((card_position.width/2)-(habit_position.width/2));
	var translate_Y = -1*((card_position.height/2)-(habit_position.height/2));
	var x = habit_position.left;
	var y = habit_position.top - scroll_offset;

	var position_X = (Math.floor(x + translate_X)).toString()+"px";
	var position_Y = (Math.floor(y + translate_Y)).toString()+"px";

	card.style.left = position_X;
	card.style.top = position_Y;
}

function showHabitCard(){
	let card = document.getElementById("habit-card-1");
	let cardSide = document.getElementById("habit-card-side");
	let cardTitle = document.getElementById("habit-card-title");
	let overlay = document.getElementById("habit-overlay");

	//set card colour and title
	cardTitle.innerHTML = clickedButtonTitle;	
	cardSide.className = "habit-card-side " + clickedButtonColour;

	//animate the card opening
	overlay.style.display = "flex";
	card.style.transform = "scale(1)";
	positionHabitCard();
	card.style.transform = "scale(0)";
	overlay.style.opacity = "1";
	setTimeout(function(){card.style.opacity = "1"; card.style.transform = "scale(1)"},150);
}

function hideHabitCard(){
	var card = document.getElementById("habit-card-1");
	var overlay = document.getElementById("habit-overlay");
	overlay.style.opacity = "0";
	setTimeout(function(){card.style.opacity = "0"; card.style.transform = "scale(0.8)"},5);
	setTimeout(function(){overlay.style.display = "none";},300)	
	card.style.transform = "scale(1)";
}


//unique ID generator function to give all buttons a random ID on page load
function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    //return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	return (S4()+S4()+S4()+S4());
}

document.getElementById("addBtn").addEventListener("click", hideBackgroundImage);
document.getElementById("removeBtn").addEventListener("click", showBackgroundImage);
document.getElementById("showPopupButton").addEventListener("click", showPopup);
document.getElementById("hidePopupButton").addEventListener("click", hidePopup);
document.getElementById("dark-overlay").addEventListener("click", hidePopup);
document.getElementById("dark-overlay-habit").addEventListener("click", hideHabitCard);
