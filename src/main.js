import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import expressSession from "express-session";
import cookieParser from "express-cookie";
import bodyParser from "body-parser";
import path from "path";
import { readFile } from "fs/promises";

const PORT = 4000;

const app = express();

const session = expressSession({ secret: "keyboard cat" });

app.use(express.static("public"));
app.use(express.urlencoded({}));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    function (username, password, done) {
      const myCredentials = {
        id: "this is me, i promise",
        username: "Vladimir",
        password: "vladimir",
      };
      console.log(username, password);

      if (username !== myCredentials.username) {
        return done(null, false, { message: "Invalid or non existing user" });
      } else if (password !== myCredentials.password) {
        return done(null, false, { message: "Invalid or non existing user" });
      } else {
        return done(null, myCredentials, null);
      }

      // User.findOne({ username: username }, function (err, user) {
      //   if (err) {
      //     return done(err);
      //   }
      //   if (!user) {
      //     return done(null, false, { message: "Incorrect username." });
      //   }
      //   if (!user.validPassword(password)) {
      //     return done(null, false, { message: "Incorrect password." });
      //   }
      //   return done(null, user);
      // });
    }
  )
);

passport.serializeUser(function (user, done) {
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  done(null, {
    id: "this is me, i promise",
    username: "Vladimir",
    password: "vladimir",
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "./views/login.html"));
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/",
  })
);

app.get("/home", (req, res) => {
  const user = req.user;
  if (!user) res.redirect("/");
  const templateData = Object.entries(user);
  const htmlfile = readFile(path.join(process.cwd(), "./views/home.html"), {
    encoding: "utf-8",
  }).then((file) => {
    templateData.forEach((current, index) => {
      const [key, value] = current;
      file = file.replace(new RegExp(`{{${key}}}`, "g"), value);
    });

    res.send(file);
  });
});

app.listen(PORT, () => console.log("Server on port :", PORT));
