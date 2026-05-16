// ---- Utilities ----

function strToBytes(s) {
  return new TextEncoder().encode(s);
}

function bytesToStr(b) {
  return new TextDecoder().decode(b);
}

function bytesToHex(b) {
  return Array.from(b)
    .map(function (x) { return x.toString(16).padStart(2, '0'); })
    .join('');
}

function hexToBytes(h) {
  var s = h.replace(/\s/g, '');
  var r = [];
  for (var i = 0; i < s.length; i += 2) {
    r.push(parseInt(s.slice(i, i + 2), 16));
  }
  return new Uint8Array(r);
}

// ---- Base64 ----

function b64enc(str) {
  var bytes = strToBytes(str);
  var bin = '';
  for (var i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

function b64dec(str) {
  var bin = atob(str.replace(/\s/g, ''));
  var bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytesToStr(bytes);
}

// ---- Base32 ----

var B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function b32enc(str) {
  var data = strToBytes(str);
  var r = '', buf = 0, bits = 0;
  for (var i = 0; i < data.length; i++) {
    buf = (buf << 8) | data[i];
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      r += B32[(buf >> bits) & 31];
    }
  }
  if (bits > 0) {
    buf <<= (5 - bits);
    r += B32[buf & 31];
  }
  var pad = (8 - (r.length % 8)) % 8;
  while (pad--) r += '=';
  return r;
}

function b32dec(str) {
  var s = str.replace(/=+$/, '').toUpperCase();
  var buf = 0, bits = 0, r = [];
  for (var i = 0; i < s.length; i++) {
    var idx = B32.indexOf(s[i]);
    if (idx < 0) throw new Error('无效的Base32字符');
    buf = (buf << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      r.push((buf >> bits) & 255);
    }
  }
  return bytesToStr(new Uint8Array(r));
}

// ---- ASCII ----

function ascEnc(s) {
  var b = strToBytes(s);
  var r = [];
  for (var i = 0; i < b.length; i++) r.push(b[i].toString(10));
  return r.join(' ');
}

function ascDec(s) {
  var parts = s.trim().split(/\s+/);
  var bytes = new Uint8Array(parts.length);
  for (var i = 0; i < parts.length; i++) bytes[i] = parseInt(parts[i], 10);
  return bytesToStr(bytes);
}

// ---- Binary ----

function binEnc(s) {
  return Array.from(strToBytes(s)).map(function (b) {
    return b.toString(2).padStart(8, '0');
  }).join(' ');
}

function binDec(s) {
  var parts = s.trim().split(/\s+/);
  var bytes = new Uint8Array(parts.length);
  for (var i = 0; i < parts.length; i++) bytes[i] = parseInt(parts[i], 2);
  return bytesToStr(bytes);
}

// ---- URL Encoding ----

function urlEnc(s) { return encodeURIComponent(s); }
function urlDec(s) { return decodeURIComponent(s); }

// ---- Unicode Escape ----

function uniEnc(s) {
  var r = '';
  for (var i = 0; i < s.length; i++) {
    r += '\\u' + s.charCodeAt(i).toString(16).padStart(4, '0');
  }
  return r;
}

function uniDec(s) {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, function (_, h) {
    return String.fromCharCode(parseInt(h, 16));
  });
}
