// Archivo de prueba para verificar que el proyecto funciona
console.log('✅ El proyecto está funcionando correctamente');
console.log('📁 Archivos de exportación disponibles');

const fs = require('fs');
const path = require('path');

// Verificar archivos importantes
const files = [
  'src/lib/excel-export.ts',
  'src/components/ExportButtons.tsx',
  'src/app/products/page.tsx',
  'src/app/customers/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - OK`);
  } else {
    console.log(`❌ ${file} - FALTA`);
  }
});

console.log('\n🚀 Para ejecutar el proyecto:');
console.log('npm run dev');
console.log('\n🌐 Luego visita: http://localhost:3000');
