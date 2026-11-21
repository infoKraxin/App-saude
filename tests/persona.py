from playwright.sync_api import sync_playwright
import sys,json
cfg=json.load(open(sys.argv[1]));pid=sys.argv[2];P=cfg[pid]
MULTI={'motiv','will','restr','cond','tmeth','lifeev'}
log=[];seen=set();seq=[]
def run():
  with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True)
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(600)
    last=None;same=0
    for step in range(400):
        pg.wait_for_timeout(250);k=pg.evaluate("window.__k")
        if k==last:
            same+=1
            if same>30:log.append(('STUCK',k));break
        else:same=0
        last=k
        if not seq or seq[-1]!=k:seq.append(k)
        if k in('proj','prog','pjload'):pg.wait_for_timeout(2600)
        if k=='analysis':
            try:pg.wait_for_selector('.rep,.pjfin',timeout=30000)
            except:pass
            if pg.locator('.pjfin').count():
                pg.wait_for_timeout(2500);log.append(('analysis_fim',pg.evaluate("document.getElementById('phone').innerText")));pg.tap('#go');pg.wait_for_timeout(800)
        txt=pg.evaluate("document.getElementById('phone').innerText")
        if k not in seen or k in('analysis',):
            seen.add(k);log.append((k,txt))
        if k=='done':break
        if pg.locator('.shov').count():
            log.append((k+'_sheet',pg.evaluate("document.querySelector('.shov').innerText")));pg.tap('.shov #go');continue
        if k=='tour':pg.tap('#sk');continue
        if k=='edate':
            pg.evaluate("document.querySelectorAll('.calg button:not([disabled])')[Math.min(%d,document.querySelectorAll('.calg button:not([disabled])').length-1)].click()"%P.get('edays',9));pg.wait_for_timeout(400);pg.tap('#go');continue
        if k=='intro':pg.tap('.sex >> nth=0');pg.wait_for_timeout(1300);continue
        if k=='name':pg.fill('#nm',P.get('name','Carlos'));pg.keyboard.press('Enter');continue
        if k=='area':
            pg.wait_for_selector('.area',timeout=15000);pg.wait_for_timeout(700)
            pg.evaluate("id=>document.querySelector('.area[data-id=\"'+id+'\"]').click()",P['area']);pg.wait_for_timeout(1800);continue
        if k=='age':pg.fill('#ageIn',str(P['age']));pg.wait_for_timeout(300);pg.tap('#go');continue
        if k=='body':
            pg.fill('#hIn',str(P['h']));pg.fill('#wIn',str(P['w']));pg.wait_for_timeout(300);pg.tap('#go');continue
        if k=='goalw':
            pg.fill('#gIn',str(P['goal']));pg.wait_for_timeout(300)
            if pg.evaluate('window.__k')==k and pg.locator('#go').count() and not pg.locator('#go').is_disabled():pg.tap('#go')
            continue
        if k=='trust':pg.check('#ck2');pg.tap('#go');continue
        if k=='email':pg.fill('#em','a@b.com');pg.wait_for_timeout(300);pg.tap('#go');continue
        if k=='pact':
            bb=pg.locator('#pb').bounding_box();pg.mouse.move(bb['x']+50,bb['y']+50);pg.mouse.down();pg.wait_for_timeout(2800);pg.mouse.up();pg.wait_for_timeout(1800);pg.tap('#go');continue
        if k=='analysis':continue
        if pg.locator('.field.oth,#oth').count() and False:pass
        if pg.locator('.opt').count() and k!='plans':
            picks=P['a'].get(k,[]);texts=pg.evaluate("[...document.querySelectorAll('.opt')].map(e=>e.innerText.split('\\n')[0])")
            idxs=[]
            for pk in picks:
                m=[i for i,t in enumerate(texts) if pk.lower() in t.lower()]
                if m:idxs.append(m[0])
                else:log.append(('MISSING',k+': '+pk+' | opts='+str(texts)))
            if not idxs:idxs=[0]
            if k not in MULTI:idxs=idxs[:1]
            for i in idxs:pg.tap('.opt >> nth=%d'%i);pg.wait_for_timeout(250)
            log.append(('PICK',k+' -> '+' + '.join(texts[i] for i in idxs)))
            pg.wait_for_timeout(1000)
            if pg.evaluate('window.__k')==k and pg.locator('#go').count() and not pg.locator('#go').is_disabled():pg.tap('#go')
            continue
        if pg.locator('#go').count() and not pg.locator('#go').is_disabled():pg.tap('#go')
    b.close();return errs
errs=run()
json.dump({'seq':seq,'log':log,'errs':errs},open('/home/claude/app-saude/au/p/%s.json'%pid,'w'),ensure_ascii=False)
print(pid,'ok',len(log),'errs',errs)
