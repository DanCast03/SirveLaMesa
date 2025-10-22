# Guía de Integración: Godot con Backend

Esta guía explica cómo integrar el juego de Godot (ubicado en `shity ass prueba/`) con el backend de "Sirve la Mesa".

## 📋 Índice

1. [Exportar el Juego desde Godot](#exportar-el-juego-desde-godot)
2. [Configuración de HTTPRequest en Godot](#configuración-de-httprequest-en-godot)
3. [Endpoints de la API](#endpoints-de-la-api)
4. [Ejemplos de Código GDScript](#ejemplos-de-código-gdscript)
5. [Flujo de Integración](#flujo-de-integración)
6. [Variables de Entorno](#variables-de-entorno)

---

## 🎮 Exportar el Juego desde Godot

### Opción 1: Export HTML5 (Para Web)

1. Abre el proyecto en Godot 4.4 desde la carpeta `shity ass prueba/`
2. Ve a **Project → Export**
3. Selecciona **Web** (ya está configurado en `export_presets.cfg`)
4. Configura la ruta de exportación: `../../public/game/`
5. Haz clic en **Export Project**
6. Asegúrate de marcar **Export With Debug** durante desarrollo

Los archivos exportados incluirán:
- `index.html`
- `index.js`
- `index.wasm`
- `index.pck`
- `index.icon.png`

### Opción 2: Export Desktop (Windows/Linux/Mac)

1. En **Project → Export**
2. Agrega un preset para tu plataforma (Windows Desktop, Linux/X11, macOS)
3. Exporta el ejecutable
4. El ejecutable también puede comunicarse con el backend vía HTTP

---

## 🔌 Configuración de HTTPRequest en Godot

### Agregar HTTPRequest a tu escena

En tu escena principal o en un Autoload (singleton), agrega un nodo `HTTPRequest`:

```gdscript
# En el editor: Add Node → HTTPRequest
# O por código:
var http_request = HTTPRequest.new()
add_child(http_request)
```

### Script base para manejar peticiones HTTP

Crea un script `APIClient.gd` como Autoload:

```gdscript
extends Node

# URL del backend (cambiar según entorno)
var API_BASE_URL = "http://localhost:3000/api"

# Para producción, cambiar a:
# var API_BASE_URL = "https://tu-servidor.render.com/api"

var http = HTTPRequest.new()

func _ready():
    add_child(http)

# Función genérica para hacer peticiones POST
func post_request(endpoint: String, data: Dictionary, callback: Callable):
    var url = API_BASE_URL + endpoint
    var headers = ["Content-Type: application/json"]
    var json_data = JSON.stringify(data)
    
    http.request_completed.connect(callback)
    var error = http.request(url, headers, HTTPClient.METHOD_POST, json_data)
    
    if error != OK:
        push_error("Error al hacer request: " + str(error))

# Función genérica para hacer peticiones GET
func get_request(endpoint: String, callback: Callable):
    var url = API_BASE_URL + endpoint
    
    http.request_completed.connect(callback)
    var error = http.request(url)
    
    if error != OK:
        push_error("Error al hacer request: " + str(error))
```

---

## 📡 Endpoints de la API

### 1. Crear Participante

**Endpoint:** `POST /api/participantes`

**Datos requeridos:**
```json
{
  "edad": 25,
  "sexo": "F",
  "peso_kg": 65.5,
  "altura_cm": 165,
  "lugar_nacimiento": "Caracas",
  "lugar_residencia": "Las Mercedes",
  "ocupacion": "Estudiante",
  "nivel_socioeconomico": "III",
  "eat26_score": 12,
  "eat26_data": {
    "pregunta1": 3,
    "pregunta2": 1
  },
  "consentimiento_informado": true
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "pk_participante": 1,
    "edad": 25,
    "imc": 24.09,
    ...
  }
}
```

### 2. Iniciar Sesión de Juego

**Endpoint:** `POST /api/sesiones`

**Datos requeridos:**
```json
{
  "participante_id": 1,
  "dispositivo": "web",
  "navegador": "Chrome",
  "resolucion_pantalla": "1920x1080"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "pk_sesion": 1,
    "fk_participante": 1,
    "fecha_inicio": "2025-10-22T10:30:00Z",
    "estado": "en_curso"
  }
}
```

### 3. Obtener Menús

**Endpoint:** `GET /api/menu`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {"pk_menu": 1, "nombre": "Desayuno"},
    {"pk_menu": 2, "nombre": "Almuerzo"},
    {"pk_menu": 3, "nombre": "Cena"}
  ]
}
```

### 4. Obtener Platos de un Menú

**Endpoint:** `GET /api/menu/platos/:menu_id`

Ejemplo: `GET /api/menu/platos/1`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "pk_plato": 1,
      "nombre": "Arepa con queso blanco",
      "descripcion": "Arepa rellena de queso blanco"
    }
  ]
}
```

### 5. Obtener Componentes de un Plato

**Endpoint:** `GET /api/menu/componentes/:plato_id`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "pk_alimento": 1,
      "nombre": "Arepa",
      "cantidad": 100,
      "unidad_medida": "gramos"
    },
    {
      "pk_alimento": 2,
      "nombre": "Queso blanco",
      "cantidad": 50,
      "unidad_medida": "gramos"
    }
  ]
}
```

### 6. Registrar Decisión de Porcionamiento

**Endpoint:** `POST /api/decisiones`

**Datos requeridos:**
```json
{
  "sesion_id": 1,
  "escenario": "desayuno",
  "personaje_tipo": "adulto_mujer",
  "personaje_edad_rango": "30-50",
  "personaje_sexo": "F",
  "plato_id": 1,
  "bebida_id": 5,
  "componentes_servidos": [
    {
      "componente_id": 1,
      "nombre": "Arepa",
      "cantidad_gramos": 120
    },
    {
      "componente_id": 2,
      "nombre": "Queso blanco",
      "cantidad_gramos": 60
    }
  ],
  "tiempo_decision_ms": 15000,
  "orden_servicio": 1
}
```

### 7. Registrar Decisiones en Lote

**Endpoint:** `POST /api/decisiones/batch`

**Datos requeridos:**
```json
{
  "decisiones": [
    { /* decisión 1 */ },
    { /* decisión 2 */ },
    { /* decisión 3 */ }
  ]
}
```

### 8. Finalizar Sesión

**Endpoint:** `PUT /api/sesiones/:id`

**Datos:**
```json
{
  "estado": "completada",
  "notas": "Sesión completada exitosamente"
}
```

---

## 💻 Ejemplos de Código GDScript

### Ejemplo 1: Crear Participante al Inicio

```gdscript
extends Control

@onready var api_client = get_node("/root/APIClient")

var participante_id = 0

func _on_boton_empezar_pressed():
    var datos_participante = {
        "edad": int($EdadInput.text),
        "sexo": $SexoOption.get_selected_text(),
        "peso_kg": float($PesoInput.text),
        "altura_cm": float($AlturaInput.text),
        "lugar_nacimiento": $LugarNacimientoInput.text,
        "lugar_residencia": $LugarResidenciaInput.text,
        "ocupacion": $OcupacionInput.text,
        "nivel_socioeconomico": $NivelSocioOption.get_selected_text(),
        "consentimiento_informado": true
    }
    
    api_client.post_request("/participantes", datos_participante, _on_participante_creado)

func _on_participante_creado(result, response_code, headers, body):
    var json = JSON.new()
    var error = json.parse(body.get_string_from_utf8())
    
    if error == OK:
        var data = json.get_data()
        if data.success:
            participante_id = data.data.pk_participante
            print("Participante creado con ID: ", participante_id)
            iniciar_sesion()
        else:
            print("Error: ", data.error)
```

### Ejemplo 2: Iniciar Sesión de Juego

```gdscript
var sesion_id = 0

func iniciar_sesion():
    var datos_sesion = {
        "participante_id": participante_id,
        "dispositivo": "web" if OS.has_feature("web") else "desktop",
        "navegador": OS.get_name(),
        "resolucion_pantalla": str(DisplayServer.window_get_size())
    }
    
    api_client.post_request("/sesiones", datos_sesion, _on_sesion_iniciada)

func _on_sesion_iniciada(result, response_code, headers, body):
    var json = JSON.new()
    var error = json.parse(body.get_string_from_utf8())
    
    if error == OK:
        var data = json.get_data()
        if data.success:
            sesion_id = data.data.pk_sesion
            print("Sesión iniciada con ID: ", sesion_id)
            cargar_menu()
```

### Ejemplo 3: Cargar Menú y Platos

```gdscript
var menus = []
var platos_actuales = []

func cargar_menu():
    api_client.get_request("/menu", _on_menus_cargados)

func _on_menus_cargados(result, response_code, headers, body):
    var json = JSON.new()
    var error = json.parse(body.get_string_from_utf8())
    
    if error == OK:
        var data = json.get_data()
        if data.success:
            menus = data.data
            # Cargar platos del primer menú (desayuno)
            cargar_platos(menus[0].pk_menu)

func cargar_platos(menu_id: int):
    api_client.get_request("/menu/platos/" + str(menu_id), _on_platos_cargados)

func _on_platos_cargados(result, response_code, headers, body):
    var json = JSON.new()
    var error = json.parse(body.get_string_from_utf8())
    
    if error == OK:
        var data = json.get_data()
        if data.success:
            platos_actuales = data.data
            mostrar_platos_en_ui()
```

### Ejemplo 4: Registrar Decisión de Porcionamiento

```gdscript
var tiempo_inicio_decision = 0
var orden_actual = 1

func iniciar_decision():
    tiempo_inicio_decision = Time.get_ticks_msec()

func registrar_porcion_servida(personaje: Dictionary, plato_id: int, componentes: Array):
    var tiempo_decision = Time.get_ticks_msec() - tiempo_inicio_decision
    
    var decision = {
        "sesion_id": sesion_id,
        "escenario": "desayuno", # o "almuerzo", "cena"
        "personaje_tipo": personaje.tipo,
        "personaje_edad_rango": personaje.edad_rango,
        "personaje_sexo": personaje.sexo,
        "plato_id": plato_id,
        "componentes_servidos": componentes,
        "tiempo_decision_ms": tiempo_decision,
        "orden_servicio": orden_actual
    }
    
    orden_actual += 1
    
    api_client.post_request("/decisiones", decision, _on_decision_registrada)

func _on_decision_registrada(result, response_code, headers, body):
    var json = JSON.new()
    var error = json.parse(body.get_string_from_utf8())
    
    if error == OK:
        var data = json.get_data()
        if data.success:
            print("Decisión registrada exitosamente")
            # Continuar con siguiente personaje
```

### Ejemplo 5: Estructura de Componentes Servidos

```gdscript
# Ejemplo de cómo construir el array de componentes_servidos
func construir_componentes_servidos() -> Array:
    var componentes = []
    
    # Ejemplo: Pabellón Criollo con cantidades ajustadas por el usuario
    componentes.append({
        "componente_id": 1,
        "nombre": "Carne mechada",
        "cantidad_gramos": 80
    })
    componentes.append({
        "componente_id": 2,
        "nombre": "Arroz blanco",
        "cantidad_gramos": 150
    })
    componentes.append({
        "componente_id": 3,
        "nombre": "Caraotas negras",
        "cantidad_gramos": 100
    })
    componentes.append({
        "componente_id": 4,
        "nombre": "Plátano frito",
        "cantidad_gramos": 50
    })
    
    return componentes
```

### Ejemplo 6: Finalizar Sesión

```gdscript
func finalizar_juego():
    var datos = {
        "estado": "completada"
    }
    
    var http = HTTPRequest.new()
    add_child(http)
    http.request_completed.connect(_on_sesion_finalizada)
    
    var url = api_client.API_BASE_URL + "/sesiones/" + str(sesion_id)
    var headers = ["Content-Type: application/json"]
    
    http.request(url, headers, HTTPClient.METHOD_PUT, JSON.stringify(datos))

func _on_sesion_finalizada(result, response_code, headers, body):
    print("Sesión finalizada. Gracias por participar!")
    # Mostrar pantalla de agradecimiento
```

---

## 🔄 Flujo de Integración Completo

```
1. INICIO DEL JUEGO
   ↓
2. Pantalla de Bienvenida y Consentimiento
   ↓
3. Formulario de Datos Sociodemográficos
   ↓
4. POST /api/participantes → Obtener participante_id
   ↓
5. POST /api/sesiones → Obtener sesion_id
   ↓
6. GET /api/menu → Cargar menús disponibles
   ↓
7. ESCENARIO 1: Desayuno
   ↓
8. GET /api/menu/platos/1 → Cargar platos de desayuno
   ↓
9. Para cada personaje sintético:
   - Usuario selecciona plato
   - GET /api/menu/componentes/:plato_id
   - Usuario ajusta porciones (drag & drop)
   - POST /api/decisiones (registrar decisión)
   ↓
10. ESCENARIO 2: Almuerzo (repetir paso 7-9)
    ↓
11. ESCENARIO 3: Cena (repetir paso 7-9)
    ↓
12. PUT /api/sesiones/:id (finalizar sesión)
    ↓
13. Pantalla de Agradecimiento
    ↓
14. FIN
```

---

## 🔧 Variables de Entorno

### Para desarrollo local:

En tu script `APIClient.gd`:
```gdscript
var API_BASE_URL = "http://localhost:3000/api"
```

### Para producción (Render, Heroku, etc.):

```gdscript
var API_BASE_URL = "https://sirve-la-mesa.onrender.com/api"
```

### Detectar automáticamente:

```gdscript
var API_BASE_URL = ""

func _ready():
    if OS.is_debug_build():
        API_BASE_URL = "http://localhost:3000/api"
    else:
        API_BASE_URL = "https://sirve-la-mesa.onrender.com/api"
```

---

## 🐛 Debugging

### Verificar conexión desde Godot:

```gdscript
func test_connection():
    api_client.get_request("/health", _on_health_check)

func _on_health_check(result, response_code, headers, body):
    print("Response code: ", response_code)
    print("Body: ", body.get_string_from_utf8())
```

### CORS en desarrollo:

Si tienes problemas de CORS al probar desde el editor de Godot, asegúrate de que el backend esté configurado para aceptar todas las origins en desarrollo (ya está configurado en `server.js`).

---

## 📝 Notas Importantes

1. **Manejo de Errores**: Siempre verifica `response_code` y maneja errores apropiadamente
2. **Timeout**: HTTPRequest tiene un timeout por defecto de 30 segundos
3. **SSL**: Para HTTPS en producción, Godot maneja SSL automáticamente
4. **Offline**: Considera implementar un sistema de cola para guardar decisiones si no hay conexión

---

## 🆘 Soporte

Si tienes problemas con la integración:
1. Verifica que el backend esté corriendo (`npm start`)
2. Prueba los endpoints con herramientas como Postman o curl
3. Revisa la consola del navegador (F12) para errores de CORS
4. Revisa los logs del servidor en la terminal

---

**Última actualización:** Octubre 2025

