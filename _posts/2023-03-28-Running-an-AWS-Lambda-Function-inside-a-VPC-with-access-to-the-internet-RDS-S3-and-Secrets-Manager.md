# Running an AWS Lambda Function inside a VPC with access to the internet, RDS, S3, and Secrets Manager

Given a scenario:

- We need a Lambda Function that can access:
    - the internet
    - RDS in a separate VPC from the Lambda Function
    - S3
    - Secrets Manager

## Setting up access to RDS/S3/Secrets Manager

These resources must be enabled using the Lambda Function's Role / Security Group

## Setting up the Lambda Function's VPC's resources

The Lambda Function's VPC Resource Settings must be:

![https://imgur.com/tl34SO1.png](https://imgur.com/tl34SO1.png)

- public subnet (at least 1)
- private subnet (at least 1)
- internet gateway
- NAT gateway
- s3 connection

## Configuring Lambda Function's VPC Settings

![https://imgur.com/u7K4LCL](https://imgur.com/u7K4LCL.png)

- uses only the private subnet (connected to NAT)
- security group outbound rules must allow connection to HTTP/HTTPS/Postgres

## Connecting the RDS VPC to the Lambda VPC using VPC Peering

Original Solution: [AWS Docs](https://repost.aws/knowledge-center/connect-lambda-to-an-rds-instance)

![https://imgur.com/vlThp1a](https://imgur.com/vlThp1a.png)

- Lambda VPC Route Table must contain route:
    - Destination: 172.31.0.0/16  (RDS VPC CIDR)
    - Target: Peering Connection Name

- RDS VPC Route Table must contain route:
    - Destination: 10.0.0.0/16  (Lambda VPC CIDR)
    - Target: Peering Connection Name

## Allowing Lambda to access RDS's Security Group

Add a new Inbound Rule to your RDS database's Security Group, ving port 5432 access to your Lambda Function's Security Group.

![https://imgur.com/zmBwcZi](https://imgur.com/zmBwcZi.png)
