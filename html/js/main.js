/*
	Seanbat is a JavaScript attempt at building an Atari-style game
	It's written with jQuery b/c I work faster with jQuery.
	It's an experiement primarily to test making big chunky pixels with HTML elements.
	Hope I finish it and some stranger uses it someday (and likes it).
*/

var Seanbat = function($) {

	var $window = $(window), // cached jQ objects
		$body = $body,
		$board,

		shells = [], // arrays
		elements = [],

		game = { // master object
			window: {},
			board: {},
			pixel: {}
		};

	game.register = function(name) {
		name = name || 'undefined';
		elements.push(name);
		return elements.length - 1;
	}

	game.window.styles = {
		background: '#F9FF42'
	}

	game.window.dims = {
		w: $window.width(),
		h: $window.height(),
		ratio960: ($window.width() - 72) / 960
	}

	game.board.init = function() {
		// create board
		game.board.create();
		$board = $('#board');
		game.board.resize();
	}

	game.board.styles = {
		background: '#8F2400'
	}

	game.board.dims = {
		h: 0,
		w: 0,
		x: 0,
		y: 0
	}

	game.board.create = function() {
		// create background
		var board = '<div id="board" style="position: relative; background: ' + game.board.styles.background + '; width: ' + game.window.dims.w + 'px; height: ' + game.window.dims.h + 'px;"></div>';
		$('body').html(board);
	}

	game.board.resize = function() {
		game.pixel.resize();
		game.board.dims.w = game.pixel.dims.x * game.pixel.dims.w;
		game.board.dims.h = game.pixel.dims.y * game.pixel.dims.h;
		game.board.dims.x = (game.window.dims.w - game.board.dims.w) / 2;
		game.board.dims.y = (game.window.dims.h - game.board.dims.h) / 2;
		$board.css({'width': game.board.dims.w, 'height': game.board.dims.h, margin: game.board.dims.y * 1.5 + 'px 0 0 ' + game.board.dims.x + 'px'});
	}

	game.pixel.dims = {
		x: 160, // 96 pixels wide
		y: 90, // 54 pixels tall
		w: Math.floor(6 * game.window.dims.ratio960), // 10px at 960 w
		h: Math.floor(6 * game.window.dims.ratio960)
	}

	game.pixel.resize = function() {

	}

	game.getPixelSize = function() {
		return game.pixel.dims.w;
	}

	game.controls = function() {
		$(document).keydown(function(e){
			e.preventDefault();
			if (e.keyCode === 37) { 
				$(document).trigger('leftkeydown');
			}
			if (e.keyCode === 38) { 
				$(document).trigger('upkeydown');
			}
			if (e.keyCode === 39) { 
				$(document).trigger('rightkeydown');
			}
			if (e.keyCode === 40) { 
				$(document).trigger('downkeydown');
			}
			if (e.keyCode === 32) {
				$(document).trigger('spacebardown');
			}
		}).keyup(function(e){
			e.preventDefault();
			if (e.keyCode === 37) { 
				$(document).trigger('leftkeyup');
			}
			if (e.keyCode === 38) { 
				$(document).trigger('upkeyup');
			}
			if (e.keyCode === 39) { 
				$(document).trigger('rightkeyup');
			}
			if (e.keyCode === 40) { 
				$(document).trigger('downkeyup');
			}
			if (e.keyCode === 32) {
				$(document).trigger('spacebarup');
			}
		});
	}

	game.element = function(args) {
		var that = {};
		that.name = args.name;
		that.id = game.register(that.name);
		that.color = args.color || '#111';
		that.w = args.w || 6;
		that.h = args.h || 6;
		that.htmlClass = 'element';
		that.x = args.x || 0;
		that.y = args.y || 0;
		that.timeout = null,
		that.iterations = 0,
		that.velocity = 0;
		that.rotation = 0;
		that.pixels = [
			[1,1,1,1,1,1],
			[1,1,1,1,1,1],
			[1,1,1,1,1,1],
			[1,1,1,1,1,1],
			[1,1,1,1,1,1],
			[1,1,1,1,1,1]
		];
		that.spriteCount = 0;

		that.paintSprite = function(dir) {
			if (!that.sprite) {
				return false
			}

			var key = that.spriteCount + dir;

			if (key >= that.sprite.length) {
				key = 0;
			}
			if (key < 0) { // repeat
				key = that.sprite.length - 1;
			}

			var sprite = that.sprite[key], // grab new sprite array
				$pixels = $('#' + that.name).find('.pixel'); // get all pixels in proper id
			
			for (var i = 0; i < $pixels.length; i++) {
				$pixels.eq(i).removeClass('solid transparent').addClass(((sprite[i] === 1) ? 'solid' : 'transparent')).css({'background': ((sprite[i] === 1) ? that.color : 'transparent')});
			}

			that.spriteCount = key;
		}

		that.getMovement = function(time,mod) {
			var xD = 0, yD = 0;
			if (mod === 0) { // 0, 4, 8, 12
				if (that.heading === 0) {
					yD = 2;
				} else if (that.heading === 4) {
					xD = -2;
				} else if (that.heading === 8) {
					yD = -2;
				} else if (that.heading === 12) {
					xD = 2;
				}
			} else if (mod === 1) { // 1, 5, 9, 13
				if (that.heading === 1) {
					xD = -1;
					yD = 2;
				} else if (that.heading === 5) {
					xD = -2;
					yD = -1;
				} else if (that.heading === 9) {
					xD = 1
					yD = -2;
				} else if (that.heading === 13) {
					xD = 2;
					yD = 1;
				}
				time = Math.floor(time * 1.1181);
			} else if (mod === 2) { // 2, 6, 10, 14
				if (that.heading === 2) {
					xD = -2;
					yD = 2;
				} else if (that.heading === 6) {
					xD = -2;
					yD = -2;
				} else if (that.heading === 10) {
					xD = 2
					yD = -2;
				} else if (that.heading === 14) {
					xD = 2;
					yD = 2;
				}
				time = Math.floor(time * 1.4142);
			} else if (mod === 3) { // 3, 7, 11, 15
				if (that.heading === 3) {
					xD = -2;
					yD = 1;
				} else if (that.heading === 7) {
					xD = -1;
					yD = -2;
				} else if (that.heading === 11) {
					xD = 2
					yD = -1;
				} else if (that.heading === 15) {
					xD = 1;
					yD = 2;
				}
				time = Math.floor(time * 1.1181);
			}

			return {
				time: time,
				xD: xD,
				yD: yD
			}
		}

		that.init = function() {
			var pixels = '<div class="element" id="' + that.name + '" style="position: absolute; width: ' + that.w * game.getPixelSize() + 'px; height: ' + that.h * game.getPixelSize() + 'px; left: ' + that.x * game.getPixelSize() + 'px; top: ' + that.y * game.getPixelSize() + 'px;">';
			for (var i = 0; i < that.pixels.length; i++) {
				for (var j = 0; j < that.pixels[i].length; j++) {
					pixels += '<div class="pixel' + ((that.pixels[i][j] === 1) ? ' solid' : ' transparent') + '" style="position: absolute; background: ' + ((that.pixels[i][j] === 1) ? that.color : 'transparent') + '; width: ' + game.getPixelSize() + 'px; height: ' + game.getPixelSize() + 'px; left: ' + (j % that.pixels[0].length) * game.getPixelSize() + 'px; top: ' + i * game.getPixelSize() + 'px;"></div>';
				}
			}
			pixels += '</div>';
			$board.append(pixels);
		}
		return that;
	}

	game.shell = function(args) {
		var that = game.element(args);
		that.htmlClass = 'shell';
		that.w = 1;
		that.h = 1;
		that.heading = args.heading,
		that.velocity = 4,
		that.range = 27,
		that.created = getNow();
		that.pixels = [[1]];

		that.animate = function() {
			if (that.iterations > that.range) {
				that.destroy();
				return false;
			}
			// propel shell
			var time = that.velocity * 20,
				mod = that.heading % 4;

			var movement = that.getMovement(time, mod);

			// set position and move
			that.x = parseInt(that.x) + (-movement.xD);
			that.y = parseInt(that.y) + (-movement.yD);

			$('#' + that.name).css({'left': that.x * game.getPixelSize(), 'top': that.y * game.getPixelSize()});
			that.iterations++;

			that.timeout = setTimeout(function() { that.animate(); }, movement.time);
		}

		that.destroy = function() {
			// this object will self-destruct in 5...4...3...
			shells.shift();
			$('#' + that.name).destroy();
		}

		return that;
	}

	game.tank = function(args) {
		var that = game.element(args);
		that.htmlClass = 'plus';
		that.w = 9,
		that.h = 9,
		that.rotating = false;
		that.driving = false;
		that.firing = false;
		that.lastFired = 0;
		that.brake = false;
		that.driveAnimationComplete = true;
		that.heading = 0;
		that.pixels = [
			[0,0,0,0,1,0,0,0,0],
			[0,0,0,0,1,0,0,0,0],
			[0,1,1,0,1,0,1,1,0],
			[0,1,1,1,1,1,1,1,0],
			[0,1,1,1,1,1,1,1,0],
			[0,1,1,1,1,1,1,1,0],
			[0,1,1,0,0,0,1,1,0],
			[0,1,1,0,0,0,1,1,0],
			[0,0,0,0,0,0,0,0,0]
		];
		that.sprite = [
			[
				0,0,0,0,1,0,0,0,0,
				0,0,0,0,1,0,0,0,0,
				0,1,1,0,1,0,1,1,0,
				0,1,1,1,1,1,1,1,0,
				0,1,1,1,1,1,1,1,0,
				0,1,1,1,1,1,1,1,0,
				0,1,1,0,0,0,1,1,0,
				0,1,1,0,0,0,1,1,0,
				0,0,0,0,0,0,0,0,0
			],
			[
				0,0,0,1,0,0,1,0,0,
				0,0,1,1,0,0,1,0,0,
				0,0,1,1,1,1,0,0,1,
				0,1,1,1,1,1,1,1,1,
				0,1,1,1,1,1,1,1,1,
				0,0,1,0,0,1,1,1,0,
				0,0,0,0,0,1,1,1,0,
				0,0,0,0,0,0,1,0,0,
				0,0,0,0,0,0,0,0,0
			],
			[
				0,0,0,0,1,1,0,0,1,
				0,0,0,1,1,1,0,1,0,
				0,0,1,1,1,1,1,0,0,
				0,1,1,1,1,1,1,1,1,
				0,1,1,0,1,1,1,1,1,
				0,0,0,0,0,1,1,1,0,
				0,0,0,0,1,1,1,0,0,
				0,0,0,0,1,1,0,0,0,
				0,0,0,0,0,0,0,0,0
			],
			[
				0,0,0,0,0,0,0,0,0,
				0,0,0,1,1,1,0,0,0,
				0,1,1,1,1,0,0,0,0,
				1,1,1,1,1,0,1,1,0,
				0,1,1,1,1,1,0,0,0,
				0,0,0,1,1,1,0,0,0,
				0,0,0,1,1,1,1,1,0,
				0,0,1,1,1,1,1,0,0,
				0,0,0,1,1,0,0,0,0
			],
			[
				0,0,0,0,0,0,0,0,0,
				0,1,1,1,1,1,1,0,0,
				0,1,1,1,1,1,1,0,0,
				0,0,0,1,1,1,0,0,0,
				0,0,0,1,1,1,1,1,1,
				0,0,0,1,1,1,0,0,0,
				0,1,1,1,1,1,1,0,0,
				0,1,1,1,1,1,1,0,0,
				0,0,0,0,0,0,0,0,0
			],
			[
				0,0,0,1,1,0,0,0,0,
				0,0,1,1,1,1,1,0,0,
				0,0,0,1,1,1,1,1,0,
				0,0,0,1,1,1,0,0,0,
				0,1,1,1,1,1,0,0,0,
				1,1,1,1,1,0,1,1,0,
				0,1,1,1,1,0,0,0,0,
				0,0,0,1,1,1,0,0,0,
				0,0,0,0,0,0,0,0,0
			],
			[
				0,0,0,0,0,0,0,0,0,
				0,0,0,0,1,1,0,0,0,
				0,0,0,0,1,1,1,0,0,
				0,0,0,0,0,1,1,1,0,
				0,1,1,0,1,1,1,1,1,
				0,1,1,1,1,1,1,1,1,
				0,0,1,1,1,1,1,0,0,
				0,0,0,1,1,1,0,1,0,
				0,0,0,0,1,1,0,0,1
			],
			[
				0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,1,0,0,
				0,0,0,0,0,1,1,1,0,
				0,0,1,0,0,1,1,1,0,
				0,1,1,1,1,1,1,1,1,
				0,1,1,1,1,1,1,1,1,
				0,0,1,1,1,1,0,0,1,
				0,0,1,1,0,0,1,0,0,
				0,0,0,1,0,0,1,0,0
			],
			[
				0,0,0,0,0,0,0,0,0,
				0,1,1,0,0,0,1,1,0,
				0,1,1,0,0,0,1,1,0,
				0,1,1,1,1,1,1,1,0,
				0,1,1,1,1,1,1,1,0,
				0,1,1,1,1,1,1,1,0,
				0,1,1,0,1,0,1,1,0,
				0,0,0,0,1,0,0,0,0,
				0,0,0,0,1,0,0,0,0
			],
			[
				0,0,0,0,0,0,0,0,0,
				0,0,1,0,0,0,0,0,0,
				0,1,1,1,0,0,0,0,0,
				0,1,1,1,0,0,1,0,0,
				1,1,1,1,1,1,1,1,0,
				1,1,1,1,1,1,1,1,0,
				1,0,0,1,1,1,1,0,0,
				0,0,1,0,0,1,1,0,0,
				0,0,1,0,0,1,0,0,0
			],
			[
				0,0,0,0,0,0,0,0,0,
				0,0,0,1,1,0,0,0,0,
				0,0,1,1,1,0,0,0,0,
				0,1,1,1,0,0,0,0,0,
				1,1,1,1,1,0,1,1,0,
				1,1,1,1,1,1,1,1,0,
				0,0,1,1,1,1,1,0,0,
				0,1,0,1,1,1,0,0,0,
				1,0,0,1,1,0,0,0,0
			],
			[
				0,0,0,0,1,1,0,0,0,
				0,0,1,1,1,1,1,0,0,
				0,1,1,1,1,1,0,0,0,
				0,0,0,1,1,1,0,0,0,
				0,0,0,1,1,1,1,1,0,
				0,1,1,0,1,1,1,1,1,
				0,0,0,0,1,1,1,1,0,
				0,0,0,1,1,1,0,0,0,
				0,0,0,0,0,0,0,0,0
			],
			[
				0,0,0,0,0,0,0,0,0,
				0,0,1,1,1,1,1,1,0,
				0,0,1,1,1,1,1,1,0,
				0,0,0,1,1,1,0,0,0,
				1,1,1,1,1,1,0,0,0,
				0,0,0,1,1,1,0,0,0,
				0,0,1,1,1,1,1,1,0,
				0,0,1,1,1,1,1,1,0,
				0,0,0,0,0,0,0,0,0
			],
			[
				0,0,0,0,0,0,0,0,0,
				0,0,0,1,1,1,0,0,0,
				0,0,0,0,1,1,1,1,0,
				0,1,1,0,1,1,1,1,1,
				0,0,0,1,1,1,1,1,0,
				0,0,0,1,1,1,0,0,0,
				0,1,1,1,1,1,0,0,0,
				0,0,1,1,1,1,1,0,0,
				0,0,0,0,1,1,0,0,0
			],
			[
				1,0,0,1,1,0,0,0,0,
				0,1,0,1,1,1,0,0,0,
				0,0,1,1,1,1,1,0,0,
				1,1,1,1,1,1,1,1,0,
				1,1,1,1,1,0,1,1,0,
				0,1,1,1,0,0,0,0,0,
				0,0,1,1,1,0,0,0,0,
				0,0,0,1,1,0,0,0,0,
				0,0,0,0,0,0,0,0,0
			],
			[
				0,0,1,0,0,1,0,0,0,
				0,0,1,0,0,1,1,0,0,
				1,0,0,1,1,1,1,0,0,
				1,1,1,1,1,1,1,1,0,
				1,1,1,1,1,1,1,1,0,
				0,1,1,1,0,0,1,0,0,
				0,1,1,1,0,0,0,0,0,
				0,0,1,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0
			]
		];

		that.rotateTank = function(dir) {
			// tank has 16 headings
			if (that.rotating) {
				return false; // disable press and hold
			}
			that.heading += dir;
			if (that.heading < 0) {
				that.heading = 15;
			}
			if (that.heading > 15) {
				that.heading = 0;
			}

			that.paintSprite(dir);
		}

		that.driveTank = function(dir, keypress) {
			// since we're keeping things simple with a grid system, here are some important things to note:
			// within each quadrant, there are 4 headings (rise/run):
			// (a. 0,0 > 0,2; b. 0,0 > 1,2; c. 0,0 > 2,2; d. 0,0 > 2,1)
			// with corresponding distances:
			// (a. 2.0; b. 2.2361; c. 2.8284; d. 2.2361)
			// which is proportional to
			// (a. 1.0; b. 1.1181; c. 1.4142; d. 1.1181)
			// so rather than try to get all trigged out and plot between our big pixels,
			// let's change the time it takes to get to our grid points.
			// it'll barely be noticable

			keypress = (typeof keypress === 'undefined') ? true : keypress;
			
			if (that.driving && keypress) {
				clearTimeout(that.timeout);
				return false; // this cancels rapid firing keyboards on holding the key
			}

			if (that.brake) { // pulling up on the key sets the brake (they're released here after one iteration)
				that.brake = false;
				that.driving = false;
				clearTimeout(that.timeout);
				return false;
			}

			that.driveAnimationComplete = false;

			var time = 250,
				mod = that.heading % 4;

			var movement = that.getMovement(time, mod);

			// set tank position and move
			that.x = parseInt(that.x) + (movement.xD * dir);
			that.y = parseInt(that.y) + (movement.yD * dir);

			$('#' + that.name).css({'left': that.x * game.getPixelSize(), 'top': that.y * game.getPixelSize()});

			that.timeout = setTimeout(function() { that.driveTank(dir, false); }, movement.time);

		}

		that.fire = function(dir) {
			var now = getNow();
			if (shells.length > 2 || that.firing || now - that.lastFired < 500) {
				return false;
			}
			var name = 'shell-' + now;
			shells.push(game.shell({name: name, color: '#fff', heading: that.heading, x: parseInt(player.x) + Math.floor(player.w / 2), y: parseInt(player.y) + Math.floor(player.h / 2)}));
			shells.slice(-1)[0].init();
			shells.slice(-1)[0].animate();

			that.lastFired = now;

		}

		return that;
	}

	game.player = function(args) {
		var that = game.tank(args);
		that.htmlClass = 'player';

		$(document).on('leftkeydown', function() {
			that.rotateTank(-1);
			that.rotating = true;
		}).on('rightkeydown', function() {
			that.rotateTank(1);
			that.rotating = true;
		}).on('upkeydown', function(){
			if (that.driving) {
				return false;
			}
			that.brake = false;
			that.driveTank(-1);
			that.driving = true;
		}).on('downkeydown', function(){
			if (that.driving) {
				return false;
			}
			that.brake = false;
			that.driveTank(1);
			that.driving = true;
		}).on('spacebardown', function() {
			that.fire(1);
			that.firing = true;
		}).on('leftkeyup', function() {
			that.rotating = false;
		}).on('rightkeyup', function() {
			that.rotating = false;
		}).on('upkeyup', function(){
			that.brake = true;
		}).on('downkeyup', function(){
			that.brake = true;
		}).on('spacebarup', function() {
			that.firing = false;
		});

		return that;
	}

	game.paint = function() {

	}

	var init = function() {
		$('body').html('').css({'background': game.window.styles.background}); // clear placeholder content; no init and warning if transitions aren't supported sans browser prefixes
		game.board.init();

		var element = game.element({name: 'element-1', color: '#DBFFDB', x: 25, y: 12});
		player = game.player({name: 'player-1', color: '#8ff', x: '80', y: '30'});

		element.init();
		player.init();

		game.controls();
	}



	return {
		init: init,
	}

}(jQuery);

$(document).ready(function() {

	Seanbat.init();

});