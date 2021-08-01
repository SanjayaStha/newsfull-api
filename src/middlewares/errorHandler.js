const { ValidationException, NotFoundException, UnauthorizedException, HttpException } = require('../exceptions/httpException');

const errorHandler = (error, req, res, next) => {
	if (
		error instanceof ValidationException ||
		error instanceof NotFoundException ||
		error instanceof UnauthorizedException
	) {
		return res.status(error.getHttpStatusCode()).json(error.getOptions() || {
			success: false,
			status: 'error',
			message: error.getMessage()
		});
	}

	// log other http exception and unknown error
	res.once('finish', () => {
		console.error(error);
		// TODO: implement error logger/notifier here
	});

	if (error instanceof HttpException) {
		return res.status(error.getHttpStatusCode()).json(error.getOptions() || {
			success: false,
			status: 'error',
			message: error.getMessage()
		});
	}

	// !remove error property once error logger/notifier implemented
	res.status(500).json({ status: 'error', success: false, error: error.message });
};

module.exports = errorHandler;