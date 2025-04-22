const routes = require("express").Router();
const stateController = require("../controllers/StateController");

routes.post("/addState", stateController.addState);
routes.get("/getallstates", stateController.getAllStates);

// Fix: Add a default GET route for "/state"
routes.get("/", (req, res) => {
    res.json({ message: "State route is working!" });
});

module.exports = routes;
