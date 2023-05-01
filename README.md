## Description

#### API_REST utilizando NestJS

Autenticação de usuário.
CRUD de despesas.

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

[Prisma](https://www.prisma.io/) Node.js and Typescript ORM

## Installation

Essa API utiliza o banco de dados Postgres, hospedado no docker e descrito no arquivo docker-compose.yml.

Certifique-se de fazer o download do 
[Docker](https://docs.docker.com/) para execução dos scripts;

Verifique o arquivo package.json para mais detalhes da execução dos scripts. Em sistemas não baseados em Unix, poderá necessitar adaptação.

```bash
$ yarn install
```

## ENV

Certifique-se de que o .env e .env.test estejam de acordo com o repositório e a conexão com o BD.

Neste caso, deixei os .envs públicos pois o BD também é.

## Running the app

```bash
# watch mode

# subindo banco de dados com docker compose
$ yarn db:dev:up

# Aplicando migrations do Prisma
$ yarn prisma:dev:deploy

$ yarn start:dev
```

## Test

Para rodar o teste, é necessário rodar os scripts para subir o banco de testes

```bash

# subindo banco de dados com docker compose
$ yarn db:test:up

# Aplicando migrations do Prisma
$ yarn prisma:test:deploy

# e2e tests
$ yarn run test:e2e
```

O arquivo com a collection do postman se encontra na raiz do projeto. Para utilizar basta importar no [Postman]("https://www.postman.com/")

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](LICENSE).
