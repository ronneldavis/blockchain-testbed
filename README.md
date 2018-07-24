# Blockchain testbed

## Running the code

Make sure you have node installed. Then in terminal, run 
``
node index.js
``
This will start both the node server and the http server. The HTTP server is what you would use to interact with the blockchain and the node server is used to talk between users on the chain.

You can then head to localhost:<http_server_address>/<endpoint> to access your node server. 
 
## Available endpoints
``
localhost:<http_server_address>/chain
``
This requests the entire blockchain

``
localhost:<http_server_address>/mine/<data>
``
This allows you to mine a new block with the specified data (a URL encoded string)

``
localhost:<http_server_address>/addNode/<node_address>
``
This allows you to communicate with other nodes on the blockchain. Use a seperate terminal to spawn a new node and use the node address to communicate with it.
