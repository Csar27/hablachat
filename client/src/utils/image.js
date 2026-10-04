const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function validarImagen(archivo, maxMB = 5) {
  if (!TIPOS.includes(archivo.type)) {
    return 'Formato no válido. Usa JPG, PNG, WebP o GIF';
  }
  if (archivo.size > maxMB * 1024 * 1024) {
    return `La imagen no puede pesar más de ${maxMB} MB`;
  }
  return null;
}

export function comprimirImagen(archivo, maxLado = 1024, calidad = 0.82) {
  return new Promise((resolve, reject) => {
    const error = validarImagen(archivo);
    if (error) return reject(new Error(error));

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('La imagen está dañada o no es válida'));
      img.onload = () => {
        const escala = Math.min(1, maxLado / Math.max(img.naturalWidth, img.naturalHeight));
        const ancho = Math.max(1, Math.round(img.naturalWidth * escala));
        const alto = Math.max(1, Math.round(img.naturalHeight * escala));

        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, ancho, alto);

        resolve(canvas.toDataURL('image/jpeg', calidad));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(archivo);
  });
}

export function estimarPeso(dataUrl) {
  return Math.round((dataUrl.length * 3) / 4 / 1024);
}