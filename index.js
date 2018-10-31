// Mel NodeJS API library
// (C) Manolis Vrondakis 2016

var apiList = {};
const
	nominal 	= require('../nominal')(),
	multiparty 	= require('multiparty'),
	async 		= require('async'),
	passport	= require('passport');


exports.init = (router) => {
	exports.router = router;
}

exports.new = (requestType, options) => {
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

	options.input = typeof options.input !== 'undefined' ? options.input : function(){}
	requestType(options.route, (req, res, next) => {
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
						return res.json(module.Failure(nominal.LastError, varname)); // Returns JSON error message of specific input
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
	exports.new(exports.router.get, options)
}

exports.post = (options) => {
	exports.new(exports.router.post, options)
}

exports.put = (options) => {
	module.new(exports.router.put, options)
}

exports.delete = (options) => {
	module.new(exports.router.delete, options)
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
	
exports.verified = function(){
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

