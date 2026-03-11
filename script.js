/* ═══════════════════════════════════════════════════
   AIS Invoice Pro — script.js
   Client-side logic: line items, calculations,
   logo upload, preview modal, PDF via window.print()
   ═══════════════════════════════════════════════════ */

'use strict';

/* ── Helpers ── */
const $ = (id) => document.getElementById(id);
const fmt = (n) => '$' + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/* ── State ── */
let logoDataURL = null;

/* ── Invoice Number Auto-Generation ── */
function generateInvoiceNumber() {
  const now = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const rand  = String(Math.floor(Math.random() * 9000) + 1000);
  return `INV-${year}${month}-${rand}`;
}

/* ── Date Helpers ── */
function isoToday() {
  return new Date().toISOString().split('T')[0];
}
function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
function formatDisplayDate(isoDate) {
  if (!isoDate) return '—';
  const [y, m, d] = isoDate.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m,10)-1]} ${parseInt(d,10)}, ${y}`;
}

/* ── Payment Terms → Due Date ── */
function updateDueDateFromTerms() {
  const terms = $('payment-terms').value;
  const invDate = $('invoice-date').value || isoToday();
  const dueField = $('due-date');
  const dayMap = { net_15: 15, net_30: 30, net_60: 60, due_on_receipt: 0 };
  if (terms && dayMap[terms] !== undefined) {
    dueField.value = addDays(invDate, dayMap[terms]);
  }
}

/* ── Line Items ── */
let rowId = 0;

function createRow(desc = '', qty = 1, price = 0) {
  const id = ++rowId;
  const tr = document.createElement('tr');
  tr.dataset.rowId = id;
  tr.innerHTML = `
    <td><input type="text" class="item-desc" placeholder="Item description" value="${escapeAttr(desc)}" aria-label="Description" /></td>
    <td><input type="number" class="item-qty" value="${qty}" min="0" step="any" aria-label="Quantity" /></td>
    <td><input type="number" class="item-price" value="${price}" min="0" step="any" placeholder="0.00" aria-label="Unit Price" /></td>
    <td class="amount-cell" data-amount="0.00">$0.00</td>
    <td>
      <button type="button" class="btn-remove" aria-label="Remove item" title="Remove item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </td>`;

  const qtyInput   = tr.querySelector('.item-qty');
  const priceInput = tr.querySelector('.item-price');
  const descInput  = tr.querySelector('.item-desc');
  const amountCell = tr.querySelector('.amount-cell');
  const removeBtn  = tr.querySelector('.btn-remove');

  function recalcRow() {
    const q = parseFloat(qtyInput.value)   || 0;
    const p = parseFloat(priceInput.value) || 0;
    const amount = q * p;
    amountCell.textContent = fmt(amount);
    amountCell.dataset.amount = amount;
    recalcTotals();
  }

  qtyInput.addEventListener('input', recalcRow);
  priceInput.addEventListener('input', recalcRow);
  removeBtn.addEventListener('click', () => {
    tr.remove();
    recalcTotals();
  });

  recalcRow();
  return tr;
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Totals Calculation ── */
function recalcTotals() {
  const rows = document.querySelectorAll('#items-body tr');
  let subtotal = 0;
  rows.forEach(r => {
    subtotal += parseFloat(r.querySelector('.amount-cell').dataset.amount) || 0;
  });

  const taxRate    = Math.max(0, parseFloat($('tax-rate').value)       || 0);
  const discount   = Math.max(0, parseFloat($('discount-amount').value) || 0);
  const taxAmount  = subtotal * (taxRate / 100);
  const grand      = Math.max(0, subtotal + taxAmount - discount);

  $('subtotal').textContent        = fmt(subtotal);
  $('tax-rate-display').textContent= taxRate;
  $('tax-amount').textContent      = fmt(taxAmount);
  $('discount-display').textContent= '-' + fmt(discount);
  $('grand-total').textContent     = fmt(grand);
}

/* ── Logo Upload ── */
function initLogoUpload() {
  const input   = $('company-logo');
  const preview = $('logo-preview');
  const placeholder = $('logo-placeholder');
  const removeBtn   = $('remove-logo');

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      logoDataURL = e.target.result;
      preview.src = logoDataURL;
      preview.hidden = false;
      placeholder.hidden = true;
      removeBtn.hidden = false;
    };
    reader.readAsDataURL(file);
  });

  removeBtn.addEventListener('click', () => {
    logoDataURL = null;
    preview.src = '';
    preview.hidden = true;
    placeholder.hidden = false;
    removeBtn.hidden = true;
    input.value = '';
  });
}

