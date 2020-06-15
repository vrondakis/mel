const deepcopy = require("deepcopy");

const pathParamRegex = /(:[aA-zZ]*)/g;
const folderMatch = /^[\/]?([aA-zZ]*)/;
            
module.exports = (apis) => {
    const groupedApis = [];

    apis
        .map(api => {
            const bodyProperties = {};
            Object.values(api.inputs).filter(input => !input.hidden).forEach((input) => {
                bodyProperties[input.name] = input.schema;
            });

            const apiFolder = api.route.substring(1);
            const inputs = deepcopy(api.inputs);
            let route = api.route;

            const pathParameters = api.route.match(pathParamRegex);
            if(pathParameters){
                pathParameters.map((parameter) => {
                    route = api.route.replace(pathParamRegex, `{${parameter.substring(1)}}`);
                    inputs[parameter.substring(1)] = {
                        options: {},
                        isPathParameter: true,
                        type: "string",
                        schema : {
                            type : "string"
                        },
                        name: parameter.substring(1),
                        description: `Path parameter: ${parameter.substring(1)}`
                    }
                });

            }
            console.log("path parametewrs", pathParameters);

            return ({
                route : route,
                method : api.method,
                summary : `${apiFolder}: ${api.description || "No description provided"}`,
                parameters : Object.values(inputs)
                    .filter(input => !input.hidden)
                    .map(input => ({
                        in : input.isPathParameter ? "path" : "query",
                        name : input.name,
                        schema : input.schema,
                        required : !!(input.isPathParameter || (input.options && input.options.default)),
                        description : input.description
                    })),
                responses: {"200" : {
                    description: "An Mel status object",
                }},
                ...((Object.keys(bodyProperties).length > 0 && api.method === "post") ? {
                    requestBody : {
                        content: {
                            "application/json" : {
                                schema : {
                                    type : "object",
                                    properties : {...bodyProperties}
                                }
                            }
                        }
                    }
                } : {})
            })
        }).forEach((a) => {
            groupedApis[a.route] = groupedApis[a.route] || {}
            groupedApis[a.route][a.method] = a
            
            delete a["route"];
            delete a["method"];
        });


    return {
        openapi : "3.0.0",
        info : {
            title : "Mel APIs",
            description: "REST API OpenAPI 3.0 Specification",
            version : "1.0.0"
        },
        servers: [],
        paths : {...groupedApis}
    };
}