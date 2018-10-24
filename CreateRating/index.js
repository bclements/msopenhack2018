module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.body) {
        doc = req.body;

        if (doc.rating >= 0 && doc.rating <= 5)
        {
            var https = require('https');
            var options = {
                host : "serverlessohproduct.trafficmanager.net",
                port : 443,
                path : "/api/GetProduct?ProductId=" + doc.productId,
                method : "GET"
            };

            context.log('product ' + options);
            var output = "";
            var getreq = https.request(options, function(resp){
                resp.on('data',function(d){
                    //context.log(resp.headers);
                    output += d;
                    context.log('Output ' + output);
                });
            });

            getreq.end();
            getreq.on('error', function(e) {
                context.log(e);
            });

            if (output === 'Product does not exist'){
                context.res = {
                    status: 400,
                    body: "Invalid productId"
                };
            }
            else
            {
                //check for UserId
                var https_user = require('https');
                var response_data = "";
                var options_user = {
                    host : "serverlessohuser.trafficmanager.net",
                    port : 443,
                    path : "/api/GetUser?userId=" + doc.userId,
                    method : "GET"
                };
                context.log(options_user);
                var getreq_user = https_user.request(options_user, function(resp_user){
                    context.log(resp_user.headers);
                    resp_user.on('data',function(d){
                        context.log(resp_user.headers);
                        response_data += d;
                        context.log('Response data ' + response_data);
                    });
                });
                getreq_user.end();
                getreq_user.on('error', function(e) {
                    context.log(e);
                });

                if (response_data === "User does not exist"){
                    context.res = {
                        status: 400,
                        body: "Invalid userId"
                    };
                }
                else
                {
                    const uuidv1 = require('uuid/v1');
                    var id = uuidv1();

                    json = JSON.stringify({
                    id : id, 
                    userId: doc.userId,
                    productId : doc.productId,
                    locationName: doc.locationName,
                    rating: doc.rating,
                    userNotes: doc.userNotes
                    });

                    context.bindings.taskDocument = json;
                    context.res = {
                        body: json
                    };
                }
            }
        }
        else
        {
            context.res = {
                status: 400,
                body: "Invalid rating. Rating should be between 0 & 5"
            };    
        }
    }
    else {
        context.res = {
            status: 400,
            body: "no data passed"
        };
    }
};