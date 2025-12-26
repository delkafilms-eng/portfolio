# Guía de Publicación Gratuita

Puedes publicar tu portfolio totalmente gratis y con una URL profesional usando **Vercel** o **Netlify**. Ambas opciones son excelentes, rápidas y gratuitas para proyectos personales.

## Opción 1: Vercel (Recomendada)

Vercel es la empresa detrás de Next.js y ofrece una integración perfecta.

1.  **Crea una cuenta**: Ve a [vercel.com](https://vercel.com) y regístrate (puedes usar tu cuenta de GitHub).
2.  **Instala Vercel CLI** (opcional pero rápido):
    *   Abre tu terminal en la carpeta del proyecto.
    *   Ejecuta `npm i -g vercel`.
    *   Ejecuta `vercel login`.
    *   Ejecuta `vercel`.
    *   Sigue las instrucciones (acepta todo por defecto).
3.  **Vía Web (Más fácil si tienes el código en GitHub)**:
    *   Sube tu código a un repositorio de GitHub.
    *   En el panel de Vercel, haz clic en "Add New Project".
    *   Importa tu repositorio de GitHub.
    *   Vercel detectará que es un proyecto Vite/React. Haz clic en "Deploy".

**URL Resultante**: Obtendrás algo como `portfolio-luis.vercel.app`. Puedes cambiar el nombre en la configuración.

## Opción 2: Netlify

Muy similar a Vercel, muy popular para sitios estáticos.

1.  **Crea una cuenta**: Ve a [netlify.com](https://netlify.com).
2.  **Drag & Drop (Lo más sencillo)**:
    *   Ejecuta `npm run build` en tu terminal.
    *   Se creará una carpeta `dist` en tu proyecto.
    *   Arrastra esa carpeta `dist` al panel de control de Netlify.
    *   ¡Listo! Tu web está online.

**URL Resultante**: Obtendrás algo como `luis-portfolio.netlify.app`.

## Dominio Personalizado (Opcional)

Si quieres una URL como `luisivorra.com`:

1.  Compra el dominio en proveedores como Namecheap, GoDaddy o Google Domains (aprox. 10-15€/año).
2.  En Vercel o Netlify, ve a "Settings" > "Domains".
3.  Añade tu dominio.
4.  Sigue las instrucciones para configurar los DNS (normalmente es añadir unos registros A y CNAME donde compraste el dominio).
5.  Vercel/Netlify generarán automáticamente un certificado SSL (el candadito seguro HTTPS) gratis.
