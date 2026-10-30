#!/usr/bin/env python3
"""Build the "pelican on a bicycle" illustration (SVG).

Run:  python3 tools/build_pelican.py > pelican.svg
"""
import math

INK = "#3B3530"
W, H = 800, 600
GROUND_Y = 470

out = []
a = out.append


def spokes(cx, cy, r_in, r_out, n=14, color="#BEB4A5", width=3):
    parts = []
    for i in range(n):
        ang = 2 * math.pi * i / n
        x1, y1 = cx + r_in * math.cos(ang), cy + r_in * math.sin(ang)
        x2, y2 = cx + r_out * math.cos(ang), cy + r_out * math.sin(ang)
        parts.append(
            f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
            f'stroke="{color}" stroke-width="{width}" stroke-linecap="round"/>'
        )
    return "\n      ".join(parts)


def wheel(cx, cy, r=88):
    return f"""<g>
      <circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{INK}" stroke-width="15"/>
      <circle cx="{cx}" cy="{cy}" r="{r-9}" fill="none" stroke="#F7EFE2" stroke-width="6"/>
      {spokes(cx, cy, 14, r - 14)}
      <circle cx="{cx}" cy="{cy}" r="13" fill="#F7EFE2" stroke="{INK}" stroke-width="4"/>
      <circle cx="{cx}" cy="{cy}" r="4" fill="{INK}"/>
    </g>"""


def foot(x, y, angle, s=1.0, color="#F2A23C"):
    """Webbed pelican foot, ankle at (x, y), toes pointing +x."""
    return f"""<g transform="translate({x} {y}) rotate({angle}) scale({s})">
      <path d="M -8 -7 C -10 -2 -9 4 -4 7 C 3 10 14 9 24 5 L 28 1 L 24 -2 C 15 -6 3 -9 -8 -7 Z"
            fill="{color}" stroke="{INK}" stroke-width="3.2" stroke-linejoin="round"/>
      <path d="M 2 -6 L 12 4 M 10 -5 L 20 3" fill="none" stroke="{INK}" stroke-width="2.2"
            stroke-linecap="round" opacity="0.65"/>
    </g>"""


