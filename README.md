# 🎰 Ruleta de Apuestas - Sistema de Casino Automático

Una aplicación web completa de ruleta con 30 números, cada uno asociado con un animal de la suerte. Incluye sistema de juegos automáticos programados, panel de administración y gestión de apuestas físicas. Construida con Next.js, TypeScript y TailwindCSS.

## 🎯 Características Principales

### 🎮 Sistema de Juego
- **Ruleta visual animada** con 30 números (1-30)
- **Animaciones de luces** que simulan el giro de la ruleta
- **Sistema de apuestas** con saldo virtual inicial de $1000
- **Animales de la suerte** únicos para cada número
- **Probabilidades realistas** (20% jugador, 80% casa)
- **Interfaz responsive** adaptada a todos los dispositivos

### 🤖 Sistema Automático (¡NUEVO!)
- **Creación automática** de juegos cada hora
- **Ejecución automática** sin intervención manual
- **Gestión inteligente** de probabilidades basada en apuestas
- **Limpieza automática** de datos antiguos
- **Programación con cron jobs** usando node-cron

### 👨‍💼 Panel de Administración
- **Control total** del sistema automático
- **Gestión de juegos** manuales y automáticos
- **Registro de apuestas físicas** con tickets
- **Estadísticas en tiempo real**
- **Control de estado** del scheduler automático

## 🚀 Tecnologías Utilizadas

- **Next.js 14** (App Router)
- **TypeScript** para tipado estático
- **TailwindCSS** para estilos
- **Prisma** para gestión de base de datos
- **PostgreSQL** como base de datos principal
- **node-cron** para programación automática
- **JWT** para autenticación
- **React Hooks** para manejo de estado

## 🤖 Sistema Automático

### Funcionamiento
El sistema automático gestiona completamente los juegos de ruleta sin intervención manual:

- **Creación automática**: Nuevos juegos se crean cada hora a los :05 minutos
- **Ejecución inteligente**: Los juegos se ejecutan automáticamente cada 5 minutos
- **Gestión de apuestas**: Sistema inteligente que favorece números con menos apuestas
- **Limpieza automática**: Eliminación de juegos antiguos cada día a las 3 AM

### Configuración de Horarios
```bash
# Crear juegos: cada hora a los 5 minutos (10:05, 11:05, 12:05...)
5 * * * *

# Ejecutar juegos: cada 5 minutos
*/5 * * * *

# Limpieza: diariamente a las 3 AM
0 3 * * *
```

### Control Manual
Los administradores pueden:
- ✅ Iniciar/detener el sistema automático
- 📊 Monitorear el estado en tiempo real
- 🎯 Ejecutar juegos manualmente si es necesario
- 📈 Ver estadísticas de rendimiento

## 📁 Estructura del Proyecto

```
ruleta-apuestas/
├── app/
│   ├── layout.tsx          # Layout principal con metadatos
│   ├── page.tsx            # Página principal del juego
│   └── api/
│       └── spin/
│           └── route.ts    # API endpoint para el giro
├── components/
│   ├── Roulette.tsx        # Componente de la ruleta animada
│   ├── BettingPanel.tsx    # Panel de apuestas y selección
│   └── ResultsPanel.tsx    # Panel de resultados y estadísticas
├── styles/
│   └── globals.css         # Estilos globales y animaciones
└── public/
    └── animals/            # Imágenes de animales (placeholder)
```

## 🎮 Cómo Jugar

1. **Selecciona tu número** de la suerte (1-30)
2. **Elige tu apuesta** usando los botones rápidos o cantidad personalizada
3. **Haz clic en "GIRAR RULETA"** y observa la animación
4. **Descubre el resultado** y tu animal ganador
5. **Disfruta de las ganancias** o intenta de nuevo

## 💰 Sistema de Apuestas

- **Saldo inicial**: $1000
- **Pago por acierto**: 30:1 (apuesta x29 + apuesta original)
- **Probabilidad de ganar**: 3.33% (1/30)
- **Probabilidad de perder**: 96.67% (29/30)

