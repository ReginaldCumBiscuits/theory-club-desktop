"""Theory Club release tests.

Serves web/index.html locally, opens it in headless Chromium and checks:
  1. every page reachable from the app (per instrument) loads without a script error and isn't empty;
  2. the key features still work: song transcriber (separation and transcription on a generated song),
     tone guides, Voice studio, lesson plan builder and journey quizzes.
Exit code is non-zero if anything fails, which stops the release build.
Run locally:  pip install playwright && python -m playwright install chromium && python tests/smoke.py
"""
import asyncio, functools, http.server, os, socketserver, sys, threading
from playwright.async_api import async_playwright

ROOT = os.environ.get('TC_WEB') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'web')
PORT = int(os.environ.get('TC_PORT', '8799'))
LIMIT = int(os.environ.get('TC_CRAWL_LIMIT', '160'))
URL = f'http://127.0.0.1:{PORT}/index.html'
FAILS = []

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    h = functools.partial(Quiet, directory=ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(('127.0.0.1', PORT), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv

def init(inst):
    return ("if(!sessionStorage.getItem('s')){sessionStorage.setItem('s','1');localStorage.clear();"
            "localStorage.setItem('tc:welcomed','true');localStorage.setItem('tc:toured','true');"
            f"localStorage.setItem('tc:inst','\"{inst}\"');"
            f"localStorage.setItem('tc:profile',JSON.stringify({{name:'Test',insts:['{inst}'],level:1,genres:[]}}))}}")

def fail(msg):
    FAILS.append(msg)
    print('  FAIL', msg, flush=True)

async def new_page(browser, inst):
    ctx = await browser.new_context(viewport={'width': 1200, 'height': 900})
    await ctx.add_init_script(init(inst))
    pg = await ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    return ctx, pg, errs

async def crawl(browser, inst):
    ctx, pg, errs = await new_page(browser, inst)
    await pg.goto(URL + '#home')
    await pg.wait_for_timeout(1200)
    await pg.evaluate("document.querySelector('#wnok')&&document.querySelector('#wnok').click()")
    seen, queue, n = set(), ['home'], 0
    skip = ('tools-online', 'plan-new')  # covered by feature checks; online needs a network
    while queue and n < LIMIT:
        h = queue.pop(0)
        if h in seen or any(h.startswith(s) for s in skip):
            continue
        seen.add(h)
        before = len(errs)
        try:
            await pg.evaluate("h=>{location.hash=h}", '#' + h)
            await pg.wait_for_timeout(120)
            txt = await pg.evaluate("(document.querySelector('main')||document.body).innerText.length")
        except Exception as e:
            fail(f'{inst} #{h}: {e}')
            continue
        n += 1
        if len(errs) > before:
            fail(f'{inst} #{h}: script error: {errs[-1]}')
        if txt < 20:
            fail(f'{inst} #{h}: page is empty')
        links = await pg.evaluate("[...document.querySelectorAll('a[href^=\"#\"]')].map(a=>a.getAttribute('href').slice(1)).filter(Boolean)")
        for l in links:
            if l not in seen and l not in queue:
                queue.append(l)
    print(f'  {inst}: {n} pages', flush=True)
    await ctx.close()

SYNTH = r"""(()=>{const sr=44100,T=12,n=sr*T,L=new Float32Array(n),R=new Float32Array(n);let seed=1;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647*2-1;
 const add=(t0,fn,dur,pan)=>{const s0=Math.floor(t0*sr);for(let i=0;i<dur*sr&&s0+i<n;i++){const v=fn(i/sr);L[s0+i]+=v*(1-pan);R[s0+i]+=v*(1+pan)}};
 const mel=[69,71,72,74,76,74,72,71];for(let b=0;b<T/.5;b++){const t0=b*.5,bar=b%4;
  if(bar===0||bar===2)add(t0,t=>Math.sin(2*Math.PI*(60-30*t)*t)*Math.exp(-t*12)*.9,.3,0);if(bar===1||bar===3)add(t0,t=>rnd()*Math.exp(-t*18)*.5,.25,0);
  const fb=440*Math.pow(2,([45,50][Math.floor(b/4)%2]-69)/12);add(t0,t=>(Math.sin(2*Math.PI*fb*t)+.3*Math.sin(4*Math.PI*fb*t))*.35*Math.exp(-t*2),.47,0);
  const fv=440*Math.pow(2,(mel[b%8]-69)/12);add(t0,t=>(Math.sin(2*Math.PI*fv*t)+.4*Math.sin(4*Math.PI*fv*t))*.22*Math.min(1,t*40),.45,0);
  if(b%4===0){const r=[57,62][Math.floor(b/4)%2];[0,4,7,12].forEach(iv=>{const f=440*Math.pow(2,(r+iv-69)/12);add(t0,t=>(Math.sin(2*Math.PI*f*t)+.5*Math.sin(4*Math.PI*f*t))*.12*Math.exp(-t*1.2),1.96,-.8)})}}
 return{L,R,sr}})()"""

async def features(browser):
    ctx, pg, errs = await new_page(browser, 'guitar')
    await pg.goto(URL + '#home')
    await pg.wait_for_timeout(1200)
    if not await pg.evaluate("!!document.querySelector('.wnov')"):
        fail("What's new didn't show on first open")
    await pg.evaluate("document.querySelector('#wnok')&&document.querySelector('#wnok').click()")
    # song transcriber: separation and transcription on a generated song with known chords, tempo and drums
    # (kick on beats 1 and 3, snare on 2 and 4, 120 BPM, 12 seconds)
    for part in ['other', 'vocals', 'drums']:
        r = await pg.evaluate("""part=>new Promise(res=>{const S=""" + SYNTH + """;const src='('+tsWorkerMain.toString()+')()';const W=new Worker(URL.createObjectURL(new Blob([src])));
          W.onmessage=e=>{if(e.data.done||e.data.error){res({err:e.data.error,bpm:e.data.bpm,chords:(e.data.chords||[]).map(c=>c.name),notes:(e.data.notes||[]).length,hits:(e.data.hits||[]).length,kicks:(e.data.hits||[]).filter(h=>h.k==='kick').length,snares:(e.data.hits||[]).filter(h=>h.k==='snare').length});W.terminate()}};W.postMessage({L:S.L,R:S.R,sr:S.sr,part})})""", part)
        if r.get('err'):
            fail(f'transcriber {part}: {r["err"]}')
        elif abs(r['bpm'] - 120) > 4:
            fail(f'transcriber {part}: tempo {r["bpm"]}, expected 120')
        elif part == 'other' and not ({'A', 'D'} <= set(r['chords'])):
            fail(f'transcriber chords: {r["chords"][:8]}')
        elif part == 'vocals' and r['notes'] < 15:
            fail(f'transcriber vocals: only {r["notes"]} notes')
        elif part == 'drums' and not (10 <= r['kicks'] <= 14 and 10 <= r['snares'] <= 14):
            fail(f'transcriber drums: {r["kicks"]} kicks and {r["snares"]} snares, expected 12 of each')
    # an already-separated part (what the desktop app's AI separation hands over) goes straight to transcription
    MEL = r"""(()=>{const sr=44100,n=sr*12,V=new Float32Array(n);const mel=[69,71,72,74,76,74,72,71];for(let b=0;b<24;b++){const f=440*Math.pow(2,(mel[b%8]-69)/12),s0=b*sr/2;for(let i=0;i<.45*sr;i++){const t=i/sr;V[s0+i]=(Math.sin(2*Math.PI*f*t)+.4*Math.sin(4*Math.PI*f*t))*.3*Math.min(1,t*40)}}return V})()"""
    r = await pg.evaluate("""()=>new Promise(res=>{const S=""" + SYNTH + """;const V=""" + MEL + """;const src='('+tsWorkerMain.toString()+')()';const W=new Worker(URL.createObjectURL(new Blob([src])));
      W.onmessage=e=>{if(e.data.done||e.data.error){res({err:e.data.error,notes:(e.data.notes||[]).map(x=>x.m)});W.terminate()}};W.postMessage({L:S.L,R:S.R,sr:S.sr,part:'vocals',pre:{L:V,R:V.slice(),sr:44100}})})""")
    if r.get('err'):
        fail(f'transcriber with a separated part: {r["err"]}')
    elif len(r['notes']) < 18 or sum(1 for m in r['notes'] if m in (69, 71, 72, 74, 76)) < len(r['notes']) * 0.8:
        fail(f'transcriber with a separated part: notes {r["notes"][:30]}')
    print('  transcriber checked', flush=True)
    checks = [
        ('#tools-isolate', "!!document.querySelector('#tsfile')", 'transcriber page'),
        ('#course', "document.querySelectorAll('.crsst').length===8", 'course overview'),
        ('#course-1', "document.querySelectorAll('.crsql li').length>=3&&!!document.querySelector('.crshrs')&&!!document.querySelector('a[href=\"#plan-new\"]')", 'course stage checkpoints, song plan and practice time'),
        ('#journey', "[...document.querySelectorAll('.secnav a')].length===3&&(document.querySelector('.sbnav [aria-current]')||{}).textContent==='Course'", 'topic quizzes inside Course'),
        ('#tools', "document.querySelectorAll('.toolgh').length===3", 'grouped tools'),
        ('#course-3', "document.querySelectorAll('[data-cg]').length>=4&&document.querySelectorAll('.crsgrid .panel').length>=5", 'course stage'),
        ('#home', "!!document.getElementById('skiplink')&&document.documentElement.lang==='en'&&!!document.getElementById('a11ylive')", 'skip link and screen reader announcements'),
        ('#tone-jimi-hendrix', "!!document.querySelector('.eqsvg')&&document.querySelectorAll('.tone .panel').length>=7", 'tone guide'),
        ('#tone-basics', "document.querySelectorAll('.eqsl input').length===7", 'EQ playground'),
        ('#voice-range', "!!document.querySelector('.vsteps,.vsrange,#vsml')", 'Voice studio range'),
        ('#voice-sight', "!!document.querySelector('#vssgo')", 'Voice studio sight-singing'),
        ('#jq-0.tech0', "/20 questions/.test(document.querySelector('main').innerText)", 'technique quiz'),
    ]
    for h, test, name in checks:
        await pg.evaluate("h=>{location.hash=h}", h)
        await pg.wait_for_timeout(500)
        if not await pg.evaluate(test):
            fail(f'{name} ({h}) did not render')
    # fixing a wrong note on a finished transcription
    await pg.evaluate("TS.res={part:'vocals',bpm:120,beats:[0,.5,1,1.5,2,2.5,3,3.5],notes:[{t:.1,m:60,d:.3},{t:.6,m:62,d:.3}],chords:[],hits:[]};TS.stage='play';TS.L=null;TS.ytId='';TS.fileUrl=null;location.hash='#tools'")
    await pg.wait_for_timeout(300)
    await pg.evaluate("location.hash='#tools-isolate'")
    await pg.wait_for_timeout(700)
    try:
        await pg.click('#tsfix summary')
        await pg.click('[data-fi="0"]')
        await pg.click('[data-fx="up"]')
        await pg.wait_for_timeout(300)
        if await pg.evaluate("TS.res.notes[0].m") != 61:
            fail('fixing a note did not change it')
    except Exception as e:
        fail(f'fix a wrong note: {e}')
    # play-along scoring: half the notes right, a quarter late, a quarter wrong
    r = await pg.evaluate("(()=>{TS.res={part:'vocals',bpm:120,beats:[0,.5,1,1.5,2,2.5,3,3.5,4,4.5],notes:[0,1,2,3,4,5,6,7].map(i=>({t:.2+i*.5,m:60+i,d:.3})),chords:[],hits:[]};TS.view='lead';PLSC.frames=[];TS.res.notes.forEach((n,i)=>{const off=i%4===1?.2:0;for(let k=0;k<4;k++)PLSC.frames.push({t:n.t+off+k*.03,m:i%4===3?n.m+3:n.m})});PLSC.t0=0;PLSC.t1=4.5;const x=scEval();return x&&[x.hit,x.late,x.wrong,x.miss]})()")
    if r != [4, 2, 2, 0]:
        fail(f'play-along scoring: {r}, expected 4 right, 2 late, 2 wrong')
    # practice time counts towards the course stage
    s0 = await pg.evaluate("cSecs(cCurrent())")
    await pg.evaluate("logPractice(120)")
    if await pg.evaluate("cSecs(cCurrent())") - s0 != 120:
        fail('practice time did not count towards the course stage')
    # lesson plan builder
    await pg.evaluate("h=>{location.hash=h}", '#plan-new')
    await pg.wait_for_timeout(400)
    try:
        await pg.click('.iccard[data-ic="Jimi Hendrix"]')
        await pg.click('#pbuild')
        await pg.wait_for_timeout(500)
        if await pg.evaluate("document.querySelectorAll('.pweek').length") < 5:
            fail('lesson plan builder made too few lessons')
    except Exception as e:
        fail(f'lesson plan builder: {e}')
    for e in errs:
        fail(f'script error during feature checks: {e}')
    print('  features checked', flush=True)
    await ctx.close()

async def main():
    if not os.path.exists(os.path.join(ROOT, 'index.html')):
        print('web/index.html is missing'); sys.exit(1)
    srv = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        print('Feature checks', flush=True)
        await features(browser)
        print('Page crawl', flush=True)
        for inst in ['guitar', 'bass', 'drums', 'piano', 'voice']:
            await crawl(browser, inst)
        await browser.close()
    srv.shutdown()
    if FAILS:
        print(f'\n{len(FAILS)} problem(s) found:')
        for f in FAILS[:50]:
            print(' -', f)
        sys.exit(1)
    print('\nAll checks passed.')

asyncio.run(main())
