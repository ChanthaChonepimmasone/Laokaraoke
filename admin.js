'use strict';
/* ໜ້າ Admin: ໃຊ້ $, el, toast, fit, cvEl, SAMPLE, TPL, tplFromRow, imgUrl, CFG, CLOUD ຈາກ script.js */
let sb=null,editing=null,upBlob=null,upUrl='';
const F=id=>$('#'+id);

function readForm(){const n=(i,d)=>{const v=parseInt(F(i).value,10);return Number.isFinite(v)?v:d};
 return{name:F('fName').value.trim(),layout:F('fLayout').value,color:F('fColor').value,fg:F('fFg').value,
  pad:[n('fPt',40),n('fPr',40),n('fPb',40),n('fPl',40)].map(x=>Math.max(0,x)),sw:n('fSw',230),
  photo:{mode:F('fPh').value,x:n('fPx',40),y:n('fPy',40),size:n('fPs',130),round:F('fPr2').checked},
  premium:F('fPrem').checked,published:F('fPub').checked}}
function fillForm(r){F('fName').value=r?r.name:'';F('fLayout').value=r?r.layout:'l1';F('fColor').value=r?r.color:'#2563eb';F('fFg').value=r?r.fg:'#222222';
 const p=r&&Array.isArray(r.pad)?r.pad:[40,40,40,40];F('fPt').value=p[0];F('fPr').value=p[1];F('fPb').value=p[2];F('fPl').value=p[3];F('fSw').value=r?r.sw:230;
 const ph=r&&r.photo?r.photo:{mode:'inline'};F('fPh').value=ph.mode||'inline';F('fPx').value=ph.x??40;F('fPy').value=ph.y??40;F('fPs').value=ph.size??130;F('fPr2').checked=ph.round!==false;
 F('fPrem').checked=!!(r&&r.premium);F('fPub').checked=r?!!r.published:true;F('fFile').value='';sync()}

function sync(){F('swV').textContent=F('fSw').value;F('swWrap').hidden=F('fLayout').value!=='l2';F('phAbs').hidden=F('fPh').value!=='abs';render()}
function render(){const d=readForm(),bg=upUrl||(editing?imgUrl(editing.image_path):'');
 const t=Object.assign(tplFromRow({id:'x',name:d.name||'Draft',layout:d.layout,color:d.color,fg:d.fg,pad:d.pad,sw:d.sw,photo:d.photo,premium:d.premium},bg||'data:,'),{id:'draft'});
 if(!bg)delete t.bg;
 const i=TPL.findIndex(x=>x.id==='draft');if(i<0)TPL.unshift(t);else TPL[i]=t;
 $('#pv').replaceChildren(cvEl(Object.assign({},SAMPLE,{tpl:'draft'})));const s=fit($('#pvbox'))||1;$('#pvbox').style.setProperty('--pg',PAGE*s+'px')}

const loadImg=src=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>no(new Error('ອ່ານຮູບບໍ່ໄດ້'));im.src=src});
async function processFile(f){
 if(f.size>25e6)throw new Error('ໄຟລ໌ໃຫຍ່ເກີນ 25MB');
 const W=1588,H=2246,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H);let ratio;
 if(f.type==='application/pdf'){
  if(!window.pdfjsLib)throw new Error('ໂຫຼດ pdf.js ບໍ່ໄດ້ (ກວດອິນເຕີເນັດ)');
  pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise,pg=await pdf.getPage(1),v1=pg.getViewport({scale:1}),vp=pg.getViewport({scale:W/v1.width}),t=document.createElement('canvas');
  t.width=Math.round(vp.width);t.height=Math.round(vp.height);await pg.render({canvasContext:t.getContext('2d'),viewport:vp}).promise;ratio=v1.height/v1.width;g.drawImage(t,0,0,W,H)}
 else if(/^image\/(png|jpeg|webp)$/.test(f.type)){const u=URL.createObjectURL(f);try{const im=await loadImg(u);ratio=im.height/im.width;g.drawImage(im,0,0,W,H)}finally{URL.revokeObjectURL(u)}}
 else throw new Error('ຮອງຮັບສະເພາະ PNG, JPG, WEBP, PDF');
 F('fWarn').textContent=Math.abs(ratio-297/210)>0.03?`⚠ ອັດຕາສ່ວນຮູບ (${ratio.toFixed(2)}) ບໍ່ແມ່ນ A4 (1.41) — ຮູບຈະຖືກຍືດໃຫ້ເຕັມ A4`:'';
 return new Promise((ok,no)=>c.toBlob(b=>b?ok(b):no(new Error('ແປງຮູບບໍ່ໄດ້')),'image/jpeg',.92))}

async function onFile(){const f=F('fFile').files[0];upBlob=null;if(upUrl){URL.revokeObjectURL(upUrl);upUrl=''}if(!f){F('fWarn').textContent='';render();return}
 try{F('fWarn').textContent='ກຳລັງປະມວນຜົນ…';upBlob=await processFile(f);upUrl=URL.createObjectURL(upBlob);if(!F('fWarn').textContent.startsWith('⚠'))F('fWarn').textContent='';render()}
 catch(e){F('fWarn').textContent='⚠ '+e.message;F('fFile').value='';render()}}

function resetForm(){editing=null;upBlob=null;if(upUrl){URL.revokeObjectURL(upUrl);upUrl=''}$('#formT').textContent='ເພີ່ມແບບໃໝ່';$('#fReset').hidden=true;F('sErr').textContent='';F('fWarn').textContent='';fillForm(null)}

