
let localStream = null;
let remoteStream = null;
let peerConnection1 = null;
let peerConnection2 = null;

const localVideo1 = document.getElementById('localVideo1');
const remoteVideo1 = document.getElementById('remoteVideo1')
const localVideo2 = document.getElementById('localVideo2');
const remoteVideo2 = document.getElementById('remoteVideo2')

const localStartButton = document.getElementById('localStart');
const localEndButton = document.getElementById('localEnd');
localEndButton.disabled = true;

const remoteStartButton = document.getElementById('remoteStart');
const remoteEndButton = document.getElementById('remoteEnd');
remoteEndButton.disabled = true;


localStartButton.onclick = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    localVideo1.srcObject = localStream
    localStartButton.disabled = true;
    localEndButton.disabled = false;

    if (remoteStream) {
        console.log("remote stream exist....");
    }
}

localEndButton.onclick = async () => {
    await localStream.getTracks().forEach(track => track.stop());
    localStream = null;
    localStartButton.disabled = false;
    localEndButton.disabled = true;
}

remoteStartButton.onclick = async () => {
    remoteStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    remoteVideo1.srcObject = remoteStream
    remoteStartButton.disabled = true;
    remoteEndButton.disabled = false;

    if (localStream) {
        handlePeer1();
    }
}

remoteEndButton.onclick = async () => {
    await remoteStream.getTracks().forEach(track => track.stop());
    remoteStream = null;
    remoteStartButton.disabled = false;
    remoteEndButton.disabled = true;
}


function createPeerConnection1() {
    peerConnection1 = new RTCPeerConnection();
    peerConnection1.onicecandidate = e => {
        const message = {
            candidate: null,
        };
        if (e.candidate) {
            message.candidate = e.candidate.candidate;
            message.sdpMid = e.candidate.sdpMid;
            message.sdpMLineIndex = e.candidate.sdpMLineIndex;
        }
        handleCandidate2(message);
    };
    peerConnection1.ontrack = e => remoteVideo2.srcObject = e.streams[0];
    localStream.getTracks().forEach(track => peerConnection1.addTrack(track, localStream));
}

function createPeerConnection2() {
    peerConnection2 = new RTCPeerConnection();
    peerConnection2.onicecandidate = e => {
        const message = {
            candidate: null,
        };
        if (e.candidate) {
            message.candidate = e.candidate.candidate;
            message.sdpMid = e.candidate.sdpMid;
            message.sdpMLineIndex = e.candidate.sdpMLineIndex;
        }
        handleCandidate1(message);
    };
    peerConnection2.ontrack = e => localVideo2.srcObject = e.streams[0];
    remoteStream.getTracks().forEach(track => peerConnection2.addTrack(track, remoteStream));
}


async function handlePeer1() {
    await createPeerConnection1();
    const offer = await peerConnection1.createOffer();
    handlePeer2(offer)
    await peerConnection1.setLocalDescription(offer);
}

async function handlePeer2(offer) {
    await createPeerConnection2();
    await peerConnection2.setRemoteDescription(offer);
    const answer = await peerConnection2.createAnswer();
    handleAnswer(answer)
    await peerConnection2.setLocalDescription(answer);
}

async function handleAnswer(answer) {
    await peerConnection1.setRemoteDescription(answer);
}

async function handleCandidate2(data) {
    if (data != null) {
        if (!peerConnection2) {
            return;
        }
        if (!data.candidate) {
            await peerConnection2.addIceCandidate(null);
        } else {
            await peerConnection2.addIceCandidate(data);
        }
    }
}

async function handleCandidate1(data) {
    if (data != null) {
        if (!peerConnection1) {
            return;
        }
        if (!data.candidate) {
            await peerConnection1.addIceCandidate(null);
        } else {
            await peerConnection1.addIceCandidate(data);
        }
    }
}