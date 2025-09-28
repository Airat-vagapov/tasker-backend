const { generateSwaggerDocs } = require('./config/swagger')

generateSwaggerDocs()
    .then(() => {
        console.log('Swagger документация сгенерирована!')
        process.exit(0)
    })
    .catch(err => {
        console.log('Ошибка генерации', err)
        process.exit(1)
    })