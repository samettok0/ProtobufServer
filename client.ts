import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import {ProtoGrpcType} from './proto/random'
import readline from 'readline';


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
    // console.log('Client is ready to make requests');
    // client.PingPong({ message: 'PING!' }, (err, response) => {
    //     if (err) {
    //         console.error(`Error calling PingPong: ${err.message}`);
    //         return;
    //     }
    //     console.log('Response from server:', response);
    // });

    // const stream = client.RandomNumbers({ maxVal: 85 })
    // stream.on('data', (chunk) => {
    //     console.log('Received random number:', chunk.num);
    // });
    // stream.on('end', () => {
    //     console.log('Stream ended');
    // });

    // const stream = client.TodoList((err, result) => {
    //     if (err) {
    //         console.error(`Error receiving todo list: ${err.message}`);
    //         return;
    //     }
    //     if (result) {
    //         console.log('Received todo list:', result.todos);
    //     } else {
    //         console.error('No result received for todo list.');
    //     }
    // })
    // stream.write({ todo: 'Learn gRPC', status: 'not done' });
    // stream.write({ todo: 'Implement client', status: 'not done' });
    // stream.write({ todo: 'Touch some grass.', status: 'not done' });
    // stream.write({ todo: 'Test client', status: 'done' });
    // stream.end(); // End the stream to signal completion

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    
    const username = process.argv[2];
    if (!username) console.error('Username is required'), process.exit();
    
    const metadata = new grpc.Metadata();
    metadata.set('username', username); // Set metadata with username
    const call = client.chatApp(metadata);

    call.write({
        message: 'register',
    })
    
    call.on('data', (chunk) => {
        console.log(`${chunk.username}: ${chunk.message}`);
    })

    rl.on('line', (line) => {
        if (line === "quit") {
            call.end();
        }else {
            call.write({
                message: line,
            })
        }
    })

    
    
             
}
