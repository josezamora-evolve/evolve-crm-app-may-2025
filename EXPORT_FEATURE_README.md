# 📊 Funcionalidad de Exportación de Datos

Esta documentación describe la implementación completa de la funcionalidad de exportación de datos para el proyecto CRM. Los datos se exportan en formato CSV compatible con Excel y otras aplicaciones de hojas de cálculo.

## 🚀 Características Principales

- ✅ **Exportación de Productos**: Lista completa con precios y detalles
- ✅ **Exportación de Clientes**: Información completa con productos comprados y totales
- ✅ **Reporte Completo**: Archivo Excel con múltiples hojas (productos, clientes, resumen)
- ✅ **Codificación UTF-8**: Soporte completo para caracteres especiales y acentos
- ✅ **Encabezados Automáticos**: Columnas con nombres descriptivos en español
- ✅ **Nombres de Archivo Inteligentes**: Incluyen fecha automática
- ✅ **Componentes Reutilizables**: Botones modulares fáciles de integrar
- ✅ **Manejo de Errores**: Validaciones y mensajes informativos

## 📁 Estructura de Archivos

```
src/
├── lib/
│   └── excel-export.ts          # Funciones principales de exportación
├── components/
│   └── ExportButton.tsx         # Componentes de botones reutilizables
├── app/
│   ├── products/page.tsx        # Página de productos (con botón de exportación)
│   ├── customers/page.tsx       # Página de clientes (con botones de exportación)
│   └── export-demo/page.tsx     # Página de demostración
└── types/
    ├── product.ts               # Tipos de productos
    └── customer.ts              # Tipos de clientes
```

## 🛠️ Instalación de Dependencias

```bash
npm install xlsx @types/xlsx
```

## 📋 Funciones Principales

### 1. `exportarProductosAExcel(products, fileName?)`

Exporta una lista de productos a Excel con las siguientes columnas:
- N° (numeración automática)
- ID del Producto
- Nombre del Producto
- Precio (€)
- Fecha de Exportación

**Ejemplo de uso:**
```typescript
import { exportarProductosAExcel } from '@/lib/excel-export';
import { productStorage } from '@/lib/storage';

const productos = productStorage.getAll();
exportarProductosAExcel(productos, 'mi-lista-productos.xlsx');
```

### 2. `exportarClientesAExcel(customers, fileName?)`

Exporta una lista de clientes con las siguientes columnas:
- N° (numeración automática)
- ID del Cliente
- Nombre del Cliente
- Correo Electrónico
- Productos Comprados (cantidad)
- Lista de Productos (nombres)
- Total Gastado (€)
- Fecha de Exportación

**Ejemplo de uso:**
```typescript
import { exportarClientesAExcel } from '@/lib/excel-export';
import { customerStorage } from '@/lib/storage';

const clientes = customerStorage.getAll();
exportarClientesAExcel(clientes, 'mi-lista-clientes.xlsx');
```

### 3. `exportarReporteCompleto(products, customers, fileName?)`

Genera un archivo Excel con múltiples hojas:
- **Productos**: Lista completa de productos
- **Clientes**: Lista completa de clientes
- **Resumen**: Métricas generales y fecha del reporte

**Ejemplo de uso:**
```typescript
import { exportarReporteCompleto } from '@/lib/excel-export';
import { productStorage, customerStorage } from '@/lib/storage';

const productos = productStorage.getAll();
const clientes = customerStorage.getAll();
exportarReporteCompleto(productos, clientes, 'reporte-completo.xlsx');
```

## 🎯 Componentes de Botones

### ExportProductsButton

Botón específico para exportar productos:

```tsx
import { ExportProductsButton } from '@/components/ExportButton';

<ExportProductsButton
  products={productos}
  fileName="productos-2024.xlsx"
  variant="outline"
  onExportSuccess={() => console.log('¡Éxito!')}
  onExportError={(error) => alert(`Error: ${error}`)}
/>
```

### ExportCustomersButton

Botón específico para exportar clientes:

```tsx
import { ExportCustomersButton } from '@/components/ExportButton';

<ExportCustomersButton
  customers={clientes}
  fileName="clientes-2024.xlsx"
  variant="outline"
  onExportSuccess={() => console.log('¡Éxito!')}
  onExportError={(error) => alert(`Error: ${error}`)}
/>
```

### ExportCompleteReportButton

Botón para generar reporte completo:

```tsx
import { ExportCompleteReportButton } from '@/components/ExportButton';

<ExportCompleteReportButton
  products={productos}
  customers={clientes}
  fileName="reporte-completo-2024.xlsx"
  variant="default"
  buttonText="Descargar Reporte"
  onExportSuccess={() => console.log('¡Éxito!')}
  onExportError={(error) => alert(`Error: ${error}`)}
/>
```

## 🎨 Propiedades de los Componentes

