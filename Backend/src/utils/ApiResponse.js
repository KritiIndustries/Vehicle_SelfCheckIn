class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
        // Automatically add count if data is array
        if (Array.isArray(data)) {
            this.count = data.length;
        } else {
            this.count = data ? 1 : 0;
        }
    }
    
}
export default ApiResponse