module.exports = function () {
    this.ApiError = function(message, status) {
        const error  = new Error(message);    
        
        if (status) {
            error.status = status;
        }

        return error;
    }
}