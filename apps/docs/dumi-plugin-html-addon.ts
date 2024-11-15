import type { IApi } from 'umi';

export default (api: IApi) => {
  if (process.env.GOOGLE_ANALYTICS_KEY) {
    api.addHTMLScripts(
      () => `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS_KEY}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${process.env.GOOGLE_ANALYTICS_KEY}');
</script>
    `,
    );
  }
};
