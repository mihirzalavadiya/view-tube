import { Html, Head, Main, NextScript } from 'next/document';

// Runs before paint so the stored theme is on <html> for the first frame.
// Order per the design spec: stored value → prefers-color-scheme → dark.
const noFlashTheme = `
(function(){
  try {
    var t = localStorage.getItem('vt-theme');
    if (t !== 'dark' && t !== 'light') {
      t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-vt', t);
  } catch (e) {
    document.documentElement.setAttribute('data-vt', 'dark');
  }
})();
`;

export default function Document() {
  return (
    <Html lang="en" data-vt="dark">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </Head>
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: noFlashTheme }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
