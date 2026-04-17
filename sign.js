// Compliance register signing flow.
(function () {
  const $ = (s) => document.querySelector(s);

  const CFG = window.HANDBOOK_CONFIG || {};
  const QUEUE_KEY = 'fg_compliance_queue_v1';

  // Open/close the sign view
  function openSign() {
    closeAll();
    $('#sign').classList.add('active');
    $('#signError').hidden = true;
    $('#signForm').reset();
    $('#submitSign').disabled = false;
    $('#submitSign').textContent = 'Sign & submit';
    tickStamp();
    window.scrollTo(0, 0);
    history.replaceState({}, '', '#sign');
  }

  function closeAll() {
    ['home', 'sign', 'signDone', 'reader'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
  }

  function backToHome() {
    closeAll();
    $('#home').classList.add('active');
    window.scrollTo(0, 0);
    history.replaceState({}, '', '#');
  }

  // Live clock on the sign form
  let stampTimer = null;
  function tickStamp() {
    const el = $('#stampText');
    if (!el) return;
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    el.textContent = fmt.format(now) + ' UK';
    clearTimeout(stampTimer);
    stampTimer = setTimeout(tickStamp, 1000);
  }

  // Submit handler
  async function onSubmit(e) {
    e.preventDefault();
    const name = $('#fullName').value.trim();
    const empId = $('#employeeId').value.trim();
    const ack = $('#ack').checked;
    const err = $('#signError');
    err.hidden = true;

    if (!name) return showErr('Please enter your full name.');
    if (!ack) return showErr('Please tick the box to confirm you have read and understood the handbook.');

    const btn = $('#submitSign');
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    const payload = {
      name,
      employeeId: empId,
      acknowledged: true,
      handbookVersion: CFG.handbookVersion || 'FG1.0',
      userAgent: navigator.userAgent,
      pageUrl: location.href,
      clientTimestamp: new Date().toISOString(),
    };

    // Generate a local certificate ID in case we're offline / endpoint not set
    const localCertId = 'FG-' + genId();
    const ukStamp = ukTimestamp(new Date());

    let result = { ok: false };
    if (CFG.complianceEndpoint) {
      try {
        const res = await fetch(CFG.complianceEndpoint, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight on Apps Script
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          result = Object.assign({ ok: true }, data);
        }
      } catch (_) {
        // network error -> queue
      }
    }

    const certId = result.certificateId || localCertId;
    const timestampUk = result.timestampUk || ukStamp;
    const isQueued = !result.ok;

    if (isQueued) {
      queueSubmission(payload);
    }

    // Persist last cert locally for re-download
    const record = {
      name,
      employeeId: empId,
      certId,
      timestampUk,
      handbookVersion: payload.handbookVersion,
      queued: isQueued,
    };
    try { localStorage.setItem('fg_last_certificate', JSON.stringify(record)); } catch (_) {}

    showDone(record);
  }

  function showErr(msg) {
    const err = $('#signError');
    err.textContent = msg;
    err.hidden = false;
    const btn = $('#submitSign');
    btn.disabled = false;
    btn.textContent = 'Sign & submit';
  }

  function showDone(record) {
    closeAll();
    $('#signDone').classList.add('active');
    $('#doneName').textContent = record.name + (record.employeeId ? ' · ' + record.employeeId : '');
    $('#doneTime').textContent = record.timestampUk;
    $('#doneCert').textContent = record.certId;
    $('#doneMsg').textContent = record.queued
      ? 'Your acknowledgement is saved on this device.'
      : 'Your acknowledgement has been recorded in the Fox Group register.';
    $('#offlineNote').hidden = !record.queued;
    window.scrollTo(0, 0);
    history.replaceState({}, '', '#signed');
  }

  // Queue offline submissions
  function queueSubmission(p) {
    try {
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      q.push(p);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    } catch (_) {}
  }

  async function flushQueue() {
    if (!CFG.complianceEndpoint || !navigator.onLine) return;
    let q = [];
    try { q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch (_) { return; }
    if (!q.length) return;
    const remaining = [];
    for (const item of q) {
      try {
        const res = await fetch(CFG.complianceEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(item),
        });
        if (!res.ok) remaining.push(item);
      } catch (_) {
        remaining.push(item);
      }
    }
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  }

  function ukTimestamp(d) {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
    const parts = Object.fromEntries(fmt.formatToParts(d).filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
    return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} UK`;
  }

  function genId() {
    return Math.random().toString(36).slice(2, 10).toUpperCase();
  }

  // Certificate PDF generator (jsPDF)
  function downloadCertificate() {
    const rec = JSON.parse(localStorage.getItem('fg_last_certificate') || 'null');
    if (!rec) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();

    // Header bar
    doc.setFillColor(15, 26, 61);
    doc.rect(0, 0, W, 90, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(28);
    doc.text('FOX', 40, 58);
    doc.setFillColor(245, 155, 30);
    doc.triangle(118, 22, 215, 55, 118, 88, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(14);
    doc.text('GROUP', 132, 60);

    doc.setTextColor(15, 26, 61);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(24);
    doc.text('Certificate of Compliance', 40, 150);

    doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
    doc.setTextColor(90, 98, 126);
    doc.text('Wagon Fitters Handbook — Compliance Register', 40, 172);

    // Body
    doc.setTextColor(20, 25, 48);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
    const body = doc.splitTextToSize(
      'This is to certify that the individual named below has read, understood and agreed to abide by all 42 risk assessments set out in the Fox Group Wagon Fitters Handbook. The acknowledgement was submitted electronically to the Fox Group compliance register at the date and time stated.',
      W - 80
    );
    doc.text(body, 40, 210);

    // Details block
    const y0 = 290;
    doc.setDrawColor(227, 230, 239);
    doc.setLineWidth(1);
    doc.roundedRect(40, y0, W - 80, 190, 8, 8);

    const rows = [
      ['Name',             rec.name],
      ['Employee ID',      rec.employeeId || '—'],
      ['Date and time',    rec.timestampUk],
      ['Handbook version', rec.handbookVersion || 'FG1.0 (January 2025)'],
      ['Certificate ID',   rec.certId],
      ['Status',           rec.queued ? 'Saved on device — pending sync' : 'Recorded in Fox Group register'],
    ];
    doc.setFontSize(11);
    rows.forEach((r, i) => {
      const y = y0 + 30 + i * 26;
      doc.setTextColor(107, 116, 147); doc.setFont('helvetica', 'normal');
      doc.text(r[0], 60, y);
      doc.setTextColor(20, 25, 48); doc.setFont('helvetica', 'bold');
      doc.text(String(r[1]), 220, y);
    });

    // Signature line
    doc.setDrawColor(15, 26, 61);
    doc.setLineWidth(0.8);
    doc.line(40, 540, 280, 540);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.setTextColor(107, 116, 147);
    doc.text('Signed (electronic acknowledgement)', 40, 556);

    doc.line(W - 280, 540, W - 40, 540);
    doc.text('Fox Group — FoxSafe Health & Safety Team', W - 280, 556);

    // Footer
    doc.setFillColor(15, 26, 61);
    doc.rect(0, doc.internal.pageSize.getHeight() - 50, W, 50, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(9);
    doc.text('Fox Group · foxsafe health & safety · Prepared by Derick Bibby · Reviewed by Lee Hardy', 40, doc.internal.pageSize.getHeight() - 22);

    const safeName = (rec.name || 'signature').replace(/[^a-z0-9\- ]/gi, '_').trim().replace(/\s+/g, '_');
    doc.save(`Fox_Group_Compliance_${safeName}_${rec.certId}.pdf`);
  }

  // Hook up events when DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    $('#openSignBtn')?.addEventListener('click', openSign);
    $('#signBack')?.addEventListener('click', backToHome);
    $('#doneHome')?.addEventListener('click', backToHome);
    $('#downloadCert')?.addEventListener('click', downloadCertificate);
    $('#signForm')?.addEventListener('submit', onSubmit);

    if (location.hash === '#sign') setTimeout(openSign, 50);

    // Try to flush any queued submissions
    flushQueue();
    window.addEventListener('online', flushQueue);
  });
})();
