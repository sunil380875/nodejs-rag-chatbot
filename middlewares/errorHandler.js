const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    if (!statusCode) statusCode = 500;
    if (!message) message = "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message: message,
        statusCode: statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export default errorHandler;
