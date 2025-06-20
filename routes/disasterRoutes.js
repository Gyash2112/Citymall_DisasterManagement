const express = require('express');
const router = express.Router();

const {
  createDisaster,
  getDisasters,
  updateDisaster,
  deleteDisaster,
} = require('../controllers/disasterController');

router.post('/', createDisaster);
router.get('/', getDisasters);
router.put('/:id', updateDisaster);
router.delete('/:id', deleteDisaster);

module.exports = router;
