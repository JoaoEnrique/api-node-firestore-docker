import express, { response } from 'express';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { doc, deleteDoc } from "firebase/firestore";

const app = express();
const PORT = 3000;

initializeApp({
    credential: cert("firestore.json")
})

const db = getFirestore();
app.use(express.json());

// GET
app.get('/users', async (req, res) =>{
    return await db.collection('users').get().then(querySnapshot =>{
        let users = [];
        querySnapshot.forEach(documentSnapshot =>{
            let user = documentSnapshot.data();
            user.id = documentSnapshot.id;
            users.push(user);
        })

        return res.json(users)
    }).catch(error =>{
        return res.status(500).json({code: 500, message: `${error}`})
    })
}) 


// GET/:id
app.get('/users/:id', async (req, res) =>{
    let id = req.params.id;
    if(!id)
        return res.status(400).json({code: 400, message: "Erro: id do usuário não informado"})

    return await db.collection('users').doc(id).get().then(documentSnapshot =>{
        if(!documentSnapshot.exists)
            return res.status(404).json({code: 404, message: "Usuário não encontrado"})

        let user = documentSnapshot.data();
        user.id = documentSnapshot.id;
        return res.status(200).json(user)
    }).catch(error =>{
        return res.status(500).json({code: 500, message: `${error}`})
    })
}) 


app.post('/users', async (req, res)=>{
    try {
        let {name, email, password, birth_date } = req.body;
        let data = {name, email, password, birth_date };

        if(!name || !email || !password | !birth_date)
            return res.status(400).json({code: 400, message: "Todos os dados são obrigatórios"})

        return await db.collection('users').add(data).then(querySnapshot =>{
            return querySnapshot.get().then(documentSnapshot =>{
                let user = documentSnapshot.data()
                user.id = documentSnapshot.id;
                return res.status(201).json(user)
            })
        }).catch(error =>{
            return res.status(500).json({code: 500, message: `${error}`})
        })
    } catch (error) {
        return res.status(500).json({code: 500, message: `${error}`})
    }
})


app.put('/users/:id', async (req, res) =>{
    try {
        let id = req.params.id;
        let { name, email, password, birth_date } = req.body;
        let data = { name, email, password, birth_date };

        if(!id, !name, !email, !password, !birth_date)
            return res.status(400).json({code: 400, message: "Erro: todos os dados são obrigatórios"});

        if(!(await db.collection('users').doc(id).get()).exists)
            return res.status(404).json({code: 404, message: "Erro: usuário não encontrado pelo id fornecido"});

        return await db.collection('users').doc(id).update(data).then(async ()=>{
            let user = (await db.collection('users').doc(id).get()).data()
            user.id = id
            return res.status(200).json(user);
        }).catch(error =>{
            return res.status(500).json({code: 500, message: error});
        })

    } catch (error) {
        return res.status(500).json({code: 500, message: error});
    }
})


app.delete('/users/:id', async (req, res)=>{
    try {
        let id = req.params.id
        if(!id)
            return res.status(400).json({code: 400, message: "Erro: id não informado"})

        if(!(await db.collection('users').doc(id).get()).exists)
            return res.status(404).json({code: 404, message: 'Usuário não encontrado'})

        await db.collection('users').doc(id).delete().then(()=>{
            return res.status(200).json({code: 200, message: "Usuário excluido"})
        }).catch(error =>{
            return res.status(500).json({code: 200, message: error})
        })

    } catch (error) {
        return res.status(500).json({code: 500, message: error})
    }


})

app.listen(PORT, ()=>{
    console.log(`http://localhost:${PORT}`);
})