# 🎸 TabRush · El "Guitar Hero" para tu Navegador

**TabRush** es un videojuego de ritmo multiplataforma que lleva la experiencia de los clásicos juegos de consola directamente a tu navegador y dispositivo iOS. A diferencia de otros juegos de ritmo, **TabRush permite al usuario subir sus propias canciones**, las cuales son procesadas para generar automáticamente las "tabs" (notas) de juego, ofreciendo una jugabilidad infinita basada en tu propia biblioteca musical.

---

## 📺 Gameplay en Acción
Mira cómo TabRush procesa y permite jugar cualquier pista de audio en tiempo real:

<video src="assets/videonormalsongplay.mp4" autoplay loop muted playsinline width="100%"></video>

---

## 🚀 Stack Tecnológico

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)
![Web Audio API](https://img.shields.io/badge/Web_Audio_API-FF5722?style=for-the-badge&logo=javascript&logoColor=white)

---

## ✨ Características Principales

* **Generación Automática de Tabs:** Sube cualquier archivo de audio y deja que los algoritmos de TabRush analicen el ritmo y la frecuencia para generar un nivel jugable automáticamente.
* **Experiencia de Juego Fluida:** Motor de renderizado optimizado con **React + Vite** para asegurar una latencia mínima de entrada (input lag), crucial en juegos de ritmo.
* **Sincronización en la Nube:** Guarda tus mejores puntuaciones y tu biblioteca de canciones personalizadas mediante **Firebase Firestore**.
* **Juega donde quieras:** Gracias a **Capacitor**, disfruta de una experiencia nativa en **iOS** o juega directamente desde tu navegador favorito.
* **Librería de Usuario:** Gestiona tus canciones subidas, portadas y récords personales en un dashboard intuitivo.

---

## 📸 Capturas del Juego

Explora la interfaz de TabRush, desde el selector de canciones hasta el motor de juego:

### 🎮 Gameplay y Motor de Ritmo
| Pantalla de Juego | Procesamiento de Audio |
| :---: | :---: |
| ![Captura1](assets/Captura1.png) | ![Captura2](assets/Captura2.png) |

### 🎼 Librería y Gestión de Canciones
| Mi Biblioteca | Selector de Dificultad |
| :---: | :---: |
| ![Captura3](assets/Captura3.png) | ![Captura4](assets/Captura4.png) |

### 📱 Perfil y Sincronización Móvil
| Récords Personales | Ajustes del Sistema |
| :---: | :---: |
| ![Captura5](assets/Captura5.png) | ![Captura6](assets/Captura6.png) |

---

## 🛠️ Instalación y Configuración Local

Si quieres contribuir al desarrollo o probar TabRush localmente:

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/IGprojects/TabRush.git](https://github.com/IGprojects/TabRush.git)
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configuración de Firebase:**
    Necesitarás crear un proyecto en Firebase y añadir tus credenciales en un archivo `.env` en la raíz:
    ```env
    VITE_FIREBASE_API_KEY=tu_api_key
    VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
    VITE_FIREBASE_PROJECT_ID=tu_project_id
    VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
    VITE_FIREBASE_APP_ID=tu_app_id
    ```

4.  **Iniciar el servidor:**
    ```bash
    npm run dev
    ```

---

## 🛡️ Seguridad y Rendimiento

El juego utiliza **Security Rules de Firebase** para garantizar que los archivos de audio subidos solo sean accesibles por sus propietarios. Además, el procesamiento de las notas se realiza de manera eficiente para no saturar el hilo principal del navegador, manteniendo 60 FPS estables durante el gameplay.

---
**Desarrollado con ❤️ y mucho ritmo por [IGprojects](https://github.com/IGprojects)**
