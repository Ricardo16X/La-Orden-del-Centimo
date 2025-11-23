# 🏗️ Arquitectura del Proyecto - Gestor de Gastos

Este documento describe la arquitectura y organización del código del proyecto Gestor de Gastos.

## 📁 Estructura del Proyecto

```
gestor-gastos/
├── app/                           # Navegación (Expo Router)
│   ├── _layout.tsx               # Root Layout con Providers
│   ├── (tabs)/                   # Grupo de navegación por tabs
│   │   ├── _layout.tsx          # Tab Navigator
│   │   ├── index.tsx            # Pantalla de Gastos
│   │   └── perfil.tsx           # Pantalla de Perfil
│   └── src/                      # Código fuente de la aplicación
│       ├── components/           # Componentes reutilizables UI
│       ├── screens/              # Lógica de pantallas
│       ├── context/              # Context API para estado global
│       ├── hooks/                # Custom hooks
│       ├── services/             # Servicios (Storage, API)
│       ├── utils/                # Funciones auxiliares
│       ├── constants/            # Constantes y configuración
│       ├── types/                # Tipos TypeScript
│       └── styles/               # Estilos compartidos
├── assets/                       # Imágenes y recursos
├── scripts/                      # Scripts de desarrollo
└── Configuración:
    ├── app.json
    ├── package.json
    ├── tsconfig.json
    └── eslint.config.js
```

## 🧩 Descripción de Carpetas

### `/app` - Navegación

Contiene la configuración de Expo Router (file-based routing):
- `_layout.tsx`: Layout raíz con providers (Tema, Gastos, Nivel)
- `(tabs)/`: Navegación por pestañas

### `/app/src/components` - Componentes UI

Componentes reutilizables de interfaz:
- `BarraNivel.tsx` - Barra de progreso del nivel
- `BotonAgregar.tsx` - Botón flotante para agregar gastos
- `Companero.tsx` - Personaje animado con mensajes
- `FormularioGasto.tsx` - Formulario de entrada de gastos
- `ListaGastos.tsx` - Lista de gastos con categorías
- `ModalAgregarGasto.tsx` - Modal para agregar gastos
- `ModalEditarGasto.tsx` - Modal para editar/eliminar gastos
- `NotificacionNivel.tsx` - Notificación de subida de nivel
- `SelectorCategoria.tsx` - Selector de categoría
- `SelectorTema.tsx` - Selector de tema
- `TotalGastado.tsx` - Display del total gastado

### `/app/src/screens` - Pantallas

Lógica completa de las pantallas:
- `HomeScreen.tsx` - Pantalla principal con lista de gastos
- `PerfilScreen.tsx` - Pantalla de perfil y estadísticas

### `/app/src/context` - Estado Global

Context API para gestión de estado:
- `GastosContext.tsx` - Estado de gastos y CRUD
- `NivelContext.tsx` - Sistema de XP y niveles
- `TemaContext.tsx` - Tema activo y personalización

### `/app/src/hooks` - Custom Hooks

Hooks reutilizables:
- `useFormGasto.ts` - Hook para formularios de gastos
- `useCompaneroMensajes.ts` - Hook para mensajes del compañero
- `useEstadisticas.ts` - Hook para calcular estadísticas

### `/app/src/services` - Servicios

Servicios de persistencia y API:
- `storage.ts` - AsyncStorage para persistencia local

### `/app/src/utils` - Utilidades

Funciones auxiliares:
- `date.ts` - Manejo de fechas
- `validation.ts` - Validaciones de formularios
- `format.ts` - Formateo de datos
- `storage-keys.ts` - Keys de AsyncStorage

### `/app/src/constants` - Constantes

Datos estáticos y configuración:
- `temas.ts` - Temas disponibles (Medieval, Kawaii)
- `niveles.ts` - Sistema de niveles y XP
- `categorias.ts` - Categorías de gastos
- `companero.ts` - Lógica de frases del compañero
- `frasesMedieval.ts` - Frases tema Medieval
- `frasesKawaii.ts` - Frases tema Kawaii
- `colores.ts` - Paletas de colores

### `/app/src/types` - TypeScript

Tipos e interfaces centralizados:
- Gasto, NuevoGasto, ActualizacionGasto
- Categoria, DatosJugador, Nivel
- Tema, ColoresTema, CategoriasTema
- FraseCompanero, TipoFrase

### `/app/src/styles` - Estilos

Estilos compartidos:
- `common.ts` - Estilos comunes y tokens de diseño

## 🔄 Flujo de Datos

```
User Action
    ↓
Screen (HomeScreen, PerfilScreen)
    ↓
Component (FormularioGasto, ListaGastos)
    ↓
Custom Hook (useFormGasto, useCompaneroMensajes)
    ↓
Context (GastosContext, NivelContext, TemaContext)
    ↓
Service (storage.ts)
    ↓
AsyncStorage (Persistencia)
```

## 🎯 Patrones de Diseño

### 1. **Separación de Concerns**
- Navegación en `/app`
- Lógica en `/app/src`
- UI en `/components`
- Estado en `/context`

### 2. **Custom Hooks**
- Extracción de lógica reutilizable
- Composición de funcionalidad
- Facilita testing

### 3. **Context API**
- Estado global sin prop drilling
- Providers en root layout
- Custom hooks para consumo

### 4. **Utility-First**
- Funciones puras en `/utils`
- Validaciones centralizadas
- Formateo consistente

### 5. **Type Safety**
- TypeScript strict mode
- Tipos centralizados
- Autocomplete mejorado

## 📦 Path Aliases

El proyecto usa path aliases para imports limpios:

```typescript
import { Gasto } from '@/types';
import { useGastos } from '@/context/GastosContext';
import { formatearMoneda } from '@/utils/format';
import { HomeScreen } from '@/screens';
```

Aliases disponibles:
- `@/components/*`
- `@/screens/*`
- `@/context/*`
- `@/hooks/*`
- `@/utils/*`
- `@/services/*`
- `@/constants/*`
- `@/types/*`
- `@/styles/*`

## 🚀 Próximos Pasos para Escalar

### Funcionalidades Recomendadas:
1. **Categorías personalizadas** - Permitir crear categorías propias
2. **Filtros y búsqueda** - Filtrar gastos por fecha/categoría
3. **Gráficos y reportes** - Visualizaciones de estadísticas
4. **Exportar datos** - CSV, PDF, etc.
5. **Sincronización en nube** - Firebase/Supabase
6. **Recordatorios** - Notificaciones de gastos pendientes
7. **Presupuestos** - Límites por categoría
8. **Multi-moneda** - Soporte para diferentes divisas

### Mejoras Técnicas:
1. **Testing** - Unit tests con Jest
2. **CI/CD** - GitHub Actions
3. **Error Boundary** - Manejo de errores global
4. **Logging** - Sistema de logs estructurado
5. **Performance** - React.memo, useMemo optimizaciones
6. **Accessibility** - ARIA labels, screen readers
7. **i18n** - Internacionalización
8. **Dark Mode** - Modo oscuro nativo

## 📚 Tecnologías Usadas

- **React Native** - Framework móvil
- **Expo 54** - Plataforma de desarrollo
- **Expo Router** - Navegación file-based
- **TypeScript** - Tipado estático
- **AsyncStorage** - Persistencia local
- **Context API** - Estado global

## 🔧 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npx expo start

# Limpiar cache
npx expo start -c

# Build Android
npx expo build:android

# Build iOS
npx expo build:ios
```

---

**Última actualización:** 2025-01-23
**Versión:** 2.0.0 (Reorganización arquitectónica)
