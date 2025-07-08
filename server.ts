import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import {ProtoGrpcType} from './proto/random'
import {RandomHandlers} from './proto/randomPackage/Random'; // Import the generated types
import { TodoResponse } from './proto/randomPackage/TodoResponse';
import { TodoRequest } from './proto/randomPackage/TodoRequest';
import { ChatRequest } from './proto/randomPackage/ChatRequest';
import { ChatResponse } from './proto/randomPackage/ChatResponse';

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
const callObjByUsername = new Map<string, grpc.ServerDuplexStream<ChatRequest, ChatResponse>>(); // Store call objects by username

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
            call.on("data", (chunk: TodoRequest) => {
                todoList.todos?.push(chunk); // Store the todo item
                console.log(`Received todo: ${chunk.todo}, status: ${chunk.status}`);
            })

            call.on("end", () => {
                console.log("Todo list stream ended");
                callback(null, { todos: todoList.todos }); // Respond with the todo list
            });
        },

        ChatApp: (call) => {
            call.on('data', (req) => {
                const username = call.metadata.get('username')[0] as string; // Get the username from metadata
                const msg = req.message; // Get the message from the request
                console.log(username, req.message);

                console.log(`${username}: ${msg}`);
                for (let [user, userCall] of callObjByUsername) {
                    if (user !== username) {
                        userCall.write({ 
                            username: username,
                            message: msg
                        }); // Broadcast the message to other users
                    }
                }
                
                if(callObjByUsername.get(username) === undefined) {
                    callObjByUsername.set(username, call); // Store the call object for the user
                }
            })

            call.on('end', () => {
                const username = call.metadata.get('username')[0] as string; // Get the username from metadata
                callObjByUsername.delete(username); // Remove the user from the call object map
                for (let [user, userCall] of callObjByUsername) {
                    userCall.write({ 
                        username: username,
                        message: "Has left the chat."
                    }); // Broadcast the message to other users
                }
                console.log(`${username} has left the chat.`);
                call.write({
                    username: 'Server',
                    message: `${username} has left the chat.`
                }); // Notify other users that the user has left the chat
                call.end(); // End the call

            });
        }

  
    } as RandomHandlers); // Use the generated handlers)

    return server;
}

main();