function updateDate() {
	let currentDate = new Date();
	console.log(currentDate)
	let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
	document.getElementById("dateString").innerHTML = "TODAY'S DATE IS " + currentDate.getDate() + "/" + (currentDate.getMonth()+1)
		+ "/" + currentDate.getFullYear();
}

window.onload = updateDate;


function setRandomWidth(){
	let randomPercentage = 100 * Math.random() + 5;
	if (randomPercentage > 100) {
		randomPercentage = 100;
	}
	document.getElementById("kappa").style.width=randomPercentage+"%";
}
setInterval(setRandomWidth,2500);