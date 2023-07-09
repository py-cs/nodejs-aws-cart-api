import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path = require('path');
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
// import * as rds from 'aws-cdk-lib/aws-rds';
import { env } from '../src/env';

export class CartCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const vpc = new cdk.aws_ec2.Vpc(this, 'VPC', {
    //   maxAzs: 2,
    // });

    // const dbSecurityGroup = new cdk.aws_ec2.SecurityGroup(
    //   this,
    //   'db-security-group',
    //   {
    //     vpc: vpc,
    //     allowAllOutbound: true,
    //     description: 'Database security group',
    //     securityGroupName: 'db-security-group',
    //   },
    // );

    // const cartDb = new rds.DatabaseInstance(this, 'rds-cart-api-database', {
    //   databaseName: env.DB_NAME,
    //   engine: rds.DatabaseInstanceEngine.postgres({
    //     version: rds.PostgresEngineVersion.VER_15,
    //   }),
    //   instanceType: cdk.aws_ec2.InstanceType.of(
    //     cdk.aws_ec2.InstanceClass.T3,
    //     cdk.aws_ec2.InstanceSize.MICRO,
    //   ),
    //   vpc: vpc,
    //   vpcSubnets: {
    //     subnetType: cdk.aws_ec2.SubnetType.PUBLIC,
    //   },
    //   // securityGroups: [dbSecurityGroup],
    //   publiclyAccessible: true,
    //   credentials: {
    //     username: env.DB_USERNAME,
    //     password: cdk.SecretValue.unsafePlainText(env.DB_PASSWORD),
    //   },
    //   backupRetention: cdk.Duration.days(0),
    //   deletionProtection: false,
    //   removalPolicy: cdk.RemovalPolicy.DESTROY,
    //   allocatedStorage: 20,
    //   multiAz: false,
    // });

    // dbSecurityGroup.addIngressRule(
    //   cdk.aws_ec2.Peer.anyIpv4(),
    //   cdk.aws_ec2.Port.tcp(Number(cartDb.dbInstanceEndpointPort)),
    // );

    const nestJsLambda = new NodejsFunction(this, 'nest-js-lambda', {
      functionName: 'nest-js-lambda',
      entry: path.resolve(__dirname, '..', 'dist', 'handler.js'),
      runtime: lambda.Runtime.NODEJS_18_X,
      bundling: {
        externalModules: [
          'aws-sdk',
          'class-transformer',
          'class-validator',
          '@nestjs',
          '@nestjs/core',
          '@nestjs/microservices',
          '@nestjs/websockets',
        ],
      },
      // vpc,
      environment: {
        CART_AWS_REGION: env.CART_AWS_REGION,
        DB_HOST: env.DB_HOST,
        DB_PORT: env.DB_PORT.toString(),
        DB_USERNAME: env.DB_USERNAME,
        DB_PASSWORD: env.DB_PASSWORD,
        DB_NAME: env.DB_NAME,
      },
    });

    const api = new apiGateway.LambdaRestApi(this, 'cart-api', {
      restApiName: 'cart-api',
      handler: nestJsLambda,
    });

    // new cdk.CfnOutput(this, 'db-host', {
    //   value: cartDb.dbInstanceEndpointAddress,
    //   description: 'RDS Endpoint',
    // });

    new cdk.CfnOutput(this, 'api-gateway-url', {
      value: api.url!,
      description: 'API Gateway URL',
    });
  }
}
