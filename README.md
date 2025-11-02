#+ Calculator App

Una calculadora web interactiva con operaciones básicas y avanzadas, diseño limpio y responsive.

## Características

- Básicas: suma, resta, multiplicación, división, porcentaje, punto decimal, cambio de signo, borrar dígito y limpiar todo
- Avanzadas: potencia `x^y`, cuadrado `x²`, raíz `√x`, recíproco `1/x`
- Memoria: `MC`, `MR`, `M+`, `M-`
- Soporte de teclado: `0-9`, `+ - * / ^`, `Enter/=`, `Backspace`, `Escape`, `%`, `.`
- Diseño accesible y responsive, con tema en `#16A085`

## Estructura del proyecto

```
.
├─ index.html
└─ src/
   ├─ js/
   │  └─ app.js
   ├─ styles/
   │  └─ main.css
   └─ assets/
      ├─ icons/
      └─ (placeholders)
```

## Cómo ejecutar

- Opción 1: Abrir `index.html` directamente en tu navegador.
- Opción 2: Servir como sitio estático con cualquier servidor local.
  - Node.js: `npx serve .` o `npx http-server -c-1 .`
  - Python 3: `python -m http.server 8080`

## Atajos de teclado

- Números: `0-9`
- Operadores: `+ - * / ^`
- Igual: `Enter` o `=`
- Borrar dígito: `Backspace`
- Limpiar todo: `Escape`
- Porcentaje: `%`
- Decimal: `.`

## Notas de uso

- División por cero y `√` de negativos muestran `Error` y reinician el flujo de entrada.
- El botón `x^y` habilita una operación de potencia (ingresa la base, pulsa `x^y`, ingresa el exponente y pulsa `=`).
- El indicador de memoria (`M`) aparece en la línea superior cuando hay un valor almacenado.

## Personalización

- Cambia el color del tema en `src/styles/main.css` editando la variable CSS `--primary`.

---
Hecho con ❤


