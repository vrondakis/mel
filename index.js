// Mel NodeJS API library
// (C) Manolis Vrondakis 2016

var apiList = {};
var nominal = require('../../modules/nominal')();
var multiparty = require('multiparty')
var sizeOf = require('image-size')
var async = require('async')

const passport			= require('passport');


module.exports = function(router){
	var module = {}

	module.post = function(options){
		module.new(router.post, options)
	}

	module.get = function(options){
		module.new(router.get, options)
	}

	module.put = function(options){
		module.new(router.put, options)
	}

	module.delete = function(options){
		module.new(router.delete, options)
	}

	module.new = function(requestType, options){
		options = typeof options === 'object' ? options : {};
		if(!options.route){
			console.error('Mel:: New called without route');
			return;
		}

		var inputs = {};
		var args = {};

		options.input = typeof options.input !== 'undefined' ? options.input : function(){};
		

		requestType(options.route, function(req, res, next){
			
			var data = {..req.body, ..req.query}

			var form = new multiparty.Form({maxFilesSize:process.env.MAX_UPLOAD, uploadDir:process.env.ROOT_PATH+'/content/tmp'})
			form.parse(req, (err, fields, files) => {
				for(var k in fields){
					if(fields[k] && fields[k][0])
						data[k] = fields[k][0]
				}

				for(var k in files){
					if(files[k] && files[k][0])
						data[k] = files[k][0]
				}

				// console.log("%j - %j - %j", req.body, req.query, req.params)

				options.input(inputs, req);
				
				var isError = false
				async.forEach(Object.keys(inputs), (varname, callback) => {

					inputs[varname].value(data[inputs[varname].name], (value) => {	
						
						if((value===null || value===false) && (!isError)){
							isError = true
							return res.json(module.Failure(nominal.LastError, varname)); // Returns JSON error message of specific input
						}
	
						args[varname] = value
						
						

						callback()
					}, req)

				}, () => {
					options.run(args, function(data){ // Run the API call (if it exists)
						res.json(data); // Return its success
					}, req, res, next);
				})
			})
	
		});
	}


	module.string = function(name, help, min, max, def){ // Validates a string
		return { type : 'string', name : name, help : help, def: def, value : function(val, cb){ cb(nominal.String(val, def, min, max)) } }
	}

	module.int = function(name, help, min, max, def){ // Validates an integer
		return { type:'integer', name : name, help : help, def: def, value: function(val, cb){ cb(nominal.Int(val,def,min,max))} }
	}
	
	module.float = function(name, help, min, max, def){
		return { type:'float', name : name, help : help, def : def, value: function(val, cb){cb(nominal.Float(val,def,min,max))} }
	}
	
	module.enum = function(name, help, enums, def){
		return { type:'float', name : name, help : help, def : def, value: function(val, cb, req){
			cb(nominal.Enum(val, def, enums))
		}}
	}


	module.currency = function(name, help, max, def){
		return { type: 'currency', name : name, help : help, def : def, value: function(val, cb, req){
			cb(nominal.Currency(val, max, def))
		}}
	}


	module.email = function(name, help, def){ // Validates an E-Mail
		return { type : 'email', name : name, help : help, def: def, value : function(val, cb){ cb(nominal.Email(val, def))} }
	}
	
	module.array = function(name, help, def){
		return { type : 'array', name : name, help: help, def: def, value : function(val,cb){ cb(nominal.Array(val, def)) } }
	}

	module.file = function(name, help, required, types, maxSize){ 
		return { type : 'file', name : name, help : help, def: !required, value : function(val, cb, req){
			nominal.File(val, required, types, maxSize, cb)
		} }
	}

	module.image = function(name, help, required, maxSize, dimensions){
		return { type : 'image', name : name, help : help, def: !required, value : function(val, cb, req){
			nominal.Image(val, required, maxSize, dimensions, cb)
		}}
	}
	
	module.verified = function(){
		if(typeof rank === 'undefined' || !rank) rank = 0;

		return { type : 'logged-in', name: "user", help:"", def:false, value: 
			function(val, cb, req){
				if(!req.user || !req.isAuthenticated()){
					nominal.LastError = "401";
					return cb(false);	
				}
				
				return cb(req.user.id);
			}
				
		}
	}

	module.success = function(array){ // Empty API for success callback
		array = typeof array !== 'undefined' ? array : {};
		return this.Output( { status:'ok', data:array } );
	}

	module.failure = function(message, varname){ // Empty API for falure callback
		varname = typeof varname !== 'undefined' ? varname : '';
		return module.Output( { status:'failure', message:varname +(varname==''?'':' ')+ message, varname:varname } );
	}

	module.output = function(array){
		return array; // Outputs data to caller
	}

	return module;
}