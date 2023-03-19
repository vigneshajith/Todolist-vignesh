const express = require("express");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
app.set("view engine", "ejs");

require('dotenv').config({ path: 'env/.env' })
const mdbpassword = process.env.mongodbpassword;

const lodash = require("lodash");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://vignesh-admin:"+mdbpassword+"@cluster23.2fymgyj.mongodb.net/todolistdb");

const itemSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemSchema);

const Item1 = new Item({
  name: "Welcome to your todolist!",
});

const Item2 = new Item({
  name: "Hi the + button to add a new item.",
});
const Item3 = new Item({
  name: "<-- Hit this to delete an item",
});

const defaultarray = [Item1, Item2, Item3];

const listSchema = {
  name: String,
  item: [itemSchema],
};

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {
  const day = date.getDate();
  Item.find({}, (err, result) => {
    if (err) console.log(err);

    if (result.length === 0) {
      Item.insertMany(defaultarray, () => {
        console.log("items was added to todolistdb");
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: day, newListItems: result });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const list = req.body.list;
  const day = date.getDate();


  const InputItem = new Item({
    name: itemName,
  });

  if (list === day) {
     InputItem.save();
     res.redirect("/");
  } else {
    List.findOne({ name: list }, (err, result) => {
          result.item.push(InputItem);
          result.save();
          res.redirect("/" + list);
    })
  }
 
});

app.post("/delete", (req, res) => {
  const checkedItem = req.body.checkbox;
  const listname = req.body.Listname;
  const day = date.getDate();

  if (listname === day) {
      Item.findByIdAndRemove(checkedItem, (err) => {
        if (!err) {
          res.redirect("/");
        }
        
      });
  } else {
    List.findOneAndUpdate({ name: listname }, { $pull: { item: { _id: checkedItem } } }, (err, result) => {
      if (!err) {
        res.redirect("/"+listname)
      }
    })
  }


});

app.get("/:listname", function (req, res) {
  const listname = lodash.capitalize(req.params.listname); 
  List.findOne({ name: listname }, (err, result) => {
    if (!err) {
      if (!result) {
        const list = new List({
          name: listname,
          item:defaultarray
        })
        list.save();
        res.redirect("/"+listname)
      } else {
        res.render("list",{listTitle:result.name,newListItems:result.item})
      }
    }
  });
  
});

app.get("/about", function (req, res) {});

const port = process.env.PORT || 3001;

app.listen(port, function () {
  console.log("Server started on port "+port);
});
