import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Body, INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { CreateExpenditureDto } from '../src/expenditure/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();

    await app.listen(3334);

    prisma = app.get(PrismaService);

    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3334');
  });

  afterAll(async () => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@testmail.com',
      password: '123456',
    };
    describe('SignUp', () => {
      it('Should SignUp', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
      it('Should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('Should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('Should throw if no body provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
    });

    describe('SignIn', () => {
      it('Should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('Should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('Should throw if no body provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
      it('Should SignIn', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('Expenditure', () => {
    const createExpenditureDto: CreateExpenditureDto = {
      description: 'Descrição de despesa de teste',
      value: 125,
      date: new Date('2023-04-28T12:34:56.789Z'),
    };

    const dto: AuthDto = {
      email: 'test2@testmail.com',
      password: '123456',
    };

    it('Should Create Expenditure', () => {
      return pactum
        .spec()
        .post('/expenditure')
        .withBody(createExpenditureDto)
        .expectStatus(201)
        .stores('expenditureId', 'id')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        });
    });

    it('Should throw if the value is negative', () => {
      return pactum
        .spec()
        .post('/expenditure')
        .withBody({
          ...createExpenditureDto,
          value: -1,
        })
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(400);
    });

    it('Should throw if the description has more than 191 characters', () => {
      return pactum
        .spec()
        .post('/expenditure')
        .withBody({
          ...createExpenditureDto,
          description:
            'jfwehjkwodiasxmzlkvnxcijpqrstubygfaoueqnmpbyvwxcduoqlaskjdhgfzmrxytnpoeiwqkabcsldfasdasdasdasdsadasdasduiohasiduhaisduhaisduhasudhoasdkjaspdçoasudlfmç.nlṕokgfphojgfkfghjasldhaskdjghasjkdhgajlsdgalskdmnbaksjdgalksdhgva.sdhvajkshdfaksdjghalsdkhalsdkhçasjkgdaskd',
        })
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(400);
    });

    it('Should throw if the date is in the future', () => {
      return pactum
        .spec()
        .post('/expenditure')
        .withBody({
          ...createExpenditureDto,
          date: new Date('2025-04-28T12:34:56.789Z'),
        })
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(403);
    });

    it('Get All Expenditures from user', () => {
      return pactum.spec().get('/expenditure').expectStatus(200).withHeaders({
        Authorization: 'Bearer $S{userAt}',
      });
    });

    it('GetExpenditure By User', () => {
      return pactum.spec().get('/expenditure').expectStatus(200).withHeaders({
        Authorization: 'Bearer $S{userAt}',
      });
    });

    it('UpdateExpenditure', () => {
      return pactum
        .spec()
        .patch('/expenditure/{id}')
        .withBody(createExpenditureDto)
        .expectStatus(200)
        .withPathParams('id', '$S{expenditureId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        });
    });

    it('Delete Expenditure', () => {
      return pactum
        .spec()
        .delete('/expenditure/{id}')
        .expectStatus(200)
        .withPathParams('id', '$S{expenditureId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        });
    });

    it('Should throw if user try to get by ID expenditure that doesnt own', () => {
      //Create second user for validation
      pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201);

      // Login second user
      pactum
        .spec()
        .post('/auth/signin')
        .withBody(dto)
        .expectStatus(200)
        .stores('secondUserAt', 'access_token');
      return pactum
        .spec()
        .get('/expenditure/{id}')
        .expectStatus(401)
        .withPathParams('id', '$S{expenditureId}')
        .withHeaders({
          Authorization: 'Bearer $S{secondUserAt}',
        });
    });

    it('Should throw if user try to delete by ID expenditure that doesnt own', () => {
      //Create second user for validation
      pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201);

      // Login second user
      pactum
        .spec()
        .post('/auth/signin')
        .withBody(dto)
        .expectStatus(200)
        .stores('secondUserAt', 'access_token');
      return pactum
        .spec()
        .delete('/expenditure/{id}')
        .expectStatus(401)
        .withPathParams('id', '$S{expenditureId}')
        .withHeaders({
          Authorization: 'Bearer $S{secondUserAt}',
        });
    });

    it('Should throw if user try to edit by ID expenditure that doesnt own', () => {
      //Create second user for validation
      pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201);

      // Login second user
      pactum
        .spec()
        .post('/auth/signin')
        .withBody(dto)
        .expectStatus(200)
        .stores('secondUserAt', 'access_token');
      return pactum
        .spec()
        .patch('/expenditure/{id}')
        .expectStatus(401)
        .withPathParams('id', '$S{expenditureId}')
        .withHeaders({
          Authorization: 'Bearer $S{secondUserAt}',
        });
    });
  });
});
