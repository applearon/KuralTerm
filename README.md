# KuralTerm

Access a bash terminal from a server through a "bastion host."

KuralTerm utilizes websocket connections between the `host` and `frontend`, both connected to a central `backend`, or bastion.

The `backend` can be run on any server with open ports.
Run the `host` on the device that you want to access.
The `frontend` can be run on a server, locally, or you can connect to the example frontend [here](https://kural.applism.ca).

## Installation

See the README files for setup on the [backend](backend/README.md), [host](host/README.md) and [frontend](frontend/README.md) respectively.