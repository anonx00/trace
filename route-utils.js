export function parseRoute(hash='') {
  const value=hash.replace(/^#/, '').trim(),split=value.indexOf('?'),query=split<0?'':value.slice(split+1);
  let pathname=split<0?value:value.slice(0,split);
  try { pathname=decodeURIComponent(pathname); } catch { return {type:'404',params:new URLSearchParams()}; }
  const parts=pathname.replace(/^\/+|\/+$/g,'').split('/').filter(Boolean);
  const aliases={universe:'',nodes:'library','attack-paths':'paths'};
  let [type='',id,sub,index]=parts;
  type=Object.hasOwn(aliases,type)?aliases[type]:type;
  const known=new Set(['','library','paths','coverage','evidence','scenario','sources','concept','domain','service']);
  if(!known.has(type)||parts.length>4||(['scenario','concept','domain','service'].includes(type)&&!id)||(!['scenario','concept','domain','service'].includes(type)&&parts.length>1))type='404';
  if(['domain','scenario','concept'].includes(type)&&parts.length>2)type='404';
  if(type==='service'&&sub&&(sub!=='topic'||!/^\d+$/.test(index??'')))type='404';
  return {type,id,sub,index,params:new URLSearchParams(query)};
}
