from playwright.sync_api import sync_playwright
import random,sys
mode=sys.argv[1]
with sync_playwright() as p:
    b=p.chromium.launch()
    kw=dict(viewport={'width':390,'height':844},has_touch=True,is_mobile=True)
    if mode=='reduced':kw['reduced_motion']='reduce'
    if mode=='desktop':kw=dict(viewport={'width':1280,'height':800},has_touch=True)
    ctx=b.new_context(**kw);pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    if mode=='slow':
        c=ctx.new_cdp_session(pg);c.send('Emulation.setCPUThrottlingRate',{'rate':4})
    pg.goto('file:///home/claude/quiz/index.html');pg.wait_for_timeout(800)
    pg.evaluate("window.__f=0;(function l(){window.__f++;requestAnimationFrame(l)})()")
    seen=[];fps={}
    for step in range(90):
        pg.wait_for_timeout(1300);k=pg.evaluate("window.__k");seen.append(k)
        f0=pg.evaluate("window.__f");pg.wait_for_timeout(1000);f1=pg.evaluate("window.__f");fps[k]=f1-f0
        if k=='done':break
        if pg.locator('.shov').count():pg.tap('.shov #go');continue
        if k=='intro':pg.tap('.sex >> nth=1');pg.wait_for_timeout(1500);continue
        if k=='name':pg.fill('#nm','Marina');pg.keyboard.press('Enter');continue
        if k=='area':pg.tap('.area >> nth=0');continue
        if k=='trust':pg.check('#ck2');pg.tap('#go');continue
        if k=='analysis':
            pg.wait_for_selector('.rep',timeout=60000);continue
        if k=='email':pg.fill('#em','a@b.com');pg.wait_for_timeout(300);pg.tap('#go');continue
        if k=='pact':
            bb=pg.locator('#pb').bounding_box();pg.mouse.move(bb['x']+50,bb['y']+50);pg.mouse.down();pg.wait_for_timeout(3000);pg.mouse.up();pg.wait_for_timeout(2000);pg.tap('#go');continue
        if pg.locator('.opt').count() and k!='plans':
            pg.tap('.opt >> nth=0');pg.wait_for_timeout(1500)
            if pg.locator('#go').count() and not pg.locator('#go').is_disabled():pg.tap('#go')
            continue
        if pg.locator('#go').count() and not pg.locator('#go').is_disabled():pg.tap('#go')
    print(mode,'chegou ao fim:',seen[-1]=='done',len(seen),errs)
    low={k:v for k,v in fps.items() if v<40}
    print('fps<40 (em 1s):',low);print('min fps',min(fps.values()),'median',sorted(fps.values())[len(fps)//2])
    if mode=='desktop':pg.screenshot(path='au/desk_end.png')
    b.close()