/* ── Gather Form Data ── */
function getFormData() {
  const rows = [];
  document.querySelectorAll('#items-body tr').forEach(tr => {
    const desc  = tr.querySelector('.item-desc').value.trim();
    const qty   = parseFloat(tr.querySelector('.item-qty').value)   || 0;
    const price = parseFloat(tr.querySelector('.item-price').value) || 0;
    if (desc || qty || price) {
      rows.push({ desc, qty, price, amount: qty * price });
    }
  });

  const taxRate  = Math.max(0, parseFloat($('tax-rate').value)       || 0);
  const discount = Math.max(0, parseFloat($('discount-amount').value) || 0);
  let subtotal   = rows.reduce((s, r) => s + r.amount, 0);
  const taxAmt   = subtotal * (taxRate / 100);
  const grand    = Math.max(0, subtotal + taxAmt - discount);

  return {
    company: {
      name:    $('company-name').value.trim(),
      address: $('company-address').value.trim(),
      city:    $('company-city').value.trim(),
      state:   $('company-state').value.trim(),
      zip:     $('company-zip').value.trim(),
      country: $('company-country').value.trim(),
      phone:   $('company-phone').value.trim(),
      email:   $('company-email').value.trim(),
      website: $('company-website').value.trim(),
    },
    client: {
      name:    $('client-name').value.trim(),
      company: $('client-company').value.trim(),
      address: $('client-address').value.trim(),
      city:    $('client-city').value.trim(),
      state:   $('client-state').value.trim(),
      zip:     $('client-zip').value.trim(),
      country: $('client-country').value.trim(),
      email:   $('client-email').value.trim(),
      phone:   $('client-phone').value.trim(),
    },
    invoice: {
      number:  $('invoice-number').value.trim(),
      date:    $('invoice-date').value,
      dueDate: $('due-date').value,
      terms:   $('payment-terms').options[$('payment-terms').selectedIndex]?.text || '',
    },
    items: rows,
    subtotal, taxRate, taxAmt, discount, grand,
    notes: $('notes').value.trim(),
    termsText: $('terms').value.trim(),
  };
}

/* ── Build Invoice HTML (preview + print) ── */
function buildInvoiceHTML(data) {
  const { company, client, invoice, items, subtotal, taxRate, taxAmt, discount, grand, notes, termsText } = data;

  function addrBlock(obj) {
    const parts = [
      obj.address,
      [obj.city, obj.state, obj.zip].filter(Boolean).join(', '),
      obj.country,
    ].filter(Boolean);
    return parts.map(escapeHtml).join('<br>');
  }

  const logoHTML = logoDataURL
    ? `<img class="inv-logo" src="${logoDataURL}" alt="Company logo" />`
    : '';

  const companyContact = [
    company.phone  ? escapeHtml(company.phone)  : '',
    company.email  ? escapeHtml(company.email)  : '',
    company.website? escapeHtml(company.website): '',
  ].filter(Boolean).join(' &nbsp;·&nbsp; ');

  const itemRows = items.map(r => `
    <tr>
      <td>${escapeHtml(r.desc)}</td>
      <td>${r.qty}</td>
      <td>${fmt(r.price)}</td>
      <td>${fmt(r.amount)}</td>
    </tr>`).join('');

  const taxRowHTML = taxRate > 0
    ? `<div class="inv-total-row">
         <span class="inv-total-label">Tax (${taxRate}%)</span>
         <span class="inv-total-value">${fmt(taxAmt)}</span>
       </div>` : '';

  const discountRowHTML = discount > 0
    ? `<div class="inv-total-row">
         <span class="inv-total-label">Discount</span>
         <span class="inv-total-value" style="color:var(--success)">-${fmt(discount)}</span>
       </div>` : '';

  const notesSection = notes
    ? `<div class="inv-footer-section"><h4>Notes</h4><p>${escapeHtml(notes)}</p></div>` : '';
  const termsSection = termsText
    ? `<div class="inv-footer-section"><h4>Terms &amp; Conditions</h4><p>${escapeHtml(termsText)}</p></div>` : '';
  const footerSections = (notes || termsText)
    ? `<div class="inv-footer-sections">${notesSection}${termsSection}</div>` : '';

  const clientAddr = addrBlock(client);
  const clientContact = [
    client.email ? escapeHtml(client.email) : '',
    client.phone ? escapeHtml(client.phone) : '',
  ].filter(Boolean).join('<br>');

  return `
  <div class="invoice-preview">
    <div class="inv-header">
      <div class="inv-branding">
        ${logoHTML}
        ${company.name ? `<div class="inv-company-name">${escapeHtml(company.name)}</div>` : ''}
        <div class="inv-address">${addrBlock(company)}</div>
        ${companyContact ? `<div class="inv-address" style="margin-top:4px">${companyContact}</div>` : ''}
      </div>
      <div class="inv-title-block">
        <div class="inv-title">Invoice</div>
        <div class="inv-meta">
          <strong># ${escapeHtml(invoice.number || '—')}</strong><br>
          Date: ${formatDisplayDate(invoice.date)}<br>
          Due: ${formatDisplayDate(invoice.dueDate)}<br>
          ${invoice.terms ? `Terms: ${escapeHtml(invoice.terms)}` : ''}
        </div>
      </div>
    </div>

    <div class="inv-info-row">
      <div class="inv-bill-to">
        <div class="inv-section-label">Bill To</div>
        ${client.name    ? `<div class="inv-client-name">${escapeHtml(client.name)}</div>` : ''}
        ${client.company ? `<div class="inv-address">${escapeHtml(client.company)}</div>` : ''}
        ${clientAddr     ? `<div class="inv-address">${clientAddr}</div>` : ''}
        ${clientContact  ? `<div class="inv-address" style="margin-top:4px">${clientContact}</div>` : ''}
      </div>
    </div>

    <table class="inv-items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th style="text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div class="inv-totals-wrap">
      <div class="inv-totals">
        <div class="inv-total-row">
          <span class="inv-total-label">Subtotal</span>
          <span class="inv-total-value">${fmt(subtotal)}</span>
        </div>
        ${taxRowHTML}
        ${discountRowHTML}
        <div class="inv-total-row inv-grand-row">
          <span class="inv-total-label">Total Due</span>
          <span class="inv-total-value">${fmt(grand)}</span>
        </div>
      </div>
    </div>

    ${footerSections}
    <p class="inv-thank-you">Thank you for your business!</p>
  </div>`;
}

