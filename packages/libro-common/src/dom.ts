function copyFallback(string: string) {
  function handler(event: ClipboardEvent) {
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    clipboardData.setData('text/plain', string);
    event.preventDefault();
    document.removeEventListener('copy', handler, true);
  }

  document.addEventListener('copy', handler, true);
  document.execCommand('copy');
}
// 复制到剪贴板
export const copy2clipboard = (string: string) => {
  navigator.permissions
    .query({
      name: 'clipboard-write' as any,
    })
    .then((result) => {
      if (result.state === 'granted' || result.state === 'prompt') {
        if (window.navigator && window.navigator.clipboard) {
          window.navigator.clipboard
            .writeText(string)
            .then(() => {
              return;
            })
            .catch((err) => {
              console.error('Could not copy text: ', err);
            });
        } else {
          console.warn('navigator is not  exist');
        }
      } else {
        console.warn('浏览器权限不允许复制');
        copyFallback(string);
      }
      return;
    })
    .catch(console.error);
};

function readFallback() {
  function handler(event: ClipboardEvent) {
    // 获取剪贴板数据
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    // 读取文本内容
    const pastedData = clipboardData.getData('text/plain');
    event.preventDefault();
    document.removeEventListener('paste', handler, true);
    return pastedData;
  }
  document.addEventListener('paste', handler, true);
}

// 从剪贴板读取
export const readFromClipboard = async () => {
  let clipboardValue = '';
  const result = await navigator.permissions.query({
    name: 'clipboard-read' as any,
  });
  if (result.state === 'granted' || result.state === 'prompt') {
    if (window.navigator && window.navigator.clipboard) {
      clipboardValue = await window.navigator.clipboard.readText();
    } else {
      console.warn('navigator is not  exist');
    }
  } else {
    console.warn('浏览器权限不允许粘贴');
    readFallback();
  }
  return clipboardValue;
};
