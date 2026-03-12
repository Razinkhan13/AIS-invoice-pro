'use strict';

// ─── State ──────────────────────────────────────────────────
let lineItems = [];
let logoDataUrl = '';
let lineItemCounter = 0;

// ─── Helpers ────────────────────────────────────────────────
function formatCurrency(amount) {
  const sym = document.getElementById('currency').value || '$';
  return sym + parseFloat(amount || 0).toFixed(2);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function generateInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const seq  = String(Math.floor(Math.random() * 900) + 100);
  return `INV-${year}-${seq}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Line Items ──────────────────────────────────────────────
function createLineItem() {
  return { id: ++lineItemCounter, description: '', qty: 1, price: 0 };
}

function getAmount(item) {
  return (parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0);
}

function renderLineItems() {
  const tbody = document.getElementById('lineItemsBody');
  tbody.innerHTML = '';
  lineItems.forEach((item) => {
    const amount = getAmount(item);
    const tr = document.createElement('tr');
    tr.dataset.id = item.id;
    tr.innerHTML = `
      <td>
        <input type="text"
          class="item-desc"
          placeholder="Service or product description"
          value="${escapeHtml(item.description)}"
          aria-label="Item description" />
      </td>
      <td>
        <input type="number"
          class="item-qty"
          value="${item.qty}"
          min="0"
          step="1"
          style="max-width:5rem"
          aria-label="Quantity" />
      </td>
      <td>
        <input type="number"
          class="item-price"
          value="${item.price}"
          min="0"
          step="0.01"
          style="max-width:7rem"
          aria-label="Unit price" />
      </td>
      <td class="amount-cell">${formatCurrency(amount)}</td>
      <td style="text-align:right">
        <button type="button" class="btn btn-danger remove-item-btn"
          aria-label="Remove item" title="Remove item">
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </button>
      </td>`;
    tbody.appendChild(tr);
  });
  updateTotals();
}

function updateTotals() {
  const subtotal  = lineItems.reduce((sum, it) => sum + getAmount(it), 0);
  const taxRate   = parseFloat(document.getElementById('taxRate').value) || 0;
  const discount  = parseFloat(document.getElementById('discountAmount').value) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const grand     = Math.max(0, subtotal + taxAmount - discount);

  const sym = document.getElementById('currency').value || '$';

  document.getElementById('subtotalDisplay').textContent   = sym + subtotal.toFixed(2);
  document.getElementById('taxRateDisplay').textContent    = taxRate;
  document.getElementById('taxAmountDisplay').textContent  = sym + taxAmount.toFixed(2);
  document.getElementById('discountDisplay').textContent   = '-' + sym + discount.toFixed(2);
  document.getElementById('grandTotalDisplay').textContent = sym + grand.toFixed(2);
}

// ─── Event Delegation for Line Items ────────────────────────
document.getElementById('lineItemsBody').addEventListener('input', (e) => {
  const tr = e.target.closest('tr[data-id]');
  if (!tr) return;
  const id   = parseInt(tr.dataset.id, 10);
  const item = lineItems.find((i) => i.id === id);
  if (!item) return;

  if (e.target.classList.contains('item-desc')) {
    item.description = e.target.value;
    return;
  }
  if (e.target.classList.contains('item-qty')) {
    item.qty = e.target.value;
  } else if (e.target.classList.contains('item-price')) {
    item.price = e.target.value;
  }
  // Update the amount cell for this row only
  const amountCell = tr.querySelector('.amount-cell');
  if (amountCell) amountCell.textContent = formatCurrency(getAmount(item));
  updateTotals();
});

document.getElementById('lineItemsBody').addEventListener('click', (e) => {
  const btn = e.target.closest('.remove-item-btn');
  if (!btn) return;
  const tr = btn.closest('tr[data-id]');
  if (!tr) return;
  const id = parseInt(tr.dataset.id, 10);
  lineItems = lineItems.filter((i) => i.id !== id);
  renderLineItems();
});

document.getElementById('addItemBtn').addEventListener('click', () => {
  lineItems.push(createLineItem());
  renderLineItems();
  // Focus the new description input
  const rows = document.querySelectorAll('#lineItemsBody tr');
  const lastRow = rows[rows.length - 1];
  if (lastRow) lastRow.querySelector('.item-desc').focus();
});

// ─── Totals re-calc on input ──────────────────────────────
document.getElementById('taxRate').addEventListener('input', updateTotals);
document.getElementById('discountAmount').addEventListener('input', updateTotals);
document.getElementById('currency').addEventListener('change', () => renderLineItems());

// ─── Payment Terms → Due Date ────────────────────────────
function recalcDueDate() {
  const terms    = document.getElementById('paymentTerms').value;
  const invDate  = document.getElementById('invoiceDate').value;
  if (!invDate) return;
  if (terms === 'custom') return;
  const days = parseInt(terms, 10);
  document.getElementById('dueDate').value = addDays(invDate, days);
}

document.getElementById('paymentTerms').addEventListener('change', recalcDueDate);
document.getElementById('invoiceDate').addEventListener('change', recalcDueDate);

// ─── Logo Upload ─────────────────────────────────────────
document.getElementById('logoUpload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    logoDataUrl = ev.target.result;
    const preview = document.getElementById('logoPreview');
    const placeholder = document.getElementById('logoPlaceholder');
    const removebtn = document.getElementById('removeLogo');
    preview.src = logoDataUrl;
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');
    removebtn.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

document.getElementById('removeLogo').addEventListener('click', () => {
  logoDataUrl = '';
  document.getElementById('logoPreview').src = '';
  document.getElementById('logoPreview').classList.add('hidden');
  document.getElementById('logoPlaceholder').classList.remove('hidden');
  document.getElementById('removeLogo').classList.add('hidden');
  document.getElementById('logoUpload').value = '';
});

// ─── Build Invoice Preview HTML ──────────────────────────
function buildPreview() {
  const sym = document.getElementById('currency').value || '$';

  // Company
  const companyName    = document.getElementById('companyName').value.trim();
  const companyEmail   = document.getElementById('companyEmail').value.trim();
  const companyPhone   = document.getElementById('companyPhone').value.trim();
  const companyWebsite = document.getElementById('companyWebsite').value.trim();
  const companyAddress = document.getElementById('companyAddress').value.trim();
  const companyCity    = document.getElementById('companyCity').value.trim();
  const companyState   = document.getElementById('companyState').value.trim();
  const companyZip     = document.getElementById('companyZip').value.trim();
  const companyCountry = document.getElementById('companyCountry').value.trim();

  // Client
  const clientName    = document.getElementById('clientName').value.trim();
  const clientCompany = document.getElementById('clientCompany').value.trim();
  const clientEmail   = document.getElementById('clientEmail').value.trim();
  const clientPhone   = document.getElementById('clientPhone').value.trim();
  const clientAddress = document.getElementById('clientAddress').value.trim();
  const clientCity    = document.getElementById('clientCity').value.trim();
  const clientState   = document.getElementById('clientState').value.trim();
  const clientZip     = document.getElementById('clientZip').value.trim();
  const clientCountry = document.getElementById('clientCountry').value.trim();

  // Invoice meta
  const invoiceNumber  = document.getElementById('invoiceNumber').value.trim();
  const invoiceDate    = document.getElementById('invoiceDate').value;
  const dueDate        = document.getElementById('dueDate').value;
  const poNumber       = document.getElementById('poNumber').value.trim();
  const taxRate        = parseFloat(document.getElementById('taxRate').value) || 0;
  const discount       = parseFloat(document.getElementById('discountAmount').value) || 0;
  const notes          = document.getElementById('invoiceNotes').value.trim();
  const terms          = document.getElementById('invoiceTerms').value.trim();

  // Logo
  const invLogo = document.getElementById('invLogo');
  if (logoDataUrl) {
    invLogo.src = logoDataUrl;
    invLogo.classList.remove('hidden');
  } else {
    invLogo.src = '';
    invLogo.classList.add('hidden');
  }

  // Company name & address
  document.getElementById('invCompanyName').textContent = companyName || 'Your Company';
  const addrParts = [
    companyAddress,
    [companyCity, companyState, companyZip].filter(Boolean).join(', '),
    companyCountry,
    companyPhone,
    companyEmail,
    companyWebsite,
  ].filter(Boolean);
  document.getElementById('invCompanyAddress').textContent = addrParts.join('\n');

  // Invoice meta
  document.getElementById('invNumber').textContent  = invoiceNumber;
  document.getElementById('invDate').textContent    = formatDate(invoiceDate);
  document.getElementById('invDueDate').textContent = formatDate(dueDate);

  const poRow = document.getElementById('invPoRow');
  if (poNumber) {
    document.getElementById('invPoNumber').textContent = poNumber;
    poRow.classList.remove('hidden');
  } else {
    poRow.classList.add('hidden');
  }

  // Client info
  const clientParts = [
    clientName,
    clientCompany,
    clientAddress,
    [clientCity, clientState, clientZip].filter(Boolean).join(', '),
    clientCountry,
    clientEmail,
    clientPhone,
  ].filter(Boolean);
  document.getElementById('invClientInfo').textContent = clientParts.join('\n');

  // Line items
  const invBody = document.getElementById('invItemsBody');
  invBody.innerHTML = '';
  lineItems.forEach((item) => {
    const amount = getAmount(item);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(item.description || '(No description)')}</td>
      <td class="inv-td-qty">${parseFloat(item.qty) || 0}</td>
      <td class="inv-td-price">${sym}${parseFloat(item.price || 0).toFixed(2)}</td>
      <td class="inv-td-amount">${sym}${amount.toFixed(2)}</td>`;
    invBody.appendChild(tr);
  });

  // Totals
  const subtotal  = lineItems.reduce((sum, it) => sum + getAmount(it), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const grand     = Math.max(0, subtotal + taxAmount - discount);

  document.getElementById('invSubtotal').textContent  = sym + subtotal.toFixed(2);
  document.getElementById('invTaxRateLabel').textContent = taxRate;
  document.getElementById('invTaxAmount').textContent  = sym + taxAmount.toFixed(2);
  document.getElementById('invDiscount').textContent   = '-' + sym + discount.toFixed(2);
  document.getElementById('invGrandTotal').textContent = sym + grand.toFixed(2);

  // Show/hide tax & discount rows
  document.getElementById('invTaxRow').classList.toggle('hidden', taxRate === 0);
  document.getElementById('invDiscountRow').classList.toggle('hidden', discount === 0);

  // Notes & terms
  const notesSection = document.getElementById('invNotesSection');
  const termsSection = document.getElementById('invTermsSection');
  if (notes) {
    document.getElementById('invNotesText').textContent = notes;
    notesSection.classList.remove('hidden');
  } else {
    notesSection.classList.add('hidden');
  }
  if (terms) {
    document.getElementById('invTermsText').textContent = terms;
    termsSection.classList.remove('hidden');
  } else {
    termsSection.classList.add('hidden');
  }
}

