require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/auth.routes');
const { errorHandler } = require('./middlewares/error-handler.middleware');
const { CodedApiError } = require('./utils/CodedApiError.util');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.use(express.json());

app.get('/status', (_, res) => {
  res.json({
    status: 'Running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);

app.use((req, res, next) => {
  next(new CodedApiError('NOT_FOUND', `Cannot ${req.method} ${req.originalUrl}`, 404));
});

app.use(errorHandler);

app.listen(PORT, HOST, () => 
  console.log(""),
  console.log(""),
  console.log("=================================="),
  console.log(),
  console.log(`Server running on:` + " " + "http://" + HOST + ":" + PORT), 
  console.log(""),
  console.log("=================================="),
  console.log(""),
);
