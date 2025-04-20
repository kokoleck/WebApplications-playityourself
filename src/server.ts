// src/server.ts
import initApp from "./app";
import { setupSwagger } from "./swagger";
import session from "express-session";
import passport from "passport";
import "./config/googleAuth";
import googleRoutes from "./routes/google_routes";


const port = process.env.PORT || 3000;

initApp().then((app) => {
  // session + passport
  app.use(
    session({
      secret: "session_secret",
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Google routes
  app.use("/api/auth", googleRoutes);

  setupSwagger(app);

  app.listen(port, () => {
    console.log(`PlayItYourself is live at http://localhost:${port}`);
  });
});
