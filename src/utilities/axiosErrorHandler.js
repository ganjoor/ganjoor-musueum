export default class axiosErrorHandler {
    static handle(error) {
        if (error.response) {
            // Request made and server responded
            return (error.response.data + ' - ' + error.response.status + ' - ' + error.response.headers);

        } else if (error.request) {
            // The request was made but no response was received
            return error.request;
        } else {
            // Something happened in setting up the request that triggered an Error
            return error.message;
        }
    }
}
