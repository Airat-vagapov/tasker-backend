// const swaggerJSDoc = require('swagger-jsdoc');
const swaggerAutogen = require('swagger-autogen')();

const generateSwaggerDocs = () => {
    const doc = {
        info: {
            title: 'My API',
            description: 'API Documentation',
            version: '1.0.0'
        },
        host: 'localhost:8080',
        schemes: ['http'],
    }

    const outputFile = './swagger-output.json';
    const endpointsFiles = ['./server.js'];

    return swaggerAutogen(outputFile, endpointsFiles, doc)
}

module.exports = { generateSwaggerDocs }