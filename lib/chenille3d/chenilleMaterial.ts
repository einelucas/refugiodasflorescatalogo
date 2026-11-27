// Luminance micro-relief sampled from the supplied chenille macro photograph.
 // Color is deliberately removed so the same textile works on all flower colors.
const sample=[
"ca543772379a6537b9899a5354851578",
"7339c6206edc7aaded799743530025cb",
"87cccbcacd9858ad864b944afb4adbcc",
"5ae84797cd4034563465228ab63efcb7",
"32427a8bb834dec75cfb79ef926cddb7",
"e739fedfdd98ffeecddbbfeedbdacb75",
"eabcacbedb56ccadc977cdcca9b86523",
"c567654a835da7566324875533750018",
"506db653109fa982129a30048857788c",
"249eefe3038c9a9777b9336cfcbecedd",
"798aac924cbb836beee98eeeeaabba99",
"4befb303befc604eecbbefedd735ac61",
"8cba9203cea5203895459b9672248973",
"c7541169ed8416c700002542202bd99c",
"ecba68ffc7216efb9a57abc7327feabd",
"bcbdcbfd96115998ad79ecdb27fc9548",
"534766c8679ddbd84766cc7428d73522",
"c436369acedefdcabdeccd737689aebb",
"b6becfd89cbcdab89fdeed77ddecccad",
"318bcc9314688532377a9746bbd73325",
"2267766103862323664210576732368a",
"ddeea8b25cfc5adeeec56adccc5bedff",
"ffefa4536cda4dfdda8affccdc7cbaba",
"bba8403ace9309b99406d96757796454",
"753038bfdcb577342458842303ac8995",
"95239edfdbd8ddaabcceec779dbaafea",
"643569897776cfdbc64beb41ad758bdb",
"768bcea621128a845679aa7246566585",
"eddfffa887a83323bdedba8abcddcac6",
"78bfaa634afd3006ea986439bdeea9c7",
"335943116db7747a631223866aa62232",
"ca64322aeea8dcff876349eaac614459"
];
export function chenilleReliefPixels():Uint8Array{
  return Uint8Array.from(sample.join(""),c=>parseInt(c,16)*17);
}
export function createChenilleTexture(gl:WebGLRenderingContext){
  const texture=gl.createTexture();if(!texture)throw new Error("Chenille texture unavailable");
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,32,32,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,chenilleReliefPixels());
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);
  return texture;
}
