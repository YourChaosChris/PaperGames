// tools/old-browser.js
// The old-browser check. tools/seo.js puts it as the very first <script>
// into the <head> of every page (inline, so it costs no extra request).
// It stays strict ES5 (var, function, no arrows, no template strings,
// nothing newer), otherwise the old browsers it is meant for cannot even
// read it; tests/old-browser.js parses it with acorn (ecmaVersion 5).
//
// What it does: if the browser cannot run the language the other scripts
// are written in (ES2015: const, arrow functions, classes; Promise, fetch,
// Symbol), it writes a short note in English and German instead of the
// page and then opens a hidden <plaintext> element. Everything after it in
// the page is plain text from then on, so no other PaperGames script,
// style sheet or element is run or shown (no error pages, no blank screen).
// On a current browser it does nothing.
//
// Format: tools/seo.js drops the "//" lines and joins the other lines
// without a separator, so every line must end a statement or a block, and
// no string may span two lines.
(function(){
var ok=false;
try{ok=new Function("const a=1;var f=()=>a;class B{};return f()")()===1&&typeof Promise=="function"&&typeof fetch=="function"&&typeof Symbol=="function";}catch(e){}
if(ok)return;
window.__pgOldBrowser=true;
var p="<p style=\"margin:0 0 14px\"";
document.write("<body style=\"background:#fff;color:#000;font:22px/1.5 serif;margin:0;padding:16px\"><h1 style=\"font-size:30px;margin:0 0 14px\">PaperGames</h1>"+p+"><b>Your browser is too old for PaperGames.</b></p>"+p+">PaperGames needs a current browser, for example the newer Kindle browser, or Chrome on a Boox or Tolino reader.</p><hr>"+p+" lang=\"de\"><b>Dein Browser ist zu alt f&uuml;r PaperGames.</b></p>"+p+" lang=\"de\">PaperGames braucht einen aktuellen Browser, zum Beispiel den neueren Kindle-Browser oder Chrome auf einem Boox- oder Tolino-Reader.</p><plaintext style=\"display:none\">");
})();
