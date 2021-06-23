let AWS = require('aws-sdk');
var rds = new AWS.RDS();
var secretsmanager = new AWS.SecretsManager();

exports.handler = async (event, context) => {
    let body = event.body;
    var params = {
        DBClusterIdentifier: body.customerName,
        SkipFinalSnapshot: true
    };
    let clustercreateion = await deletecluster(params);
    return clustercreateion;


}


const deletecluster = async (params) => {
    try {
        let result = await rds.deleteDBCluster(params).promise().then().catch((err) => { throw err });
        let secparams = {
            Name: params.DBClusterIdentifier + "-securestring",
            SecretString: JSON.stringify(securestrin)
        }
        let deletesecret = await secretsmanager.deleteSecret(secparams).promise.then().catch();
        return result = {
            "Status": "Success",
            "Message": params.DBClusterIdentifier + " database deleted Successfully"
        };
    } catch (e) {
        let results
        return results = {
            "Status": "Success",
            "Message": params.DBClusterIdentifier + " database doesn't exist"
        };
    }
}