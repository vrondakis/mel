// Mel NodeJS API library
// (C) Manolis Vrondakis 2016

const
	nominal 	= require('./nominal/index.js')(),
	async 		= require('async'),
	passport	= require('passport'),
	multiparty	= require('multiparty')


exports.apis = []

exports.init = (router) => {
	exports.router = router;
}

function new_(requestType, options) {
	if(!exports.router){
		console.error('Mel:: new called before router initialised')
	}

	options = typeof options === 'object' ? options : {}
	if(!options.route){
		console.error('Mel:: new called without route')
		return
	}


	var inputs = {}
	var args = {}

	console.log(options)
	options.input = typeof options.input !== 'undefined' ? options.input : function(){}


	var apiInputs = {}
	options.input(apiInputs)
	exports.apis.push({
		route : options.route,
		method : requestType,
		inputs : apiInputs
	})

	exports.router[requestType](options.route, (req, res, next) => {
		var data = {...req.body, ...req.query}
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
						return res.json(exports.failure(nominal.LastError, varname)); // Returns JSON error message of specific input
					}
	
					args[varname] = value			
					callback()
				}, req)

			}, () => {
				options.run(args, (data) => {
					res.json(data);
				}, req, res, next);
			})
		})
	})
}


exports.get = (options) => {
	new_('get', options)
}

exports.post = (options) => {
	new_('post', options)
}

exports.put = (options) => {
	new_('put', options)
}

exports.delete = (options) => {
	new_('delete', options)
}

exports.all = (options) => {
	 new_('all', options)
}

exports.string = function(name, help, min, max, def){ // Validates a string
	return {
		type: 	'string',
		name: 	name,
		help : 	help,
		def: 	def,
		value: 	(val, cb) => { cb(nominal.String(val, def, min, max)) } }
}

exports.int =(name, help, min, max, def) => {
	return { type:'integer', name : name, help : help, def: def, value: function(val, cb){ cb(nominal.Int(val,def,min,max))} }
}
	
exports.float = function(name, help, min, max, def){
	return { type:'float', name : name, help : help, def : def, value: function(val, cb){cb(nominal.Float(val,def,min,max))} }
}
	
exports.enum = function(name, help, enums, def){
	return { type:'float', name : name, help : help, def : def, value: function(val, cb, req){
		cb(nominal.Enum(val, def, enums))
	}}
}


exports.currency = function(name, help, max, def){
	return { type: 'currency', name : name, help : help, def : def, value: function(val, cb, req){
		cb(nominal.Currency(val, max, def))
	}}
}


exports.email = function(name, help, def){ // Validates an E-Mail
	return { type : 'email', name : name, help : help, def: def, value : function(val, cb){ cb(nominal.Email(val, def))} }
}
	
exports.array = function(name, help, def){
	return { type : 'array', name : name, help: help, def: def, value : function(val,cb){ cb(nominal.Array(val, def)) } }
}

exports.file = function(name, help, required, types, maxSize){ 
	return { type : 'file', name : name, help : help, def: !required, value : function(val, cb, req){
		nominal.File(val, required, types, maxSize, cb)
	}}
}

exports.image = function(name, help, required, maxSize, dimensions){
	return { type : 'image', name : name, help : help, def: !required, value : function(val, cb, req){
		nominal.Image(val, required, maxSize, dimensions, cb)
	}}
}
	
exports.verified = function(power){
	if(typeof power === 'undefined') power = 0;

	return { type : 'logged-in', name: "user", help:"", def:false, value: 
		function(val, cb, req){
			console.log(req.user, req.isAuthenticated(), power)
			if(power===false && req.isAuthenticated()){
				nominal.LastError = "402"
				return cb(false)
			}

			if(power >= 0 && (!req.user || !req.isAuthenticated)){
				nominal.LastError = "401"
				return cb(false)
			}

			return cb(req.user.id)
				
		}
	}
}

exports.success = function(array){ // Empty API for success callback
	array = typeof array !== 'undefined' ? array : {};
	return this.output( { status:'ok', data:array } );
}

exports.failure = function(message, varname){ // Empty API for falure callback
	varname = typeof varname !== 'undefined' ? varname : '';
	return this.output( { status:'failure', message:varname +(varname==''?'':' ')+ message, varname:varname } );
}

exports.output = function(array){
	return array;
}