// ─── Modal ───────────────────────────────────────────────
document.getElementById('previewBtn').addEventListener('click', () => {
  buildPreview();
  document.getElementById('previewModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
});

function closeModal() {
  document.getElementById('previewModal').classList.add('hidden');
  document.body.style.overflow = '';
}

document.getElementById('closeModal').addEventListener('click', closeModal);

document.getElementById('previewModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ─── Print / PDF ─────────────────────────────────────────
document.getElementById('printBtn').addEventListener('click', () => {
  window.print();
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  buildPreview();
  document.getElementById('previewModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  // Small delay to allow the modal to render before printing
  setTimeout(() => window.print(), 150);
});

// ─── Reset ───────────────────────────────────────────────
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Reset the form? All data will be cleared.')) return;

  // Text/email/tel/url/date inputs & textareas
  document.querySelectorAll('input:not([type=file]), select, textarea').forEach((el) => {
    if (el.tagName === 'SELECT') {
      el.selectedIndex = 0;
    } else {
      el.value = '';
    }
  });

  // Re-init defaults
  document.getElementById('invoiceNumber').value = generateInvoiceNumber();
  document.getElementById('invoiceDate').value   = todayISO();
  document.getElementById('paymentTerms').value  = '30';
  document.getElementById('taxRate').value       = '0';
  document.getElementById('discountAmount').value = '0';
  recalcDueDate();

  // Logo
  logoDataUrl = '';
  document.getElementById('logoPreview').src = '';
  document.getElementById('logoPreview').classList.add('hidden');
  document.getElementById('logoPlaceholder').classList.remove('hidden');
  document.getElementById('removeLogo').classList.add('hidden');
  document.getElementById('logoUpload').value = '';

  // Line items
  lineItems = [];
  lineItems.push(createLineItem());
  renderLineItems();
});

// ─── Init ────────────────────────────────────────────────
function init() {
  document.getElementById('invoiceNumber').value = generateInvoiceNumber();
  document.getElementById('invoiceDate').value   = todayISO();
  document.getElementById('paymentTerms').value  = '30';
  recalcDueDate();

  // Add one blank line item to start
  lineItems.push(createLineItem());
  renderLineItems();
}

init();
