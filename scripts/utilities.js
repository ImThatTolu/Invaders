function now() {
	var Now = new Date();
	return Now.valueOf();
}

Array.prototype.shuffle = function() {
  var i = this.length, j, temp;
  if ( i == 0 ) return this;
  while ( --i ) {
    j = Math.floor( Math.random() * ( i + 1 ) );
    temp = this[i];
    this[i] = this[j];
    this[j] = temp;
  }
  return this;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setScopedInterval(func, millis, scope) {
  return setInterval(function () {
    func.apply(scope);
  }, millis);
}