/* ── Preview Modal ── */
function showPreview() {
  const data = getFormData();
  const modal = $('preview-modal');
  $('modal-body').innerHTML = buildInvoiceHTML(data);
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  $('modal-close-btn').focus();
}

function closePreview() {
  $('preview-modal').hidden = true;
  document.body.style.overflow = '';
  $('preview-btn').focus();
}

/* ── Print / Download PDF ── */
function printInvoice() {
  const data    = getFormData();
  const modal   = $('preview-modal');
  const wasOpen = !modal.hidden;

  // Make sure preview HTML is populated before printing
  $('modal-body').innerHTML = buildInvoiceHTML(data);
  modal.hidden = false;

  window.print();

  if (!wasOpen) {
    modal.hidden = true;
    document.body.style.overflow = '';
  }
}

/* ── Reset Form ── */
function resetForm() {
  if (!confirm('Reset all fields? This cannot be undone.')) return;

  // Text/email/tel/url/date inputs
  document.querySelectorAll('#invoice-form input:not([type="file"]), #invoice-form select, #invoice-form textarea')
    .forEach(el => {
      if (el.tagName === 'SELECT') { el.selectedIndex = 0; }
      else { el.value = ''; }
    });

  // Logo
  logoDataURL = null;
  const preview     = $('logo-preview');
  const placeholder = $('logo-placeholder');
  const removeBtn   = $('remove-logo');
  preview.src = ''; preview.hidden = true;
  placeholder.hidden = false;
  removeBtn.hidden = true;
  $('company-logo').value = '';

  // Line items: clear body and add fresh row
  $('items-body').innerHTML = '';
  rowId = 0;
  $('items-body').appendChild(createRow());

  // Reset tax / discount
  $('tax-rate').value      = '0';
  $('discount-amount').value = '0';

  // Reinit defaults
  initDefaults();
}

/* ── Initialise Defaults ── */
function initDefaults() {
  $('invoice-number').value = generateInvoiceNumber();
  $('invoice-date').value   = isoToday();
  $('payment-terms').value  = 'net_30';
  updateDueDateFromTerms();
}

/* ── Bootstrap ── */
document.addEventListener('DOMContentLoaded', () => {
  // Init defaults
  initDefaults();

  // Add first blank row
  $('items-body').appendChild(createRow());

  // Logo upload
  initLogoUpload();

  // Add item
  $('add-item-btn').addEventListener('click', () => {
    const row = createRow();
    $('items-body').appendChild(row);
    row.querySelector('.item-desc').focus();
  });

  // Tax / Discount change
  $('tax-rate').addEventListener('input', recalcTotals);
  $('discount-amount').addEventListener('input', recalcTotals);

  // Payment terms → due date
  $('payment-terms').addEventListener('change', updateDueDateFromTerms);
  $('invoice-date').addEventListener('change', updateDueDateFromTerms);

  // Actions
  $('preview-btn').addEventListener('click', showPreview);
  $('download-btn').addEventListener('click', printInvoice);
  $('reset-btn').addEventListener('click', resetForm);

  // Modal close
  $('modal-close-btn').addEventListener('click', closePreview);
  $('modal-backdrop').addEventListener('click', closePreview);
  $('modal-print-btn').addEventListener('click', printInvoice);

  // Keyboard: Escape closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('preview-modal').hidden) {
      closePreview();
    }
  });
});
