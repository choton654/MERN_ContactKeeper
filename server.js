const express = require('express');
const app = express();
const connectDb = require('./config/db');
const port = 5000;

connectDb();

app.use(express.json());
app.use(express.json({ exnded: false }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => {
  res.json({ title: 'node_react app' });
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
