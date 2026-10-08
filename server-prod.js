const http = require('http');
const fs = require('fs');
const path = require('path');
const httpProxy = require('http-proxy');

const port = 3030;
const targetApi = 'http://localhost:5005';
const proxy = httpProxy.createProxyServer({});

// Manejo de errores del proxy para evitar caídas
proxy.on('error', function (err, req, res) {
    console.error('�R Error en el Proxy:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Proxy Error', message: err.message }));
});

const server = http.createServer((req, res) => {
    // �xa� REDIRECCI�N DE API AL BACKEND
    if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) {
        // console.log(`�x� Proxying: ${req.url} -> ${targetApi}`);
        // IMPORTANTE: Eliminamos el prefijo /api porque el backend espera rutas directas (ej: /auth/login)
        req.url = req.url.replace(/^\/api/, ''); 
        
        proxy.web(req, res, { target: targetApi });
        return;
    }

    // �x�️ SERVICIO DE ARCHIVOS ESTÁTICOS (FRONTEND)
    let filePath = path.join(__dirname, 'build', req.url === '/' ? 'index.html' : req.url);
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Si el archivo no existe (rutas de React), sirve el index.html del build
            filePath = path.join(__dirname, 'build', 'index.html');
        }
        
        fs.readFile(filePath, (error, content) => {
            if (error) {
                res.writeHead(500);
                res.end('Error cargando el archivo index.html');
            } else {
                const ext = path.extname(filePath);
                let contentType = 'text/html';
                if (ext === '.js') contentType = 'text/javascript';
                if (ext === '.css') contentType = 'text/css';
                if (ext === '.png') contentType = 'image/png';
                if (ext === '.ico') contentType = 'image/x-icon';
                
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    });
});

server.listen(port, () => {
    // console.log(`�xa� Servidor de producción + Proxy corriendo en puerto ${port}`);
    // console.log(`�x Redirigiendo /api a ${targetApi}`);
});
