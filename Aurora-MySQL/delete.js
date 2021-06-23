let AWS = require('aws-sdk');
var rds = new AWS.RDS();
var rdsdataservice = new AWS.RDSDataService();
var secretsmanager = new AWS.SecretsManager();

exports.handler = async (event, context) => {
    let body = event.body;
    var params = {
        Filters: [
            {
                Name: 'db-cluster-id',
                Values: [
                    body.customerName,
                ]
            },
        ],
        IncludeShared: true
    };
    let clusterdescription = await describecluster(params);
    var secparams = {
        SecretId: body.customerName + "-securestring",
    };
    let secretdetails = await getsecurity(secparams);
    let tablename = event.body.TableName;
    let creparams = {
        secretArn: secretdetails.ARN,
        resourceArn: clusterdescription.DBClusters[0].DBClusterArn,
        sql: `DROP TABLE ${tablename}`,
        database: body.customerName,
        schema: body.customerName
    };
    const finalresponse = await sqlstatementexecution(creparams);
    let responseobj = {
        statuscode: 200,
        "Message": "The table is deleted from the database"
    }
    return responseobj;

}


const sqlstatementexecution = async (params) => {
    try {
        let result = await rdsdataservice.executeStatement(params).promise().then().catch((err) => { throw err; });
        return result = {
            "Status": "Success",
            "Message": "The table is deleted from the database"
        };
    } catch (e) {
        let results;
        return results = {
            "Status": "Failure",
            "Message": "The table is doesn't exists in the database"
        };
    }
}

const describecluster = async (params) => {
    let result = await rds.describeDBClusters(params).promise().then().catch();
    return result;
}

const getsecurity = async (params) => {
    let secresult = await secretsmanager.getSecretValue(params).promise().then().catch();
    return secresult;
}