// Executed in the document head, before the first paint or React hydration.
export const INTRO_ATTRIBUTE="data-refugio-intro";
export const HOME_READY_ID="refugio-home-ready";
export const INTRO_BOOTSTRAP=`(function(){
  var root=document.documentElement;
  try {
    if(location.pathname!=="/"||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    root.setAttribute("${INTRO_ATTRIBUTE}","pending");
    // Never strand a visitor if hydration fails or JavaScript assets are slow.
    setTimeout(function(){
      if(root.getAttribute("${INTRO_ATTRIBUTE}")==="pending"){
        root.removeAttribute("${INTRO_ATTRIBUTE}");
      }
    },10000);
  }catch(e){root.removeAttribute("${INTRO_ATTRIBUTE}");}
})();`;
export const INTRO_CRITICAL_CSS=`
html[data-refugio-intro] { overflow:hidden; background:#5a1e72; }
html[data-refugio-intro="pending"]::before {
  content:""; position:fixed; inset:0; z-index:2147483646;
  background:radial-gradient(ellipse at 50% 40%,#684675 0%,#5a1e72 74%);
  pointer-events:auto;
}
@media(prefers-reduced-motion:reduce){
  html[data-refugio-intro]{overflow:visible;background:initial;}
  html[data-refugio-intro]::before{display:none;}
}
`;
