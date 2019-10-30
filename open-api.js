module.exports = (apis) => {
    const groupedApis = [];

    apis.map(api => {
        const bodyProperties = {};
        Object.values(api.inputs).filter(input => !input.hidden).forEach((input) => {
            bodyProperties[input.name] = input.schema;
        });

        return ({
            route : api.route,
            method : api.method,
            summary : api.description || "No description provided",
            parameters : Object.values(api.inputs)
                .filter(input => !input.hidden && (api.method === "post" ? input.type === "pathParameter" : true))
                .map(input => ({
                    in : input.type === "query",
                    name : input.name,
                    schema : input.schema,
                    required : !!(input.options && input.options.default),
                    type : input.dataType,
                    description : input.description
                })),
            [Object.keys(bodyProperties).length > 0 && api.method === "post" && "requestBody"] : {
                required : true,
                content : {
                    "application/json" : {
                        schema : {
                            type : "object",
                            properties : {...bodyProperties}
                        }
                    }
                }
            }
        })
    }).forEach((a) => {
            groupedApis[a.route] = groupedApis[a.route] || {}
            groupedApis[a.route][a.method] = a
    });

    return {
        openapi : "3.0.0",
        info : {
            title : "Mel APIs",
            version : "1.0.0"
        },
        paths : {...groupedApis}
    };
}