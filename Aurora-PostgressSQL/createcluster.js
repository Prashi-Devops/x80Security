let AWS = require('aws-sdk');
var rds = new AWS.RDS();
var secretsmanager = new AWS.SecretsManager();

exports.handler = async (event, context) => {
    let body = event.body;
    var params = {
        DBClusterIdentifier: body.customerName,
        Engine: process.env.enginetype,
        DatabaseName: body.customerName,
        DeletionProtection: false,
        EngineMode: 'serverless',
        EngineVersion: process.env.engineversion,
        EnableHttpEndpoint: true,
        MasterUserPassword: body.password,
        MasterUsername: body.UserName,
        Port: process.env.portnumber,
        Tags: [
            {
                Key: 'Name',
                Value: body.customerName
            }
        ]
    };
    let clustercreateion = await createcluster(params);
    return clustercreateion;


}


const createcluster = async (params) => {
    try {
        let result = await rds.createDBCluster(params).promise().then().catch((err) => { throw err; });
        let securestrin = { username: params.MasterUsername, password: params.MasterUserPassword }
        let secparams = {
            Name: params.DBClusterIdentifier + "-securestring",
            SecretString: JSON.stringify(securestrin)
        }
        let secretstore = await secretsmanager.createSecret(secparams).promise().then().catch();
        return result = {
            "Status": "Success",
            "Message": params.DBClusterIdentifier + " database created Successfully"
        };
    } catch (e) {
        let results;
        return results = {
            "Status": "Success",
            "Message": params.DBClusterIdentifier + " database alrady exists"
        };
    }
}