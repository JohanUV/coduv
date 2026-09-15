import re, base64, os, sys
root=sys.argv[1]; out=sys.argv[2]
html=open(f'{root}/index.html').read()
css=open(f'{root}/css/style.css').read()
js=open(f'{root}/js/main.js').read()
def data(path):
    p=os.path.join(root,path); ext=path.rsplit('.',1)[1]
    mime={'webp':'image/webp','png':'image/png','jpg':'image/jpeg','svg':'image/svg+xml'}[ext]
    return 'data:'+mime+';base64,'+base64.b64encode(open(p,'rb').read()).decode()
# no incrustar el PNG grande de recorte, no se usa en la página
css=re.sub(r'url\("\.\./(img/[^"]+)"\)', lambda m:'url("'+data(m.group(1))+'")', css)
html=re.sub(r'(src|href)="(img/[^"]+)"', lambda m:f'{m.group(1)}="{data(m.group(2))}"', html)
html=re.sub(r'content="(img/[^"]+)"', lambda m:f'content="{data(m.group(1))}"', html)
html=html.replace('<link rel="stylesheet" href="css/style.css">','<style>\n'+css+'\n</style>')
html=html.replace('<script src="js/main.js" defer></script>','<script>\n'+js+'\n</script>')
# quitar doctype/html/head/body: el artifact envuelve el contenido
m=re.search(r'<head>(.*?)</head>',html,re.S); head=m.group(1)
head=re.sub(r'<meta (charset|name="viewport")[^>]*>','',head)
body=re.search(r'<body>(.*)</body>',html,re.S).group(1)
open(out,'w').write(head+'\n'+body)
print(os.path.getsize(out)/1e6,'MB')
