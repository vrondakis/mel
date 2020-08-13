
# Drapbacks

Manolis Vrondakis - b6028420 - AAAF assignment

  

#### Running the client

Mel is a library that aims to abstract the repetitive complexity of Express REST APIs.

  
  
  
  
  

Mel was created with two things in mind

-Easily create and validate REST API requests

- Still have access to the raw objects and ability to overtake

  

Another key feature of Mel is being able to easily define your own custom validators. Each validator is passed the request object and can respond in a way that follows Mel’s error pattern.




```javascript
mel.get({
    route: "/example",
    description: "Most simple example of creating a GET API with Mel",
    run: async () => {
        return mel.success()
    }
});
```

```JSON
{status: "ok", "data": {}} 
```

The first feature of mel is its input validation. Mel has a set of validators to catch the most common form of inputs. and also allows you to easilt define your own. Mel also supports path variables

```javascript
mel.get({
	route: "/users",
	description: "Echo example",
	input: (input) => {
		input.text = mel.string("data", "Data to echo", {minLength: 5, maxLength: 99})
	},
	run: async ({text}) => {
		return mel.success({
		     text
		});
	}
})

```

```javascript
{"status": "ok", "data": {"text": "Value of 'text' parameter"}}
```

Mel also supports path parameters. If an API request fails validation a JSON failure is responded with
```javascript
mel.post({
    route: "/product/{productId}",
    description: "Update a product"
    input: (input) => {
        input.title = mel.string("title", "Product title", {minLength: 6, maxLength: 80});
        input.price = mel.int("price", "Product price", {min: 5, max: 60});
    },
    run: async ({productId, title, price) => {
        return mel.failure("Product not found", 404);
    }
});
```

If a request is made without any of the parameters, an error message will automatically be generated and sent to the client

```json
{
    "status": "failure",
    "message": "Product title must be less than 80 characeters, Product price must be a number",
    "fields": {
        "title": "must be less than 80 characters",
        "price": "must be a number"
    }
}
```

Lastly, cutom validators can easily be created to give you more control over your application

```javascript
const types = require("mel/types");
const userValidator = (options = {}) => ({
    name: "logged-in",
    description: "Validates user is logged in",
    hidden: true,
    value: async (value, req, data) => {
        // Value is the value taken from the request body or path (depending on the http verb)
        // Req is the raw express request object
        // Data is the rest of the request body, so you can write validators that check multiple values. 

        if(!req.session || !req.session.user)
            return types.validationError("must be logged in", 401);
            
        // Options is passed into the validator
        if(options.allowUsername && req.session.user.username !== options.allowUsername)
            return types.validationError("does not have access", 403);


        return types.validationSuccess(req.session.user);
    }
})
```javascript
mel.get({
    route: "/admin/users" 
    description: "Get all users",
    input: (input) => {
        input.user = userValidator({allowUsername: "manolis"});    
    },
    run: ({user} => {
        // Only runs if the user exists and has the username 'manolis'
        console.log("The user who made the request is", user);
        /*
        Outputs:
                The user who made the request is {
                    username: "manolis",
                    email: "manolisvrondakis@gmail.com"
                }
        /*
        return mel.success({users: []});
    });
});
```


    
UPDATE cards c SET

c.title = :title,

c.description = :description,

c.requiredStamps = :requiredStamps

WHERE c.id = :card

`, {card: cardId, title, description, requiredStamps});

return mel.success();

}

})```


cd drapbacks-react


npm start

```

  

Alternatively, to create a production version, run **npm run build**

  

#### Running the service

```

cd drapbacks-service

npm install

// Edit config.js to edit the product configuration

npm start

```

  

#### Populating the database with values

```

mongorestore population-data

```

  

#### Running cypress Tests

```

cd drapbacks-service

npm run cypress

```

This will start the server with an in-memory mongo database and run the cypress tests. The client must be running for this to work.

  

Alternatively, if you wish to manually run the cypress tests or develop them run

```

npm run cypress-dev

npx cypress open

```

  
  

#### Extras

- Chat has
