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


// module.exports = swaggerAutogen(outputFile, endpointsFiles, doc)

// swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
//     require('../app'); // Запускает ваше приложение после генерации
// });
// const swaggerDefinition = {
//     openapi: '3.0.0',
//     info: {
//         title: 'My API',
//         version: '1.0.0',
//         description: 'API documentation using Swagger',
//     },
//     servers: [
//         {
//             url: 'http://localhost:8000',
//         },
//     ],
// }

// const options = {
//     swaggerDefinition,
//     apis: [
//         './routes/*.js',
//         // './docs/**/*.yaml',
//         // './docs/**/*.yml'
//     ],
// };

// module.exports = swaggerJSDoc(options)