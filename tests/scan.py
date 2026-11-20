from playwright.sync_api import sync_playwright
import random,sys,re,json
area=int(sys.argv[1]);sex=int(sys.argv[2]);seed=int(sys.argv[3]) if len(sys.argv)>3 else 1
random.seed(seed)
BAD=re.compile(r'undefined|null|NaN|\[object|\{\{|\}\}|Infinity|  +\S|\bundefined\b')
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True)
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8765/index.html');pg.wait_for_timeout(600)
    out={};bad=[]
    for step in range(130):
        pg.wait_for_timeout(750);k=pg.evaluate("window.__k")
        if k in('proj','prog'):pg.wait_for_timeout(2600)
        if k=='analysis':
            pg.wait_for_selector('.rep,.pjfin',timeout=30000)
            if pg.locator('.pjfin').count():
                pg.wait_for_timeout(2500);out['analysis_fim']=pg.evaluate("document.getElementById('phone').innerText");pg.tap('#go')
        txt=pg.evaluate("document.getElementById('phone').innerText")
        out[k]=txt
        m=BAD.findall(txt)
        if m:bad.append((k,m[:3]))
        if k=='done':break
        if pg.locator('.shov').count():
            out[k+'_sheet']=pg.evaluate("document.querySelector('.shov').innerText");pg.tap('.shov #go');continue
        if k=='tour':pg.tap('#sk');continue
        if k=='edate':
            pg.evaluate("document.querySelectorAll('.calg button:not([disabled])')[9].click()");pg.wait_for_timeout(400);pg.tap('#go');continue
        if k=='intro':pg.tap('.sex >> nth=%d'%sex);pg.wait_for_timeout(1300);continue
        if k=='name':pg.fill('#nm','Marina');pg.keyboard.press('Enter');continue
        if k=='area':
            pg.wait_for_selector('.area',timeout=15000);pg.wait_for_timeout(700);ids=pg.evaluate("[...document.querySelectorAll('.area')].map(e=>e.dataset.id)");want=['emag','cane','intes','horm','sono','ener','mass','long'][area]
            if want not in ids:print('area oculta p/ este sexo:',want);break
            pg.evaluate("id=>document.querySelector('.area[data-id=\"'+id+'\"]').click()",want);pg.wait_for_timeout(1800);continue
        if k=='trust':pg.check('#ck2');pg.tap('#go');continue
        if k=='email':pg.fill('#em','a@b.com');pg.wait_for_timeout(300);pg.tap('#go');continue
        if k=='pact':
            bb=pg.locator('#pb').bounding_box();pg.mouse.move(bb['x']+50,bb['y']+50);pg.mouse.down();pg.wait_for_timeout(2800);pg.mouse.up();pg.wait_for_timeout(1800);pg.tap('#go');continue
        if k=='analysis':continue
        if pg.locator('.opt').count() and k!='plans':
            n=pg.locator('.opt').count()
            idxs=random.sample(range(n),1)
            if k=='cond' and random.random()<.5:idxs=[0,min(2,n-1)]
            if k=='restr' and random.random()<.5:idxs=[0,1]
            for i in idxs:pg.tap('.opt >> nth=%d'%i);pg.wait_for_timeout(300)
            pg.wait_for_timeout(1000)
            if pg.locator('#go').count() and not pg.locator('#go').is_disabled():pg.tap('#go')
            continue
        if pg.locator('#go').count() and not pg.locator('#go').is_disabled():pg.tap('#go')
    json.dump(out,open('au/txt_%d_%d_%d.json'%(area,sex,seed),'w'),ensure_ascii=False)
    print('area',area,'sex',sex,'fim',k,'bad',bad,'errs',errs);b.close()
