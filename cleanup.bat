@echo off
echo ========================================
echo 🧹 Limpiando archivos innecesarios...
echo ========================================

echo.
echo 📁 Eliminando archivos duplicados de exportación...
if exist "src\lib\data-export.ts" del "src\lib\data-export.ts" && echo ❌ data-export.ts eliminado
if exist "src\lib\excel-export-final.ts" del "src\lib\excel-export-final.ts" && echo ❌ excel-export-final.ts eliminado
if exist "src\lib\excel-export-simple.ts" del "src\lib\excel-export-simple.ts" && echo ❌ excel-export-simple.ts eliminado
if exist "src\lib\excel-export.ts" del "src\lib\excel-export.ts" && echo ❌ excel-export.ts eliminado
if exist "src\lib\export-utils.ts" del "src\lib\export-utils.ts" && echo ❌ export-utils.ts eliminado

echo.
echo 📁 Eliminando componentes duplicados...
if exist "src\components\ExportButtons.tsx" del "src\components\ExportButtons.tsx" && echo ❌ ExportButtons.tsx eliminado
if exist "src\components\SimpleExportButtons.tsx" del "src\components\SimpleExportButtons.tsx" && echo ❌ SimpleExportButtons.tsx eliminado

echo.
echo 📁 Eliminando archivos de prueba...
if exist "start.bat" del "start.bat" && echo ❌ start.bat eliminado
if exist "test-export.js" del "test-export.js" && echo ❌ test-export.js eliminado

echo.
echo ✅ Archivos necesarios mantenidos:
echo   - src/lib/export-functions.ts (funciones de exportación)
echo   - src/lib/storage.ts (almacenamiento)
echo   - src/lib/utils.ts (utilidades)
echo   - src/components/ExportButton.tsx (componente principal)
echo   - src/components/Navigation.tsx (navegación)

echo.
echo 🎯 Estructura final limpia:
echo src/
echo ├── lib/
echo │   ├── export-functions.ts
echo │   ├── storage.ts
echo │   └── utils.ts
echo ├── components/
echo │   ├── ExportButton.tsx
echo │   ├── Navigation.tsx
echo │   └── ui/
echo └── app/
echo     ├── products/
echo     └── customers/

echo.
echo ✅ Limpieza completada!
pause
