function updateDate() {
	let currentDate = new Date();
	console.log(currentDate)
	let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
	document.getElementById("dateString").innerHTML = "TODAY'S DATE IS " + currentDate.getDate() + "/" + (currentDate.getMonth()+1)
		+ "/" + currentDate.getFullYear();
}

window.onload = updateDate;


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
setInterval(setRandomWidth,2500);