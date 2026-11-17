# Re-writes the Content-Security-Policy tag on every page. Run after changing any inline <script>:  python3 tests/update-csp.py
import re, hashlib, base64, glob, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
for f in sorted(glob.glob("*.html")):
    s = open(f).read()
    s = re.sub(r'  <meta http-equiv="Content-Security-Policy"[^>]*>\n', "", s)
    hashes = []
    for body in re.findall(r"<script>(.*?)</script>", s, re.S):
        hashes.append("'sha256-" + base64.b64encode(hashlib.sha256(body.encode()).digest()).decode() + "'")
    csp = ("default-src 'self'; script-src 'self' " + " ".join(hashes)).strip() + "; " \
        "style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob: https:; font-src 'self' data:; " \
        "connect-src 'self' https://api.web3forms.com; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; " \
        "object-src 'none'; base-uri 'self'; form-action 'self' https://api.web3forms.com; manifest-src 'self'; worker-src 'self'"
    if f != "media.html":  # visitor counter (counter.js) sends a tiny image request to GoatCounter
        csp = csp.replace("img-src 'self' data: blob:", "img-src 'self' data: blob: https://*.goatcounter.com")
    if f == "media.html":  # the photo and video page saves files to GitHub
        csp = csp.replace("connect-src 'self' https://api.web3forms.com", "connect-src 'self' https://api.github.com")
    tag = '  <meta http-equiv="Content-Security-Policy" content="' + csp + '">\n'
    s = s.replace('<meta charset="utf-8">\n', '<meta charset="utf-8">\n' + tag, 1)
    assert tag in s, f
    open(f, "w").write(s)
    print(f, len(hashes))
