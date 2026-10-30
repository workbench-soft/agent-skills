#!/usr/bin/env python3
"""Turn the mermaid diagram on stdin into a mermaid.live link that opens it.

The diagram goes in the URL fragment, so the browser doesn't send it anywhere.
"""
import base64
import json
import sys
import zlib


def mermaid_live_url(diagram: str) -> str:
    state = json.dumps({"code": diagram.strip(), "mermaid": '{"theme":"default"}'})
    packed = base64.urlsafe_b64encode(zlib.compress(state.encode(), 9))
    return "https://mermaid.live/view#pako:" + packed.decode().rstrip("=")


if __name__ == "__main__":
    print(mermaid_live_url(sys.stdin.read()))
