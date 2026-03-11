# AIS Invoice Pro

> **Instant invoice generator for any company or business — free, no sign-up, no backend.**

🔗 **Live Demo:** [https://razinkhan13.github.io/AIS-invoice-pro/](https://razinkhan13.github.io/AIS-invoice-pro/)

---

## ✨ Features

- 🏢 **Company & Client Info** — Enter your company details and client billing address
- 🖼️ **Logo Upload** — Upload your company logo; displayed on the invoice
- 📋 **Dynamic Line Items** — Add/remove rows; quantity × unit price auto-calculates
- 💰 **Configurable Tax & Discount** — Set any tax rate (%) and flat discount ($)
- 🔢 **Auto Invoice Numbering** — Unique invoice number generated on load (editable)
- 📅 **Smart Due Dates** — Due date auto-sets based on payment terms (Net 15/30/60, Due on Receipt)
- 👁️ **Live Preview** — Professional modal preview before printing
- 📄 **Download as PDF** — Uses `window.print()` with polished `@media print` CSS — zero libraries needed
- 📝 **Notes & Terms** — Add custom notes and terms & conditions
- 📱 **Fully Responsive** — Works great on mobile and desktop
- 🆓 **100% Free** — No sign-up, no backend, no cost

---

## 🚀 How to Use

1. **Open** [the live app](https://razinkhan13.github.io/AIS-invoice-pro/)
2. Fill in your **company info** (and optionally upload a logo)
3. Fill in your **client info**
4. Edit the **invoice number**, dates, and payment terms as needed
5. Add **line items** — amounts calculate automatically
6. Adjust **tax rate** and **discount** if needed
7. Add **notes** or **terms & conditions**
8. Click **Preview Invoice** to review, then **Download PDF** to save/print

---

## 🛠️ Deploy Your Own Copy on GitHub Pages

1. **Fork** this repository
2. Go to **Settings → Pages**
3. Under **Source**, select **GitHub Actions**
4. Push any change to `main` — GitHub Actions will auto-deploy
5. Your app will be live at `https://<your-username>.github.io/AIS-invoice-pro/`

---

## 🗂️ Tech Stack

| Technology | Details |
|------------|---------|
| HTML5 | Semantic, accessible markup |
| CSS3 | Custom properties, flexbox, grid, `@media print` |
| JavaScript (ES6+) | Vanilla JS — no frameworks, no build tools |
| Google Fonts | Inter typeface |
| GitHub Pages | Free static hosting via GitHub Actions |

**No npm. No React. No backend. No cost.**

---

## 📁 File Structure

```
/
├── index.html          ← Main application page
├── style.css           ← Styling & print CSS
├── script.js           ← Client-side logic
├── README.md           ← This file
├── LICENSE             ← MIT License
└── .github/
    └── workflows/
        └── static.yml  ← GitHub Pages deployment workflow
```

---

## 📄 License

MIT © 2026 [Razinkhan13](https://github.com/Razinkhan13)
