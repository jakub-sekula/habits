var root = document.querySelector(':root');
var buttons = document.getElementsByClassName("btn");

var firstClick = 1; //set firstClick flag to 1 on load
var buttonIDs = [];

// HABIT CARD FUNCTIONS
var clickedButtonID = null;
var clickedButtonColour = null;
var clickedButtonTitle = null;

document.addEventListener('DOMContentLoaded', updateDate, false);
window.onload = setRandomWidth;
setInterval(setRandomWidth, 2500);

addListenersToAllBtns();

document.getElementById("addBtn").addEventListener("click", hideBackgroundImage);
document.getElementById("removeBtn").addEventListener("click", showBackgroundImage);
document.getElementById("showPopupButton").addEventListener("click", showPopup);
document.getElementById("hidePopupButton").addEventListener("click", hidePopup);
document.getElementById("dark-overlay").addEventListener("click", hidePopup);
document.getElementById("dark-overlay-habit").addEventListener("click", hideHabitCard);


function updateDate() {
	let currentDate = new Date();
	console.log(currentDate);
	let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
	document.getElementById("dateString").innerHTML = `TODAY'S DATE IS ${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
	document.getElementById("page-title").innerHTML = `MY HABITS | ${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
}

function setRandomWidth() {
	let bars = ["bar1", "bar2", "bar3", "bar4", "bar5", "bar6", "bar7", "bar8", "bar9", "bar10"];

	for (let i = 0; i < bars.length; i++) {

		let randomPercentage = 100 * Math.random() + 5;

		if (randomPercentage > 100) {
			randomPercentage = 100;
		}

		document.getElementById(bars[i]).style.width = randomPercentage + "%";
	}
}

function hideBackgroundImage() {
	document.body.style.backgroundColor = "#141f32";
	document.body.style.backgroundImage = "none";
	root.style.setProperty('--nav-text-color', 'white');
}

function showBackgroundImage() {
	document.body.style.backgroundColor = "beige";
	root.style.setProperty('--nav-text-color', '#474747');
}

function showPopup() {
	document.getElementById("popup-overlay").style.display = "flex";
	setTimeout(function () {
		document.getElementById("popup-overlay").style.opacity = "1";
	}, 10);
}

function hidePopup() {
	document.getElementById("popup-overlay").style.opacity = "0";
	setTimeout(function () {
		document.getElementById("popup-overlay").style.display = "none";
	}, 300);
}

function addListenersToAllBtns() {
	//loop over all buttons on page, assign them unique IDs and attach their EventListeners

	for (let i = 0; i < buttons.length; i++) {
		let btn_id = guidGenerator();

		buttonIDs[i] = btn_id;
		buttons[i].setAttribute("id", btn_id);

		buttons[i].childNodes[1].addEventListener("click", addListenersAfterFirstLoad);
		buttons[i].childNodes[1].addEventListener("click", getClickedButtonInformation);
		buttons[i].childNodes[1].addEventListener("click", showHabitCard);
	}

	function addListenersAfterFirstLoad() {
		//only run if this is the first button click since page load
		//this gets rid of errors where it cannot attach an event listener to null
		if (firstClick == 1) {
			firstClick = 0;
			window.addEventListener("resize", positionHabitCard);
			document.addEventListener('DOMContentLoaded', positionHabitCard, false);
		}
	}

	function getClickedButtonInformation() {
		clickedButtonID = btn_id;
		clickedButtonColour = buttons[i].getAttribute("class").split(" ")[1]; //button class format is ".btn colour"
		clickedButtonTitle = buttons[i].childNodes[1].childNodes[1].innerHTML;
		console.log("The ID of the clicked button is: ", clickedButtonID, "\n",
			'The colour of the clicked button is ', clickedButtonColour);
	}

}

function positionHabitCard() {
	var habit_button = document.getElementById(clickedButtonID);
	var card = document.getElementById("habit-card-1");

	var habit_position = habit_button.getBoundingClientRect();
	var card_position = card.getBoundingClientRect();

	var scroll_offset = document.body.getBoundingClientRect().top;

	var translate_X = -1 * ((card_position.width / 2) - (habit_position.width / 2));
	var translate_Y = -1 * ((card_position.height / 2) - (habit_position.height / 2));
	var x = habit_position.left;
	var y = habit_position.top - scroll_offset;

	var position_X = (Math.floor(x + translate_X)).toString() + "px";
	var position_Y = (Math.floor(y + translate_Y)).toString() + "px";

	card.style.left = position_X;
	card.style.top = position_Y;
}

function showHabitCard() {
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
	setTimeout(function () {
		card.style.opacity = "1";
		card.style.transform = "scale(1)";
	}, 150);
}

function hideHabitCard() {
	var card = document.getElementById("habit-card-1");
	var overlay = document.getElementById("habit-overlay");
	overlay.style.opacity = "0";
	setTimeout(function () {
		card.style.opacity = "0";
		card.style.transform = "scale(0.8)";
	}, 5);
	setTimeout(function () {
		overlay.style.display = "none";
	}, 300);
	card.style.transform = "scale(1)";
}

//unique ID generator function to give all buttons a random ID on page load
//source: https://stackoverflow.com/a/6860916
function guidGenerator() {
	var S4 = function () {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	};
	//return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	return (S4() + S4() + S4() + S4());
}