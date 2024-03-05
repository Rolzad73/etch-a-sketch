// this is for the modal ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var modal = document.getElementById('modal');

var close = document.getElementById('close');
close.onclick = function () {
	modal.style.display = "none";
}

var show = document.getElementById('show');
show.onclick = function () {
	modal.style.display = "block";
}

// setup pixel && canvas variables ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var myScreen = document.getElementById("screen");
var screenWidth = myScreen.width;
var screenHeight = myScreen.height;

var canvasWidth = screenWidth - (screenWidth * .02)
var canvasHeight = screenHeight - (screenHeight * .02)

var dialL = document.getElementById("dialL")
var dialR = document.getElementById("dialR")

var myEtch = document.getElementById("etch");

function setup() {
	var canvas = createCanvas(canvasWidth, canvasHeight);
	canvas.parent("canvasContainer");
	frameRate(120);
}

// request MIDI access // does browser have midi ?? ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var midiX = 0;
var midiY = 0;
var pixelX = 0;
var pixelY = 0;
var lastPixelX = 0;
var lastPixelY = 0;

var degL;
var degR;

var midi = null;
var midiDevices = [];

if (navigator.requestMIDIAccess) {
	navigator.requestMIDIAccess({
		// software: true,
		sysex: false
	}).then(onMIDISuccess, onMIDIFailure);
} else {
	alert("no MIDI support in yr browser, please use Chrome.");
}

function onMIDISuccess(midiAccess) {
	// when we get a succesful response, run this code
	// console.log('MIDI Access Object', midiAccess);

	midi = midiAccess;

	var inputs = midi.inputs.values();
	for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
		input.value.onmidimessage = onMIDIMessage;
	}

	// create input selection menu and listen for selection ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	var i = 0;
	for (var input of midi.inputs.values()) {
		var opt = document.createElement("option");
		opt.text = input.name;
		opt.value = i;
		midiDevices.push(input);
		document.getElementById("inputportselector").add(opt);
		i++;
	}

	document.getElementById("inputportselector").addEventListener("change", function () {
		for (var i = 0; i < midiDevices.length; i++) {
			midiDevices[i].onmidimessage = null;
		};
		midiDevices[this.value].onmidimessage = onMIDIMessage;
	});
}

function onMIDIFailure(e) {
	// when we get a failed response, run this code
	alert("MIDI Error -> " + e.message);
}

// listen for midi input ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var channelL = -1;
var channelListeningL = false;
var channelR = -2;
var channelListeningR = false;

var modalL;
var modalR;

var dialL = document.getElementById('dialL');
dialL.addEventListener('click', function () {
	channelListeningL = true;
	modalL = document.getElementById('modalL');
	modalL.style.display = "block";
});

var closeL = document.getElementById('closeL');
closeL.onclick = function () {
	modalL.style.display = "none";
}

var dialR = document.getElementById('dialR');
dialR.addEventListener('click', function () {
	channelListeningR = true;
	modalR = document.getElementById('modalR');
	modalR.style.display = "block";
});

var closeR = document.getElementById('closeR');
closeR.onclick = function () {
	modalR.style.display = "none";
}

function onMIDIMessage(message) {
	// assign midi input to pixel && dial values ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// functions when midi message is received ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	lastPixelX = pixelX;
	lastPixelY = pixelY;

	if (channelListeningL == true) {
		channelL = message.data[1];
		channelListeningL = false;
		modalL.style.display = "none"
	}

	if (message.data[1] == channelL) {
		midiX = message.data[2];
		pixelX = midiX * (canvasWidth / 127.);
	}

	if (channelListeningR == true) {
		channelR = message.data[1];
		channelListeningR = false;
		modalR.style.display = "none"
	}

	if (message.data[1] == channelR) {
		midiY = Math.abs(message.data[2] - 127);
		pixelY = Math.abs(midiY * (canvasHeight / 127.));
	}

	setKnobRotations();
}

// assign arrow keys input to pixel && dial values ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
document.addEventListener("keydown", function (event) {

	var dX = 1.5;
	lastPixelX = pixelX;
	lastPixelY = pixelY;

	if (event.keyCode == 39) {
		if (pixelX < canvasWidth) {
			pixelX += sX * dX
		}
	} else if (event.keyCode == 37) {
		if (pixelX > 0) {
			pixelX -= sX * dX
		}
	} else if (event.keyCode == 38) {
		if (pixelY > 0) {
			pixelY -= sX * dX
		}
	} else if (event.keyCode == 40) {
		if (pixelY < canvasHeight) {
			pixelY += sX * dX
		}
	}

	setKnobRotations();
});

function setKnobRotations() {
	degL = (pixelX * 360 / canvasWidth) - 180
	dialL.style.transform = "rotateZ(" + degL.toString() + "deg" + ")";

	degR = (pixelY * -360 / canvasHeight) - 180
	dialR.style.transform = "rotateZ(" + degR.toString() + "deg" + ")"; 
}

// draw pixel ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var sX = canvasWidth / 127.;
var sY = canvasHeight / 127.;

function myPixel() {
	stroke("#333333");
	fill("#333333");
	rect(pixelX, pixelY, sX, sX);
}

function myLine() {
	stroke("#333333");
	strokeWeight(3);
	line(pixelX, pixelY, lastPixelX, lastPixelY);
}

document.getElementById("clear-drawing").addEventListener("click", function () {
	lastPixelX = pixelX;
	lastPixelY = pixelY;
	//do shake animation and clear
	myEtch.classList.add("shake-vertical");
	setTimeout(function() {
        myEtch.classList.remove("shake-vertical");
    }, 800);
	setTimeout(function() {
		clear();
    }, 400);
})

function draw() {
	if (pixelX >= canvasWidth - sX) {
		pixelX = canvasWidth - 1.5 * sX;
	}
	if (pixelY >= canvasHeight - sX) {
		pixelY = canvasHeight - 1.5 * sX;
	}

	myPixel();
	//myLine(); // framerate messes up last pixel position ref
}
