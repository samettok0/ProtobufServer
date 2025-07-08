import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import {ProtoGrpcType} from './proto/random'
import {RandomHandlers} from './proto/randomPackage/Random'; // Import the generated types
import { TodoResponse } from './proto/randomPackage/TodoResponse';

const PROTO_FILE = './proto/random.proto';

const PORT = 8082;

const packageDefinition = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE)); // Load the proto file synchronously
const grpcObject = (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType; // Cast to the generated type
const randomPackage = grpcObject.randomPackage; // Access the package

function main () {
    const server = getServer();

    server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error(`Error binding server: ${err.message}`);
            return;
        }
        console.log(`Server is running on port ${port}`);
        server.start(); // Deprecated, no longer needed
    })
}

const todoList: TodoResponse = { todos: [] }; // Initialize an empty todo list
function getServer () {
    const server = new grpc.Server();
    server.addService(randomPackage.Random.service, {
        PingPong: (req, res) => {
            console.log(req.request); // Log the request
            res(null, { message: "PONG!" }); // Respond with a Pong message
        }, 
        RandomNumbers: (call) => {
            const { maxVal } = call.request; // Extract maxVal from the request
            if (typeof maxVal !== 'number' || isNaN(maxVal) || maxVal <= 0) {
                call.emit('error', new Error('maxVal is required and must be a positive number'));
                call.end();
                return;
            }
            let sent = 0;
            const interval = setInterval(() => {
                if (sent >= 10) {
                    clearInterval(interval);
                    call.end();
                    return;
                }
                call.write({ num: Math.floor(Math.random() * maxVal) });
                sent++;
            }, 1000); // send every 1 second
        },
        TodoList: (call, callback) => {
            call.on("data", (chunk) => {
                todoList.todos?.push(chunk); // Store the todo item
                console.log(`Received todo: ${chunk.todo}, status: ${chunk.status}`);
            })

            call.on("end", () => {
                console.log("Todo list stream ended");
                callback(null, { todos: todoList.todos }); // Respond with the todo list
            });
        }
  
    } as RandomHandlers); // Use the generated handlers)

    return server;
}

main();