"use strict";
$(document).ready(function() {
	var songs = [
		{
			"title": "一生独一",
			"artist": "阮言Ruany",
			"cover": "./images/cover/oneLife.png",
			"num": "0",
			"darkColor": "#9397be",
			"lightColor": "#e2e2e2"
		},
		{
			"title": "Jeo's",
			"artist": "Elyonbeats",
			"cover": "./images/cover/jeo.jpg",
			"num": "1",
			"darkColor": "#3c3c3c",
			"lightColor": "#d1d2d3"
		},
		{
			"title": "Island",
			"artist": "Nujabs",
			"cover": "./images/cover/island.jpg",
			"num": "2",
			"darkColor": "#cb4b89",
			"lightColor": "#f7f1e5"
		}
	];

	var nbSongs = songs.length;
	var currentSong = 0;
	var dashLength = 49;
	var audio = null;
	var timer = null;

	function init() {


		// Chargement de la playlist
		for (var i=0; i<songs.length; i++) {
			$("<p>").html(songs[i].title + " &#183; " + songs[i].artist).appendTo($("#playlist"));
		}
		$("#playlist p:first-child").addClass("active");

		// Chargement de la première musique
		loadSong(1);
		//pause();
		$("#volumeSlider").change();

		// Playlist
		$("#playlist p").click(function() {
			loadSong($(this).index());
			hidePlaylist();
		});

		// Rotation du disque
		$("#disc").addClass("rotateDisc");

		$("#playPause").on("click", function() {
			if (audio.paused) on();
			else pause();
		});

		$(".previous").on("click", function() {
			nextSong(-1);
		});

		$(".next").on("click", function() {
			nextSong(1);
		});

		$("#total-timer").click(function(e) {
			// Coordonnées du centre du cercle
			var posElement = $("#total-timer").offset();
			var left = parseInt(posElement.left+12);
			var top = parseInt(posElement.top) + 136/2;
			console.log(posElement);

			var dx = e.pageX - left;
			var dy = e.pageY - top;
			console.log("dx: "+ dx + " - dy: " + dy);

			// On récupère l'angle
			var angleRad = Math.atan2(dx, dy);
			var angle = angleRad * 180 / Math.PI;

			// On va au bon endroit dans la musique
			audio.currentTime = (180 - angle)/180 * audio.duration;
			console.log((180 - angle)/180 * audio.duration);
		});

		$("#playlistLink").click(function() {
			if ($("#cover").hasClass("show90"))
				hidePlaylist();
			else showPlaylist();
		});

		// Son
		$("#volumeSlider").on("change mousemove", function() {
			audio.volume = ($(this).get(0).value / 100).toFixed(2);
		});
	}

	function loadSong(num) {
		currentSong = num;
		if (audio !== null) audio.pause();
		audio = $("#audio"+num).get(0);
		on(0);
		audio.volume = ($("#volumeSlider").get(0).value / 100).toFixed(2);

		$("#album").attr("src", songs[currentSong].cover);
		setTimeout( function(){
			// Infos
			$("#title").html(songs[currentSong].title);
			$("#artist").html(songs[currentSong].artist);
				$("#playlist p").removeClass("active");
				$("#playlist p span").remove();
				$("#playlist p:eq("+currentSong+")").addClass("active");

			// Style
				$("#playlist p").css("color", "#231f16");
				$("#playlist p.active").css("color", songs[currentSong].darkColor);
				$("#playlist p.active").html("<span>&rtrif;</span> " + $("#playlist p.active").html());
			$("#artist").css("color", songs[currentSong].darkColor);
			changeBackground();
		}, 300);

	}

	function changeBackground() {
		var bg = $("#backgroundGradient");
		$("#backgroundGradientTransition").css("background", "radial-gradient("+songs[currentSong].lightColor+","+songs[currentSong].darkColor+")");
			bg.css("opacity", "0");


		setTimeout( function(){
				bg.css("background", "radial-gradient("+songs[currentSong].lightColor+","+songs[currentSong].darkColor+")");
				bg.css("opacity", "1");
		}, 500);
	}

	function showPlaylist() {
		// On rentre le CD
		animateVinyl(0);

		// On tourne la pochette
		setTimeout( function(){
			$("#disc").css("opacity", "0");
			$("#timer").css("opacity", "0");
	    },600);

		setTimeout( function(){
			$("#cover").addClass("show90");
		}, 600);

		// On affiche la playlist
		setTimeout( function(){
			$("#playlist").addClass("show0");
	    },900);
	}

	function hidePlaylist() {
		// On cache la playlist
		$("#playlist").removeClass("show0");

	    // On tourne la pochette
		setTimeout( function(){
			$("#cover").removeClass("show90");
		}, 200);

		setTimeout( function(){
			$("#disc").css("opacity", "1");
			$("#timer").css("opacity", "1");
		}, 700);

	    // On sort le CD
		if (!audio.paused) {
			setTimeout( function(){
				animateVinyl("50%");
			},800);
		}
	}

	function animateVinyl(direction) {
		$("#vinyl").css({
			"left": direction,
			"transition": "all 0.8s"
		});
	}

	function on(start) {
		animateVinyl("50%");
		if (start !== undefined && audio.currentTime !== start)
			audio.currentTime = start;
	/////////////////////////////////////autoplay polocy
			var promise = audio.play();

			if (promise !== undefined) {
			    promise.then(_ => {
			        console.log("Autoplay started!");
			    }).catch(error => {
			        console.log("Autoplay provented!");
			    });
			}
/////////////////////////////////////////////////////////////

		$("#playPause p").html("&#61;").css({
			"transform": "rotate(90deg) scale(1,1.5)",
			"margin": "8px 0 0 18px"
		});

		// MAJ du temps
		if (timer) clearInterval(timer);
		timer = setInterval(updateTime, 1000);

		audio.removeEventListener("ended", off);
		audio.addEventListener("ended", off);
	}

	function pause() {
		animateVinyl(0);
		audio.pause();
		$("#playPause p").html("&rtrif;").css({
			"transform": "rotate(0deg) scale(1,1.5)",
			"margin": "6px 0 0 16px"
		});

		if (timer) clearInterval(timer);
		timer = null;
	}

	function off() {
		pause();
		nextSong(1);
		$("#timer-dash").css("stroke-dasharray", 0 + " " + (dashLength));
		$("#disc").css("transform", "rotate(0deg)");
	}

	function nextSong(direction) {
		currentSong = (currentSong + direction + nbSongs) % nbSongs;
		loadSong(currentSong);
	}

	function updateTime() {
		var ratio = 49 * audio.currentTime / audio.duration;
		$("#timer-dash").css("stroke-dasharray", ratio + " " + (dashLength - ratio));
	}

	init();
});
