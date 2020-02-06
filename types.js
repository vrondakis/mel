const validationError = (error, status) => ({
	success : false,
	status,
	error
});

const validationSuccess = (value) => ({
	success : true,
	value
});

exports.validationError = validationError;
exports.validationSuccess = validationSuccess;

const validateNumber = (number) => {
	return !isNaN(parseFloat(number));
}

exports.array = (name, description, options = {}) => {
	return {
		type : "array",
		schema : {
			type : "array"
		},
		name,
		description,
		options,
		value : value => {
			if(!Array.isArray(value)) return validationError("tags must be an array");
			return validationSuccess(value);
		}
	}
};

exports.int = (name, description, options = {}) => {
	return {
		type : "int",
		schema : {
			type : "integer",
			"minimum" : options.min || 0,
			[options.max && "maximum"] : options.max
		},
		name,
		description,
		options,
		value : value => {
			const float = validateNumber(value);
			if(!float || ((float | 0) === float)) return validationError("is not a valid integer");
			if(options.min !== undefined && options.min > value) return validationError(`minimum size is ${options.min}`);
			if(options.max !== undefined && options.max < value) return validationError(`maximum size is ${options.min}`);
			
			return validationSuccess(value);
		}
	}
}

exports.float = (name, description, options = {}) => {
	return {
		type : "float",
		schema : {
			type : "number",
			"minimum" : options.min || 0,
			[options.max && "maximum"] : options.max
		},
		name,
		description,
		options,
		value : value => {
			const float = validateNumber(value);
			if(!float) return validationError("is not a valid float");
			if(options.min !== undefined && options.min > value) return validationError(`must be at least ${options.min}`);
			if(options.max !== undefined && options.max < value) return validationError(`must not be more than ${options.min}`);
			
			return validationSuccess(value);
		}
	}
}

const getByteLength = (str) => encodeURI(str).split(/%..|./).length - 1;

exports.string = (name, description, options = {}) => {
	return {
		type : "string",
		schema : {
			type : "string",
			[options.minLength && "minimum"] : options.min || 0,
			[options.maxLength && "maxLength"] : options.maxLength
		},
		name,
		description,
		options,
		value : value => {
			if(options.minLength && options.minLength > getByteLength(value)) return validationError(`must be at least ${options.minLength} characters`);
			if(options.maxLength && options.maxLength < getByteLength(value)) return validationError(`must not be more than ${options.maxLength} characters`);
			if(options.match && !options.match.test(value)) return validationError(`must be in format: ${options.match.toString()}`);

			return validationSuccess(value);
		}
	}
}

exports.oneOf = (name, description, options) => ({
	type : "one-of",
	dataType : "string",
	name,
	description,
	options,
	schema : {
		type : "string",
		minLength : options.values.reduce((a, b) => a.length > b.length ? a.length : b.length),
		maxLength : options.values.reduce((a, b) => a.length < b.length ? a.length : b.length)
	},
	value : value => {
		if(options.values.indexOf(value) === -1)
			return validationError(`must be one of the following: ${options.values.join(", ")}`);

		return validationSuccess(value);
	}
});

const validateDomain = (value) => {
	const parts = value.split('.');
	for (part of parts) {
		if (!/^[a-z\u00a1-\uffff0-9-]+$/i.test(part))
			return false;
			
		if (/[\uff01-\uff5e]/.test(part))
			return false;
				
		if (part[0] === '-' || part[part.length - 1] === '-')
			return false;
			
		if (part.indexOf('---') >= 0 && part.slice(0, 4) !== 'xn--')
			return false;
	}

	return true;
}

exports.url = (name, description, options) => ({
	type : "url",
	name,
	description,
	options,
	schema : {
		type : "string",
		minLength : 6,
		maxLength : 1024
	},
	value : (value, req) => {
		if(6 > getByteLength(value)) return validationError(`must be at least 6 characters`);
		if(1024 < getByteLength(value)) return validationError(`must not be more than 1024 characters`);

		return validationSuccess(value);
	}
});


const validEmailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
exports.email = (name, description, options) => ({
	type : "email",
	name,
	description,
	options,
	schema : {
		type : "string",
		minLength : 6,
		maxLength : 320
	},
	value : value => {
		value = value.toLowerCase();

		const parts = value.split("@");
		let domain = parts.pop();
		let user = parts.join("@");

		if(!domain || !parts)
			return validationError("is not a valid email address");

		if(domain === "gmail.com " || domain === "googlemail.com"){
			domain = "gmail.com";
			user = user.replace(/\./g, '');
		}

		if ((((getByteLength(user)>64)) ||(getByteLength(domain)>256)))
			return validationError('is not a valid email address');

		if(getByteLength(user) > 64 || getByteLength(domain) > 256)
			return validationError("is not a valid email address");

		if(!validEmailRegex.test(value))
			return validationError('is not a valid email address');
		
		if(!validateDomain(domain))
			return validationError("is not a valid email address");

		return validationSuccess(value);
	}
});
