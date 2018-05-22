'use strict';

// Connection string for the IoT Hub service
//
// NOTE:
// For simplicity, this sample sets the connection string in code.
// In a production environment, the recommended approach is to use
// an environment variable to make it available to your application.
// https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-security
//
// az iot hub show --query properties.eventHubEndpoints.events.endpoint --name {your IoT Hub name}
const eventHubsCompatibleEndpoint = '{Your Event Hubs-compatible endpoint}';

// az iot hub show --query properties.eventHubEndpoints.events.path --name {your IoT Hub name}
const eventHubsCompatibleName  = '{Your Event Hubs-compatible name}';

// az iot hub policy show --name iothubowner --query primaryKey --hub-name {your IoT Hub name}
const primaryKey = '{your iothubowner primary key}'

const eventHubsCompatibleConnectionString = `Endpoint=${eventHubsCompatibleEndpoint};SharedAccessKeyName=iothubowner;SharedAccessKey=${primaryKey}`;


// Using the Node.js SDK for Azure Event hubs:
//   https://github.com/Azure/azure-event-hubs-node
// The sample connects to an IoT hub's Event Hubs-compatible endpoint
// to read messages sent from a device.
const { EventHubClient, EventPosition } = require('azure-event-hubs');

// Display the message content - telemetry and properties.
// - Telemetry is sent in the message body
// - The device can add arbitrary application properties to the message
// - IoT Hub adds system properties, such as Device Id, to the message.
const onMessage = (message) => {
  console.log('Telemetry received: ');
  console.log(JSON.stringify(message.body));
  console.log('Application properties (set by device): ')
  console.log(JSON.stringify(message.applicationProperties));
  console.log('System properties (set by IoT Hub): ')
  console.log(JSON.stringify(message.annotations));
  console.log('');
};

const client = EventHubClient.createFromConnectionString(eventHubsCompatibleConnectionString, eventHubsCompatibleName);

// Connect to the partitions on the IoT Hub's Event Hubs-compatible endpoint.
// This example only reads messages sent after this application started.
async function main() {
  const onError = (err) => {
    console.log("An error occurred on the receiver ", err);
  };

  client.getPartitionIds().then(partitionIds => {
    partitionIds.map(async (partitionId) => {
      console.log('Created partition receiver: ' + partitionId);
      const receiveHandler = client.receive(partitionId, onMessage, onError, { eventPosition: EventPosition.fromEnqueuedTime(Date.now()) });

      // To stop receiving events later on...
      await receiveHandler.stop();
    })
  });
}

main().catch((err) => {
  console.log(err);
});