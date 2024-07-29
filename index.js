const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userRoutes = require('./routes/userRoutes');
const examResultRoutes = require('./routes/examResultRoutes');
const reportedQuestionRoutes = require('./routes/reportedQuestionRoutes'); 
const analyticsRoutes = require('./routes/analyticsRoute'); 
const errorHandler = require('./middlewares/errorHandler');
const examRoutes = require("./routes/examRoutes")

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth/exams', examRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/examResults', examResultRoutes);
app.use('/api/reportedQuestions', reportedQuestionRoutes);
app.use('/api/analytics', analyticsRoutes); 


app.use(errorHandler);

const PORT = process.env.PORT || 5000;




app.get('/manifest.json', (req, res) => {
    res.type('application/manifest+json');
    res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
  });
app.get('/logo.png', (req, res) => {
    // res.type('application/manifest+json');
    res.sendFile(path.join(__dirname, 'public', 'logo.png'));
  });
app.get('/logo2.png', (req, res) => {
    // res.type('application/manifest+json');
    res.sendFile(path.join(__dirname, 'public', 'logo2.png'));
  });




app.get("/", (req, res) => {
    res.send("Hello , Welcome to this Exam API website")
})








app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
