class HttpException extends Error {
	constructor(message, httpStatusCode, options) { // options must be a object
		super(message);
		this.httpStatusCode = httpStatusCode;
		this.options = options;
		Object.setPrototypeOf(this, HttpException.prototype);
	}

	getHttpStatusCode() {
		return this.httpStatusCode;
	}

	getMessage() {
		return this.message;
	}

	getOptions() {
		return this.options || null;
	}
}

class ValidationException extends HttpException {
	constructor(message, options) {
		super(message || 'Validation Error', 422, options);
		Object.setPrototypeOf(this, ValidationException.prototype);
	}
}

class NotFoundException extends HttpException {
	constructor(message, options) {
		super(message || 'Not Found', 404, options);
		Object.setPrototypeOf(this, NotFoundException.prototype);
	}
}

class UnauthorizedException extends HttpException {
	constructor(message, options) {
		super(message || 'Authentication Failed', 401, options);
		Object.setPrototypeOf(this, UnauthorizedException.prototype);
	}
}

class ForbiddenException extends HttpException {
	constructor(message, options) {
		super(message || 'Authentication Failed', 403, options);
		Object.setPrototypeOf(this, ForbiddenException.prototype);
	}
}


module.exports = {
	HttpException,
	ValidationException,
	NotFoundException,
	ForbiddenException,
	UnauthorizedException
}