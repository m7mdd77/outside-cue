const $ = id => document.getElementById(id);
let plan, interval, end;
function show(id) { for (const section of ['setup', 'result', 'break', 'done']) $(section).hidden = section !== id; }
fetch('/api/status').then(r => r.json()).then(s => { $('status').textContent = s.ready && s.localOnly ? 'Local model ready' : 'Model unavailable'; }).catch(() => { $('status').textContent = 'Disconnected'; });
$('planner').addEventListener('submit', async event => {
  event.preventDefault(); $('make').disabled = true; $('error').textContent = '';
  try {
    const response = await fetch('/api/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wish: $('wish').value, place: $('place').value, minutes: Number(document.querySelector('input[name="minutes"]:checked').value) }) });
    const data = await response.json(); if (!response.ok) throw Error(data.error);
    plan = data; $('plan-title').textContent = `${plan.minutes} minutes. Three small discoveries.`;
    $('cues').replaceChildren(...plan.cues.map(cue => { const li = document.createElement('li'), title = document.createElement('h2'), text = document.createElement('p'); title.textContent = cue.title; text.textContent = cue.text; li.append(title, text); return li; }));
    $('note').textContent = plan.note; $('evidence').textContent = `Local MiniLM semantic matching: ${plan.inferenceMs} ms. Scores rank similarity, not certainty.`; show('result');
  } catch (error) { $('error').textContent = error.message; }
  finally { $('make').disabled = false; }
});
$('back').onclick = () => show('setup');
$('print').onclick = () => window.print();
$('begin').onclick = () => { end = Date.now() + plan.minutes * 60000; $('break-cue').textContent = plan.cues.map(c => c.title).join(' / '); show('break'); const tick = () => { const remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000)); $('timer').textContent = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`; if (!remaining) { clearInterval(interval); $('timer').textContent = 'Take your time.'; } }; tick(); interval = setInterval(tick, 1000); };
$('finish').onclick = () => { clearInterval(interval); show('done'); };
$('again').onclick = () => { $('reflection').value = ''; show('setup'); };
