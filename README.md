# AIS Invoice Pro

**Instant invoice generator for any company or business — 100% free, no signup required.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-4f46e5?style=flat-square&logo=github)](https://razinkhan13.github.io/AIS-invoice-pro/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## ✨ Features

- 🏢 **Company & Client info** — name, address, phone, email, website, logo upload
- 📋 **Dynamic line items** — add/remove rows, auto-calculated amounts
- 💰 **Automatic totals** — subtotal, configurable tax rate, discount, and grand total
- 👁️ **Invoice preview** — professional print-ready modal preview
- 📄 **Download as PDF** — uses `window.print()` with clean `@media print` CSS (no external library)
- 📅 **Smart due dates** — auto-calculated from invoice date + payment terms (Net 15/30/60)
- 🌐 **Multi-currency** — USD, EUR, GBP, JPY, INR, CAD, AUD
- 📱 **Fully responsive** — works on mobile & desktop
- 🆓 **100% free** — no backend, no build step, no login, no ads

---

## 🚀 How to Use

Visit the live app at:

> **https://razinkhan13.github.io/AIS-invoice-pro/**

1. Fill in your **company details** (name, address, logo).
2. Enter your **client's information**.
3. Set the **invoice number**, date, due date, and payment terms.
4. Add **line items** — description, quantity, and unit price.
5. Configure **tax rate** and **discount** if needed.
6. Add any **notes** or **terms & conditions**.
7. Click **Preview Invoice** to see a professional preview.
8. Click **Download PDF** to save the invoice as a PDF via your browser's print dialog.

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| UI         | HTML5, CSS3 (Flexbox, Grid)       |
| Logic      | Vanilla JavaScript (ES2020)       |
| Fonts      | Google Fonts — Inter              |
| Deployment | GitHub Pages (GitHub Actions)     |
| PDF output | `window.print()` + `@media print` |

No frameworks, no npm, no build tools — just pure HTML, CSS, and JavaScript.

---

## 📁 File Structure

```
/
├── index.html               # Main application page
├── style.css                # All styling (responsive + print)
├── script.js                # Client-side logic
├── README.md                # This file
├── LICENSE                  # MIT License
└── .github/
    └── workflows/
        └── static.yml       # GitHub Pages deployment
```

---

## 🏗️ Local Development

No build step required. Just open `index.html` in your browser:

```bash
git clone https://github.com/Razinkhan13/AIS-invoice-pro.git
cd AIS-invoice-pro
open index.html   # macOS
# or: xdg-open index.html  # Linux
# or just drag the file into your browser
```

---

## 📄 License

MIT © 2026 [Razinkhan13](https://github.com/Razinkhan13)