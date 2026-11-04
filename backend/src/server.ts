import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`Server Scamora backend berjalan di port ${env.PORT}`);
});

