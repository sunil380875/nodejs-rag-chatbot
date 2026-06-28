import express from 'express';
import ragController from '../controller/rag.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
const router = express.Router();

router.post('/ingest', ragController.ingestDocument);

router.post('/ingest/pdf', upload.single('pdf'), ragController.ingestPdf);

router.post('/ask', ragController.askQuestion);

export default router;