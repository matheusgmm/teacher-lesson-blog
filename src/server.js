const app = require('./app');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log('');
  console.log('');
  console.log('==================================');
  console.log();
  console.log(`Server running on: http://${HOST}:${PORT}`);
  console.log('');
  console.log('==================================');
  console.log('');
});
