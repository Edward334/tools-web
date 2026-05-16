var { createApp, ref, computed, watch } = Vue;

createApp({
  setup: function () {
    var dark = ref(false);

    function applyTheme(val) {
      document.documentElement.classList.toggle('dark', val);
    }
    applyTheme(dark.value);
    watch(dark, applyTheme);

    var cipher = ref('base64');
    var input = ref('');
    var key = ref('');
    var output = ref('');
    var copied = ref(false);
    var toast = ref('');

    var current = computed(function () {
      return CIPHERS.find(function (c) { return c.id === cipher.value; });
    });

    var needsKey = computed(function () {
      return current.value && current.value.key;
    });

    function showToast(msg) {
      toast.value = msg;
      setTimeout(function () { toast.value = ''; }, 2000);
    }

    function selectCipher(id) {
      cipher.value = id;
      if (!needsKey.value) key.value = '';
      output.value = '';
    }

    function encrypt() {
      if (!input.value) return;
      try {
        var c = current.value;
        output.value = c.key
          ? c.enc(input.value, key.value)
          : c.enc(input.value);
      } catch (e) {
        showToast('加密失败: ' + e.message);
      }
    }

    function decrypt() {
      if (!input.value) return;
      try {
        var c = current.value;
        output.value = c.key
          ? c.dec(input.value, key.value)
          : c.dec(input.value);
      } catch (e) {
        showToast('解密失败: ' + e.message);
      }
    }

    function swap() {
      var tmp = input.value;
      input.value = output.value;
      output.value = tmp;
    }

    function clearAll() {
      input.value = '';
      output.value = '';
      key.value = '';
    }

    function copyInput() {
      if (!input.value) return;
      navigator.clipboard.writeText(input.value)
        .then(function () { showToast('输入已复制'); });
    }

    function copyOutput() {
      if (!output.value) return;
      navigator.clipboard.writeText(output.value)
        .then(function () {
          copied.value = true;
          showToast('输出已复制');
          setTimeout(function () { copied.value = false; }, 1500);
        });
    }

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        encrypt();
      }
    });

    return {
      dark: dark,
      cipher: cipher,
      input: input,
      key: key,
      output: output,
      copied: copied,
      toast: toast,
      ciphers: CIPHERS,
      current: current,
      needsKey: needsKey,
      selectCipher: selectCipher,
      encrypt: encrypt,
      decrypt: decrypt,
      swap: swap,
      clearAll: clearAll,
      copyInput: copyInput,
      copyOutput: copyOutput
    };
  }
}).mount('#app');
