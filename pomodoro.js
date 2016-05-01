// // // // // // // // // //
// POMODORO TIMER (by HE)  //
// // // // // // // // // //

// Initiate a beep sound when timer finishes
ion.sound({
	sounds: [
		{name: "finished-task-sound"}
	],

	path: "includes/sounds/",
	preload: true,
	multiply: true
});

// Blink
function blink(obj) {
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
		var seconds, minutes, hours,
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
				ion.sound.play("finished-task-sound", { volume: 1 });
			}
			else if (!that.stopped) {
				hours = (elapsed / 3600) | 0;
				minutes = ((elapsed % 3600) / 60) | 0;
				seconds = (elapsed % 60) | 0;

				// Pad with 0 if single digit
				minutes = ((minutes < 10) ? "0" + minutes : minutes);
				seconds = ((seconds < 10) ? "0" + seconds : seconds);

				if (hours)
					display.html('<button id="timer">'+ hours + ":" + minutes + ":" + seconds + '</button>');
				else
					display.html('<button id="timer">' + minutes + ":" + seconds + '</button>');

				// Work/Break notification
				if (fnct.name === "breakTimer")
					$("#bottomIcon").html("W");
				else
					$("#bottomIcon").html("B");

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
	var ring = $("#ring p");

	$(window).resize(function() {
		var pomodoroMarginTop = ($(window).height() - $("#pomodoro").height()) / 2;
		if (pomodoroMarginTop > 0)
			$("#pomodoro").css("margin-top", pomodoroMarginTop);

		// Ring paragraph layout
		ring.css("top", ($("#ring").height() - ring.height()) / 2);
	});

	$(window).resize();

	// Blink start button and credit
	blink($("#start"));

	// Pomodoro start
	var timer;
	var workDuration = 25 * 60;
	var breakDuration = 5 * 60;
	var functionCalledOnce = false;
	// Change timer duration
	function setSettingsScreen() {
		// Set settings screen
		ring.hide();
		$("#settings").show();
		$("#bottomIcon").html('<button id="reset"><span class="glyphicon glyphicon-play"></button>');

		// Reset button
		$("#reset").click(function() {
			// Preload the finished task sound
			ion.sound.play("finished-task-sound", { volume: 0 });

			// Reset settings
			$("#settings").hide();
			ring.show();
			workTimer();
			functionCalledOnce = true;
		});

		if (functionCalledOnce)
			return;

		// Change and print the durations

		// Update duration using operator: (plus/minus)
		function updateDuration(duration, operator) {
			var minutes = (duration / 60) | 0;
			if (operator === "plus") {
				if (minutes >= 1 && minutes < 10)
					minutes++;
				else if (minutes >= 10 && minutes < 60)
					minutes += 5;
				else if (minutes >= 60 && minutes < 180)
					minutes += 15;
				else if (minutes >= 180 && minutes < 600)
					minutes += 30;
			}
			else if (operator === "minus") {
				if (minutes > 1 && minutes <= 10)
					minutes--;
				else if (minutes > 10 && minutes <= 60)
					minutes -= 5;
				else if (minutes > 60 && minutes <= 180)
					minutes -= 15;
				else if (minutes > 180)
					minutes -= 30;
			}

			// Return minutes in seconds
			return minutes * 60;
		}

		// Print duration to display in (hours:minutes)
		function printDuration(duration, display) {
			var minutes = (duration / 60) | 0;
			var hours;
			if (minutes >= 60) {
				hours = (minutes / 60) | 0;
				minutes = (minutes % 60) | 0;
				minutes = ((minutes < 10) ? "0" + minutes : minutes);
				display.html(hours + ":" + minutes);
			}
			else
				display.html(minutes);
		}

		// Update durations

		// Default
		printDuration(workDuration, $("#workTime"));
		printDuration(breakDuration, $("#breakTime"));

		var timeouts = {};
		var intervals = {};
		// Press buttons to update timer duration
		$("#plusWork, #minusWork, #plusBreak, #minusBreak").on("mousedown touchstart", function(e) {
			if ((e.type === "mousedown" && e.which === 1) || (e.type === "touchstart" && e.originalEvent.touches.length === 1)) {
				var that = this;
				var stage = this.id.match(/work|break/i)[0].toLowerCase();
				var operator = this.id.match(/plus|minus/i)[0];
				var duration = stage === "work" ? workDuration : breakDuration;

				updateDurationHandler = function() {
					// Update local duratioon
					duration = updateDuration(duration, operator);

					// Update global duration
					if (stage === "work")
						workDuration = duration;
					else
						breakDuration = duration;

					// Print duration
					printDuration(duration, $("#" + stage + "Time"));
				};

				// Update duration once
				updateDurationHandler();

				// Set the interval
				timeouts[this.id] = setTimeout(function() {
					intervals[that.id] = setInterval(updateDurationHandler, 100);
				}, 300);
				e.preventDefault();

				// Clear timeouts/intervals after the press
				$(window).on("mouseup touchend", function(e) {
					clearInterval(intervals[that.id]);
					clearTimeout(timeouts[that.id]);
				});
			}
		}); // <<< press +/- buttons event handler

	} // <<< setSettingsScreen

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

	// First click on "#cog"
	$("#cog").click(setSettingsScreen);

	// Start button
	$("#start").click(function() {
		setTimeout(workTimer, 100);

		// Preload the finished task sound
		ion.sound.play("finished-task-sound", { volume: 0 });
	});

	// Pause when clicking the timer
	ring.on('click', '#timer', function() {
		timer.stop();

		// Settings button
		$("#bottomIcon").html('<button id="cog"><span class="glyphicon glyphicon-cog"></button>');
		// Click settings button
		$("#tomato").on("click", "#cog", setSettingsScreen);

		// Continue and Restart buttons
		ring.html('<button id="continue"><span class="glyphicon glyphicon-play"></span></button>');
		ring.append('<button id="restart"><span class="glyphicon glyphicon-repeat"></span></button>');

		// Click continue and restart buttons
		$("#continue").click(function() {
			timer.go();
			$("#tomato").off();
		});

		$("#restart").click(function() {
			timer.restart();
			timer.go();
			$("#tomato").off();
		});
	}); // <<< ring click

}); // <<< ready
