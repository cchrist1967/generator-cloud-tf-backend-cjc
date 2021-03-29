# backend

## Overview

<%= overview %>

## Usage

```
LOWER ENV BACKEND CREATON

First, setup backend with local state
1. cd <your project directory>
2. terraform init
3. terraform plan -var-file=./parameters/lower.tfvars –out=lower-plan
4. terraform apply lower-plan

Then, migrate local statefile to newly created backend
5. Modify main.tf to support backend state (uncomment the "backend" line in the terraform config section)
terraform plan && terraform apply
6. terraform init –backend-config=./backends/lower-backend –backend-config=./backends/lower-<your project name>-backend-key

UPPER ENV BACKEND CREATON

First, setup backend with local state
1. Modify main.tf to support backend state (COMMENT the "backend" line in the terraform config section)
2. cd <your project directory> (if necessary)
3. rm -rf .terraform
4. terraform init
5. terraform plan -var-file=./parameters/upper.tfvars –out=upper-plan
6. terraform apply upper-plan

Then, migrate local statefile to newly created backend
7. Modify main.tf to support backend state (UNcomment the "backend" line in the terraform config section)
terraform plan && terraform apply
8. terraform init –backend-config=./backends/upper-backend –backend-config=./backends/lower-<your project name>-backend-key


```

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
I_WANT_TO_BE_REPLACED
<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->

## Development

### Prerequisites

- [terraform](https://learn.hashicorp.com/terraform/getting-started/install#installing-terraform)
- [terraform-docs](https://github.com/segmentio/terraform-docs)
- [pre-commit](https://pre-commit.com/#install)
- [golang](https://golang.org/doc/install#install)
- [golint](https://github.com/golang/lint#installation)

### Configurations

- Configure pre-commit hooks
```sh
pre-commit install
```


- Configure golang deps for tests
```sh
> go get github.com/gruntwork-io/terratest/modules/terraform
> go get github.com/stretchr/testify/assert
```



### Tests

- Tests are available in `test` directory

- In the test directory, run the below command
```sh
go test
```



## Authors
Charlie Christina