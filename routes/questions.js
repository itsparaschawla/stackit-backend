import express from 'express';
import Question from '../models/Question.js';
import { verifyToken } from '../middleware/authMiddleware.js';


const router = express.Router();

// POST /api/questions
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const newQuestion = new Question({
      title,
      description,
      tags,
      askedBy: req.user.username, // 👈 Add this
    });
    const saved = await newQuestion.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error saving question:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// GET /api/questions
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/questions/:id
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Not found' });
    res.json(question);
  } catch (err) {
    console.error('Error getting question:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// POST /api/questions/:id/answers
router.post('/:id/answers', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) return res.status(404).json({ error: 'Question not found' });

    question.answers.push({
      text,
      answeredBy: req.user.username, // 👈 Add this line
    });

    await question.save();

    res.status(201).json({ message: 'Answer added successfully', question });
  } catch (err) {
    console.error('Error posting answer:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// PUT /api/questions/:questionId/answers/:answerId/vote
router.put('/:questionId/answers/:answerId/vote', verifyToken, async (req, res) => {
  const { voteType } = req.body;

  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const answer = question.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    if (voteType === 'up') answer.votes += 1;
    else if (voteType === 'down') answer.votes -= 1;

    await question.save();
    res.json({ message: 'Vote updated', answer });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/questions/:questionId/answers/:answerId/accept
router.put('/:questionId/answers/:answerId/accept', async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    // First, unmark all answers
    question.answers.forEach(ans => ans.isAccepted = false);

    // Then mark selected one
    const answer = question.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });

    answer.isAccepted = true;

    await question.save();
    res.json({ message: 'Answer accepted', answer });
  } catch (err) {
    console.error('Accept error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// GET /api/questions/user/:username
router.get('/user/:username', async (req, res) => {
  try {
    const questions = await Question.find({ askedBy: req.params.username });
    const answered = await Question.find({ 'answers.answeredBy': req.params.username });

    res.json({ questions, answered });
  } catch (err) {
    console.error('Error fetching profile data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



export default router;
