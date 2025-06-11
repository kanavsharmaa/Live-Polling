import express from 'express';
import PollResult from '../models/PollResult';

const router = express.Router();

router.get('/:teacherId', async (req, res) => {
  try {
    const polls = await PollResult.find({ teacherId: req.params.teacherId }).sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    console.error('Error fetching poll results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 