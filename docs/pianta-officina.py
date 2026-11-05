import os
P=os.path.dirname(os.path.abspath(__file__))
S=40; A=3.5; OX,OY=60+A*S,110
def X(m): return OX+m*S
def Y(m): return OY+m*S
D=13.0; HL=21.5; RW=5.0; L=HL+RW
o=[]; a=o.append
W,H=1330,820
a(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="Arial, sans-serif"><rect width="100%" height="100%" fill="#fbfaf7"/>')
a(f'<text x="60" y="44" font-size="26" font-weight="700" fill="#222">Persicar Service · pianta in scala (circa 30 × 13 m)</text>')
a(f'<text x="60" y="74" font-size="16" fill="#666">Metà nord del capannone. Ponti: 2 colonne ≈ 3,5 m, forbice ≈ 2,1 × 5,5 m. Auto ≈ 4,4 × 1,8 m. Portone stimato dalla foto ≈ 5 m.</text>')
a(f'<rect x="{X(-A)}" y="{Y(1.6)}" width="{A*S}" height="{(D-1.6)*S}" fill="#ece7df" stroke="#222" stroke-width="6"/>')
a(f'<line x1="{X(-A)}" y1="{Y(7.0)}" x2="{X(0)}" y2="{Y(7.0)}" stroke="#222" stroke-width="5"/>')
a(f'<text x="{X(-A)+8}" y="{Y(4.2)}" font-size="15" fill="#555">sgabuzzino</text><text x="{X(-A)+8}" y="{Y(10.2)}" font-size="15" fill="#555">bagno</text>')
a(f'<text x="{X(-A)-4}" y="{Y(D)+60}" font-size="14" fill="#888">← palestra (altra metà)</text>')
a(f'<rect x="{X(0)}" y="{Y(0)}" width="{L*S}" height="{D*S}" fill="#efe9e1" stroke="#222" stroke-width="8"/>')
for yy in (5.7,7.4): a(f'<rect x="{X(0)-6}" y="{Y(yy)}" width="12" height="{0.9*S}" fill="#fbfaf7" stroke="#c44" stroke-width="2"/>')
# strumenti nell'angolo in alto a sinistra (muro di fondo e parete sinistra)
for t0,t1 in ((0,7.0),(10.2,13.8)): a(f'<rect x="{X(t0)+4}" y="{Y(0)+4}" width="{(t1-t0)*S-8}" height="{0.6*S}" fill="#a33" opacity="0.55"/>')
a(f'<rect x="{X(5.2)+3}" y="{Y(D-3.2)}" width="{0.7*S}" height="{3.2*S-4}" fill="#a33" opacity="0.55"/>')
a(f'<text x="{X(6.05)}" y="{Y(D-2.4)}" font-size="13" fill="#733">strumenti</text>')
a(f'<rect x="{X(0)+4}" y="{Y(0)+4}" width="{0.6*S}" height="{4.2*S}" fill="#a33" opacity="0.55"/>')
a(f'<text x="{X(0.8)}" y="{Y(1.4)}" font-size="13" fill="#733">strumenti</text>')
# portone piccolo sul muro di fondo verso il giardino interno
g0,g1=7.2,10.0
a(f'<rect x="{X(g0)}" y="{Y(0)-7}" width="{(g1-g0)*S}" height="14" fill="#fbfaf7" stroke="#c44" stroke-width="2"/>')
a(f'<text x="{X(g0)-10}" y="{Y(0)-14}" font-size="14" fill="#444">portone piccolo → giardino interno</text>')
d0,d1=16.0,21.0
a(f'<rect x="{X(d0)}" y="{Y(D)-7}" width="{(d1-d0)*S}" height="14" fill="#fbfaf7"/>')
a(f'<line x1="{X(d0-5)}" y1="{Y(D)+12}" x2="{X(d1)}" y2="{Y(D)+12}" stroke="#c44" stroke-width="4"/>')
a(f'<rect x="{X(d0-5)}" y="{Y(D)+6}" width="{5*S}" height="10" fill="#c44" opacity="0.5"/>')
a(f'<text x="{X(d0)-10}" y="{Y(D)+44}" font-size="18" font-weight="700" fill="#222">PORTONE SCORREVOLE ≈ 5 m</text>')
a(f'<text x="{X(3)}" y="{Y(D)+44}" font-size="15" fill="#666">facciata ovest · piazzale con parcheggio</text>')
rx=HL; g=2.3
a(f'<rect x="{X(rx)}" y="{Y(g)}" width="{RW*S}" height="{(D-g)*S}" fill="#f6efe6" stroke="#222" stroke-width="6"/>')
for yy in (5.4,9.0): a(f'<line x1="{X(rx)}" y1="{Y(yy)}" x2="{X(L)}" y2="{Y(yy)}" stroke="#222" stroke-width="6"/>')
a(f'<rect x="{X(L)-4}" y="{Y(0)}" width="8" height="{D*S}" fill="#222"/>')
a(f'<text x="{X(rx+1.8)}" y="{Y(1.0)}" font-size="13" text-anchor="middle" fill="#555">strumenti + scala a pioli</text><text x="{X(rx+1.8)}" y="{Y(1.6)}" font-size="13" text-anchor="middle" fill="#555">per il sottotetto (gomme)</text>')
a(f'<line x1="{X(rx+4.0)}" y1="{Y(0.2)}" x2="{X(rx+4.0)}" y2="{Y(2.2)}" stroke="#777" stroke-width="3"/><line x1="{X(rx+4.6)}" y1="{Y(0.2)}" x2="{X(rx+4.6)}" y2="{Y(2.2)}" stroke="#777" stroke-width="3"/>')
for k in range(7): a(f'<line x1="{X(rx+4.0)}" y1="{Y(0.35+k*0.28)}" x2="{X(rx+4.6)}" y2="{Y(0.35+k*0.28)}" stroke="#777" stroke-width="2"/>')
a(f'<rect x="{X(rx)-6}" y="{Y(3.4)}" width="12" height="{0.9*S}" fill="#efe9e1" stroke="#c44" stroke-width="2"/>')
a(f'<rect x="{X(rx+2.4)}" y="{Y(9.0)-6}" width="{0.9*S}" height="12" fill="#efe9e1" stroke="#c44" stroke-width="2"/>')
a(f'<rect x="{X(rx)-6}" y="{Y(10.8)}" width="12" height="{1.0*S}" fill="#efe9e1" stroke="#c44" stroke-width="2"/>')
for t,yy in (("SALA ATTESA",4.0),("UFFICIO",7.4),("ACCETTAZIONE",11.3)):
    a(f'<text x="{X(rx+RW/2)}" y="{Y(yy)}" font-size="16" font-weight="700" text-anchor="middle" fill="#333">{t}</text>')
a(f'<text x="{X(rx+RW/2)}" y="{Y(4.6)}" font-size="12" text-anchor="middle" fill="#777">(sopra: sottotetto gomme)</text>')
a(f'<path d="M{X(0.9)} {Y(D-3.2)} H{X(5.2)} V{Y(D)}" stroke="#888" stroke-width="6" fill="none" stroke-dasharray="12 7"/>')
a(f'<text x="{X(1.2)}" y="{Y(D-1.4)}" font-size="15" fill="#666">zona con grata</text>')
a(f'<rect x="{X(14)}" y="{Y(0)+4}" width="{7*S}" height="{0.8*S}" fill="#555" opacity="0.6"/>')
a(f'<text x="{X(14.2)}" y="{Y(1.6)}" font-size="15" fill="#444">postazione gomme</text>')
def car(cx,cy,w,h,nose):
    a(f'<rect x="{X(cx-w/2)}" y="{Y(cy-h/2)}" width="{w*S}" height="{h*S}" rx="12" fill="#fff" stroke="#888" stroke-width="2" stroke-dasharray="6 4"/>')
    if nose=="giu": a(f'<path d="M{X(cx)} {Y(cy+h/2-0.5)+8} l-10 -16 h20z" fill="#777"/>')
    else: a(f'<path d="M{X(cx-w/2+0.5)-9} {Y(cy)} l16 -10 v20z" fill="#777"/>')
def lift2(cx,cy):
    a(f'<rect x="{X(cx-1.75)}" y="{Y(cy-3.2)}" width="{3.5*S}" height="{6.4*S}" fill="none" stroke="#d22" stroke-width="1.5" stroke-dasharray="3 5"/>')
    car(cx,cy,1.8,4.4,"giu")
    for sx in (-1.5,1.5): a(f'<rect x="{X(cx+sx-0.3)}" y="{Y(cy-0.3)}" width="{0.6*S}" height="{0.6*S}" fill="#d22"/>')
lift2(4.9,3.6); lift2(12.0,3.6); lift2(18.4,5.4)
cx,cy=10.6,D-2.0
for dy in (-0.75,0.75): a(f'<rect x="{X(cx-2.75)}" y="{Y(cy+dy-0.3)}" width="{5.5*S}" height="{0.6*S}" fill="#3550c8"/>')
car(cx,cy,4.4,1.8,"sx")
for n,yy in ((1,D+2.4),(2,D-1.2)):
    a(f'<circle cx="{X(18.5)}" cy="{Y(yy)}" r="16" fill="#1fa35c"/><text x="{X(18.5)}" y="{Y(yy)+6}" font-size="15" fill="#fff" text-anchor="middle" font-weight="700">{n}</text>')
y0=Y(D)+150
a(f'<line x1="60" y1="{y0}" x2="{60+5*S}" y2="{y0}" stroke="#222" stroke-width="4"/><text x="60" y="{y0+24}" font-size="15">5 m</text>')
a(f'<g font-size="15" fill="#333"><rect x="{60+7*S}" y="{y0-10}" width="14" height="14" fill="#d22"/><text x="{60+7*S+20}" y="{y0+2}">colonne ponte rosso (3 ponti)</text>')
a(f'<rect x="{60+14*S}" y="{y0-8}" width="40" height="10" fill="#3550c8"/><text x="{60+14*S+48}" y="{y0+2}">pedane forbice</text>')
a(f'<path d="M{60+20*S+8} {y0+4} l-9 -14 h18z" fill="#777"/><text x="{60+20*S+20}" y="{y0+2}">muso auto</text>')
a(f'<circle cx="{60+24.5*S}" cy="{y0-3}" r="9" fill="#1fa35c"/><text x="{60+24.5*S+16}" y="{y0+2}">camera</text></g>')
a('</svg>')
open(P+"/pianta-officina.svg","w").write("\n".join(o))
