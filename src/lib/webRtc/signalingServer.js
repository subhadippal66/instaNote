import firebase from 'firebase/app'
import 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyDlZFoXel2J29fRLREi4SRLepl0DgrEm1k",
    authDomain: "instanote111.firebaseapp.com",
    projectId: "instanote111",
    storageBucket: "instanote111.appspot.com",
    messagingSenderId: "661667783811",
    appId: "1:661667783811:web:ee8891b47b24c9b74fa7b6"
};


// firebase.initializeApp(firebaseConfig);
// const firestore = firebase.firestore();


// const configuration = {
//     iceServers: [
//       {
//         urls: [
//           'stun:stun1.l.google.com:19302',
//           'stun:stun2.l.google.com:19302',
//         ],
//       },
//     ],
//     iceCandidatePoolSize: 10,
// };
  
// let peerConnection = null;
// let localStream = null;
// let remoteStream = null;
// let roomDialog = null;
// let roomId = null;

// async function createRoom() {
//     const db = firebase.firestore();
  
//     // console.log('Create PeerConnection with configuration: ', configuration);
//     peerConnection = new RTCPeerConnection(configuration);
  
//     registerPeerConnectionListeners();
  
//     // Add code for creating a room here
    
//     // Code for creating room above
    
//     localStream.getTracks().forEach(track => {
//       peerConnection.addTrack(track, localStream);
//     });
  
//     // Code for creating a room below
  
//     // Code for creating a room above
  
//     // Code for collecting ICE candidates below
  
//     // Code for collecting ICE candidates above
  
//     peerConnection.addEventListener('track', event => {
//       console.log('Got remote track:', event.streams[0]);
//       event.streams[0].getTracks().forEach(track => {
//         console.log('Add a track to the remoteStream:', track);
//         remoteStream.addTrack(track);
//       });
//     });
  
//     // Listening for remote session description below
  
//     // Listening for remote session description above
  
//     // Listen for remote ICE candidates below
  
//     // Listen for remote ICE candidates above
// }





// function registerPeerConnectionListeners() {
//     peerConnection.addEventListener('icegatheringstatechange', () => {
//       console.log(
//           `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
//     });
  
//     peerConnection.addEventListener('connectionstatechange', () => {
//       console.log(`Connection state change: ${peerConnection.connectionState}`);
//     });
  
//     peerConnection.addEventListener('signalingstatechange', () => {
//       console.log(`Signaling state change: ${peerConnection.signalingState}`);
//     });
  
//     peerConnection.addEventListener('iceconnectionstatechange ', () => {
//       console.log(
//           `ICE connection state change: ${peerConnection.iceConnectionState}`);
//     });
// }