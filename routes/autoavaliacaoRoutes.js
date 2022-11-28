const express = require('express')
const router = express.Router()
const AutoavaliacaoController = require('../controllers/AutoavaliacaoController')
//helper
const checkAuth = require('../helpers/auth').checkAuth

router.get('/autoavaliacao', AutoavaliacaoController.autoavaliacao)
router.get('/', AutoavaliacaoController.showAutoavaliacao)

router.get('/testeAnsiedade', checkAuth,AutoavaliacaoController.testeAnsiedade)
router.get('/',checkAuth, AutoavaliacaoController.showTesteAnsiedade)

router.get('/testeDepressao',checkAuth, AutoavaliacaoController.testeDepressao)
router.get('/',checkAuth, AutoavaliacaoController.showTesteDepressao)

router.get('/testeEstresse',checkAuth, AutoavaliacaoController.testeEstresse)
router.get('/',checkAuth, AutoavaliacaoController.showTesteEstresse)



module.exports = router