const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const pg = require("pg");

const homeStartingContent = "Welcome To Daily Journal - Where Cords Come Alive";
const aboutContent = "Welcome to Daily Journal - A digital haven where people can express their views and thoughts. Our blog is established in 2023 and was born out of a shared passion for the need to know and learn. Here, we help people post informative articles, inspiring stories, helpful tips. Our mission is to educate, entertain, inspire, or provide valuable insights to the reading audience. Join us on this journey of exploration, learning or creativity.";
const aboutMyself1 = "Meet Ayush Pundir - The Face Behind Daily Journal";
const aboutMyself2 = "I've always been passionate about learning, and this blog is my way of sharing knowledge, inspiring others. I started this in the november 2023 when I felt that people should learn and express themself and there should be a way through which they can do that."
const aboutMyself3 = "Here on Daily Journal, you can look forward to learn and write your own informative articles, personal stories, tips and tricks, etc. I am excited to share and read the etories that are going to be on this site.";
const aboutMyself4 = "I'd love to get to know you better! Feel free to tell me about the site on the mail - ayushpundir2018748@gmail.com. Your thoughts and feedback are always welcome."
const contactContent = "Drop me a line at ayushpundir2018748@gmail.com. I check my email regularly and will do my best to get back to you as soon as possible.";
const app = express();

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "blogPost",
    password: "Ayush@123",
    port: 5432,
});
db.connect();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let posts = [];

async function getData() {
    const result = await db.query("SELECT title, description FROM blogs");

    const ans = [];

    result.rows.forEach((data) => {
        ans.push({
            title: data.title,
            description: data.description
        });
    });

    return ans;
}

app.get("/", async (req, res) => {

    posts = await getData();

    res.render("home.ejs", {
      homeContent: homeStartingContent,
      posts: posts
    });
});

app.get("/about", (req, res) => {
    res.render("about.ejs", { contentAbout : aboutContent,
         contentMyself1: aboutMyself1,
         contentMyself2: aboutMyself2,
         contentMyself3: aboutMyself3,
         contentMyself4: aboutMyself4
    });
});

app.get("/contact", (req, res) => {
    res.render("contact.ejs", { contentContact : contactContent });
});

app.get("/compose", (req, res) => {
    res.render("compose.ejs");
});

app.post("/compose", async (req, res) => {
    const postedTitle = req.body.postTitle;
    const postedContent = req.body.postBody;

    try {
        await db.query(
            "INSERT INTO blogs (title, description) VALUES ($1, $2)",
            [postedTitle, postedContent]
        );
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }

});

app.get("/posts/:postName", (req, res) => {
    const requestedTitle = _.lowerCase(req.params.postName);

    posts.forEach((post) => {
        const storedTitle = _.lowerCase(post.title);
        if (storedTitle === requestedTitle) {
            res.render("post", {
                title: post.title,
                content: post.description
            });
        }
    });
});

app.get("/posts/delete/:postTitleName", async (req, res) => {
    let requestedTitle = req.params.postTitleName;
    requestedTitle = requestedTitle.trim();

    if (requestedTitle.charAt(0) === ':') {
        requestedTitle = requestedTitle.substring(1);
    }

    console.log(requestedTitle);

    try {
        await db.query("DELETE FROM blogs WHERE title = $1", [requestedTitle]);
        res.redirect("/");
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
