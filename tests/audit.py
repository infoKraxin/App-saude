from playwright.sync_api import sync_playwright
import random,sys,json
W,H=int(sys.argv[1]),int(sys.argv[2]);area=int(sys.argv[3]) if len(sys.argv)>3 else 0
tag='%dx%d_a%d'%(W,H,area)
CHK="""()=>{
 var vw=innerWidth,vh=innerHeight,out=[];
 var ph=document.getElementById('phone')||document.body;
 var pr=ph.getBoundingClientRect();
 if(document.documentElement.scrollWidth>vw+1)out.push('docScrollX '+document.documentElement.scrollWidth);
 var els=[...ph.querySelectorAll('*')];
 els.forEach(function(e){var r=e.getBoundingClientRect();if(!r.width||!r.height)return;var cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none')return;
  if(e.closest('svg')&&e.tagName!=='svg')return;
  if(r.right>pr.right+2||r.left<pr.left-2){if(!e.closest('.lights,.sectint,.waves,.wv,[aria-hidden]'))out.push('outX '+e.tagName+'.'+(e.className.baseVal||e.className)+' '+Math.round(r.left)+'..'+Math.round(r.right))}
  if(cs.overflow!=='visible'&&!/lights|waves|pglow|sectint/.test(e.className)&&e.scrollWidth>e.clientWidth+2&&e.clientWidth>0&&!e.closest('svg'))out.push('clipX '+e.tagName+'.'+e.className+' '+e.scrollWidth+'>'+e.clientWidth);
  if((e.tagName==='BUTTON'||e.classList.contains('opt')||e.classList.contains('area')||e.id==='go')&&(r.height<40||r.width<40))out.push('small '+e.tagName+'.'+e.className+' '+Math.round(r.width)+'x'+Math.round(r.height));
 });
 var go=document.getElementById('go');if(go){var g=go.getBoundingClientRect();if(g.bottom>vh+1||g.top<0)out.push('CTA fora da tela '+Math.round(g.top)+'-'+Math.round(g.bottom))}
 // text too small
 var small=new Set();els.forEach(function(e){if(e.children.length===0&&e.textContent.trim()&&!e.closest('svg')){var fs=parseFloat(getComputedStyle(e).fontSize);if(fs<11)small.add(e.className+':'+fs)}});
 if(small.size)out.push('fonte<11 '+[...small].slice(0,4).join('|'));
 return out}"""
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':W,'height':H},has_touch=True,is_mobile=(W<600),device_scale_factor=1)
    pg=ctx.new_page();errs=[];logs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:logs.append(m.type+': '+m.text) if m.type in('error','warning') else None)
    pg.on('requestfailed',lambda r:logs.append('reqfail '+r.url[:80]))
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(700)
    issues={};seen=[];stuck=[0]
    def GO():
        if pg.locator('#go').count() and not pg.locator('#go').is_disabled():pg.tap('#go',timeout=5000)
        else:
            stuck[0]+=1;issues.setdefault(pg.evaluate("window.__k"),[]).append('CTA desabilitado (sem avançar)')

    def chk(k,extra=''):
        r=pg.evaluate(CHK)
        if r:issues.setdefault(k+extra,[]).extend(r)
    for step in range(90):
        if stuck[0]>6:break
        pg.wait_for_timeout(1400)
        k=pg.evaluate("window.__k||'?'")
        if k in('proj','prog'):pg.wait_for_timeout(3200)
        seen.append(k);chk(k)
        pg.screenshot(path='au/%s_%02d_%s.png'%(tag,step,k))
        if pg.locator('.shov').count():
            chk(k,'[sheet]');pg.screenshot(path='au/%s_%02d_%s_sheet.png'%(tag,step,k));pg.tap('.shov #go');continue
        if k=='done':break
        if k=='intro':
            pg.tap('.sex >> nth=1');pg.wait_for_timeout(1500)
            if pg.locator('#go').count():GO()
            continue
        if k=='name':pg.fill('#nm','Marina');GO();continue
        if k=='area':pg.tap('.area >> nth=%d'%area);continue
        if k=='trust':pg.check('#ck2');GO();continue
        if k=='analysis':
            for j in range(5):
                pg.wait_for_timeout(3300);chk('analysis','[s%d]'%j);pg.screenshot(path='au/%s_an%d.png'%(tag,j))
            pg.wait_for_selector('.rep',timeout=20000);continue
        if k=='email':pg.fill('#em','a@b.com');pg.wait_for_timeout(300);GO();continue
        if k=='done':break
        if k=='pact':
            bb=pg.locator('#pb').bounding_box();pg.mouse.move(bb['x']+50,bb['y']+50);pg.mouse.down();pg.wait_for_timeout(2800);pg.mouse.up();pg.wait_for_timeout(2000);chk('pact','[done]');GO();continue
        if pg.locator('.opt').count() and k not in('plans',):
            n=pg.locator('.opt').count();pg.tap('.opt >> nth=%d'%random.randint(0,n-1));pg.wait_for_timeout(1500)
            GO() if pg.locator('#go').count() and not pg.locator('#go').is_disabled() else None
            continue
        if k in('result','findings','plan'):
            pg.evaluate("document.querySelector('#go')&&document.querySelector('#go').scrollIntoView()")
        if pg.locator('#go').count():GO()
    print(tag,'seen',len(seen),'errs',errs)
    print('LOGS',sorted(set(logs))[:8])
    for k,v in issues.items():
        print(' ',k,sorted(set(v))[:6])
    b.close()
