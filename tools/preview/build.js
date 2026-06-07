// Ensambla un preview standalone a partir de los archivos reales de src/.
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const SRC = path.resolve(HERE, '../../src');

const styles = fs.readFileSync(path.join(SRC, 'styles.html'), 'utf8'); // <style>...</style>
const appJs = fs.readFileSync(path.join(SRC, 'app.html'), 'utf8');     // <script>...</script>
let index = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
const mock = fs.readFileSync(path.join(HERE, 'mock.js'), 'utf8');

// Reemplaza los includes del template Apps Script por contenido real.
index = index.replace("<?!= include('styles'); ?>", styles);
index = index.replace("<?!= include('app'); ?>", '<script>\n' + mock + '\n</script>\n' + appJs);
index = index.replace('<base target="_top">', '');

fs.writeFileSync(path.join(HERE, 'preview.html'), index);
console.log('preview.html generado (' + index.length + ' bytes)');
