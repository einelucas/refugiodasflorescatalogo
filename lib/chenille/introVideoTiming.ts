// Timing of the approved 4.1-second preview. The first 4.8 seconds
// of the original motion occupy 2.9 seconds; the last 1.2 stay unchanged.
export const INTRO_VIDEO_SECONDS=4.1;
export const INTRO_VIDEO_TITLE_SECONDS=2.9*(.79*6/4.8);
export function introVideoSourceProgress(seconds:number){
  const t=Math.max(0,Math.min(INTRO_VIDEO_SECONDS,seconds));
  const source=t<=2.9?t*4.8/2.9:4.8+(t-2.9);
  return Math.max(0,Math.min(1,source/6));
}
