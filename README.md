# Persicar Service – sito web

Sito one-page statico (HTML/CSS/JS, nessuna build) per Persicar Service Autofficina, Via Cento 60, San Giovanni in Persiceto (BO).

- `index.html`: pagina e dati SEO (schema.org `AutoRepair`)
- `assets/css/style.css`: stile (colori del logo: nero, bianco, verde e rosso)
- `assets/js/main.js`: configurazione (numero WhatsApp, immagini), stato "aperto ora", animazioni GSAP e Lenis
- `assets/js/brake.js`: impianto frenante 3D (Three.js) che si scompone allo scroll
- `assets/vendor/`: librerie locali (three 0.160, gsap 3.12.5, lenis 1.1.13)

## Anteprima
```
python3 -m http.server 8000
```
Poi apri http://localhost:8000.

## Da completare
- Foto reali dell'officina: sostituire i file in `assets/img/` mantenendo lo stesso nome
