# Overview
This project is an example of how one can use openapi-generator in an npm project to generate a rest client ('typescript-angular') from an OpenApi (swagger) definition file, including services and models.
## Running this project
`npm install`

`npm start`

# How to make it in your project
Here are the steps used to make the generation work in this project.  You can follow and adapt to your project.
## Installing the Generator
We will first install the generator as a dev dependency, since it will only be used while developing.

`npm install @openapitools/openapi-generator-cli -D`

This will add something that looks like the following in your  package.json file : 

    "devDependencies": {
    	...
    	"@openapitools/openapi-generator-cli": "^1.0.1-4.1.3"
    	...
    }
[More about installing the generator](https://github.com/OpenAPITools/openapi-generator#17---npm)

## Using the Generator
The generator can generate code for many languages ([see here for a complete list](https://github.com/OpenAPITools/openapi-generator#overview)).  What we want for angular is the 'typescript-angular' language.
Basically, the command should look like the following : 
`npx openapi-generator generate -i userApi.yaml -g typescript-angular -o generated-sources/user-api --additional-properties=\"npmName=user-api\"`

Here, npx is the command we can use to run locally installed npm dependencies.  In the command above, userApi.yaml is our openapi/swagger file, generated-sources/user-api is the destination directory for the generated code, and the additional property named 'npmName' tells the generator to generate a package.json file, which make the generated code a separate npm module.  You can find the complete list of command line option for the openapi-generator-cli [here](https://github.com/OpenAPITools/openapi-generator#3---usage), and the list of additional properties usable specifically for the 'typescript-angular' generator [here](##%20Additional%20properties%20for%20typescript-angular%20codegen%20https://github.com/OpenAPITools/openapi-generator/blob/master/docs/generators/typescript-angular.md).

## Launching the generator from npm
From here, we want to integrate the generator to our package.json file.  Basically, we want to be able to launch the generator with an npm command.
To make this possible, we start by putting the generator command (see above) in a shell script.  See the file 'generate-client.sh', at the root of the project.
The file should look like this : 

    #!/usr/bin/env bash
    rm -rf generated-sources/user-api
    npx openapi-generator generate -i userApi.yaml -g typescript-angular -o generated-sources/user-api --additional-properties=\"npmName=user-api\"

Then, make a custom script that call the generation in package.json (in the "script" section).  We will call that script 'generate-client' : 

    "scripts": {
    	...
    	"generate-client": "./generate-client.sh",
    	...
    }
Now, we can call that script by using the following command : 
`npm run generate-client`

## Tell git to ignore the generated code 
Since we don't want to commit any generated code, we add these lines to .gitignore file : 

    # Generated code
    /generated-sources

## Integrate the generation to our build process
Now that our package.json 'know' about the generation, it's time to automate that generation and link the generated code to our project.
The idea here is to automatically generate the code any time we use the command `npm install`in our project.  Then, we want our application to depend on the generated code as if it was any external dependency.
### Automate the generation
In package.json, we'll use the 'preinstall' phase of the npm lifecycle.  Add this "preinstall" script to package.json : 

    "scripts": {
	    ...
	    "preinstall": "npm install @openapitools/openapi-generator-cli --save-dev && npm run generate-client",
		...
	}
Here we want to make sure the generator is installed first, and then proceed to generate de code, and then install all other dependencies, including the generated one.

### Add the generated code as a dependency to our application
This part will make make it possible for our application to use the generated code.  Simply add the following dependency in our package.json : 

    "dependencies": {
	    "user-api": "file:generated-sources/user-api"
    }
Voilà, now when we run`npm install` in the project, the client code is generated from the yaml file and the generated npm module is linked to our application.

### Tell typescript to include generated code in compilation
Since we only installed the generated module without building it separately, we will tell typescript to include the module in it's compilation.  For that, we want to edit our tsconfig.json to add these lines (you may want to adapt to your specific situation) : 

    {
    ...
    "include" : [
	    "src",
	    "generated-sources"
    ]
    ...
    }

Now let's use that code in our application.

## Using the generated code.
First let's look at the generated code.  At the root of the generated package, you'll find an angular mode named api.module.ts.  This is the angular module we will have to import in our project for the other generated objects to be injectable in our application.  You'll also find a folder 'api', containing the generated services and a folder 'model', containing all the DTO object declared in the yaml file.  Notice that a the root of the generated module, there is a file named index.tx.  This allows us to directly import generated objects in our application, without caring in which subfolders are each objects (as you'll see in the import statements below).

Let's start by importing the client's module.

### Importing the generated module in our application and configuring the api.
Open the application module (in the example it's the src/app.module.ts file) and import the ApiModule and Configuration classes from the 'user-api' dependency : 

    import { ApiModule, Configuration } from  'user-api';

In this case, we will also import and 'environment' object, that contains some configuration properties that could change from an environment to an other : 

    import { environment } from  '../environments/environment';
Here is an example of this file : 

    export  const  environment  = {
	    production:  false,
	    USER_API_BASEPATH:  "http://test.example.com"
    };
We can have a different version of these properties in example in a environment.prod.ts, in the same folder.

Next, we have to import the generated module in our angular app module while configuring it with the environement property 'USER_API_BASEPATH'.  Still in app.module.ts : 

    @NgModule({
	    ...
	    imports: [
		    ...
		    HttpClientModule,
			ApiModule.forRoot(() => {
				return  new  Configuration({
				    basePath:  `${environment.USER_API_BASEPATH}`,
				});
			}),
	    ],
	    ...
Note that we have to import the HttpClientModule, because the generated code will use it.

Now that the generated module is imported, let's use it in our application.

## Calling the user-api
In our example, we will call the api in a component named 'user-list', in the file src/app/users/userListComponent.ts (see the project's code for the complete file) :

    ...
    import { User, UserService } from  'user-api'; 
    ...
    constructor(private userService:UserService) {}
    ...
    private  fetchUsers():  void {
	    this.userService.getusers().toPromise()
	    .then((users) => {
	    	alert('users fetched successfully');
	    	this.users  =  users;
	    })
	    .catch((error) => {
		    console.log('Failed to call user API', error);
		    this.serverError  =  error;
		    this.apiAccessError=  true;
		    this.userService.configuration.basePath
	    })
    }

Last note : in your yaml file, if you do not use 'tags' on your paths, the generated service will be called 'DefaultService' instead of 'UserService' in our example.  In our yaml, we used 'user' tag on all paths so the service is then named UserService by the generator.

Voilà, our code is now using the generated module to call the backend.  Note that the yaml file could be online instead of being directly in our project.  This enable us to use 'contract-first' development, where someone defines the api and we just use it without writing any code for connecting to the backend.
