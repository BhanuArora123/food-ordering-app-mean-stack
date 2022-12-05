var validationResult = require("express-validator").validationResult;

exports.validate = function (req, res, next) {
    try {
        var errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({
                    success: false,
                    errors: errors.array()
                })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}