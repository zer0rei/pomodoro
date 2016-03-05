$(document).ready(function() {
	
	// Timer count down (duration in seconds)
	function printCountDown(duration, display) {
		var start = Date.now(),
			elapsed,
			minutes,
			seconds,
			running = true;

		function timer() {
			elapsed = duration - (((Date.now() - start) / 1000) | 0);
			minutes = (elapsed / 60) | 0;
			seconds = (elapsed % 60) | 0;
			// add 0 to single number minutes
			minutes = minutes < 10 ? "0" + minutes : minutes;
			seconds = seconds < 10 ? "0" + seconds : seconds;

			display.html(minutes + ":" + seconds);
			if (elapsed < 0)
				running = false;	
		}		
		if (!running)
			return;
		timer();
		setInterval(timer, 1000);
	}

	// Blinking start button
	var shouldBlink = true;
	(function blink() {
		if (shouldBlink)
			$("#ring p").delay(200).fadeOut(700).delay(100).fadeIn(400, blink);
	})();

	// Pomodoro start
	var started = false;
	$("#ring").click(function() {
		if (!started) {
			started = true;
			shouldBlink = false;

			// start the timing
			setTimeout(function(){ printCountDown(30, $("#ring p"))}, 500);
			// fill the pomodoro
			//

		}
	});

});
