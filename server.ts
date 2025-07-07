import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import {ProtoGrpcType} from './proto/random'
import {RandomHandlers} from './proto/randomPackage/Random'; // Import the generated types

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

function getServer () {
    const server = new grpc.Server();
    server.addService(randomPackage.Random.service, {
        "PingPong": (req, res) => {
            console.log(req, res);
        }
    } as RandomHandlers); // Use the generated handlers)

    return server;
}

main();