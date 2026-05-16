// ---- Caesar ----

function caesarEnc(s, n) {
  return s.replace(/[a-zA-Z]/g, function (c) {
    var base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode((c.charCodeAt(0) - base + n + 26) % 26 + base);
  });
}

function caesarDec(s, n) {
  return caesarEnc(s, (26 - (n % 26)) % 26);
}

// ---- ROT13 ----

function rot13(s) {
  return caesarEnc(s, 13);
}

// ---- ROT47 ----

function rot47(s) {
  return s.replace(/[\x21-\x7e]/g, function (c) {
    return String.fromCharCode(33 + (c.charCodeAt(0) - 33 + 47) % 94);
  });
}

// ---- ROT5 ----

function rot5(s) {
  return s.replace(/[0-9]/g, function (c) {
    return String.fromCharCode(48 + (parseInt(c, 10) + 5) % 10);
  });
}

// ---- Atbash ----

function atbash(s) {
  return s.replace(/[a-zA-Z]/g, function (c) {
    var base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(25 - (c.charCodeAt(0) - base) + base);
  });
}

// ---- Rail Fence ----

function railEnc(s, n) {
  if (n < 2 || !s) return s;
  n = Math.min(n, s.length);
  var rails = [];
  for (var i = 0; i < n; i++) rails.push([]);
  var r = 0, dir = 1;
  for (var i = 0; i < s.length; i++) {
    rails[r].push(s[i]);
    r += dir;
    if (r === 0 || r === n - 1) dir *= -1;
  }
  var res = '';
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < rails[i].length; j++) {
      res += rails[i][j];
    }
  }
  return res;
}

function railDec(s, n) {
  if (n < 2 || !s) return s;
  n = Math.min(n, s.length);
  var len = s.length;
  var idx = new Array(len);
  var r = 0, dir = 1;
  for (var i = 0; i < len; i++) {
    idx[i] = r;
    r += dir;
    if (r === 0 || r === n - 1) dir *= -1;
  }
  var rails = [];
  for (var i = 0; i < n; i++) rails.push([]);
  var pos = 0;
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < len; j++) {
      if (idx[j] === i) rails[i].push(s[pos++]);
    }
  }
  r = 0; dir = 1;
  var res = '';
  for (var i = 0; i < len; i++) {
    res += rails[r].shift();
    r += dir;
    if (r === 0 || r === n - 1) dir *= -1;
  }
  return res;
}

// ---- Vigenere ----

function vigEnc(s, k) {
  if (!k) return s;
  var ku = k.toUpperCase().replace(/[^A-Z]/g, '');
  if (!ku) return s;
  var ki = 0;
  return s.replace(/[a-zA-Z]/g, function (c) {
    var base = c <= 'Z' ? 65 : 97;
    var shift = ku.charCodeAt(ki++ % ku.length) - 65;
    return String.fromCharCode((c.charCodeAt(0) - base + shift) % 26 + base);
  });
}

function vigDec(s, k) {
  if (!k) return s;
  var ku = k.toUpperCase().replace(/[^A-Z]/g, '');
  if (!ku) return s;
  var ki = 0;
  return s.replace(/[a-zA-Z]/g, function (c) {
    var base = c <= 'Z' ? 65 : 97;
    var shift = ku.charCodeAt(ki++ % ku.length) - 65;
    return String.fromCharCode((c.charCodeAt(0) - base - shift + 26) % 26 + base);
  });
}

// ---- Morse ----

