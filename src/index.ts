import express from 'express';

const app = express();
const port = 3000;

app.post('/signup', () => {});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

export default app;
