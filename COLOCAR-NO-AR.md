# Colocar o site no ar (passo a passo)

## 1. Supabase (uma vez só)
1. Abra o projeto no supabase.com → **SQL Editor** → **New query**.
2. Cole todo o conteúdo de `supabase/setup.sql` e clique **Run**.
3. **Authentication → Users → Add user → Create new user**: coloque o e-mail e a senha do Chico
   (marque "Auto Confirm User"). Esse é o login da área do corretor.
4. **Authentication → Sign In / Providers**: desligue **"Allow new users to sign up"**
   (assim ninguém além do Chico consegue criar conta).

## 2. Publicar a pasta
O site é só HTML/JS: não precisa de servidor. Suba a pasta inteira (com `index.html` na raiz) em
Netlify (arrastar e soltar), Cloudflare Pages, Vercel ou GitHub Pages.

## 3. Primeiro acesso
Abra `seusite/corretor.html`, entre com o e-mail e a senha do passo 1.
Tudo que for cadastrado, editado, ocultado ou excluído passa a valer para todos os visitantes.

## Atenção
- A chave `sb_publishable_...` em `assets/js/supabase-config.js` é pública por natureza. Nunca
  coloque ali (nem envie a ninguém) a chave **secret** / **service_role**.
- Metragem e dormitórios dos 65 imóveis são valores provisórios gerados na migração. Revise no
  painel antes de divulgar. As fotos atuais são de banco de imagens (Unsplash).
