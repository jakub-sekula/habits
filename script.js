var r = document.querySelector(':root');

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
	setTimeout(function() {
		document.getElementById("popup-overlay").style.opacity = "1";
	},10);
}

function hidePopup(){
	document.getElementById("popup-overlay").style.opacity = "0";
	setTimeout(function(){document.getElementById("popup-overlay").style.display = "none";},300);	
}

document.getElementById("addBtn").addEventListener("click", hideBackgroundImage)
document.getElementById("removeBtn").addEventListener("click", showBackgroundImage)
document.getElementById("showPopupButton").addEventListener("click", showPopup)
document.getElementById("hidePopupButton").addEventListener("click", hidePopup)
document.addEventListener('DOMContentLoaded', updateDate, false);

window.onload = setRandomWidth;
setInterval(setRandomWidth,2500);