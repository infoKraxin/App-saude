from playwright.sync_api import sync_playwright
import json
res=[]
def R(n,ok,d=''):res.append(('OK ' if ok else 'BUG')+' '+n+(' | '+str(d) if d else ''));
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True)
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    D=lambda s:pg.evaluate("__d(%s)"%json.dumps(s))
    def start():
        pg.goto('file:///home/claude/quiz/dbg.html');pg.wait_for_timeout(700)
    def key():return pg.evaluate("window.__k")
    # 1 XSS name
    start();pg.tap('.sex >> nth=0');pg.wait_for_timeout(1500)
    if pg.locator('#go').count() and not pg.locator('#go').is_disabled():pg.tap('#go')
    pg.wait_for_timeout(900);print('after intro',key())
    pg.fill('#nm','<img src=x onerror=window.__x=1>');pg.wait_for_timeout(200)
    print('name state',D('S.name'))
    if not pg.locator('#go').is_disabled():pg.tap('#go')
    pg.wait_for_timeout(1500)
    R('XSS no nome',pg.evaluate("window.__x")is None,D('S.name'))
    pg.screenshot(path='au/b_xss.png')
    # 2 nome com acento/minúsculo
    start();pg.tap('.sex >> nth=0');pg.wait_for_timeout(1500)
    if pg.locator('#go').count() and not pg.locator('#go').is_disabled():pg.tap('#go')
    pg.wait_for_timeout(900)
    pg.fill('#nm','  joão pedro silva ');pg.wait_for_timeout(200);print('nome salvo:',repr(D('S.name')))
    pg.fill('#nm','a');R('nome 1 letra bloqueia',pg.locator('#go').is_disabled())
    pg.fill('#nm','Jo');R('nome 2 letras libera',not pg.locator('#go').is_disabled())
    pg.keyboard.press('Enter');pg.wait_for_timeout(1500);R('Enter avança',key()=='area',key())
    # 3 double-tap area/option
    pg.tap('.area >> nth=0');pg.wait_for_timeout(2500);print('apos area',key())
    k0=key()
    # navigate to q0 via dbg
    D("idx=flow.indexOf('q0');render()");pg.wait_for_timeout(1500)
    n=pg.locator('.opt').count()
    pg.locator('.opt').nth(0).tap();pg.locator('.opt').nth(1).tap(timeout=1000) if False else None
    # rapid taps via JS dispatch
    pg.evaluate("var o=document.querySelectorAll('.opt');o[0].click();o[1].click();o[2].click()")
    pg.wait_for_timeout(3000)
    R('toque triplo não pula tela',key()=='q1',key()+' q:'+str(D('JSON.stringify(S.q)')))
    # 4 back button chain
    seq=[]
    for i in range(6):
        pg.evaluate("document.querySelector('.back,#back,.top button')&&document.querySelector('.back,#back,.top button').click()");pg.wait_for_timeout(700);seq.append(key())
    print('voltando:',seq)
    # 5 reload mid-flow
    pg.reload();pg.wait_for_timeout(1000);R('recarregar mantém progresso',key()!='intro',key())
    # 6 browser back
    start();D("S.name='Ana';S.area='emag';idx=BASE.indexOf('area');render()");pg.wait_for_timeout(500)
    pg.go_back();pg.wait_for_timeout(800);R('botão voltar do navegador fica no quiz',pg.url.endswith('dbg.html') and pg.evaluate("!!document.getElementById('phone')") and pg.url.startswith('file'),pg.url)
    # 7 age extremes
    start();D("S.name='Ana';S.area='emag';S.sex='f';idx=BASE.indexOf('area');render()");pg.wait_for_timeout(500)
    pg.tap('.area >> nth=0');pg.wait_for_timeout(1500)
    D("idx=flow.indexOf('age');render()");pg.wait_for_timeout(1200)
    for v in ['5','17','18','200','']:
        pg.fill('#ageIn',v);pg.wait_for_timeout(250)
        print('idade',repr(v),'->S.age',D('S.age'),'cta disabled',pg.locator('#go').is_disabled() if pg.locator('#go').count() else 'sem cta','warn:',pg.locator('#agewarn').inner_text())
    D("idx=flow.indexOf('body');render()");pg.wait_for_timeout(1200)
    for hv,wv in [('50','20'),('300','500'),('0','0'),('170','')]:
        ins=pg.locator('input[type=number]')
        print('inputs corpo',ins.count())
        break
    print('errs',errs)
    open('behav.txt','w').write('\n'.join(res));print('\n'.join(res))
    b.close()