| Propiedad | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `products` | `Product[]` | Array de productos | Sí (para productos) |
| `customers` | `Customer[]` | Array de clientes | Sí (para clientes) |
| `fileName` | `string` | Nombre personalizado del archivo | No |
| `variant` | `'default' \| 'outline' \| 'secondary' \| 'ghost'` | Estilo del botón | No |
| `size` | `'default' \| 'sm' \| 'lg'` | Tamaño del botón | No |
| `buttonText` | `string` | Texto personalizado del botón | No |
| `className` | `string` | Clases CSS adicionales | No |
| `onExportSuccess` | `() => void` | Callback de éxito | No |
| `onExportError` | `(error: string) => void` | Callback de error | No |

## 🔧 Integración en Páginas Existentes

### Página de Productos

```tsx
// En src/app/products/page.tsx
import { ExportProductsButton } from '@/components/ExportButton';

// Dentro del componente, en el header:
<div className="flex gap-2">
  {products.length > 0 && (
    <ExportProductsButton
      products={products}
      variant="outline"
      onExportSuccess={() => console.log('Productos exportados')}
      onExportError={(error) => alert(`Error: ${error}`)}
    />
  )}
  {/* Otros botones... */}
</div>
```

### Página de Clientes

```tsx
// En src/app/customers/page.tsx
import { ExportCustomersButton, ExportCompleteReportButton } from '@/components/ExportButton';

// Dentro del componente, en el header:
<div className="flex gap-2">
  {customers.length > 0 && (
    <>
      <ExportCustomersButton
        customers={customers}
        variant="outline"
      />
      <ExportCompleteReportButton
        products={products}
        customers={customers}
        variant="secondary"
        buttonText="Reporte Completo"
      />
    </>
  )}
  {/* Otros botones... */}
</div>
```

## 🧪 Página de Demostración

Visita `/export-demo` para probar todas las funcionalidades:

- Crear datos de ejemplo
- Probar diferentes tipos de exportación
- Ver información técnica detallada
- Limpiar datos de prueba

## 🛡️ Manejo de Errores

La librería incluye validaciones automáticas:

- ✅ Verificación de soporte del navegador
- ✅ Validación de datos no vacíos
- ✅ Manejo de errores de generación de archivos
- ✅ Mensajes de error descriptivos en español

## 📱 Compatibilidad

- ✅ **Navegadores**: Chrome, Firefox, Safari, Edge (versiones modernas)
- ✅ **Dispositivos**: Desktop y móvil
- ✅ **Excel**: Compatible con Microsoft Excel, Google Sheets, LibreOffice Calc
- ✅ **Codificación**: UTF-8 para caracteres especiales

## 🚀 Ejemplo Completo de Uso

```tsx
'use client';

import { useState, useEffect } from 'react';
import { ExportProductsButton } from '@/components/ExportButton';
import { productStorage } from '@/lib/storage';
import { Product } from '@/types/product';

export default function MiComponente() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(productStorage.getAll());
  }, []);

  return (
    <div>
      <h1>Mis Productos</h1>
      
      {products.length > 0 && (
        <ExportProductsButton
          products={products}
          fileName={`productos-${new Date().toISOString().split('T')[0]}.xlsx`}
          variant="outline"
          onExportSuccess={() => {
            console.log('✅ Exportación exitosa');
            // Opcional: mostrar notificación de éxito
          }}
          onExportError={(error) => {
            console.error('❌ Error en exportación:', error);
            alert(`Error al exportar: ${error}`);
          }}
        />
      )}
      
      {/* Resto del componente... */}
    </div>
  );
}
```

## 🔍 Estructura del Archivo Excel Generado

### Hoja de Productos
| N° | ID del Producto | Nombre del Producto | Precio (€) | Fecha de Exportación |
|----|----------------|-------------------|------------|---------------------|
| 1  | abc-123        | Laptop HP         | 899.99     | 17/09/2024         |
| 2  | def-456        | Mouse Logitech    | 29.99      | 17/09/2024         |

### Hoja de Clientes
| N° | ID del Cliente | Nombre del Cliente | Correo Electrónico | Productos Comprados | Lista de Productos | Total Gastado (€) | Fecha de Exportación |
|----|---------------|-------------------|-------------------|-------------------|-------------------|------------------|---------------------|
| 1  | xyz-789       | María García      | maria@email.com   | 2                 | Laptop HP, Mouse  | 929.98           | 17/09/2024         |

## 🎯 Próximas Mejoras

- [ ] Exportación a CSV
- [ ] Filtros de fecha para exportación
- [ ] Plantillas personalizables
- [ ] Exportación programada
- [ ] Gráficos en Excel

## 🤝 Contribución

Para agregar nuevas funcionalidades de exportación:

1. Extiende las funciones en `src/lib/excel-export.ts`
2. Crea nuevos componentes en `src/components/ExportButton.tsx`
3. Actualiza esta documentación
4. Agrega ejemplos en la página de demostración

---

**¡La funcionalidad de exportación está lista para usar! 🎉**
