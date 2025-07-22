import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  text: String,
  answeredBy: { type: String, required: true },  // ✅ NEW
  createdAt: {
    type: Date,
    default: Date.now
  },
  votes: {
    type: Number,
    default: 0
  },
  isAccepted: {
    type: Boolean,
    default: false
  }
});


const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: [String],
  askedBy: { type: String, required: true },       // ✅ NEW
  answers: [answerSchema],  // 🔥 New field!
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
