const $=(s,c=document)=>c.querySelector(s)
const $$=(s,c=document)=>[...c.querySelectorAll(s)]

const header=$('[data-header]')
const cursor=$('.cursor')
const progress=$('.progress i')
const status=$('[data-status]')
const statusBox=$('.live-status')
const clock=$('[data-clock]')
const dayLabel=$('[data-day-label]')
const orbit=$('[data-orbit]')

const hours={1:[6,21],2:[6,21],3:[6,21],4:[6,21],5:[6,20]}

function localNow(){
  const parts=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date())
  const get=t=>parts.find(p=>p.type===t)?.value||''
  const names={dom:0,seg:1,ter:2,qua:3,qui:4,sex:5,sáb:6,sab:6}
  return {day:names[get('weekday').replace('.','').toLowerCase()],h:Number(get('hour')),m:Number(get('minute'))}
}

function live(){
  const n=localNow(); if(n.day===undefined)return
  const hh=String(n.h).padStart(2,'0'),mm=String(n.m).padStart(2,'0')
  clock.textContent=`${hh}:${mm}`
  const days=['domingo','segunda','terça','quarta','quinta','sexta','sábado']
  dayLabel.textContent=days[n.day]
  const range=hours[n.day]
  const decimal=n.h+n.m/60
  const open=range&&decimal>=range[0]&&decimal<range[1]
  status.textContent=open?'aberto agora':n.day===6||n.day===0?'confirme o fim de semana':range&&decimal<range[0]?`abre às ${String(range[0]).padStart(2,'0')}:00`:'fechado agora'
  statusBox.classList.toggle('open',!!open)
  statusBox.classList.toggle('closed',!open)
  orbit.style.transform=`rotate(${((n.h*60+n.m)/1440)*360}deg)`
  $$('[data-week]').forEach(r=>r.classList.toggle('today',Number(r.dataset.week)===n.day))
}

function reveal(){
  const els=$$('.reveal')
  if(!('IntersectionObserver'in window)){els.forEach(e=>e.classList.add('in'));return}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -7% 0px'})
  els.forEach(e=>io.observe(e))
}

function scrolling(){
  const sync=()=>{
    header.classList.toggle('scrolled',scrollY>24)
    const max=document.documentElement.scrollHeight-innerHeight
    progress.style.height=`${max>0?(scrollY/max)*100:0}%`
  }
  sync();addEventListener('scroll',sync,{passive:true})
}

function cursorFx(){
  if(!matchMedia('(pointer:fine)').matches)return
  document.body.classList.add('has-cursor')
  let x=innerWidth/2,y=innerHeight/2,cx=x,cy=y
  addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;cursor.style.opacity=1},{passive:true})
  const loop=()=>{cx+=(x-cx)*.16;cy+=(y-cy)*.16;cursor.style.transform=`translate(${cx-27}px,${cy-27}px)`;requestAnimationFrame(loop)}
  loop()
  $$('a,button,label,input,textarea').forEach(el=>{el.addEventListener('mouseenter',()=>cursor.classList.add('on'));el.addEventListener('mouseleave',()=>cursor.classList.remove('on'))})
}

function magnetic(){
  if(!matchMedia('(pointer:fine)').matches)return
  $$('.magnetic').forEach(el=>{
    el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const dx=(e.clientX-r.left-r.width/2)*.11;const dy=(e.clientY-r.top-r.height/2)*.13;el.style.transform=`translate(${dx}px,${dy}px)`})
    el.addEventListener('pointerleave',()=>el.style.transform='')
  })
}

function tilt(){
  if(!matchMedia('(pointer:fine)').matches)return
  $$('.tilt').forEach(el=>{
    el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const px=(e.clientX-r.left)/r.width-.5;const py=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(1000px) rotateY(${px*4}deg) rotateX(${py*-4}deg)`})
    el.addEventListener('pointerleave',()=>el.style.transform='')
  })
}

function tabs(){
  const stage=$('[data-stage]'),num=$('.stage-number',stage),word=$('.stage-word',stage)
  const copy={'musculação':'MUSCULAÇÃO','funcional':'FUNCIONAL','pilates':'PILATES','lutas':'LUTAS'}
  $$('.mov').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.mov').forEach(b=>b.classList.remove('active'));btn.classList.add('active')
    num.textContent=btn.dataset.index;word.textContent=copy[btn.dataset.move]
    stage.animate([{opacity:.35,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:320,easing:'ease-out'})
  }))
}

function navSpy(){
  const links=$$('[data-nav]')
  const map=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]))
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.remove('active'));map.get(e.target.id)?.classList.add('active')}}),{threshold:.28})
  $$('[data-section]').forEach(s=>io.observe(s))
}

function builder(){
  const form=$('#builder'),preview=$('[data-preview]'),send=$('[data-send]')
  const make=()=>{
    const data=new FormData(form)
    const mod=data.get('modalidade')||''
    const foco=data.get('foco')||''
    const days=$$('[data-days] input:checked').map(i=>i.value)
    const h=data.get('horario')||''
    const hl=(data.get('horarioLivre')||'').trim()
    const obs=(data.get('observacao')||'').trim()
    if(!mod){preview.textContent='Escolha uma modalidade para começar.';send.classList.add('disabled');send.setAttribute('aria-disabled','true');send.href='#';return}
    const lines=[`Olá! Vi o site do WR7 e queria agendar uma aula experimental grátis de ${mod}.`]
    if(foco)lines.push(`Meu foco hoje é: ${foco}.`)
    if(days.length)lines.push(`Os dias que melhor funcionam para mim são: ${days.join(', ')}.`)
    if(h||hl)lines.push(`Quanto ao horário, consigo ${hl||`por volta de ${h}`}.`)
    if(obs)lines.push(`Queria comentar também: ${obs}`)
    lines.push('Vocês conseguem me orientar sobre o melhor horário para a primeira aula?')
    const msg=lines.join('\n')
    preview.textContent=msg
    send.href=`https://wa.me/5532999355341?text=${encodeURIComponent(msg)}`
    send.classList.remove('disabled');send.setAttribute('aria-disabled','false')
  }
  form.addEventListener('input',make);form.addEventListener('change',make);make()
}

live();setInterval(live,30000)
reveal();scrolling();cursorFx();magnetic();tilt();tabs();navSpy();builder()
