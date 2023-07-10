import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path = require('path');
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as rds from 'aws-cdk-lib/aws-rds';
import { env } from '../src/env';

export class CartCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const rdsVpc = new cdk.aws_ec2.Vpc(this, 'VPC', {
      maxAzs: 2,
      vpcName: 'cart-stack-vpc',
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: cdk.aws_ec2.SubnetType.PUBLIC,
        },
      ],
    });

    const rdsSecurityGroup = new cdk.aws_ec2.SecurityGroup(this, 'rds-sg', {
      vpc: rdsVpc,
      securityGroupName: 'rds-sg',
    });

    const cartDb = new rds.DatabaseInstance(this, 'rds-cart-api-database', {
      databaseName: env.DB_NAME,
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceType: cdk.aws_ec2.InstanceType.of(
        cdk.aws_ec2.InstanceClass.T3,
        cdk.aws_ec2.InstanceSize.MICRO,
      ),
      vpc: rdsVpc,
      vpcSubnets: { subnetType: cdk.aws_ec2.SubnetType.PUBLIC },
      securityGroups: [rdsSecurityGroup],
      publiclyAccessible: true,
      credentials: {
        username: env.DB_USERNAME,
        password: cdk.SecretValue.unsafePlainText(env.DB_PASSWORD),
      },
      backupRetention: cdk.Duration.days(0),
      deletionProtection: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      allocatedStorage: 20,
      multiAz: false,
      storageEncrypted: false,
    });

    rdsSecurityGroup.addIngressRule(
      cdk.aws_ec2.Peer.anyIpv4(),
      cdk.aws_ec2.Port.tcp(env.DB_PORT),
      'Allow RDS connection',
    );

    const lambdaSecurityGroup = new cdk.aws_ec2.SecurityGroup(
      this,
      'lambda-sg',
      {
        securityGroupName: 'lambda-sg',
        vpc: rdsVpc,
      },
    );

    const nestJsLambda = new NodejsFunction(this, 'nest-js-lambda', {
      functionName: 'nest-js-lambda',
      entry: path.resolve(__dirname, '..', 'dist', 'main.js'),
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        CART_AWS_REGION: env.CART_AWS_REGION,
        DB_HOST: cartDb.dbInstanceEndpointAddress,
        DB_PORT: cartDb.dbInstanceEndpointPort,
        DB_USERNAME: env.DB_USERNAME,
        DB_PASSWORD: env.DB_PASSWORD,
        DB_NAME: env.DB_NAME,
      },
      vpc: rdsVpc,
      allowPublicSubnet: true,
      vpcSubnets: { subnetType: cdk.aws_ec2.SubnetType.PUBLIC },
      securityGroups: [lambdaSecurityGroup],
      role: new cdk.aws_iam.Role(this, 'nest-js-lambda-role', {
        assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            'service-role/AWSLambdaBasicExecutionRole',
          ),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            'service-role/AWSLambdaVPCAccessExecutionRole',
          ),
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            'AmazonRDSFullAccess',
          ),
        ],
      }),
    });

    const api = new apiGateway.LambdaRestApi(this, 'cart-api', {
      restApiName: 'cart-api',
      handler: nestJsLambda,
    });

    new cdk.CfnOutput(this, 'db-host', {
      value: cartDb.dbInstanceEndpointAddress,
      description: 'RDS Endpoint',
    });

    new cdk.CfnOutput(this, 'api-gateway-url', {
      value: api.url!,
      description: 'API Gateway URL',
    });
  }
}
