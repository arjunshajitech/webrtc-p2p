const socket = io();

let localStream;
let remoteStream;
let peerConnection;

const localVideo = document.getElementById('local');
const remoteVideo = document.getElementById('remote');

const camera = document.getElementById('cam');
const audio = document.getElementById('aud');
const start = document.getElementById('start');
const end = document.getElementById('end');
end.style.display = 'none';


const init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
    });
    localVideo.srcObject = localStream;
    socket.emit('start', {})
}

async function createPeerConnection() {
    const configuration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
    peerConnection = new RTCPeerConnection(configuration);
    peerConnection.onicecandidate = (e) => {
        const message = {
            type: "candidate",
            candidate: null,
        };
        if (e.candidate) {
            message.candidate = e.candidate.candidate;
            message.sdpMid = e.candidate.sdpMid;
            message.sdpMLineIndex = e.candidate.sdpMLineIndex;
        }
        socket.emit('candidate', message)
    };
    peerConnection.ontrack = (e) => (remoteVideo.srcObject = e.streams[0]);
    localStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, localStream));
}

socket.on("start", async () => {
    if (localStream && !peerConnection) {
        console.log("starting..................");
        await createPeerConnection();

        const offer = await peerConnection.createOffer();
        socket.emit('offer', offer)
        await peerConnection.setLocalDescription(offer);
    }
})

socket.on("offer", async (offer) => {
    console.log('offer..................');
    if (!peerConnection) {
        await createPeerConnection();
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        socket.emit('answer', answer)
        await peerConnection.setLocalDescription(answer);
    }
})

socket.on("answer", async (answer) => {
    console.log('answer...........................');
    if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
    }
})

socket.on("candidate", async (candidate) => {
    if (!peerConnection) {
        return;
    }
    if (!candidate.candidate) {
        await peerConnection.addIceCandidate(null);
    } else {
        await peerConnection.addIceCandidate(candidate);
    }
})


camera.onclick = () => {
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack.enabled) {
        videoTrack.enabled = false;
        camera.innerHTML = "CAMERA ON"
    } else {
        videoTrack.enabled = true;
        camera.innerHTML = "CAMERA OFF"
    }
}

audio.onclick = () => {
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack.enabled) {
        audioTrack.enabled = false;
        audio.innerHTML = "AUDIO ON"
    } else {
        audioTrack.enabled = true;
        audio.innerHTML = "AUDIO OFF"
    }
}

start.onclick = () => {
    init();
    start.style.display = 'none';
    end.style.display = 'block';
}

end.onclick = () => {
    end.style.display = 'none';
    start.style.display = 'block';
    if (localVideo) {
        localVideo.srcObject
            .getTracks()
            .forEach((track) => track.stop());
    }

    if (remoteVideo) {
        remoteVideo.srcObject.getTracks()
            .forEach((track) => track.stop());
    }

    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
}


let isDragging = false;
let offsetX, offsetY;
let container = document.getElementById('videoContainer');

container.addEventListener('mousedown', startDragging);
container.addEventListener('mouseup', stopDragging);
container.addEventListener('mousemove', drag);

function startDragging(event) {
    isDragging = true;
    offsetX = event.clientX - container.getBoundingClientRect().left;
    offsetY = event.clientY - container.getBoundingClientRect().top;
}

function stopDragging() {
    isDragging = false;
}

function drag(event) {
    if (isDragging) {
        let x = event.clientX - offsetX;
        let y = event.clientY - offsetY;

        container.style.left = x + 'px';
        container.style.top = y + 'px';
    }
}