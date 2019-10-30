// Mel NodeJS API library
// (C) Manolis Vrondakis 2016

const apis = [];

let _router = false;
const init = (router) => {
	_router = router;
}

const getRequestData = (method, req) => {
	switch(method){
		case "get":
		case "delete":
		case "create":
			return req.query;

		case "post":
			return req.body;

		case "all":
			return {...req.query, ...req.body};
	}

	return {};
}

const success = (array) => {
	array = array || {};
	return { status : 'ok', data : array };
}

const failure = (message, errors) => {
	errors = errors || {};
	return { status:'failure', message, errors };
}

const newApi = async (requestType, options) => {
	console.log("new api")
	if(!_router)
		return console.error('mel: new called before router initialised');

	if(!options || typeof options !== 'object')
		return console.error("mel: called without options");

	if(!options.route)
		return console.error("mel: called without route");

	if(!options.run)
		return console.error("mel: called without run function");

		console.log("options is: ",options);

	if(!options.description)
		console.log(`mel:: ${options.route} API added without description`)

	if(!options.input)
		options.input = () => {};


	const inputs = {};
	options.input(inputs, {});


	apis.push({
		route : options.route,
		method : requestType,
		description : options.description,
		inputs
	});

	_router[requestType](options.route, async (req, res, next) => {
		const data = getRequestData(requestType, req);


		const validatedData = {};
		const errors = [];
		for(input of Object.keys(inputs)){
			const inputValidator = inputs[input];
			if(data[inputValidator.name] === undefined){
				if(inputValidator.options && inputValidator.options.default) validatedData[input] = inputValidator.default;
				else errors.push({varname : inputValidator.name, error : `must have a value`})
			} else {
				const validatedInput = await inputValidator.value(data[inputValidator.name], req);
				if(validatedInput.success) validatedData[input] = validatedInput.value;
				else errors.push({varname: inputValidator.name, error: validatedInput.error});
			}
		}

		if(errors.length > 0)
			return res.status(res.statusCode === 200 ? 400 : res.statusCode).json(failure(errors.map(e => `${e.varname} ${e.error}`).join(" "), errors));

		const result = await options.run(validatedData, req, res, next);
		if(result && result.status) res.json(result);
	});
};

const get = (options) => {
	newApi('get', options)
}

const post = (options) => {
	newApi('post', options)
}

const put = (options) => {
	newApi('put', options)
}

const delete_ = (options) => {
	newApi('delete', options)
}

const all = (options) => {
	newApi('all', options)
}

const openApi = require('./open-api');
const generateOpenApi = () => {
	return openApi(apis);
}

const validators = require('./types');

module.exports = {
	// Validators:
	...validators,

	// Request types:
	all,
	get,
	post,
	put,
	"delete" : delete_,

	// Utility methods
	success,
	failure,
	init,
	generateOpenApi
}

