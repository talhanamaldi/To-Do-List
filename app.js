const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connecting database localy -> mongodb://127.0.0.1:27017/todolistDB
//connecting database using cloud
mongoose.set('strictQuery', false);
//to create new database write after the link /(db name)
mongoose.connect('mongodb+srv://talhanamaldi:1Talha234@cluster0.nz2ivut.mongodb.net/todolistDB', { useNewUrlParser: true,useUnifiedTopology: true},(err=>{
  if(err){
    console.log(err);
  }else{
    console.log("Connected to database");
  }
}));

const itemsSchema = new mongoose.Schema({
  name: String
})

const Item = new mongoose.model("Item",itemsSchema);

const item1 = new Item ({ name: "Welcome to your todolist!"});
const item2 = new Item ({ name: "Hit the + button to add an item"});
const item3 = new Item ({ name: "asaasdadd"});

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {



  Item.find(function(err, found){

    if(found.length === 0){
      Item.insertMany([item1,item2,item3],function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Added");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: found});
    }

  })



});

app.post("/", function(req, res){

  const item = req.body.newItem;

  const listName = req.body.list;


  const newItem = new Item ({ name: item});

  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,found){
      found.items.push(newItem);
      found.save();
      res.redirect("/"+listName);
    })
  }



});

app.post("/delete",function(req,res){
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.deleteOne({_id:checkItemId},function(err){
      if(err) console.log(err);
      else console.log("deleted");
    })
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkItemId}}},function(err,found){
      if(!err) res.redirect("/"+listName);
    })

  }


})

//Creating dynamic sites with ecpress
app.get("/:listname",function(req,res){
  const listname =_.capitalize(req.params.listname);
  List.findOne({name:listname},function(err,found){
    if(!err){
      if(!found){
        const list = new List({
          name: listname,
          items:[item1,item2,item3]
        })

        list.save();
        res.redirect("/"+listname)
      }else{
        res.render("list",{listTitle: found.name, newListItems: found.items})
      }
    }

  })

})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