async function saveForm(){const err=F('sErr');err.textContent='';const d=readForm();
 if(!d.name){err.textContent='ກະລຸນາໃສ່ຊື່ແບບ';return}
 if(!editing&&!upBlob){err.textContent='ກະລຸນາເລືອກຮູບ ຫຼື PDF ຂອງດີໄຊນ໌';return}
 const btn=F('fSave');btn.disabled=true;btn.textContent='ກຳລັງບັນທຶກ…';let newPath=null;
 try{
  let path=editing?editing.image_path:null,old=null;
  if(upBlob){newPath=crypto.randomUUID()+'.jpg';const u=await sb.storage.from('designs').upload(newPath,upBlob,{contentType:'image/jpeg',cacheControl:'31536000'});if(u.error)throw u.error;old=path;path=newPath}
  const row={name:d.name,layout:d.layout,color:d.color,fg:d.fg,pad:d.pad,sw:d.sw,photo:d.photo,premium:d.premium,published:d.published,image_path:path};
  const q=editing?sb.from('templates').update(row).eq('id',editing.id):sb.from('templates').insert(row);const r=await q;if(r.error)throw r.error;
  if(old)await sb.storage.from('designs').remove([old]);
  toast(editing?'ບັນທຶກການແກ້ໄຂແລ້ວ':'ອັບໂຫຼດແບບໃໝ່ແລ້ວ');resetForm();await loadList()}
 catch(e){console.error(e);if(newPath)await sb.storage.from('designs').remove([newPath]).catch(()=>{});err.textContent='ບັນທຶກບໍ່ສຳເລັດ: '+(e.message||e)}
 finally{btn.disabled=false;btn.textContent='ບັນທຶກ'}}

async function loadList(){const box=$('#list');const {data,error}=await sb.from('templates').select('*').order('sort',{ascending:true}).order('created_at',{ascending:true});
 box.replaceChildren();if(error){box.append(el('p','err','ໂຫຼດລາຍການບໍ່ໄດ້: '+error.message));return}
 if(!data.length){box.append(el('p','sm','ຍັງບໍ່ມີແບບທີ່ອັບໂຫຼດ'));return}
 data.forEach(r=>{const it=el('div','item'),im=el('img');im.src=imgUrl(r.image_path);im.alt='';im.loading='lazy';
  const g=el('div','grow'),b=el('b','',r.name);g.append(b,el('div','sm',[r.layout==='l2'?'ແຖບຂ້າງ':r.layout==='l3'?'ຫົວໃຫຍ່':'1 ຖັນ',r.premium?'Premium':'Free',r.published?'ເຜີຍແຜ່ແລ້ວ':'ເຊື່ອງຢູ່'].join(' · ')));
  const bt=el('div','btns'),mk=(t,fn,c)=>{const x=el('button','btn '+(c||'o'),t);x.type='button';x.onclick=fn;return x};
  bt.append(
   mk(r.published?'ເຊື່ອງ':'ເຜີຍແຜ່',async()=>{const u=await sb.from('templates').update({published:!r.published}).eq('id',r.id);if(u.error)toast(u.error.message,1);else loadList()}),
   mk('ແກ້ໄຂ',()=>{editing=r;upBlob=null;if(upUrl){URL.revokeObjectURL(upUrl);upUrl=''}$('#formT').textContent='ແກ້ໄຂ: '+r.name;$('#fReset').hidden=false;fillForm(r);window.scrollTo(0,0)}),
   mk('ລຶບ',async()=>{if(!confirm('ລຶບແບບ "'+r.name+'" ຖາວອນ?'))return;const d=await sb.from('templates').delete().eq('id',r.id);if(d.error){toast(d.error.message,1);return}await sb.storage.from('designs').remove([r.image_path]).catch(()=>{});if(editing&&editing.id===r.id)resetForm();toast('ລຶບແລ້ວ');loadList()},'d'));
  it.append(im,g,bt);box.append(it)})}

async function showFor(session){
 const login=$('#login'),panel=$('#panel');$('#logout').hidden=!session;
 if(!session){login.hidden=false;panel.hidden=true;return}
 const r=await sb.from('admins').select('user_id').eq('user_id',session.user.id).maybeSingle();
 if(r.error||!r.data){login.hidden=false;panel.hidden=true;F('lErr').textContent='ບັນຊີນີ້ບໍ່ແມ່ນ Admin';await sb.auth.signOut();return}
 login.hidden=true;panel.hidden=false;sync();loadList()}

document.addEventListener('DOMContentLoaded',async()=>{
 if(!CLOUD||!window.supabase){F('cfgErr').hidden=false;if(CLOUD)F('cfgErr').textContent='ໂຫຼດ Supabase ບໍ່ໄດ້ (ກວດອິນເຕີເນັດ)';return}
 sb=window.supabase.createClient(CFG.url,CFG.key);
 ['fName','fLayout','fColor','fFg','fSw','fPt','fPr','fPb','fPl','fPh','fPx','fPy','fPs','fPr2','fPrem'].forEach(i=>{F(i).addEventListener('input',sync);F(i).addEventListener('change',sync)});
 F('fFile').onchange=onFile;F('fSave').onclick=saveForm;F('fReset').onclick=resetForm;
 F('lGo').onclick=async()=>{F('lErr').textContent='';const r=await sb.auth.signInWithPassword({email:F('lEmail').value.trim(),password:F('lPass').value});if(r.error){F('lErr').textContent='ເຂົ້າສູ່ລະບົບບໍ່ໄດ້: '+r.error.message;return}F('lPass').value='';showFor(r.data.session)};
 F('lPass').onkeydown=e=>{if(e.key==='Enter')F('lGo').click()};
 $('#logout').onclick=async()=>{await sb.auth.signOut();showFor(null)};
 addEventListener('resize',()=>{if(!$('#panel').hidden)render()});
 if(document.fonts)document.fonts.ready.then(()=>{if(!$('#panel').hidden)render()});
 const {data}=await sb.auth.getSession();showFor(data.session)});
