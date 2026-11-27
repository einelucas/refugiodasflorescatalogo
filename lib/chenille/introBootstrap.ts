// Executed in the document head, before the first paint or React hydration.
export const INTRO_SESSION_KEY="refugio-chenille-intro-v3";
export const INTRO_ATTRIBUTE="data-refugio-intro";
export const HOME_READY_ID="refugio-home-ready";
export const INTRO_BOOTSTRAP=`(function(){
  var root=document.documentElement;
  try {
    if(location.pathname!=="/"||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    try { if(sessionStorage.getItem("${INTRO_SESSION_KEY}"))return; } catch(e) {}
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
html[data-refugio-intro="pending"]::after {
  content:"";position:fixed;z-index:2147483647;left:50%;top:calc(50% - 44px);
  width:min(192px,45.6vw,26.4svh);height:min(8px,1.9vw,1.1svh);border-radius:999px;transform:translate(-50%,-50%);
  background:linear-gradient(180deg,#f8eefb,#e1cce9 48%,#b49bc2);
  box-shadow:0 0 3px #f8eefb99;pointer-events:none;
}
@media(prefers-reduced-motion:reduce){
  html[data-refugio-intro]{overflow:visible;background:initial;}
  html[data-refugio-intro]::before,html[data-refugio-intro]::after{display:none;}
}
`;
