import initApp from "./app";
import { setupSwagger } from "./swagger";


const port = process.env.PORT || 3000;


initApp().then((app) => {
    setupSwagger(app);

  app.listen(port, () => {
    console.log(`PlayItYourself is live at http://localhost:${port}`);
  });
});
