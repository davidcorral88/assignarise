
const corsOptions = {
  origin: [
    'http://localhost:8080', 
    'http://localhost:5551', 
    'http://185.166.213.17:8080',
    'https://rexistrodetarefas.iplanmovilidad.com',
    'https://www.rexistrodetarefas.iplanmovilidad.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

module.exports = corsOptions;
