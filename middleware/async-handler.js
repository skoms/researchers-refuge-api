// 'asyncHandler' middleware to help reduce repeated code with try-catch blocks etc
module.exports = (callback) => {
  return async(req, res, next) => {
    try {
      await callback(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
};