import { completeTube } from './engine';
export const palettes: Record<string,string[]> = {
  iris:['#a685ee','#f4b951','#ee7fa3','#64c8b4','#68afe9','#ef886c','#6370ca','#abc964','#da83cb','#9b8273'],
  ocean:['#528feb','#f8c45e','#ed8eaf','#58cabc','#a69cf0','#f49674','#6491a1','#afc877','#de89ce','#9a7bba'],
  sunset:['#ec987b','#c294dd','#e6bc5c','#72bca6','#719ecb','#db7299','#aebd67','#9670ae','#66c6d1','#ae886e'],
  midnight:['#a78bfa','#f9cb65','#fb8daf','#5ddbb9','#70baff','#ff9b72','#818cf8','#b7d974','#e992ed','#c1a090']
};
export const colorNames = ['violet','gold','rose','mint','blue','peach','indigo','lime','orchid','cocoa'];
export function Tube({ colors, id, theme, labels, square = false }: { colors: number[]; id: string; theme: string; labels: boolean; square?: boolean }) {
  const palette=palettes[theme]; const done=completeTube(colors);
  const shape = square ? 'M17 19H63V189Q63 207 52 207H28Q17 207 17 189Z' : 'M17 19H63V184Q63 210 40 210Q17 210 17 184Z';
  const inner = square ? 'M21 22H59V189Q59 202 51 202H29Q21 202 21 189Z' : 'M21 22H59V184Q59 205 40 205Q21 205 21 184Z';
  return <svg viewBox="0 0 80 232" preserveAspectRatio="none" className="tube-svg" aria-hidden="true">
    <defs><clipPath id={`clip-${id}`}><path d={inner}/></clipPath><linearGradient id={`glass-${id}`}><stop stopColor="#fff" stopOpacity=".85"/><stop offset=".4" stopColor="#fff" stopOpacity=".08"/><stop offset="1" stopColor="#bdb2d4" stopOpacity=".18"/></linearGradient><linearGradient id={`shine-${id}`}><stop stopColor="#fff" stopOpacity=".42"/><stop offset=".2" stopColor="#fff" stopOpacity=".03"/><stop offset=".8" stopColor="#fff" stopOpacity="0"/><stop offset="1" stopColor="#4d326e" stopOpacity=".1"/></linearGradient></defs>
    <ellipse cx="40" cy="223" rx="27" ry="5" fill="#514168" opacity=".08"/>
    <path d={shape} fill={`url(#glass-${id})`} stroke="var(--glass-stroke)" strokeWidth="2.5"/>
    <g clipPath={`url(#clip-${id})`}>
      {colors.map((c,i)=><g key={i}><rect x="20" y={205-(i+1)*38} width="40" height="38.5" fill={palette[c]}/><path d={`M20 ${205-(i+1)*38}Q30 ${201-(i+1)*38} 40 ${205-(i+1)*38}T60 ${205-(i+1)*38}`} fill="none" stroke="#fff" strokeOpacity=".24" strokeWidth="2"/>{labels&&<text x="40" y={229-(i+1)*38} textAnchor="middle" fill="#241d3b" fontSize="15" fontWeight="700">{c+1}</text>}</g>)}
      {colors.length>0&&<ellipse className="water-surface" cx="40" cy={206-colors.length*38} rx="20" ry="3.5" fill={palette[colors[colors.length-1]]} stroke="#fff" strokeOpacity=".25" strokeWidth="1"/>}
      <rect x="20" y="23" width="40" height="185" fill={`url(#shine-${id})`}/>
      <rect x="23" y="29" width="3.5" height="160" rx="2" fill="white" opacity=".25"/>
    </g>
    <path d="M17 20H63" stroke="white" strokeWidth="3" opacity=".6"/><rect x="13" y="13" width="54" height="8" rx="4" fill="var(--rim-fill)" stroke="var(--glass-stroke)" strokeWidth="2"/><path d="M19 15H59" stroke="white" strokeWidth="1.7" strokeLinecap="round" opacity=".8"/>
    {done&&<g className="bottle-star"><circle cx="40" cy="128" r="12" fill="white" fillOpacity=".85"/><path d="m34 128 4 4 8-8" stroke={palette[colors[0]]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></g>}
  </svg>;
}
