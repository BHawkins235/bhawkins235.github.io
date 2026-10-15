(() => {
  const stage = document.getElementById('stage');
  const seal  = document.getElementById('seal');
  const page  = document.getElementById('page');
  const scrim = document.getElementById('scrim');
  const hint  = document.getElementById('hint');
  const again = document.getElementById('again');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, reduced ? 0 : ms));

  let state = 'closed';            // closed → opening → open → reading
  const set = (name, on) => stage.classList.toggle(name, on);

  /* Scale the 288×176 design so it fits phones and desktops alike */
  function fit() {
    const k = Math.min(innerWidth * 0.8 / 288, innerHeight * 0.88 / 450, 1.9);
    document.documentElement.style.setProperty('--k', Math.max(k, 0.5).toFixed(3));
  }
  addEventListener('resize', fit);
  fit();

  function say(text) {
    hint.classList.add('swap');
    setTimeout(() => { hint.textContent = text; hint.classList.toggle('swap', !text); }, reduced ? 0 : 250);
  }

  /* 1. Click the seal: it cracks, flap lifts, letter rises out */
  async function openEnvelope() {
    if (state !== 'closed') return;
    state = 'opening';
    say('');
    set('broken', true);
    await wait(300);
    set('flapped', true);
    await wait(750);
    set('open', true);
    await wait(900);
    state = 'open';
    again.hidden = false;
    say('Tap the letter to read it');
  }

  /* 2. Tap the letter: it grows into reading size */
  function read() {
    if (state !== 'open') return;
    state = 'reading';
    set('reading', true);
    document.body.classList.add('is-reading');
    say('Tap anywhere outside to fold it away');
  }

  function fold() {
    if (state !== 'reading') return;
    state = 'open';
    set('reading', false);
    document.body.classList.remove('is-reading');
    page.querySelector('.page-inner').scrollTop = 0;
    say('Tap the letter to read it');
  }

  /* 3. Put everything back */
  async function reseal() {
    if (state === 'opening' || state === 'closed') return;
    if (state === 'reading') { fold(); await wait(700); }
    state = 'opening';
    again.hidden = true;
    say('');
    set('open', false);
    await wait(900);
    set('flapped', false);
    await wait(800);
    set('broken', false);
    state = 'closed';
    say('Tap the seal');
  }

  seal.addEventListener('click', openEnvelope);
  page.addEventListener('click', read);
  page.setAttribute('role', 'button');
  page.setAttribute('tabindex', '0');
  page.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && state === 'open') { e.preventDefault(); read(); }
  });
  scrim.addEventListener('click', fold);
  again.addEventListener('click', reseal);
  addEventListener('keydown', e => { if (e.key === 'Escape') fold(); });
})();
