# **DOCUMENTO MAESTRO DE INGENIERÍA: Gemelo Digital Logístico ESMAX (Planta Maipú)**

**Rol del Agente:** Actúa como un Senior 3D Web Engineer y Arquitecto de Software experto en React, Next.js (App Router), React Three Fiber (R3F), Zustand y GSAP.

**Misión del Proyecto:** Construir una "One App" (SPA) que funcione como un simulador interactivo 1:1 de un centro de distribución de lubricantes. La aplicación debe ser ultraligera, por lo que **ESTÁ ESTRICTAMENTE PROHIBIDO usar modelos .glb o .gltf externos**. Toda la geometría (Racks, Bodega, Camiones) debe ser procedural usando primitivas de Three.js (BoxGeometry, CylinderGeometry, etc.).

## **1\. STACK TECNOLÓGICO Y ARQUITECTURA**

* **Framework:** Next.js con Tailwind CSS para la UI superpuesta (Glassmorphism).  
* **Motor 3D:** @react-three/fiber y @react-three/drei.  
* **Estado Global:** zustand (para manejar estados de simulación: idle, inbound, outbound, y modo de edición).  
* **Animaciones:** gsap para interpolación de cámaras y movimiento de camiones.  
* **Sistema de Medidas:** Sistema Métrico Absoluto 1:1. **(1 unidad Three.js \= 1 metro real).**

## **2\. SISTEMA DE COORDENADAS Y TERRENO GLOBAL**

* **Origen (0,0,0):** Esquina Noroeste del predio.  
* **Dimensiones Totales:** Eje X (Fondo) \= 100m. Eje Z (Ancho) \= 50m.  
* **Zonificación Principal:**  
  * **Bodega (Warehouse):** X \= 0 a 60\. Área: 60x50m.  
  * **Patio (Yard):** X \= 60 a 100\. Área: 40x50m. Nivel Y \= 0\.

## **3\. ESPECIFICACIONES DE LA BODEGA (X: 0 a 60\)**

* **Losa Elevada:** Un BoxGeometry de 60x50m ubicado a una altura **Y \= 1.2m**. Todo el contenido de la bodega opera sobre este nivel.  
* **Muros y Techo:** Muros perimetrales de 12m de altura. El techo debe usar un material transparent={true}, opacity={0.2} para permitir vista cenital.  
* **Zonas de Staging:** Dos rectángulos pintados en el piso de 10x20m adosados al muro de X=60.  
  * Staging Inbound (Z: 10 a 30).  
  * Staging Outbound (Z: 30 a 50).  
* **Slotting y Estanterías (Racks):**  
  * **Pasillos:** Mantener estrictamente pasillos libres de 2.8m (Eje Z) entre filas de racks.  
  * **ZONA A (Racks Dinámicos / Tambores):** Cerca del staging (X: 40 a 50). Niveles 0 y 1 con material tipo "malla de acero" para cumplir normativa **DS 43** anticaídas.  
  * **ZONA B (Racks Selectivos):** Centro (X: 20 a 40). Módulos de doble profundidad (2.4m ancho), 6 niveles, 11m de altura.  
  * **ZONA C (Piso / Baja Rotación):** Fondo (X: 10 a 20). Cilindros apilados a nivel de piso.  
* **DS 43 (Inflamables):** En la esquina X=0, Z=0, crear un "Pretil" (dique de contención) de 10x15m. Muro perimetral de 0.2m de altura, piso de color rojo oscuro. Separado por pasillos de 1.2m del resto.

## **4\. ESPECIFICACIONES DEL PATIO Y ANDENES (X: 60 a 100\)**

* **Andenes (Muelles):** En el muro divisorio (X=60). Son 4 rampas/huecos.  
  * Inbound (Recepción): Muelle 1 (Z=15) y Muelle 2 (Z=19).  
  * Outbound (Despacho): Muelle 3 (Z=28) y Muelle 4 (Z=32).  
* **Canaleta DS 43:** Línea azul en el piso a lo largo de X=63 (captación de derrames).  
* **Portones Perimetrales (Eje X=100):**  
  * Norte (Entrada): Ancho 6m en Z=5.  
  * Sur (Salida): Ancho 6m en Z=39.  
* **Infraestructura:**  
  * Romana de Pesaje: Rectángulo de 18x3m en X=96, Z=12.  
  * Radio de Giro: Círculo trazado en el piso de 25m de diámetro en el centro del patio (X=80, Z=25). Debe estar libre.  
* **DS 148 (Zona RESPEL \- Residuos Peligrosos):**  
  * Estructura techada de 10x20m.  
  * **Regla estricta:** Debe mantener un retiro vacío de exactamente 15m hacia cualquier borde exterior (Z=0, Z=50 o X=100). Ubicación matemática sugerida: Centro superior (X=80, Z=15).

## **5\. NAVEGACIÓN Y CÁMARA (WASD LIBRE)**

El usuario debe poder "caminar" por la instalación sin bloquearse.

* Usa \<KeyboardControls\> de @react-three/drei envolviendo el canvas. Mapeo: W, A, S, D, Flechas.  
* Implementa un hook useFrame que lea las teclas y mueva físicamente la cámara localmente usando camera.translateZ() y camera.translateX().  
* Usa CameraControls de Drei para permitir la rotación con el ratón. Al avanzar con WASD, sincroniza el "target" del CameraControls para evitar el bloqueo del zoom por acercamiento al pivote.

## **6\. MÁQUINA DE ESTADOS Y SIMULACIÓN VEHICULAR (GSAP)**

El estado es manejado por Zustand. El camión procedural mide 18x2.6x2.7m (Tracto \+ Rampla).

* **Estado: INBOUND (Recepción):**  
  1. Camión aparece en X=100, Z=5.  
  2. Avanza hasta Romana (X=96). Pausa 2 seg (Pesaje).  
  3. Avanza y hace curva apoyándose en el radio de 25m.  
  4. Retrocede hasta Muelle 1 o 2\.  
  5. Salida por el mismo portón Norte.  
* **Estado: OUTBOUND (Despacho):**  
  1. Camión aparece en X=100, Z=39.  
  2. Hace curva apoyándose en el radio de 25m.  
  3. Retrocede a Muelle 3 o 4\.  
  4. Sale por el portón Sur, haciendo pausa en romana de salida.

## **7\. INSTRUCCIONES DE EJECUCIÓN PARA EL LLM**

No intentes programar toda la aplicación en una sola respuesta. Sigue esta hoja de ruta iterativa cuando el usuario te lo solicite:

* **Fase 1:** Store de Zustand y Setup del Canvas con la Cámara WASD.  
* **Fase 2:** Componente Terrain.jsx y Warehouse.jsx (Losa, Muros, DS43 y Racks Procedurales).  
* **Fase 3:** Componente Yard.jsx (Andenes, RESPEL a 15m, Romana, Portones).  
* **Fase 4:** Modelado del Truck.jsx procedural y secuencias de animación GSAP.  
* **Fase 5:** Sidebar de UI sobre HTML para disparar los estados de simulación.
