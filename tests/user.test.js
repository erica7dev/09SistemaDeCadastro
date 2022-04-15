//TESTANDO CONEXÃO CADASTRO DE USER

const app = require('../src/app');
const supertest = require("supertest");
const request = supertest(app);

//métodos globais do jest
//será exec. antes de todos os outros
beforeAll(() => {
    //insere user no db
    return request
        .post('/user')
        .send(mainUser)
        .then(res => {})
        .catch(err => console.log(err));
});
//será exec. depois de todos os outros testes
afterAll(() => {
    //remove do db (mantem db limpo)
    return request
        .delete(`/user/${mainUser.email}`)
        .then(res => {})
        .catch(err => console.log(err));
});

//beforeEach = pra cada teste roda o inicio d ecada


//img pertence a user - 1 - n
describe("Cadastro de usuário", () => {
    test("Usuário deve ser cadastrado com sucesso", () => {
        const time = Date.now();
        const email = `${time}@teste.com`;
        const user = {name: "Erica", email, password: "1234"};

        return request
            .post("/user")
            .send(user)
            .then(res => {
                expect(res.statusCode).toEqual(200);
                expect(res.body.email).toEqual(email);}).catch(err => {
                    fail(err)
                });
    });


test("Deve impedir que usuário se cadastre com os dados vazios", () => {
    const user = { name: "", email: "", password: "" };

    return request
    .post("/user")
    .send(user)
    .then(res => {
        expect(res.statusCode).toEqual(400); 
        //400 = Bad Request
    }).catch(err => {
        fail(err);
    });
});

test("Deve impedir que um usuário se cadastre com um e-mail repetido", () => {
    const time = Date.now(); 
    const email = `${time}@teste.com`;
    const user = { name: "Erica", email, password: "1234" };

    return request
        .post("/user")
        .send(user)
        .then(res => {
            expect(res.statusCode).toEqual(200);
            expect(res.body.email).toEqual(email);

            return request
                .post('/user')
                .send(user)
                .then(res => {

                    expect(res.statusCode).toEqual(400);
                    expect(res.body.error).toEqual("E-mail já cadastrado.");

                })
                .catch(err => fail(err));

        }).catch(err => {
            fail(err);
        });
    });
});


describe("Autenticação", () => {
    test("Deve retornar um token quando efetuar login", () => {
        return request
            .post('/auth')
            .send({ email: mainUser.email, password: mainUser.password })
            .then(res => {
                expect(res.statusCode).toEqual(200);
                expect(res.body.token).toBeDefined();
            })
            .catch(err => {
                fail(err)
            });
    });

    test("Deve impedir que um usuário não cadastrado faça login", () => {
        return request
            .post('/auth')
            .send({ email: 'jdiwjaidjwi@djasaji.com', password: '123' })
            .then(res => {
                expect(res.statusCode).toEqual(403); //Forbbiden (Acesso proibido)
                expect(res.body.errors.email).toEqual("E-mail não cadastrado.");
            })
            .catch(err => {
                fail(err)
            });
    });
    
    test("Deve impedir que um usuário faça login com a senha errada", () => {
        return request
            .post('/auth')
            .send({ email: mainUser.email, password: 'errada' })
            .then(res => {
                expect(res.statusCode).toEqual(403);
                expect(res.body.errors.password).toEqual("Senha incorreta.");
            })
            .catch(err => {
                fail(err)
            });
    });
});
