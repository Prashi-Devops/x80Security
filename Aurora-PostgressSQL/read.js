let AWS = require('aws-sdk');
var rds = new AWS.RDS();
var rdsdataservice = new AWS.RDSDataService();
var secretsmanager = new AWS.SecretsManager();

exports.handler = async (event, context) => {
    console.log('event::', event)
    let customerName = event.query.customerName;
    var params = {
        Filters: [
            {
                Name: 'db-cluster-id',
                Values: [
                    customerName,
                ]
            },
        ],
        IncludeShared: true
    };
    let clusterdescription = await describecluster(params);
    var secparams = {
        SecretId: customerName + "-securestring",
    };
    let secretdetails = await getsecurity(secparams);
    let tablename = event.query.TableName;
    let creparams = {
        secretArn: secretdetails.ARN,
        resourceArn: clusterdescription.DBClusters[0].DBClusterArn,
        sql: `Select * from ${tablename}`,
        database: customerName,
        schema: customerName
    };
    const finalresponse = await sqlstatementexecution(creparams, tablename);

    return finalresponse;

}


const sqlstatementexecution = async (params, tablename) => {
    try {
        let result = await rdsdataservice.executeStatement(params).promise().then().catch((err) => { throw err; });
        return result = {
            "Status": "Success",
            "Message": "The table details are fetched from the database",
            "data": result.records
        };
    } catch (e) {
        let results;
        return results = {
            "Status": "Failure",
            "Message": "The table " + tablename + " doesn't exists"
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