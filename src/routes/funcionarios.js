// API REST de funcionarios
import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const nomeCollection = 'funcionario'
const { db, ObjectId } = await connectToDatabase()
/**********************************************
 * Validações
 * 
 **********************************************/
const validaFuncionario = [  
  check('nome', 'O nome do funcionário é obrigatório!').not().isEmpty(),
  check('cargo', 'O cargo do funcionário é obrigatório!').not().isEmpty(),
  check('telefone', 'O telefone do funcionário é obrigatório!').not().isEmpty(),
  check('cpf', 'O CPF do funcionário é obrigatório!').not().isEmpty(),
  check('rg', 'O RG do funcionário é obrigatório!').not().isEmpty(), 
  //check('salario', 'O salário do funcionário deve ser um valor numérico!').isNumeric()
]

/**********************************************
 * GET /funcionarios/
 * Lista todos os funcionarios
 **********************************************/
router.get("/", async (req, res) => {
  try {
    db.collection(nomeCollection).find({}).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna os documentos
      }
    })
  } catch (err) {
    res.status(500).json({ "error": err.message })
  }
})

/**********************************************
 * GET /funcionarios/:id
 * Lista o funcionario através do id
 **********************************************/
router.get("/:id", async (req, res) => {
  try {
    db.collection(nomeCollection).find({ "_id": { $eq: ObjectId(req.params.id) } }).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna o documento
      }
    })
  } catch (err) {
    res.status(500).json({ "error": err.message })
  }
})

/**********************************************
 * GET /funcionarios/nome/:nome
 * Lista o funcionario através de parte do seu nome
 **********************************************/
 router.get("/nome/:nome", async (req, res) => {
  try {
    db.collection(nomeCollection).find({ nome: {$regex: req.params.nome, $options: "i"} }).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna o documento
      }
    })
  } catch (err) {
    res.status(500).json({ "error": err.message })
  }
})

/**********************************************
 * POST /funcionarios/
 * Inclui um novo funcionario
 **********************************************/
router.post('/', validaFuncionario, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json(({
      errors: errors.array()
    }))
  } else {
    await db.collection(nomeCollection)
      .insertOne(req.body)
      .then(result => res.status(201).send(result)) //retorna o ID do documento inserido)
      .catch(err => res.status(400).json(err))
  }
})

/**********************************************
 * PUT /funcionarios/
 * Alterar um funcionario pelo ID
 **********************************************/
router.put('/', validaFuncionario, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json(({
      errors: errors.array()
    }))
  } else {
    const funcioanarioInput = req.body
    await db.collection(nomeCollection)
      .updateOne({ "_id": { $eq: ObjectId(req.body._id) } }, {
        $set:
        {
          nome: funcioanarioInput.nome,
          cargo: funcioanarioInput.cargo,
          telefone: funcioanarioInput.telefone,
          endereço: {
            logradouro: funcioanarioInput.endereço.logradouro,
            municipio: funcioanarioInput.endereço.municipio
          },
          cpf: funcioanarioInput.cpf,
          rg: funcioanarioInput.rg
          //salario: funcioanarioInput.salario,
        }
      },
        { returnNewDocument: true })
      .then(result => res.status(202).send(result))
      .catch(err => res.status(400).json(err))
  }
})

/**********************************************
 * DELETE /funcionarios/
 * Apaga um funcionario pelo ID
 **********************************************/
router.delete('/:id', async (req, res) => {
  await db.collection(nomeCollection)
    .deleteOne({ "_id": { $eq: ObjectId(req.params.id) } })
    .then(result => res.status(202).send(result))
    .catch(err => res.status(400).json(err))
})

export default router