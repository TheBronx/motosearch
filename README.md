# ¿Esto qué hace? 
Si estás buscando una moto esto te puede interesar. 
Básicamente te manda un email cada vez que se publica una moto de segunda mano o cuando una moto anunciada cambia de precio.

# ¿Cómo lo ejecuto?
Bájate el proyecto, en zip y lo descomprimes o con un `git clone`  
Entra en la carpeta donde está `package.json` y ejecuta `npm install`  
Ejecuta `node server.js`  
_Opcional: pon el comando en un cron para ejecutarlo cada hora, día o con la frecuencia que prefieras._

# Requisitos
Necesitas **Node.js** y **npm**. No hace falta base de datos, todo se almacena en ficheros locales.

# Cómo funciona realmente 
Cada vez que se ejecuta `server.js` se lanzan varios scripts, cada uno escanea los anuncios de una página: 
 - `motos.net.js` busca en motos.coches.net
 - `segundamano.js` busca en vibbo.com (antiguamente segundamano.es)
 - `milanuncios.js` busca en milanuncios.com aunque debido a Distil Networks el script ya no funciona, lo bloquean. De todas formas milanuncios da asco así que casi mejor :D
 
En cada ejecución se comparan los anuncios encontrados con los que había en la ejecución anterior. Todos los cambios se notifican por email. Si es la primera vez que se ejecuta el script, todos los anuncios serán notificados.  

Además en cada ejecución se guarda un `.csv` con todos los datos de cada anuncio (precio, km, año, enlace, etc) por si quieres consultar un histórico. Los encontrarás en la carpeta **snapshots**.

# ¿Cómo lo adapto a mis necesidades?
Lo primero es entrar en los tres scripts mencionados anteriormente y cambiar la URL de búsqueda. Actualmente la URL lista motos con una marca y modelo muy concretos (BMW F 800 GT) así que tendrás que poner la que a ti te interese. 

Siguiente y último cambio, entra en `config.json` y pon tu email para recibir las notificaciones. Pon también un mail de origen (da un poco igual, el mail se va a enviar desde tu servidor realmente). Y cuando te veas con ganas, cambia el `"enabled": false` por un `"enabled": true` para que empiecen a llegar emails.  

# Colabora
Si encuentras un error o quieres añadir cualquier funcionalidad un pull request será más que bienvenido.  
Quizá sea sencillo adaptarlo para coches también, no lo he probado, pero si eres un enlatado (con cariño) puedes intentarlo.

V's
