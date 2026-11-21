from playwright.sync_api import sync_playwright
import sys
want=sys.argv[1].split(',');W,H=(int(sys.argv[2]),int(sys.argv[3])) if len(sys.argv)>3 else (390,844)
area=sys.argv[4] if len(sys.argv)>4 else 'emag'; sex=int(sys.argv[5]) if len(sys.argv)>5 else 1
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':W,'height':H},has_touch=True,is_mobile=True)
    pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8765/index.html?tour=0');pg.wait_for_timeout(1200)
    done=set()
    for i in range(130):
        pg.wait_for_timeout(700);k=pg.evaluate("window.__k")
        if k in want and k not in done:
            pg.wait_for_timeout({'proj':3500,'magic':5200,'done':2500,'pact':800}.get(k,1200));pg.screenshot(path='n7_%s_%d.png'%(k,W));done.add(k)
            if len(done)==len(want):break
        if k=='intro':pg.tap('.sex >> nth=%d'%sex);pg.wait_for_timeout(1300);continue
        if k=='name':pg.fill('#nm','Marina');pg.keyboard.press('Enter');continue
        if k=='area':
            pg.wait_for_selector('.area');pg.wait_for_timeout(700);pg.evaluate("id=>document.querySelector('.area[data-id=\"'+id+'\"]').click()",area);pg.wait_for_timeout(1800);continue
        if k=='trust':pg.check('#ck2');pg.tap('#go');continue
        if k=='email':pg.fill('#em','a@b.com');pg.wait_for_timeout(300);pg.tap('#go');continue
        if k=='edate':
            pg.tap('#nx');pg.wait_for_timeout(400);pg.evaluate("document.querySelectorAll('.calg button:not([disabled])')[12].click()");pg.wait_for_timeout(500)
            if 'edate' in want and 'edate2' not in done:pg.screenshot(path='n7_edate_sel_%d.png'%W);done.add('edate2')
            pg.tap('#go');continue
        if k=='event':pg.tap('.opt >> nth=0');pg.wait_for_timeout(1300);continue
        if k=='motiv':pg.tap('.opt >> nth=0');pg.tap('#go');continue
        if k=='analysis':
            pg.wait_for_selector('.rep,.pjfin',timeout=30000)
            if pg.locator('.pjfin').count():pg.wait_for_timeout(3000);pg.screenshot(path='n7_pjfin_%d.png'%W);pg.tap('#go')
            continue
        if k=='pact':
            bb=pg.locator('#pb').bounding_box();pg.mouse.move(bb['x']+50,bb['y']+50);pg.mouse.down();pg.wait_for_timeout(2800);pg.mouse.up();pg.wait_for_timeout(1800);pg.tap('#go');continue
        if k=='done':break
        if pg.locator('.shov').count():pg.tap('.shov #go');continue
        if pg.locator('.opt').count() and k!='plans':
            pg.tap('.opt >> nth=%d'%(1 if k=='q5' else 0));pg.wait_for_timeout(1000)
            if (k in('restr','cond') or pg.locator('.opt.multi').count()) and pg.locator('#go').count() and not pg.locator('#go').is_disabled():pg.tap('#go')
            continue
        if pg.locator('#go').count() and not pg.locator('#go').is_disabled():pg.tap('#go')
    print(done,errs);b.close()
