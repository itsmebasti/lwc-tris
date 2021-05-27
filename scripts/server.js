const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
const path = require('path');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3001;
const DIST_DIR = './dist';

express()
    .use(
        helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: ["'self'", 'https://*.firebasedatabase.app'],
                fontSrc: ["'self'", 'data:'],
                styleSrc: ["'self'", "'unsafe-inline'"],
                connectSrc: ["'self'", 'ws:'],
                scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'", 'https://www.gstatic.com', 'https://*.firebasedatabase.app'],
            }
        })
    )
    .use(compression())
    .use(express.static(DIST_DIR))
    .use('*', (req, res) => {
        res.sendFile(path.resolve(DIST_DIR, 'index.html'));
    })
    .listen(PORT, () =>
        console.log(`✅  Server started: http://${HOST}:${PORT}`)
    );
