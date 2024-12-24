import { message } from 'antd';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
              message.success('复制成功');
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