var MORSE = {
  'A': '.-',     'B': '-...',   'C': '-.-.',   'D': '-..',
  'E': '.',      'F': '..-.',   'G': '--.',    'H': '....',
  'I': '..',     'J': '.---',   'K': '-.-',    'L': '.-..',
  'M': '--',     'N': '-.',     'O': '---',    'P': '.--.',
  'Q': '--.-',   'R': '.-.',    'S': '...',    'T': '-',
  'U': '..-',    'V': '...-',   'W': '.--',    'X': '-..-',
  'Y': '-.--',   'Z': '--..',
  '0': '-----',  '1': '.----',  '2': '..---',  '3': '...--',
  '4': '....-',  '5': '.....',  '6': '-....',  '7': '--...',
  '8': '---..',  '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--',
  '/': '-..-.',  '(': '-.--.',  ')': '-.--.-', '&': '.-...',
  ':': '---...', ';': '-.-.-.', '=': '-...-',  '+': '.-.-.',
  '-': '-....-', '_': '..--.-', '"': '.-..-.', '@': '.--.-.',
  '\'': '.----.'
};

var MORSE_R = {};
(function () {
  for (var k in MORSE) {
    if (MORSE.hasOwnProperty(k)) {
      MORSE_R[MORSE[k]] = k;
    }
  }
})();

function morseEnc(s) {
  return s.toUpperCase().split('').map(function (c) {
    return MORSE[c] || (c === ' ' ? '/' : '');
  }).filter(Boolean).join(' ');
}

function morseDec(s) {
  return s.split(/\s+/).map(function (t) {
    return t === '/' ? ' ' : (MORSE_R[t] || t);
  }).join('');
}

// ---- Bacon Cipher ----

function baconEnc(s) {
  return s.toUpperCase().replace(/[^A-Z]/g, '').split('').map(function (c) {
    var n = c.charCodeAt(0) - 65;
    return n.toString(2).padStart(5, '0').replace(/0/g, 'A').replace(/1/g, 'B');
  }).join(' ');
}

function baconDec(s) {
  return s.trim().split(/\s+/).map(function (t) {
    var bin = t.replace(/[AB]/gi, function (m) {
      return m.toUpperCase() === 'A' ? '0' : '1';
    });
    return String.fromCharCode(parseInt(bin, 2) + 65);
  }).join('');
}

// ---- Keyboard Shift (QWERTY Left) ----

var QWERTY_L = {
  'Q': '', 'W': 'Q', 'E': 'W', 'R': 'E', 'T': 'R', 'Y': 'T', 'U': 'Y',
  'I': 'U', 'O': 'I', 'P': 'O', '[': 'P', ']': '[', '\\': ']',
  'S': 'A', 'D': 'S', 'F': 'D', 'G': 'F', 'H': 'G', 'J': 'H',
  'K': 'J', 'L': 'K', ';': 'L', '\'': ';',
  'X': 'Z', 'C': 'X', 'V': 'C', 'B': 'V', 'N': 'B', 'M': 'N',
  ',': 'M', '.': ',', '/': '.',
  '1': '`', '2': '1', '3': '2', '4': '3', '5': '4', '6': '5',
  '7': '6', '8': '7', '9': '8', '0': '9', '-': '0', '=': '-',
  '!': '~', '@': '!', '#': '@', '$': '#', '%': '$', '^': '%',
  '&': '^', '*': '&', '(': '*', ')': '(', '_': ')', '+': '_'
};

var QWERTY_R = {};
(function () {
  for (var k in QWERTY_L) {
    if (QWERTY_L.hasOwnProperty(k)) {
      QWERTY_R[QWERTY_L[k]] = k;
    }
  }
})();

function keyShiftEnc(s) {
  return s.split('').map(function (c) {
    var lower = c !== c.toUpperCase();
    var u = c.toUpperCase();
    var mapped = QWERTY_L[u] || QWERTY_L[c] || c;
    if (lower && mapped) mapped = mapped.toLowerCase();
    return mapped;
  }).join('');
}

function keyShiftDec(s) {
  return s.split('').map(function (c) {
    var lower = c !== c.toUpperCase();
    var u = c.toUpperCase();
    var mapped = QWERTY_R[u] || QWERTY_R[c] || c;
    if (lower && mapped) mapped = mapped.toLowerCase();
    return mapped;
  }).join('');
}
