var Game, DEBUG;
var windoww, windowh;
var instance = new MyClass();
var btnclick = "./music/click.mp3";
var lockon = "./music/lockon.mp3";
var deadhim = "./music/deadhim.mp3";
var sadface = "./music/sadface.mp3";
var gametime = "./music/gametime.mp3";
var bomba = "./music/bomba.mp3";
var highscore = "./music/highscore.mp3";

$(document).ready(function(){
	$(".bgMusic").get(0).play();

	$('.button').click(function(){
		if (windoww > 768) {	
		change_uisounds(btnclick);
		}
	});
	
	$('.button.start').click(function(e) {
		e.preventDefault();
		Game.start();
	});

	$('.button.replay').click(function(e) {
		e.preventDefault();
		Game.start();
		$('.restart').hide();
	});

	$('.quiz').on('click', 'li', function(e) {
		e.preventDefault();

		if( $(this).is('[data-correct]') ) {
			if (windoww > 768) {
			change_uisounds(deadhim);
			}
			Game.killInvader( $('.quiz').attr('data-id') );
		} else {	
			Game.over();
		}

      	$('.quiz').hide();
      	$(".invader[data-id = " + $('.quiz').attr('data-id') + "] .aim").hide();	
	});

	$('.bigBangTrigger').click(function(e) {
		if( $('.bigBangTrigger img').hasClass("bigBangReady") ) {
        	e.preventDefault();
			Game.bigBang();
		}
	});

	$(window).on('resize', setWindowSize);
	setWindowSize();

	Game = new Invaders();
});


function setWindowSize() {
	windoww = parseInt($('.warzone').width());
	windowh = parseInt($('.warzone').height());
}


