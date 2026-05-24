const SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(!t){t='dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export function ThemeInit() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
