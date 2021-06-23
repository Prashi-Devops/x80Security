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
    // let tablename = event.querystrings.TableName;
    let creparams = {
        secretArn: secretdetails.ARN,
        resourceArn: clusterdescription.DBClusters[0].DBClusterArn,
        sql: body.sqlstatement,
        database: body.customerName,
        schema: body.customerName
    };
    const finalresponse = await sqlstatementexecution(creparams);
    let responseobj
    if (body.sqlstatement.includes('Insert')) {

        responseobj = {
            "Status": "Success",
            "Message": "The Record inserted into the table Successfully"
        }
    } else {
        responseobj = {
            "Status": "Success",
            "Message": "The table is Created Successfully"
        }
    }
    return responseobj;

}


const sqlstatementexecution = async (params) => {
    console.log("params::", params)
    let result = await rdsdataservice.executeStatement(params).promise().then().catch();
    return result;
}

const describecluster = async (params) => {
    let result = await rds.describeDBClusters(params).promise().then().catch();
    return result;
}

const getsecurity = async (params) => {
    let secresult = await secretsmanager.getSecretValue(params).promise().then().catch();
    return secresult;
}