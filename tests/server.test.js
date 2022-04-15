const app = require("../src/app");
const supertest = require('supertest'); //bib supertest - testa http
//quem ele vai testar
const request = supertest(app);

test("Aplicação deve responder na porta 3000", async(done) => {
    try{
        const res = await request.get('/');
        //espera-se...
        expect(res.statusCode).toEqual(200);
        done();
    }catch(err){
        fail(err);
    }
});
//done = aguarde ter feito...


