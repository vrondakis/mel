const express = require("express");
const bodyParser = require("body-parser");
const mel = require("../");

const app = express();
const router = express.Router();


// Parse post request JSON body
app.use(bodyParser.json());


// Initialise mel with the Express router
mel.init(router);

mel.post({
    route : "/example-post",
    input : (input) => {
        input.hello = mel.oneOf("oneof", "One of a type", {
            values : ["a", "b"]
        });

        input.email = mel.email("email", "Any email address");
    },
    run: (args) => {
        console.log("args");
    }
});

mel.all({
    route : "/example-any",
    input : (input) => {
        input.integerExample = mel.int("test", "Integer example", {
            min : 10,
            max : 20
        });

        input.integerWithDefault = mel.int("count", "Integer with a default example", {
            min: 50,
            max: 500,
            default : 50
        });

        input.float = mel.float("float", "Some float value", {
            min : 10,
            max : 500
        });

        input.string = mel.string("string", "Some string", {
            minLength : 10,
            maxLength : 15,
        });    
    },
    run : (args) => {
        return mel.success(args);
    }
});

// path parameters
mel.get({
	route : "/user/:user",
	description : "",
	run : ({user}) => {
		return mel.success(user);
	}
})

mel.get({
    route : "/example-error",
    run : () => {
        return mel.failure("error message");
    }
})



app.use(router);

app.listen(3030, () => {
    console.log(`Server is running on port 3030`);
});

// custom validator that fails with a status
const loggedIn = () => ({
	name : "logged-in",
	description : "User logged in",
	hidden : true, // ignore if there's a value or not, useful for checking something in req
	value : (value, req) => {
		if(req.user){
			return types.validationSuccess(req.user)
		} else
			return types.validationError("401", 401);
	}
});

mel.get({
	route : "/user",
	description : "Returns the current users details",
	input : (input) => {
		input.user = loggedIn()
	},
	run : ({user}) => {
		return mel.success(user);
	}
});
