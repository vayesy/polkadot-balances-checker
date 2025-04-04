# Balances checker
This PoC application checks balances on the Polkadot-based blockchain and sends notifications in case any of the tracked account balance falls below certain amount (threshold).

## Usage
`docker-compose up` will run the application with default configuration and needed backing services.

## Architecture and high level overview
There is a diagram, outlining how application works, which components it has and how they interact with each other.  
It also shows high level overview of the production ready system, breakdown of it's components (services) and how they would communicate to each other.  
Available under the link: https://excalidraw.com/#room=9e8e9b07dd9c794927c5,MZPbE--XpePPWK4IodqWIw

## Dependencies
* PostgreSQL. Used to persist app state and store information about account statuses and sent notifications.

## Configuration
There are two parts to the configuration.  
First one is tweaking the application in terms of access to the database, timings and other.  
Second is specifying accounts to be tracked in scope of provided chain.

### General configuration
All below settings can be provided via environment configurations:
* `DEFAULT_THRESHOLD` - specify default value for minimum balance on the account, to consider this account unhealthy. Default value is `10`;
* `DEFAULT_NOTIFICATION_FREQUENCY` - how often messages should be send per individual account in case it is unhealthy (provided in seconds). Default value is `3600`;
* `CHAIN_URL` - URL of the chain node to read information about account balances from. Default value is `wss://polkadot-rpc.publicnode.com/` (public node of Polkadot chain);
* `LOGGING_LEVEL` - logging level for the app. All logs below that level wont be output. Default value is `info`;
* database configs: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

### Tracked accounts configuration
Accounts should be provided via YML file as a list of objects.  
Every object should such values:
* `accountId` - human readable account id in the chain;
* `alias` - text representation (or alias) to the given account. This is used to hide actual account information and reference it via alias name;
* `threshold` - optional parameter to provide balance amount threshold, below which account will be considered as unhealthy. If not provided, default value of `DEFAULT_THRESHOLD` is used;
* `notificationFrequency` - how ofter unhealthy account notification should be sent. If not provided, default value of `DEFAULT_NOTIFICATION_FREQUENCY` is used.
You can see example of accounts configuration file in [default-accounts.yml](./default-accounts.yml)


## Further improvements
As application in current form is more of a PoC, there are more features and improvements to be done.

### Different types of notifications support
Currently app just "simulates" sending notification and instead logs "notification" message into the console.  
Further version might implement various notification channels.  
A great open-source tool for that is [Apprise](https://github.com/caronc/apprise).  
It supports different channels, like simple email messages, Matrix, Slack, Telegram notifications.  
Ideally notifications part should be implemented as standalone service, which then might be used by other tools.

### More concerns separation
As there can be seen multiple components of the application, it might be a good option to make them distinct services (like notification service, mentioned in the previous section). One of such components is part responsible for tracking account balances on-chain. Task to track changes on-chain can be implemented in scope of standalone service. Further support for another types of events can be added. For example, track if some account executes extrinsic he shouldn't.

### Providing user-friendly way of managing tracked account
As currently accounts should be provided via YML file, there is certainly a way to make it more user friendly.  
It can be implemented as basic UI for View/CRUD operations, or in a form of some messaging bot like Telegram, etc.

### Reliable communication between components
As application will evolve and be separated into standalone parts (like chain module, notification module etc), there is a need for reliable communication between different parts of the system. Message broker can be used for this purpose, it will provide reliable transport and messages will be delivered even if corresponding receiving service is not available at the moment (for example, service update). I would recommend use Kafka or RabbitMQ for this purpose.
