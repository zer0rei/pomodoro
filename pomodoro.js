// Beep sound when timer finishs
var finishAudio = new Audio('includes/sounds/sound-finished-task.mp3');

// Blinking
var shouldBlink = true;
function blink(obj) {
	if (shouldBlink)
		obj.delay(300).fadeOut(600).fadeIn(500, function() {
			blink(obj);
		});
}

// Count down Timer
function CountDownTimer(duration) {
	this.duration = duration;
	this.running = false;
	this.stopped = false;
	this.reset = false;

	// Start the timer, (print to display) (call fnct when timer is done)
	this.start = function(display, fnct) {
		if (this.running)
			return;
		this.running = true;
		var seconds, minutes,
			elapsed = this.duration + 1,
			that = this;

		(function timer() {
			if (that.reset) {
				that.reset = false;
				if (fnct.name === "breakTimer")
					elapsed = that.duration + 1;
				else
					that.running = false;
			}

			// Timer
			elapsed--;

			if (that.stopped)
				elapsed++;

			if (elapsed >= 0)
				setTimeout(timer, 1000);
			else {
				elapsed = 0;
				that.running = false;
			}

			if (elapsed === 0) {
				if (fnct.name === "breakTimer")
					display.html('BREAK');
				else
					display.html('WORK');
				// Play a beep
				finishAudio.play();
			}
			else if (!that.stopped) {
				minutes = (elapsed / 60) | 0;
				seconds = (elapsed % 60) | 0;

				minutes = ((minutes < 10) ? "0" + minutes : minutes);
				seconds = ((seconds < 10) ? "0" + seconds : seconds);

				display.html('<span id="timer">' + minutes + ":" + seconds + '</span>');
			}

			// Run fnct when finished (at 00:00)
			if (!that.running) {
				fnct();
			}

		}());
	};

	this.stop = function() {
		this.stopped = true;
	};

	this.go = function() {
		this.stopped = false;
	};

	this.restart = function() {
		this.reset = true;
	};
}

$(document).ready(function() {
	// Layout
	$("#pomodoro").css("margin-top", ($(window).height() - $("#pomodoro").height()) / 2);
	// Ring paragraph layout
	var ring = $("#ring p");
	ring.css("margin-top", ($("#ring").height() - ring.height()) / 2);

	// Blink start button
	blink($("#start"));

	// Pomodoro start
	var timer;
	var workDuration = 25 * 60;
	var breakDuration = 5 * 60;

	// Start the work countdown
	function workTimer() {
		timer = new CountDownTimer(workDuration);
		timer.start(ring, breakTimer);
	}
	// Start the break countdown
	function breakTimer() {
		timer = new CountDownTimer(breakDuration);
		timer.start(ring, workTimer);
	}

	// Event Buttons
	$("#start").click(function() {
		shouldBlink = false;
		setTimeout(workTimer, 100);
	});

	ring.on('click', '#timer', function() {
		timer.stop();
		ring.html('<span id="continue" class="glyphicon glyphicon-play"></span>');
		ring.append('<span id="restart" class="glyphicon glyphicon-repeat"></span>');

		$("#continue").click(function() {
			timer.go();
		});

		$("#restart").click(function() {
			timer.restart();
			timer.go();
		});
	});

});
