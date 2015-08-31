### This is the Drop box project

```
The project consists of a REST server (using Hapi), a TCP server 
and a TCP client.  The idea is to have the client have the same 
directory as the server.  The TCP client will connect to the TCP 
server on port 8001.  The TCP server will listen to file system 
events such as new directory/file created, updated, and removal.  
When the event occur, it will push a message to the TCP client.  
The client will take appropriate actions regarding the event. 
For example, if a new file is created on the server, the TCP server
 will send a message to the TCP client for adding a new file.  
The TCP client will make a request call to the REST server (on port 8000) 
to get the content of the file.  It will then create the file from the 
content of the REST server.

```

#### Time spent

```
 15 hours
```

#### Starting the server (both Hapi: port 8000 and TCP server: port 8001)

```
npm install
npm start -- [options]
```


####Options

```
--dir : the base directory for the server to serve up files and diretories.

```


#### Starting the TCP client

```
npm install
npm run client -- [options]
```


####Options

```
--dir : the base directory for the client will sync up the file system with the server

```


####Usage

```
Use curl command to test the server.  While the servers are running,
open up another terminal and issue:

	1. get the file:

		curl -X GET http://127.0.0.1:8000/path/to/file

	2. get files form dir
		curl -X GET http://127.0.0.1:8000/path/to/dir/

    3. get file info using header

        curl -X GET http://127.0.0.1:8000/path/to/file --head

    4. get entire directory in the form of a tar

        curl -X GET http://127.0.0.1:8000/ -H "Accept: application/x-gtar"      

    5. It follows the same format as #1 and #2 to server file or directory 
       for the following methods: PUT/POST/DELETE by adding -X {method}.  With
       the exception of the POST on a directory (path ends in '/'), which is
       not allowed.
    
    6. synching up the file system from server and client
        1. start up the server
        2. start up the client
        3. go to the directory where the server serves up the file system,
           default is current working directory or if you provide the --dir,
           it will be there.
        4. go to the client directory where the client sync up the file system,
           defaults to <cwd>/source or --dir/source
        5. add a file to the server directory, you should see the newly added 
           file in the client/source directory.  Same goes
           with creating a new directory, client/source should
           have it also.  Same goes to update and delete operations on the
           server path.  

```


#### Demo
![](walkthrough.gif)
