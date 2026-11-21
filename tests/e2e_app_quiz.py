# Fluxo completo: app -> quiz do site -> volta ao app com o plano. Uso: python3 tests/e2e_app_quiz.py [base]
from playwright.sync_api import sync_playwright
import random,sys,re,json
BASE=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8793';area=1;sex=1;seed=1
random.seed(seed)
BAD=re.compile(r'undefined|null|NaN|\[object|\{\{|\}\}|Infinity|  +\S|\bundefined\b')
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True)
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(BASE+'/app');pg.wait_for_timeout(3500)
    pg.get_by_role('button',name='Começar').click();pg.wait_for_url('**/?from=app*',timeout=15000);pg.wait_for_timeout(800)
    out={};bad=[]
    for step in range(90):
        pg.wait_for_timeout(750);k=pg.evaluate("window.__k")
        if k in('proj','prog'):pg.wait_for_timeout(2600)
        if k=='analysis':
            pg.wait_for_selector('.rep',timeout=30000)
        txt=pg.evaluate("document.getElementById('phone').innerText")
        out[k]=txt
        m=BAD.findall(txt)
        if m:bad.append((k,m[:3]))
        if k=='done':break
        if pg.locator('.shov').count():
            out[k+'_sheet']=pg.evaluate("document.querySelector('.shov').innerText");pg.tap('.shov #go');continue
        if k in('welcome','tour'):pg.tap('#go');continue
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
    assert k=='done','quiz não terminou: '+str(k)
    assert 'Continuar no app' in pg.evaluate("document.body.innerText"), 'CTA do app ausente'
    pg.tap('#go');pg.wait_for_url('**/app/entrar',timeout=15000);pg.wait_for_timeout(2500)
    em=pg.get_by_label('E-mail').input_value();print('e-mail preenchido:',em)
    pg.get_by_role('button',name='Continuar').click();pg.wait_for_timeout(1500)
    body=pg.evaluate("document.body.innerText");print('plano:',body[:160].replace(chr(10),' | '))
    assert 'Marina' in body and 'Canetas' in body, 'plano do quiz não carregou'
    pg.screenshot(path='/tmp/e2e-plano.png')
    print('OK quiz -> app; erros:',errs);b.close()
