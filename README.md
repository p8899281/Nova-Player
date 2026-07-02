# Nova Player — Text File theke Video/PDF Player

Ei project ta ekta **static website** — GitHub + Vercel diye free e host kora jay.
Kono backend/server lagbe na. Sob kichu browser er moddheই hoy.

কী করে:
- Ekta `.txt` file open korle, tar moddhe thaka **video** o **PDF** link গুলো আলাদা করে দুইটা list e দেখায় (tabs: 🎬 Videos / 📄 PDFs)
- Upore search box দিয়ে naam diye khoja jay — jei list e active tab ache, sekhane matching result গুলোই দেখাবে
- Video তে click korle nice e player e play hoye jabe (mp4 o .m3u8/HLS dutai support kore)
- PDF এ click korle সরাসরি download hoye jabe (jodi source server CORS block na kore, note ta niche dekho)

---

## 1. Files গুলো কী কী

| File | Kaj |
|---|---|
| `index.html` | Page er structure |
| `style.css` | Design/theme (dark, gradient) |
| `app.js` | Text file parse kora, search, video play, pdf download — sob logic |
| `sample-list.txt` | Example — kivabe text file lekhte hobe tar demo |
| `README.md` | Ei guide |

Sob কটা file same repo-র **root** e thakte hobe (kono subfolder er dorkar nei).

---

## 2. Text file (`.txt`) kivabe lekhben

Sob theke simple format:

```
Video Name Here :: https://your-link.com/video.mp4
PDF Name Here :: https://your-link.com/file.pdf
```

Chaile section header o diye group kore likhte paren (optional):

```
[VIDEOS]
Reas (VOD) - Class-10 | Pair Formation :: https://example.com/pair-formation.mp4
Reas (VOD) - Counting Figures 25 :: https://example.com/counting-figures-25.m3u8

[PDFS]
Reas (VOD) - Counting Figures | 25 :: https://example.com/counting-figures-25.pdf
Reas (VOD) - Counting Figures | 24 :: https://example.com/counting-figures-24.pdf
```

**Note:**
- `[VIDEOS]` / `[PDFS]` header na dile o cholbe — link er extension dekhe (`.pdf` hole PDF, na hole video) automatic bujhe নেবে।
- Name ar link er majhe `::` na diye `|`, `-`, `,` — jetai daan, script link-টা খুঁজে বাকি অংশটাকে naam হিসেবে নেবে।
- Ekta `.txt` file e hajar hajar line thakleo problem nei, search box diye khoja jabe.
- Example dekhar jonno `sample-list.txt` file ta open kore dekho.

---

## 3. GitHub e repo banano

1. [github.com](https://github.com) e giye login/signup koro (na thakle account free e khola jay).
2. Upore-dane **+** icon → **New repository** click koro.
3. Repository name dao (jemon: `nova-player`), **Public** rekhe **Create repository** click koro.
4. Repo-r page e **"uploading an existing file"** link ta click koro (ba **Add file → Upload files**).
5. Ei 5-ta file (`index.html`, `style.css`, `app.js`, `sample-list.txt`, `README.md`) drag-drop kore upload koro.
6. Niche **Commit changes** button e click kore save koro.

*(Chaile git command line diyeও push korte paro, kintu upore-r web-UI method-e kono coding jana lagbe na.)*

---

## 4. Vercel e deploy kora

1. [vercel.com](https://vercel.com) e giye **"Continue with GitHub"** diye login koro (same GitHub account diye).
2. Dashboard e **Add New... → Project** click koro.
3. Just-e banano `nova-player` repo ta list e dekhabe — tar পাশে **Import** click koro.
4. Framework Preset e **"Other"** thakbe (static site bole build-command/output kichu lagbe na) — kichu na chuiye just **Deploy** click koro.
5. 30-40 second wait korle ekta live link pabe, jemon: `nova-player-yourname.vercel.app`
6. Ei link ta ekhon jekono jaygay (mobile/laptop, jekono browser) e open korle tomar player ta chole ashbe.

Future e jodi kono file update koro, GitHub repo te notun version upload/commit korlei Vercel automatic re-deploy kore dey.

---

## 5. Kivabe use korben (deploy howar por)

1. Live link (`...vercel.app`) open koro.
2. Upore **Open File** button e click kore tomar banano `.txt` file ta select koro.
3. Niche-dane status strip e dekhabe koyta video ar koyta pdf paoa gyeche.
4. **🎬 Videos** / **📄 PDFs** tab change kore dekhte paro.
5. Search box e naam likhle, active tab er moddhe matching result-i thakbe.
6. Video row e click korle bame player e play hobe.
7. PDF row e click korle file-ta download hoye jabe.

---

## 6. Note / Limitation

- **PDF download**: browser theke direct download korার jonno source server-ke CORS allow korte hoy. Onek server (jemon Google Drive, kichu CDN) eta block kore rakhe — em kono link hole PDF-ta notun tab e open hobe, sekhan theke manually **Ctrl+S / Cmd+S** diye save korte hobe. Ei fallback already code-e set kora ache.
- **Video (.m3u8/HLS)**: `hls.js` library CDN theke automatic load hoy, tai internet connection lagbe (deploy kora site-eও, karon eta CDN theke asche, tomar repo-r bhitor rakhar dorkar nei).
- Design/color/logo/naam sob `style.css` ar `index.html` e simple text change kore customize kora jay.

Kono জায়গায় আটকে গেলে বা design change korte chaile bolo, sathe sathe update kore debo.
