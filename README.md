Mel is a NodeJS REST framework that makes validation very easy while still giving you control over everything. 

```javascript
// You can use mel.get, mel.post, mel.put and  mel.delete
mel.post({
	// First, define a route
	route: '/user/search',

	// Then define an input function, this will be called to validate user inputs automatically, it is optional
	// You do not need to use all of the parameters, only input is required, but you also have access to the request object if you have to do manual validation for anything
	input: (input, req) => {
		/**
			// You can call different validation functions to validate user inputs for you automatically.
			// name is the name of the parameter. Eg yoursite.com/whatever?whatever=hello - name would be 'whatever'
			// If default is set (it's optional) and the user hasn't set the value or it is invalid, default will be used instead.

			// Validates a string, 
			mel.string(name, help, min, max, default) 				

			// Integers
			mel.int(name, help, min, max, default)

			// Floats
			mel.float(name, help, min, max, default)

			// Provide enums with an array eg ["danger", "warning", "success"], it will only accept one of those inputs
			mel.enum(name, help, enums, default)

			// Validates currency (only 0.00, over 0, ect)
			mel.currency(name, help, maximum, default)

			// Email
			mel.email(name, help, default)

			// Validates a json-formatted array
			mel.array(name, help, default)

			// File
			mel.file(name, help, required, types, maxSize)

			// Image, dimensions is [500,200] in px
			mel.image(name, help, required, maxSize, dimensions)

			// User validation, uses passport.js
			mel.verified()
		*/

		input.username = mel.string('username', 'Username', 1, 10)
		input.gender = mel.enum("gender", "Gender" ['male', 'female', 'other'], 'male')
	},

	// run is called after all the inputs have been successfully validated.
	// All of your inputs are stored inside the args object. 
	// cb is the callback, you should call this with mel.success(data) or mel.failure("message") (or json) (see below) 
	// req is the request if you need to access it (optional)
	// res is the result, if you need to manually use it.
	// if you do not call the cb function, for example if you do not want to return json, you must call the next() function once you are done
	run: (args, cb, req, res, next) => {
		console.log("Username provided: ", args.username)

		// You can access the filtered arguments directly
		if(args.gender == 'male'){
			// cb(data) calls res.json(data)
			// mel.success formats json into {status:"ok", data:data} format
			cb(mel.success({
				username: "user",
			}))

			// result: {"status":"ok", "data": {"username": "user"}}


		} else{
			cb(mel.failure("User not found"))

			// result: {"status":"failure", "message": "User not found"}
		}
	}

})
```
