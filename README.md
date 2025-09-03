# SirveLaMesa - Test App

Aplicación web sencilla para probar el hosting de Render con PostgreSQL.

## Características

- ✅ Backend con Node.js y Express
- ✅ Base de datos PostgreSQL
- ✅ Interfaz web responsive
- ✅ CRUD completo de tareas
- ✅ Configurado para Render

## Instalación y uso local

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd SirveLaMesa
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar base de datos local (opcional)**
   ```bash
   # Copiar archivo de configuración
   cp .env.example .env
   
   # Editar .env con tu configuración local de PostgreSQL
   # DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   ```

4. **Ejecutar la aplicación**
   ```bash
   npm start
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## Despliegue en Render

### Paso 1: Crear la base de datos PostgreSQL

1. Ve a tu dashboard de Render
2. Haz clic en "New" > "PostgreSQL"
3. Configura tu base de datos:
   - **Name**: `sirve-la-mesa-db` (o el nombre que prefieras)
   - **Database**: `sirve_la_mesa`
   - **User**: (automático)
   - **Region**: Selecciona la más cercana
4. Haz clic en "Create Database"
5. **Guarda la URL interna** que aparecerá (la necesitarás en el siguiente paso)

### Paso 2: Crear el Web Service

1. En Render, haz clic en "New" > "Web Service"
2. Conecta tu repositorio de GitHub/GitLab
3. Configura el servicio:
   - **Name**: `sirve-la-mesa-app`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Paso 3: Configurar las variables de entorno

En la configuración del Web Service, en la sección "Environment Variables":

1. Agrega una nueva variable:
   - **Key**: `DATABASE_URL`
   - **Value**: La URL interna de tu base de datos PostgreSQL (del paso 1)

2. Agrega otra variable:
   - **Key**: `NODE_ENV`
   - **Value**: `production`

### Paso 4: Desplegar

1. Haz clic en "Create Web Service"
2. Render automáticamente detectará tu aplicación Node.js
3. El despliegue comenzará automáticamente
4. Una vez completado, tendrás una URL para acceder a tu aplicación

## Funcionalidades de la aplicación

- **Agregar tareas**: Formulario simple para crear nuevas tareas
- **Listar tareas**: Visualización de todas las tareas con estado
- **Completar tareas**: Marcar tareas como completadas/pendientes
- **Eliminar tareas**: Eliminar tareas no deseadas
- **Estado de conexión**: Indicador visual del estado de la base de datos

## Estructura del proyecto

```
├── public/
│   └── index.html          # Interfaz de usuario
├── server.js               # Servidor Express y lógica de API
├── package.json            # Dependencias y scripts
├── .env.example            # Ejemplo de configuración
└── README.md               # Este archivo
```

## Tecnologías utilizadas

- **Backend**: Node.js, Express.js
- **Base de datos**: PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Hosting**: Render.com

## Troubleshooting

### Error de conexión a la base de datos

1. Verifica que la variable `DATABASE_URL` esté correctamente configurada
2. Asegúrate de que la base de datos PostgreSQL esté en funcionamiento
3. Revisa los logs en Render para más detalles

### La aplicación no inicia

1. Verifica que todas las dependencias estén en `package.json`
2. Revisa el comando de inicio en la configuración de Render
3. Comprueba los logs de construcción y ejecución

## Próximos pasos

Esta aplicación es perfecta para:
- ✅ Probar el entorno de Render
- ✅ Verificar la conexión a PostgreSQL
- ✅ Entender el flujo de despliegue
- ✅ Base para aplicaciones más complejas

¡Ahora puedes expandir esta base para crear aplicaciones más sofisticadas!