a(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="Pelican riding a bicycle">
  <title>Pelican on a bicycle</title>
  <desc>A white pelican with an orange beak and a red scarf rides a teal bicycle at sunset.</desc>
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFEDD0"/>
      <stop offset="0.6" stop-color="#FFDCB6"/>
      <stop offset="1" stop-color="#FFCBA6"/>
    </linearGradient>
    <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#EEDCBC"/>
      <stop offset="1" stop-color="#DAC29E"/>
    </linearGradient>
    <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FFD288" stop-opacity="0.95"/>
      <stop offset="0.7" stop-color="#FFCE84" stop-opacity="0.4"/>
      <stop offset="1" stop-color="#FFCE84" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bodyGrad" x1="0.1" y1="0" x2="0.75" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#F5E8DA"/>
    </linearGradient>
    <linearGradient id="beakGrad" x1="0" y1="0" x2="1" y2="0.4">
      <stop offset="0" stop-color="#FFBE5C"/>
      <stop offset="1" stop-color="#F39A28"/>
    </linearGradient>
    <clipPath id="card"><rect x="0" y="0" width="{W}" height="{H}" rx="34"/></clipPath>
  </defs>

  <g clip-path="url(#card)">
    <!-- ================= background ================= -->
    <rect width="{W}" height="{H}" fill="url(#sky)"/>
    <circle cx="640" cy="158" r="158" fill="url(#sunGlow)"/>
    <circle cx="640" cy="158" r="74" fill="#FFC97C"/>
    <circle cx="640" cy="158" r="74" fill="none" stroke="#FFB65F" stroke-width="3" opacity="0.45"/>

    <path d="M -30 472 C 90 372 214 372 330 472 Z" fill="#BFD3C0"/>
    <path d="M 236 472 C 372 356 520 372 664 472 Z" fill="#A9C4B2"/>
    <path d="M 560 472 C 664 396 754 404 832 472 Z" fill="#B9CFBC"/>

    <rect x="0" y="{GROUND_Y}" width="{W}" height="{H - GROUND_Y}" fill="url(#groundGrad)"/>
    <path d="M0 {GROUND_Y} H{W}" stroke="#C8AE8A" stroke-width="3" opacity="0.7"/>
    <path d="M 40 552 h 90 M 168 552 h 54 M 470 572 h 120 M 640 548 h 96"
          stroke="#C8AE8A" stroke-width="5" stroke-linecap="round" opacity="0.5"/>

    <ellipse cx="424" cy="518" rx="268" ry="16" fill="#B99B74" opacity="0.26"/>

    <!-- ================= wheels ================= -->
    {wheel(282, 424, 88)}
    {wheel(556, 424, 88)}

    <!-- chain -->
    <path d="M 432 406 L 282 412" stroke="#6E6357" stroke-width="5" stroke-linecap="round"/>
    <path d="M 432 452 L 282 438" stroke="#6E6357" stroke-width="5" stroke-linecap="round"/>
    <circle cx="282" cy="424" r="15" fill="#C7BCAD" stroke="{INK}" stroke-width="4"/>

    <!-- ================= far side drivetrain + far leg ================= -->
    <line x1="432" y1="428" x2="392" y2="454" stroke="{INK}" stroke-width="12" stroke-linecap="round"/>
    <line x1="432" y1="428" x2="392" y2="454" stroke="#6B6154" stroke-width="7" stroke-linecap="round"/>
    <rect x="374" y="447" width="36" height="13" rx="6" transform="rotate(6 392 453)"
          fill="#5B5348" stroke="{INK}" stroke-width="3"/>
    <path d="M 382 286 C 392 320 396 356 394 386 C 393 410 394 424 396 438"
          fill="none" stroke="{INK}" stroke-width="16" stroke-linecap="round"/>
    <path d="M 382 286 C 392 320 396 356 394 386 C 393 410 394 424 396 438"
          fill="none" stroke="#D98A2C" stroke-width="10" stroke-linecap="round"/>
    {foot(396, 440, 0, 0.94, "#D98A2C")}

    <!-- ================= frame ================= -->
    <g fill="none" stroke-linecap="round">
      <g stroke="{INK}" stroke-width="16">
        <path d="M 432 428 L 352 302"/>
        <path d="M 432 428 L 541 332"/>
        <path d="M 354 300 L 534 296"/>
        <path d="M 432 428 L 282 424"/>
        <path d="M 352 302 L 282 424"/>
        <path d="M 556 344 L 556 424"/>
        <path d="M 534 296 L 556 344"/>
      </g>
      <g stroke="#2E6F6A" stroke-width="10">
        <path d="M 432 428 L 352 302"/>
        <path d="M 432 428 L 541 332"/>
        <path d="M 354 300 L 534 296"/>
        <path d="M 432 428 L 282 424"/>
        <path d="M 352 302 L 282 424"/>
        <path d="M 556 344 L 556 424"/>
        <path d="M 534 296 L 556 344"/>
      </g>
      <g stroke="#8CC0B7" stroke-width="3" opacity="0.7">
        <path d="M 438 416 L 364 308"/>
        <path d="M 438 418 L 533 334"/>
        <path d="M 362 306 L 526 302"/>
        <path d="M 438 420 L 296 416"/>
      </g>
    </g>

    <!-- chainring -->
    <circle cx="432" cy="428" r="26" fill="#F7EFE2" stroke="{INK}" stroke-width="4"/>
    <circle cx="432" cy="428" r="11" fill="#C7BCAD" stroke="{INK}" stroke-width="3"/>
    <circle cx="432" cy="428" r="4" fill="{INK}"/>

    <!-- seat post + saddle -->
    <path d="M 352 302 L 347 288" stroke="{INK}" stroke-width="13" stroke-linecap="round"/>
    <path d="M 352 302 L 347 288" stroke="#B9B0A2" stroke-width="7" stroke-linecap="round"/>
    <path d="M 314 288 C 328 276 372 276 385 288 C 390 296 380 301 360 301 C 336 301 316 297 314 288 Z"
          fill="#7A4A38" stroke="{INK}" stroke-width="3.5" stroke-linejoin="round"/>

    <!-- ================= near crank + pedal ================= -->
    <line x1="432" y1="428" x2="469" y2="404" stroke="{INK}" stroke-width="12" stroke-linecap="round"/>
    <line x1="432" y1="428" x2="469" y2="404" stroke="#6B6154" stroke-width="7" stroke-linecap="round"/>
    <rect x="452" y="396" width="37" height="13" rx="6" transform="rotate(-16 470 402)"
          fill="#5B5348" stroke="{INK}" stroke-width="3"/>

    <!-- ================= near leg + foot ================= -->
    <path d="M 406 282 C 424 308 444 330 458 352 C 468 368 474 382 478 394"
          fill="none" stroke="{INK}" stroke-width="17" stroke-linecap="round"/>
    <path d="M 406 282 C 424 308 444 330 458 352 C 468 368 474 382 478 394"
          fill="none" stroke="#F2A23C" stroke-width="11" stroke-linecap="round"/>
    {foot(478, 394, -4, 1.0)}

    <!-- ================= pelican ================= -->
    <!-- tail -->
    <path d="M 300 214 C 268 194 240 186 210 188 C 236 201 250 210 260 220
             C 232 215 212 222 198 234 C 226 236 250 246 266 262 L 306 266 Z"
          fill="#FCF6EC" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M 232 199 C 252 212 266 226 274 240 M 214 231 C 236 240 252 250 262 260"
          fill="none" stroke="#DACBB8" stroke-width="3" stroke-linecap="round"/>

    <!-- neck (thick round stroke, base hidden by the body) -->
    <path d="M 424 226 C 448 204 462 176 486 154"
          fill="none" stroke="{INK}" stroke-width="52" stroke-linecap="round"/>
    <path d="M 424 226 C 448 204 462 176 486 154"
          fill="none" stroke="#FCF6EC" stroke-width="42" stroke-linecap="round"/>
    <path d="M 436 206 C 452 188 462 168 476 154"
          fill="none" stroke="#E3D4C1" stroke-width="8" stroke-linecap="round" opacity="0.55"/>

    <!-- head -->
    <ellipse cx="504" cy="140" rx="36" ry="33" transform="rotate(-12 504 140)"
             fill="#FCF6EC" stroke="{INK}" stroke-width="4"/>
    <!-- crest tuft -->
    <path d="M 492 118 C 487 106 476 99 462 99 C 470 105 474 111 476 118
             C 467 112 456 112 447 116 C 457 120 463 127 465 134 Z"
          fill="#FCF6EC" stroke="{INK}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M 470 110 C 474 112 477 116 478 120" fill="none" stroke="#CBB9A5"
          stroke-width="2.2" stroke-linecap="round"/>

    <!-- beak: pouch -->
    <path d="M 530 150 C 574 154 626 156 676 152
             C 668 186 634 216 592 218 C 558 219 536 194 530 166 Z"
          fill="#FFC571" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M 556 206 C 588 208 622 192 646 168" fill="none" stroke="#EEA23C"
          stroke-width="3.4" stroke-linecap="round" opacity="0.85"/>
    <path d="M 566 214 C 600 212 632 196 656 170" fill="none" stroke="#EEA23C"
          stroke-width="2.8" stroke-linecap="round" opacity="0.45"/>

    <!-- beak: upper mandible -->
    <path d="M 524 118 C 580 120 640 132 682 152 C 646 161 584 156 528 146 Z"
          fill="url(#beakGrad)" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M 540 132 C 592 137 640 145 672 153" fill="none" stroke="#D9801F"
          stroke-width="3" stroke-linecap="round" opacity="0.85"/>
    <path d="M 674 142 C 686 146 689 156 681 162" fill="none" stroke="{INK}"
          stroke-width="3.4" stroke-linecap="round"/>

    <!-- eye + brow -->
    <circle cx="516" cy="128" r="7" fill="{INK}"/>
    <circle cx="518.5" cy="125.5" r="2.4" fill="#FFFFFF"/>
    <path d="M 498 117 C 506 110 518 110 526 115" fill="none" stroke="#CBB9A5"
          stroke-width="3" stroke-linecap="round"/>

    <!-- body -->
    <path d="M 300 198 C 340 166 412 164 452 192 C 472 214 472 252 452 276
             C 424 306 366 310 332 296 C 302 284 284 256 284 230 C 284 212 292 202 300 198 Z"
          fill="url(#bodyGrad)" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M 300 200 C 328 186 352 180 372 180" fill="none" stroke="#E3D4C1"
          stroke-width="6" stroke-linecap="round" opacity="0.5"/>


    <!-- near wing (folds along the back, tip reaches the handlebar) -->
    <path d="M 452 192 C 470 200 482 218 492 240 C 497 252 493 262 484 264
             C 472 266 462 252 452 246 C 432 234 404 240 372 236
             C 340 232 312 220 298 204 C 330 184 402 180 452 192 Z"
          fill="#FDF7EE" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M 462 216 C 452 232 450 248 456 260 M 434 210 C 424 228 424 244 430 254
             M 402 206 C 394 220 392 232 396 242"
          fill="none" stroke="#DFD0BC" stroke-width="3" stroke-linecap="round"/>


    <!-- ================= scarf (front) ================= -->
    <g stroke-linecap="round">
      <path d="M 438 178 L 472 202" stroke="{INK}" stroke-width="24"/>
      <path d="M 438 178 L 472 202" stroke="#E4572E" stroke-width="16"/>
    </g>
    <path d="M 446 176 C 410 158 366 152 330 162 C 358 171 382 180 398 190
             C 414 184 430 182 450 184 Z"
          fill="#E4572E" stroke="{INK}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M 358 158 C 376 166 390 174 398 184" fill="none" stroke="#C8441F"
          stroke-width="2.6" stroke-linecap="round" opacity="0.7"/>
    <path d="M 448 194 C 414 200 384 214 362 236 C 388 231 410 224 423 222
             C 432 211 440 203 452 199 Z"
          fill="#E4572E" stroke="{INK}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M 380 230 C 398 222 412 216 422 220" fill="none" stroke="#C8441F"
          stroke-width="2.6" stroke-linecap="round" opacity="0.7"/>
    <circle cx="450" cy="186" r="9" fill="#C8441F" stroke="{INK}" stroke-width="3.2"/>


    <!-- ================= handlebar (in front of wing) ================= -->
    <path d="M 534 296 L 529 272" stroke="{INK}" stroke-width="13" stroke-linecap="round"/>
    <path d="M 534 296 L 529 272" stroke="#B9B0A2" stroke-width="7" stroke-linecap="round"/>
    <path d="M 543 262 C 532 248 508 249 492 258" fill="none" stroke="{INK}"
          stroke-width="14" stroke-linecap="round"/>
    <path d="M 543 262 C 532 248 508 249 492 258" fill="none" stroke="#2E6F6A"
          stroke-width="8" stroke-linecap="round"/>
    <path d="M 500 253 C 488 252 480 258 477 266" fill="none" stroke="#7A4A38"
          stroke-width="13" stroke-linecap="round"/>
    <path d="M 539 251 A 10 10 0 0 1 559 251 Z" fill="#F2B33D" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="549" cy="241" r="2.8" fill="{INK}"/>
    <path d="M 560 254 l 6 5" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>

    <!-- ================= motion ================= -->
    <g stroke="#FFFFFF" stroke-linecap="round" opacity="0.55">
      <path d="M 100 210 h 58" stroke-width="8"/>
      <path d="M 66 250 h 40" stroke-width="6"/>
      <path d="M 108 290 h 66" stroke-width="8"/>
    </g>
    <g fill="#E4CBA6" opacity="0.75">
      <circle cx="182" cy="486" r="8"/>
      <circle cx="156" cy="500" r="5"/>
      <circle cx="200" cy="503" r="4"/>
    </g>
  </g>
</svg>
''')

print("\n".join(out))
