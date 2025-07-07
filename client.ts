import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import {ProtoGrpcType} from './proto/random'

const PROTO_FILE = './proto/random.proto';

const PORT = 8082;

const packageDefinition = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE)); // Load the proto file synchronously
const grpcObject = (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType; // Cast to the generated type

const client = new grpcObject.randomPackage.Random(
    `0.0.0.0:${PORT}`, grpc.credentials.createInsecure()
)

const deadline = new Date();
deadline.setSeconds(deadline.getSeconds() + 5); // Set a deadline of 5 seconds
client.waitForReady(deadline, (err) => {
    if (err) {
        console.error(`Error connecting to server: ${err.message}`);
        return;
    }
    onClientReady();
})

function onClientReady() {
    console.log('Client is ready to make requests');
    client.PingPong({ message: 'PING!' }, (err, response) => {
        if (err) {
            console.error(`Error calling PingPong: ${err.message}`);
            return;
        }
        console.log('Response from server:', response);
    });
}
