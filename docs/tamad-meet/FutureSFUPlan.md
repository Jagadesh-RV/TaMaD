# Future SFU Transition Plan

Currently, TaMaD Meet utilizes a Peer-to-Peer (P2P) Mesh architecture.
To support large enterprise meetings (50+ participants), we must migrate to a Selective Forwarding Unit (SFU) architecture.

## Roadmap
1. **Provision SFU Server**: Deploy mediasoup or Janus on dedicated media instances.
2. **Abstract Signaling**: Replace P2P `createOffer` logic in `useWebRTC.ts` with SFU `Transport` instantiation.
3. **Backend Integration**: Modify `meetingSocketGateway.ts` to forward signaling to the SFU worker node instead of directly broadcasting to peers.
4. **UI**: Zero changes required. The `useWebRTC.ts` hook's external signature (`localStream`, `remoteStreams`) will remain perfectly identical.
