import dotenv from 'dotenv';
dotenv.config();
import { seedKnowledgeBase } from './rag.js';

seedKnowledgeBase()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
