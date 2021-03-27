'use strict';
const { snakeCase } = require('snake-case');
const options = {
  delimiter: "-"
};

var Generator = require('yeoman-generator');
const { exec } = require('child_process');
const os = require('os');
const chalk = require("chalk");
const yosay = require("yosay");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option('babel');
  }

  async prompting() {
    this.log(
      yosay(
        `Welcome to the ${chalk.red(
          "generator-cloud-tf-backend-cjc"
        )} generator!`
      )
    );

    this.log(`Your Operating System: ${chalk.blue(os.platform(), os.type(), os.release())}`);

    // PROJECT QUESTIONS
    const project_questions = [
      {
        type: "input",
        name: "stack",
        message: "Your project stack.",
        default: this.appname // Default to current folder name
      },
      {
        type: "input",
        name: "project",
        message: "The name of this project:",
        store: true
      },
      {
        type: "input",
        name: "program",
        message: "The name of the program to which this project belongs:",
        store: true
      }
    ]

    // ENVIRONMENT QUESTIONS
    const env_questions = [
      {
        type: 'checkbox',
        name: 'environments',
        message: 'Select all environments you want to support:',
        choices: [
          {
            name: 'lower',
            value: 'lower',
            checked: true
          }, {
            name: 'upper',
            value: 'upper',
            checked: true
          }
        ],
        store: true
      }
    ]

    // CLOUD PROVIDER SELECTION
    const cloud_questions = [
      {
        type: 'list',
        name: 'cloud',
        message: 'Select Cloud Provider:',
        choices: [
          {
            name: 'Azure',
            value: 'azurerm',
          }, {
            name: 'AWS',
            value: 'aws'
          }
        ]
      }
    ]

    const aws_questions = [
      {
        type: 'list',
        name: 'region',
        message: 'Select default AWS Region:',
        choices: [
          {
            name: 'US East 2 (Ohio)',
            value: 'us-east-2',
          }, {
            name: 'US East 1 (N. Virginia)',
            value: 'us-east-1'
          }, {
            name: 'US West 1 (N. California)',
            value: 'us-west-1'
          }, {
            name: 'US West 2 (Oregon)',
            value: 'us-west-2'
          }, {
            name: 'Canada (Central)',
            value: 'ca-central-1'
          }
        ],
        store: true
      }      
    ]

    const azurerm_questions = [
      {
        type: 'list',
        name: 'region',
        message: 'Select default Azure Region:',
        choices: [
          {
            name: 'Central US',
            value: 'Central US',
          }, {
            name: 'East US',
            value: 'East US'
          }, {
            name: 'East US 2',
            value: 'East US 2'
          }, {
            name: 'North Central US',
            value: 'North Central US'
          }, {
            name: 'South Central US',
            value: 'South Central US'
          }, {
            name: 'West Central US',
            value: 'West Central US'
          }, {
            name: 'WEST US',
            value: 'WEST US'
          }, {
            name: 'WEST US 2',
            value: 'WEST US 2'
          }
        ],
        store: true
      }      
    ]

    // TOOLS/CONFIGURATION QUESTIONS
    const tool_questions = [
      {
        type: "confirm",
        name: "precommit",
        message: "Would you like to install/reinstall the pre-commit checks? (n will skip but not unistall)"
      },
      {
        type: "confirm",
        name: "gitflow",
        message: "Would you like to configure/reconfigure git flow as a branching strategy? (n will skip but not unconfigure)"
      },
      {
        type: "confirm",
        name: "atlantis",
        message: "Would you like Atlantis workflow configured/reconfigured for this project? (n will skip but not unconfigure)"
      }
    ]

    // TAGGING QUESTIONS
    const tag_questions = [
      {
        type: "input",
        name: "name",
        message: "Your first and last name:",
        store: true
      },
      {
        type: "input",
        name: "manager",
        message: "Your Manager's name:",
        store: true
      },
      {
        type: "input",
        name: "market",
        message: "Your market:",
        default: "Boston Build",
        store: true
      },
      {
        type: "input",
        name: "client",
        message: "Name of client/customer:",
        store: true
      }
    ]

    // ASK PROJECT QUESTIONS
    this.log(`${chalk.cyan("\nPROJECT INFO:")}`)
    this.project_answers = await this.prompt(project_questions);

    // ASK CLOUD QUESTIONS
    this.log(`${chalk.cyan("\nCLOUD PROVIDER")}`)
    this.cloud_answers = await this.prompt(cloud_questions);
    switch (this.cloud_answers.cloud) {
      case 'azurerm':
        this.cloud_answers2 = await this.prompt(azurerm_questions);
        break;
      case 'aws':
        this.cloud_answers2 = await this.prompt(aws_questions);
        break;
    }

    // ASK ENVIRONMENT QUESTIONS
    this.log(`${chalk.cyan("\nSUPPORTED ENVIRONMENTS:")}`)
    this.env_answers = await this.prompt(env_questions);

    // ASK TOOLING QUESTIONS
    this.log(`${chalk.cyan("\nTOOL INSTALLATION/CONFIGURATION:")}`)
    this.tool_answers = await this.prompt(tool_questions);

    // ASK TAGGING QUESTIONS
    this.log(`${chalk.cyan("\nTAGS:")}`)
    this.tag_answers = await this.prompt(tag_questions);

  }

  writing() {

    // CLOUD PROVIDER CONFIGURATION
    var tf_backend;
    var cloud_provider_version;
    var backend_template;
    var main_template;
    var output_template;
    var description;
    if (this.cloud_answers.cloud === "azurerm") {
      backend_template = "backends/azurerm-backend",
      cloud_provider_version = "2.50"
      tf_backend = this.cloud_answers.cloud,
      main_template = "azurerm-main.tf",
      output_template = "azurerm-outputs.tf",
      description = "Creates an Azure Backend for a terraform project."
    }
    if (this.cloud_answers.cloud === "aws") {
      backend_template = "backends/aws-backend",
      cloud_provider_version = "3.0"
      tf_backend = "s3",
      main_template = "aws-main.tf",
      output_template = "aws-outputs.tf",
      description = "Creates an AWS Backend for a terraform project."
    }

    // TERRAFORM TEMPLATES
    this.fs.copyTpl(
      this.templatePath(main_template),
      this.destinationPath('main.tf'),
      {
        cloud_provider:         this.cloud_answers.cloud,
        cloud_provider_version: unescape(cloud_provider_version),
        tf_backend:             tf_backend,
        client:                 snakeCase(this.tag_answers.client),
        program:                snakeCase(this.project_answers.program, options),
        region:                 this.cloud_answers2.region
      }
    );

    this.fs.copy(
      this.templatePath(output_template),
      this.destinationPath('outputs.tf')
    );

    this.fs.copyTpl(
      this.templatePath('variables.tf'),
      this.destinationPath('variables.tf'),
      {
        project: this.project_answers.project,
        name:    this.tag_answers.name,
        manager: this.tag_answers.manager,
        market:  this.tag_answers.market,
        client:  this.tag_answers.client
      }
    );

    // ATLANTIS PROJECT & WORKFLOW CONFIGURATION
    if (this.tool_answers.atlantis) {
      this.fs.copyTpl(
        this.templatePath('atlantis.yaml'),
        this.destinationPath('atlantis.yaml'),
        {
          stack: snakeCase(this.project_answers.stack, options)
        }
      );
      this.fs.copy(
        this.templatePath('scripts'),
        this.destinationPath('scripts')
      );
    };

    // REPO CONFIG
    this.fs.copy(
      this.templatePath('.gitignore.tpl'),
      this.destinationPath('.gitignore')
    );

    this.fs.copyTpl(
      this.templatePath('README.md'),
      this.destinationPath('README.md'),
      { overview: description }
    );

    if (this.tool_answers.precommit) {
      this.fs.copy(
        this.templatePath('.pre-commit-config.yaml'),
        this.destinationPath('.pre-commit-config.yaml')
      )
    };

    for (var env of this.env_answers.environments) {
      // TERRAFORM PARAMETERS
      this.fs.copyTpl(
        this.templatePath('parameters/env.tfvars'),
        this.destinationPath('parameters/<%= env %>.tfvars'),
        { 
          env: env,
          region: this.cloud_answers2.region
        }
      );
      this.fs.copyTpl(
        this.templatePath('parameters/env-stack.tfvars'),
        this.destinationPath('parameters/<%= env %>-<%= stack %>.tfvars'),
        { 
          env: env,
          stack: snakeCase(this.project_answers.stack, options)   
        }
      );

      this.fs.copyTpl(
        this.templatePath('backends/env-stack-backend-key'),
        this.destinationPath('backends/<%= backend_env %>-<%= stack %>-backend-key'),
        { 
          backend_env: env,
          stack: snakeCase(this.project_answers.stack, options)
        }
      );

      // TERRAFORM BACKENDS
      this.fs.copyTpl(
        this.templatePath(backend_template),
        this.destinationPath('backends/<%= backend_env %>-backend'),
        { 
          cloud: this.cloud_answers.cloud,
          backend_env: env,
          client: snakeCase(this.tag_answers.client, options),
          program: snakeCase(this.project_answers.program, options),
          backend_region: this.cloud_answers2.region
        }
      )

    }
  }

  install() {
    if (this.tool_answers.gitflow) {
      this.log(`${chalk.cyan("\n\nINSTALLING GIT FLOW")}`)
      if (os.platform() === "linux" ) { 
        this.log("*** Installing with apt-get ***")
        this.spawnCommandSync("sudo", ["apt-get", "update"])
        this.spawnCommandSync("sudo", ["apt-get", "install", "git-flow"])
      }
      this.log(`${chalk.cyan("\nINITIALIZING GIT REPO with GIT FLOW")}`)
      this.spawnCommandSync("git", ["flow", "init"])
    } else {
      this.log(`${chalk.cyan("\nINITIALIZING GIT REPO")}`)
      this.spawnCommandSync("git", ["init"])      
    }
    this.spawnCommandSync("git", ["add", "."])   
    this.spawnCommandSync("git", ["commit", "-am", "First Commit"])   
    if (this.tool_answers.precommit) {
      this.log("\n\n");
      this.log(`${chalk.cyan("\nINSTALLING PRE-COMMIT TOOLS")}`)
      if (os.platform() === "linux" ) { 
        this.log("*** Installing with apt-get ***")
        this.spawnCommandSync("sudo", ["apt-get", "install", "python3-pip"])
        this.spawnCommandSync("sudo", ["apt-get", "install", "terraform=0.12.30"])
      }
      this.spawnCommandSync("pip3", ["install", "pre-commit"])
      this.spawnCommandSync("pip3", ["install", "checkov"])
      this.log(`${chalk.cyan("\nRUNNING PRE-COMMIT CHECKS")}`)
      this.spawnCommandSync("pre-commit", ["run", "-a"])
    }
  }

};

