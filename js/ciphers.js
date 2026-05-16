var CIPHERS = [
  {
    id: 'base64',
    name: 'Base64',
    key: false, keyPh: '',
    desc: '用64个可打印字符编码任意二进制数据，常用于数据传输与存储。',
    wiki: 'https://zh.wikipedia.org/wiki/Base64',
    enc: b64enc, dec: b64dec
  },
  {
    id: 'base32',
    name: 'Base32',
    key: false, keyPh: '',
    desc: '用A-Z和2-7共32个字符编码数据，大小写不敏感，输出比Base64更长。',
    wiki: 'https://zh.wikipedia.org/wiki/Base32',
    enc: b32enc, dec: b32dec
  },
  {
    id: 'hex',
    name: 'Hex',
    key: false, keyPh: '',
    desc: '将每个字节表示为两位十六进制数，是最直观的二进制可视化方式。',
    wiki: 'https://zh.wikipedia.org/wiki/十六进制',
    enc: function (s) { return bytesToHex(strToBytes(s)); },
    dec: function (s) { return bytesToStr(hexToBytes(s)); }
  },
  {
    id: 'rail',
    name: '栅栏密码',
    key: true, keyPh: '栏数 (如 3)',
    desc: '将明文按之字形排列在若干栅栏上，再按行读取，是一种经典置换密码。',
    wiki: 'https://zh.wikipedia.org/wiki/栅栏密码',
    enc: function (s, k) { return railEnc(s, parseInt(k) || 3); },
    dec: function (s, k) { return railDec(s, parseInt(k) || 3); }
  },
  {
    id: 'caesar',
    name: '凯撒密码',
    key: true, keyPh: '偏移量 (如 3)',
    desc: '最古老的加密技术之一，将字母按固定位数偏移，相传古罗马凯撒大帝曾使用。',
    wiki: 'https://zh.wikipedia.org/wiki/凯撒密码',
    enc: function (s, k) { return caesarEnc(s, parseInt(k) || 3); },
    dec: function (s, k) { return caesarDec(s, parseInt(k) || 3); }
  },
  {
    id: 'rot13',
    name: 'ROT13',
    key: false, keyPh: '',
    desc: '凯撒密码的变体，固定偏移13位，加密和解密操作完全相同。',
    wiki: 'https://zh.wikipedia.org/wiki/ROT13',
    enc: rot13, dec: rot13
  },
  {
    id: 'rot47',
    name: 'ROT47',
    key: false, keyPh: '',
    desc: 'ROT13的扩展版，对全部可打印ASCII字符（33-126）循环偏移47位。',
    wiki: 'https://zh.wikipedia.org/wiki/ROT13',
    enc: rot47, dec: rot47
  },
  {
    id: 'atbash',
    name: '埃特巴什码',
    key: false, keyPh: '',
    desc: '将字母表反转映射（A↔Z, B↔Y, ...），源自希伯来字母的密码系统。',
    wiki: 'https://zh.wikipedia.org/wiki/埃特巴什码',
    enc: atbash, dec: atbash
  },
  {
    id: 'morse',
    name: '摩斯电码',
    key: false, keyPh: '',
    desc: '用点和划的组合表示字母和数字，广泛应用于早期电报通信。',
    wiki: 'https://zh.wikipedia.org/wiki/摩斯电码',
    enc: morseEnc, dec: morseDec
  },
  {
    id: 'vigenere',
    name: '维吉尼亚密码',
    key: true, keyPh: '密钥词 (如 KEY)',
    desc: '使用关键词对每个字母进行不同偏移的多表替代密码，曾被誉为不可破译。',
    wiki: 'https://zh.wikipedia.org/wiki/维吉尼亚密码',
    enc: function (s, k) { return vigEnc(s, k); },
    dec: function (s, k) { return vigDec(s, k); }
  },
  {
    id: 'ascii',
    name: 'ASCII',
    key: false, keyPh: '',
    desc: '将文本与十进制ASCII码相互转换，每个字节以空格分隔的数字表示。',
    wiki: 'https://zh.wikipedia.org/wiki/ASCII',
    enc: ascEnc, dec: ascDec
  },
  {
    id: 'binary',
    name: 'Binary',
    key: false, keyPh: '',
    desc: '将每个字节转换为8位二进制数，以空格分隔。最基础的计算机数据表示方式。',
    wiki: 'https://zh.wikipedia.org/wiki/二进制',
    enc: binEnc, dec: binDec
  },
  {
    id: 'url',
    name: 'URL 编码',
    key: false, keyPh: '',
    desc: '将特殊字符编码为百分号加两位十六进制（%XX），用于URL传输。',
    wiki: 'https://zh.wikipedia.org/wiki/百分号编码',
    enc: urlEnc, dec: urlDec
  },
  {
    id: 'unicode',
    name: 'Unicode 转义',
    key: false, keyPh: '',
    desc: '将每个字符转义为 \\uXXXX 格式，常用于JSON等文本格式中的Unicode表示。',
    wiki: 'https://zh.wikipedia.org/wiki/Unicode',
    enc: uniEnc, dec: uniDec
  },
  {
    id: 'bacon',
    name: '培根密码',
    key: false, keyPh: '',
    desc: '用5位A/B序列表示26个字母，由弗朗西斯·培根发明，常用于隐写术。',
    wiki: 'https://zh.wikipedia.org/wiki/培根密码',
    enc: baconEnc, dec: baconDec
  },
  {
    id: 'keyshift',
    name: '键盘移位',
    key: false, keyPh: '',
    desc: '将每个按键替换为QWERTY键盘上其左侧的按键，常见于谜题和密码挑战。',
    wiki: '',
    enc: keyShiftEnc, dec: keyShiftDec
  },
  {
    id: 'rot5',
    name: 'ROT5',
    key: false, keyPh: '',
    desc: '对数字0-9进行循环移位5位，常与ROT13组合使用（ROT18）。',
    wiki: 'https://zh.wikipedia.org/wiki/ROT13',
    enc: rot5, dec: rot5
  }
];