// Main Game Functions
var Invaders = function(){
	return {
		kills: 0,
		mode: 'Survival',
		level: 1,
		startTime: 0,
		invaders: {
			'active': [],
			'inactive': []
		},
		invaderinterval: 0,
		quiz: $('.quiz'),
		warzoneUpdateInterval: 0,
		updateSpeed: 70,
		start: function(gamemode, level) {
			var Game = this;

			if( !level ) {
				level = 1;
			}

			if( !gamemode ) {
				gamemode = 'Survival';
			}

			this.invaders.active = [];
			this.invaders.inactive = [];
			this.score.set(0);
			this.kills = 0;
			this.mode = gamemode;
			this.level = level;
			this.startTime = now();

			$('.overlay').animate({
				opacity: 0
			}, 1000, function(){
				$('.overlay').css("display","none");
			});

			$('.hscore').removeClass('record');	
			instance.run();
			instance.myFunc();

			this.warzoneUpdateInterval = setInterval(
				this.updateWarzone,
				this.updateSpeed
			);
		},
		invader: function() {
			return {
				id: now(),
				level: Game.level,
				score: 1,
				type: 'Man',
				speed: (Game.level < 4) ? 1.25 * Game.level : 1.25 * 4,
				element: false,
				question: {
					_question: false,
					answer: false,
					get: function() {
						if( this._question ) {
							return this._question;
						}

						if (Game.level <= 2 ) {
							var symbol = ["+","*"];
						    symbol.shuffle();
							this._question = getRandomInt(2,9) + " " + symbol[0] + " " + getRandomInt(2,9);
						} else if (Game.level >= 3 && Game.level <=6 ) {
							var symbol = ["+","*"];
						    symbol.shuffle();
							this._question = getRandomInt(5,9) + " " + symbol[0] + " " + getRandomInt(2,9);
						} else if(Game.level >= 7 && Game.level <= 15 ) {
							var symbol = ["+","*", "-"];
						    symbol.shuffle();
							this._question = getRandomInt(10,20) + " " + symbol[0] + " " + getRandomInt(2,9);
							Game.bigBangThresh.set(8);
						} else if(Game.level >= 16 && Game.level <= 21 ) {		
							var symbol = ["+","*", "-"];
						     symbol.shuffle();
							this._question = getRandomInt(15,20) + " " + symbol[0] + " " + getRandomInt(5,9);
							Game.bigBangThresh.set(5);
						} else if(Game.level >= 22 && Game.level <= 30 ) {	
							var symbol = ["+","*", "-"];
						    symbol.shuffle();
							this._question = getRandomInt(10,20) + " " + symbol[0] + " " + getRandomInt(10,20);
						} else if(Game.level >= 31 && Game.level <= 50 ) {	
							var symbol = ["+","*", "-"];
						    symbol.shuffle();
							this._question = getRandomInt(20,50) + " " + symbol[0] + " " + getRandomInt(10,20);
							Game.bigBangThresh.set(2);
						} else if(Game.level >= 51 ) {	
							var symbol = ["+","*", "-"];
						    symbol.shuffle();
							this._question = getRandomInt(20,50) + " " + symbol[0] + " " + getRandomInt(10,20);
						}

						this.answer = eval(this._question);
						return this._question;
					}
				}
			}
		},
		addInvader: function() {
			//var Game = this.Game;
			var Game = this;
			// make sure we can place this invader on the screen (10 tries)
			var invaderX = Game.getInvaderX();
			if( !invaderX )
				return false;

			var newInvader = Game.invader();
			var question = newInvader.question.get();
			var invaderColor = ["r","g","b"];
			invaderColor.shuffle();

			for (var i=0; i < invaderColor.length; i++) {
				$('.invader:nth-of-type(1)').css("background-image", "url('images/invader_" + invaderColor[i] + ".png')");
			}

			newInvader.element = $('.template').clone(true, true).removeClass('template').addClass('active').addClass('level' + Game.level).appendTo('.warzone');
		
			$('.invader:nth-of-type(1)').css({
				left: invaderX + 'px'
			});

			newInvader.element.attr('data-id', newInvader.id );
			newInvader.element.attr('data-question', newInvader.question.get() );
			newInvader.element.attr('data-answer', newInvader.question.answer );

			// actions to open the quiz
			newInvader.element.on("click", function(e) {
				if ($('.quiz').is(':visible')) {
					$(".invader .aim").hide();
				}

				if (windoww > 768) {
					change_uisounds(lockon);
				} 

				e.preventDefault();
				e.stopPropagation();

				var invaderPos = $(this).offset();
				if (invaderPos.left >= 120) {
					$('.quiz').css({
						left: invaderPos.left - 95 +'px',
						top : invaderPos.top + 50 + 'px'
				  });

				} else {
					$('.quiz').css({
						left: invaderPos.left + 95 +'px',
						top : invaderPos.top + 50 + 'px'
				  });
				}

				if (invaderPos.top < 190) {
					$('.quiz').css({
						top : 100 + 'px'
				  });
				}

				if (invaderPos.top >= parseInt($('.warzone').height() - 250)) {
					$('.quiz').css({
						top : 200 + 'px'
				  });
				}

				$(".invader[data-id = " + newInvader.id + "] .aim").show();
				// come up with some fake answers for this one
				var Answers = [ 
					newInvader.question.answer,
					newInvader.question.answer + getRandomInt(1,5),
					Math.abs(newInvader.question.answer - getRandomInt(1,5))
				];

				Answers.shuffle();

				var html_output = '';

				for(var i = 0; i < Answers.length; i++ ) {
					var correct = (Answers[i] == newInvader.question.answer) ? ' data-correct="true"' : '';
					html_output += '<li' +  correct + '>' + '<p>' +Answers[i] + '</p>'+'</li>';
				}

				Game.quiz.attr('data-id', newInvader.id);
				Game.quiz.find('.question').html( newInvader.question.get().replace('*', '<span style="font-family: Arial, Helvetica, sans-serif;">x</span>') );
				Game.quiz.find('.answers').html(html_output).end().show();
			});

			Game.invaders.active.push(newInvader);        
		},
		getInvaderX: function( tries ) {
			if( !tries ) 
				tries = 0;

			tries++;
			if( tries < 10 ) {

				var invaderWidth = 90;
				var browserWidth = parseInt($('.warzone').width()) - invaderWidth;
				var invaderVerticalSpacing = 50;
				var newInvaderLeft = getRandomInt(5, browserWidth);//(tries == 1) ? 100 : 90;//;
				var newInvaderRight = newInvaderLeft + invaderWidth;

				// make sure he's not overlapping
				for( var i = 0; i < Game.invaders.active.length; i++ ) {
					// is this invader close enough to the top?
					if( parseInt(Game.invaders.active[i].element.css('top')) <= invaderVerticalSpacing ) {
						// close enough, make sure not overlapping
						var invaderLeft = parseInt(Game.invaders.active[i].element.css('left'));
						var invaderRight = invaderLeft + invaderWidth;
						// is any of this overlapping?
						if(
							((newInvaderLeft >= invaderLeft) && (newInvaderLeft <= invaderRight)) ||
							((newInvaderRight >= invaderLeft) && (newInvaderRight <= invaderRight))
						 ) {
							// overlapping, find another x, run this function again
							// console.log('Overlap');	
							return Game.getInvaderX(tries);
						}
					}
				}
				return newInvaderLeft;
			}
			return false;
		},
		getInvader: function(id) {
			for( var i = 0; i < Game.invaders.active.length; i++ ) {
				if( Game.invaders.active[i].id == id ) {
					return Game.invaders.active[i];
				}
			}
			return false;
		},

		killInvader: function(invaderId) {
			var invader = Game.getInvader(invaderId);

			if (invader) {
				// kill up
				Game.kills++;
				Game.bigBangUp();

				// score up
				Game.score.add(invader.score);

				// update the score display
				$('.score').text(Game.score.get());

				// determine if we level up
				if( Game.kills % 5 == 0 ) {	
					Game.levelUp();
					if (Game.interval.get() >= 2700) {
					    Game.interval.add(-100);
					} else {
						Game.interval.add(0);
					}
				}

				$(".invader[data-id = " + invader.id + "]").addClass('stopped');
				$(".invader[data-id = " + invader.id + "] .kill").show().delay(300).hide(0, function() {
					invader.element.remove();
				}); 

				var removeItem = invader;
				Game.invaders.active = $.grep(Game.invaders.active, function(value) {
				  return value != removeItem;
				});
			}
		},
		updateWarzone: function() {
			// loop through all invaders and move them down a bit
			for( var i = 0; i < Game.invaders.active.length; i++ ) {
				// move this down a bit
				var invader = Game.invaders.active[i];
				var y = parseInt(invader.element.css('top'));
				var delta = invader.speed;
				if( y >= (windowh - 150) ){
					Game.over();			
				}
			}
		},
		levelUp: function() {
			Game.level++;
		},
		score: {
			_score: 1,

			get: function() {
				return Game.score._score;
			},
			set: function(score) {
				Game.score._score = score;
			},
			add: function(score) {
				Game.score._score += score;
			}
		},
		interval: {
			_interval: 3000,
			get: function() {
				return this._interval;
			},
			set: function(interval) {
				this._interval = interval;
			},
			add: function(interval) {
				this._interval += interval;
			}
		},
		bigBangScore: 0,
		bigBangThresh: {
			_thresh: 10,
			get: function() {
				return Game.bigBangThresh._thresh;
			},
			set: function(thresh) {
				Game.bigBangThresh._thresh = thresh;
			},
			add: function(thresh) {
				Game.bigBangThresh._thresh += thresh;
			}
		},
		bigBangUp: function() {
			Game.bigBangScore++;
			var bigBangThresh = Game.bigBangThresh.get();
			var decimal = Game.bigBangScore / bigBangThresh;
			var percent = decimal * 100 + '%';
			if(parseInt(percent) > 100) {

			} else if (parseInt(percent) == 100) {
				if (windoww > 768) {
					change_bigsounds(gametime);
				}

				$('.progress-bar').css({
					width : percent 
				});
				$('.progress').hide(1000);
				$('.bigBangTrigger img').css({
					"opacity": "1",
					"pointer-events": "auto"
				}).addClass("bigBangReady");

			} else {
				$('.progress-bar').css({
					width : percent 
				});
			}
		},
		bigBang: function() {
			if (windoww > 768) {
				change_bigsounds(bomba);
			}
			$('.quiz').hide();
			$(".invader .aim").hide();
			while (Game.invaders.active.length) {
				Game.killInvader(Game.invaders.active[0].id);
			}
			Game.bigBangScore = -1;	
			Game.bigBangUp();
			$('.progress').show();
			$('.bigBangTrigger img').css({"opacity":"0.3"});
			$('.bigBangTrigger img').removeClass('bigBangReady');
		},
		over: function() {
			if (windoww > 768) {
				change_uisounds(sadface);
		  }
			$('.quiz').hide();
			$('.progress').show();
			$('.bigBangTrigger img').css({"opacity":"0.3"});
			$('.bigBangTrigger img').removeClass('bigBangReady');
			clearInterval(this.warzoneUpdateInterval);

			instance.stop();
 			for(var i = 0; i <  Game.invaders.active.length; i++){
					var invader = Game.getInvader(Game.invaders.active[i].id);
					invader.element.remove();
			}

			localStorage.setItem('score', JSON.stringify(Game.score.get()));
			
			if(Game.score.get() > JSON.parse( localStorage.getItem( 'highscore' ) ) || !localStorage.getItem( 'highscore' )) {
				localStorage.setItem('highscore', JSON.stringify(Game.score.get()));
				$('.hscore').addClass('record');
				if (windoww > 768) {
					change_uisounds(highscore);
				}
			}

			Game.score.set(0);
			Game.bigBangScore = 0;
			Game.level = 1;
			Game.kills = 0;
			Game.bigBangThresh.set(10);
			Game.interval.set(3000);
 			$('.progress-bar').css({ width : 0 });
			$('.score').text(Game.score.get());

			var gameScore = JSON.parse( localStorage.getItem( 'score' ) );
			var highScore = JSON.parse( localStorage.getItem( 'highscore' ) );

			$('.gameScore').text(gameScore);
			$('.highScore').text(highScore);
			$('.tweetLink').attr('href', "https://twitter.com/intent/tweet?text=I%20just%20scored%20" + gameScore + "%20on%20Invaders!.%20Think%20you%20can%20do%20better%3F%20&url=http%3A%2F%2Fradiczone.ca%2Fsites%2Finvaders&via=RadicZone");
			$('.restart').slideDown();
		}
	}
};

function MyClass() {
  this.timer = null;
  this.myFunc = function() { Game.addInvader(); };
  this.run = function() {
    this.timer = setScopedInterval(function () { this.myFunc(); }, Game.interval.get(), this);
  };
  this.stop = function() { clearInterval(this.timer); };
}

function change_uisounds(sourceUrl) {
  var audio = $(".uiSounds");  
  $(".uiSounds source").attr("src", sourceUrl);
  audio[0].pause();
  audio[0].load();
  audio[0].play();   
}

function change_bigsounds(sourceUrl) {
  var audio = $(".bigSounds");  
  $(".bigSounds source").attr("src", sourceUrl);
  audio[0].pause();
  audio[0].load();//suspends and restores all audio element
  audio[0].play();       
}