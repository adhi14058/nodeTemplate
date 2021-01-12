function status_mapping() {
    return  {
          "400": {
              "errCode":"BadRequest",
              "errParams":[],
              "errMessage":"unable to process request"
          },
          "401": {
              "errCode":"Unauthorized",
              "errParams":[],
              "errMessage":"Unauthorised access"
          },
          "403":{
              "errCode":"Forbidden",
              "errParams":[],
              "errMessage":"Forbidden"
          },
          "404": {
              "errCode":"NotFound",
              "errParams":[],
              "errMessage":"Requested resource does not exists"
          },
          "500": {
              "errCode":"InternalServerError",
              "errParams":[],
              "errMessage":"Internal server error"
          },
          "501": {
              "errCode":"NotImplemented",
              "errParams":[],
              "errMessage":"Not Implemented"
          },
          "502": {
              "errCode":"BadGateway",
              "errParams":[],
              "errMessage":"Bad gateway"
          },
          "503": {
              "errCode":"ServiceUnavailable",
              "errParams":[],
              "errMessage":"Requested service is not available"
          },
          "504": {
              "errCode":"GatewayTimeout",
              "errParams":[],
              "errMessage":"Gateway timeout"
          },
          "RestException": {
              "errCode":"RestException",
              "errParams":[],
              "errMessage":"Cannot complete task. Instance suspended or task already completed."
          },
          "SuspendedEntityInteractionException": {
              "errCode":"SuspendedEntityInteractionException",
              "errParams":[],
              "errMessage":"Cannot complete task as instance suspended."
          },
          "NullValueException": {
              "errCode":"NullValueException",
              "errParams":[],
              "errMessage":"Cannot complete task. Instance suspended or task already completed."
          },
        };
  }
  
  function errorHandler(errCode,errParams,errMessage,key){
      if(key !== undefined) {
          var status =  status_mapping();
          status[key].errParams = [];
          status[key].errCode = errCode?errCode:status[key].errCode;
          status[key].errParams = errParams?errParams:status[key].errParams;
          status[key].errMessage = errMessage?errMessage:status[key].errMessage;
          return status[key];
      }else {
          return { 
            errCode:errCode,
            errParams:errParams?errParams:[],
            errMessage:errMessage
          }
      }
  
  }
   
  module.exports.errorHandler = errorHandler;