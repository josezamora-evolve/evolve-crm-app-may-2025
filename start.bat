@echo off
echo ========================================
echo 🚀 Iniciando CRM App con Exportación
echo ========================================
echo.
echo ✅ Verificando archivos...
if exist "src\lib\excel-export.ts" echo ✅ excel-export.ts - OK
if exist "src\components\ExportButtons.tsx" echo ✅ ExportButtons.tsx - OK
if exist "src\app\products\page.tsx" echo ✅ products/page.tsx - OK
if exist "src\app\customers\page.tsx" echo ✅ customers/page.tsx - OK
echo.
echo 🌐 Iniciando servidor de desarrollo...
echo 📍 URL: http://localhost:3000
echo.
echo ⚡ Funcionalidades disponibles:
echo   - /products (con botón de exportación)
echo   - /customers (con botones de exportación)
echo.
npm run dev