## 🎨 Animaciones y Efectos

- **Giro de ruleta**: Animación suave de 4 segundos
- **Luces secuenciales**: Efecto de iluminación durante el giro
- **Aparición del animal**: Animación del animal ganador en el centro
- **Efectos de victoria/derrota**: Animaciones diferenciadas por resultado
- **Partículas flotantes**: Efectos ambientales inmersivos

## 🛠️ Instalación y Desarrollo

### Prerrequisitos
- Node.js 18.0.0 o superior
- npm o yarn

### Pasos de instalación

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd ruleta-apuestas
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Ejecuta el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abre tu navegador**
   ```
   http://localhost:3000
   ```

### Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npm run type-check` - Verifica los tipos de TypeScript
- `npm run db:push` - Sincroniza el schema de la base de datos
- `npm run db:studio` - Abre Prisma Studio para gestión de datos

### Scripts de Sistema Automático

- `./scripts/init-scheduler.sh` - Inicializa el sistema automático
- `node scripts/test-scheduler.js` - Prueba el funcionamiento del scheduler
- `node scripts/createAdmin.js` - Crea un usuario administrador

### Inicialización del Sistema Automático

Para inicializar el sistema automático después del despliegue:

```bash
# Método 1: Script automático
./scripts/init-scheduler.sh

# Método 2: Manual via API
curl -X POST http://localhost:3000/api/scheduler \
  -H "Content-Type: application/json" \
  -d '{"action":"start"}'

# Método 3: Desde el panel de administración
# Accede como admin y usa el botón "Iniciar Automático"
```

## 🔧 Configuración

### Variables de entorno
Opcionalmente puedes crear un archivo `.env.local` para configuraciones adicionales:

```env
# Configuración opcional
NEXT_PUBLIC_APP_NAME="Ruleta de Apuestas"
NEXT_PUBLIC_INITIAL_BALANCE=1000
```

### Personalización de animales
Para usar imágenes reales de animales, coloca las imágenes en la carpeta `public/animals/` con nombres:
- `animal1.png` a `animal30.png`

## 📱 Responsive Design

La aplicación está optimizada para:
- **Desktop** (1024px+): Layout de 3 columnas
- **Tablet** (768px-1023px): Layout adaptativo
- **Mobile** (320px-767px): Layout de columna única

## 🎯 Lógica del Juego

### Algoritmo de Probabilidad
```typescript
// 20% probabilidad de que el jugador acierte
if (Math.random() < 0.2) {
  winningNumber = chosenNumber;
} else {
  // 80% cualquier otro número
  winningNumber = randomNumber(1, 30, exclude: chosenNumber);
}
```

### Sistema de Pagos
- **Acierto**: Ganancia = apuesta × 29
- **Fallo**: Pérdida = apuesta completa

## 🐾 Animales de la Suerte

Cada número tiene asignado un animal único:
1. 🐶 Perro - 11. 🐯 Tigre - 21. 🐺 Lobo
2. 🐱 Gato - 12. 🦁 León - 22. 🐗 Jabalí
3. 🐭 Ratón - 13. 🐮 Vaca - 23. 🐴 Caballo
4. 🐹 Hámster - 14. 🐷 Cerdo - 24. 🦄 Unicornio
5. 🐰 Conejo - 15. 🐸 Rana - 25. 🐝 Abeja
... y así sucesivamente hasta el 30

## 🎨 Paleta de Colores

- **Fondo**: Gradiente púrpura-azul-índigo
- **Acentos**: Amarillo dorado (#FBBF24)
- **Éxito**: Verde (#10B981)
- **Error**: Rojo (#EF4444)
- **Neutro**: Escala de grises

## 📝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- Video de referencia proporcionado como inspiración visual
- Iconos de emojis para los animales
- TailwindCSS por el sistema de diseño
- Next.js por el framework robusto

---

¡Disfruta jugando y que la suerte esté de tu lado! 🍀✨
