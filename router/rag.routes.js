import express from 'express';
import ragController from '../controller/rag.controller.js';
const router = express.Router();

router.post('/ingest', ragController.ingestDocument);

router.post('/ask', ragController.askQuestion);

export default router;