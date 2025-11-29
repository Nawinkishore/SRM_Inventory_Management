// routes/invoice.routes.js
import express from 'express';
import { 
  createInvoice, 
  getInvoices, 
  updateInvoice, 
  deleteInvoice 
} from '../controllers/invoice.controller.js';

const router = express.Router();

// Make sure routes are defined correctly
router.post('/create', createInvoice);
router.get('/getInvoices', getInvoices);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;