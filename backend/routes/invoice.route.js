import express from 'express';
import { 
  createInvoice, 
  getInvoices, 
  getInvoiceById, 
  updateInvoice, 
  deleteInvoice 
} from '../controllers/invoice.controller.js';

const router = express.Router();

router.post('/create', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;